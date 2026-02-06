import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import Home from "@/pages/Home";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/admin/Dashboard";
import AdminProfile from "@/pages/admin/Profile";
import AdminSkills from "@/pages/admin/Skills";
import AdminProjects from "@/pages/admin/Projects";
import AdminSocials from "@/pages/admin/Socials";

// Protected Route Wrapper
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      
      {/* Protected Admin Routes */}
      <Route path="/admin">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/admin/profile">
        <ProtectedRoute component={AdminProfile} />
      </Route>
      <Route path="/admin/skills">
        <ProtectedRoute component={AdminSkills} />
      </Route>
      <Route path="/admin/projects">
        <ProtectedRoute component={AdminProjects} />
      </Route>
      <Route path="/admin/socials">
        <ProtectedRoute component={AdminSocials} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
