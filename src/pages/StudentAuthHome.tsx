import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentAuthHome = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <div className="container max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
            <GraduationCap className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            École Supérieure de Management
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Plateforme de gestion académique - Accès aux documents et informations personnalisés
          </p>
        </div>

        {/* Access Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Administration Access */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary" />
                Accès Administration
              </CardTitle>
              <CardDescription>
                Gestion des étudiants, paiements et documents administratifs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Gestion des inscriptions</li>
                  <li>• Suivi des paiements</li>
                  <li>• Génération de documents</li>
                  <li>• Rapports et statistiques</li>
                </ul>
                <Link to="/">
                  <Button className="w-full">
                    Accéder à l'administration
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Student Access */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <GraduationCap className="h-5 w-5 mr-2 text-secondary" />
                Espace Étudiant
              </CardTitle>
              <CardDescription>
                Consultation et téléchargement de vos documents personnels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Attestations d'inscription</li>
                  <li>• Factures et reçus</li>
                  <li>• Informations personnelles</li>
                  <li>• Historique académique</li>
                </ul>
                <Link to="/student-auth">
                  <Button variant="secondary" className="w-full">
                    Connexion étudiant
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Étudiants : Connectez-vous avec votre référence étudiant et le mot de passe par défaut "Student1"
          </p>
          <p className="mt-1">
            Pour toute assistance, contactez l'administration académique
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentAuthHome;