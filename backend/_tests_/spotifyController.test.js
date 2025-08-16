const request = require("supertest");
const app = require("../app");

describe("Spotify Auth Routes", () => {
  test("GET /auth/login should redirect to Spotify authorize endpoint", async () => {
    const res = await request(app).get("/api/auth/login");

    expect(res.status).toBe(302); // redirect
    expect(res.headers.location).toContain(
      "https://accounts.spotify.com/authorize"
    );
  });

  test("GET /auth/callback without code should fail", async () => {
    const res = await request(app).get("/api/auth/callback");

    expect(res.status).toBe(400); // because no code provided
    expect(res.body).toHaveProperty("error");
  });
});
