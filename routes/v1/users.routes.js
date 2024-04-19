const router = require("express").Router();
const { registerUser, getUser, getUserDetail, editUser, deleteUser } = require('../../controllers/v1/userController');


router.post("/users", registerUser);
router.get("/users", getUser);
router.get("/users/:id", getUserDetail);
router.put("/users/:id", editUser);
router.delete("/users/:id", deleteUser);

module.exports = router;