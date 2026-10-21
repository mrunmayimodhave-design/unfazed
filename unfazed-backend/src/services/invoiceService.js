const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class InvoiceService {
  /**
   * Generates a unique GST-compliant invoice number
   */
  static generateInvoiceNumber(prefix = 'UNF') {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${year}-${random}`;
  }

  /**
   * Generates a GST-compliant invoice PDF buffer or writes to disk
   */
  static async generateInvoicePDF({ payment, therapist, client, sessionOrPackageTitle }) {
    const invoicesDir = path.join(__dirname, '../../invoices');
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }

    const invoiceNum = payment.invoice_number || this.generateInvoiceNumber();
    const filePath = path.join(invoicesDir, `${invoiceNum}.pdf`);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Header
      doc
        .fontSize(22)
        .fillColor('#0f766e')
        .text('TAX INVOICE', { align: 'right' })
        .moveDown(0.2);

      doc
        .fontSize(10)
        .fillColor('#64748b')
        .text(`Original for Recipient`, { align: 'right' })
        .moveDown(1);

      // Therapist Practice Information
      doc
        .fontSize(14)
        .fillColor('#0f172a')
        .text(therapist.name || 'Clinical Practice', 50, 60)
        .fontSize(10)
        .fillColor('#475569')
        .text(therapist.title || 'Mental Health Professional')
        .text(`Email: ${therapist.email}`)
        .text(`Phone: ${therapist.phone || 'N/A'}`)
        .text(`State: Maharashtra, India (Code: 27)`)
        .moveDown(1.5);

      doc.moveTo(50, 140).lineTo(550, 140).strokeColor('#e2e8f0').stroke();

      // Invoice & Client Info
      const startY = 155;
      doc
        .fontSize(11)
        .fillColor('#0f172a')
        .text('Billed To:', 50, startY)
        .fontSize(10)
        .fillColor('#334155')
        .text(client.name, 50, startY + 16)
        .text(`Email: ${client.email}`, 50, startY + 30)
        .text(`Phone: ${client.phone || 'N/A'}`, 50, startY + 44);

      doc
        .fontSize(10)
        .fillColor('#0f172a')
        .text(`Invoice No: ${invoiceNum}`, 350, startY)
        .text(`Invoice Date: ${new Date(payment.createdAt || Date.now()).toLocaleDateString('en-IN')}`, 350, startY + 16)
        .text(`Payment ID: ${payment.gateway_payment_id || 'RZP_TEST_' + payment._id}`, 350, startY + 30)
        .text(`Status: PAID`, 350, startY + 44);

      // Line items table
      const tableTop = 230;
      doc
        .rect(50, tableTop, 500, 24)
        .fillColor('#f1f5f9')
        .fill();

      doc
        .fillColor('#1e293b')
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('DESCRIPTION', 60, tableTop + 7)
        .text('SAC CODE', 260, tableTop + 7)
        .text('RATE (INR)', 350, tableTop + 7)
        .text('TAXABLE AMT', 450, tableTop + 7, { align: 'right' });

      doc.font('Helvetica');

      const totalAmount = payment.amount || 1500;
      const gstRate = payment.tax_details?.gst_rate || 18;
      // Reverse calculate base amount if GST inclusive
      const baseAmount = +(totalAmount / (1 + gstRate / 100)).toFixed(2);
      const totalTax = +(totalAmount - baseAmount).toFixed(2);
      const cgst = +(totalTax / 2).toFixed(2);
      const sgst = +(totalTax / 2).toFixed(2);

      const rowY = tableTop + 35;
      doc
        .fontSize(9)
        .fillColor('#334155')
        .text(sessionOrPackageTitle || 'Psychological Counseling & Therapy Session', 60, rowY)
        .text('999312', 260, rowY)
        .text(`₹${baseAmount.toLocaleString('en-IN')}`, 350, rowY)
        .text(`₹${baseAmount.toLocaleString('en-IN')}`, 450, rowY, { align: 'right' });

      doc.moveTo(50, rowY + 30).lineTo(550, rowY + 30).strokeColor('#e2e8f0').stroke();

      // Summary
      const summaryY = rowY + 45;
      doc
        .fontSize(9)
        .fillColor('#475569')
        .text('Taxable Subtotal:', 340, summaryY)
        .text(`₹${baseAmount.toLocaleString('en-IN')}`, 450, summaryY, { align: 'right' })
        
        .text(`CGST (${gstRate / 2}%):`, 340, summaryY + 18)
        .text(`₹${cgst.toLocaleString('en-IN')}`, 450, summaryY + 18, { align: 'right' })

        .text(`SGST (${gstRate / 2}%):`, 340, summaryY + 36)
        .text(`₹${sgst.toLocaleString('en-IN')}`, 450, summaryY + 36, { align: 'right' });

      doc.moveTo(340, summaryY + 54).lineTo(550, summaryY + 54).strokeColor('#cbd5e1').stroke();

      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .fillColor('#0f766e')
        .text('Total Paid:', 340, summaryY + 62)
        .text(`₹${totalAmount.toLocaleString('en-IN')}`, 450, summaryY + 62, { align: 'right' });

      // Footer
      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#94a3b8')
        .text('This is a computer-generated invoice and requires no physical signature. Powered by Unfazed SaaS.', 50, 700, {
          align: 'center',
          width: 500,
        });

      doc.end();

      stream.on('finish', () => resolve({ invoiceNum, filePath }));
      stream.on('error', (err) => reject(err));
    });
  }
}

module.exports = InvoiceService;
