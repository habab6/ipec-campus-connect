import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogIn, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { createAccountForExistingStudent } from '@/utils/createMissingAccounts';

const StudentAuth = () => {
  const [reference, setReference] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Vérifier s'il s'agit d'un étudiant
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, student_id')
          .eq('id', session.user.id)
          .single();
        
        if (profile?.role === 'student') {
          navigate('/student-dashboard');
        }
      }
    };
    
    checkAuth();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Récupérer l'étudiant par sa référence pour obtenir l'email
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('email, reference')
        .eq('reference', reference.toUpperCase())
        .single();

      if (studentError || !student) {
        setError('Référence étudiant introuvable');
        return;
      }

      // Authentifier avec l'email et le mot de passe
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: student.email,
        password: password,
      });

      if (authError) {
        // Si l'erreur indique que l'utilisateur n'existe pas, proposer de créer le compte
        if (authError.message.includes('Invalid login credentials') || authError.message.includes('Email not confirmed')) {
          setError('Compte non trouvé. Voulez-vous créer le compte pour cet étudiant ?');
          return;
        }
        setError('Identifiants incorrects');
        return;
      }

      if (authData.session) {
        toast.success('Connexion réussie');
        navigate('/student-dashboard');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setError('Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!reference) {
      setError('Veuillez saisir une référence étudiant');
      return;
    }

    setCreatingAccount(true);
    setError('');

    try {
      await createAccountForExistingStudent(reference.toUpperCase());
      toast.success('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
      setError('');
    } catch (error) {
      console.error('Erreur lors de la création du compte:', error);
      setError('Erreur lors de la création du compte. Vérifiez que la référence est correcte.');
    } finally {
      setCreatingAccount(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <LogIn className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Espace Étudiant</CardTitle>
          <CardDescription>
            Connectez-vous pour accéder à vos documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="reference">Référence Étudiant</Label>
              <Input
                id="reference"
                type="text"
                placeholder="Ex: STU2024001"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                required
                className="uppercase"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">
                Mot de passe par défaut : Student1
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>

            {error && error.includes('Voulez-vous créer') && (
              <Button 
                type="button" 
                variant="outline" 
                className="w-full" 
                onClick={handleCreateAccount}
                disabled={creatingAccount}
              >
                {creatingAccount ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Création du compte...
                  </>
                ) : (
                  'Créer le compte étudiant'
                )}
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentAuth;