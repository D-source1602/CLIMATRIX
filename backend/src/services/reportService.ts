/**
 * Report generation service — produces PDFs from emission + AQI data and
 * writes them under `backend/files/reports/<id>.pdf`. The DB row in `reports`
 * is the source of truth; the file is the artifact.
 *
 * Tier-1 design notes:
 * - Uses `pdfkit` (~2 MB, no Chromium). Built-in Helvetica is enough for an
 *   internal compliance report; brand fonts can be loaded later.
 * - AQI section is gated behind a runtime check on prisma.airQualityReading
 *   so this PR is independent of PR #7 (realtime AQI). When PR #7 is merged,
 *   reports auto-include an AQI summary; otherwise the section is skipped.
 * - All numeric values from Prisma `Decimal` columns are coerced via Number()
 *   to avoid Decimal.js stringification leaking into the PDF.
 */
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import PDFDocument from 'pdfkit';
import {
  Prisma,
  ReportFormat,
  ReportType,
  type Report as ReportRow,
} from '@prisma/client';
import { prisma } from '../prisma/client';
import { logger } from '../utils/logger';

export const REPORTS_DIR = path.resolve(process.cwd(), 'files', 'reports');
fs.mkdirSync(REPORTS_DIR, { recursive: true });

// Brand palette (matches the sketch-on-paper frontend aesthetic).
const C = {
  ink: '#1a1410',
  ink2: '#2e2618',
  ink3: '#3d3020',
  muted: '#6b6357',
  paper: '#f0ebe0',
  paper2: '#e8e2d4',
  red: '#c0392b',
  amber: '#b8860b',
  green: '#1e8449',
};

export interface GenerateOpts {
  type: ReportType;
  periodStart?: Date;
  periodEnd?: Date;
  industryId?: string | null;
  generatedById?: string | null;
}

export async function generateReport(opts: GenerateOpts): Promise<ReportRow> {
  const periodStart = opts.periodStart ?? startOfMonth(new Date());
  const periodEnd = opts.periodEnd ?? new Date();

  // Industry context (if scoped).
  const industry = opts.industryId
    ? await prisma.industry.findUnique({ where: { id: opts.industryId } })
    : null;

  // Emission logs in window.
  const emissions = await prisma.emissionLog.findMany({
    where: {
      ...(opts.industryId && { industryId: opts.industryId }),
      recordedAt: { gte: periodStart, lte: periodEnd },
    },
    include: { industry: true },
    orderBy: { recordedAt: 'desc' },
    take: 200,
  });

  // AQI is optional (only present once PR #7 is merged).
  const aqi = await safeLatestAqi(periodStart, periodEnd);

  const id = randomUUID();
  const filename = `${id}.pdf`;
  const filepath = path.join(REPORTS_DIR, filename);
  const storageKey = `reports/${filename}`;
  const title = titleFor(opts.type, periodStart, periodEnd, industry?.name);

  const pageCount = await renderPdf({
    filepath,
    title,
    type: opts.type,
    periodStart,
    periodEnd,
    industry,
    emissions,
    aqi,
  });

  const stats = fs.statSync(filepath);
  const report = await prisma.report.create({
    data: {
      type: opts.type,
      format: ReportFormat.PDF,
      title,
      periodStart,
      periodEnd,
      storageKey,
      sizeBytes: stats.size,
      pageCount,
      generatedById: opts.generatedById ?? null,
      industryId: opts.industryId ?? null,
    },
  });

  logger.info(
    { reportId: report.id, sizeBytes: stats.size, pages: pageCount },
    'PDF report generated',
  );
  return report;
}

// -----------------------------------------------------------------------------
// PDF layout
// -----------------------------------------------------------------------------

interface RenderArgs {
  filepath: string;
  title: string;
  type: ReportType;
  periodStart: Date;
  periodEnd: Date;
  industry: Awaited<ReturnType<typeof prisma.industry.findUnique>> | null;
  emissions: Array<
    Prisma.EmissionLogGetPayload<{ include: { industry: true } }>
  >;
  aqi: Array<{
    city: string;
    parameter: string;
    value: number;
    unit: string;
    recordedAt: Date;
  }>;
}

async function renderPdf(args: RenderArgs): Promise<number> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 56, bottom: 64, left: 50, right: 50 },
      info: {
        Title: args.title,
        Author: 'ClimaCore',
        Subject: 'Emission compliance report',
        Producer: 'ClimaCore API',
      },
    });

    let pageCount = 1;
    doc.on('pageAdded', () => {
      pageCount++;
    });

    const stream = fs.createWriteStream(args.filepath);
    doc.pipe(stream);

    drawHeader(doc, args);
    drawSummary(doc, args);
    drawEmissionsTable(doc, args);
    drawAqiSection(doc, args);
    drawFooter(doc);

    doc.end();

    stream.on('finish', () => resolve(pageCount));
    stream.on('error', reject);
  });
}

function drawHeader(doc: PDFKit.PDFDocument, args: RenderArgs) {
  // Brand bar
  doc
    .save()
    .rect(0, 0, doc.page.width, 8)
    .fillColor(C.ink3)
    .fill()
    .restore();

  doc.moveDown(0.5);
  doc
    .font('Helvetica-Bold')
    .fontSize(22)
    .fillColor(C.ink)
    .text('CLIMACORE', { continued: false });
  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor(C.muted)
    .text('AI-POWERED EMISSION INTELLIGENCE');

  // Dashed separator
  doc.moveDown(0.3);
  const sepY = doc.y + 2;
  doc
    .save()
    .strokeColor(C.ink3)
    .lineWidth(1.2)
    .dash(3, { space: 3 })
    .moveTo(50, sepY)
    .lineTo(doc.page.width - 50, sepY)
    .stroke()
    .undash()
    .restore();
  doc.y = sepY + 8;

  // Title block
  doc.font('Helvetica-Bold').fontSize(16).fillColor(C.ink).text(args.title);
  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor(C.muted)
    .text(
      `Period:  ${fmtDate(args.periodStart)}  →  ${fmtDate(args.periodEnd)}`,
    )
    .text(`Generated:  ${fmtDate(new Date())}`)
    .text(`Report type:  ${humanType(args.type)}`);

  if (args.industry) {
    doc.text(
      `Industry:  ${args.industry.name}  (${args.industry.sector}, ${args.industry.city})`,
    );
  } else {
    doc.text('Scope:  All industries');
  }
  doc.moveDown(0.6);
}

function drawSummary(doc: PDFKit.PDFDocument, args: RenderArgs) {
  sectionTitle(doc, 'SUMMARY');

  const totalCo2 = sum(args.emissions.map((e) => num(e.co2Kg)));
  const totalNox = sum(args.emissions.map((e) => num(e.noxKg)));
  const totalSox = sum(args.emissions.map((e) => num(e.soxKg)));
  const violations = args.emissions.filter(
    (e) => e.overallStatus === 'VIOLATION',
  ).length;
  const warnings = args.emissions.filter(
    (e) => e.overallStatus === 'WARNING',
  ).length;
  const compliant = args.emissions.filter(
    (e) => e.overallStatus === 'COMPLIANT',
  ).length;

  const cells: Array<[string, string, string?]> = [
    ['Emission records', `${args.emissions.length}`],
    ['AQI readings', `${args.aqi.length}`],
    ['Total CO₂', `${fmt(totalCo2)} kg`],
    ['Total NOₓ', `${fmt(totalNox)} kg`],
    ['Total SOₓ', `${fmt(totalSox)} kg`],
    ['Compliant', `${compliant}`, C.green],
    ['Warning', `${warnings}`, C.amber],
    ['Violation', `${violations}`, C.red],
  ];

  drawKpiGrid(doc, cells);
  doc.moveDown(0.6);
}

function drawEmissionsTable(doc: PDFKit.PDFDocument, args: RenderArgs) {
  sectionTitle(doc, 'EMISSION RECORDS');

  if (args.emissions.length === 0) {
    doc
      .font('Helvetica-Oblique')
      .fontSize(10)
      .fillColor(C.muted)
      .text('No emission records were submitted in this period.', {
        align: 'center',
      });
    doc.moveDown(0.6);
    return;
  }

  const rows: string[][] = [
    ['Recorded', 'Industry', 'CO₂ (kg)', 'NOₓ (kg)', 'SOₓ (kg)', 'Status'],
  ];
  for (const e of args.emissions.slice(0, 30)) {
    rows.push([
      fmtDate(e.recordedAt),
      e.industry?.name ?? '—',
      fmt(num(e.co2Kg)),
      fmt(num(e.noxKg)),
      fmt(num(e.soxKg)),
      e.overallStatus,
    ]);
  }
  drawTable(doc, rows, [90, 130, 70, 70, 70, 65]);

  if (args.emissions.length > 30) {
    doc.moveDown(0.3);
    doc
      .font('Helvetica-Oblique')
      .fontSize(8)
      .fillColor(C.muted)
      .text(`... and ${args.emissions.length - 30} more records.`);
  }
  doc.moveDown(0.6);
}

function drawAqiSection(doc: PDFKit.PDFDocument, args: RenderArgs) {
  if (args.aqi.length === 0) return; // section skipped if no AQI ingested

  sectionTitle(doc, 'AIR QUALITY (LATEST PER CITY)');

  // Collapse to one row per (city, parameter) keeping latest value.
  const byCity = new Map<
    string,
    Record<string, { value: number; unit: string }>
  >();
  for (const r of args.aqi) {
    let entry = byCity.get(r.city);
    if (!entry) {
      entry = {};
      byCity.set(r.city, entry);
    }
    if (!entry[r.parameter]) entry[r.parameter] = { value: r.value, unit: r.unit };
  }

  const rows: string[][] = [['City', 'PM2.5', 'PM10', 'NO₂', 'SO₂', 'CO']];
  for (const [city, params] of Array.from(byCity.entries()).slice(0, 20)) {
    rows.push([
      city,
      params.pm25 ? `${fmt(params.pm25.value)} ${params.pm25.unit}` : '—',
      params.pm10 ? `${fmt(params.pm10.value)} ${params.pm10.unit}` : '—',
      params.no2 ? `${fmt(params.no2.value)} ${params.no2.unit}` : '—',
      params.so2 ? `${fmt(params.so2.value)} ${params.so2.unit}` : '—',
      params.co ? `${fmt(params.co.value)} ${params.co.unit}` : '—',
    ]);
  }
  drawTable(doc, rows, [120, 75, 75, 75, 75, 75]);
  doc.moveDown(0.6);
}

function drawFooter(doc: PDFKit.PDFDocument) {
  // Reserve room and draw the strapline at the bottom of the current page.
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(range.start + i);
    doc
      .font('Helvetica-Oblique')
      .fontSize(7.5)
      .fillColor(C.muted)
      .text(
        'CLIMACORE  ·  AI-Powered Carbon Footprint & Compliance Monitoring  ·  Auto-generated report',
        50,
        doc.page.height - 40,
        {
          align: 'center',
          width: doc.page.width - 100,
        },
      );
  }
}

// -----------------------------------------------------------------------------
// Drawing primitives
// -----------------------------------------------------------------------------

function sectionTitle(doc: PDFKit.PDFDocument, label: string) {
  doc
    .font('Helvetica-Bold')
    .fontSize(11)
    .fillColor(C.ink)
    .text(label, { characterSpacing: 1.5 });

  // Hatched accent under the title
  const y = doc.y + 1;
  doc
    .save()
    .strokeColor(C.ink3)
    .lineWidth(1)
    .dash(4, { space: 4 })
    .moveTo(50, y)
    .lineTo(doc.page.width - 50, y)
    .stroke()
    .undash()
    .restore();
  doc.y = y + 6;
}

function drawKpiGrid(
  doc: PDFKit.PDFDocument,
  cells: Array<[string, string, string?]>,
) {
  const cols = 4;
  const cellW = (doc.page.width - 100) / cols;
  const cellH = 38;
  const startX = 50;
  let row = 0;
  cells.forEach((cell, idx) => {
    const col = idx % cols;
    if (col === 0 && idx > 0) row++;
    const x = startX + col * cellW;
    const y = doc.y + row * cellH;
    doc
      .save()
      .rect(x + 2, y, cellW - 4, cellH - 4)
      .fillAndStroke(C.paper2, C.ink3)
      .restore();
    doc
      .font('Helvetica')
      .fontSize(7.5)
      .fillColor(C.muted)
      .text(cell[0].toUpperCase(), x + 8, y + 6, { width: cellW - 16 });
    doc
      .font('Helvetica-Bold')
      .fontSize(15)
      .fillColor(cell[2] ?? C.ink)
      .text(cell[1], x + 8, y + 16, { width: cellW - 16 });
  });
  doc.y = doc.y + Math.ceil(cells.length / cols) * cellH;
}

function drawTable(
  doc: PDFKit.PDFDocument,
  rows: string[][],
  widths: number[],
) {
  if (rows.length === 0) return;
  const startX = 50;
  const rowH = 18;
  const padX = 5;
  const totalW = widths.reduce((a, b) => a + b, 0);

  const ensurePageRoom = () => {
    if (doc.y + rowH > doc.page.height - 80) doc.addPage();
  };

  // Header row
  ensurePageRoom();
  let y = doc.y;
  doc.save().rect(startX, y, totalW, rowH).fillColor(C.ink3).fill().restore();
  doc.font('Helvetica-Bold').fontSize(9).fillColor(C.paper);
  let x = startX;
  rows[0].forEach((cell, i) => {
    doc.text(cell, x + padX, y + 5, {
      width: widths[i] - padX * 2,
      ellipsis: true,
      lineBreak: false,
    });
    x += widths[i];
  });
  doc.y = y + rowH;

  // Data rows
  for (let r = 1; r < rows.length; r++) {
    ensurePageRoom();
    y = doc.y;
    if (r % 2 === 0) {
      doc
        .save()
        .rect(startX, y, totalW, rowH)
        .fillColor(C.paper2)
        .fillOpacity(0.5)
        .fill()
        .fillOpacity(1)
        .restore();
    }
    doc.font('Helvetica').fontSize(9).fillColor(C.ink);
    x = startX;
    rows[r].forEach((cell, i) => {
      // Color-code status column if it's the last one and matches
      let color: string = C.ink;
      const cellLower = cell.toUpperCase();
      if (cellLower === 'VIOLATION') color = C.red;
      else if (cellLower === 'WARNING') color = C.amber;
      else if (cellLower === 'COMPLIANT') color = C.green;
      doc
        .fillColor(color)
        .text(cell, x + padX, y + 5, {
          width: widths[i] - padX * 2,
          ellipsis: true,
          lineBreak: false,
        });
      x += widths[i];
    });
    doc.fillColor(C.ink);
    doc.y = y + rowH;
  }

  // Border around the table
  doc
    .save()
    .strokeColor(C.ink3)
    .lineWidth(0.8)
    .rect(startX, doc.y - rows.length * rowH, totalW, rows.length * rowH)
    .stroke()
    .restore();
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function num(d: Prisma.Decimal | number | null | undefined): number {
  if (d === null || d === undefined) return 0;
  if (typeof d === 'number') return d;
  return Number(d.toString());
}

function sum(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0);
}

function fmt(n: number): string {
  if (!Number.isFinite(n)) return '—';
  if (Math.abs(n) >= 1000) return n.toFixed(0);
  if (Math.abs(n) >= 1) return n.toFixed(2);
  return n.toFixed(3);
}

function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 16).replace('T', ' ');
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function humanType(t: ReportType): string {
  switch (t) {
    case 'EMISSIONS_MONTHLY':
      return 'Monthly Emissions';
    case 'EMISSIONS_QUARTERLY':
      return 'Quarterly Emissions';
    case 'COMPLIANCE_QUARTERLY':
      return 'Quarterly Compliance';
    case 'ANNUAL_REPORT':
      return 'Annual Report';
    case 'FACILITY_AUDIT':
      return 'Facility Audit';
    case 'AI_INSIGHTS':
      return 'AI Insights';
    default:
      return 'Custom';
  }
}

function titleFor(
  t: ReportType,
  start: Date,
  end: Date,
  industryName?: string | null,
): string {
  const monthYear = `${monthName(start)} ${start.getFullYear()}`;
  const base = (() => {
    switch (t) {
      case 'EMISSIONS_MONTHLY':
        return `Monthly Emissions — ${monthYear}`;
      case 'EMISSIONS_QUARTERLY':
        return `Quarterly Emissions — ${monthYear}`;
      case 'COMPLIANCE_QUARTERLY':
        return `Quarterly Compliance — ${monthYear}`;
      case 'ANNUAL_REPORT':
        return `Annual Report — ${start.getFullYear()}`;
      case 'FACILITY_AUDIT':
        return `Facility Audit — ${monthYear}`;
      case 'AI_INSIGHTS':
        return `AI Insights — ${monthYear}`;
      default:
        return `Report — ${monthYear}`;
    }
  })();
  return industryName ? `${base}  ·  ${industryName}` : base;
}

function monthName(d: Date): string {
  return [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ][d.getMonth()]!;
}

// -----------------------------------------------------------------------------
// Cross-PR compatibility: AQI fetch is a no-op if the model doesn't exist yet.
// (PR #7 introduces `airQualityReading`. This PR is independent of that one.)
// -----------------------------------------------------------------------------

async function safeLatestAqi(
  start: Date,
  end: Date,
): Promise<
  Array<{
    city: string;
    parameter: string;
    value: number;
    unit: string;
    recordedAt: Date;
  }>
> {
  const p = prisma as unknown as Record<string, { findMany?: Function }>;
  if (!p.airQualityReading || typeof p.airQualityReading.findMany !== 'function') {
    return [];
  }
  try {
    const rows = (await p.airQualityReading.findMany({
      where: { recordedAt: { gte: start, lte: end } },
      orderBy: { recordedAt: 'desc' },
      take: 500,
    })) as Array<{
      city: string;
      parameter: string;
      value: number;
      unit: string;
      recordedAt: Date;
    }>;
    return rows;
  } catch (err) {
    logger.warn({ err }, 'AQI fetch for report failed (non-fatal)');
    return [];
  }
}
