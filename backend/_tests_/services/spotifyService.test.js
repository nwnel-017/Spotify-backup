const request = require("supertest");
const app = require("../../app");
jest.mock("axios"); // mock first
const axios = require("axios");
const spotifyService = require("../../services/spotifyService"); // ✅ import the service
jest.mock("../../services/spotifyService");

describe("Authentication Tests", () => {
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

  test("should set HTTP-only cookies and redirect to frontend", async () => {
    // Mock Spotify service response
    spotifyService.exchangeCodeForToken.mockResolvedValue({
      data: {
        access_token: "fake-access-token",
        refresh_token: "fake-refresh-token",
        expires_in: 3600,
      },
    });

    const res = await request(app).get("/api/auth/callback?code=12345");

    // Expect redirect
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("http://localhost:3000/home");

    // Expect cookies to be set
    const setCookie = res.headers["set-cookie"];
    expect(setCookie).toEqual(
      expect.arrayContaining([
        expect.stringContaining("spotify_access_token=fake-access-token"),
        expect.stringContaining("HttpOnly"),
        expect.stringContaining("spotify_refresh_token=fake-refresh-token"),
      ])
    );

    // Ensure Spotify service was called correctly
    expect(spotifyService.exchangeCodeForToken).toHaveBeenCalledWith(
      "12345",
      process.env.REDIRECT_URI
    );
  });
});
