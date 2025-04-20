import { 
  users, type User, type InsertUser, 
  quizResults, type QuizResult, type InsertQuizResult,
  subscriptions, type Subscription, type InsertSubscription,
  premiumFeatures, type PremiumFeature,
  userPremiumFeatures,
  adminUsers, type AdminUser, type InsertAdminUser,
  appConfig, type AppConfig, type InsertAppConfig,
  content, type Content, type InsertContent,
  media, type Media, type InsertMedia,
  auditLog, type AuditLog, type InsertAuditLog,
  moodTracking, type MoodTracking, type InsertMoodTracking
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
  
  // Admin user management
  getAdminUser(id: number): Promise<AdminUser | undefined>;
  getAdminUserByUsername(username: string): Promise<AdminUser | undefined>;
  createAdminUser(admin: InsertAdminUser): Promise<AdminUser>;
  updateAdminUserLastLogin(id: number): Promise<AdminUser>;
  getAllAdminUsers(): Promise<AdminUser[]>;
  
  // App configuration management
  getAppConfig(key: string): Promise<AppConfig | undefined>;
  getAppConfigsByCategory(category: string): Promise<AppConfig[]>;
  getAllAppConfigs(): Promise<AppConfig[]>;
  setAppConfig(config: InsertAppConfig): Promise<AppConfig>;
  updateAppConfig(id: number, value: string, updatedBy: number): Promise<AppConfig>;
  deleteAppConfig(id: number): Promise<boolean>;
  
  // Content management
  getContent(id: number): Promise<Content | undefined>;
  getContentBySlug(slug: string): Promise<Content | undefined>;
  getContentsByCategory(category: string): Promise<Content[]>;
  getAllContents(includeUnpublished?: boolean): Promise<Content[]>;
  createContent(content: InsertContent): Promise<Content>;
  updateContent(id: number, data: Partial<InsertContent>): Promise<Content>;
  deleteContent(id: number): Promise<boolean>;
  
  // Media management
  getMedia(id: number): Promise<Media | undefined>;
  getMediaByCategory(category: string): Promise<Media[]>;
  getAllMedia(): Promise<Media[]>;
  createMedia(media: InsertMedia): Promise<Media>;
  deleteMedia(id: number): Promise<boolean>;
  
  // Mood tracking management
  saveMoodTracking(moodData: InsertMoodTracking): Promise<MoodTracking>;
  getUserMoodTrackings(userId: number, options?: { 
    startDate?: Date, 
    endDate?: Date, 
    limit?: number 
  }): Promise<MoodTracking[]>;
  getMoodTrackingById(id: number): Promise<MoodTracking | undefined>;
  deleteMoodTracking(id: number): Promise<boolean>;
  getMoodTrackingStats(userId: number, period: 'day' | 'week' | 'month' | 'year'): Promise<any>;
  
  // Audit logging
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(options?: { 
    userId?: number, 
    action?: string, 
    entity?: string, 
    fromDate?: Date, 
    toDate?: Date,
    limit?: number
  }): Promise<AuditLog[]>;
  
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

  // Admin user management methods
  async getAdminUser(id: number): Promise<AdminUser | undefined> {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return admin || undefined;
  }

  async getAdminUserByUsername(username: string): Promise<AdminUser | undefined> {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.username, username));
    return admin || undefined;
  }

  async createAdminUser(insertAdmin: InsertAdminUser): Promise<AdminUser> {
    const [admin] = await db
      .insert(adminUsers)
      .values(insertAdmin)
      .returning();
    
    return admin;
  }

  async updateAdminUserLastLogin(id: number): Promise<AdminUser> {
    const [admin] = await db
      .update(adminUsers)
      .set({ lastLogin: new Date() })
      .where(eq(adminUsers.id, id))
      .returning();
      
    return admin;
  }

  async getAllAdminUsers(): Promise<AdminUser[]> {
    return await db
      .select()
      .from(adminUsers)
      .orderBy(adminUsers.username);
  }

  // App configuration management methods
  async getAppConfig(key: string): Promise<AppConfig | undefined> {
    const [config] = await db.select().from(appConfig).where(eq(appConfig.key, key));
    return config || undefined;
  }

  async getAppConfigsByCategory(category: string): Promise<AppConfig[]> {
    return await db
      .select()
      .from(appConfig)
      .where(eq(appConfig.category, category))
      .orderBy(appConfig.key);
  }

  async getAllAppConfigs(): Promise<AppConfig[]> {
    return await db
      .select()
      .from(appConfig)
      .orderBy([appConfig.category, appConfig.key]);
  }

  async setAppConfig(config: InsertAppConfig): Promise<AppConfig> {
    // Verifica se já existe uma configuração com a mesma chave
    const existingConfig = await this.getAppConfig(config.key);
    
    if (existingConfig) {
      // Se existir, atualiza o valor
      const [updatedConfig] = await db
        .update(appConfig)
        .set({ 
          value: config.value,
          updatedAt: new Date(),
          updatedBy: config.updatedBy
        })
        .where(eq(appConfig.id, existingConfig.id))
        .returning();
        
      return updatedConfig;
    } else {
      // Se não existir, cria uma nova configuração
      const [newConfig] = await db
        .insert(appConfig)
        .values(config)
        .returning();
        
      return newConfig;
    }
  }

  async updateAppConfig(id: number, value: string, updatedBy: number): Promise<AppConfig> {
    const [config] = await db
      .update(appConfig)
      .set({ 
        value, 
        updatedAt: new Date(), 
        updatedBy 
      })
      .where(eq(appConfig.id, id))
      .returning();
      
    return config;
  }

  async deleteAppConfig(id: number): Promise<boolean> {
    try {
      await db
        .delete(appConfig)
        .where(eq(appConfig.id, id));
      
      return true;
    } catch (error) {
      console.error("Erro ao excluir configuração:", error);
      return false;
    }
  }

  // Content management methods
  async getContent(id: number): Promise<Content | undefined> {
    const [content] = await db.select().from(content).where(eq(content.id, id));
    return content || undefined;
  }

  async getContentBySlug(slug: string): Promise<Content | undefined> {
    const [content] = await db.select().from(content).where(eq(content.slug, slug));
    return content || undefined;
  }

  async getContentsByCategory(category: string): Promise<Content[]> {
    return await db
      .select()
      .from(content)
      .where(
        and(
          eq(content.category, category),
          eq(content.isPublished, true)
        )
      )
      .orderBy(content.title);
  }

  async getAllContents(includeUnpublished: boolean = false): Promise<Content[]> {
    let query = db.select().from(content);
    
    if (!includeUnpublished) {
      query = query.where(eq(content.isPublished, true));
    }
    
    return await query.orderBy([content.category, content.title]);
  }

  async createContent(insertContent: InsertContent): Promise<Content> {
    const [newContent] = await db
      .insert(content)
      .values(insertContent)
      .returning();
      
    return newContent;
  }

  async updateContent(id: number, data: Partial<InsertContent>): Promise<Content> {
    // Adiciona a data de atualização
    const updateData = {
      ...data,
      updatedAt: new Date()
    };
    
    const [updatedContent] = await db
      .update(content)
      .set(updateData)
      .where(eq(content.id, id))
      .returning();
      
    return updatedContent;
  }

  async deleteContent(id: number): Promise<boolean> {
    try {
      await db
        .delete(content)
        .where(eq(content.id, id));
      
      return true;
    } catch (error) {
      console.error("Erro ao excluir conteúdo:", error);
      return false;
    }
  }

  // Media management methods
  async getMedia(id: number): Promise<Media | undefined> {
    const [mediaItem] = await db.select().from(media).where(eq(media.id, id));
    return mediaItem || undefined;
  }

  async getMediaByCategory(category: string): Promise<Media[]> {
    return await db
      .select()
      .from(media)
      .where(eq(media.category, category))
      .orderBy(desc(media.uploadedAt));
  }

  async getAllMedia(): Promise<Media[]> {
    return await db
      .select()
      .from(media)
      .orderBy(desc(media.uploadedAt));
  }

  async createMedia(insertMedia: InsertMedia): Promise<Media> {
    const [newMedia] = await db
      .insert(media)
      .values(insertMedia)
      .returning();
      
    return newMedia;
  }

  async deleteMedia(id: number): Promise<boolean> {
    try {
      await db
        .delete(media)
        .where(eq(media.id, id));
      
      return true;
    } catch (error) {
      console.error("Erro ao excluir mídia:", error);
      return false;
    }
  }

  // Audit logging methods
  async createAuditLog(insertLog: InsertAuditLog): Promise<AuditLog> {
    const [log] = await db
      .insert(auditLog)
      .values(insertLog)
      .returning();
      
    return log;
  }

  async getAuditLogs(options?: { 
    userId?: number, 
    action?: string, 
    entity?: string, 
    fromDate?: Date, 
    toDate?: Date,
    limit?: number
  }): Promise<AuditLog[]> {
    let query = db.select().from(auditLog);
    
    // Aplicar filtros se fornecidos
    if (options) {
      const conditions = [];
      
      if (options.userId) {
        conditions.push(eq(auditLog.userId, options.userId));
      }
      
      if (options.action) {
        conditions.push(eq(auditLog.action, options.action));
      }
      
      if (options.entity) {
        conditions.push(eq(auditLog.entity, options.entity));
      }
      
      if (options.fromDate) {
        conditions.push(gte(auditLog.timestamp, options.fromDate));
      }
      
      if (options.toDate) {
        conditions.push(lte(auditLog.timestamp, options.toDate));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      if (options.limit) {
        query = query.limit(options.limit);
      }
    }
    
    return await query.orderBy(desc(auditLog.timestamp));
  }

  // Métodos de rastreamento de humor

  async saveMoodTracking(moodData: InsertMoodTracking): Promise<MoodTracking> {
    const [newMood] = await db
      .insert(moodTracking)
      .values({
        ...moodData,
        recordedAt: moodData.recordedAt || new Date(),
      })
      .returning();
    
    return newMood;
  }

  async getUserMoodTrackings(userId: number, options?: { 
    startDate?: Date, 
    endDate?: Date, 
    limit?: number 
  }): Promise<MoodTracking[]> {
    let query = db
      .select()
      .from(moodTracking)
      .where(eq(moodTracking.userId, userId));
    
    // Adicionar filtros adicionais se fornecidos
    if (options) {
      const conditions = [eq(moodTracking.userId, userId)];
      
      if (options.startDate) {
        conditions.push(gte(moodTracking.recordedAt, options.startDate));
      }
      
      if (options.endDate) {
        conditions.push(lte(moodTracking.recordedAt, options.endDate));
      }
      
      query = query.where(and(...conditions));
      
      if (options.limit) {
        query = query.limit(options.limit);
      }
    }
    
    // Ordenar do mais recente para o mais antigo
    return await query.orderBy(desc(moodTracking.recordedAt));
  }

  async getMoodTrackingById(id: number): Promise<MoodTracking | undefined> {
    const [record] = await db
      .select()
      .from(moodTracking)
      .where(eq(moodTracking.id, id));
    
    return record || undefined;
  }

  async deleteMoodTracking(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(moodTracking)
        .where(eq(moodTracking.id, id));
      
      return true;
    } catch (error) {
      console.error("Erro ao excluir registro de humor:", error);
      return false;
    }
  }

  // Método para obter estatísticas de humor por período
  async getMoodTrackingStats(userId: number, period: 'day' | 'week' | 'month' | 'year'): Promise<any> {
    // Definir intervalo de datas com base no período
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }
    
    // Buscar registros de humor no período
    const records = await this.getUserMoodTrackings(userId, {
      startDate,
      endDate
    });
    
    // Agrupar por humor
    const moodCounts: Record<string, number> = {};
    const intensitySums: Record<string, number> = {};
    const moodsByDate: Record<string, {mood: string, intensity: number}[]> = {};
    
    records.forEach(record => {
      // Contagem por tipo de humor
      if (!moodCounts[record.mood]) {
        moodCounts[record.mood] = 0;
        intensitySums[record.mood] = 0;
      }
      moodCounts[record.mood]++;
      intensitySums[record.mood] += record.intensity;
      
      // Agrupar por data para análise de tendências
      const dateKey = record.recordedAt.toISOString().split('T')[0];
      if (!moodsByDate[dateKey]) {
        moodsByDate[dateKey] = [];
      }
      moodsByDate[dateKey].push({
        mood: record.mood,
        intensity: record.intensity
      });
    });
    
    // Calcular humor médio e intensidade média
    const moodStats = Object.keys(moodCounts).map(mood => ({
      mood,
      count: moodCounts[mood],
      percentage: (moodCounts[mood] / records.length) * 100,
      averageIntensity: intensitySums[mood] / moodCounts[mood]
    }));
    
    // Ordenar por contagem (decrescente)
    moodStats.sort((a, b) => b.count - a.count);
    
    // Estruturar dados para gráficos de tendência
    const dateKeys = Object.keys(moodsByDate).sort();
    const trendData = dateKeys.map(date => {
      const dayMoods = moodsByDate[date];
      // Se houver vários registros em um dia, pegar o humor predominante
      const moodFrequency: Record<string, number> = {};
      dayMoods.forEach(m => {
        if (!moodFrequency[m.mood]) moodFrequency[m.mood] = 0;
        moodFrequency[m.mood]++;
      });
      
      // Encontrar o humor mais frequente do dia
      let predominantMood = '';
      let maxCount = 0;
      Object.keys(moodFrequency).forEach(mood => {
        if (moodFrequency[mood] > maxCount) {
          maxCount = moodFrequency[mood];
          predominantMood = mood;
        }
      });
      
      // Calcular a intensidade média do dia
      const totalIntensity = dayMoods.reduce((sum, m) => sum + m.intensity, 0);
      const averageIntensity = totalIntensity / dayMoods.length;
      
      return {
        date,
        predominantMood,
        averageIntensity,
        moodCount: dayMoods.length
      };
    });
    
    return {
      period,
      totalRecords: records.length,
      moodStats,
      trendData
    };
  }
}

export const storage = new DatabaseStorage();
