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
      <div className="container mx-auto px-2 md:px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          <div className="flex items-center space-x-2">
            <img src="/logo.svg" alt="IPEC Logo" className="h-6 w-6 md:h-8 md:w-8" />
            <span className="text-lg md:text-xl font-bold text-[#04a7d7] hidden xs:block">
              IPEC
            </span>
            <span className="text-lg font-bold text-[#04a7d7] xs:hidden">
              IPEC
            </span>
          </div>
          
          <div className="flex items-center space-x-1 md:space-x-3">
            {/* Navigation Items */}
            <div className="flex space-x-0.5 md:space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link key={item.href} to={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className="flex items-center space-x-1 md:space-x-2 px-2 md:px-3"
                    >
                      <Icon className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="hidden md:inline text-xs md:text-sm">{item.label}</span>
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
