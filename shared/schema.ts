import { pgTable, text, serial, integer, boolean, timestamp, json, date } from "drizzle-orm/pg-core";
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

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type QuizResult = typeof quizResults.$inferSelect;
export type InsertQuizResult = z.infer<typeof insertQuizResultSchema>;

export type QuizQuestion = typeof quizQuestions.$inferSelect;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

export type PremiumFeature = typeof premiumFeatures.$inferSelect;
