import { applications, type InsertApplication, type Application } from "@shared/schema";
import { db } from "./db";

export class DatabaseStorage {
  async createApplication(insertApp: InsertApplication): Promise<Application> {
    const [application] = await db
      .insert(applications)
      .values({
        quoteTweet: insertApp.quoteTweet,
        xUsername: insertApp.xUsername,
        evmAddress: insertApp.evmAddress,
        favoriteSlog: insertApp.favoriteSlog || "Season 1",
      })
      .returning();
    return application;
  }
}

export const storage = new DatabaseStorage();