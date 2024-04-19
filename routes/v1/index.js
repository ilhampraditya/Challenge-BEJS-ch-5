const router = require("express").Router();
const swaggerUI = require("swagger-ui-express");
const YAML = require("yaml");
const fs = require("fs");
const path = require("path");

const User = require("./users.routes")
const Account = require("./accounts.routes")
const Transaction = require("./transactions.routes")
const Auth = require("./auth.routes")

const swagger_path = path.resolve(__dirname, "../../api-docs.yaml");
const file = fs.readFileSync(swagger_path, "utf-8");

// API Docs
const swaggerDocument = YAML.parse(file);
router.use("/api/v1/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

// API
router.use("/api/v1", User)
router.use("/api/v1", Account)
router.use("/api/v1", Transaction)
router.use("/api/v1", Auth)

module.exports = router;
