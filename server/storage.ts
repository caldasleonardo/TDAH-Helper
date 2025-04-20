import { users, type User, type InsertUser, quizResults, type QuizResult, type InsertQuizResult } from "@shared/schema";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { db } from "./db";
import { pool } from "./db";
import { eq, desc } from "drizzle-orm";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Quiz results management
  saveQuizResult(result: InsertQuizResult): Promise<QuizResult>;
  getUserQuizResults(userId: number): Promise<QuizResult[]>;
  getQuizResultById(id: number): Promise<QuizResult | undefined>;
  
  // Session store
  sessionStore: any; // Usando "any" para evitar erros de tipo com session.SessionStore
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Garantir que o email seja null se não fornecido
    const userWithDefaults = {
      ...insertUser,
      email: insertUser.email || null
    };
    
    const [user] = await db
      .insert(users)
      .values(userWithDefaults)
      .returning();
    
    return user;
  }

  async saveQuizResult(insertResult: InsertQuizResult): Promise<QuizResult> {
    // Garantir que valores opcionais sejam null se não informados
    const resultWithDefaults = {
      ...insertResult,
      date: insertResult.date || new Date(),
      userId: insertResult.userId || null,
      inattentionScore: insertResult.inattentionScore || null,
      hyperactivityScore: insertResult.hyperactivityScore || null,
      impulsivityScore: insertResult.impulsivityScore || null
    };
    
    const [result] = await db
      .insert(quizResults)
      .values(resultWithDefaults)
      .returning();
    
    return result;
  }

  async getUserQuizResults(userId: number): Promise<QuizResult[]> {
    return await db
      .select()
      .from(quizResults)
      .where(eq(quizResults.userId, userId))
      .orderBy(desc(quizResults.date));
  }

  async getQuizResultById(id: number): Promise<QuizResult | undefined> {
    const [result] = await db
      .select()
      .from(quizResults)
      .where(eq(quizResults.id, id));
    
    return result || undefined;
  }
}

export const storage = new DatabaseStorage();
