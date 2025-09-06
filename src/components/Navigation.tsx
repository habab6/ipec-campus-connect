import { Button } from "@/components/ui/button";
import { GraduationCap, Users, UserPlus, Home, CreditCard, Search } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import GlobalSearch from "@/components/GlobalSearch";

const Navigation = () => {
  const location = useLocation();
  const [showSearch, setShowSearch] = useState(false);

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
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              IPEC Bruxelles
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Search Toggle */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSearch(!showSearch)}
                className="flex items-center space-x-2"
              >
                <Search className="h-4 w-4" />
                <span className="hidden md:inline">Rechercher</span>
              </Button>
              
              {showSearch && (
                <div className="absolute top-full right-0 mt-2 w-80 z-50">
                  <GlobalSearch 
                    placeholder="Rechercher étudiant, attestation, facture..."
                    onSelect={() => setShowSearch(false)}
                  />
                </div>
              )}
            </div>

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