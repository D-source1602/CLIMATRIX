import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { ReportType } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { prisma } from '../prisma/client';
import { generateReport, REPORTS_DIR } from '../services/reportService';

const generateSchema = z.object({
  type: z.nativeEnum(ReportType).default(ReportType.EMISSIONS_MONTHLY),
  periodStart: z.string().datetime().optional(),
  periodEnd: z.string().datetime().optional(),
  industryId: z.string().min(1).optional(),
});

/** POST /api/v1/reports/generate — create a new PDF report */
export const generate = asyncHandler(async (req, res) => {
  const input = generateSchema.parse(req.body);

  // INDUSTRY users can only generate for their own industry — silently force it.
  let industryId = input.industryId;
  if (req.user?.role === 'INDUSTRY') {
    industryId = req.user.industryId ?? undefined;
  }

  const report = await generateReport({
    type: input.type,
    periodStart: input.periodStart ? new Date(input.periodStart) : undefined,
    periodEnd: input.periodEnd ? new Date(input.periodEnd) : undefined,
    industryId: industryId ?? null,
    generatedById: req.user?.id ?? null,
  });

  res.status(201).json(toPublic(report));
});

/** GET /api/v1/reports — list recent reports (scoped per role) */
export const list = asyncHandler(async (req, res) => {
  const where =
    req.user?.role === 'INDUSTRY' && req.user.industryId
      ? { industryId: req.user.industryId }
      : {};

  const reports = await prisma.report.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      generatedBy: { select: { fullName: true, email: true } },
      industry: { select: { name: true, sector: true } },
    },
  });

  res.json({
    count: reports.length,
    reports: reports.map((r) => ({
      ...toPublic(r),
      generatedByName: r.generatedBy?.fullName ?? null,
      industryName: r.industry?.name ?? null,
    })),
  });
});

/** GET /api/v1/reports/:id/download — stream the PDF (auth + ownership) */
export const download = asyncHandler(async (req, res) => {
  const { id } = req.params as { id: string };
  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) throw ApiError.notFound('Report not found');

  if (
    req.user?.role === 'INDUSTRY' &&
    report.industryId &&
    report.industryId !== req.user.industryId
  ) {
    throw ApiError.forbidden('Cannot access reports from other industries');
  }

  const filepath = path.join(REPORTS_DIR, path.basename(report.storageKey));
  if (!fs.existsSync(filepath)) {
    throw ApiError.notFound('Report file is missing on disk');
  }

  const safeName =
    report.title.replace(/[^\w\-. ]+/g, '_').slice(0, 80) + '.pdf';

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Length', String(report.sizeBytes));
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${safeName}"`,
  );

  const stream = fs.createReadStream(filepath);
  stream.on('error', () => {
    if (!res.headersSent) {
      res.status(500).json({
        error: { code: 'STREAM_ERROR', message: 'Failed to stream report' },
      });
    } else {
      res.end();
    }
  });
  stream.pipe(res);
});

/** DELETE /api/v1/reports/:id — remove DB row + best-effort file cleanup */
export const remove = asyncHandler(async (req, res) => {
  const { id } = req.params as { id: string };
  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) throw ApiError.notFound('Report not found');

  if (
    req.user?.role === 'INDUSTRY' &&
    report.industryId &&
    report.industryId !== req.user.industryId
  ) {
    throw ApiError.forbidden('Cannot delete reports from other industries');
  }

  await prisma.report.delete({ where: { id } });

  // Best-effort file cleanup. Failure here doesn't bubble up — the row is gone.
  fs.promises
    .unlink(path.join(REPORTS_DIR, path.basename(report.storageKey)))
    .catch(() => {});

  res.status(204).send();
});

// -----------------------------------------------------------------------------

function toPublic(r: {
  id: string;
  type: ReportType;
  format: string;
  title: string;
  periodStart: Date | null;
  periodEnd: Date | null;
  sizeBytes: number;
  pageCount: number | null;
  industryId: string | null;
  generatedById: string | null;
  createdAt: Date;
}) {
  return {
    id: r.id,
    type: r.type,
    format: r.format,
    title: r.title,
    periodStart: r.periodStart,
    periodEnd: r.periodEnd,
    sizeBytes: r.sizeBytes,
    pageCount: r.pageCount,
    industryId: r.industryId,
    generatedById: r.generatedById,
    generatedAt: r.createdAt,
    downloadUrl: `/api/v1/reports/${r.id}/download`,
  };
}
