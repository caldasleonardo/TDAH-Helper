import { 
  users, type User, type InsertUser, 
  quizResults, type QuizResult, type InsertQuizResult,
  subscriptions, type Subscription, type InsertSubscription,
  premiumFeatures, type PremiumFeature,
  userPremiumFeatures
} from "@shared/schema";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { db } from "./db";
import { pool } from "./db";
import { eq, desc, and, lte, gte, or, inArray } from "drizzle-orm";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserFirebaseUid(userId: number, firebaseUid: string): Promise<User>;
  updateUserStripeInfo(userId: number, stripeInfo: { stripeCustomerId: string, isPremium?: boolean }): Promise<User>;
  
  // Quiz results management
  saveQuizResult(result: InsertQuizResult): Promise<QuizResult>;
  getUserQuizResults(userId: number): Promise<QuizResult[]>;
  getQuizResultById(id: number): Promise<QuizResult | undefined>;
  updateQuizResultPayment(id: number, paymentIntentId: string, paid: boolean): Promise<QuizResult>;
  
  // Subscription management
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  getUserSubscription(userId: number): Promise<Subscription | undefined>;
  getActiveSubscription(userId: number): Promise<Subscription | undefined>;
  updateSubscriptionStatus(id: number, status: string, canceledAt?: Date): Promise<Subscription>;
  
  // Premium features management
  getAllPremiumFeatures(): Promise<PremiumFeature[]>;
  getActivePremiumFeatures(): Promise<PremiumFeature[]>;
  getUserPremiumFeatures(userId: number): Promise<PremiumFeature[]>;
  addUserPremiumFeature(userId: number, featureId: number, expiresAt?: Date): Promise<boolean>;
  
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
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }
  
  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Garantir que o email seja null se não fornecido
    const userWithDefaults = {
      ...insertUser,
      email: insertUser.email || null,
      firebaseUid: insertUser.firebaseUid || null
    };
    
    const [user] = await db
      .insert(users)
      .values(userWithDefaults)
      .returning();
    
    return user;
  }
  
  async updateUserFirebaseUid(userId: number, firebaseUid: string): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ firebaseUid })
      .where(eq(users.id, userId))
      .returning();
      
    return updatedUser;
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
  
  async updateQuizResultPayment(id: number, paymentIntentId: string, paid: boolean): Promise<QuizResult> {
    const [updatedResult] = await db
      .update(quizResults)
      .set({ 
        premiumPaid: paid, 
        paymentIntentId 
      })
      .where(eq(quizResults.id, id))
      .returning();
      
    return updatedResult;
  }
  
  async updateUserStripeInfo(userId: number, stripeInfo: { stripeCustomerId: string, isPremium?: boolean }): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ 
        stripeCustomerId: stripeInfo.stripeCustomerId,
        isPremium: stripeInfo.isPremium !== undefined ? stripeInfo.isPremium : false
      })
      .where(eq(users.id, userId))
      .returning();
      
    return updatedUser;
  }
  
  // Subscription methods
  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [newSubscription] = await db
      .insert(subscriptions)
      .values(subscription)
      .returning();
    
    // Ao criar uma assinatura, também marcamos o usuário como premium
    await this.updateUserStripeInfo(subscription.userId, { 
      stripeCustomerId: subscription.stripeSubscriptionId.split('_')[0], // Usually customer ID is the prefix of subscription ID
      isPremium: true 
    });
    
    return newSubscription;
  }
  
  async getUserSubscription(userId: number): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.createdAt));
    
    return subscription;
  }
  
  async getActiveSubscription(userId: number): Promise<Subscription | undefined> {
    const now = new Date();
    
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, "active"),
          lte(subscriptions.currentPeriodStart, now),
          gte(subscriptions.currentPeriodEnd, now)
        )
      )
      .orderBy(desc(subscriptions.createdAt));
    
    return subscription;
  }
  
  async updateSubscriptionStatus(id: number, status: string, canceledAt?: Date): Promise<Subscription> {
    const updateData: any = { status };
    
    if (canceledAt) {
      updateData.canceledAt = canceledAt;
    }
    
    const [updatedSubscription] = await db
      .update(subscriptions)
      .set(updateData)
      .where(eq(subscriptions.id, id))
      .returning();
    
    // Se a assinatura foi cancelada, atualizar o status premium do usuário
    if (status === "canceled") {
      await this.updateUserStripeInfo(updatedSubscription.userId, { 
        stripeCustomerId: updatedSubscription.stripeSubscriptionId.split('_')[0],
        isPremium: false 
      });
    }
    
    return updatedSubscription;
  }
  
  // Premium features methods
  async getAllPremiumFeatures(): Promise<PremiumFeature[]> {
    return await db
      .select()
      .from(premiumFeatures);
  }
  
  async getActivePremiumFeatures(): Promise<PremiumFeature[]> {
    return await db
      .select()
      .from(premiumFeatures)
      .where(eq(premiumFeatures.isActive, true));
  }
  
  async getUserPremiumFeatures(userId: number): Promise<PremiumFeature[]> {
    const now = new Date();
    
    // Consultar a tabela de junção com features premium do usuário
    const userFeaturesJoin = await db
      .select()
      .from(userPremiumFeatures)
      .where(
        and(
          eq(userPremiumFeatures.userId, userId),
          eq(userPremiumFeatures.isActive, true)
        )
      );
    
    // Filtramos os resultados que estão expirados
    const validFeatureIds = userFeaturesJoin
      .filter(uf => !uf.expiresAt || new Date(uf.expiresAt) >= now)
      .map(uf => uf.featureId);
    
    if (validFeatureIds.length === 0) {
      return [];
    }
    
    // Obter detalhes das features premium ativas
    // Usar Promise.all para fazer várias consultas se necessário
    const features = await Promise.all(
      validFeatureIds.map(async (featureId) => {
        const [feature] = await db
          .select()
          .from(premiumFeatures)
          .where(
            and(
              eq(premiumFeatures.id, featureId),
              eq(premiumFeatures.isActive, true)
            )
          );
        return feature;
      })
    );
    
    // Filtrar qualquer resultado undefined (caso alguma feature tenha sido desativada)
    const validFeatures = features.filter(Boolean);
    
    return validFeatures;
  }
  
  async addUserPremiumFeature(userId: number, featureId: number, expiresAt?: Date): Promise<boolean> {
    try {
      await db
        .insert(userPremiumFeatures)
        .values({
          userId,
          featureId,
          expiresAt: expiresAt || null,
          isActive: true
        });
      
      return true;
    } catch (error) {
      console.error("Erro ao adicionar feature premium ao usuário:", error);
      return false;
    }
  }
}

export const storage = new DatabaseStorage();
