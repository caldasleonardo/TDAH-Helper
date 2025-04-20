import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
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

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type QuizResult = typeof quizResults.$inferSelect;
export type InsertQuizResult = z.infer<typeof insertQuizResultSchema>;

export type QuizQuestion = typeof quizQuestions.$inferSelect;
