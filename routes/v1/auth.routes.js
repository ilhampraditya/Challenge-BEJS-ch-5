const router = require("express").Router();
const { register, login, auth } = require("../../controllers/v1/authController");
const restrict = require('../../middlewares/auth.middlewares')


router.post("/auth/register", register);
router.post("/auth/login", login);
router.get('/auth/authenticate', restrict, auth)

module.exports = router;