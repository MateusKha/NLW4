import request from "supertest";
import { getConnection } from "typeorm";
import { app } from "../app";

import createConnection from "../database";

describe("Surveys", () => {
  beforeAll(async () => {
    const connection = await createConnection();
    await connection.runMigrations();
  });

  it("Should be albe to create a new suervey", async () => {
    beforeAll(async () => {
      const connection = await createConnection();
      await connection.runMigrations();
    });

    afterAll(async () => {
      const connection = getConnection();
      await connection.dropDatabase();
      await connection.close();
    });
    const response = await request(app).post("/surveys").send({
      title: "Title Example",
      description: "Description Exameple",
    });

    expect(response.body).toHaveProperty("id");
  });

  it("Should be able to get all surveys", async () => {
    await request(app).post("/surveys").send({
      title: "Title Example2",
      description: "Description Exameple2",
    });
    const response = await request(app).get("/surveys");

    expect(response.body.length).toBe(2);
  });
});
