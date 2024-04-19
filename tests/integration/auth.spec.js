const request = require("supertest");
const app = require("../../app");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

let authToken;

beforeAll(async () => {
    await prisma.transaction.deleteMany();
    await prisma.bank_Account.deleteMany();
    await prisma.profile.deleteMany();
    await prisma.user.deleteMany()
});

describe("POST /api/v1/auth/register", () => {
    test("Register a new user", async () => {
        const res = await request(app)
            .post("/api/v1/auth/register")
            .send({
                name: "John Doe",
                email: "john@example.com",
                password: "password123",
                identity_type: "ID",
                identity_number: "123456789",
                address: "123 Main Street",
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.status).toBe(true);
        expect(res.body.message).toBe("success");
        expect(res.body.data).toHaveProperty("id");
        expect(res.body.data.name).toBe("John Doe");
        expect(res.body.data.email).toBe("john@example.com");
        expect(res.body.data.profile).toBeTruthy();
    });

    test("Attempt to register with an existing email", async () => {
        const res = await request(app)
            .post("/api/v1/auth/register")
            .send({
                name: "Jane Doe",
                email: "john@example.com", 
                password: "password123",
                identity_type: "ID",
                identity_number: "987654321",
                address: "456 Elm Street",
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.status).toBe(false);
        expect(res.body.message).toBe("email has already been used!");
    });

    test("Attempt to register with missing input fields", async () => {
        const res = await request(app)
            .post("/api/v1/auth/register")
            .send({
                name: "Missing Fields Test",
            });

        expect(res.statusCode).toBe(401);
        expect(res.body.status).toBe(false);
        expect(res.body.message).toBe("input must be required");
    });
});

describe("POST /api/v1/auth/login", () => {
    test("Login with valid credentials", async () => {
        const res = await request(app)
            .post("/api/v1/auth/login")
            .send({
                email: "john@example.com",
                password: "password123",
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe(true);
        expect(res.body.message).toBe("success");
        expect(res.body.data).toHaveProperty("token");
        authToken = res.body.data.token; 
    });

    test("Attempt to login with invalid credentials", async () => {
        const res = await request(app)
            .post("/api/v1/auth/login")
            .send({
                email: "invalid@example.com",
                password: "invalidpassword",
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.status).toBe(false);
        expect(res.body.message).toBe("invalid email or password");
    });

    test("Attempt to login with missing input fields", async () => {
        const res = await request(app)
            .post("/api/v1/auth/login")
            .send({
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.status).toBe(false);
        expect(res.body.message).toBe("invalid email or password");
    });
});

describe("GET /api/v1/auth/authenticate", () => {
    test("Access authenticated route with valid token", async () => {
        const res = await request(app)
            .get("/api/v1/auth/authenticate")
            .set("Authorization", `Bearer ${authToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe(true);
        expect(res.body.message).toBe("OK");
        expect(res.body.data).toHaveProperty("id");
        expect(res.body.data).toHaveProperty("name");
        expect(res.body.data).toHaveProperty("email");
    });

    test("Attempt to access authenticated route without token", async () => {
        const res = await request(app)
            .get("/api/v1/auth/authenticate");

        expect(res.statusCode).toBe(401);
        expect(res.body.status).toBe(false);
        expect(res.body.message).toBe("Unauthorized");
    });

    test("Attempt to access authenticated route with invalid token", async () => {
        const res = await request(app)
            .get("/api/v1/auth/authenticate")
            .set("Authorization", "Bearer invalidtoken");

        expect(res.statusCode).toBe(400);
        expect(res.body.status).toBe(false);
        expect(res.body.message).toBe("Invalid token");
    });
});