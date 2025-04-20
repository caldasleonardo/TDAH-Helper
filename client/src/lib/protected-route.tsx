import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, useLocation } from "wouter";
import { ReactElement } from "react";

// Alteramos a tipagem do componente para aceitar qualquer tipo de componente
type ComponentType = React.ComponentType<any>;

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: ComponentType;
}) {
  const { user, isLoading } = useAuth();
  
  // Componente para exibir quando está carregando
  const LoadingComponent = () => (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
  
  // Componente para redirecionar quando não está autenticado
  const RedirectComponent = () => <Redirect to="/auth" />;

  // Renderizamos conteúdo diferente baseado no estado de autenticação
  if (isLoading) {
    return <Route path={path} component={LoadingComponent} />;
  }

  if (!user) {
    return <Route path={path} component={RedirectComponent} />;
  }

  return <Route path={path} component={Component} />;
}
