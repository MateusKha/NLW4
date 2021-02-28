import request from "supertest";
import { getConnection } from "typeorm";
import { app } from "../app";

import createConnection from "../database";

describe("Users", () => {
  beforeAll(async () => {
    const connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    const connection = getConnection();
    await connection.dropDatabase();
    await connection.close();
  });
  it("Should be albe to create a new user", async () => {
    const response = await request(app).post("/users").send({
      email: "user@Exameple.com",
      name: "User Exameple",
    });

    expect(response.status).toBe(201);
  });

  it("Should be albe to create a new user", async () => {
    const response = await request(app).post("/users").send({
      email: "user@Exameple.com",
      name: "User Exameple",
    });

    expect(response.status).toBe(400);
  });
});
