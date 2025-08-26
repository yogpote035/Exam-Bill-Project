const { validationResult, body } = require("express-validator");
const BillModel = require("../../Model/BillModel");

// Validation middleware

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
    .isIn(["Theory","Internal", "External", "Practical", "Department"])
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

module.exports = {
  validateBill,
  createBill,
  getBills,
  getBillById,
  updateBill,
  deleteBill,
};
