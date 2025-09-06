import { useState, useEffect } from "react";
import { Search, X, User, FileText, Receipt, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Student, RegistrationAttestation, Invoice } from "@/types";

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
  const [students, setStudents] = useState<Student[]>([]);
  const [attestations, setAttestations] = useState<RegistrationAttestation[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const navigate = useNavigate();

  // Charger les données depuis localStorage
  useEffect(() => {
    const loadData = () => {
      const storedStudents = JSON.parse(localStorage.getItem('students') || '[]');
      const storedAttestations = JSON.parse(localStorage.getItem('attestations') || '[]');
      const storedInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
      
      setStudents(storedStudents);
      setAttestations(storedAttestations);
      setInvoices(storedInvoices);
    };

    loadData();
    
    // Écouter les changements dans localStorage
    const handleStorageChange = () => loadData();
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Fonction de recherche
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const searchQuery = query.toLowerCase().trim();
    const searchResults: SearchResult[] = [];

    // Recherche dans les étudiants
    students.forEach(student => {
      const searchableText = [
        student.firstName,
        student.lastName,
        student.reference,
        student.email,
        student.phone,
        student.program,
        student.specialty
      ].join(' ').toLowerCase();

      if (searchableText.includes(searchQuery)) {
        searchResults.push({
          id: student.id,
          type: 'student',
          title: `${student.firstName} ${student.lastName}`,
          subtitle: `Référence: ${student.reference}`,
          description: `${student.program} - ${student.studyYear}ème année - ${student.specialty}`,
          link: `/edit-student/${student.id}`,
          data: student
        });
      }
    });

    // Recherche dans les attestations
    attestations.forEach(attestation => {
      const student = students.find(s => s.id === attestation.studentId);
      if (!student) return;

      const searchableText = [
        attestation.number,
        student.firstName,
        student.lastName,
        student.reference,
        attestation.program,
        attestation.specialty,
        attestation.academicYear
      ].join(' ').toLowerCase();

      if (searchableText.includes(searchQuery)) {
        searchResults.push({
          id: attestation.id,
          type: 'attestation',
          title: `Attestation ${attestation.number}`,
          subtitle: `${student.firstName} ${student.lastName}`,
          description: `${attestation.program} - ${attestation.studyYear}ème année - ${attestation.academicYear}`,
          link: `/documents/${student.id}`,
          data: { attestation, student }
        });
      }
    });

    // Recherche dans les factures
    invoices.forEach(invoice => {
      const student = students.find(s => s.id === invoice.studentId);
      if (!student) return;

      const searchableText = [
        invoice.number,
        student.firstName,
        student.lastName,
        student.reference,
        invoice.type,
        invoice.amount.toString()
      ].join(' ').toLowerCase();

      if (searchableText.includes(searchQuery)) {
        searchResults.push({
          id: invoice.id,
          type: 'invoice',
          title: `Facture ${invoice.number}`,
          subtitle: `${student.firstName} ${student.lastName}`,
          description: `${invoice.type} - ${invoice.amount}€ ${invoice.academicYear ? `- ${invoice.academicYear}` : ''}`,
          link: `/documents/${student.id}`,
          data: { invoice, student }
        });
      }
    });

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
  }, [query, students, attestations, invoices]);

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
              Recherchez par nom, référence, numéro d'attestation ou de facture
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GlobalSearch;