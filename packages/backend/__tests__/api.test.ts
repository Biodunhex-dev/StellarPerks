import request from "supertest";
import app from "../src/index";

const HEADERS = { "x-api-key": "dev-key" };

describe("GET /health", () => {
  it("returns ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

describe("Businesses API", () => {
  it("creates a business", async () => {
    const res = await request(app)
      .post("/api/businesses")
      .set(HEADERS)
      .send({ name: "Acme Corp", email: "acme@example.com" });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Acme Corp");
    expect(res.body.publicKey).toMatch(/^G/);
    expect(res.body.id).toBeDefined();
  });

  it("rejects missing fields", async () => {
    const res = await request(app)
      .post("/api/businesses")
      .set(HEADERS)
      .send({ name: "No Email" });
    expect(res.status).toBe(400);
  });

  it("lists businesses", async () => {
    const res = await request(app).get("/api/businesses").set(HEADERS);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("returns 401 without API key", async () => {
    const res = await request(app).get("/api/businesses");
    expect(res.status).toBe(401);
  });
});

describe("Users API", () => {
  it("creates a user", async () => {
    const res = await request(app)
      .post("/api/users")
      .set(HEADERS)
      .send({ email: "user@example.com" });
    expect(res.status).toBe(201);
    expect(res.body.email).toBe("user@example.com");
    expect(res.body.publicKey).toMatch(/^G/);
  });

  it("rejects missing email", async () => {
    const res = await request(app).post("/api/users").set(HEADERS).send({});
    expect(res.status).toBe(400);
  });
});

describe("Events API", () => {
  it("tracks an issue event", async () => {
    const res = await request(app)
      .post("/api/events")
      .set(HEADERS)
      .send({ programId: "prog1", userPublicKey: "GABC", action: "issue", points: 100 });
    expect(res.status).toBe(201);
    expect(res.body.action).toBe("issue");
    expect(res.body.points).toBe(100);
  });

  it("tracks a redeem event", async () => {
    const res = await request(app)
      .post("/api/events")
      .set(HEADERS)
      .send({ programId: "prog1", userPublicKey: "GABC", action: "redeem", points: 50 });
    expect(res.status).toBe(201);
    expect(res.body.action).toBe("redeem");
  });

  it("rejects invalid action", async () => {
    const res = await request(app)
      .post("/api/events")
      .set(HEADERS)
      .send({ programId: "prog1", userPublicKey: "GABC", action: "transfer", points: 10 });
    expect(res.status).toBe(400);
  });

  it("returns analytics", async () => {
    const res = await request(app).get("/api/events/analytics").set(HEADERS);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("totalIssued");
    expect(res.body).toHaveProperty("totalRedeemed");
    expect(res.body).toHaveProperty("outstanding");
  });

  it("filters analytics by programId", async () => {
    const res = await request(app)
      .get("/api/events/analytics?programId=prog1")
      .set(HEADERS);
    expect(res.status).toBe(200);
    expect(res.body.totalIssued).toBeGreaterThanOrEqual(100);
  });
});
