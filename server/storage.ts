import { db } from "./db";
import { applications, type InsertApplication, type Application } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  createApplication(app: InsertApplication): Promise<Application>;
  getApplicationByAddress(address: string): Promise<Application | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createApplication(app: InsertApplication): Promise<Application> {
    const [application] = await db.insert(applications).values(app).returning();
    return application;
  }

  async getApplicationByAddress(address: string): Promise<Application | undefined> {
    const [application] = await db.select().from(applications).where(eq(applications.evmAddress, address));
    return application;
  }
}

export const storage = new DatabaseStorage();
