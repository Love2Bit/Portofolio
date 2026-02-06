import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  User,
  Code2,
  Briefcase,
  Share2,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { logout, user } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Profile', href: '/admin/profile', icon: User },
    { name: 'Skills', href: '/admin/skills', icon: Code2 },
    { name: 'Projects', href: '/admin/projects', icon: Briefcase },
    { name: 'Socials', href: '/admin/socials', icon: Share2 },
  ];

  const NavContent = () => (
    <div className="flex flex-col h-full bg-card">
      <div className="p-6">
        <h2 className="text-xl font-display font-bold text-primary">Admin Panel</h2>
        <p className="text-sm text-muted-foreground mt-1">Welcome back, {user?.email}</p>
      </div>
      <Separator />
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer
                  ${isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
                `}
                onClick={() => setIsMobileOpen(false)}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
          onClick={() => logout()}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 border-r border-border fixed h-full z-10">
        <NavContent />
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden h-16 border-b border-border flex items-center justify-between px-4 bg-card/50 backdrop-blur-md sticky top-0 z-20">
          <span className="font-display font-bold text-primary">Admin Panel</span>
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <NavContent />
            </SheetContent>
          </Sheet>
        </div>

        <div className="p-4 md:p-8 max-w-5xl mx-auto w-full flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
