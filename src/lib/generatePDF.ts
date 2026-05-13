import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { SavedAudit } from '../types';

export async function generateAuditPDF(audit: SavedAudit, auditId: string): Promise<void> {
  const element = document.getElementById('compact-pdf-content');
  if (!element) {
    throw new Error('PDF content element not found');
  }

  const originalDisplay = element.style.display;
  element.style.display = 'block';
  element.style.position = 'absolute';
  element.style.left = '-9999px';
  element.style.top = '-9999px';
  element.style.width = '800px';

  try {
    await new Promise(resolve => setTimeout(resolve, 100));

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      allowTaint: true,
      imageTimeout: 0,
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const imgData = canvas.toDataURL('image/png');
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight - 20;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight - 20;
    }

    const totalMonthlySavings = audit.total_monthly_savings.toFixed(0);
    const fileName = `SpendLens-Audit-${totalMonthlySavings}mo-savings.pdf`;
    pdf.save(fileName);
  } finally {
    element.style.display = originalDisplay;
    element.style.position = '';
    element.style.left = '';
    element.style.top = '';
    element.style.width = '';
  }
}
