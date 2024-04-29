import supertest from "supertest";
import { jest } from "@jest/globals"; // eslint-disable-line

import app from "../../../../src/app" // "../../../src/app.js";


describe("/api/v1/healthcheck", () => {
  test("healthcheck responds successfully", async () => {
    const req = supertest(app);
    const res = await req
      .get("/api/v1/healthcheck")

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.body).toHaveProperty("name");
    expect(res.body).toHaveProperty("message");
  });
});

