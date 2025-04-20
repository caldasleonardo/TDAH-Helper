import { useState } from "react";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { BrainIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { motion } from "framer-motion";
import { signInWithGoogle, signInWithApple } from "@/lib/auth-service";
import { useToast } from "@/hooks/use-toast";

// Extended schema with required email and password confirmation
const registerSchema = insertUserSchema.extend({
  email: z.string().email("Email inválido").optional(),
  confirmPassword: z.string().min(4, "A senha deve ter pelo menos 4 caracteres")
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

// Login schema
const loginSchema = z.object({
  username: z.string().min(1, "Nome de usuário é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [socialLoginPending, setSocialLoginPending] = useState(false);
  
  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });
  
  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });
  
  // Handle register submit
  const onRegisterSubmit = (data: RegisterFormValues) => {
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  };
  
  // Handle login submit
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };
  
  // Handle Google login
  const handleGoogleLogin = async () => {
    try {
      setSocialLoginPending(true);
      await signInWithGoogle();
      // No need to do anything after successful login, the component will redirect
    } catch (error: any) {
      toast({
        title: "Erro no login com Google",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSocialLoginPending(false);
    }
  };
  
  // Handle Apple login
  const handleAppleLogin = async () => {
    try {
      setSocialLoginPending(true);
      await signInWithApple();
      // No need to do anything after successful login, the component will redirect
    } catch (error: any) {
      toast({
        title: "Erro no login com Apple",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSocialLoginPending(false);
    }
  };
  
  // Redirect if user is already logged in
  if (user) {
    return <Redirect to="/" />;
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-6 md:py-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="p-6 md:p-8">
                <div className="flex justify-center mb-6">
                  <div className="h-20 w-20 flex items-center justify-center bg-primary/10 dark:bg-primary/20 rounded-full">
                    <BrainIcon className="h-10 w-10 text-primary" />
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-center mb-6 dark:text-white">
                  TDAH Helper
                </h2>
                
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Cadastrar</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login">
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-username">Nome de usuário</Label>
                        <Input
                          id="login-username"
                          {...loginForm.register("username")}
                          placeholder="Seu nome de usuário"
                        />
                        {loginForm.formState.errors.username && (
                          <p className="text-sm text-red-500">{loginForm.formState.errors.username.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Senha</Label>
                        <div className="relative">
                          <Input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            {...loginForm.register("password")}
                            placeholder="Sua senha"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOffIcon className="h-4 w-4" />
                            ) : (
                              <EyeIcon className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        {loginForm.formState.errors.password && (
                          <p className="text-sm text-red-500">{loginForm.formState.errors.password.message}</p>
                        )}
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? "Entrando..." : "Entrar"}
                      </Button>
                      
                      <div className="relative flex items-center justify-center mt-6">
                        <hr className="flex-grow border-neutral-200 dark:border-neutral-700" />
                        <span className="mx-4 text-sm text-neutral-500 dark:text-neutral-400">ou continue com</span>
                        <hr className="flex-grow border-neutral-200 dark:border-neutral-700" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <Button 
                          type="button"
                          variant="outline" 
                          className="flex justify-center items-center py-5"
                          onClick={handleGoogleLogin}
                          disabled={socialLoginPending || loginMutation.isPending}
                        >
                          <FcGoogle className="mr-2 h-5 w-5" />
                          <span>Google</span>
                        </Button>
                        <Button 
                          type="button"
                          variant="outline" 
                          className="flex justify-center items-center py-5"
                          onClick={handleAppleLogin}
                          disabled={socialLoginPending || loginMutation.isPending}
                        >
                          <FaApple className="mr-2 h-5 w-5" />
                          <span>Apple</span>
                        </Button>
                      </div>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="register">
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-username">Nome de usuário</Label>
                        <Input
                          id="register-username"
                          {...registerForm.register("username")}
                          placeholder="Escolha um nome de usuário"
                        />
                        {registerForm.formState.errors.username && (
                          <p className="text-sm text-red-500">{registerForm.formState.errors.username.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="register-email">Email (opcional)</Label>
                        <Input
                          id="register-email"
                          type="email"
                          {...registerForm.register("email")}
                          placeholder="Seu email"
                        />
                        {registerForm.formState.errors.email && (
                          <p className="text-sm text-red-500">{registerForm.formState.errors.email.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="register-password">Senha</Label>
                        <div className="relative">
                          <Input
                            id="register-password"
                            type={showPassword ? "text" : "password"}
                            {...registerForm.register("password")}
                            placeholder="Escolha uma senha"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOffIcon className="h-4 w-4" />
                            ) : (
                              <EyeIcon className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        {registerForm.formState.errors.password && (
                          <p className="text-sm text-red-500">{registerForm.formState.errors.password.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="register-confirm-password">Confirmar senha</Label>
                        <div className="relative">
                          <Input
                            id="register-confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            {...registerForm.register("confirmPassword")}
                            placeholder="Confirme sua senha"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOffIcon className="h-4 w-4" />
                            ) : (
                              <EyeIcon className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        {registerForm.formState.errors.confirmPassword && (
                          <p className="text-sm text-red-500">{registerForm.formState.errors.confirmPassword.message}</p>
                        )}
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "Cadastrando..." : "Cadastrar"}
                      </Button>
                      
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center mt-4">
                        Ao cadastrar, você concorda com nossos <a href="#" className="text-primary hover:underline">Termos de Uso</a> e <a href="#" className="text-primary hover:underline">Política de Privacidade</a>.
                      </p>

                      <div className="relative flex items-center justify-center mt-6">
                        <hr className="flex-grow border-neutral-200 dark:border-neutral-700" />
                        <span className="mx-4 text-sm text-neutral-500 dark:text-neutral-400">ou cadastre com</span>
                        <hr className="flex-grow border-neutral-200 dark:border-neutral-700" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <Button 
                          type="button"
                          variant="outline" 
                          className="flex justify-center items-center py-5"
                          onClick={handleGoogleLogin}
                          disabled={socialLoginPending || registerMutation.isPending}
                        >
                          <FcGoogle className="mr-2 h-5 w-5" />
                          <span>Google</span>
                        </Button>
                        <Button 
                          type="button"
                          variant="outline" 
                          className="flex justify-center items-center py-5"
                          onClick={handleAppleLogin}
                          disabled={socialLoginPending || registerMutation.isPending}
                        >
                          <FaApple className="mr-2 h-5 w-5" />
                          <span>Apple</span>
                        </Button>
                      </div>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
      
      <BottomNav />
    </div>
  );
}
