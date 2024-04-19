const request = require("supertest");
const app = require("../../app");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

describe("Test Transactions API", () => {
    let sourceAccount;
    let destinationAccount;
    let transaction;

    beforeAll(async () => {
        sourceAccount = await prisma.bank_Account.create({
            data: {
                bank_name: "Test Bank A",
                bank_account_number: "1234567890",
                balance: 100000,
            },
        });

        destinationAccount = await prisma.bank_Account.create({
            data: {
                bank_name: "Test Bank B",
                bank_account_number: "0987654321",
                balance: 50000,
            },
        });

        transaction = await prisma.transaction.create({
            data: {
                amount: 50000,
                source_account_id: sourceAccount.id,
                destination_account_id: destinationAccount.id,
            },
        });
    });

    afterAll(async () => {
        await prisma.transaction.deleteMany();
        await prisma.bank_Account.deleteMany();
        await prisma.$disconnect();
    });

    test("Create Transaction - Success", async () => {
        const transactionData = {
            amount: 50000,
            source_account_id: sourceAccount.id,
            destination_account_id: destinationAccount.id,
        };

        const response = await request(app)
            .post("/api/v1/transactions")
            .send(transactionData)
            .expect(201);

        expect(response.body).toHaveProperty("status", true);
        expect(response.body).toHaveProperty("message", "Transaction created successfully");
        expect(response.body).toHaveProperty("data");
    });

    test("Get All Transactions", async () => {
        const response = await request(app).get("/api/v1/transactions").expect(200);

        expect(response.body).toHaveProperty("status", true);
        expect(response.body).toHaveProperty("message", "success");
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toHaveLength(2);
    });

    test("Get Transaction Details - Success", async () => {
        const response = await request(app)
            .get(`/api/v1/transactions/${transaction.id}`)
            .expect(200);

        expect(response.body).toHaveProperty("status", true);
        expect(response.body).toHaveProperty("message", "success");
        expect(response.body).toHaveProperty("data");
    });

    test("Get Transaction Details - Not Found", async () => {
        const response = await request(app)
            .get("/api/v1/transactions/999999")
            .expect(404);

        expect(response.body).toHaveProperty("status", false);
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toMatch(/Transaction with id 999999 not found/);
        expect(response.body).toHaveProperty("data", null);
    });
});
