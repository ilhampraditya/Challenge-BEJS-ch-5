const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const app = require("../../app");
const request = require("supertest");
let account = {};


describe("Test POST /api/v1/accounts endpoint", () => {
    beforeAll(async () => {
        await prisma.bank_Account.deleteMany();
        await prisma.profile.deleteMany();
        await prisma.user.deleteMany();
    });

    test("Test create account -> success", async () => {
        try {
            const user = await prisma.user.create({
                data: {
                    name: "John Doe",
                    email: "john.doe@example.com",
                    password: "password",
                    profile: {
                        create: {
                            identity_type: "KTP",
                            identity_number: "123456789",
                            address: "123 Street, City",
                        },
                    },
                },
            });

            const { statusCode, body } = await request(app)
                .post("/api/v1/accounts")
                .send({
                    bank_name: "Bank A",
                    bank_account_number: "1234567890",
                    balance: 60000,
                    user_id: user.id,
                });

            account = body.data;

            expect(statusCode).toBe(201);
            expect(body).toHaveProperty("status");
            expect(body).toHaveProperty("message");
            expect(body).toHaveProperty("data");
            expect(body.data).toHaveProperty("id");
            expect(body.data).toHaveProperty("bank_name");
            expect(body.data).toHaveProperty("bank_account_number");
            expect(body.data).toHaveProperty("balance");
            expect(body.data).toHaveProperty("User");
        } catch (error) {
            throw error;
        }
    });

    test("Test create account -> error (missing required input)", async () => {
        try {
            const { statusCode, body } = await request(app)
                .post("/api/v1/accounts")
                .send({
                    bank_name: "Bank B",
                });

            expect(statusCode).toBe(400);
            expect(body).toHaveProperty("status");
            expect(body).toHaveProperty("message");
            expect(body).toHaveProperty("data");
        } catch (error) {
            throw error;
        }
    });


});

describe("Test GET /api/v1/accounts endpoint", () => {
    test("Test getting all accounts", async () => {
        try {
            const response = await request(app).get("/api/v1/accounts");

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("status", true);
            expect(response.body).toHaveProperty("message", "success");
            expect(response.body.data).toBeInstanceOf(Array);
        } catch (error) {
            throw error;
        }
    });
});

describe("Test GET /api/v1/accounts/:id endpoint", () => {
    test("Test get account details by id -> success", async () => {
        try {
            const { statusCode, body } = await request(app).get(`/api/v1/accounts/${account.id}`);
            expect(statusCode).toBe(200);
            expect(body).toHaveProperty("status");
            expect(body).toHaveProperty("message");
            expect(body).toHaveProperty("data");
        } catch (error) {
            throw error;
        }
    });

    test("Test get account details by id -> error (not found)", async () => {
        try {
            const { statusCode, body } = await request(app).get(`/api/v1/accounts/${account.id + 100}`);
            expect(statusCode).toBe(404);
            expect(body).toHaveProperty("status");
            expect(body).toHaveProperty("message");
            expect(body).toHaveProperty("data");
        } catch (error) {
            throw error;
        }
    });


});

describe("Test DELETE /api/v1/accounts/:id endpoint", () => {
    test("Test delete account by id -> success", async () => {
        try {
            const { statusCode, body } = await request(app).delete(`/api/v1/accounts/${account.id}`);
            expect(statusCode).toBe(200);
            expect(body).toHaveProperty("status");
            expect(body).toHaveProperty("message");
        } catch (error) {
            throw error;
        }
    });

    test("Test delete account by id -> error (not found)", async () => {
        try {
            const { statusCode, body } = await request(app).delete(`/api/v1/accounts/${account.id + 100}`);
            expect(statusCode).toBe(404);
            expect(body).toHaveProperty("status");
            expect(body).toHaveProperty("message");
            expect(body).toHaveProperty("data");
        } catch (error) {
            throw error;
        }
    });

});
