import React from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logo from '../Visitor/assets/HEE-logo.png'

/**
 * Generate Invoice PDF matching the exact Healtheasy EMI Design
 * @param {Object} data - Dynamic invoice/appointment data
 * @param {Object} options - Configuration options
 */
export const generateInvoicePDF = async (data, options = {}) => {
  const { fileName = null } = options;

  const tempDiv = document.createElement("div");
  tempDiv.style.position = "absolute";
  tempDiv.style.left = "-9999px";
  tempDiv.style.top = "0";
  tempDiv.style.width = "210mm"; // Pure A4 Width
  tempDiv.style.background = "#ffffff";
  tempDiv.style.fontFamily = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  // Generate template with dynamic or fallback data
  tempDiv.innerHTML = generateHTMLTemplate(data);
  document.body.appendChild(tempDiv);

  try {
    const canvas = await html2canvas(tempDiv, {
      scale: 2.5, // High resolution crisp text
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // First Page
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Multi-page handling if content overflows
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const defaultFileName = `invoice_${data.invoiceNo || "receipt"}_${Date.now()}.pdf`;
    pdf.save(fileName || defaultFileName);
  } catch (error) {
    console.error("Error generating PDF:", error);
  } finally {
    if (tempDiv.parentNode) {
      document.body.removeChild(tempDiv);
    }
  }
};

/**
 * HTML Template matching the image structure using robust table layouts
 */
function generateHTMLTemplate(data) {

  const invoiceNo = data.invoiceNo || `INV-${Date.now()}`;
  const bookingId = data.bookingId || data._id || "N/A";

  const invoiceDate = data.date || "N/A";
  const invoiceTime = data.time || "N/A";

  const patient = {
    name: data.patientname || "Patient Name",
    mobile: data.patientmobile || data.mobile || "N/A",
    email: data.patientemail || data.email || "N/A",
  };

  const doctor = {
    name: `Dr. ${data.doctorid?.name || "Doctor Name"} (${data.doctorid?.qualification || ""})`,
    hospital: data.hospital_name?.name || "Hospital Name",
    address: data.hospital_name?.address || "Hospital Address",
    type: data.surgerydetails?.name
      ? data.surgerydetails.name
      : `Dr. ${data.doctorid?.name || ""}'s E OPD`,
    date: data.date || "N/A",
    time: data.time || "N/A",
  };

  const totalAmount =
    Number(data.totalamount || data.price || 0);

  const amountPaid = (totalAmount * 0.15).toFixed(2);

  const remainingAmount = (
    totalAmount - Number(amountPaid)
  ).toFixed(2);

  const transaction = {
    status: data.paymentstatus || "SUCCESSFUL",
    mode: data.paymentmode || "UPI",
    id: data.transactionid || "N/A",
    amountPaid,
    remainingAmount,
  };

  return `
    <div style="width:210mm; min-height:297mm; padding:15mm 12mm; background:#ffffff; box-sizing:border-box; position:relative; color:#333333;">
      
      <table style="width:100%; border-collapse:collapse; margin-bottom:15px;">
        <tr>
          <td style="vertical-align:middle; width:50%;">
            <div style="font-size:32px; font-weight:bold; color:#034e7b; letter-spacing:-0.5px;">
              <img src="${logo}" style="max-width: 200px" />
            </div>
          </td>
          <td style="text-align:right; vertical-align:middle; width:50%;">
            <h2 style="margin:0 0 10px 0; color:#034e7b; font-size:20px; text-transform:uppercase; font-weight:bold;">Appointment Booking Invoice</h2>
            <table style="margin-left:auto; font-size:13px; color:#444444;">
              <tr><td style="font-weight:bold; text-align:left; padding:2px 10px 2px 0;">Invoice No.</td><td>: ${invoiceNo}</td></tr>
              <tr><td style="font-weight:bold; text-align:left; padding:2px 10px 2px 0;">Booking ID</td><td>: ${bookingId}</td></tr>
              <tr><td style="font-weight:bold; text-align:left; padding:2px 10px 2px 0;">Invoice Date</td><td>: ${invoiceDate}</td></tr>
              <tr><td style="font-weight:bold; text-align:left; padding:2px 10px 2px 0;">Invoice Time</td><td>: ${invoiceTime}</td></tr>
            </table>
          </td>
        </tr>
      </table>

      <hr style="border:none; border-top:1.5px solid #0294a5; margin:15px 0 20px 0;" />

      <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
        <tr>
          <td style="width:48%; vertical-align:top; padding-right:2%;">
            <div style="background:#0294a5; color:#ffffff; font-size:12px; font-weight:bold; padding:6px 12px; border-top-left-radius:6px; border-top-right-radius:6px; display:inline-block;">
              👤 PATIENT INFORMATION
            </div>
            <div style="border:1px solid #0294a5; border-top:none; border-radius:0 6px 6px 6px; padding:15px; min-height:140px; font-size:13px; background:#fafafa;">
              <table style="width:100%;">
                <tr style="height:28px;"><td style="font-weight:bold; color:#555; width:100px;">Patient Name</td><td>: <b style="color:#034e7b;">${patient.name}</b></td></tr>
                <tr style="height:28px;"><td style="font-weight:bold; color:#555;">Mobile Number</td><td>: ${patient.mobile}</td></tr>
                <tr style="height:28px;"><td style="font-weight:bold; color:#555;">Email ID</td><td>: ${patient.email}</td></tr>
              </table>
            </div>
          </td>
          <td style="width:50%; vertical-align:top;">
            <div style="background:#0294a5; color:#ffffff; font-size:12px; font-weight:bold; padding:6px 12px; border-top-left-radius:6px; border-top-right-radius:6px; display:inline-block;">
              🏥 DOCTOR & APPOINTMENT DETAILS
            </div>
            <div style="border:1px solid #0294a5; border-top:none; border-radius:0 6px 6px 6px; padding:15px; min-height:140px; font-size:13px; background:#fafafa;">
              <table style="width:100%;">
                <tr style="height:25px;"><td style="font-weight:bold; color:#555; width:120px;">Doctor Name</td><td>: <b style="color:#034e7b;">${doctor.name}</b></td></tr>
                <tr style="height:25px;"><td style="font-weight:bold; color:#555;">Hospital / Clinic</td><td>: ${doctor.hospital}</td></tr>
                <tr style="height:25px;"><td style="font-weight:bold; color:#555; vertical-align:top;">Address</td><td style="vertical-align:top;">: ${doctor.address}</td></tr>
                <tr style="height:25px;"><td style="font-weight:bold; color:#555;">Consultation Type</td><td>: ${doctor.type}</td></tr>
                <tr style="height:25px;"><td style="font-weight:bold; color:#555;">Appointment Date</td><td>: ${doctor.date}</td></tr>
                <tr style="height:25px;"><td style="font-weight:bold; color:#555;">Appointment Time</td><td>: ${doctor.time}</td></tr>
              </table>
            </div>
          </td>
        </tr>
      </table>

      <div style="background:#0294a5; color:#ffffff; font-size:12px; font-weight:bold; padding:6px 12px; border-top-left-radius:6px; border-top-right-radius:6px; display:inline-block; margin-top:10px;">
        📄 PAYMENT SUMMARY
      </div>
      <table style="width:100%; border-collapse:collapse; border:1px solid #0294a5; margin-bottom:25px; font-size:13px; border-radius:0 6px 6px 6px; overflow:hidden;">
        <thead>
          <tr style="background:#eef7f9; color:#034e7b; font-weight:bold; border-bottom:1px solid #0294a5;">
            <th style="padding:10px; text-align:left;">DESCRIPTION</th>
            <th style="padding:10px; text-align:right; width:150px;">AMOUNT (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom:1px dashed #dddddd;"><td style="padding:10px;">Doctor Consultation Fee</td><td style="padding:10px; text-align:right;">
  ${totalAmount.toFixed(2)}
</td></tr>
          <tr style="border-bottom:1px dashed #dddddd;"><td style="padding:10px;">Platform Convenience Fee</td><td style="padding:10px; text-align:right;">0.00</td></tr>
          <tr style="border-bottom:1px solid #0294a5;"><td style="padding:10px;">GST (Included)</td><td style="padding:10px; text-align:right;">0.00</td></tr>
          <tr style="background:#f1f9fa; font-weight:bold; color:#0294a5;"><td style="padding:10px;">TOTAL AMOUNT</td><td style="padding:10px; text-align:right;">
  ₹ ${totalAmount.toFixed(2)}
</td></tr>
          <tr style="font-weight:bold; color:#2e7d32; background:#edf7ed;"><td style="padding:10px;">AMOUNT PAID</td><td style="padding:10px; text-align:right;">₹ ${transaction.amountPaid}</td></tr>
          <tr style="font-weight:bold; color:#c62828; background:#fdecea;"><td style="padding:10px;">REMAINING AMOUNT</td><td style="padding:10px; text-align:right;">₹ ${transaction.remainingAmount}</td></tr>
        </tbody>
      </table>

      <div style="background:#0294a5; color:#ffffff; font-size:12px; font-weight:bold; padding:6px 12px; border-top-left-radius:6px; border-top-right-radius:6px; display:inline-block;">
        💳 TRANSACTION DETAILS
      </div>
      <div style="border:1px solid #0294a5; border-radius:0 6px 6px 6px; padding:15px; background:#fafafa; margin-bottom:25px; font-size:13px;">
        <table style="width:100%;">
          <tr>
            <td style="width:50%; vertical-align:top; border-right:1px dashed #cccccc; padding-right:15px;">
              <table style="width:100%;">
                <tr style="height:26px;"><td style="font-weight:bold; color:#555; width:120px;">Payment Status</td><td>: <span style="background:#e8f5e9; color:#2e7d32; font-weight:bold; padding:2px 8px; border-radius:4px; font-size:11px;">✔️ ${transaction.status}</span></td></tr>
                <tr style="height:26px;"><td style="font-weight:bold; color:#555;">Payment Mode</td><td>: ${transaction.mode}</td></tr>
                <tr style="height:26px;"><td style="font-weight:bold; color:#555;">Transaction ID</td><td>: ${transaction.id}</td></tr>
              </table>
            </td>
            <td style="width:50%; vertical-align:top; padding-left:15px;">
              <table style="width:100%;">
                <tr style="height:26px;"><td style="font-weight:bold; color:#555; width:120px;">Booking ID</td><td>: ${bookingId}</td></tr>
                <tr style="height:26px;"><td style="font-weight:bold; color:#555;">Amount Paid</td><td>: ₹ ${transaction.amountPaid}</td></tr>
                <tr style="height:26px;"><td style="font-weight:bold; color:#555;">Payment Date</td><td>: ${invoiceDate}, ${invoiceTime}</td></tr>
              </table>
            </td>
          </tr>
        </table>
      </div>

      <!-- <table style="width:100%; border-collapse:collapse; margin-bottom:40px;">
        <tr>
          <td style="width:70%; vertical-align:top; font-size:11px; color:#666666; line-height:1.6; padding-right:20px;">
            <b style="color:#0294a5; font-size:12px;">📝 IMPORTANT NOTES</b><br />
            <ul style="margin:5px 0 0 0; padding-left:15px;">
              <li>This receipt confirms successful appointment booking.</li>
              <li>Please reach the clinic 10 minutes before the scheduled appointment time.</li>
              <li>Rescheduling or cancellation is subject to the doctor's policy.</li>
              <li>This is a computer-generated invoice and does not require a signature.</li>
            </ul>
          </td>
          <td style="width:30%; text-align:right; vertical-align:top;">
            <div style="font-size:11px; font-weight:bold; color:#555555; margin-bottom:5px; text-transform:uppercase;">Scan QR Code</div>
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${bookingId}" style="width:90px; height:90px; border:1px solid #dddddd; padding:3px; background:#ffffff;" alt="QR" />
          </td>
        </tr>
      </table> -->

      <div style="position:absolute; bottom:15mm; left:12mm; width:186mm;">
        <hr style="border:none; border-top:1px solid #dddddd; margin-bottom:15px;" />
        <table style="width:100%; font-size:11px; color:#555555;">
          <tr>
            <td style="width:50%; line-height:1.5;">
              <div style="font-size:14px; font-weight:bold; color:#034e7b;"><span style="color:#0294a5;">+</span> healtheasy <span style="font-size:10px; background:#0294a5; color:#fff; padding:1px 5px; border-radius:4px;">EMI</span></div>
              <div style="margin-top:4px;"><b>Powered By:</b> Arogya Mantra Healthtech Private Limited</div>
              <div style="color:#888;">Making Healthcare Accessible & Affordable</div>
            </td>
            <td style="width:50%; text-align:right; line-height:1.5;">
              📞 +91 8855919195<br />
              🌐 www.healtheasyemi.com<br />
              ✉️ support@healtheasyemi.com<br />
              📍 Office No. 201, 2nd Floor, Pune, Maharashtra - 411001
            </td>
          </tr>
        </table>
        <div style="background:#0294a5; color:#ffffff; text-align:center; padding:6px; font-size:11px; font-weight:bold; border-radius:4px; margin-top:15px; letter-spacing:0.5px;">
          💚 Thank you for choosing Healtheasy EMI. We wish you good health!
        </div>
      </div>

    </div>
  `;
}