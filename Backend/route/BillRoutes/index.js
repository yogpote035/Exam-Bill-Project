const express = require("express");
const router = express.Router();
const billController = require("../../controller/BillController/BillController");
const VerifyToken = require("../../Middleware/VerifyToken");

// Create bill
router.post(
  "/",
  VerifyToken,
  billController.validateBill,
  billController.createBill
);

// Get all bills
router.get("/", VerifyToken, billController.getBills);
router.get("/download/:id", VerifyToken, billController.downloadBill);

// Get single bill
router.get("/:id", VerifyToken, billController.getBillById);

// Update bill
router.put(
  "/:id",
  VerifyToken,
  billController.validateBill,
  billController.updateBill
);

// Delete bill
router.delete("/:id", VerifyToken, billController.deleteBill);

module.exports = router;
