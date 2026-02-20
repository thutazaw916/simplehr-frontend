import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const generatePayslipPDF = (payroll, companyName) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    const fm = (n) => Number(n || 0).toLocaleString();

    // Header
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 0, pageWidth, 45, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(companyName || 'SimpleHR', 20, 20);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('MONTHLY PAYSLIP', 20, 32);

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(`${payroll.month || '-'}/${payroll.year || '-'}`, pageWidth - 20, 20, { align: 'right' });

    doc.setFontSize(10);
    doc.text((payroll.status || 'draft').toUpperCase(), pageWidth - 20, 32, { align: 'right' });

    let y = 55;

    // Employee Info
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Employee Information', 20, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const empName = payroll.user?.name || '-';
    const empPhone = payroll.user?.phone || '-';
    const empRole = payroll.user?.role || '-';

    doc.setTextColor(120, 120, 120);
    doc.text('Name:', 20, y);
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'bold');
    doc.text(empName, 80, y);
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text('Phone:', 20, y);
    doc.setTextColor(50, 50, 50);
    doc.text(empPhone, 80, y);
    y += 7;

    doc.setTextColor(120, 120, 120);
    doc.text('Role:', 20, y);
    doc.setTextColor(50, 50, 50);
    doc.text(empRole.toUpperCase(), 80, y);
    y += 12;

    // Earnings Table
    const earnings = [
      ['Basic Salary', fm(payroll.basicSalary)]
    ];

    if (payroll.allowances) {
      if (payroll.allowances.transport) earnings.push(['Transport Allowance', fm(payroll.allowances.transport)]);
      if (payroll.allowances.meal) earnings.push(['Meal Allowance', fm(payroll.allowances.meal)]);
      if (payroll.allowances.housing) earnings.push(['Housing Allowance', fm(payroll.allowances.housing)]);
      if (payroll.allowances.phone) earnings.push(['Phone Allowance', fm(payroll.allowances.phone)]);
      if (payroll.allowances.position) earnings.push(['Position Allowance', fm(payroll.allowances.position)]);
      if (payroll.allowances.other) earnings.push(['Other Allowance', fm(payroll.allowances.other)]);
    }

    if (payroll.overtime?.totalAmount) earnings.push(['Overtime Pay', fm(payroll.overtime.totalAmount)]);
    earnings.push(['GROSS SALARY', fm(payroll.grossSalary)]);

    autoTable(doc, {
      startY: y,
      head: [['Earnings', 'Amount (Ks)']],
      body: earnings,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129], fontSize: 9 },
      bodyStyles: { fontSize: 10 },
      columnStyles: { 1: { halign: 'right' } },
      margin: { left: 20, right: 20 },
      didParseCell: (data) => {
        if (data.row.index === earnings.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [240, 253, 244];
        }
      }
    });

    y = doc.lastAutoTable.finalY + 10;

    // Deductions Table
    const deductions = [];
    if (payroll.deductions) {
      if (payroll.deductions.ssb) deductions.push(['SSB (2%)', fm(payroll.deductions.ssb)]);
      if (payroll.deductions.tax) deductions.push(['Income Tax', fm(payroll.deductions.tax)]);
      if (payroll.deductions.latePenalty) deductions.push(['Late Penalty', fm(payroll.deductions.latePenalty)]);
      if (payroll.deductions.absentPenalty) deductions.push(['Absent Penalty', fm(payroll.deductions.absentPenalty)]);
      if (payroll.deductions.advanceSalary) deductions.push(['Advance Salary', fm(payroll.deductions.advanceSalary)]);
      if (payroll.deductions.loan) deductions.push(['Loan', fm(payroll.deductions.loan)]);
      if (payroll.deductions.other) deductions.push(['Other', fm(payroll.deductions.other)]);
    }

    if (deductions.length === 0) {
      deductions.push(['No Deductions', '0']);
    }

    deductions.push(['TOTAL DEDUCTIONS', fm(payroll.totalDeductions)]);

    autoTable(doc, {
      startY: y,
      head: [['Deductions', 'Amount (Ks)']],
      body: deductions,
      theme: 'striped',
      headStyles: { fillColor: [239, 68, 68], fontSize: 9 },
      bodyStyles: { fontSize: 10 },
      columnStyles: { 1: { halign: 'right' } },
      margin: { left: 20, right: 20 },
      didParseCell: (data) => {
        if (data.row.index === deductions.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [254, 242, 242];
        }
      }
    });

    y = doc.lastAutoTable.finalY + 12;

    // Net Salary Box
    doc.setFillColor(99, 102, 241);
    doc.roundedRect(20, y, pageWidth - 40, 25, 4, 4, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('NET SALARY', 30, y + 10);

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(fm(payroll.netSalary) + ' Ks', pageWidth - 30, y + 16, { align: 'right' });

    y += 35;

    // Payment Info
    if (payroll.paymentMethod && payroll.status === 'paid') {
      doc.setTextColor(120, 120, 120);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Payment: ' + (payroll.paymentMethod || '').toUpperCase(), 20, y);
      if (payroll.paymentDetails?.transactionId) {
        doc.text('Transaction: ' + payroll.paymentDetails.transactionId, 20, y + 5);
      }
    }

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text('Generated: ' + new Date().toLocaleString(), 20, footerY);
    doc.text('SimpleHR Myanmar', pageWidth - 20, footerY, { align: 'right' });

    // Save
    const fileName = 'Payslip_' + empName + '_' + (payroll.month || '') + '_' + (payroll.year || '') + '.pdf';
    doc.save(fileName);

    return fileName;
  } catch (error) {
    console.log('PDF Error:', error);
    throw error;
  }
};

export default generatePayslipPDF;