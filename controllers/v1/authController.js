const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY } = process.env;

module.exports = {
    register: async (req, res, next) => {
        try {
            let { name, email, password, identity_type, identity_number, address } =
                req.body;

            let exist = await prisma.user.findFirst({ where: { email } });

            if (exist) {
                return res.status(400).json({
                    status: false,
                    message: "email has already been used!",
                    data: null,
                });
            }

            if (
                !name ||
                !email ||
                !password ||
                !identity_type ||
                !identity_number ||
                !address
            ) {
                return res.status(401).json({
                    status: false,
                    message: "input must be required",
                    data: null,
                });
            }

            let encryptedPassword = await bcrypt.hash(password, 10);
            let user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: encryptedPassword,
                    profile: {
                        create: { identity_type, identity_number, address },
                    },
                },
                include: {
                    profile: true,
                },
            });
            delete user.password;
            return res.status(201).json({
                status: true,
                message: "success",
                data: user,
            });
        } catch (error) {
            next(error);
        }
    },

    login: async (req, res, next) => {
        try {
            let { email, password } = req.body;
            let user = await prisma.user.findFirst({ where: { email } });
            if (!user) {
                return res.status(400).json({
                    status: false,
                    message: "invalid email or password",
                    data: null,
                });
            }

            let isPasswordCorrect = await bcrypt.compare(password, user.password);
            if (!isPasswordCorrect) {
                return res.status(400).json({
                    status: false,
                    message: "invalid email or password",
                    data: null,
                });
            }

            delete user.password;
            let token = jwt.sign(user, JWT_SECRET_KEY);

            return res.status(200).json({
                status: true,
                message: "success",
                data: { ...user, token },
            });
        } catch (error) {
            next(error);
        }
    },

    auth: async (req, res, next) => {
        try {
            return res.status(200).json({
                status: true,
                message: "OK",
                data: req.user,
            });
        } catch (error) {
            next(error);
        }
    },
};