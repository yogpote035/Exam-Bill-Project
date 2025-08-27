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
// bank detail form
router.get(
  "/download/bank-detail-form",
  VerifyToken,
  billController.downloadBankDetailForm
);
router.get("/download/:id", VerifyToken, billController.downloadBill);
router.get(
  "/download/personalBill/:id",
  VerifyToken,
  billController.downloadPersonalBills
);

// mail personal bill
router.get(
  "/mail/personalBill/:id",
  VerifyToken,
  billController.mailPersonalBillsSelf
);
router.post(
  "/mail/personalBill/other/:id",
  VerifyToken,
  billController.mailPersonalBillsOther
);
// mail main bill
router.get("/mail/mainBill/:id", VerifyToken, billController.mailMainBillSelf);
router.post(
  "/mail/mainBill/other/:id",
  VerifyToken,
  billController.mailMainBillOther
);

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
