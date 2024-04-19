const router = require("express").Router();
const { createAccount, getAccount, getAccountDetails, deleteACcount } = require('../../controllers/v1/accountController');


router.post("/accounts", createAccount);
router.get("/accounts", getAccount);
router.get("/accounts/:id", getAccountDetails);
router.delete("/accounts/:id", deleteACcount);

module.exports = router;