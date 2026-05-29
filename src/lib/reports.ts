import { api, tokens } from './api';

export type ReportType =
  | 'EMISSIONS_MONTHLY'
  | 'EMISSIONS_QUARTERLY'
  | 'COMPLIANCE_QUARTERLY'
  | 'ANNUAL_REPORT'
  | 'FACILITY_AUDIT'
  | 'AI_INSIGHTS'
  | 'CUSTOM';

export interface ReportSummary {
  id: string;
  type: ReportType;
  format: 'PDF' | 'CSV';
  title: string;
  periodStart: string | null;
  periodEnd: string | null;
  sizeBytes: number;
  pageCount: number | null;
  industryId: string | null;
  generatedById: string | null;
  generatedAt: string;
  generatedByName?: string | null;
  industryName?: string | null;
  downloadUrl: string;
}

export interface ListResponse {
  count: number;
  reports: ReportSummary[];
}

export interface GenerateInput {
  type: ReportType;
  periodStart?: string;
  periodEnd?: string;
  industryId?: string;
}

export async function listReports(): Promise<ListResponse> {
  return api<ListResponse>('/reports', { auth: true });
}

export async function generateReport(
  input: GenerateInput,
): Promise<ReportSummary> {
  return api<ReportSummary>('/reports/generate', {
    method: 'POST',
    body: input,
    auth: true,
  });
}

export async function deleteReport(id: string): Promise<void> {
  await api(`/reports/${id}`, { method: 'DELETE', auth: true });
}

/**
 * Downloads a PDF via authenticated fetch + Blob trigger.
 * Browsers won't send the Authorization header on a plain `<a href>`, so we
 * have to fetch the bytes ourselves and synthesize a download click.
 */
export async function downloadReport(
  id: string,
  filename = 'report.pdf',
): Promise<void> {
  const base =
    ((import.meta as unknown as { env?: { VITE_API_URL?: string } }).env
      ?.VITE_API_URL ?? 'http://localhost:4000') + '/api/v1';

  const res = await fetch(`${base}/reports/${id}/download`, {
    headers: tokens.getAccess()
      ? { Authorization: `Bearer ${tokens.getAccess()}` }
      : {},
  });

  if (!res.ok) {
    let message = `Download failed (${res.status})`;
    try {
      const j = await res.json();
      message = j?.error?.message ?? message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Give the browser a tick before revoking, otherwise some browsers cancel.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Map the existing UI's report-type strings to backend enum values. */
export function uiTypeToBackend(uiLabel: string): ReportType {
  switch (uiLabel) {
    case 'Monthly Emissions':
      return 'EMISSIONS_MONTHLY';
    case 'Quarterly Compliance':
      return 'COMPLIANCE_QUARTERLY';
    case 'Annual Report':
      return 'ANNUAL_REPORT';
    case 'Facility Audit':
      return 'FACILITY_AUDIT';
    case 'AI Insights':
      return 'AI_INSIGHTS';
    default:
      return 'CUSTOM';
  }
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}
