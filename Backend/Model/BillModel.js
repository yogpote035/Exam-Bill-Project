const mongoose = require("mongoose");

const StaffPaymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
    },
    department: { type: String, required: true }, // Computer Science
    className: { type: String, required: true }, // T.Y. B.Sc. (Comp Sci)
    subject: { type: String, required: true }, // Subject name
    semester: { type: Number, enum: [1, 2, 3, 4, 5, 6], required: true },
    programLevel: {
      type: String,
      enum: ["UG", "PG"],
      required: true,
    }, // UG / PG
    examSession: { type: String, required: true }, // "March/April 2025"
    examType: {
      type: String,
      enum: ["Theory", "Internal", "External", "Practical", "Department","Other"],
      required: true,
    },
    paperNo: { type: String }, //  "Paper II"

    // Exam timings
    examStartTime: { type: Date }, // exam starts
    examEndTime: { type: Date }, // exam ends

    // Student
    totalStudents: { type: Number, required: true }, // total students
    presentStudents: { type: Number, required: true }, // total present
    absentStudents: { type: Number, required: true }, // total absent
    totalBatches: { type: Number, required: true },
    durationPerBatch: { type: Number, required: true }, // in hours

    // Batch-wise data
    batches: [
      {
        batchNo: { type: String, required: true },
        studentsPresent: { type: Number, required: true },
      },
    ],

    // Staff Appointed & Remuneration
    staffPayments: [
      {
        role: { type: String, required: true }, // External Examiner
        persons: [
          {
            name: { type: String, required: true },
            mobile: { type: String },
            rate: { type: String, required: true },
            extraAllowance: { type: Number, default: 0 },
            totalAmount: { type: Number, required: true },

            // Presence timing for each staff
            presentTime: {
              inTime: { type: Date },
              outTime: { type: Date },
            },
          },
        ],
      },
    ],

    // Totals
    totalAmount: { type: Number, required: true },
    balancePayable: { type: Number, required: true },
    amountInWords: { type: String, required: true },
  },
  { timestamps: true }
);

const BillModel = mongoose.model("BillModel", StaffPaymentSchema);
module.exports = BillModel;
