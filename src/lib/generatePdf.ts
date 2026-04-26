/* ========================================
   PDF Report Generator
   ========================================
   Generates a professional PDF report from
   a survey submission using html2pdf.js
   ======================================== */

import html2pdf from 'html2pdf.js';
import { surveySections } from '../data/surveyData';
import type { SubmissionRow } from './adminService';
import type { Question, SurveySection } from '../types/survey';

function resolveLabel(q: Question, val: string | string[] | boolean | undefined): string {
  if (val === undefined || val === '') return '—';
  if ((q.type === 'radio' || q.type === 'select') && q.options) {
    return q.options.find((o) => o.value === val)?.label || String(val);
  }
  if (q.type === 'checkbox' && Array.isArray(val) && q.options) {
    return val.map((v) => q.options!.find((o) => o.value === v)?.label || v).join(', ');
  }
  return String(val);
}

/** Gather documents needed based on answers */
function gatherDocuments(submission: SubmissionRow): string[] {
  const docs: string[] = [];
  surveySections.forEach((section) => {
    section.questions.forEach((q) => {
      const val = submission.answers[q.id];
      // Include document info if the question was answered
      if (val !== undefined && val !== '' && q.documentInfo) {
        docs.push(q.documentInfo);
      }
      // Check conditional sub-question docs
      if (q.conditionals && typeof val === 'string') {
        q.conditionals.forEach((cond) => {
          if (val === cond.showWhen && cond.question.documentInfo) {
            docs.push(cond.question.documentInfo);
          }
        });
      }
    });
  });
  // Deduplicate
  return [...new Set(docs)];
}

/** Build HTML for a section */
function buildSectionHTML(section: SurveySection, submission: SubmissionRow): string {
  let rows = '';
  section.questions.forEach((q) => {
    const raw = submission.answers[q.id];
    const value = resolveLabel(q, raw);
    rows += `
      <tr>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;color:#555;font-size:11px;width:55%;line-height:1.4;">
          ${q.text}
        </td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;font-weight:600;font-size:11px;color:#2d2b3d;line-height:1.4;">
          ${value}
        </td>
      </tr>
    `;
    // Conditional sub-questions
    if (q.conditionals && typeof raw === 'string') {
      q.conditionals.forEach((cond) => {
        if (raw === cond.showWhen) {
          const subVal = resolveLabel(cond.question, submission.answers[cond.question.id]);
          rows += `
            <tr>
              <td style="padding:6px 8px 6px 24px;border-bottom:1px solid #eee;color:#777;font-size:10px;line-height:1.4;">
                ↳ ${cond.question.text}
              </td>
              <td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:10px;color:#2d2b3d;line-height:1.4;">
                ${subVal}
              </td>
            </tr>
          `;
        }
      });
    }
  });

  return `
    <div style="margin-bottom:16px;page-break-inside:avoid;">
      <div style="background:linear-gradient(135deg,#6B4AE2,#9B6DFF);color:white;padding:8px 14px;border-radius:8px 8px 0 0;font-size:12px;font-weight:700;">
        ${section.icon} ${section.title}
      </div>
      <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e8e8ef;border-top:none;border-radius:0 0 8px 8px;">
        ${rows}
      </table>
    </div>
  `;
}

/** Build the full HTML document for the PDF */
function buildReportHTML(submission: SubmissionRow): string {
  const now = new Date().toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' });
  const submittedAt = new Date(submission.submitted_at).toLocaleString('es-ES', {
    dateStyle: 'long',
    timeStyle: 'short',
  });
  const documents = gatherDocuments(submission);

  const sectionsHTML = surveySections.map((s) => buildSectionHTML(s, submission)).join('');

  const docsHTML = documents
    .map((d) => `<tr><td style="padding:4px 8px;font-size:10px;color:#333;border-bottom:1px solid #eee;">☐ ${d}</td></tr>`)
    .join('');

  const notesHTML = submission.reviewer_notes
    ? `
      <div style="margin-top:16px;page-break-inside:avoid;">
        <div style="background:#f0f4ff;border:1px solid #d4daf0;border-radius:8px;padding:14px;">
          <div style="font-size:11px;font-weight:700;color:#6B4AE2;margin-bottom:6px;">📝 NOTAS DEL ASESOR</div>
          <div style="font-size:11px;color:#333;line-height:1.6;white-space:pre-wrap;">${submission.reviewer_notes}</div>
        </div>
      </div>
    `
    : '';

  return `
    <div style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;color:#2d2b3d;max-width:700px;margin:0 auto;">
      <!-- Header -->
      <div style="text-align:center;padding:20px 0;border-bottom:3px solid #6B4AE2;margin-bottom:20px;">
        <div style="font-size:20px;font-weight:800;background:linear-gradient(135deg,#6B4AE2,#E84393);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
          RentaFácil
        </div>
        <div style="font-size:10px;color:#888;margin-top:2px;letter-spacing:1px;">
          CUESTIONARIO PREVIO IRPF 2025
        </div>
      </div>

      <!-- Client Info -->
      <div style="background:#f8f7ff;border:1px solid #e8e8ef;border-radius:8px;padding:14px;margin-bottom:20px;">
        <table style="width:100%;font-size:11px;">
          <tr>
            <td style="padding:3px 0;color:#888;width:120px;">Contribuyente:</td>
            <td style="font-weight:700;">${submission.client_name}</td>
            <td style="padding:3px 0;color:#888;width:80px;">NIF:</td>
            <td style="font-weight:700;font-family:monospace;">${submission.client_nif}</td>
          </tr>
          <tr>
            <td style="padding:3px 0;color:#888;">Fecha envío:</td>
            <td>${submittedAt}</td>
            <td style="padding:3px 0;color:#888;">Referencia:</td>
            <td style="font-family:monospace;font-size:10px;">${submission.id.slice(0, 8)}</td>
          </tr>
        </table>
      </div>

      <!-- Sections -->
      ${sectionsHTML}

      <!-- Document Checklist -->
      <div style="margin-top:20px;page-break-inside:avoid;">
        <div style="background:#2d2b3d;color:white;padding:8px 14px;border-radius:8px 8px 0 0;font-size:12px;font-weight:700;">
          📎 DOCUMENTACIÓN REQUERIDA
        </div>
        <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e8e8ef;border-top:none;border-radius:0 0 8px 8px;">
          ${docsHTML}
        </table>
      </div>

      <!-- Reviewer Notes -->
      ${notesHTML}

      <!-- Footer -->
      <div style="text-align:center;margin-top:30px;padding-top:12px;border-top:1px solid #e8e8ef;font-size:9px;color:#aaa;">
        Generado por RentaFácil • ${now}<br/>
        Este documento es un resumen informativo y no constituye asesoramiento fiscal vinculante.
      </div>
    </div>
  `;
}

/** Generate and download the PDF */
export async function generatePdf(submission: SubmissionRow): Promise<void> {
  const html = buildReportHTML(submission);

  // Create a temporary container
  const container = document.createElement('div');
  container.innerHTML = html;
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  document.body.appendChild(container);

  try {
    const fileName = `IRPF_2025_${submission.client_name.replace(/\s/g, '_')}_${submission.client_nif}.pdf`;

    await (html2pdf() as any)
      .set({
        margin: [12, 14, 12, 14],
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      })
      .from(container)
      .save();
  } finally {
    document.body.removeChild(container);
  }
}
