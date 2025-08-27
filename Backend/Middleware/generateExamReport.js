// pdfGenerator.js
const puppeteer = require("puppeteer");

async function generateExamReport() {
  const examReport = {
    society: "Progressive Education Society",
    college: "Modern College of Arts, Science, and Commerce (Autonomous),",
    college2: "Ganeshkhind, Pune - 411016",
    title: "Practical Examination (2024 - 2025)",
    department: "Computer Science",
    class: "T.Y. B.Sc (Comp Sci)",
    students: 80,
    batches: 4,
    duration: "03 hrs",
    batchWise: [20, 20, 20, 20],
    staff: [
      { role: "External Examiner", name: ["Rutuja Molashi", "Prelana Sheela"], rate: "2880+500", total: [3380, 3380] },
      { role: "Internal Examiner", name: ["Rahul Lamble"], rate: "535+500", total: [1035] },
      { role: "Expert Assistant", name: ["Mithila Sathe"], rate: "535+500", total: [1035] },
      { role: "Lab. Assistant", name: ["Ranjana Shintre"], rate: "3120+500", total: [3620] },
      { role: "Store Keeper", name: ["Ashok Sutar"], rate: "1040+500", total: [1540] },
      { role: "Peons", name: ["Rajkumar Hagawane"], rate: "1040+500", total: [1540] }
    ],
    total: 15530,
    amountInWords: "Fifteen thousand five hundred and thirty only",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRiDX-TI_GWDRoSUoutAJU6HDoAwjH9sPY_PUd2yOYyYNdY6g6un5KNinkcCQmHdmuqIPg&usqp=CAU"
  };

  const html = `
  <html>
  <head>
    <style>
      body { 
        font-family: "Times New Roman", serif; 
        margin: 20px; 
        line-height: 1.5; 
      }
      h2, h3 { 
        text-align: center; 
        margin: 10px 0; 
      }
      h3 {
        text-decoration: underline;
        margin-top: 20px;
      }
      table { 
        width: 100%; 
        border-collapse: collapse; 
        margin-top: 15px; 
      }
      table, th, td { 
        border: 1px solid black; 
      }
      th, td { 
        padding: 8px; 
        text-align: center; 
        font-size: 14px; 
      }
      th {
        background-color: #f2f2f2;
      }
      .header { 
        text-align: center; 
        margin-bottom: 20px;
        border-bottom: 2px solid #000;
        padding-bottom: 15px;
      }
      .header img { 
        height: 80px; 
        display: block;
        margin: 0 auto 10px;
      }
      .society { 
        font-size: 18px; 
        font-weight: bold; 
        margin-bottom: 5px;
      }
      .college { 
        font-size: 16px; 
        font-weight: bold; 
        margin: 3px 0;
      }
      .college-address {
        font-size: 14px;
        margin-top: 3px;
      }
      .signature { 
        margin-top: 50px; 
        display: flex; 
        justify-content: space-between; 
      }
      .signature div { 
        text-align: center; 
        width: 30%; 
        border-top: 1px solid black;
        padding-top: 5px;
      }
      .info-section {
        margin: 15px 0;
      }
      .info-section p {
        margin: 8px 0;
      }
      .total-row {
        font-weight: bold;
      }
      .amount-section {
        margin-top: 20px;
        padding: 10px;
        border: 1px solid #ccc;
        background-color: #f9f9f9;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="society">${examReport.society}</div>
      <img src="${examReport.logo}" alt="College Logo" />
      <div class="college">${examReport.college}</div>
      <div class="college-address">${examReport.college2}</div>
    </div>

    <h3>${examReport.title}</h3>
    
    <div class="info-section">
      <p><b>1) Name of the Department:</b> ${examReport.department}</p>
      <p><b>2) Class:</b> ${examReport.class}</p>
      <p><b>3) Total No. of present students:</b> ${examReport.students}</p>
      <p><b>4) Total No. of batches:</b> ${examReport.batches}</p>
      <p><b>5) Duration of practical exam per batch:</b> ${examReport.duration}</p>
    </div>

    <table>
      <tr>
        <th>Batch No</th>
        ${examReport.batchWise.map((_, i) => `<th>${i+1}</th>`).join("")}
        <th>Total</th>
      </tr>
      <tr>
        <td>No. of Students Present</td>
        ${examReport.batchWise.map(b => `<td>${b}</td>`).join("")}
        <td>${examReport.students}</td>
      </tr>
    </table>

    <h3>Statement of Staff Appointed and Remuneration Paid</h3>
    <table>
      <tr>
        <th>Sr. No.</th>
        <th>Particulars</th>
        <th>Name</th>
        <th>Rate (₹)</th>
        <th>Total Amount (₹)</th>
      </tr>
      ${examReport.staff.map((s, index) =>
        s.name.map((n, i) => `
          <tr>
            <td>${i === 0 ? index+1 : ''}</td>
            <td>${i === 0 ? s.role : ''}</td>
            <td>${n}</td>
            <td>${s.rate}</td>
            <td>${s.total[i]}</td>
          </tr>`).join("")
      ).join("")}
      <tr class="total-row">
        <td colspan="4" style="text-align:right;"><b>Total</b></td>
        <td><b>${examReport.total}</b></td>
      </tr>
    </table>

    <div class="amount-section">
      <p><b>Balance Payable:</b> ₹${examReport.total}.00 = ₹${examReport.total}/-</p>
      <p><b>(Amount in words):</b> ${examReport.amountInWords}</p>
    </div>

    <div class="signature">
      <div>In Charge</div>
      <div>Vice Principal</div>
      <div>Principal</div>
    </div>
  </body>
  </html>
  `;

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: "networkidle0" });
  await page.pdf({
    path: "exam-report.pdf",
    format: "A4",
    margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" }
  });

  await browser.close();
  console.log("✅ PDF Generated: exam-report.pdf");
}

generateExamReport();