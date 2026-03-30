import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Generate Invoice PDF using HTML template design with direct download
 * @param {Object} data - The appointment/surgery data
 * @param {Object} options - Configuration options
 * @returns {Promise<void>}
 */
export const generateInvoicePDF = async (data, options = {}) => {
  const {
    type = 'appointment', // 'appointment' or 'surgery'
    fileName = null,
    customTemplate = null
  } = options;

  // Create a temporary container
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.top = '0';
  tempDiv.style.width = '210mm';
  tempDiv.style.background = 'white';
  tempDiv.style.fontFamily = 'Arial, Helvetica, sans-serif';
  
  // Generate HTML content based on type
  const htmlContent = customTemplate || generateHTMLTemplate(data, type);
  tempDiv.innerHTML = htmlContent;
  
  document.body.appendChild(tempDiv);
  
  try {
    // Convert to canvas
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // Add new page if content exceeds one page
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // Download PDF
    const defaultFileName = type === 'surgery' 
      ? `surgery_invoice_${data.patientname?.replace(/\s+/g, "_") || "patient"}_${Date.now()}.pdf`
      : `invoice_${data.patientname?.replace(/\s+/g, "_") || "patient"}_${Date.now()}.pdf`;
    
    pdf.save(fileName || defaultFileName);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    // Fallback to print method if html2canvas fails
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
          <title>Invoice</title>
          <style>
              body { margin: 0; font-family: Arial, sans-serif; }
              @media print { body { margin: 0; } }
          </style>
      </head>
      <body>${tempDiv.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  } finally {
    // Clean up
    document.body.removeChild(tempDiv);
  }
};

/**
 * Generate HTML template based on data type
 * @param {Object} data - The appointment/surgery data
 * @param {string} type - 'appointment' or 'surgery'
 * @returns {string} HTML template
 */
function generateHTMLTemplate(data, type) {
  const isSurgery = type === 'surgery';
  
  return `
    <div style="width:210mm; min-height:297mm; background:white; padding:0; margin:0;">
        <!-- HEADER -->
        <div style="background:#2a8fd8; color:white; text-align:center; padding:30px 20px;">
            <h1 style="margin:0; font-size:38px; color:white;">${data.hospital_name?.name || "Hospital Name"}</h1>
            <h3 style="margin:5px 0; font-weight:500; color:white;">Dr. ${data.doctorid?.name || "Doctor Name"} (${data.doctorid?.qualification || "MBBS"})</h3>
            <p style="margin:5px 0; font-size:14px; color:white;">${data.hospital_name?.address || "Hospital Address"}</p>
            <p style="margin:5px 0; font-size:14px; color:white;">${data.doctorid?.email || "doctor@email.com"} | ${data.doctorid?.mobile || "1234567890"}</p>
        </div>
        
        <!-- PATIENT -->
        <div style="background:#1f2d3d; color:white; margin:30px; padding:20px; border-radius:10px;">
            <p style="margin:8px 0; font-size:18px;">Patient Name : <b>${data.patientname || "Patient Name"}</b></p>
            <p style="margin:8px 0; font-size:18px;">Date : <b>${data.date || "N/A"}, ${data.time || "N/A"}</b></p>
            ${isSurgery && data.roomtype ? `<p style="margin:8px 0; font-size:18px;">Room Type : <b>${data.roomtype}</b></p>` : ''}
        </div>
        
        <!-- TABLE -->
        <div style="margin:30px;">
            <table style="width:100%; border-collapse:collapse;">
                <thead>
                    <tr style="background:#1f2d3d; color:white;">
                        <th style="padding:12px; font-size:14px; width:80px;">No.</th>
                        <th style="padding:12px; font-size:14px;">${isSurgery ? 'Surgery Name' : 'Type of Consultation'}</th>
                        <th style="padding:12px; font-size:14px; width:150px; text-align:right;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="background:white; border-bottom:1px solid #ddd;">
                        <td style="padding:12px; font-size:14px;">1</td>
                        <td style="padding:12px; font-size:14px;">
                            ${isSurgery 
                                ? (data.surgerydetails?.name || "Surgery Procedure")
                                : `Dr. ${data.doctorid?.name || "Doctor Name"}'s E OPD`
                            }
                        </td>
                        <td style="padding:12px; font-size:14px; text-align:right;">${data.price || 0}/-</td>
                    </tr>
                    ${isSurgery && data.surgerydetails?.days ? `
                        <tr style="background:white; border-bottom:1px solid #ddd;">
                            <td style="padding:12px; font-size:14px;">2</td>
                            <td style="padding:12px; font-size:14px;">Hospital Stay (${data.surgerydetails.days} days)</td>
                            <td style="padding:12px; font-size:14px; text-align:right;">Included</td>
                        </tr>
                    ` : ''}
                </tbody>
            </table>
        </div>
        
        <!-- TOTAL -->
        <div style="margin:40px 30px; text-align:right;">
            <p style="font-size:16px; margin:5px 0;">Total Amount : <b>${data.totalamount || data.price || 0}/-</b></p>
            <div style="background:#1f2d3d; color:white; padding:12px; border-radius:6px; display:inline-block; width:320px; text-align:center; margin-top:10px;">
                You Paid Amount : <b>${((data.totalamount || data.price || 0) * 0.15).toFixed(2)}/-</b>
            </div>
        </div>
        
        <!-- SIGNATURE -->
        <div style="text-align:right; margin:80px 40px 0 0;">
            <div style="width:200px; border-top:2px solid #999; margin-left:auto; margin-bottom:5px;"></div>
            <p style="margin:2px 0; font-size:14px;">Signature</p>
            <p style="margin:2px 0; font-size:14px;">Dr. ${data.doctorid?.name || "Doctor Name"}</p>
            <p style="margin:2px 0; font-size:14px;">(${data.doctorid?.qualification || "MBBS"}) – ${data.doctorid?.specialty || (isSurgery ? "Surgeon" : "Doctor")}</p>
        </div>
        
        <!-- WATERMARK -->
        <div style="position:absolute; bottom:40px; left:40px; font-size:60px; color:#cfe5f7; font-weight:bold; opacity:0.5;">
            HEALTH EASY EMI
        </div>
    </div>
  `;
}

/**
 * Generate custom invoice with additional details
 * @param {Object} data - The data object
 * @param {Object} customSections - Additional sections to include
 * @param {Object} options - Configuration options
 */
export const generateCustomInvoice = async (data, customSections = {}, options = {}) => {
  let customTemplate = generateHTMLTemplate(data, options.type || 'appointment');
  
  // Add custom sections if provided
  if (customSections.header) {
    customTemplate = customTemplate.replace(
      '<!-- HEADER -->',
      `<!-- HEADER -->${customSections.header}`
    );
  }
  
  if (customSections.footer) {
    customTemplate = customTemplate.replace(
      '<!-- WATERMARK -->',
      `${customSections.footer}<!-- WATERMARK -->`
    );
  }
  
  return generateInvoicePDF(data, { ...options, customTemplate });
};

export default generateInvoicePDF;
