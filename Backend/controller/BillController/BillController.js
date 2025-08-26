const { validationResult, body } = require("express-validator");
const BillModel = require("../../Model/BillModel");

const validateBill = [
  body("department").notEmpty().withMessage("Department is required"),
  body("className").notEmpty().withMessage("Class name is required"),
  body("subject").notEmpty().withMessage("Subject is required"),
  body("semester")
    .isInt({ min: 1, max: 6 })
    .withMessage("Semester must be between 1 and 6"),
  body("programLevel")
    .isIn(["UG", "PG"])
    .withMessage("Program level must be UG or PG"),

  body("examSession").notEmpty().withMessage("Exam session is required"),
  body("examType")
    .isIn(["Theory", "Internal", "External", "Practical", "Department"])
    .withMessage("Invalid exam type"),
  body("paperNo").optional().isString(),

  body("totalStudents").isInt({ min: 0 }),
  body("presentStudents").isInt({ min: 0 }),
  body("absentStudents").optional().isInt({ min: 0 }),
  body("totalBatches").isInt({ min: 1 }),
  body("durationPerBatch").isFloat({ min: 0 }),

  body("batches")
    .isArray({ min: 1 })
    .withMessage("At least one batch is required"),
  body("batches.*.batchNo").notEmpty(),
  body("batches.*.studentsPresent").isInt({ min: 0 }),

  body("staffPayments")
    .isArray({ min: 1 })
    .withMessage("At least one staff role is required"),
  body("staffPayments.*.role").notEmpty(),
  body("staffPayments.*.persons").isArray({ min: 1 }),
  body("staffPayments.*.persons.*.name").notEmpty(),
  body("staffPayments.*.persons.*.rate").notEmpty(),
  body("staffPayments.*.persons.*.totalAmount").isFloat({ min: 0 }),
  body("staffPayments.*.persons.*.mobile")
    .optional()
    .isMobilePhone()
    .withMessage("Invalid mobile number"),

  body("totalAmount").isFloat({ min: 0 }),
  body("balancePayable").isFloat({ min: 0 }),
  body("amountInWords").notEmpty().withMessage("Amount in words required"),

  // Optional: exam timings validation
  body("examStartTime").optional().isISO8601(),
  body("examEndTime")
    .optional()
    .isISO8601()
    .custom((value, { req }) => {
      if (
        req.body.examStartTime &&
        new Date(value) <= new Date(req.body.examStartTime)
      ) {
        throw new Error("Exam end time must be after start time");
      }
      return true;
    }),
];

// Controller functions

// Create new bill
const createBill = async (req, res) => {
  console.log("Req in create Bill");
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Auto-calc absent students if not provided
    const { totalStudents, presentStudents } = req.body;
    const absentStudents =
      req.body.absentStudents ?? totalStudents - presentStudents;

    const bill = new BillModel({
      ...req.body,
      absentStudents,
      userId: req.user?.userId, // keep if you are tracking users
    });

    await bill.save();

    res.status(201).json({
      success: true,
      message: "Bill created successfully",
      data: bill,
    });
  } catch (error) {
    console.error("Error creating bill:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Get all bills
const getBills = async (req, res) => {
  console.log("Req in get Bills");

  try {
    const id = req.user.userId;
    const bills = await BillModel.find({ userId: id }).sort({ createdAt: -1 });
    res.json({ success: true, data: bills });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Get single bill
const getBillById = async (req, res) => {
  console.log("Req in get Bill by id");

  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: "Id is missing" });
    }
    const bill = await BillModel.findById(id);
    if (!bill) {
      return res.status(404).json({ success: false, error: "Bill not found" });
    }
    res.json({ success: true, data: bill });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Update bill
const updateBill = async (req, res) => {
  console.log("Req in update Bill by id");

  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: "Id is missing for update" });
    }

    // Auto-calc absent students on update too
    if (req.body.totalStudents && req.body.presentStudents) {
      req.body.absentStudents =
        req.body.absentStudents ??
        req.body.totalStudents - req.body.presentStudents;
    }

    const bill = await BillModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!bill) {
      return res.status(404).json({ success: false, error: "Bill not found" });
    }

    res.json({
      success: true,
      message: "Bill updated successfully",
      data: bill,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Delete bill
const deleteBill = async (req, res) => {
  console.log("Req in delete Bill by id");

  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: "Id is missing for delete" });
    }
    const bill = await BillModel.findByIdAndDelete(id);
    if (!bill) {
      return res.status(404).json({ success: false, error: "Bill not found" });
    }
    res.json({ success: true, message: "Bill deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server error" });
  }
};

function numberToWords(num) {
  const a = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  const b = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];

  if ((num = num.toString()).length > 9) return "overflow";
  let n = ("000000000" + num)
    .substr(-9)
    .match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return;
  let str = "";
  str +=
    n[1] != 0
      ? (a[Number(n[1])] || b[n[1][0]] + " " + a[n[1][1]]) + " crore "
      : "";
  str +=
    n[2] != 0
      ? (a[Number(n[2])] || b[n[2][0]] + " " + a[n[2][1]]) + " lakh "
      : "";
  str +=
    n[3] != 0
      ? (a[Number(n[3])] || b[n[3][0]] + " " + a[n[3][1]]) + " thousand "
      : "";
  str +=
    n[4] != 0
      ? (a[Number(n[4])] || b[n[4][0]] + " " + a[n[4][1]]) + " hundred "
      : "";
  str +=
    n[5] != 0
      ? (str != "" ? "and " : "") +
        (a[Number(n[5])] || b[n[5][0]] + " " + a[n[5][1]])
      : "";
  return str.trim() + " only";
}
// Delete bill
const downloadBill = async (req, res) => {
  console.log("Req in delete Bill by id");
  let puppeteer, browser;

  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: "Id is missing for delete" });
    }
    // Fetch bill + staff details
    const bill = await BillModel.findById(id).populate(
      "staffPayments.persons"
      //   "staffPayments.persons.personId"
    );
    if (!bill) return res.status(404).send("Bill not found");

    // Example: Use first department/class
    const department = bill.department || "N/A";
    const className = bill.class || "N/A";
    const students = bill.totalStudents || 0;
    const batches = bill.batches?.length || 0;
    const duration = bill.duration || "3 hrs";

    const staffRows = bill.staffPayments
      .flatMap((sp) =>
        sp.persons.map(
          (p) => `
        <tr>
          <td>${sp.role}</td>
          <td>${p.personId?.name || "Unknown"}</td>
          <td>${p.rate} + ${p.extraAllowance || 0}</td>
          <td>${p.totalAmount}</td>
        </tr>
      `
        )
      )
      .join("");

    const totalAmount = bill.totalAmount || 0;
    const amountInWords = numberToWords(totalAmount);

    // Build HTML (using your format)
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Examination Remuneration System</title>
      <style>
        ${/* paste your <style> from your HTML exactly here */ ""}
      </style>
    </head>
    <body>
      <div class="container">
        <header>
          <div class="logo-container">
            <div class="college-logo">MCASC</div>
            <div>
              <h1>Modern College of Arts, Science and Commerce</h1>
              <p>Ganeshkhind, Pune – 411 016</p>
            </div>
          </div>
        </header>

        <div class="tab-content active" id="bill-overview">
          <h2>Practical Examination Report</h2>

          <div class="form-section">
            <h3>Examination Details</h3>
            <p><b>Department:</b> ${department}</p>
            <p><b>Class:</b> ${className}</p>
            <p><b>Total Students:</b> ${students}</p>
            <p><b>Number of Batches:</b> ${batches}</p>
            <p><b>Duration:</b> ${duration}</p>
          </div>

          <div class="form-section">
            <h3>Staff Remuneration Details</h3>
            <table class="remuneration-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Name</th>
                  <th>Rate (₹)</th>
                  <th>Total Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${staffRows}
                <tr>
                  <td colspan="3" style="text-align:right;font-weight:bold;">Total</td>
                  <td style="font-weight:bold;">${totalAmount}</td>
                </tr>
              </tbody>
            </table>
            <p><b>Amount in Words:</b> ${amountInWords}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;

    if (process.env.NODE_ENV === "production") {
      puppeteer = require("puppeteer-core");
      const chromium = require("@sparticuz/chromium");
      browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });
    } else {
      puppeteer = require("puppeteer");
      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox"],
      });
    }

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", right: "20px", bottom: "40px", left: "20px" },
    });

    await browser.close();

    // Stream PDF to client
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="bill_${id}.pdf"`,
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating PDF");
  }
};

module.exports = {
  validateBill,
  createBill,
  getBills,
  getBillById,
  updateBill,
  deleteBill,
  downloadBill,
};
