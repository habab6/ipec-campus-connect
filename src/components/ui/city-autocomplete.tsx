import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { COUNTRY_CODES } from '@/utils/countryCodes';

// Fonction pour normaliser les chaînes (enlever accents, cédilles, etc.)
const normalizeString = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

// Fonction pour calculer la distance de Levenshtein (similarité)
const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  return matrix[str2.length][str1.length];
};

// Fonction pour vérifier si une chaîne contient la plupart des caractères d'une autre
const containsMostChars = (search: string, target: string): number => {
  const searchChars = search.split('');
  let matchCount = 0;
  let targetIndex = 0;
  
  for (const char of searchChars) {
    const foundIndex = target.indexOf(char, targetIndex);
    if (foundIndex !== -1) {
      matchCount++;
      targetIndex = foundIndex + 1;
    }
  }
  
  return matchCount / search.length; // Retourne le pourcentage de correspondance
};

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onCitySelect?: (city: string, country: string) => void;
  cities: string[];
  cityToCountryMapping: Record<string, string>;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export const CityAutocomplete: React.FC<CityAutocompleteProps> = ({
  value,
  onChange,
  onCitySelect,
  cities,
  cityToCountryMapping,
  placeholder = "Tapez pour rechercher une ville...",
  className,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value && value.length >= 2 && cities && Array.isArray(cities)) {
      const normalizedInput = normalizeString(value);
      
      // Recherche exacte et par inclusion d'abord
      const exactMatches: string[] = [];
      const includesMatches: string[] = [];
      const fuzzyMatches: { city: string; score: number }[] = [];
      
      cities.forEach(city => {
        if (!city) return;
        
        const normalizedCity = normalizeString(city);
        
        // Correspondance exacte
        if (normalizedCity === normalizedInput) {
          exactMatches.push(city);
        }
        // Contient la recherche
        else if (normalizedCity.includes(normalizedInput)) {
          includesMatches.push(city);
        }
        // Recherche floue améliorée
        else {
          // Distance de Levenshtein
          const distance = levenshteinDistance(normalizedInput, normalizedCity);
          const maxDistance = Math.max(3, Math.floor(Math.max(normalizedInput.length, normalizedCity.length) * 0.5));
          
          // Pourcentage de caractères en commun dans l'ordre
          const charMatch = containsMostChars(normalizedInput, normalizedCity);
          
          // Score combiné (plus le score est bas, meilleur c'est)
          const score = distance - (charMatch * 10);
          
          if (distance <= maxDistance || charMatch >= 0.6) {
            fuzzyMatches.push({ city, score });
          }
        }
      });
      
      // Trier les correspondances floues par score (meilleur score = plus faible valeur)
      fuzzyMatches.sort((a, b) => a.score - b.score);
      
      // Combiner les résultats : exact -> includes -> fuzzy
      const allMatches = [
        ...exactMatches,
        ...includesMatches,
        ...fuzzyMatches.slice(0, 8).map(m => m.city) // Augmenter les correspondances floues
      ];
      
      const filtered = allMatches.slice(0, 10);
      
      // Ne pas afficher le dropdown si la valeur correspond exactement à une ville
      if (exactMatches.length > 0 && exactMatches[0].toLowerCase() === value.toLowerCase()) {
        setFilteredCities([]);
        setIsOpen(false);
      } else {
        setFilteredCities(filtered);
        setIsOpen(filtered.length > 0);
      }
      setHighlightedIndex(-1);
    } else {
      setFilteredCities([]);
      setIsOpen(false);
    }
  }, [value, cities]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        inputRef.current &&
        !inputRef.current.contains(target)
      ) {
        setTimeout(() => {
          setIsOpen(false);
          setHighlightedIndex(-1);
        }, 0);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  const handleCitySelect = (city: string) => {
    onChange(city);
    setIsOpen(false);
    setHighlightedIndex(-1);
    
    // Si la ville a un pays associé, on déclenche le callback
    if (onCitySelect && cityToCountryMapping && cityToCountryMapping[city]) {
      onCitySelect(city, cityToCountryMapping[city]);
    }
    
    // Fermer le focus de l'input pour éviter la réouverture
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredCities.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredCities.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredCities.length) {
          handleCitySelect(filteredCities[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (filteredCities && filteredCities.length > 0) {
            setIsOpen(true);
          }
        }}
        placeholder={placeholder}
        className={className}
        required={required}
        autoComplete="off"
      />
      
      {isOpen && filteredCities && filteredCities.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredCities.map((city, index) => (
            <div
              key={city}
              className={cn(
                "px-3 py-2 cursor-pointer text-sm",
                "hover:bg-accent hover:text-accent-foreground",
                highlightedIndex === index && "bg-accent text-accent-foreground"
              )}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCitySelect(city);
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <div className="flex justify-between items-center">
                <span>{city}</span>
                {cityToCountryMapping && cityToCountryMapping[city] && COUNTRY_CODES[cityToCountryMapping[city]] && (
                  <span className="text-xs text-muted-foreground font-mono">
                    {COUNTRY_CODES[cityToCountryMapping[city]]}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};