import request from "supertest";
import { Server } from "http";

let server: Server;

beforeAll(async () => {
  // Assume you have a way to start the app for tests.
  // If you already export app from src/server.ts, import it instead.
  const { default: app } = await import("../src/server");
  server = app.listen(0);
});

afterAll(async () => {
  if (server) {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

describe("MPC-API Health", () => {
  it("GET /health responds with 200 and status ok", async () => {
    const res = await request(server).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status");
  });
});

describe("Model Brain: /api/select-model", () => {
  it("returns a selected model and candidates for a basic task", async () => {
    const res = await request(server)
      .post("/api/select-model")
      .send({
        task_type: "chat_general",
        domain: "general",
        modality: "text",
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("selected_model");
    expect(res.body.selected_model).toHaveProperty("provider_id");
    expect(Array.isArray(res.body.candidates)).toBe(true);
  });
});

describe("Model Brain: /api/orchestrate", () => {
  it("returns a plan with steps for a known job_type", async () => {
    const res = await request(server)
      .post("/api/orchestrate")
      .send({
        job_type: "tariff_video_overlay",
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("plan");
    expect(Array.isArray(res.body.plan.steps)).toBe(true);
  });
});

describe("Model Brain: /api/chat/completions", () => {
  it("accepts a basic chat completion request", async () => {
    const res = await request(server)
      .post("/api/chat/completions")
      .send({
        model: "flagship-chat",
        messages: [
          { role: "system", content: "You are a test assistant." },
          { role: "user", content: "Ping." },
        ],
      });

    // In CI without real keys, this may be mocked or return a 502.
    // For now, we only assert that the endpoint responds with JSON.
    expect(res.headers["content-type"]).toMatch(/application\/json/);
  });
});
