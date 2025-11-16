const PDFDocument = require('pdfkit');
const { toWords } = require('number-to-words');

// Helper function to format currency
const formatCurrency = (amount) => `₹${amount.toFixed(2)}`;

// Helper function to generate a table header
function generateHeader(doc, y) {
    doc
        .fontSize(8)
        .font('Helvetica-Bold')
        .text('Item', 50, y, { width: 120, align: 'left' })
        .text('HSN', 170, y, { width: 40, align: 'left' })
        .text('Batch', 210, y, { width: 50, align: 'left' })
        .text('Qty', 260, y, { width: 30, align: 'right' })
        .text('Rate', 290, y, { width: 50, align: 'right' })
        .text('Taxable', 340, y, { width: 60, align: 'right' })
        .text('GST %', 400, y, { width: 40, align: 'right' })
        .text('GST Amt', 440, y, { width: 50, align: 'right' })
        .text('Total', 490, y, { width: 55, align: 'right' })
        .moveTo(50, y + 15)
        .lineTo(545, y + 15)
        .strokeColor("#cccccc")
        .stroke();
}

// Helper function to generate a table row
function generateTableRow(doc, y, item) {
    // These calculations must match BillingPage.jsx
    const taxableAmount = item.price * item.quantity;
    const gstRate = item.gst_percentage || 0;
    const taxForItem = taxableAmount * (gstRate / 100);
    const totalAmount = taxableAmount + taxForItem;

    doc
        .fontSize(8)
        .font('Helvetica')
        .text(item.name, 50, y, { width: 120, align: 'left' })
        .text(item.hsn, 170, y, { width: 40, align: 'left' })
        .text(item.batch_number, 210, y, { width: 50, align: 'left' })
        .text(item.quantity, 260, y, { width: 30, align: 'right' })
        .text(item.price.toFixed(2), 290, y, { width: 50, align: 'right' })
        .text(taxableAmount.toFixed(2), 340, y, { width: 60, align: 'right' })
        .text(gstRate.toFixed(2) + '%', 400, y, { width: 40, align: 'right' })
        .text(taxForItem.toFixed(2), 440, y, { width: 50, align: 'right' })
        .font('Helvetica-Bold')
        .text(totalAmount.toFixed(2), 490, y, { width: 55, align: 'right' })
        .font('Helvetica');
    
    return y + 20; // Return the next row's Y position
}

function createInvoice(invoice, stream) {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    if (stream) {
        doc.pipe(stream);
    }

    const settings = invoice.settings || {};

    // --- Header ---
    doc.fillColor("#444444");
    doc.fontSize(20).font('Helvetica-Bold').text(settings.company_name || 'Your Company Name', { align: 'center' });
    doc.fillColor("#666666");
    
    if (settings.address) {
        const addressLines = settings.address.split('\n');
        addressLines.forEach(line => {
            doc.fontSize(10).font('Helvetica').text(line, { align: 'center' });
        });
    } else {
        doc.fontSize(10).font('Helvetica').text('123 Main Street, City, State 12345', { align: 'center' });
    }
    
    if (settings.gstin) {
        doc.fontSize(10).font('Helvetica-Bold').text(`GSTIN: ${settings.gstin}`, { align: 'center' });
    }
    
    doc.moveDown(2);
    doc.strokeColor("#cccccc").moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown();

    // --- Invoice Info ---
    const invoiceInfoTop = doc.y;
    doc.fillColor("#444444");
    doc.fontSize(10).font('Helvetica-Bold').text('Bill To:', 50, invoiceInfoTop);
    doc.font('Helvetica').text(invoice.client?.name || 'N/A', 50, invoiceInfoTop + 15);
    doc.text(invoice.client?.address || '', 50, invoiceInfoTop + 30, { width: 250 });
    doc.text(invoice.client?.phone || '', 50, invoiceInfoTop + 45);
    doc.text(`GSTIN: ${invoice.client?.gstin || 'N/A'}`, 50, invoiceInfoTop + 60);

    const infoBoxX = 350;
    const infoBoxY = invoiceInfoTop;
    doc.font('Helvetica-Bold').text('Invoice #:', infoBoxX, infoBoxY);
    doc.font('Helvetica').text(invoice.invoiceNumber, infoBoxX + 100, infoBoxY, { align: 'right' });
    
    doc.font('Helvetica-Bold').text('Invoice Date:', infoBoxX, infoBoxY + 15);
    doc.font('Helvetica').text(new Date(invoice.created_at).toLocaleDateString('en-GB'), infoBoxX + 100, infoBoxY + 15, { align: 'right' });
    
    doc.font('Helvetica-Bold').text('Payment Mode:', infoBoxX, infoBoxY + 30);
    doc.font('Helvetica').text(invoice.paymentMode, infoBoxX + 100, infoBoxY + 30, { align: 'right' });
    
    doc.moveDown(5);

    // --- Table ---
    let tableTop = doc.y;
    generateHeader(doc, tableTop);
    tableTop += 25; // Move down past the header

    let y = tableTop;
    // Calculate tax breakdown from items
    const taxBreakdown = {};
    invoice.billItems.forEach(item => {
        const taxableAmount = item.price * item.quantity;
        const gstRate = item.gst_percentage || 0;
        const taxForItem = taxableAmount * (gstRate / 100);

        if (taxBreakdown[gstRate]) {
            taxBreakdown[gstRate] += taxForItem;
        } else {
            taxBreakdown[gstRate] = taxForItem;
        }

        y = generateTableRow(doc, y, item);
        
        // Add horizontal line per item
        doc.moveTo(50, y - 8).lineTo(545, y - 8).strokeColor("#eeeeee").stroke();
    });
    
    // Final line after items
    doc.moveTo(50, y - 8).lineTo(545, y - 8).strokeColor("#cccccc").stroke();

    // --- Totals ---
    const totalsTop = y + 10;
    const subtotal = invoice.totals.subtotal;
    const finalAmount = invoice.totals.finalAmount;
    const totalsX = 350;
    const totalsValueX = 450;
    
    doc.fillColor("#444444");
    doc.font('Helvetica').fontSize(10).text('Subtotal (Taxable):', totalsX, totalsTop, { align: 'right', width: 90 });
    doc.text(formatCurrency(subtotal), totalsValueX, totalsTop, { align: 'right', width: 95 });

    let taxY = totalsTop + 15;
    
    // Loop through calculated tax breakdown
    Object.entries(taxBreakdown).sort(([a], [b]) => a - b).forEach(([rate, amount]) => {
        const rateNum = Number(rate);
        doc.font('Helvetica').fontSize(9).text(`SGST @ ${(rateNum / 2).toFixed(2)}%:`, totalsX, taxY, { align: 'right', width: 90 });
        doc.text(formatCurrency(amount / 2), totalsValueX, taxY, { align: 'right', width: 95 });
        taxY += 15;
        
        doc.font('Helvetica').fontSize(9).text(`CGST @ ${(rateNum / 2).toFixed(2)}%:`, totalsX, taxY, { align: 'right', width: 90 });
        doc.text(formatCurrency(amount / 2), totalsValueX, taxY, { align: 'right', width: 95 });
        taxY += 15;
    });

    doc.moveTo(totalsX, taxY - 5).lineTo(545, taxY - 5).strokeColor("#cccccc").stroke();

    doc.font('Helvetica-Bold').fontSize(12).text('Grand Total:', totalsX, taxY + 5, { align: 'right', width: 90 });
    doc.text(formatCurrency(finalAmount), totalsValueX, taxY + 5, { align: 'right', width: 95 });

    doc.moveDown(2);
    
    // --- Amount in Words ---
    const amountInWords = toWords(finalAmount).replace(/\b\w/g, l => l.toUpperCase()) + ' Only';
    doc.font('Helvetica-Bold').fontSize(9).text(`Amount in Words:`, 50, totalsTop);
    doc.font('Helvetica').text(`(Rupees ${amountInWords})`, 50, totalsTop + 12, { width: 300 });

    // --- Footer ---
    const footerY = doc.page.height - 100;
    doc.strokeColor("#cccccc").moveTo(50, footerY - 10).lineTo(545, footerY - 10).stroke();

    if (settings.footer_text) {
        doc.fillColor("#666666").fontSize(8).font('Helvetica-Oblique').text(settings.footer_text, 50, footerY, { align: 'center', width: 495 });
    }
    
    doc.fillColor("#444444").font('Helvetica-Bold').fontSize(10).text(`For ${settings.company_name || 'Your Company Name'}`, 50, footerY + 30, { align: 'right', width: 495 });
    doc.font('Helvetica').fontSize(9).text('Authorised Signatory', 50, footerY + 60, { align: 'right', width: 495 });

    doc.end();
    return doc; 
}

// ==============================================================================
// Updated Quotation Function (Bonus)
// ==============================================================================

function generateQuotationHeader(doc, y) {
    doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('Item Description', 50, y, { width: 190, align: 'left' })
        .text('HSN', 240, y, { width: 50, align: 'left' })
        .text('Qty', 290, y, { width: 40, align: 'right' })
        .text('Rate', 330, y, { width: 50, align: 'right' })
        .text('Taxable', 380, y, { width: 60, align: 'right' })
        .text('GST', 440, y, { width: 50, align: 'right' })
        .text('Total', 490, y, { width: 55, align: 'right' })
        .moveTo(50, y + 20)
        .lineTo(545, y + 20)
        .strokeColor("#cccccc")
        .stroke();
}

function generateQuotationRow(doc, y, item) {
    const taxableAmount = item.price * item.quantity;
    const gstRate = item.gst_percentage || 0;
    const taxForItem = taxableAmount * (gstRate / 100);
    const totalAmount = taxableAmount + taxForItem;

    doc
        .fontSize(9)
        .font('Helvetica')
        .text(item.name, 50, y, { width: 190, align: 'left' })
        .text(item.hsn, 240, y, { width: 50, align: 'left' })
        .text(item.quantity, 290, y, { width: 40, align: 'right' })
        .text(item.price.toFixed(2), 330, y, { width: 50, align: 'right' })
        .text(taxableAmount.toFixed(2), 380, y, { width: 60, align: 'right' })
        .text(formatCurrency(taxForItem), 440, y, { width: 50, align: 'right' })
        .font('Helvetica-Bold')
        .text(formatCurrency(totalAmount), 490, y, { width: 55, align: 'right' })
        .font('Helvetica');
    
    return y + 20;
}


function createQuotation(quotation, stream) {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    if (stream) {
        doc.pipe(stream);
    }
    
    const settings = quotation.settings || {};

    // --- Header ---
    doc.fillColor("#444444");
    doc.fontSize(22).font('Helvetica-Bold').text('QUOTATION', { align: 'center' });
    doc.fillColor("#666666");
    doc.fontSize(12).font('Helvetica').text(settings.company_name || 'Your Company Name', { align: 'center' });
    if (settings.address) {
        const addressLines = settings.address.split('\n');
        addressLines.forEach(line => {
            doc.fontSize(10).font('Helvetica').text(line, { align: 'center' });
        });
    }
    doc.moveDown(2);
    doc.strokeColor("#cccccc").moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown();


    // --- Info ---
    const infoTop = doc.y;
    doc.fillColor("#444444");
    doc.fontSize(10).font('Helvetica-Bold').text('To:', 50, infoTop);
    doc.font('Helvetica').text(quotation.client?.name || 'N/A', 50, infoTop + 15);
    doc.text(quotation.client?.address || '', 50, infoTop + 30, { width: 250 });
    doc.text(quotation.client?.phone || '', 50, infoTop + 45);

    doc.font('Helvetica-Bold').text('Date:', 350, infoTop);
    doc.font('Helvetica').text(new Date(quotation.created_at).toLocaleDateString('en-GB'), 450, infoTop, { align: 'right' });
    doc.moveDown(5);

    // --- Table ---
    let tableTop = doc.y;
    generateQuotationHeader(doc, tableTop);
    tableTop += 30;

    let y = tableTop;
    const taxBreakdown = {};
    quotation.billItems.forEach(item => {
        const taxableAmount = item.price * item.quantity;
        const gstRate = item.gst_percentage || 0;
        const taxForItem = taxableAmount * (gstRate / 100);

        if (taxBreakdown[gstRate]) {
            taxBreakdown[gstRate] += taxForItem;
        } else {
            taxBreakdown[gstRate] = taxForItem;
        }

        y = generateQuotationRow(doc, y, item);
        doc.moveTo(50, y - 8).lineTo(545, y - 8).strokeColor("#eeeeee").stroke();
    });
    
    doc.moveTo(50, y - 8).lineTo(545, y - 8).strokeColor("#cccccc").stroke();

    // --- Total ---
    const totalsTop = y + 10;
    const subtotal = quotation.totals.subtotal;
    const finalAmount = quotation.totals.finalAmount;
    const totalsX = 350;
    const totalsValueX = 450;
    
    doc.fillColor("#444444");
    doc.font('Helvetica').fontSize(10).text('Subtotal (Taxable):', totalsX, totalsTop, { align: 'right', width: 90 });
    doc.text(formatCurrency(subtotal), totalsValueX, totalsTop, { align: 'right', width: 95 });

    let taxY = totalsTop + 15;
    
    Object.entries(taxBreakdown).sort(([a], [b]) => a - b).forEach(([rate, amount]) => {
        doc.font('Helvetica').fontSize(9).text(`Total GST @ ${rate}%:`, totalsX, taxY, { align: 'right', width: 90 });
        doc.text(formatCurrency(amount), totalsValueX, taxY, { align: 'right', width: 95 });
        taxY += 15;
    });

    doc.moveTo(totalsX, taxY - 5).lineTo(545, taxY - 5).strokeColor("#cccccc").stroke();
    
    doc.font('Helvetica-Bold').fontSize(12).text('Estimated Total:', totalsX, taxY + 5, { align: 'right', width: 90 });
    doc.text(formatCurrency(finalAmount), totalsValueX, taxY + 5, { align: 'right', width: 95 });

    doc.end();
    return doc;
}


module.exports = { createInvoice, createQuotation };