import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { COUNTRY_CODES } from '@/utils/countryCodes';

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
      const filtered = cities.filter(city =>
        city && city.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 10); // Limite à 10 suggestions
      setFilteredCities(filtered);
      setIsOpen(filtered.length > 0);
      setHighlightedIndex(-1);
    } else {
      setFilteredCities([]);
      setIsOpen(false);
    }
  }, [value, cities]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
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
    
    // Si la ville a un pays associé, on déclenche le callback
    if (onCitySelect && cityToCountryMapping && cityToCountryMapping[city]) {
      onCitySelect(city, cityToCountryMapping[city]);
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