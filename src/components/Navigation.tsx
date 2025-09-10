import { Button } from "@/components/ui/button";
import { Users, UserPlus, Home, CreditCard } from "lucide-react";
import { Link, useLocation } from "react-router-dom";


const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { href: "/", label: "Accueil", icon: Home },
    { href: "/students", label: "Étudiants", icon: Users },
    { href: "/register", label: "Inscription", icon: UserPlus },
    { href: "/payments", label: "Paiements", icon: CreditCard },
  ];

  return (
    <nav className="bg-card shadow-soft border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <img src="/logo.svg" alt="IPEC Logo" className="h-8 w-8" />
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              IPEC Bruxelles
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Navigation Items */}
            <div className="flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link key={item.href} to={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;