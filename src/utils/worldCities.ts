// Base de données exhaustive de villes mondiales avec codes pays
export const WORLD_CITIES_MAPPING: Record<string, string> = {
  // Afrique prioritaire - Maroc
  "Casablanca": "MA", "Rabat": "MA", "Fès": "MA", "Marrakech": "MA", "Agadir": "MA", "Tanger": "MA", "Meknès": "MA", "Oujda": "MA", "Kénitra": "MA", "Tétouan": "MA", "Salé": "MA", "El Jadida": "MA", "Beni Mellal": "MA", "Nador": "MA", "Taza": "MA", "Settat": "MA", "Larache": "MA", "Khémisset": "MA", "Guelmim": "MA", "Errachidia": "MA", "Ouarzazate": "MA", "Berkane": "MA", "Taourirt": "MA", "Khouribga": "MA", "Figuig": "MA", "Azrou": "MA", "Ifrane": "MA", "Chefchaouen": "MA", "Al Hoceïma": "MA", "Tiznit": "MA", "Essaouira": "MA", "Safi": "MA", "Mohammedia": "MA", "Temara": "MA", "Berrechid": "MA", "Oued Zem": "MA", "Taroudant": "MA", "Ouezzane": "MA", "Youssoufia": "MA", "Zagora": "MA", "Tinghir": "MA", "Midelt": "MA", "Sefrou": "MA", "Laâyoune": "MA", "Dakhla": "MA", "Smara": "MA", "Tan-Tan": "MA", "Assa": "MA",
  
  // Algérie
  "Alger": "DZ", "Oran": "DZ", "Constantine": "DZ", "Annaba": "DZ", "Blida": "DZ", "Batna": "DZ", "Djelfa": "DZ", "Sétif": "DZ", "Sidi Bel Abbès": "DZ", "Biskra": "DZ", "Tébessa": "DZ", "El Oued": "DZ", "Skikda": "DZ", "Tiaret": "DZ", "Béjaïa": "DZ", "Tlemcen": "DZ", "Ouargla": "DZ", "Ech Chlef": "DZ", "Mostaganem": "DZ", "Bordj Bou Arréridj": "DZ", "Médéa": "DZ", "Tizi Ouzou": "DZ", "El Eulma": "DZ", "Jijel": "DZ", "Relizane": "DZ", "Mascara": "DZ", "Ouled Djellal": "DZ", "Bouira": "DZ", "Tamanrasset": "DZ", "Aïn Oussera": "DZ", "Laghouat": "DZ", "Khenchela": "DZ", "Souk Ahras": "DZ", "El Bayadh": "DZ", "Hassi Messaoud": "DZ", "Touggourt": "DZ", "Aïn Beïda": "DZ", "Sig": "DZ", "Guelma": "DZ", "Saïda": "DZ", "Ghardaïa": "DZ", "Adrar": "DZ", "Tindouf": "DZ", "Illizi": "DZ", "In Salah": "DZ",
  
  // Tunisie
  "Tunis": "TN", "Sfax": "TN", "Sousse": "TN", "Kairouan": "TN", "Bizerte": "TN", "Gabès": "TN", "Ariana": "TN", "Gafsa": "TN", "Monastir": "TN", "Ben Arous": "TN", "Kasserine": "TN", "Médenine": "TN", "Nabeul": "TN", "Tataouine": "TN", "Beja": "TN", "Jendouba": "TN", "Mahdia": "TN", "Sidi Bouzid": "TN", "Kef": "TN", "Tozeur": "TN", "Siliana": "TN", "Manouba": "TN", "Zaghouan": "TN", "Kebili": "TN", "Hammamet": "TN", "Djerba": "TN", "Douz": "TN", "Tabarka": "TN", "Zarzis": "TN",
  
  // Sénégal
  "Dakar": "SN", "Touba": "SN", "Thiès": "SN", "Kaolack": "SN", "Saint-Louis": "SN", "Mbour": "SN", "Ziguinchor": "SN", "Diourbel": "SN", "Louga": "SN", "Tambacounda": "SN", "Rufisque": "SN", "Richard Toll": "SN", "Kolda": "SN", "Fatick": "SN", "Kaffrine": "SN", "Sédhiou": "SN", "Matam": "SN", "Kédougou": "SN", "Linguère": "SN", "Podor": "SN", "Tivaouane": "SN", "Mbacké": "SN", "Khombole": "SN", "Joal-Fadiouth": "SN", "Guédiawaye": "SN", "Pikine": "SN", "Dagana": "SN", "Bignona": "SN", "Vélingara": "SN", "Saraya": "SN",
  
  // Cameroun
  "Yaoundé": "CM", "Douala": "CM", "Garoua": "CM", "Bamenda": "CM", "Maroua": "CM", "Bafoussam": "CM", "Ngaoundéré": "CM", "Bertoua": "CM", "Ebolowa": "CM", "Kribi": "CM", "Edéa": "CM", "Kumba": "CM", "Foumban": "CM", "Mbouda": "CM", "Dschang": "CM", "Limbe": "CM", "Mbalmayo": "CM", "Sangmélima": "CM", "Buea": "CM", "Guider": "CM", "Mokolo": "CM", "Kaélé": "CM", "Kousseri": "CM", "Wum": "CM", "Batouri": "CM", "Yokadouma": "CM", "Mamfe": "CM", "Fundong": "CM", "Nkambe": "CM", "Bafang": "CM",
  
  // République du Congo
  "Brazzaville": "CG", "Pointe-Noire": "CG", "Dolisie": "CG", "Nkayi": "CG", "Mossendjo": "CG", "Impfondo": "CG", "Ouesso": "CG", "Madingou": "CG", "Owando": "CG", "Sibiti": "CG", "Gamboma": "CG", "Boundji": "CG", "Makoua": "CG", "Ewo": "CG", "Kinkala": "CG", "Mindouli": "CG", "Mossaka": "CG", "Djambala": "CG", "Mokeko": "CG", "Loutété": "CG",
  
  // République démocratique du Congo
  "Kinshasa": "CD", "Lubumbashi": "CD", "Mbuji-Mayi": "CD", "Kisangani": "CD", "Kananga": "CD", "Bukavu": "CD", "Tshikapa": "CD", "Kolwezi": "CD", "Likasi": "CD", "Goma": "CD", "Uvira": "CD", "Bunia": "CD", "Mbandaka": "CD", "Matadi": "CD", "Boma": "CD", "Kikwit": "CD", "Isiro": "CD", "Bandundu": "CD", "Gemena": "CD", "Ilebo": "CD",
  
  // Gabon
  "Libreville": "GA", "Port-Gentil": "GA", "Franceville": "GA", "Oyem": "GA", "Moanda": "GA", "Mouila": "GA", "Lambaréné": "GA", "Tchibanga": "GA", "Koulamoutou": "GA", "Makokou": "GA", "Bitam": "GA", "Gamba": "GA", "Mitzic": "GA", "Ndjolé": "GA", "Lastoursville": "GA", "Booué": "GA", "Okondja": "GA", "Omboué": "GA", "Mayumba": "GA", "Cocobeach": "GA",
  
  // Guinée
  "Conakry": "GN", "Nzérékoré": "GN", "Kankan": "GN", "Kindia": "GN", "Labe": "GN", "Mamou": "GN", "Boke": "GN", "Faranah": "GN", "Kissidougou": "GN", "Dabola": "GN", "Siguiri": "GN", "Kouroussa": "GN", "Macenta": "GN", "Télimélé": "GN", "Pita": "GN", "Gaoual": "GN", "Koundara": "GN", "Beyla": "GN", "Yomou": "GN", "Mali-ville": "GN",
  
  // Europe - France
  "Paris": "FR", "Marseille": "FR", "Lyon": "FR", "Toulouse": "FR", "Nice": "FR", "Nantes": "FR", "Strasbourg": "FR", "Montpellier": "FR", "Bordeaux": "FR", "Lille": "FR", "Rennes": "FR", "Reims": "FR", "Le Havre": "FR", "Saint-Étienne": "FR", "Toulon": "FR", "Grenoble": "FR", "Dijon": "FR", "Angers": "FR", "Villeurbanne": "FR", "Saint-Denis": "FR", "Nîmes": "FR", "Clermont-Ferrand": "FR", "Aix-en-Provence": "FR", "Brest": "FR", "Tours": "FR", "Amiens": "FR", "Limoges": "FR", "Annecy": "FR", "Perpignan": "FR", "Boulogne-Billancourt": "FR", "Orléans": "FR", "Metz": "FR", "Besançon": "FR", "Rouen": "FR", "Mulhouse": "FR", "Caen": "FR", "Nancy": "FR", "Argenteuil": "FR", "Roubaix": "FR", "Tourcoing": "FR", "Montreuil": "FR", "Avignon": "FR", "Créteil": "FR", "Poitiers": "FR", "Dunkerque": "FR", "Courbevoie": "FR", "Versailles": "FR", "Colombes": "FR", "Aulnay-sous-Bois": "FR", "Pau": "FR", "La Rochelle": "FR", "Calais": "FR", "Cannes": "FR",
  
  // Allemagne
  "Berlin": "DE", "Hambourg": "DE", "Munich": "DE", "Cologne": "DE", "Francfort-sur-le-Main": "DE", "Stuttgart": "DE", "Düsseldorf": "DE", "Dortmund": "DE", "Essen": "DE", "Leipzig": "DE", "Brême": "DE", "Dresde": "DE", "Hanovre": "DE", "Nuremberg": "DE", "Duisbourg": "DE", "Bochum": "DE", "Wuppertal": "DE", "Bielefeld": "DE", "Bonn": "DE", "Münster": "DE",
  
  // Royaume-Uni
  "Londres": "GB", "Birmingham": "GB", "Manchester": "GB", "Glasgow": "GB", "Liverpool": "GB", "Leeds": "GB", "Sheffield": "GB", "Édimbourg": "GB", "Bristol": "GB", "Cardiff": "GB", "Leicester": "GB", "Coventry": "GB", "Bradford": "GB", "Belfast": "GB", "Nottingham": "GB", "Hull": "GB", "Newcastle upon Tyne": "GB", "Stoke-on-Trent": "GB", "Wolverhampton": "GB", "Plymouth": "GB",
  
  // Italie
  "Rome": "IT", "Milan": "IT", "Naples": "IT", "Turin": "IT", "Palerme": "IT", "Gênes": "IT", "Bologne": "IT", "Florence": "IT", "Bari": "IT", "Catane": "IT", "Venise": "IT", "Vérone": "IT", "Messine": "IT", "Padoue": "IT", "Trieste": "IT", "Tarente": "IT", "Brescia": "IT", "Prato": "IT", "Parme": "IT", "Modène": "IT",
  
  // Espagne
  "Madrid": "ES", "Barcelone": "ES", "Valence": "ES", "Séville": "ES", "Saragosse": "ES", "Málaga": "ES", "Murcie": "ES", "Palma": "ES", "Las Palmas": "ES", "Bilbao": "ES", "Alicante": "ES", "Cordoue": "ES", "Valladolid": "ES", "Vigo": "ES", "Gijón": "ES", "L'Hospitalet de Llobregat": "ES", "La Corogne": "ES", "Vitoria-Gasteiz": "ES", "Grenade": "ES", "Elche": "ES",
  
  // Pays-Bas
  "Amsterdam": "NL", "Rotterdam": "NL", "La Haye": "NL", "Utrecht": "NL", "Eindhoven": "NL", "Tilburg": "NL", "Groningue": "NL", "Almere": "NL", "Breda": "NL", "Nimègue": "NL", "Enschede": "NL", "Haarlem": "NL", "Arnhem": "NL", "Zaanstad": "NL", "Amersfoort": "NL", "Apeldoorn": "NL", "Hoofddorp": "NL", "Maastricht": "NL", "Leiden": "NL", "Dordrecht": "NL",
  
  // Belgique
  "Bruxelles": "BE", "Anvers": "BE", "Gand": "BE", "Charleroi": "BE", "Liège": "BE", "Bruges": "BE", "Namur": "BE", "Louvain": "BE", "Mons": "BE", "Aalst": "BE", "La Louvière": "BE", "Courtrai": "BE", "Hasselt": "BE", "Saint-Nicolas": "BE", "Ostende": "BE", "Tournai": "BE", "Genk": "BE", "Seraing": "BE", "Roulers": "BE", "Verviers": "BE",
  
  // Amérique du Nord - États-Unis
  "New York": "US", "Los Angeles": "US", "Chicago": "US", "Houston": "US", "Phoenix": "US", "Philadelphie": "US", "San Antonio": "US", "San Diego": "US", "Dallas": "US", "San José": "US", "Austin": "US", "Jacksonville": "US", "Fort Worth": "US", "Columbus": "US", "Charlotte": "US", "San Francisco": "US", "Indianapolis": "US", "Seattle": "US", "Denver": "US", "Washington": "US", "Boston": "US", "El Paso": "US", "Nashville": "US", "Detroit": "US", "Oklahoma City": "US", "Portland": "US", "Las Vegas": "US", "Memphis": "US", "Louisville": "US", "Baltimore": "US", "Milwaukee": "US", "Albuquerque": "US", "Tucson": "US", "Fresno": "US", "Sacramento": "US", "Kansas City": "US", "Mesa": "US", "Atlanta": "US", "Colorado Springs": "US", "Raleigh": "US", "Omaha": "US", "Miami": "US", "Oakland": "US", "Minneapolis": "US", "Tulsa": "US", "Cleveland": "US", "Wichita": "US", "New Orleans": "US", "Bakersfield": "US", "Tampa": "US", "Honolulu": "US", "Aurora": "US", "Anaheim": "US", "Santa Ana": "US", "St. Louis": "US", "Riverside": "US", "Corpus Christi": "US", "Pittsburgh": "US", "Lexington": "US", "Anchorage": "US", "Stockton": "US", "Cincinnati": "US", "Saint Paul": "US", "Toledo": "US", "Newark": "US", "Greensboro": "US", "Plano": "US", "Henderson": "US", "Lincoln": "US", "Buffalo": "US", "Jersey City": "US", "Chula Vista": "US", "Fort Wayne": "US", "Orlando": "US", "St. Petersburg": "US", "Chandler": "US", "Laredo": "US", "Norfolk": "US", "Durham": "US", "Madison": "US", "Lubbock": "US", "Irvine": "US", "Winston-Salem": "US", "Glendale": "US", "Garland": "US", "Hialeah": "US", "Reno": "US", "Chesapeake": "US", "Gilbert": "US", "Baton Rouge": "US", "Irving": "US", "Scottsdale": "US", "North Las Vegas": "US", "Fremont": "US", "Boise": "US", "Richmond": "US", "San Bernardino": "US", "Spokane": "US", "Rochester": "US", "Des Moines": "US", "Modesto": "US", "Fayetteville": "US", "Tacoma": "US", "Oxnard": "US", "Fontana": "US", "Montgomery": "US", "Moreno Valley": "US", "Shreveport": "US", "Yonkers": "US", "Akron": "US", "Huntington Beach": "US", "Little Rock": "US", "Augusta": "US", "Amarillo": "US", "Mobile": "US", "Grand Rapids": "US", "Salt Lake City": "US", "Tallahassee": "US", "Huntsville": "US", "Grand Prairie": "US", "Knoxville": "US", "Worcester": "US", "Newport News": "US", "Brownsville": "US", "Overland Park": "US", "Santa Clarita": "US", "Providence": "US", "Garden Grove": "US", "Chattanooga": "US", "Oceanside": "US", "Jackson": "US", "Fort Lauderdale": "US", "Santa Rosa": "US", "Rancho Cucamonga": "US", "Port St. Lucie": "US", "Tempe": "US", "Cape Coral": "US", "Sioux Falls": "US", "Peoria": "US", "Pembroke Pines": "US", "Elk Grove": "US", "Salem": "US", "Lancaster": "US", "Corona": "US", "Eugene": "US", "Palmdale": "US", "Salinas": "US", "Pasadena": "US", "Fort Collins": "US", "Hayward": "US", "Pomona": "US", "Cary": "US", "Rockford": "US", "Alexandria": "US", "Escondido": "US", "McKinney": "US", "Joliet": "US", "Sunnyvale": "US", "Torrance": "US", "Bridgeport": "US", "Lakewood": "US", "Hollywood": "US", "Paterson": "US", "Naperville": "US", "Syracuse": "US", "Mesquite": "US", "Dayton": "US", "Savannah": "US", "Clarksville": "US", "Orange": "US", "Fullerton": "US", "Killeen": "US", "Frisco": "US", "Hampton": "US", "McAllen": "US", "Warren": "US", "Bellevue": "US", "West Valley City": "US", "Columbia": "US", "Olathe": "US", "Sterling Heights": "US", "New Haven": "US", "Miramar": "US", "Waco": "US", "Thousand Oaks": "US", "Cedar Rapids": "US", "Charleston": "US", "Visalia": "US", "Topeka": "US", "Elizabeth": "US", "Gainesville": "US", "Thornton": "US", "Roseville": "US", "Carrollton": "US", "Coral Springs": "US", "Stamford": "US", "Simi Valley": "US", "Concord": "US", "Hartford": "US", "Kent": "US", "Lafayette": "US", "Midland": "US", "Surprise": "US", "Denton": "US", "Victorville": "US", "Evansville": "US", "Santa Clara": "US", "Abilene": "US", "Athens": "US", "Vallejo": "US", "Allentown": "US", "Norman": "US", "Beaumont": "US", "Independence": "US", "Murfreesboro": "US", "Ann Arbor": "US", "Berkeley": "US", "Provo": "US", "El Monte": "US", "Lansing": "US", "Fargo": "US", "Downey": "US", "Costa Mesa": "US", "Wilmington": "US", "Arvada": "US", "Inglewood": "US", "Miami Gardens": "US", "Carlsbad": "US", "Westminster": "US", "Odessa": "US", "Elgin": "US", "West Jordan": "US", "Round Rock": "US", "Clearwater": "US", "Waterbury": "US", "Gresham": "US", "Fairfield": "US", "Billings": "US", "Lowell": "US", "San Buenaventura": "US", "Pueblo": "US", "High Point": "US", "West Covina": "US", "Murrieta": "US", "Antioch": "US", "Temecula": "US", "Norwalk": "US", "Centennial": "US", "Everett": "US", "Palm Bay": "US", "Wichita Falls": "US", "Green Bay": "US", "Daly City": "US", "Burbank": "US", "Richardson": "US", "Pompano Beach": "US", "North Charleston": "US", "Broken Arrow": "US", "Boulder": "US", "West Palm Beach": "US", "San Mateo": "US", "Lewisville": "US", "Fishers": "US", "Rialto": "US", "Las Cruces": "US", "Redding": "US", "Tyler": "US", "Renton": "US", "Sandy Springs": "US", "Sunrise": "US", "South Bend": "US", "Vacaville": "US", "Sparks": "US", "Hillsboro": "US", "League City": "US", "Pearland": "US", "Federal Way": "US", "Bend": "US", "San Angelo": "US",
  
  // Canada
  "Toronto": "CA", "Montreal": "CA", "Vancouver": "CA", "Calgary": "CA", "Edmonton": "CA", "Ottawa": "CA", "Winnipeg": "CA", "Québec": "CA", "Kitchener": "CA", "Halifax": "CA", "Victoria": "CA", "Windsor": "CA", "Oshawa": "CA", "Saskatoon": "CA", "Regina": "CA", "Sherbrooke": "CA", "St. John's": "CA", "Barrie": "CA",
  
  // Asie - Japon
  "Tokyo": "JP", "Osaka": "JP", "Yokohama": "JP", "Nagoya": "JP", "Sapporo": "JP", "Fukuoka": "JP", "Kobe": "JP", "Kyoto": "JP", "Kawasaki": "JP", "Saitama": "JP", "Hiroshima": "JP", "Sendai": "JP", "Chiba": "JP", "Kitakyushu": "JP", "Sakai": "JP", "Niigata": "JP", "Hamamatsu": "JP", "Okayama": "JP", "Sagamihara": "JP", "Kumamoto": "JP",
  
  // Chine
  "Pékin": "CN", "Shanghai": "CN", "Guangzhou": "CN", "Shenzhen": "CN", "Tianjin": "CN", "Wuhan": "CN", "Dongguan": "CN", "Chengdu": "CN", "Nanjing": "CN", "Chongqing": "CN", "Xi'an": "CN", "Shenyang": "CN", "Hangzhou": "CN", "Dalian": "CN", "Harbin": "CN", "Suzhou": "CN", "Qingdao": "CN", "Jinan": "CN", "Changchun": "CN", "Zhengzhou": "CN",
  
  // Corée du Sud
  "Séoul": "KR", "Busan": "KR", "Incheon": "KR", "Daegu": "KR", "Daejeon": "KR", "Gwangju": "KR", "Suwon": "KR", "Ulsan": "KR", "Changwon": "KR", "Goyang": "KR", "Yongin": "KR", "Bucheon": "KR", "Ansan": "KR", "Cheongju": "KR", "Jeonju": "KR", "Anyang": "KR", "Cheonan": "KR", "Pohang": "KR", "Uijeongbu": "KR", "Siheung": "KR",
  
  // Inde
  "Mumbai": "IN", "Delhi": "IN", "Bangalore": "IN", "Hyderabad": "IN", "Ahmedabad": "IN", "Chennai": "IN", "Kolkata": "IN", "Pune": "IN", "Jaipur": "IN", "Surat": "IN", "Lucknow": "IN", "Kanpur": "IN", "Nagpur": "IN", "Indore": "IN", "Thane": "IN", "Bhopal": "IN", "Visakhapatnam": "IN", "Pimpri-Chinchwad": "IN", "Patna": "IN", "Vadodara": "IN",
  
  // Thaïlande
  "Bangkok": "TH", "Nonthaburi": "TH", "Nakhon Ratchasima": "TH", "Chiang Mai": "TH", "Hat Yai": "TH", "Udon Thani": "TH", "Pak Kret": "TH", "Khon Kaen": "TH", "Nakhon Si Thammarat": "TH", "Chon Buri": "TH", "Rayong": "TH", "Chiang Rai": "TH", "Lampang": "TH", "Phitsanulok": "TH", "Surat Thani": "TH", "Samut Prakan": "TH", "Nakhon Pathom": "TH", "Ubon Ratchathani": "TH", "Sakon Nakhon": "TH", "Nakhon Sawan": "TH",
  
  // Indonésie
  "Jakarta": "ID", "Surabaya": "ID", "Medan": "ID", "Bandung": "ID", "Bekasi": "ID", "Tangerang": "ID", "Depok": "ID", "Semarang": "ID", "Palembang": "ID", "Makassar": "ID", "South Tangerang": "ID", "Batam": "ID", "Bogor": "ID", "Pekanbaru": "ID", "Bandar Lampung": "ID", "Malang": "ID", "Padang": "ID", "Denpasar": "ID", "Samarinda": "ID", "Tasikmalaya": "ID",
  
  // Philippines
  "Manille": "PH", "Quezon City": "PH", "Caloocan": "PH", "Davao": "PH", "Cebu": "PH", "Zamboanga": "PH", "Antipolo": "PH", "Pasig": "PH", "Taguig": "PH", "Valenzuela": "PH", "Dasmariñas": "PH", "Calamba": "PH", "Makati": "PH", "Marikina": "PH", "Muntinlupa": "PH", "Parañaque": "PH", "Las Piñas": "PH", "Bacoor": "PH", "General Santos": "PH", "Iloilo": "PH",
  
  // Malaisie et Singapour
  "Singapour": "SG", "Kuala Lumpur": "MY", "George Town": "MY", "Ipoh": "MY", "Shah Alam": "MY", "Petaling Jaya": "MY", "Johor Bahru": "MY", "Seremban": "MY", "Kuching": "MY", "Kota Kinabalu": "MY",
  
  // Vietnam
  "Hô Chi Minh-Ville": "VN", "Hanoï": "VN", "Hai Phong": "VN", "Da Nang": "VN", "Bien Hoa": "VN", "Hue": "VN", "Nha Trang": "VN", "Can Tho": "VN", "Rach Gia": "VN", "Qui Nhon": "VN", "Vung Tau": "VN", "Nam Dinh": "VN", "Thai Nguyen": "VN", "Buon Ma Thuot": "VN", "Phan Thiet": "VN", "Long Xuyen": "VN", "Ha Long": "VN", "Thai Binh": "VN", "Cam Ranh": "VN", "Vinh": "VN",
  
  // Amérique du Sud - Brésil
  "São Paulo": "BR", "Rio de Janeiro": "BR", "Salvador": "BR", "Brasília": "BR", "Fortaleza": "BR", "Belo Horizonte": "BR", "Manaus": "BR", "Curitiba": "BR", "Recife": "BR", "Goiânia": "BR", "Belém": "BR", "Porto Alegre": "BR", "Guarulhos": "BR", "Campinas": "BR", "São Luís": "BR", "São Gonçalo": "BR", "Maceió": "BR", "Duque de Caxias": "BR", "Campo Grande": "BR", "Natal": "BR",
  
  // Argentine
  "Buenos Aires": "AR", "Córdoba": "AR", "Rosario": "AR", "Mendoza": "AR", "La Plata": "AR", "Tucumán": "AR", "Mar del Plata": "AR", "Salta": "AR", "Santa Fe": "AR", "San Juan": "AR", "Resistencia": "AR", "Santiago del Estero": "AR", "Corrientes": "AR", "Posadas": "AR", "Neuquén": "AR", "Bahía Blanca": "AR", "Paraná": "AR", "Formosa": "AR", "San Luis": "AR", "La Rioja": "AR",
  
  // Pérou
  "Lima": "PE", "Arequipa": "PE", "Callao": "PE", "Trujillo": "PE", "Chiclayo": "PE", "Iquitos": "PE", "Huancayo": "PE", "Piura": "PE", "Chimbote": "PE", "Cusco": "PE", "Pucallpa": "PE", "Tacna": "PE", "Ica": "PE", "Sullana": "PE", "Juliaca": "PE", "Chincha Alta": "PE", "Huánuco": "PE", "Ayacucho": "PE", "Cajamarca": "PE", "Puno": "PE",
  
  // Colombie
  "Bogotá": "CO", "Medellín": "CO", "Cali": "CO", "Barranquilla": "CO", "Cartagena": "CO", "Cúcuta": "CO", "Soledad": "CO", "Ibagué": "CO", "Bucaramanga": "CO", "Santa Marta": "CO", "Villavicencio": "CO", "Bello": "CO", "Pereira": "CO", "Manizales": "CO", "Pasto": "CO", "Neiva": "CO", "Palmira": "CO", "Montería": "CO", "Valledupar": "CO",
  
  // Chili
  "Santiago": "CL", "Puente Alto": "CL", "Antofagasta": "CL", "Viña del Mar": "CL", "Valparaíso": "CL", "Talcahuano": "CL", "San Bernardo": "CL", "Temuco": "CL", "Iquique": "CL", "Concepción": "CL", "Rancagua": "CL", "Talca": "CL", "Arica": "CL", "Chillán": "CL", "La Serena": "CL", "Calama": "CL", "Copiapó": "CL", "Osorno": "CL", "Quillota": "CL", "Valdivia": "CL",
  
  // Venezuela
  "Caracas": "VE", "Maracaibo": "VE", "Valencia Venez": "VE", "Barquisimeto": "VE", "Maracay": "VE", "Ciudad Guayana": "VE", "San Cristóbal": "VE", "Maturín": "VE", "Ciudad Bolívar": "VE", "Cumana": "VE", "Mérida": "VE", "Turmero": "VE", "Cabimas": "VE", "Punto Fijo": "VE", "Los Teques": "VE", "Guarenas": "VE", "Acarigua": "VE", "Petare": "VE", "Barinas": "VE",
  
  // Bolivie
  "La Paz": "BO", "Santa Cruz": "BO", "Cochabamba": "BO", "Sucre": "BO", "Oruro": "BO", "Tarija": "BO", "Potosí": "BO", "Sacaba": "BO", "Quillacollo": "BO", "Trinidad": "BO",
  
  // Équateur
  "Quito": "EC", "Guayaquil": "EC", "Cuenca": "EC", "Santo Domingo": "EC", "Machala": "EC", "Manta": "EC", "Portoviejo": "EC", "Ambato": "EC", "Riobamba": "EC", "Loja": "EC",
  
  // Uruguay
  "Montevideo": "UY", "Salto": "UY", "Paysandú": "UY", "Las Piedras": "UY", "Rivera": "UY", "Maldonado": "UY", "Tacuarembó": "UY", "Melo": "UY", "Mercedes": "UY", "Artigas": "UY",
  
  // Paraguay
  "Asunción": "PY", "Ciudad del Este": "PY", "San Lorenzo": "PY", "Luque": "PY", "Capiatá": "PY", "Lambaré": "PY", "Fernando de la Mora": "PY", "Limpio": "PY", "Ñemby": "PY", "Encarnación": "PY",
  
  // Océanie - Australie
  "Sydney": "AU", "Melbourne": "AU", "Brisbane": "AU", "Perth": "AU", "Adelaide": "AU", "Gold Coast": "AU", "Newcastle": "AU", "Canberra": "AU", "Sunshine Coast": "AU", "Wollongong": "AU", "Hobart": "AU", "Geelong": "AU", "Townsville": "AU", "Cairns": "AU", "Darwin": "AU", "Toowoomba": "AU", "Ballarat": "AU", "Bendigo": "AU", "Albury": "AU", "Launceston": "AU",
  
  // Nouvelle-Zélande
  "Auckland": "NZ", "Wellington": "NZ", "Christchurch": "NZ", "Tauranga": "NZ", "Napier": "NZ", "Dunedin": "NZ", "Palmerston North": "NZ", "Hastings": "NZ", "Nelson": "NZ", "Rotorua": "NZ", "New Plymouth": "NZ", "Whangarei": "NZ", "Invercargill": "NZ", "Wanganui": "NZ", "Gisborne": "NZ", "Timaru": "NZ", "Oamaru": "NZ", "Masterton": "NZ", "Blenheim": "NZ",
  
  // Papouasie-Nouvelle-Guinée
  "Port Moresby": "PG", "Lae": "PG", "Mount Hagen": "PG", "Madang": "PG", "Wewak": "PG", "Vanimo": "PG", "Popondetta": "PG", "Mendi": "PG", "Kerema": "PG", "Daru": "PG"
};

export const WORLD_CITIES_LIST = Object.keys(WORLD_CITIES_MAPPING);