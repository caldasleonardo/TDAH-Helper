import { users, type User, type InsertUser, quizResults, type QuizResult, type InsertQuizResult } from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private quizResults: Map<number, QuizResult>;
  currentUserId: number;
  currentQuizResultId: number;
  sessionStore: any;

  constructor() {
    this.users = new Map();
    this.quizResults = new Map();
    this.currentUserId = 1;
    this.currentQuizResultId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date();
    // Garantir campos necessários
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt,
      email: insertUser.email || null
    };
    this.users.set(id, user);
    return user;
  }

  async saveQuizResult(insertResult: InsertQuizResult): Promise<QuizResult> {
    const id = this.currentQuizResultId++;
    // Garantir que valores obrigatórios estejam presentes
    const result: QuizResult = { 
      ...insertResult, 
      id,
      // Garantir que a data seja preenchida se não for informada
      date: insertResult.date || new Date(),
      // Garantir que campos opcionais sejam null se não forem informados
      userId: insertResult.userId || null,
      inattentionScore: insertResult.inattentionScore || null,
      hyperactivityScore: insertResult.hyperactivityScore || null,
      impulsivityScore: insertResult.impulsivityScore || null
    };
    this.quizResults.set(id, result);
    return result;
  }

  async getUserQuizResults(userId: number): Promise<QuizResult[]> {
    return Array.from(this.quizResults.values()).filter(
      (result) => result.userId === userId
    );
  }

  async getQuizResultById(id: number): Promise<QuizResult | undefined> {
    return this.quizResults.get(id);
  }
}

export const storage = new MemStorage();
