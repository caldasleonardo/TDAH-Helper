import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./lib/theme-provider";
import { AuthProvider } from "./hooks/use-auth";
import { SubscriptionProvider } from "./hooks/use-subscription";
import { ProtectedRoute } from "./lib/protected-route";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import QuizPage from "@/pages/quiz-page";
import ResultsPage from "@/pages/results-page";
import AuthPage from "@/pages/auth-page";
import ContentPage from "@/pages/content-page";
import ProfilePage from "@/pages/profile-page";
import CheckoutPage from "@/pages/checkout-page";

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
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/checkout/:quizResultId" component={CheckoutPage} />
      <ProtectedRoute path="/checkout/confirm/:quizResultId" component={CheckoutPage} />
      <ProtectedRoute path="/premium" component={PremiumPage} />
      <ProtectedRoute path="/subscribe" component={SubscribePage} />
      
      {/* Rotas para conteúdo premium */}
      <ProtectedRoute path="/premium-content" component={PremiumContentPage} />
      <ProtectedRoute path="/premium-content/:id" component={PremiumContentPage} />
      <ProtectedRoute path="/premium-tools/pomodoro" component={PomodoroTool} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
