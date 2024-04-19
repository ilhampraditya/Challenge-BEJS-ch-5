const router = require("express").Router();
const { createTransaction, getAllTransaction, getDetailTransaction } = require("../../controllers/v1/transactionController");

router.post("/transactions", createTransaction);
router.get("/transactions", getAllTransaction);
router.get("/transactions/:id", getDetailTransaction);


module.exports = router;