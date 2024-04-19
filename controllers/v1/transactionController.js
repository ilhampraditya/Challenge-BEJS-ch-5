const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

module.exports = {
    createTransaction: async (req, res, next) => {
        try {
            const { amount, source_account_id, destination_account_id } = req.body
            const sourceAccount = await prisma.bank_Account.findUnique({
                where: { id: source_account_id },
            })
            const destinationAccount = await prisma.bank_Account.findUnique({
                where: { id: destination_account_id },
            })
            if (!sourceAccount || !destinationAccount) {
                if (!sourceAccount) {
                    return res.status(404).json({
                        status: false,
                        message: `Source account with account_id = ${source_account_id} not found`,
                        data: null,
                    })
                } else {
                    return res.status(404).json({
                        status: false,
                        message: `Destination account with account_id = ${destination_account_id} not found`,
                        data: null,
                    })
                }
            }
            if (sourceAccount.balance < amount) {
                return res.status(401).json({
                    status: false,
                    message: "The balance in the source account is insufficient",
                    data: null,
                })
            }
            const transaction = await prisma.transaction.create({
                data: {
                    amount,
                    source_account_id,
                    destination_account_id,
                },
            })
            await prisma.bank_Account.update({
                where: { id: source_account_id },
                data: {
                    balance: {
                        decrement: amount,
                    },
                },
            })
            await prisma.bank_Account.update({
                where: { id: destination_account_id },
                data: {
                    balance: {
                        increment: amount,
                    },
                },
            })
            res.status(201).json({
                status: true,
                message: "Transaction created successfully",
                data: transaction,
            })
        } catch (error) {
            next(error)
        }
    },

    getAllTransaction: async (req, res, next) => {
        try {
            const transaction = await prisma.transaction.findMany()
            res.status(200).json({
                status: true,
                message: "success",
                data: transaction,
            })
        } catch (error) {
            next(error)
        }
    },

    getDetailTransaction: async (req, res, next) => {
        try {
            const id = Number(req.params.id)
            const transaction = await prisma.transaction.findUnique({
                where: { id },
            })

            if (!transaction) {
                return res.status(404).json({
                    status: false,
                    message: `Transaction with id ${id} not found`,
                    data: null,
                })
            }

            res.status(200).json({
                status: true,
                message: "success",
                data: transaction,
            })
        } catch (error) {
            next(error)
        }
    },
}
