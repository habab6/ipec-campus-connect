import { Card, CardContent } from "@/components/ui/card";
import { Users, BookOpen, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
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