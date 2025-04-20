import { pgTable, text, serial, integer, boolean, timestamp, json, date, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
  firebaseUid: text("firebase_uid"),
  stripeCustomerId: text("stripe_customer_id"),
  isPremium: boolean("is_premium").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  firebaseUid: true,
});

// Quiz results schema
export const quizResults = pgTable("quiz_results", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  date: timestamp("date").defaultNow(),
  score: integer("score").notNull(),
  category: text("category").notNull(), // 'low', 'moderate', 'high'
  answers: json("answers").notNull(), // Store all answers for reference
  inattentionScore: integer("inattention_score"),
  hyperactivityScore: integer("hyperactivity_score"),
  impulsivityScore: integer("impulsivity_score"),
  premiumPaid: boolean("premium_paid").default(false), // Indica se o relatório premium foi pago
  paymentIntentId: text("payment_intent_id"), // ID da intenção de pagamento do Stripe
});

export const insertQuizResultSchema = createInsertSchema(quizResults)
  .omit({
    id: true,
  })
  .extend({
    // Garantir que answers seja aceito como string JSON
    answers: z.string(),
  });

// Quiz schema (stores quiz questions and options)
export const quizQuestions = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  type: text("type").notNull(), // 'inattention', 'hyperactivity', 'impulsivity'
  weight: integer("weight").default(1),
  order: integer("order").notNull(),
});

// Subscriptions schema
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  stripeSubscriptionId: text("stripe_subscription_id").notNull(),
  status: text("status").notNull().default("active"), // active, canceled, past_due, etc.
  planType: text("plan_type").notNull().default("monthly"), // monthly, yearly, etc.
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  canceledAt: timestamp("canceled_at"),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
});

// Premium features schema
export const premiumFeatures = pgTable("premium_features", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  isActive: boolean("is_active").default(true),
});

// User premium features junction table
export const userPremiumFeatures = pgTable("user_premium_features", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  featureId: integer("feature_id").references(() => premiumFeatures.id).notNull(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
});

// Admin users schema
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("editor"), // admin, editor
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login"),
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
  lastLogin: true,
});

// App configuration schema
export const appConfig = pgTable("app_config", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // text, number, boolean, color, json
  category: varchar("category", { length: 100 }).notNull(), // general, app, quiz, theme, etc.
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: integer("updated_by").references(() => adminUsers.id),
});

export const insertAppConfigSchema = createInsertSchema(appConfig).omit({
  id: true,
  updatedAt: true,
});

// Content management schema
export const content = pgTable("content", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  category: varchar("category", { length: 100 }).notNull(), // articles, faq, help, homepage, etc.
  isPublished: boolean("is_published").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: integer("created_by").references(() => adminUsers.id),
  updatedBy: integer("updated_by").references(() => adminUsers.id),
});

export const insertContentSchema = createInsertSchema(content).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Media library schema
export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalFilename: text("original_filename").notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  size: integer("size").notNull(),
  url: text("url").notNull(),
  alt: text("alt"),
  category: varchar("category", { length: 100 }), // icons, backgrounds, user-uploads, etc.
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  uploadedBy: integer("uploaded_by").references(() => adminUsers.id),
});

export const insertMediaSchema = createInsertSchema(media).omit({
  id: true,
  uploadedAt: true,
});

// Audit log schema
export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => adminUsers.id),
  action: varchar("action", { length: 100 }).notNull(), // login, update, create, delete, etc.
  entity: varchar("entity", { length: 100 }).notNull(), // the table or model that was modified
  entityId: integer("entity_id"), // the id of the modified record
  details: json("details"), // additional details about the action
  ip: varchar("ip", { length: 45 }),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertAuditLogSchema = createInsertSchema(auditLog).omit({
  id: true,
  timestamp: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type QuizResult = typeof quizResults.$inferSelect;
export type InsertQuizResult = z.infer<typeof insertQuizResultSchema>;

export type QuizQuestion = typeof quizQuestions.$inferSelect;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

export type PremiumFeature = typeof premiumFeatures.$inferSelect;

export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;

export type AppConfig = typeof appConfig.$inferSelect;
export type InsertAppConfig = z.infer<typeof insertAppConfigSchema>;

export type Content = typeof content.$inferSelect;
export type InsertContent = z.infer<typeof insertContentSchema>;

export type Media = typeof media.$inferSelect;
export type InsertMedia = z.infer<typeof insertMediaSchema>;

export type AuditLog = typeof auditLog.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

// Tabela para rastreamento de humor
export const moodTracking = pgTable("mood_tracking", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  mood: varchar("mood", { length: 50 }).notNull(), // emoji ou nome do humor
  intensity: integer("intensity").notNull().default(3), // escala de 1-5
  notes: text("notes"),
  tags: text("tags").array(),
  recordedAt: timestamp("recorded_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMoodTrackingSchema = createInsertSchema(moodTracking).omit({
  id: true,
  createdAt: true,
});

export type MoodTracking = typeof moodTracking.$inferSelect;
export type InsertMoodTracking = z.infer<typeof insertMoodTrackingSchema>;
