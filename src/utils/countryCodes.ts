// Mapping des codes pays vers leur nom et codes ISO
export const COUNTRY_CODES: Record<string, string> = {
  // Codes courts utilisés dans le mapping des villes
  "MA": "🇲🇦", "DZ": "🇩🇿", "TN": "🇹🇳", "SN": "🇸🇳", "CM": "🇨🇲", "CG": "🇨🇬", "CD": "🇨🇩", "GA": "🇬🇦", "GN": "🇬🇳",
  "FR": "🇫🇷", "DE": "🇩🇪", "GB": "🇬🇧", "IT": "🇮🇹", "ES": "🇪🇸", "NL": "🇳🇱", "BE": "🇧🇪",
  "RS": "🇷🇸", "HR": "🇭🇷", "BA": "🇧🇦", "SI": "🇸🇮", "MK": "🇲🇰", "AL": "🇦🇱", "ME": "🇲🇪", "BG": "🇧🇬", "GR": "🇬🇷", "TR": "🇹🇷",
  "US": "🇺🇸", "CA": "🇨🇦",
  "JP": "🇯🇵", "CN": "🇨🇳", "KR": "🇰🇷", "IN": "🇮🇳", "TH": "🇹🇭", "ID": "🇮🇩", "PH": "🇵🇭", "SG": "🇸🇬", "MY": "🇲🇾", "VN": "🇻🇳",
  "BR": "🇧🇷", "AR": "🇦🇷", "PE": "🇵🇪", "CO": "🇨🇴", "CL": "🇨🇱", "VE": "🇻🇪", "BO": "🇧🇴", "EC": "🇪🇨", "UY": "🇺🇾", "PY": "🇵🇾", "GY": "🇬🇾", "SR": "🇸🇷", "GF": "🇬🇫",
  "AU": "🇦🇺", "NZ": "🇳🇿", "PG": "🇵🇬"
};

// Mapping complet des noms de pays vers leurs codes ISO (pour compatibilité)
export const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  "Afghanistan": "AF", "Afrique du Sud": "ZA", "Albanie": "AL", "Algérie": "DZ", "Allemagne": "DE", "Andorre": "AD", "Angola": "AO", "Antigua-et-Barbuda": "AG", "Arabie saoudite": "SA", "Argentine": "AR", "Arménie": "AM", "Australie": "AU", "Autriche": "AT", "Azerbaïdjan": "AZ",
  "Bahamas": "BS", "Bahreïn": "BH", "Bangladesh": "BD", "Barbade": "BB", "Bélarus": "BY", "Belgique": "BE", "Belize": "BZ", "Bénin": "BJ", "Bhoutan": "BT", "Birmanie": "MM", "Bolivie": "BO", "Bosnie-Herzégovine": "BA", "Botswana": "BW", "Brésil": "BR", "Brunei": "BN", "Bulgarie": "BG", "Burkina Faso": "BF", "Burundi": "BI",
  "Cambodge": "KH", "Cameroun": "CM", "Canada": "CA", "Cap-Vert": "CV", "Centrafrique": "CF", "Chili": "CL", "Chine": "CN", "Chypre": "CY", "Colombie": "CO", "Comores": "KM", "République du Congo": "CG", "République démocratique du Congo": "CD", "Corée du Nord": "KP", "Corée du Sud": "KR", "Costa Rica": "CR", "Côte d'Ivoire": "CI", "Croatie": "HR", "Cuba": "CU",
  "Danemark": "DK", "Djibouti": "DJ", "Dominique": "DM", "République dominicaine": "DO",
  "Égypte": "EG", "Émirats arabes unis": "AE", "Équateur": "EC", "Érythrée": "ER", "Espagne": "ES", "Estonie": "EE", "Eswatini": "SZ", "États-Unis": "US", "Éthiopie": "ET",
  "Fidji": "FJ", "Finlande": "FI", "France": "FR",
  "Gabon": "GA", "Gambie": "GM", "Géorgie": "GE", "Ghana": "GH", "Grèce": "GR", "Grenade": "GD", "Guatemala": "GT", "Guinée": "GN", "Guinée-Bissau": "GW", "Guinée équatoriale": "GQ", "Guyana": "GY",
  "Haïti": "HT", "Honduras": "HN", "Hongrie": "HU",
  "Îles Marshall": "MH", "Îles Salomon": "SB", "Inde": "IN", "Indonésie": "ID", "Irak": "IQ", "Iran": "IR", "Irlande": "IE", "Islande": "IS", "Israël": "IL", "Italie": "IT",
  "Jamaïque": "JM", "Japon": "JP", "Jordanie": "JO",
  "Kazakhstan": "KZ", "Kenya": "KE", "Kirghizistan": "KG", "Kiribati": "KI", "Koweït": "KW",
  "Laos": "LA", "Lesotho": "LS", "Lettonie": "LV", "Liban": "LB", "Liberia": "LR", "Libye": "LY", "Liechtenstein": "LI", "Lituanie": "LT", "Luxembourg": "LU",
  "Macédoine du Nord": "MK", "Madagascar": "MG", "Malaisie": "MY", "Malawi": "MW", "Maldives": "MV", "Mali": "ML", "Malte": "MT", "Maroc": "MA", "Maurice": "MU", "Mauritanie": "MR", "Mexique": "MX", "Micronésie": "FM", "Moldavie": "MD", "Monaco": "MC", "Mongolie": "MN", "Monténégro": "ME", "Mozambique": "MZ",
  "Namibie": "NA", "Nauru": "NR", "Népal": "NP", "Nicaragua": "NI", "Niger": "NE", "Nigeria": "NG", "Norvège": "NO", "Nouvelle-Zélande": "NZ",
  "Oman": "OM", "Ouganda": "UG", "Ouzbékistan": "UZ",
  "Pakistan": "PK", "Palaos": "PW", "Palestine": "PS", "Panama": "PA", "Papouasie-Nouvelle-Guinée": "PG", "Paraguay": "PY", "Pays-Bas": "NL", "Pérou": "PE", "Philippines": "PH", "Pologne": "PL", "Portugal": "PT",
  "Qatar": "QA",
  "Roumanie": "RO", "Royaume-Uni": "GB", "Russie": "RU", "Rwanda": "RW",
  "Saint-Christophe-et-Niévès": "KN", "Sainte-Lucie": "LC", "Saint-Marin": "SM", "Saint-Vincent-et-les-Grenadines": "VC", "Salvador": "SV", "Samoa": "WS", "São Tomé-et-Principe": "ST", "Sénégal": "SN", "Serbie": "RS", "Seychelles": "SC", "Sierra Leone": "SL", "Singapour": "SG", "Slovaquie": "SK", "Slovénie": "SI", "Somalie": "SO", "Soudan": "SD", "Soudan du Sud": "SS", "Sri Lanka": "LK", "Suède": "SE", "Suisse": "CH", "Suriname": "SR", "Syrie": "SY",
  "Tadjikistan": "TJ", "Tanzanie": "TZ", "Tchad": "TD", "Tchéquie": "CZ", "Thaïlande": "TH", "Timor oriental": "TL", "Togo": "TG", "Tonga": "TO", "Trinité-et-Tobago": "TT", "Tunisie": "TN", "Turkménistan": "TM", "Turquie": "TR", "Tuvalu": "TV",
  "Ukraine": "UA", "Uruguay": "UY",
  "Vanuatu": "VU", "Vatican": "VA", "Venezuela": "VE", "Viêt Nam": "VN",
  "Yémen": "YE",
  "Zambie": "ZM", "Zimbabwe": "ZW"
};