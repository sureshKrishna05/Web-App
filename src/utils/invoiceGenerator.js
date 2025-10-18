const PDFDocument = require('pdfkit');
const fs = require('fs');
const { toWords } = require('number-to-words');

function createInvoice(invoice, stream) {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    doc.pipe(stream);

    const settings = invoice.settings || {};

    // --- Header ---
    doc.fontSize(20).font('Helvetica-Bold').text(settings.company_name || 'Your Company Name', { align: 'center' });
    if (settings.address) {
        // Split address into lines and print each one
        const addressLines = settings.address.split('\n');
        addressLines.forEach(line => {
            doc.fontSize(10).font('Helvetica').text(line, { align: 'center' });
        });
    } else {
        doc.fontSize(10).font('Helvetica').text('Your Company Address Line 1', { align: 'center' });
        doc.text('Address Line 2', { align: 'center' });
    }
    doc.moveDown(2);

    // --- Invoice Info ---
    const invoiceInfoTop = doc.y;
    doc.fontSize(10).font('Helvetica-Bold').text('Bill To:', 50, invoiceInfoTop);
    doc.font('Helvetica').text(invoice.client?.name || 'N/A', 50, invoiceInfoTop + 15);
    doc.text(invoice.client?.address || '', 50, invoiceInfoTop + 30);
    doc.text(invoice.client?.phone || '', 50, invoiceInfoTop + 45);
    doc.text(`GSTIN: ${invoice.client?.gstin || 'N/A'}`, 50, invoiceInfoTop + 60);

    doc.font('Helvetica-Bold').text('Invoice #:', 350, invoiceInfoTop);
    doc.font('Helvetica').text(invoice.invoiceNumber, 420, invoiceInfoTop);
    doc.font('Helvetica-Bold').text('Invoice Date:', 350, invoiceInfoTop + 15);
    doc.font('Helvetica').text(new Date().toLocaleDateString('en-GB'), 420, invoiceInfoTop + 15);
    doc.font('Helvetica-Bold').text('Payment Mode:', 350, invoiceInfoTop + 30);
    doc.font('Helvetica').text(invoice.paymentMode, 420, invoiceInfoTop + 30);
    doc.moveDown(5);

    // --- Table ---
    const tableTop = doc.y;
    const tableHeaders = ['Medicine', 'HSN', 'Batch No', 'Qty', 'Rate', 'Amount'];
    const colWidths = [180, 70, 70, 50, 70, 80];
    let x = 50;

    doc.font('Helvetica-Bold');
    tableHeaders.forEach((header, i) => {
        doc.text(header, x, tableTop, { width: colWidths[i], align: i > 2 ? 'right' : 'left' });
        x += colWidths[i];
    });
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    let y = tableTop + 20;
    doc.font('Helvetica');
    invoice.billItems.forEach(item => {
        const itemAmount = (item.price * item.quantity).toFixed(2);
        const itemData = [item.name, item.hsn, item.batch_number, item.quantity, item.price.toFixed(2), itemAmount];
        x = 50;
        itemData.forEach((text, i) => {
            doc.text(text, x, y, { width: colWidths[i], align: i > 2 ? 'right' : 'left' });
            x += colWidths[i];
        });
        y += 20;
        doc.moveTo(50, y-5).lineTo(550, y-5).strokeOpacity(0.5).stroke();
    });
    doc.strokeOpacity(1);

    // --- Totals ---
    const totalsTop = y + 10;
    const subtotal = invoice.totals.subtotal;
    const tax = invoice.totals.tax; // Assuming this is total GST
    const sgst = (tax / 2).toFixed(2);
    const cgst = (tax / 2).toFixed(2);
    const finalAmount = invoice.totals.finalAmount;

    doc.font('Helvetica-Bold').text('Subtotal:', 350, totalsTop, { align: 'right', width: 100 });
    doc.font('Helvetica').text(`₹${subtotal.toFixed(2)}`, 460, totalsTop, { align: 'right', width: 90 });

    doc.font('Helvetica-Bold').text('SGST (9%):', 350, totalsTop + 15, { align: 'right', width: 100 });
    doc.font('Helvetica').text(`₹${sgst}`, 460, totalsTop + 15, { align: 'right', width: 90 });

    doc.font('Helvetica-Bold').text('CGST (9%):', 350, totalsTop + 30, { align: 'right', width: 100 });
    doc.font('Helvetica').text(`₹${cgst}`, 460, totalsTop + 30, { align: 'right', width: 90 });
    
    doc.moveTo(350, totalsTop + 48).lineTo(550, totalsTop + 48).stroke();
    
    doc.font('Helvetica-Bold').fontSize(12).text('Grand Total:', 350, totalsTop + 55, { align: 'right', width: 100 });
    doc.font('Helvetica-Bold').text(`₹${finalAmount.toFixed(2)}`, 460, totalsTop + 55, { align: 'right', width: 90 });

    const amountInWords = toWords(finalAmount).replace(/\b\w/g, l => l.toUpperCase()) + ' Only';
    doc.font('Helvetica-Bold').fontSize(9).text(`(Rupees ${amountInWords})`, 50, totalsTop + 75);


    // --- Footer ---
    const footerY = doc.page.height - 100;
    if (settings.footer_text) {
        doc.fontSize(8).font('Helvetica-Oblique').text(settings.footer_text, { align: 'center' });
    }
    doc.font('Helvetica-Bold').text(`For ${settings.company_name || 'Your Company Name'}`, 50, footerY + 30, { align: 'right' });


    doc.end();
}

function createQuotation(quotation, stream) {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    doc.pipe(stream);
    
    const settings = quotation.settings || {};

    // --- Header ---
    doc.fontSize(22).font('Helvetica-Bold').text('QUOTATION', { align: 'center' });
    doc.fontSize(16).font('Helvetica').text(settings.company_name || 'Your Company Name', { align: 'center' });
    if (settings.address) {
        const addressLines = settings.address.split('\n');
        addressLines.forEach(line => {
            doc.fontSize(10).font('Helvetica').text(line, { align: 'center' });
        });
    }
    doc.moveDown(2);

    // --- Info ---
    const infoTop = doc.y;
    doc.fontSize(10).font('Helvetica-Bold').text('To:', 50, infoTop);
    doc.font('Helvetica').text(quotation.client?.name || 'N/A', 50, infoTop + 15);
    doc.text(quotation.client?.address || '', 50, infoTop + 30);
    doc.text(quotation.client?.phone || '', 50, infoTop + 45);

    doc.font('Helvetica-Bold').text('Date:', 350, infoTop);
    doc.font('Helvetica').text(new Date().toLocaleDateString('en-GB'), 420, infoTop);
    doc.moveDown(5);

    // --- Table ---
    const tableTop = doc.y;
    const tableHeaders = ['Item Description', 'Qty', 'Rate', 'Amount'];
    const colWidths = [280, 70, 100, 100];
    let x = 50;

    doc.font('Helvetica-Bold');
    tableHeaders.forEach((header, i) => {
        doc.text(header, x, tableTop, { width: colWidths[i], align: i > 0 ? 'right' : 'left' });
        x += colWidths[i];
    });
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    let y = tableTop + 20;
    doc.font('Helvetica');
    quotation.billItems.forEach(item => {
        const itemAmount = (item.price * item.quantity).toFixed(2);
        const itemData = [item.name, item.quantity, item.price.toFixed(2), itemAmount];
        x = 50;
        itemData.forEach((text, i) => {
            doc.text(text, x, y, { width: colWidths[i], align: i > 0 ? 'right' : 'left' });
            x += colWidths[i];
        });
        y += 20;
    });
    doc.moveTo(50, y).lineTo(550, y).stroke();
    
    // --- Total ---
    const finalAmount = quotation.totals.finalAmount;
    doc.font('Helvetica-Bold').fontSize(12).text('Estimated Total:', 350, y + 15, { align: 'right', width: 100 });
    doc.font('Helvetica-Bold').text(`₹${finalAmount.toFixed(2)}`, 460, y + 15, { align: 'right', width: 90 });

    doc.end();
}


module.exports = { createInvoice, createQuotation };
