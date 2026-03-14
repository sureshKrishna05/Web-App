'use strict';
const PDFDocument = require('pdfkit');
const { toWords }  = require('number-to-words');

/* ─────────────────────────────────────────────
   COLORS  (all mild / professional)
───────────────────────────────────────────── */
const GREEN       = '#1F6B4E';   // deep green — headings, labels
const GREEN_LIGHT = '#E8F4EE';   // pale green — header bg, alt rows
const GREEN_MID   = '#A8CDB8';   // medium green — borders
const BLACK       = '#111111';
const BODY        = '#333333';
const MUTED       = '#777777';
const RULE        = '#CCCCCC';
const WHITE       = '#FFFFFF';

/* ─────────────────────────────────────────────
   PAGE  (A4 = 595 × 842 pt)
───────────────────────────────────────────── */
const PW = 595;
const PH = 842;
const ML = 40;   // margin left
const MR = 40;   // margin right
const CW = PW - ML - MR;   // 515
const RE = ML + CW;         // 555  right edge

/* ─────────────────────────────────────────────
   TABLE COLUMNS  (7 cols, sum = 515 exactly)
   #(20) | Item(165) | HSN(48) | Qty(32) |
   Rate(70) | GST(80) | Total(100)
───────────────────────────────────────────── */
const C = {
    no:    { x: ML,       w: 20  },
    item:  { x: ML+20,    w: 165 },
    hsn:   { x: ML+185,   w: 48  },
    qty:   { x: ML+233,   w: 32  },
    rate:  { x: ML+265,   w: 70  },
    gst:   { x: ML+335,   w: 80  },
    total: { x: ML+415,   w: 100 },
};
// verify: 20+165+48+32+70+80+100 = 515 = CW ✓

/* ─────────────────────────────────────────────
   TINY HELPERS
───────────────────────────────────────────── */
const rupee = (n) => `Rs.${Number(n).toFixed(2)}`;
const num   = (n) =>  Number(n).toFixed(2);

function hLine(doc, y, color = RULE, lw = 0.5) {
    doc.save().strokeColor(color).lineWidth(lw)
       .moveTo(ML, y).lineTo(RE, y).stroke().restore();
}
function fillBox(doc, x, y, w, h, fill) {
    doc.save().fillColor(fill).rect(x, y, w, h).fill().restore();
}
function strokeBox(doc, x, y, w, h, color, lw = 0.5) {
    doc.save().strokeColor(color).lineWidth(lw)
       .rect(x, y, w, h).stroke().restore();
}

/* ─────────────────────────────────────────────
   1.  COMPANY HEADER
───────────────────────────────────────────── */
function drawHeader(doc, settings, docType) {
    let y = 36;

    /* company name */
    doc.font('Helvetica-Bold').fontSize(18).fillColor(BLACK)
       .text(settings.company_name || 'Company Name', ML, y,
             { width: CW, align: 'center' });
    y += 24;

    /* address / phone / gstin — one muted line */
    const parts = [];
    if (settings.address) parts.push(settings.address.replace(/\n/g, ', '));
    if (settings.phone)   parts.push(`Ph: ${settings.phone}`);
    if (settings.gstin)   parts.push(`GSTIN: ${settings.gstin}`);

    if (parts.length) {
        doc.font('Helvetica').fontSize(9).fillColor(MUTED)
           .text(parts.join('   |   '), ML, y, { width: CW, align: 'center' });
        y += 14;
    }

    /* doc-type pill */
    const pillW = 130, pillH = 18;
    const pillX = (PW - pillW) / 2;
    y += 4;
    fillBox(doc, pillX, y, pillW, pillH, GREEN);
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(WHITE)
       .text(docType, pillX, y + 5, { width: pillW, align: 'center', characterSpacing: 1 });
    y += pillH + 10;

    hLine(doc, y, GREEN_MID, 0.7);
    return y + 8;
}

/* ─────────────────────────────────────────────
   2.  BILL-TO  +  INVOICE META
───────────────────────────────────────────── */
function drawInfoBlock(doc, y, invoice) {
    const BLW  = 240;   // bill-to block width
    const METX = ML + BLW + 20;  // meta block x  (300)
    const METW = RE - METX;      // 255
    const H    = 88;

    /* Bill-to box */
    fillBox  (doc, ML,   y, BLW,  H, GREEN_LIGHT);
    strokeBox(doc, ML,   y, BLW,  H, GREEN_MID);

    doc.font('Helvetica-Bold').fontSize(7.5).fillColor(GREEN)
       .text('BILL TO', ML+10, y+9, { characterSpacing: 1 });

    doc.font('Helvetica-Bold').fontSize(11).fillColor(BLACK)
       .text(invoice.client?.name || '—', ML+10, y+22, { width: BLW-20 });

    const clientDetail = [
        invoice.client?.address || '',
        invoice.client?.phone   ? `Ph: ${invoice.client.phone}` : '',
        invoice.client?.gstin   ? `GSTIN: ${invoice.client.gstin}` : '',
    ].filter(Boolean).join('\n');

    doc.font('Helvetica').fontSize(9).fillColor(BODY)
       .text(clientDetail, ML+10, y+38, { width: BLW-20, lineGap: 2 });

    /* Meta box */
    strokeBox(doc, METX, y, METW, H, GREEN_MID);

    const metaRows = [
        ['Invoice No.',  invoice.invoiceNumber  || '—'],
        ['Date',         (() => {
            try { return new Date(invoice.created_at).toLocaleDateString('en-GB'); }
            catch(_){ return '—'; }
        })()],
        ['Payment',      invoice.paymentMode    || '—'],
        ['Status',       invoice.status         || 'Completed'],
    ];

    let ry = y + 10;
    metaRows.forEach(([label, value]) => {
        doc.font('Helvetica').fontSize(9).fillColor(MUTED)
           .text(label + ':', METX+10, ry, { width: 85 });
        doc.font('Helvetica-Bold').fontSize(9).fillColor(BLACK)
           .text(String(value), METX+100, ry, { width: METW-110, align: 'right' });
        ry += 18;
    });

    return y + H + 12;
}

/* ─────────────────────────────────────────────
   3.  TABLE HEADER
───────────────────────────────────────────── */
function drawTableHeader(doc, y) {
    const H = 22;
    fillBox  (doc, ML, y, CW, H, GREEN);
    strokeBox(doc, ML, y, CW, H, GREEN);

    doc.font('Helvetica-Bold').fontSize(8).fillColor(WHITE);
    doc.text('#',       C.no.x,    y+7, { width: C.no.w,    align: 'center' })
       .text('ITEM',    C.item.x,  y+7, { width: C.item.w,  align: 'left'   })
       .text('HSN',     C.hsn.x,   y+7, { width: C.hsn.w,   align: 'center' })
       .text('QTY',     C.qty.x,   y+7, { width: C.qty.w,   align: 'center' })
       .text('RATE',    C.rate.x,  y+7, { width: C.rate.w,  align: 'right'  })
       .text('GST AMT', C.gst.x,   y+7, { width: C.gst.w,   align: 'right'  })
       .text('TOTAL',   C.total.x, y+7, { width: C.total.w, align: 'right'  });

    return y + H;
}

/* ─────────────────────────────────────────────
   4.  TABLE ROW
───────────────────────────────────────────── */
function drawRow(doc, y, item, idx) {
    const hasBatch  = item.batch_number && String(item.batch_number).trim();
    const H         = hasBatch ? 28 : 20;
    const isAlt     = idx % 2 === 1;
    const taxable   = item.price * item.quantity;
    const gstRate   = item.gst_percentage || 0;
    const gstAmt    = taxable * (gstRate / 100);
    const total     = taxable + gstAmt;
    const ty        = y + (hasBatch ? 5 : 5);

    if (isAlt) fillBox(doc, ML, y, CW, H, GREEN_LIGHT);

    /* # */
    doc.font('Helvetica').fontSize(9).fillColor(MUTED)
       .text(String(idx+1), C.no.x, ty, { width: C.no.w, align: 'center' });

    /* Item name */
    doc.font('Helvetica-Bold').fontSize(9.5).fillColor(BLACK)
       .text(item.name, C.item.x, ty, { width: C.item.w });
    if (hasBatch) {
        doc.font('Helvetica').fontSize(8).fillColor(MUTED)
           .text(`Batch: ${item.batch_number}`, C.item.x, ty+13, { width: C.item.w });
    }

    /* HSN */
    doc.font('Helvetica').fontSize(9).fillColor(BODY)
       .text(item.hsn || '—', C.hsn.x, ty, { width: C.hsn.w, align: 'center' });

    /* Qty */
    doc.text(String(item.quantity), C.qty.x, ty, { width: C.qty.w, align: 'center' });

    /* Rate */
    doc.text(rupee(item.price), C.rate.x, ty, { width: C.rate.w, align: 'right' });

    /* GST */
    doc.text(`${rupee(gstAmt)} @ ${num(gstRate)}%`, C.gst.x, ty,
             { width: C.gst.w, align: 'right' });

    /* Total */
    doc.font('Helvetica-Bold').fontSize(10).fillColor(BLACK)
       .text(rupee(total), C.total.x, ty, { width: C.total.w, align: 'right' });

    hLine(doc, y + H, RULE, 0.3);
    return { nextY: y + H, gstRate, gstAmt };
}

/* ─────────────────────────────────────────────
   5.  TOTALS
───────────────────────────────────────────── */
function drawTotals(doc, y, taxBreakdown, subtotal, finalAmount) {
    const BX  = RE - 230;   // block left x = 325
    const LW  = 120;        // label width
    const VX  = BX + LW + 5;// value x = 450
    const VW  = RE - VX;    // value width = 105
    const ROW = 16;
    let cy = y + 6;

    const tRow = (label, value, bold = false) => {
        doc.font('Helvetica').fontSize(9.5).fillColor(MUTED)
           .text(label, BX, cy, { width: LW, align: 'right' });
        doc.font(bold ? 'Helvetica-Bold' : 'Helvetica')
           .fontSize(9.5).fillColor(BODY)
           .text(value, VX, cy, { width: VW, align: 'right' });
        cy += ROW;
    };

    tRow('Subtotal (Taxable):', rupee(subtotal));

    Object.entries(taxBreakdown)
        .sort(([a],[b]) => Number(a)-Number(b))
        .forEach(([rate, amount]) => {
            const h = Number(rate)/2;
            tRow(`SGST @ ${h.toFixed(2)}%:`, rupee(amount/2));
            tRow(`CGST @ ${h.toFixed(2)}%:`, rupee(amount/2));
        });

    cy += 4;
    hLine(doc, cy, GREEN_MID, 0.7);
    cy += 6;

    /* Grand Total bar */
    const GT_H = 26;
    fillBox  (doc, BX, cy, RE-BX, GT_H, GREEN);
    strokeBox(doc, BX, cy, RE-BX, GT_H, GREEN);

    doc.font('Helvetica-Bold').fontSize(10).fillColor(WHITE)
       .text('GRAND TOTAL', BX, cy+8, { width: LW, align: 'right' });
    doc.font('Helvetica-Bold').fontSize(12).fillColor(WHITE)
       .text(rupee(finalAmount), VX, cy+7, { width: VW, align: 'right' });

    return cy + GT_H + 8;
}

/* ─────────────────────────────────────────────
   6.  AMOUNT IN WORDS
───────────────────────────────────────────── */
function drawWords(doc, x, y, amount) {
    let words = '—';
    try {
        words = toWords(Math.round(amount))
            .replace(/\b\w/g, l => l.toUpperCase()) + ' Only';
    } catch(_) {}
    doc.font('Helvetica-Bold').fontSize(9).fillColor(GREEN)
       .text('Amount in Words:', x, y);
    doc.font('Helvetica').fontSize(9).fillColor(BODY)
       .text(`Rupees ${words}`, x, y+14, { width: 270 });
}

/* ─────────────────────────────────────────────
   7.  FOOTER
───────────────────────────────────────────── */
function drawFooter(doc, settings) {
    const FY = PH - 80;
    hLine(doc, FY, RULE, 0.6);

    if (settings.footer_text) {
        doc.font('Helvetica-Oblique').fontSize(8.5).fillColor(MUTED)
           .text(settings.footer_text, ML, FY+10, { width: CW, align: 'center' });
    }

    /* Signatory */
    const SW = 160, SX = RE - SW;
    doc.font('Helvetica').fontSize(9).fillColor(MUTED)
       .text(`For ${settings.company_name || 'Company'}`, SX, FY+14,
             { width: SW, align: 'center' });

    doc.save().strokeColor(RULE).lineWidth(0.6)
       .moveTo(SX+10, FY+50).lineTo(RE-10, FY+50).stroke().restore();

    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(GREEN)
       .text('Authorised Signatory', SX, FY+54, { width: SW, align: 'center' });
}

/* ═══════════════════════════════════════════
   createInvoice
═══════════════════════════════════════════ */
function createInvoice(invoice, stream) {
    const doc = new PDFDocument({ size: 'A4', margin: 0, bufferPages: true });
    if (stream) doc.pipe(stream);

    const S = invoice.settings || {};
    let y = drawHeader(doc, S, 'TAX INVOICE');
    y = drawInfoBlock(doc, y, invoice);
    y = drawTableHeader(doc, y);

    const breakdown = {};
    invoice.billItems.forEach((item, i) => {
        const { nextY, gstRate, gstAmt } = drawRow(doc, y, item, i);
        y = nextY;
        breakdown[gstRate] = (breakdown[gstRate] || 0) + gstAmt;
    });

    hLine(doc, y, GREEN_MID, 0.7);
    y += 14;

    drawWords(doc, ML, y, invoice.totals.finalAmount);
    drawTotals(doc, y, breakdown, invoice.totals.subtotal, invoice.totals.finalAmount);
    drawFooter(doc, S);

    doc.end();
    return doc;
}

/* ═══════════════════════════════════════════
   createQuotation
═══════════════════════════════════════════ */
function createQuotation(quotation, stream) {
    const doc = new PDFDocument({ size: 'A4', margin: 0, bufferPages: true });
    if (stream) doc.pipe(stream);

    const S = quotation.settings || {};
    const asInv = {
        client:        quotation.client,
        invoiceNumber: quotation.quotationNumber || quotation.invoiceNumber || '—',
        created_at:    quotation.created_at,
        paymentMode:   '—',
        status:        'Estimate',
    };

    let y = drawHeader(doc, S, 'QUOTATION');
    y = drawInfoBlock(doc, y, asInv);
    y = drawTableHeader(doc, y);

    const breakdown = {};
    quotation.billItems.forEach((item, i) => {
        const { nextY, gstRate, gstAmt } = drawRow(doc, y, item, i);
        y = nextY;
        breakdown[gstRate] = (breakdown[gstRate] || 0) + gstAmt;
    });

    hLine(doc, y, GREEN_MID, 0.7);
    y += 14;

    drawWords(doc, ML, y, quotation.totals.finalAmount);

    /* Quotation totals — combined GST */
    const BX = RE-230, LW = 120, VX = BX+LW+5, VW = RE-VX;
    let cy = y + 6, ROW = 16;

    const qRow = (lbl, val) => {
        doc.font('Helvetica').fontSize(9.5).fillColor(MUTED)
           .text(lbl, BX, cy, { width: LW, align: 'right' });
        doc.font('Helvetica').fontSize(9.5).fillColor(BODY)
           .text(val, VX, cy, { width: VW, align: 'right' });
        cy += ROW;
    };

    qRow('Subtotal (Taxable):', rupee(quotation.totals.subtotal));
    Object.entries(breakdown).sort(([a],[b])=>Number(a)-Number(b))
        .forEach(([r,a]) => qRow(`GST @ ${r}%:`, rupee(a)));

    cy += 4; hLine(doc, cy, GREEN_MID, 0.7); cy += 6;

    const GT_H = 26;
    fillBox(doc, BX, cy, RE-BX, GT_H, GREEN);
    doc.font('Helvetica-Bold').fontSize(10).fillColor(WHITE)
       .text('ESTIMATED TOTAL', BX, cy+8, { width: LW, align: 'right' });
    doc.font('Helvetica-Bold').fontSize(12).fillColor(WHITE)
       .text(rupee(quotation.totals.finalAmount), VX, cy+7, { width: VW, align: 'right' });

    drawFooter(doc, S);
    doc.end();
    return doc;
}

module.exports = { createInvoice, createQuotation };