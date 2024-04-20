const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
const bcrypt = require("bcrypt");

module.exports = {
    registerUser: async (req, res, next) => {
        try {
            const { name, email, password, identity_type, identity_number, address } =
                req.body

            const exist = await prisma.user.findFirst({
                where: { email },
            })

            if (
                !name ||
                !email ||
                !password ||
                !identity_type ||
                !identity_number ||
                !address
            ) {
                return res.status(400).json({
                    status: false,
                    message: "Input must be required",
                    data: null,
                })
            } else if (exist) {
                return res.status(400).json({
                    status: false,
                    message: "email already used!",
                })
            }

            let encryptedPassword = await bcrypt.hash(password, 10);
            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: encryptedPassword,
                    profile: {
                        create: {
                            identity_type,
                            identity_number,
                            address,
                        },
                    },
                },
                include: {
                    profile: true,
                },
            })
            delete user.password;

            res.status(201).json({
                status: true,
                message: "success",
                data: user,
            })
        } catch (error) {
            next(error)
        }
    },

    getUser: async (req, res, next) => {
        try {
            const user = await prisma.user.findMany()
            user.forEach(user => {
                delete user.password;
            });
            res.status(200).json({
                status: true,
                message: "success",
                data: user,
            })
        } catch (error) {
            next(error)
        }
    },

    getUserDetail: async (req, res, next) => {
        try {
            const id = Number(req.params.id)
            const user = await prisma.user.findUnique({
                where: { id },
                include: {
                    profile: true,
                },
            })

            if (!user) {
                return res.status(404).json({
                    status: false,
                    message: `User with id ${id} not found`,
                    data: null,
                })
            }
            delete user.password;
            res.status(200).json({
                status: true,
                message: "success",
                data: user,
            })
        } catch (error) {
            next(error)
        }
    },

    editUser: async (req, res, next) => {
        const id = Number(req.params.id)
        try {
            const { name, email, password, identity_type, identity_number, address } =
                req.body

            // Pemeriksaan untuk memastikan setidaknya satu data yang diberikan
            if (
                !name &&
                !email &&
                !password &&
                !identity_type &&
                !identity_number &&
                !address
            ) {
                return res.status(400).json({
                    status: false,
                    message: "At least one data must be provided for update",
                    data: null,
                })
            }

            const exist = await prisma.user.findUnique({
                where: { id },
            })

            if (!exist) {
                return res.status(404).json({
                    status: false,
                    message: `User with id ${id} not found`,
                    data: null,
                })
            }

            const user = await prisma.user.update({
                where: { id },
                data: {
                    name,
                    email,
                    password,
                    profile: {
                        update: {
                            identity_type: identity_type || undefined,
                            identity_number: identity_number || undefined,
                            address: address || undefined,
                        },
                    },
                },
                include: {
                    profile: true,
                },
            })
            
            delete user.password;
            res.status(200).json({
                status: true,
                message: "User updated successfully",
                data: user,
            })
        } catch (error) {
            next(error)
        }
    },

    deleteUser: async (req, res, next) => {
        const id = Number(req.params.id)
        try {
            const exist = await prisma.user.findUnique({
                where: { id },
            })

            if (!exist) {
                return res.status(404).json({
                    status: false,
                    message: `User with id ${id} not found`,
                    data: null,
                })
            }

            await prisma.profile.deleteMany({
                where: { user_id: id },
            })

            await prisma.user.delete({
                where: { id },
            })

            res.status(200).json({
                status: true,
                message: "User deleted successfully",
                data: null,
            })

        } catch (error) {
            next(error)
        }
    },
}
