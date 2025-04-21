import React from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./lib/theme-provider";
import { AuthProvider } from "./hooks/use-auth";
import { SubscriptionProvider } from "./hooks/use-subscription";
import { MoodTrackingProvider } from "./hooks/use-mood-tracking";
import { ProtectedRoute } from "./lib/protected-route";
import { BottomNav } from "@/components/layout/bottom-nav";
import { CalmingThemeProvider } from "@/components/theme/CalmingThemeProvider";
import { ThemeLayout } from "@/components/theme/ThemeLayout";
import { ThemeSelector } from "@/components/theme/ThemeSelector";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import QuizPage from "@/pages/quiz-page";
import ResultsPage from "@/pages/results-page";
import AuthPage from "@/pages/auth-page";
import ContentPage from "@/pages/content-page";
import ProfilePage from "@/pages/profile-page";
import CheckoutPage from "@/pages/checkout-page";
import DetailedReportPage from "@/pages/detailed-report-page";
import MoodTrackingPage from "@/pages/mood-tracking-page";
import AchievementsPage from "@/pages/achievements-page";

// Importação das páginas
import PremiumPage from "./pages/premium-page";
import SubscribePage from "./pages/subscribe-page";
import PremiumContentPage from "./pages/premium-content-page";
import PomodoroTool from "./pages/premium-tools/pomodoro-tool";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <ProtectedRoute path="/quiz" component={QuizPage} />
      <ProtectedRoute path="/results/:id" component={ResultsPage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/content" component={ContentPage} />
      <ProtectedRoute path="/content/:id" component={ContentPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/checkout/:quizResultId" component={CheckoutPage} />
      <ProtectedRoute path="/checkout/confirm/:quizResultId" component={CheckoutPage} />
      <ProtectedRoute path="/detailed-report/:id" component={DetailedReportPage} />
      <ProtectedRoute path="/premium" component={PremiumPage} />
      <ProtectedRoute path="/subscribe" component={SubscribePage} />
      
      {/* Rotas para conteúdo premium */}
      <ProtectedRoute path="/premium-content" component={PremiumContentPage} />
      <ProtectedRoute path="/premium-content/:id" component={PremiumContentPage} />
      <ProtectedRoute path="/premium-tools/pomodoro" component={PomodoroTool} />
      <ProtectedRoute path="/mood-tracking" component={MoodTrackingPage} />
      <ProtectedRoute path="/achievements" component={AchievementsPage} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  
  // Páginas onde a barra de navegação inferior não deve ser exibida
  const hideBottomNavPaths = [
    "/auth", // Página de autenticação não precisa da barra de navegação
    // Outras páginas que não precisam da barra de navegação
  ];
  
  // Verificar se deve ocultar a barra de navegação na página atual
  const shouldHideBottomNav = hideBottomNavPaths.some(path => location.startsWith(path));
  
  // Adicionar padding na parte inferior para evitar que o conteúdo fique escondido sob a barra de navegação
  const contentStyle = !shouldHideBottomNav ? { paddingBottom: "5rem" } : {};
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <MoodTrackingProvider>
              <CalmingThemeProvider>
                <TooltipProvider>
                  <ThemeLayout>
                    <div style={contentStyle} className="relative z-10">
                      <Toaster />
                      <div className="fixed top-4 right-4 z-50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-full shadow-md">
                        <ThemeSelector />
                      </div>
                      <Router />
                      {!shouldHideBottomNav && <BottomNav />}
                    </div>
                  </ThemeLayout>
                </TooltipProvider>
              </CalmingThemeProvider>
            </MoodTrackingProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
