const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

module.exports = {
    createAccount: async (req, res, next) => {
        try {
            const { bank_name, bank_account_number, balance, user_id } = req.body
            if (!bank_name || !bank_account_number) {
                return res.status(400).json({
                    status: false,
                    message: "Input must be required",
                    data: null,
                })
            } else if (!balance || balance < 50000) {
                return res.status(400).json({
                    status: false,
                    message: "Balance must be at least 50000",
                    data: null,
                })
            } else if (!user_id || user_id === 0) {
                return res.status(400).json({
                    status: false,
                    message: "User_id must be required and more than 0",
                    data: null,
                })
            }
            const exist = await prisma.user.findUnique({
                where: { id: user_id },
            })

            if (!exist) {
                return res.status(404).json({
                    status: false,
                    message: `User with id ${user_id} not found`,
                    data: null,
                })
            }

            const account = await prisma.bank_Account.create({
                data: {
                    bank_name,
                    bank_account_number,
                    balance,
                    User: { connect: { id: user_id } },
                },
                include: {
                    User: true,
                },
            })

            res.status(201).json({
                status: true,
                message: "success",
                data: account,
            })
        } catch (error) {
            next(error)
        }
    },

    getAccount: async (req, res, next) => {
        try {
            const account = await prisma.bank_Account.findMany()
            res.status(200).json({
                status: true,
                message: "success",
                data: account,
            })
        } catch (error) {
            next(error)
        }
    },

    getAccountDetails: async (req, res, next) => {
        try {
            const id = Number(req.params.id)
            const account = await prisma.bank_Account.findUnique({
                where: { id },
            })
            if (!account) {
                return res.status(404).json({
                    status: false,
                    message: `Account with id ${id} not found`,
                    data: null,
                })
            }
            res.status(200).json({
                status: true,
                message: "success",
                data: account,
            })
        } catch (error) {
            next(error)
        }
    },

    deleteACcount: async (req, res, next) => {
        try {
            const id = Number(req.params.id)
            const account = await prisma.bank_Account.findUnique({
                where: { id },
            })
            if (!account) {
                res.status(404).json({
                    status: false,
                    message: `Account with id ${id} not found`,
                    data: null,
                })
            }
            await prisma.bank_Account.delete({
                where: { id },
            })
            res.status(200).json({
                status: true,
                message: "Account deleted successfully",
                data: null,
            })
        } catch (error) {
            next(error)
        }
    },
}
