import { useState, useEffect } from "react";
import { Search, X, User, FileText, Receipt, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Student, RegistrationAttestation, Invoice } from "@/types";
import { dbStudentToStudent } from "@/utils/dataTransforms";

interface SearchResult {
  id: string;
  type: 'student' | 'attestation' | 'invoice';
  title: string;
  subtitle: string;
  description: string;
  link: string;
  data: any;
}

interface GlobalSearchProps {
  variant?: 'compact' | 'full';
  placeholder?: string;
  autoFocus?: boolean;
  onSelect?: () => void;
}

const GlobalSearch = ({ 
  variant = 'compact', 
  placeholder = "Rechercher...", 
  autoFocus = false,
  onSelect
}: GlobalSearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Fonction de recherche
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const performSearch = async () => {
      setIsLoading(true);
      const searchQuery = query.toLowerCase().trim();
      const searchResults: SearchResult[] = [];

      try {
        // Recherche dans les étudiants par nom, prénom ou référence
        const { data: studentsData } = await supabase
          .from('students')
          .select('*')
          .or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,reference.ilike.%${searchQuery}%`);

        if (studentsData) {
          studentsData.forEach(dbStudent => {
            const student = dbStudentToStudent(dbStudent as any);
            searchResults.push({
              id: student.id,
              type: 'student',
              title: `${student.firstName} ${student.lastName}`,
              subtitle: `Référence: ${student.reference}`,
              description: `${student.program} - ${student.studyYear}ème année - ${student.specialty}`,
              link: `/edit-student/${student.id}`,
              data: student
            });
          });
        }

        // Recherche dans les attestations par numéro
        const { data: attestationsData } = await supabase
          .from('registration_attestations')
          .select(`
            *,
            students!inner(*)
          `)
          .or(`number.ilike.%${searchQuery}%,student_full_name.ilike.%${searchQuery}%,student_reference.ilike.%${searchQuery}%`);

        if (attestationsData) {
          attestationsData.forEach(attestation => {
            const student = dbStudentToStudent(attestation.students as any);
            searchResults.push({
              id: attestation.id,
              type: 'attestation',
              title: `Attestation ${attestation.number}`,
              subtitle: `${attestation.student_full_name || `${student.firstName} ${student.lastName}`}`,
              description: `${attestation.program} - ${attestation.study_year}ème année - ${attestation.academic_year}`,
              link: `/documents/${student.id}`,
              data: { attestation, student }
            });
          });
        }

        // Recherche dans les factures par numéro
        const { data: invoicesData } = await supabase
          .from('invoices')
          .select(`
            *,
            students!inner(*)
          `)
          .ilike('number', `%${searchQuery}%`);

        if (invoicesData) {
          invoicesData.forEach(invoice => {
            const student = dbStudentToStudent(invoice.students as any);
            searchResults.push({
              id: invoice.id,
              type: 'invoice',
              title: `Facture ${invoice.number}`,
              subtitle: `${student.firstName} ${student.lastName}`,
              description: `${invoice.type} - ${invoice.amount}€ ${invoice.academic_year ? `- ${invoice.academic_year}` : ''}`,
              link: `/documents/${student.id}`,
              data: { invoice, student }
            });
          });
        }

        // Trier par pertinence (correspondance exacte en premier)
        const sortedResults = searchResults.sort((a, b) => {
          const aExact = a.title.toLowerCase().includes(searchQuery) || 
                         a.subtitle.toLowerCase().includes(searchQuery);
          const bExact = b.title.toLowerCase().includes(searchQuery) || 
                         b.subtitle.toLowerCase().includes(searchQuery);
          
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;
          return 0;
        });

        setResults(sortedResults.slice(0, 10)); // Limiter à 10 résultats
        setIsOpen(sortedResults.length > 0);
      } catch (error) {
        console.error('Erreur lors de la recherche:', error);
        setResults([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(performSearch, 300); // Debounce de 300ms
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleResultClick = (result: SearchResult) => {
    navigate(result.link);
    setQuery("");
    setIsOpen(false);
    onSelect?.();
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'student':
        return <User className="h-4 w-4 text-primary" />;
      case 'attestation':
        return <FileText className="h-4 w-4 text-secondary" />;
      case 'invoice':
        return <Receipt className="h-4 w-4 text-orange-500" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const inputClassName = variant === 'full' 
    ? "text-lg py-4 pl-12 pr-12 rounded-xl border-2 focus:border-primary"
    : "pl-10 pr-8";

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground ${
          variant === 'full' ? 'h-6 w-6' : 'h-4 w-4'
        }`} />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={inputClassName}
          autoFocus={autoFocus}
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 shadow-lg border z-50 max-h-80 overflow-y-auto bg-background">
          <CardContent className="p-0">
            {results.map((result) => (
              <div
                key={`${result.type}-${result.id}`}
                onClick={() => handleResultClick(result)}
                className="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer border-b last:border-b-0 transition-colors"
              >
                <div className="flex-shrink-0">
                  {getResultIcon(result.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {result.title}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {result.subtitle}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {result.description}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {isOpen && results.length === 0 && query.trim() && (
        <Card className="absolute top-full left-0 right-0 mt-2 shadow-lg border z-50 bg-background">
          <CardContent className="p-4 text-center text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucun résultat trouvé pour "{query}"</p>
            <p className="text-xs mt-1">
              Recherchez par nom, prénom, référence étudiant, numéro d'attestation ou de facture
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GlobalSearch;