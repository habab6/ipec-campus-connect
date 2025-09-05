// Base de données simplifiée mais étendue des villes mondiales
export const WORLD_CITIES_MAPPING: Record<string, string> = {
  // Europe (principales villes)
  "Bruxelles": "Belgique", "Anvers": "Belgique", "Gand": "Belgique", "Charleroi": "Belgique", "Liège": "Belgique",
  "Paris": "France", "Marseille": "France", "Lyon": "France", "Toulouse": "France", "Nice": "France", "Nantes": "France", "Strasbourg": "France", "Montpellier": "France", "Bordeaux": "France", "Lille": "France",
  "Berlin": "Allemagne", "Hambourg": "Allemagne", "Munich": "Allemagne", "Cologne": "Allemagne", "Francfort-sur-le-Main": "Allemagne", "Stuttgart": "Allemagne", "Düsseldorf": "Allemagne", "Dortmund": "Allemagne", "Essen": "Allemagne", "Leipzig": "Allemagne",
  "Amsterdam": "Pays-Bas", "Rotterdam": "Pays-Bas", "La Haye": "Pays-Bas", "Utrecht": "Pays-Bas", "Eindhoven": "Pays-Bas",
  "Madrid": "Espagne", "Barcelone": "Espagne", "Valence": "Espagne", "Séville": "Espagne", "Saragosse": "Espagne", "Málaga": "Espagne",
  "Rome": "Italie", "Milan": "Italie", "Naples": "Italie", "Turin": "Italie", "Palerme": "Italie", "Gênes": "Italie", "Bologne": "Italie", "Florence": "Italie",
  "Londres": "Royaume-Uni", "Birmingham": "Royaume-Uni", "Manchester": "Royaume-Uni", "Glasgow": "Royaume-Uni", "Liverpool": "Royaume-Uni", "Leeds": "Royaume-Uni", "Sheffield": "Royaume-Uni", "Édimbourg": "Royaume-Uni",
  
  // Afrique (focus sur les pays demandés)
  "Casablanca": "Maroc", "Rabat": "Maroc", "Fès": "Maroc", "Marrakech": "Maroc", "Agadir": "Maroc", "Tanger": "Maroc", "Meknès": "Maroc", "Oujda": "Maroc", "Kénitra": "Maroc", "Tétouan": "Maroc", "Salé": "Maroc", "El Jadida": "Maroc", "Beni Mellal": "Maroc", "Nador": "Maroc", "Taza": "Maroc", "Settat": "Maroc", "Larache": "Maroc", "Khémisset": "Maroc", "Guelmim": "Maroc", "Errachidia": "Maroc",
  "Alger": "Algérie", "Oran": "Algérie", "Constantine": "Algérie", "Annaba": "Algérie", "Blida": "Algérie", "Batna": "Algérie", "Djelfa": "Algérie", "Sétif": "Algérie", "Sidi Bel Abbès": "Algérie", "Biskra": "Algérie", "Tébessa": "Algérie", "El Oued": "Algérie", "Skikda": "Algérie", "Tiaret": "Algérie", "Béjaïa": "Algérie", "Tlemcen": "Algérie", "Ouargla": "Algérie", "Ech Chlef": "Algérie", "Mostaganem": "Algérie", "Bordj Bou Arréridj": "Algérie",
  "Tunis": "Tunisie", "Sfax": "Tunisie", "Sousse": "Tunisie", "Kairouan": "Tunisie", "Bizerte": "Tunisie", "Gabès": "Tunisie", "Ariana": "Tunisie", "Gafsa": "Tunisie", "Monastir": "Tunisie", "Ben Arous": "Tunisie", "Kasserine": "Tunisie", "Médenine": "Tunisie", "Nabeul": "Tunisie", "Tataouine": "Tunisie", "Beja": "Tunisie", "Jendouba": "Tunisie", "Mahdia": "Tunisie", "Sidi Bouzid": "Tunisie", "Kef": "Tunisie", "Tozeur": "Tunisie",
  "Dakar": "Sénégal", "Touba": "Sénégal", "Thiès": "Sénégal", "Kaolack": "Sénégal", "Saint-Louis": "Sénégal", "Mbour": "Sénégal", "Ziguinchor": "Sénégal", "Diourbel": "Sénégal", "Louga": "Sénégal", "Tambacounda": "Sénégal", "Rufisque": "Sénégal", "Richard Toll": "Sénégal", "Kolda": "Sénégal", "Fatick": "Sénégal", "Kaffrine": "Sénégal", "Sédhiou": "Sénégal", "Matam": "Sénégal", "Kédougou": "Sénégal", "Linguère": "Sénégal", "Podor": "Sénégal",
  "Yaoundé": "Cameroun", "Douala": "Cameroun", "Garoua": "Cameroun", "Bamenda": "Cameroun", "Maroua": "Cameroun", "Bafoussam": "Cameroun", "Ngaoundéré": "Cameroun", "Bertoua": "Cameroun", "Ebolowa": "Cameroun", "Kribi": "Cameroun", "Edéa": "Cameroun", "Kumba": "Cameroun", "Foumban": "Cameroun", "Mbouda": "Cameroun", "Dschang": "Cameroun", "Limbe": "Cameroun", "Mbalmayo": "Cameroun", "Sangmélima": "Cameroun", "Buea": "Cameroun", "Guider": "Cameroun",
  "Brazzaville": "République du Congo", "Pointe-Noire": "République du Congo", "Dolisie": "République du Congo", "Nkayi": "République du Congo", "Mossendjo": "République du Congo", "Impfondo": "République du Congo", "Ouesso": "République du Congo", "Madingou": "République du Congo", "Owando": "République du Congo", "Sibiti": "République du Congo",
  "Kinshasa": "République démocratique du Congo", "Lubumbashi": "République démocratique du Congo", "Mbuji-Mayi": "République démocratique du Congo", "Kisangani": "République démocratique du Congo", "Kananga": "République démocratique du Congo", "Bukavu": "République démocratique du Congo", "Tshikapa": "République démocratique du Congo", "Kolwezi": "République démocratique du Congo", "Likasi": "République démocratique du Congo", "Goma": "République démocratique du Congo",
  "Libreville": "Gabon", "Port-Gentil": "Gabon", "Franceville": "Gabon", "Oyem": "Gabon", "Moanda": "Gabon", "Mouila": "Gabon", "Lambaréné": "Gabon", "Tchibanga": "Gabon", "Koulamoutou": "Gabon", "Makokou": "Gabon",
  "Conakry": "Guinée", "Nzérékoré": "Guinée", "Kankan": "Guinée", "Kindia": "Guinée", "Labe": "Guinée", "Mamou": "Guinée", "Boke": "Guinée", "Faranah": "Guinée", "Kissidougou": "Guinée", "Dabola": "Guinée",
  
  // Autres continents (villes principales)
  "New York": "États-Unis", "Los Angeles": "États-Unis", "Chicago": "États-Unis", "Houston": "États-Unis", "Phoenix": "États-Unis", "Philadelphie": "États-Unis", "San Antonio": "États-Unis", "San Diego": "États-Unis", "Dallas": "États-Unis", "San José": "États-Unis",
  "Toronto": "Canada", "Montréal": "Canada", "Vancouver": "Canada", "Calgary": "Canada", "Edmonton": "Canada", "Ottawa": "Canada", "Winnipeg": "Canada", "Québec": "Canada",
  "Mexico": "Mexique", "Guadalajara": "Mexique", "Monterrey": "Mexique", "Puebla": "Mexique", "Tijuana": "Mexique", "León": "Mexique",
  "Tokyo": "Japon", "Osaka": "Japon", "Yokohama": "Japon", "Nagoya": "Japon", "Sapporo": "Japon", "Fukuoka": "Japon",
  "Pékin": "Chine", "Shanghai": "Chine", "Chongqing": "Chine", "Tianjin": "Chine", "Guangzhou": "Chine", "Shenzhen": "Chine",
  "Mumbai": "Inde", "Delhi": "Inde", "Bangalore": "Inde", "Hyderabad": "Inde", "Ahmedabad": "Inde", "Chennai": "Inde",
  "Sydney": "Australie", "Melbourne": "Australie", "Brisbane": "Australie", "Perth": "Australie", "Adélaïde": "Australie", "Gold Coast": "Australie",
  "Auckland": "Nouvelle-Zélande", "Wellington": "Nouvelle-Zélande", "Christchurch": "Nouvelle-Zélande", "Hamilton NZ": "Nouvelle-Zélande", "Dunedin": "Nouvelle-Zélande", "Tauranga": "Nouvelle-Zélande"
};

export const WORLD_CITIES_LIST = Object.keys(WORLD_CITIES_MAPPING).sort();