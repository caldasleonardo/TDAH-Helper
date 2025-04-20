import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertQuizResultSchema } from "@shared/schema";
import { ZodError } from "zod";
import Stripe from "stripe";

export async function registerRoutes(app: Express): Promise<Server> {
  // Inicialização do Stripe
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('A chave secreta do Stripe (STRIPE_SECRET_KEY) não foi fornecida');
  }
  
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  
  // Set up authentication routes
  setupAuth(app);

  // Quiz results API
  app.post("/api/quiz-results", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const userId = req.user?.id;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      // Validate quiz results
      const validatedData = insertQuizResultSchema.parse({
        ...req.body,
        userId,
      });

      // Save quiz result
      const result = await storage.saveQuizResult(validatedData);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid quiz data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error saving quiz result" });
      }
    }
  });

  // Get user's quiz results
  app.get("/api/quiz-results", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const userId = req.user?.id;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const results = await storage.getUserQuizResults(userId);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Error fetching quiz results" });
    }
  });

  // Get specific quiz result
  app.get("/api/quiz-results/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const resultId = parseInt(req.params.id);
      if (isNaN(resultId)) {
        return res.status(400).json({ message: "Invalid quiz result ID" });
      }

      const result = await storage.getQuizResultById(resultId);
      if (!result) {
        return res.status(404).json({ message: "Quiz result not found" });
      }

      // Check if the result belongs to the authenticated user
      if (result.userId !== req.user?.id) {
        return res.status(403).json({ message: "Not authorized to access this quiz result" });
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Error fetching quiz result" });
    }
  });
  
  // Rota para criar intenção de pagamento para o relatório completo
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Autenticação necessária" });
      }
      
      const { quizResultId } = req.body;
      
      if (!quizResultId) {
        return res.status(400).json({ message: "ID do resultado do quiz é obrigatório" });
      }
      
      // Verificar se o resultado pertence ao usuário
      const result = await storage.getQuizResultById(parseInt(quizResultId));
      
      if (!result) {
        return res.status(404).json({ message: "Resultado do quiz não encontrado" });
      }
      
      if (result.userId !== req.user?.id) {
        return res.status(403).json({ message: "Não autorizado a acessar este resultado" });
      }
      
      // Valor em centavos (R$ 12,90)
      const amount = 1290;
      
      // Criar intenção de pagamento
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'brl',
        metadata: {
          quizResultId: quizResultId.toString(),
          userId: req.user.id.toString()
        },
        description: 'Relatório Completo de TDAH',
        automatic_payment_methods: {
          enabled: true,
        },
      });
      
      // Retornar o clientSecret para o frontend
      res.json({
        clientSecret: paymentIntent.client_secret,
        amount
      });
      
    } catch (error: any) {
      console.error("Erro ao criar intenção de pagamento:", error);
      res.status(500).json({ 
        message: "Erro ao processar pagamento", 
        error: error.message 
      });
    }
  });
  
  // Rota para atualizar o status de pagamento do relatório
  app.post("/api/payment-success", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Autenticação necessária" });
      }
      
      const { paymentIntentId, quizResultId } = req.body;
      
      if (!paymentIntentId || !quizResultId) {
        return res.status(400).json({ message: "Dados de pagamento incompletos" });
      }
      
      // Verificar se o pagamento foi bem-sucedido no Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ message: "Pagamento não foi concluído com sucesso" });
      }
      
      // Aqui você pode atualizar seu banco de dados para marcar o relatório como pago
      // Por exemplo, adicionar um campo 'premiumPaid: true' no registro do quiz result
      
      res.json({ success: true, message: "Pagamento processado com sucesso" });
    } catch (error: any) {
      console.error("Erro ao processar confirmação de pagamento:", error);
      res.status(500).json({ 
        message: "Erro ao confirmar pagamento", 
        error: error.message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
