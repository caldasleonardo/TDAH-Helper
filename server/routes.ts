import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertQuizResultSchema, 
  insertAppConfigSchema, 
  insertContentSchema,
  insertMediaSchema,
  insertAdminUserSchema
} from "@shared/schema";
import { ZodError } from "zod";
import Stripe from "stripe";
import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";

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

  // Configuração do Multer para upload de arquivos
  const multerStorage = multer.diskStorage({
    destination: function(req, file, cb) {
      const uploadDir = path.join(__dirname, '../public/uploads');
      // Verifica se o diretório existe, se não, cria
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
      const uniqueFilename = `${randomUUID()}-${file.originalname}`;
      cb(null, uniqueFilename);
    }
  });
  
  const upload = multer({ 
    storage: multerStorage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB de limite
    },
    fileFilter: function(req, file, cb) {
      // Verifica os tipos de arquivo permitidos
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Tipo de arquivo não suportado. Apenas JPG, PNG, GIF e SVG são permitidos.'));
      }
    }
  });

  // Middleware para verificar se um usuário é administrador
  const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Autenticação necessária" });
    }
    
    try {
      // Verificar se o usuário está na tabela de adminUsers
      const adminUser = await storage.getAdminUserByUsername(req.user.username);
      
      if (!adminUser) {
        return res.status(403).json({ message: "Acesso restrito a administradores" });
      }
      
      // Atualizar o último login
      await storage.updateAdminUserLastLogin(adminUser.id);
      
      // Adiciona o admin ao request para uso posterior
      (req as any).adminUser = adminUser;
      
      // Tudo certo, continuar
      next();
    } catch (error) {
      console.error("Erro ao verificar status de administrador:", error);
      res.status(500).json({ message: "Erro interno ao verificar permissões" });
    }
  };
  
  // Middleware que registra ações administrativas
  const logAdminAction = async (req: Request, res: Response, next: NextFunction) => {
    // Middleware para registrar ações administrativas
    const originalJson = res.json;
    
    // Sobrescrever o método json para registrar a ação após o sucesso
    res.json = function(body) {
      // Se a resposta é bem-sucedida (2xx), registrar a ação
      if (res.statusCode >= 200 && res.statusCode < 300 && (req as any).adminUser) {
        try {
          const action = req.method; // GET, POST, PUT, DELETE
          const path = req.path;
          let entity = '';
          let entityId = null;
          
          // Tentar determinar a entidade com base no caminho
          if (path.includes('/admin/users')) {
            entity = 'users';
          } else if (path.includes('/admin/config')) {
            entity = 'app_config';
          } else if (path.includes('/admin/content')) {
            entity = 'content';
          } else if (path.includes('/admin/media')) {
            entity = 'media';
          } else if (path.includes('/admin/premium-features')) {
            entity = 'premium_features';
          } else if (path.includes('/admin/quiz-questions')) {
            entity = 'quiz_questions';
          }
          
          // Verificar se há um ID na rota
          const match = path.match(/\/(\d+)(?:\/|$)/);
          if (match) {
            entityId = parseInt(match[1]);
          }
          
          // Criar o registro de auditoria
          storage.createAuditLog({
            userId: (req as any).adminUser.id,
            action,
            entity,
            entityId,
            details: JSON.stringify({
              method: req.method,
              path: req.path,
              body: req.body,
              ip: req.ip,
              userAgent: req.headers['user-agent']
            }),
            ip: req.ip,
            userAgent: req.headers['user-agent'] as string
          }).catch(err => console.error("Erro ao criar log de auditoria:", err));
        } catch (error) {
          console.error("Erro ao registrar ação de admin:", error);
        }
      }
      
      // Chamar o método original
      return originalJson.call(this, body);
    };
    
    next();
  };

  // Admin API - Login administrativo
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Nome de usuário e senha são obrigatórios" });
      }
      
      // Buscar o usuário admin pelo nome de usuário
      const admin = await storage.getAdminUserByUsername(username);
      
      if (!admin) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }
      
      // Implementar a verificação de senha aqui
      // (Por ora, estamos apenas simulando uma comparação)
      // Em produção, use bcrypt ou outro algoritmo seguro
      if (admin.password !== password) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }
      
      // Atualizar último login
      await storage.updateAdminUserLastLogin(admin.id);
      
      // Retorna informações do admin (sem a senha)
      const { password: _, ...adminInfo } = admin;
      
      res.json({ 
        message: "Login administrativo bem-sucedido",
        admin: adminInfo
      });
      
    } catch (error: any) {
      console.error("Erro no login administrativo:", error);
      res.status(500).json({ message: "Erro interno no servidor", error: error.message });
    }
  });

  // Rota para obter todos os administradores
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const admins = await storage.getAllAdminUsers();
      // Remover as senhas dos objetos
      const adminsWithoutPasswords = admins.map(admin => {
        const { password, ...adminInfo } = admin;
        return adminInfo;
      });
      
      res.json(adminsWithoutPasswords);
    } catch (error: any) {
      console.error("Erro ao buscar administradores:", error);
      res.status(500).json({ message: "Erro ao buscar administradores", error: error.message });
    }
  });

  // Rota para criar um novo administrador
  app.post("/api/admin/users", isAdmin, async (req, res) => {
    try {
      // Validar dados de entrada
      const adminData = insertAdminUserSchema.parse(req.body);
      
      // Verificar se o nome de usuário já existe
      const existingAdmin = await storage.getAdminUserByUsername(adminData.username);
      
      if (existingAdmin) {
        return res.status(400).json({ message: "Nome de usuário já está em uso" });
      }
      
      // Criar novo administrador
      const newAdmin = await storage.createAdminUser(adminData);
      
      // Remover a senha do objeto de resposta
      const { password, ...adminInfo } = newAdmin;
      
      res.status(201).json(adminInfo);
    } catch (error: any) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      } else {
        console.error("Erro ao criar administrador:", error);
        res.status(500).json({ message: "Erro interno ao criar administrador", error: error.message });
      }
    }
  });

  // Rotas de configuração do aplicativo
  
  // Obter todas as configurações
  app.get("/api/admin/config", isAdmin, async (req, res) => {
    try {
      const { category } = req.query;
      
      let configs;
      if (category) {
        configs = await storage.getAppConfigsByCategory(category as string);
      } else {
        configs = await storage.getAllAppConfigs();
      }
      
      res.json(configs);
    } catch (error: any) {
      console.error("Erro ao buscar configurações:", error);
      res.status(500).json({ message: "Erro ao buscar configurações", error: error.message });
    }
  });
  
  // Obter uma configuração específica por chave
  app.get("/api/admin/config/:key", isAdmin, async (req, res) => {
    try {
      const key = req.params.key;
      const config = await storage.getAppConfig(key);
      
      if (!config) {
        return res.status(404).json({ message: "Configuração não encontrada" });
      }
      
      res.json(config);
    } catch (error: any) {
      console.error(`Erro ao buscar configuração [${req.params.key}]:`, error);
      res.status(500).json({ message: "Erro ao buscar configuração", error: error.message });
    }
  });
  
  // Criar ou atualizar configuração
  app.post("/api/admin/config", isAdmin, logAdminAction, async (req, res) => {
    try {
      const configData = insertAppConfigSchema.parse(req.body);
      const adminId = (req as any).adminUser.id;
      
      // Garantir que o updatedBy seja o admin atual
      configData.updatedBy = adminId;
      
      const config = await storage.setAppConfig(configData);
      
      res.status(201).json(config);
    } catch (error: any) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      } else {
        console.error("Erro ao criar/atualizar configuração:", error);
        res.status(500).json({ message: "Erro interno ao salvar configuração", error: error.message });
      }
    }
  });
  
  // Atualizar valor de configuração
  app.put("/api/admin/config/:id", isAdmin, logAdminAction, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { value } = req.body;
      
      if (isNaN(id) || value === undefined) {
        return res.status(400).json({ message: "ID e valor são obrigatórios" });
      }
      
      const adminId = (req as any).adminUser.id;
      
      const updatedConfig = await storage.updateAppConfig(id, value, adminId);
      
      res.json(updatedConfig);
    } catch (error: any) {
      console.error(`Erro ao atualizar configuração [${req.params.id}]:`, error);
      res.status(500).json({ message: "Erro ao atualizar configuração", error: error.message });
    }
  });
  
  // Excluir configuração
  app.delete("/api/admin/config/:id", isAdmin, logAdminAction, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const result = await storage.deleteAppConfig(id);
      
      if (result) {
        res.json({ success: true, message: "Configuração excluída com sucesso" });
      } else {
        res.status(404).json({ message: "Configuração não encontrada ou não pode ser excluída" });
      }
    } catch (error: any) {
      console.error(`Erro ao excluir configuração [${req.params.id}]:`, error);
      res.status(500).json({ message: "Erro ao excluir configuração", error: error.message });
    }
  });
  
  // Rotas para gerenciamento de conteúdo
  
  // Obter todo o conteúdo
  app.get("/api/admin/content", isAdmin, async (req, res) => {
    try {
      const { category, includeUnpublished } = req.query;
      
      let content;
      if (category) {
        content = await storage.getContentsByCategory(category as string);
      } else {
        content = await storage.getAllContents(includeUnpublished === 'true');
      }
      
      res.json(content);
    } catch (error: any) {
      console.error("Erro ao buscar conteúdo:", error);
      res.status(500).json({ message: "Erro ao buscar conteúdo", error: error.message });
    }
  });
  
  // Obter conteúdo específico
  app.get("/api/admin/content/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const content = await storage.getContent(id);
      
      if (!content) {
        return res.status(404).json({ message: "Conteúdo não encontrado" });
      }
      
      res.json(content);
    } catch (error: any) {
      console.error(`Erro ao buscar conteúdo [${req.params.id}]:`, error);
      res.status(500).json({ message: "Erro ao buscar conteúdo", error: error.message });
    }
  });
  
  // Criar novo conteúdo
  app.post("/api/admin/content", isAdmin, logAdminAction, async (req, res) => {
    try {
      const contentData = insertContentSchema.parse(req.body);
      const adminId = (req as any).adminUser.id;
      
      // Definir o criador e editor como o admin atual
      contentData.createdBy = adminId;
      contentData.updatedBy = adminId;
      
      // Criar slug a partir do título, se não fornecido
      if (!contentData.slug) {
        contentData.slug = contentData.title
          .toLowerCase()
          .replace(/[^\w\s]/g, '')
          .replace(/\s+/g, '-');
      }
      
      const newContent = await storage.createContent(contentData);
      
      res.status(201).json(newContent);
    } catch (error: any) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      } else {
        console.error("Erro ao criar conteúdo:", error);
        res.status(500).json({ message: "Erro interno ao criar conteúdo", error: error.message });
      }
    }
  });
  
  // Atualizar conteúdo
  app.put("/api/admin/content/:id", isAdmin, logAdminAction, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const adminId = (req as any).adminUser.id;
      
      // Adicionar o admin como editor
      const updateData = {
        ...req.body,
        updatedBy: adminId
      };
      
      const updatedContent = await storage.updateContent(id, updateData);
      
      res.json(updatedContent);
    } catch (error: any) {
      console.error(`Erro ao atualizar conteúdo [${req.params.id}]:`, error);
      res.status(500).json({ message: "Erro ao atualizar conteúdo", error: error.message });
    }
  });
  
  // Excluir conteúdo
  app.delete("/api/admin/content/:id", isAdmin, logAdminAction, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const result = await storage.deleteContent(id);
      
      if (result) {
        res.json({ success: true, message: "Conteúdo excluído com sucesso" });
      } else {
        res.status(404).json({ message: "Conteúdo não encontrado ou não pode ser excluído" });
      }
    } catch (error: any) {
      console.error(`Erro ao excluir conteúdo [${req.params.id}]:`, error);
      res.status(500).json({ message: "Erro ao excluir conteúdo", error: error.message });
    }
  });
  
  // Rotas para gerenciamento de mídia
  
  // Obter todas as mídias
  app.get("/api/admin/media", isAdmin, async (req, res) => {
    try {
      const { category } = req.query;
      
      let media;
      if (category) {
        media = await storage.getMediaByCategory(category as string);
      } else {
        media = await storage.getAllMedia();
      }
      
      res.json(media);
    } catch (error: any) {
      console.error("Erro ao buscar mídias:", error);
      res.status(500).json({ message: "Erro ao buscar mídias", error: error.message });
    }
  });
  
  // Obter mídia específica
  app.get("/api/admin/media/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const media = await storage.getMedia(id);
      
      if (!media) {
        return res.status(404).json({ message: "Mídia não encontrada" });
      }
      
      res.json(media);
    } catch (error: any) {
      console.error(`Erro ao buscar mídia [${req.params.id}]:`, error);
      res.status(500).json({ message: "Erro ao buscar mídia", error: error.message });
    }
  });
  
  // Upload de nova mídia
  app.post("/api/admin/media/upload", isAdmin, upload.single('file'), logAdminAction, async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Nenhum arquivo enviado" });
      }
      
      const { category, alt } = req.body;
      const adminId = (req as any).adminUser.id;
      
      // Criar registro da mídia no banco de dados
      const newMedia = await storage.createMedia({
        filename: req.file.filename,
        originalFilename: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: `/uploads/${req.file.filename}`, // URL relativa ao diretório público
        alt: alt || req.file.originalname,
        category: category || 'uploads',
        uploadedBy: adminId
      });
      
      res.status(201).json(newMedia);
    } catch (error: any) {
      console.error("Erro ao fazer upload de mídia:", error);
      res.status(500).json({ message: "Erro no upload de mídia", error: error.message });
    }
  });
  
  // Excluir mídia
  app.delete("/api/admin/media/:id", isAdmin, logAdminAction, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      // Obter a mídia antes de excluir para poder remover o arquivo físico
      const media = await storage.getMedia(id);
      
      if (!media) {
        return res.status(404).json({ message: "Mídia não encontrada" });
      }
      
      // Excluir o registro no banco de dados
      const result = await storage.deleteMedia(id);
      
      if (result) {
        // Tentar excluir o arquivo físico, se existir
        try {
          const filePath = path.join(__dirname, '../public', media.url);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (fileError) {
          console.error(`Erro ao excluir arquivo físico [${media.url}]:`, fileError);
          // Não falhar o endpoint se o arquivo não puder ser excluído
        }
        
        res.json({ success: true, message: "Mídia excluída com sucesso" });
      } else {
        res.status(500).json({ message: "Falha ao excluir mídia" });
      }
    } catch (error: any) {
      console.error(`Erro ao excluir mídia [${req.params.id}]:`, error);
      res.status(500).json({ message: "Erro ao excluir mídia", error: error.message });
    }
  });
  
  // Logs de auditoria
  app.get("/api/admin/audit-logs", isAdmin, async (req, res) => {
    try {
      const { userId, action, entity, from, to, limit } = req.query;
      
      // Converter parâmetros
      const options: any = {};
      
      if (userId) options.userId = parseInt(userId as string);
      if (action) options.action = action as string;
      if (entity) options.entity = entity as string;
      if (from) options.fromDate = new Date(from as string);
      if (to) options.toDate = new Date(to as string);
      if (limit) options.limit = parseInt(limit as string);
      
      const logs = await storage.getAuditLogs(options);
      
      res.json(logs);
    } catch (error: any) {
      console.error("Erro ao buscar logs de auditoria:", error);
      res.status(500).json({ message: "Erro ao buscar logs de auditoria", error: error.message });
    }
  });
  
  // API pública para conteúdo
  
  // Obter conteúdo específico pelo slug
  app.get("/api/content/:slug", async (req, res) => {
    try {
      const slug = req.params.slug;
      
      if (!slug) {
        return res.status(400).json({ message: "Slug é obrigatório" });
      }
      
      const contentItem = await storage.getContentBySlug(slug);
      
      if (!contentItem) {
        return res.status(404).json({ message: "Conteúdo não encontrado" });
      }
      
      // Verificar se o conteúdo está publicado ou se o usuário é admin
      if (!contentItem.isPublished) {
        let isAdminUser = false;
        
        if (req.isAuthenticated()) {
          const adminUser = await storage.getAdminUserByUsername(req.user.username);
          isAdminUser = !!adminUser;
        }
        
        if (!isAdminUser) {
          return res.status(403).json({ message: "Este conteúdo não está disponível" });
        }
      }
      
      res.json(contentItem);
    } catch (error: any) {
      console.error(`Erro ao buscar conteúdo por slug [${req.params.slug}]:`, error);
      res.status(500).json({ message: "Erro ao buscar conteúdo", error: error.message });
    }
  });
  
  // Obter conteúdo por categoria (apenas publicados)
  app.get("/api/content/category/:category", async (req, res) => {
    try {
      const category = req.params.category;
      
      if (!category) {
        return res.status(400).json({ message: "Categoria é obrigatória" });
      }
      
      const contentItems = await storage.getContentsByCategory(category);
      
      res.json(contentItems);
    } catch (error: any) {
      console.error(`Erro ao buscar conteúdo por categoria [${req.params.category}]:`, error);
      res.status(500).json({ message: "Erro ao buscar conteúdo", error: error.message });
    }
  });

  // API pública para configurações
  app.get("/api/config/:key", async (req, res) => {
    try {
      const key = req.params.key;
      
      if (!key) {
        return res.status(400).json({ message: "Chave é obrigatória" });
      }
      
      const config = await storage.getAppConfig(key);
      
      if (!config) {
        return res.status(404).json({ message: "Configuração não encontrada" });
      }
      
      res.json(config);
    } catch (error: any) {
      console.error(`Erro ao buscar configuração [${req.params.key}]:`, error);
      res.status(500).json({ message: "Erro ao buscar configuração", error: error.message });
    }
  });
  
  // Obter configurações por categoria
  app.get("/api/config/category/:category", async (req, res) => {
    try {
      const category = req.params.category;
      
      if (!category) {
        return res.status(400).json({ message: "Categoria é obrigatória" });
      }
      
      const configs = await storage.getAppConfigsByCategory(category);
      
      res.json(configs);
    } catch (error: any) {
      console.error(`Erro ao buscar configurações por categoria [${req.params.category}]:`, error);
      res.status(500).json({ message: "Erro ao buscar configurações", error: error.message });
    }
  });

  // API para rastreamento de humor
  app.post("/api/mood-tracking", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Autenticação necessária" });
      }

      const userId = req.user.id;
      const moodData = {
        ...req.body,
        userId,
        recordedAt: req.body.recordedAt ? new Date(req.body.recordedAt) : new Date()
      };

      const result = await storage.saveMoodTracking(moodData);
      res.status(201).json(result);
    } catch (error: any) {
      console.error("Erro ao salvar rastreamento de humor:", error);
      res.status(500).json({ 
        message: "Erro ao salvar registro de humor", 
        error: error.message 
      });
    }
  });

  app.get("/api/mood-tracking", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Autenticação necessária" });
      }

      const userId = req.user.id;
      const { startDate, endDate, limit } = req.query;
      
      const options: any = {};
      
      if (startDate) {
        options.startDate = new Date(startDate as string);
      }
      
      if (endDate) {
        options.endDate = new Date(endDate as string);
      }
      
      if (limit) {
        options.limit = parseInt(limit as string);
      }
      
      const records = await storage.getUserMoodTrackings(userId, options);
      res.json(records);
    } catch (error: any) {
      console.error("Erro ao buscar registros de humor:", error);
      res.status(500).json({ 
        message: "Erro ao buscar histórico de humor", 
        error: error.message 
      });
    }
  });

  app.get("/api/mood-tracking/stats/:period", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Autenticação necessária" });
      }

      const userId = req.user.id;
      const period = req.params.period as 'day' | 'week' | 'month' | 'year';
      
      // Validar período
      if (!['day', 'week', 'month', 'year'].includes(period)) {
        return res.status(400).json({ 
          message: "Período inválido. Use: day, week, month ou year" 
        });
      }
      
      const stats = await storage.getMoodTrackingStats(userId, period);
      res.json(stats);
    } catch (error: any) {
      console.error("Erro ao buscar estatísticas de humor:", error);
      res.status(500).json({ 
        message: "Erro ao gerar estatísticas de humor", 
        error: error.message 
      });
    }
  });

  app.delete("/api/mood-tracking/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Autenticação necessária" });
      }

      const moodId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Verificar se o registro pertence ao usuário
      const record = await storage.getMoodTrackingById(moodId);
      
      if (!record) {
        return res.status(404).json({ message: "Registro não encontrado" });
      }
      
      if (record.userId !== userId) {
        return res.status(403).json({ message: "Você não tem permissão para excluir este registro" });
      }
      
      const result = await storage.deleteMoodTracking(moodId);
      
      if (result) {
        res.json({ success: true, message: "Registro excluído com sucesso" });
      } else {
        res.status(500).json({ message: "Erro ao excluir registro" });
      }
    } catch (error: any) {
      console.error("Erro ao excluir registro de humor:", error);
      res.status(500).json({ 
        message: "Erro ao excluir registro de humor", 
        error: error.message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
