import { Card, CardContent } from "@/components/ui/card";
import { Users, BookOpen, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import GlobalSearch from "@/components/GlobalSearch";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Search */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            IPEC Bruxelles
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Système de gestion des étudiants et documents académiques
          </p>
          
          {/* Grande barre de recherche */}
          <div className="max-w-2xl mx-auto mb-8">
            <GlobalSearch 
              variant="full"
              placeholder="Rechercher un étudiant, une attestation, une facture..."
              autoFocus
            />
          </div>
          
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Recherchez par nom, référence, numéro d'attestation ou de facture</span>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Actions Rapides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link to="/register">
              <Card className="cursor-pointer hover:shadow-medium transition-shadow bg-card">
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Nouvelle Inscription</h3>
                  <p className="text-sm text-muted-foreground">
                    Ajouter un nouvel étudiant
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/students">
              <Card className="cursor-pointer hover:shadow-medium transition-shadow bg-card">
                <CardContent className="p-6 text-center">
                  <BookOpen className="h-8 w-8 text-secondary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Liste Étudiants</h3>
                  <p className="text-sm text-muted-foreground">
                    Consulter tous les étudiants
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/payments">
              <Card className="cursor-pointer hover:shadow-medium transition-shadow bg-card">
                <CardContent className="p-6 text-center">
                  <CreditCard className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Gestion Paiements</h3>
                  <p className="text-sm text-muted-foreground">
                    Suivi et facturation
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;