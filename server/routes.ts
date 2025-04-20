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
      
      // Verificar se o resultado do quiz existe e pertence ao usuário
      const quizResult = await storage.getQuizResultById(parseInt(quizResultId));
      
      if (!quizResult) {
        return res.status(404).json({ message: "Resultado do quiz não encontrado" });
      }
      
      if (quizResult.userId !== req.user?.id) {
        return res.status(403).json({ message: "Não autorizado a acessar este resultado" });
      }
      
      // Verificar se o pagamento foi bem-sucedido no Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ message: "Pagamento não foi concluído com sucesso" });
      }
      
      // Atualizar o registro para marcar o relatório como pago
      const updatedResult = await storage.updateQuizResultPayment(
        parseInt(quizResultId),
        paymentIntentId,
        true
      );
      
      res.json({ 
        success: true, 
        message: "Pagamento processado com sucesso",
        result: updatedResult
      });
    } catch (error: any) {
      console.error("Erro ao processar confirmação de pagamento:", error);
      res.status(500).json({ 
        message: "Erro ao confirmar pagamento", 
        error: error.message 
      });
    }
  });
  
  // Rotas de assinatura premium
  
  // Criar uma assinatura - endpoint que inicia o fluxo de assinatura para funcionalidades premium
  app.post("/api/subscription/create", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Autenticação necessária" });
      }
      
      const { planType = 'monthly' } = req.body;
      
      // Obter o usuário
      const user = req.user;
      
      // Verificar se o usuário já tem uma assinatura ativa
      const existingSubscription = await storage.getActiveSubscription(user.id);
      
      if (existingSubscription) {
        return res.status(400).json({
          message: "Usuário já possui uma assinatura ativa",
          subscription: existingSubscription
        });
      }
      
      let customerId = user.stripeCustomerId;
      
      // Criar ou recuperar customer no Stripe
      if (!customerId) {
        // Cria um novo cliente no Stripe
        const customer = await stripe.customers.create({
          email: user.email || undefined,
          name: user.username,
          metadata: {
            userId: user.id.toString()
          }
        });
        
        customerId = customer.id;
        
        // Atualizar o ID do cliente Stripe no usuário
        await storage.updateUserStripeInfo(user.id, { stripeCustomerId: customerId });
      }
      
      // Definir produtos com base no tipo de plano
      if (!process.env.STRIPE_PRICE_MONTHLY || !process.env.STRIPE_PRICE_YEARLY) {
        throw new Error('Variáveis de ambiente STRIPE_PRICE_MONTHLY e STRIPE_PRICE_YEARLY não definidas');
      }
      
      const priceId = planType === 'yearly' 
        ? process.env.STRIPE_PRICE_YEARLY  // ID do preço para assinatura anual
        : process.env.STRIPE_PRICE_MONTHLY; // ID do preço para assinatura mensal
      
      // Criar uma assinatura no Stripe
      // Vamos mudar a abordagem para simplificar
      // Primeiro criar um PaymentIntent diretamente
      const amount = planType === 'yearly' ? 9990 : 1290; // Valor em centavos (R$99,90 anual ou R$12,90 mensal)
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'brl',
        customer: customerId,
        description: `Assinatura Premium ${planType === 'yearly' ? 'Anual' : 'Mensal'}`,
        metadata: {
          userId: user.id.toString(),
          planType
        }
      });
      
      // Criar a assinatura normalmente, sem tentar expandir payment_intent
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price: priceId,
        }],
        payment_behavior: 'default_incomplete',
      });
      
      // Data de início e fim do período atual
      // Vamos garantir que estamos criando datas válidas
      const now = new Date();
      // Data atual para início e um mês depois para término (assinatura mensal padrão)
      const currentPeriodStart = now;
      // Adicionar 30 dias para período mensal ou 365 para anual
      const currentPeriodEnd = new Date();
      currentPeriodEnd.setDate(currentPeriodEnd.getDate() + (planType === 'yearly' ? 365 : 30));
      
      // Salvar a assinatura no banco de dados
      const savedSubscription = await storage.createSubscription({
        userId: user.id,
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
        planType,
        currentPeriodStart,
        currentPeriodEnd
      });
      
      // Atribuir recursos premium ao usuário
      // Obter todos os recursos premium ativos
      const premiumFeatures = await storage.getActivePremiumFeatures();
      
      // Data de expiração dos recursos: mesma data do fim da assinatura
      const featuresExpirationDate = currentPeriodEnd;
      
      // Adicionar cada recurso premium ao usuário
      for (const feature of premiumFeatures) {
        await storage.addUserPremiumFeature(user.id, feature.id, featuresExpirationDate);
      }
      
      // Atualizar o perfil do usuário para indicar que tem status premium
      await storage.updateUserStripeInfo(user.id, { 
        stripeCustomerId: customerId,
        isPremium: true 
      });
      
      // Usamos o clientSecret do PaymentIntent que criamos anteriormente
      if (!paymentIntent || !paymentIntent.client_secret) {
        throw new Error('Erro ao obter cliente secret para pagamento');
      }
      
      res.json({
        subscription: savedSubscription,
        clientSecret: paymentIntent.client_secret
      });
      
    } catch (error: any) {
      console.error("Erro ao criar assinatura:", error);
      res.status(500).json({
        message: "Erro ao processar assinatura",
        error: error.message
      });
    }
  });
  
  // Obter a assinatura atual do usuário
  app.get("/api/subscription", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Autenticação necessária" });
      }
      
      const subscription = await storage.getActiveSubscription(req.user.id);
      
      if (!subscription) {
        return res.status(404).json({ message: "Nenhuma assinatura ativa encontrada" });
      }
      
      res.json(subscription);
      
    } catch (error: any) {
      console.error("Erro ao buscar assinatura:", error);
      res.status(500).json({
        message: "Erro ao buscar dados da assinatura",
        error: error.message
      });
    }
  });
  
  // Cancelar assinatura
  app.post("/api/subscription/cancel", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Autenticação necessária" });
      }
      
      const { subscriptionId } = req.body;
      
      if (!subscriptionId) {
        return res.status(400).json({ message: "ID da assinatura é obrigatório" });
      }
      
      // Buscar assinatura no banco de dados
      const subscription = await storage.getUserSubscription(req.user.id);
      
      if (!subscription || subscription.id !== parseInt(subscriptionId)) {
        return res.status(403).json({ message: "Não autorizado a cancelar esta assinatura" });
      }
      
      // Cancelar assinatura no Stripe
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
      
      // Atualizar status da assinatura no banco de dados
      const updatedSubscription = await storage.updateSubscriptionStatus(
        subscription.id,
        "canceled",
        new Date()
      );
      
      // Nota: Não removemos os recursos premium imediatamente
      // O usuário continuará tendo acesso até o final do período já pago
      // A data de expiração dos recursos premium já foi definida como currentPeriodEnd
      
      // Atualizamos o campo isPremium no usuário para false após o final do período
      // Isso acontecerá no futuro, após a data de expiração da assinatura
      // Por enquanto, o usuário ainda é premium até o final do período pago
      
      res.json({
        success: true,
        message: "Assinatura cancelada com sucesso. Você continuará tendo acesso aos recursos premium até o final do período atual.",
        subscription: updatedSubscription
      });
      
    } catch (error: any) {
      console.error("Erro ao cancelar assinatura:", error);
      res.status(500).json({
        message: "Erro ao cancelar assinatura",
        error: error.message
      });
    }
  });
  
  // Rotas para gerenciar funcionalidades premium
  
  // Obter todas as funcionalidades premium disponíveis
  app.get("/api/premium-features", async (req, res) => {
    try {
      const features = await storage.getActivePremiumFeatures();
      res.json(features);
    } catch (error: any) {
      console.error("Erro ao buscar funcionalidades premium:", error);
      res.status(500).json({
        message: "Erro ao buscar funcionalidades premium",
        error: error.message
      });
    }
  });
  
  // Obter as funcionalidades premium do usuário
  app.get("/api/user/premium-features", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Autenticação necessária" });
      }
      
      const features = await storage.getUserPremiumFeatures(req.user.id);
      
      // Verificar se o usuário tem assinatura ativa
      const subscription = await storage.getActiveSubscription(req.user.id);
      
      res.json({
        features,
        hasActiveSubscription: !!subscription
      });
      
    } catch (error: any) {
      console.error("Erro ao buscar funcionalidades premium do usuário:", error);
      res.status(500).json({
        message: "Erro ao buscar funcionalidades premium do usuário",
        error: error.message
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
