import { Card, CardContent } from "@/components/ui/card";
import { Users, BookOpen, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import GlobalSearch from "@/components/GlobalSearch";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Full Page Search */}
      <section className="py-8 md:py-16 px-2 md:px-4 bg-gradient-to-br from-primary/5 to-secondary/10 min-h-screen flex items-center">
        <div className="container mx-auto text-center px-2">
          <div className="flex items-center justify-center gap-3 md:gap-4 mb-4 md:mb-6">
            <img src="/logo.svg" alt="IPEC Logo" className="h-10 w-10 md:h-16 md:w-16" />
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-[#04a7d7] leading-none">
              IPEC ADMINISTRATION
            </h1>
          </div>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 md:mb-12 max-w-3xl mx-auto px-2">
            Système de gestion des étudiants et documents académiques
          </p>
          
          {/* Grande barre de recherche en pleine page */}
          <div className="max-w-4xl mx-auto mb-8 md:mb-12 px-2">
            <GlobalSearch 
              variant="full"
              placeholder="Rechercher un étudiant, une attestation, une facture..."
              autoFocus
            />
          </div>
          
          <div className="flex items-center justify-center gap-2 text-sm sm:text-base md:text-lg text-muted-foreground px-4">
            <span className="text-center">Recherchez par nom, référence, numéro d'attestation ou de facture</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
