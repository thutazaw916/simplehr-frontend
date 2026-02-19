import jsPDF from 'jspdf';
import 'jspdf-autotable';

const generatePayslipPDF = (payroll, companyName) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Colors
  const primary = [99, 102, 241]; // Indigo
  const dark = [24, 24, 27];
  const gray = [113, 113, 122];
  const success = [16, 185, 129];
  const danger = [239, 68, 68];
  
  // Header Background
  doc.setFillColor(...primary);
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  // Company Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName || 'SimpleHR', 20, 22);
  
  // Payslip Title
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('MONTHLY PAYSLIP', 20, 35);
  
  // Month/Year Badge
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`${payroll.month}/${payroll.year}`, pageWidth - 20, 22, { align: 'right' });
  
  // Status
  doc.setFontSize(10);
  const statusText = payroll.status?.toUpperCase() || 'DRAFT';
  doc.text(statusText, pageWidth - 20, 35, { align: 'right' });
  
  let y = 62;
  
  // Employee Info Section
  doc.setTextColor(...dark);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Employee Information', 20, y);
  y += 3;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, y, pageWidth - 20, y);
  y += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...gray);
  
  const empInfo = [
    ['Name', payroll.user?.name || '-'],
    ['Phone', payroll.user?.phone || '-'],
    ['Role', payroll.user?.role?.toUpperCase() || '-'],
    ['Period', `${payroll.month}/${payroll.year}`],
  ];
  
  empInfo.forEach(([label, value]) => {
    doc.setTextColor(...gray);
    doc.text(label + ':', 20, y);
    doc.setTextColor(...dark);
    doc.setFont('helvetica', 'bold');
    doc.text(value, 80, y);
    doc.setFont('helvetica', 'normal');
    y += 7;
  });
  
  y += 5;
  
  // Attendance Summary
  doc.setTextColor(...dark);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Attendance Summary', 20, y);
  y += 3;
  doc.line(20, y, pageWidth - 20, y);
  y += 5;
  
  doc.autoTable({
    startY: y,
    head: [['Working Days', 'Present', 'Late', 'Absent', 'Leave']],
    body: [[
      payroll.workingDays || 0,
      payroll.presentDays || 0,
      payroll.lateDays || 0,
      payroll.absentDays || 0,
      payroll.leaveDays || 0
    ]],
    theme: 'grid',
    headStyles: { fillColor: primary, fontSize: 9 },
    bodyStyles: { fontSize: 10, halign: 'center' },
    margin: { left: 20, right: 20 },
  });
  
  y = doc.lastAutoTable.finalY + 10;
  
  // Earnings Table
  doc.setTextColor(...dark);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Earnings', 20, y);
  y += 3;
  doc.line(20, y, pageWidth - 20, y);
  y += 5;
  
  const earnings = [
    ['Basic Salary', formatMoney(payroll.basicSalary)],
  ];
  
  if (payroll.allowances) {
    if (payroll.allowances.transport) earnings.push(['Transport Allowance', formatMoney(payroll.allowances.transport)]);
    if (payroll.allowances.meal) earnings.push(['Meal Allowance', formatMoney(payroll.allowances.meal)]);
    if (payroll.allowances.housing) earnings.push(['Housing Allowance', formatMoney(payroll.allowances.housing)]);
    if (payroll.allowances.phone) earnings.push(['Phone Allowance', formatMoney(payroll.allowances.phone)]);
    if (payroll.allowances.position) earnings.push(['Position Allowance', formatMoney(payroll.allowances.position)]);
    if (payroll.allowances.other) earnings.push(['Other Allowance', formatMoney(payroll.allowances.other)]);
  }
  
  if (payroll.overtime?.totalAmount) earnings.push(['Overtime Pay', formatMoney(payroll.overtime.totalAmount)]);
  
  earnings.push(['GROSS SALARY', formatMoney(payroll.grossSalary)]);
  
  doc.autoTable({
    startY: y,
    head: [['Description', 'Amount (Ks)']],
    body: earnings,
    theme: 'striped',
    headStyles: { fillColor: success, fontSize: 9 },
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
  doc.setTextColor(...dark);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Deductions', 20, y);
  y += 3;
  doc.line(20, y, pageWidth - 20, y);
  y += 5;
  
  const deductions = [];
  if (payroll.deductions) {
    if (payroll.deductions.ssb) deductions.push(['SSB Employee (2%)', formatMoney(payroll.deductions.ssb)]);
    if (payroll.deductions.tax) deductions.push(['Income Tax', formatMoney(payroll.deductions.tax)]);
    if (payroll.deductions.latePenalty) deductions.push(['Late Penalty', formatMoney(payroll.deductions.latePenalty)]);
    if (payroll.deductions.absentPenalty) deductions.push(['Absent Penalty', formatMoney(payroll.deductions.absentPenalty)]);
    if (payroll.deductions.advanceSalary) deductions.push(['Advance Salary', formatMoney(payroll.deductions.advanceSalary)]);
    if (payroll.deductions.loan) deductions.push(['Loan', formatMoney(payroll.deductions.loan)]);
    if (payroll.deductions.other) deductions.push(['Other', formatMoney(payroll.deductions.other)]);
  }
  
  deductions.push(['TOTAL DEDUCTIONS', formatMoney(payroll.totalDeductions)]);
  
  doc.autoTable({
    startY: y,
    head: [['Description', 'Amount (Ks)']],
    body: deductions,
    theme: 'striped',
    headStyles: { fillColor: danger, fontSize: 9 },
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
  doc.setFillColor(...primary);
  doc.roundedRect(20, y, pageWidth - 40, 28, 4, 4, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('NET SALARY', 30, y + 12);
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`${formatMoney(payroll.netSalary)} Ks`, pageWidth - 30, y + 18, { align: 'right' });
  
  y += 38;
  
  // Payment Info
  if (payroll.paymentMethod && payroll.status === 'paid') {
    doc.setTextColor(...gray);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Payment Method: ${payroll.paymentMethod?.toUpperCase()}`, 20, y);
    if (payroll.paymentDetails?.transactionId) {
      doc.text(`Transaction ID: ${payroll.paymentDetails.transactionId}`, 20, y + 5);
    }
    if (payroll.paymentDetails?.paidAt) {
      doc.text(`Paid on: ${new Date(payroll.paymentDetails.paidAt).toLocaleDateString()}`, 20, y + 10);
    }
    y += 18;
  }
  
  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);
  doc.setTextColor(...gray);
  doc.setFontSize(8);
  doc.text(`Generated on ${new Date().toLocaleString()} | SimpleHR Myanmar`, 20, footerY);
  doc.text('This is a computer-generated document', pageWidth - 20, footerY, { align: 'right' });
  
  // Save
  const fileName = `Payslip_${payroll.user?.name || 'Employee'}_${payroll.month}_${payroll.year}.pdf`;
  doc.save(fileName);
  
  return fileName;
};

const formatMoney = (amount) => {
  if (!amount && amount !== 0) return '0';
  return Number(amount).toLocaleString();
};

export default generatePayslipPDF;