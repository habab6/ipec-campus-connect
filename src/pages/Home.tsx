import { Card, CardContent } from "@/components/ui/card";
import { Users, BookOpen, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import GlobalSearch from "@/components/GlobalSearch";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Full Page Search */}
      <section className="py-16 px-4 bg-background min-h-screen flex items-center">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-[#04a7d7]">
            IPEC Administration
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            Système de gestion des étudiants et documents académiques
          </p>
          
          {/* Grande barre de recherche en pleine page */}
          <div className="max-w-4xl mx-auto mb-12">
            <GlobalSearch 
              variant="full"
              placeholder="Rechercher un étudiant, une attestation, une facture..."
              autoFocus
            />
          </div>
          
          <div className="flex items-center justify-center gap-2 text-lg text-muted-foreground">
            <span>Recherchez par nom, référence, numéro d'attestation ou de facture</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
