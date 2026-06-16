/* ============================================================
   OAK — DATA MODULE
   All demographic, economic, and distance data for the Bay Area
   ============================================================ */

// ---- City Data (101 incorporated cities) ----
// Keys: pop (population), county, sub (sub-region), emp (top 5 employers),
//       dist (miles to OAK), time (minutes to OAK)

const CITY_DATA = {
    // === ALAMEDA COUNTY (East Bay) ===
    "Oakland":        { pop: 443554, county: "Alameda", sub: "East Bay", emp: ["Kaiser Permanente", "Alameda County", "Port of Oakland", "The Permanente Medical Group", "City of Oakland"], dist: 9, time: 11 },
    "Fremont":        { pop: 228192, county: "Alameda", sub: "East Bay", emp: ["Tesla", "Washington Hospital", "Lam Research", "Fremont USD", "City of Fremont"], dist: 23, time: 27 },
    "Hayward":        { pop: 158440, county: "Alameda", sub: "East Bay", emp: ["Cal State East Bay", "Hayward USD", "Ultra Clean Technology", "GILLIG", "City of Hayward"], dist: 12, time: 16 },
    "Berkeley":       { pop: 121749, county: "Alameda", sub: "East Bay", emp: ["UC Berkeley", "Lawrence Berkeley National Lab", "Bayer", "Alta Bates Summit Medical Center", "Berkeley USD"], dist: 14, time: 17 },
    "San Leandro":    { pop: 86571, county: "Alameda", sub: "East Bay", emp: ["Ghirardelli Chocolate", "TriNet", "Peterson Holding", "Waste Management", "San Leandro USD"], dist: 6, time: 9 },
    "Livermore":      { pop: 84867, county: "Alameda", sub: "East Bay", emp: ["Lawrence Livermore National Lab", "Sandia National Labs", "GILLIG", "Lam Research", "Livermore Valley Joint USD"], dist: 26, time: 31 },
    "Alameda":        { pop: 78795, county: "Alameda", sub: "East Bay", emp: ["Alameda USD", "City of Alameda", "Abbott Labs", "Wind River Systems", "Bay Ship & Yacht"], dist: 7, time: 9 },
    "Pleasanton":     { pop: 75664, county: "Alameda", sub: "East Bay", emp: ["Workday", "Kaiser Permanente", "Safeway/Albertsons", "Roche Molecular Systems", "Veeva Systems"], dist: 22, time: 26 },
    "Dublin":         { pop: 70544, county: "Alameda", sub: "East Bay", emp: ["Ross Stores (HQ)", "Carl Zeiss Meditec", "Dublin USD", "Patelco Credit Union", "SAP"], dist: 18, time: 21 },
    "Union City":     { pop: 66196, county: "Alameda", sub: "East Bay", emp: ["Zoetis", "Mizuho OSI", "Ariat International", "New Haven USD", "City of Union City"], dist: 19, time: 22 },
    "Newark":         { pop: 46254, county: "Alameda", sub: "East Bay", emp: ["Logitech", "Lucid Motors", "Concentrix", "Worldpac", "SMART Modular Technologies"], dist: 26, time: 31 },
    "Albany":         { pop: 19439, county: "Alameda", sub: "East Bay", emp: ["Albany USD", "City of Albany", "UC Berkeley Village", "Golden Gate Fields", "Target"], dist: 15, time: 19 },
    "Emeryville":     { pop: 13912, county: "Alameda", sub: "East Bay", emp: ["Pixar Animation Studios", "Novartis", "Grocery Outlet (HQ)", "City of Emeryville", "Wareham Development"], dist: 11, time: 14 },
    "Piedmont":       { pop: 10816, county: "Alameda", sub: "East Bay", emp: ["Piedmont USD", "City of Piedmont"], dist: 9, time: 12 },

    // === CONTRA COSTA COUNTY (East Bay) ===
    "Concord":        { pop: 122839, county: "Contra Costa", sub: "East Bay", emp: ["John Muir Health", "Mt. Diablo USD", "City of Concord", "PG&E", "Kaiser Permanente"], dist: 29, time: 33 },
    "Antioch":        { pop: 119688, county: "Contra Costa", sub: "East Bay", emp: ["Sutter Delta Medical Center", "Antioch USD", "Kaiser Permanente", "City of Antioch", "Walmart"], dist: 43, time: 49 },
    "Richmond":       { pop: 114604, county: "Contra Costa", sub: "East Bay", emp: ["Chevron (refinery)", "Kaiser Permanente", "West Contra Costa USD", "UPS", "City of Richmond"], dist: 19, time: 23 },
    "San Ramon":      { pop: 86091, county: "Contra Costa", sub: "East Bay", emp: ["Chevron (HQ)", "PG&E", "AT&T", "SAP America", "San Ramon Regional Medical Center"], dist: 24, time: 28 },
    "Pittsburg":      { pop: 77709, county: "Contra Costa", sub: "East Bay", emp: ["USS-POSCO Industries", "Los Medanos College", "Pittsburg USD", "Sutter Health", "City of Pittsburg"], dist: 37, time: 42 },
    "Walnut Creek":   { pop: 70027, county: "Contra Costa", sub: "East Bay", emp: ["John Muir Health", "Kaiser Permanente", "Del Monte Foods", "Robert Half", "City of Walnut Creek"], dist: 23, time: 27 },
    "Brentwood":      { pop: 67037, county: "Contra Costa", sub: "East Bay", emp: ["Brentwood USD", "City of Brentwood", "Sutter Health", "Safeway"], dist: 50, time: 56 },
    "Oakley":         { pop: 48449, county: "Contra Costa", sub: "East Bay", emp: ["Oakley Union ESD", "City of Oakley"], dist: 47, time: 53 },
    "Danville":       { pop: 43251, county: "Contra Costa", sub: "East Bay", emp: ["San Ramon Valley USD", "Danville retail center", "Costco"], dist: 28, time: 32 },
    "Martinez":       { pop: 36787, county: "Contra Costa", sub: "East Bay", emp: ["Contra Costa County (county seat)", "Shell Martinez Refinery", "Contra Costa Regional Medical Center"], dist: 35, time: 40 },
    "Pleasant Hill":  { pop: 33893, county: "Contra Costa", sub: "East Bay", emp: ["Diablo Valley College", "John Muir Health", "City of Pleasant Hill"], dist: 26, time: 31 },
    "San Pablo":      { pop: 31547, county: "Contra Costa", sub: "East Bay", emp: ["Contra Costa College", "Doctors Medical Center", "City of San Pablo"], dist: 21, time: 25 },
    "Hercules":       { pop: 26407, county: "Contra Costa", sub: "East Bay", emp: ["Bio-Rad Laboratories", "City of Hercules", "West Contra Costa USD"], dist: 28, time: 33 },
    "El Cerrito":     { pop: 26175, county: "Contra Costa", sub: "East Bay", emp: ["West Contra Costa USD", "City of El Cerrito", "BART"], dist: 16, time: 19 },
    "Lafayette":      { pop: 25294, county: "Contra Costa", sub: "East Bay", emp: ["Lafayette SD", "City of Lafayette", "Acalanes USD"], dist: 20, time: 24 },
    "Orinda":         { pop: 19511, county: "Contra Costa", sub: "East Bay", emp: ["Orinda USD", "City of Orinda"], dist: 17, time: 20 },
    "Pinole":         { pop: 18448, county: "Contra Costa", sub: "East Bay", emp: ["City of Pinole", "Pinole Valley HS", "Doctors Medical Center"], dist: 21, time: 25 },
    "Moraga":         { pop: 16264, county: "Contra Costa", sub: "East Bay", emp: ["Saint Mary's College of California", "Moraga SD", "City of Moraga"], dist: 19, time: 23 },
    "Clayton":        { pop: 10798, county: "Contra Costa", sub: "East Bay", emp: ["City of Clayton", "Mt. Diablo USD"], dist: 31, time: 36 },

    // === SAN FRANCISCO COUNTY (Peninsula) ===
    "San Francisco":  { pop: 825000, county: "San Francisco", sub: "Peninsula", emp: ["City & County of SF", "UCSF", "Salesforce", "SF Unified School District", "Sutter Health"], dist: 22, time: 26 },

    // === SAN MATEO COUNTY (Peninsula) ===
    "San Mateo":      { pop: 104000, county: "San Mateo", sub: "Peninsula", emp: ["Franklin Templeton (HQ)", "Fisher Investments", "Snowflake", "San Mateo-Foster City SD", "City of San Mateo"], dist: 28, time: 32 },
    "Daly City":      { pop: 103000, county: "San Mateo", sub: "Peninsula", emp: ["Seton Medical Center", "Jefferson ESD", "Genesys Telecommunications", "Serramonte Center", "City of Daly City"], dist: 25, time: 29 },
    "Redwood City":   { pop: 84000, county: "San Mateo", sub: "Peninsula", emp: ["Oracle", "Electronic Arts", "Kaiser Permanente", "Informatica", "Box Inc."], dist: 37, time: 43 },
    "South San Francisco": { pop: 66000, county: "San Mateo", sub: "Peninsula", emp: ["Genentech", "Kaiser Permanente", "SSF USD", "Amgen", "City of South San Francisco"], dist: 26, time: 31 },
    "San Bruno":      { pop: 43000, county: "San Mateo", sub: "Peninsula", emp: ["YouTube/Google (HQ)", "Walmart.com", "San Bruno Park SD", "City of San Bruno"], dist: 28, time: 32 },
    "Pacifica":       { pop: 37500, county: "San Mateo", sub: "Peninsula", emp: ["City of Pacifica", "Pacifica SD"], dist: 30, time: 35 },
    "Foster City":    { pop: 33000, county: "San Mateo", sub: "Peninsula", emp: ["Gilead Sciences", "Visa (US HQ)", "Zoox", "Illumina", "City of Foster City"], dist: 25, time: 30 },
    "Menlo Park":     { pop: 33000, county: "San Mateo", sub: "Peninsula", emp: ["Meta/Facebook (HQ)", "SLAC National Accelerator Lab", "SRI International", "VA Palo Alto Health Care", "Menlo Park City SD"], dist: 35, time: 41 },
    "Burlingame":     { pop: 31500, county: "San Mateo", sub: "Peninsula", emp: ["City of Burlingame", "Burlingame SD", "Hyatt Hotels", "Virgin Atlantic"], dist: 29, time: 33 },
    "San Carlos":     { pop: 30000, county: "San Mateo", sub: "Peninsula", emp: ["City of San Carlos", "San Carlos SD"], dist: 29, time: 34 },
    "East Palo Alto": { pop: 29000, county: "San Mateo", sub: "Peninsula", emp: ["Amazon", "Ravenswood City SD", "City of East Palo Alto"], dist: 34, time: 39 },
    "Belmont":        { pop: 28500, county: "San Mateo", sub: "Peninsula", emp: ["City of Belmont", "Belmont-Redwood Shores SD", "Oracle", "Notre Dame de Namur University"], dist: 28, time: 33 },
    "Millbrae":       { pop: 23000, county: "San Mateo", sub: "Peninsula", emp: ["City of Millbrae", "Millbrae ESD"], dist: 31, time: 36 },
    "Half Moon Bay":  { pop: 11500, county: "San Mateo", sub: "Peninsula", emp: ["Ritz-Carlton Half Moon Bay", "Cabrillo USD", "City of Half Moon Bay"], dist: 37, time: 42 },
    "Hillsborough":   { pop: 11200, county: "San Mateo", sub: "Peninsula", emp: ["Hillsborough City SD", "City of Hillsborough"], dist: 29, time: 33 },
    "Atherton":       { pop: 7000, county: "San Mateo", sub: "Peninsula", emp: ["Menlo School", "Sacred Heart Schools"], dist: 36, time: 41 },
    "Woodside":       { pop: 5200, county: "San Mateo", sub: "Peninsula", emp: ["Woodside ESD", "Town of Woodside"], dist: 40, time: 45 },
    "Brisbane":       { pop: 4800, county: "San Mateo", sub: "Peninsula", emp: ["Sierra Point biotech cluster", "City of Brisbane", "Brisbane SD"], dist: 24, time: 29 },
    "Portola Valley": { pop: 4400, county: "San Mateo", sub: "Peninsula", emp: ["Portola Valley SD", "Town of Portola Valley"], dist: 43, time: 49 },
    "Colma":          { pop: 1400, county: "San Mateo", sub: "Peninsula", emp: ["Costco", "Home Depot", "Target", "Town of Colma"], dist: 26, time: 30 },

    // === SANTA CLARA COUNTY (South Bay) ===
    "San Jose":       { pop: 997368, county: "Santa Clara", sub: "South Bay", emp: ["Cisco Systems", "Adobe", "City of San Jose", "PayPal", "Western Digital"], dist: 36, time: 41 },
    "Sunnyvale":      { pop: 156792, county: "Santa Clara", sub: "South Bay", emp: ["Lockheed Martin", "Intuitive Surgical", "Juniper Networks", "LinkedIn", "City of Sunnyvale"], dist: 38, time: 44 },
    "Santa Clara":    { pop: 133132, county: "Santa Clara", sub: "South Bay", emp: ["Intel", "Applied Materials", "NVIDIA (HQ)", "Palo Alto Networks", "City of Santa Clara"], dist: 42, time: 48 },
    "Mountain View":  { pop: 87316, county: "Santa Clara", sub: "South Bay", emp: ["Alphabet/Google (HQ)", "Intuit", "Microsoft", "Waymo", "Mountain View Whisman SD"], dist: 40, time: 46 },
    "Milpitas":       { pop: 79746, county: "Santa Clara", sub: "South Bay", emp: ["Cisco Systems", "SanDisk/Western Digital", "KLA Corporation", "Milpitas USD", "City of Milpitas"], dist: 29, time: 34 },
    "Palo Alto":      { pop: 67658, county: "Santa Clara", sub: "South Bay", emp: ["Stanford University", "HP Inc. (HQ)", "VMware", "Tesla", "Palo Alto USD"], dist: 36, time: 41 },
    "Gilroy":         { pop: 60390, county: "Santa Clara", sub: "South Bay", emp: ["Gilroy USD", "Gavilan College", "Christopher Ranch", "City of Gilroy", "Gilroy Premium Outlets"], dist: 65, time: 72 },
    "Cupertino":      { pop: 58710, county: "Santa Clara", sub: "South Bay", emp: ["Apple Inc. (HQ)", "De Anza College", "Cupertino Union SD", "Seagate Technology", "City of Cupertino"], dist: 46, time: 53 },
    "Morgan Hill":    { pop: 45952, county: "Santa Clara", sub: "South Bay", emp: ["Anritsu", "Specialized Bicycles", "Toray Advanced Composites", "Morgan Hill USD", "City of Morgan Hill"], dist: 55, time: 62 },
    "Campbell":       { pop: 42895, county: "Santa Clara", sub: "South Bay", emp: ["eBay", "Pruneyard Shopping Center", "Campbell Union HSD", "Netflix (nearby)", "City of Campbell"], dist: 41, time: 46 },
    "Los Gatos":      { pop: 32952, county: "Santa Clara", sub: "South Bay", emp: ["Netflix (HQ)", "Roku", "Infogain", "Los Gatos-Saratoga UHSD", "Community Hospital of Los Gatos"], dist: 45, time: 51 },
    "Los Altos":      { pop: 30864, county: "Santa Clara", sub: "South Bay", emp: ["Los Altos SD", "City of Los Altos", "Packard Foundation"], dist: 40, time: 46 },
    "Saratoga":       { pop: 30486, county: "Santa Clara", sub: "South Bay", emp: ["West Valley College", "Saratoga USD", "City of Saratoga"], dist: 45, time: 51 },
    "Los Altos Hills": { pop: 8435, county: "Santa Clara", sub: "South Bay", emp: ["Foothill College", "Town of Los Altos Hills"], dist: 41, time: 47 },
    "Monte Sereno":   { pop: 3563, county: "Santa Clara", sub: "South Bay", emp: ["City of Monte Sereno"], dist: 45, time: 51 },

    // === MARIN COUNTY (North Bay) ===
    "San Rafael":     { pop: 59700, county: "Marin", sub: "North Bay", emp: ["Autodesk (HQ)", "County of Marin", "MarinHealth", "San Rafael City Schools", "City of San Rafael"], dist: 37, time: 42 },
    "Novato":         { pop: 52100, county: "Marin", sub: "North Bay", emp: ["Ultragenyx Pharmaceutical", "Novato USD", "BioMarin (nearby)", "City of Novato", "Buck Institute for Research on Aging"], dist: 44, time: 50 },
    "Mill Valley":    { pop: 13900, county: "Marin", sub: "North Bay", emp: ["Mill Valley SD", "City of Mill Valley", "Tam USD"], dist: 33, time: 38 },
    "Larkspur":       { pop: 12700, county: "Marin", sub: "North Bay", emp: ["City of Larkspur", "Marin General Hospital (nearby)"], dist: 34, time: 39 },
    "San Anselmo":    { pop: 12600, county: "Marin", sub: "North Bay", emp: ["Ross Valley SD", "Town of San Anselmo"], dist: 37, time: 42 },
    "Corte Madera":   { pop: 10000, county: "Marin", sub: "North Bay", emp: ["Town Center Corte Madera", "Town of Corte Madera"], dist: 33, time: 38 },
    "Tiburon":        { pop: 8950, county: "Marin", sub: "North Bay", emp: ["Reed Union SD", "Town of Tiburon"], dist: 30, time: 35 },
    "Fairfax":        { pop: 7450, county: "Marin", sub: "North Bay", emp: ["Town of Fairfax", "Ross Valley SD"], dist: 39, time: 44 },
    "Sausalito":      { pop: 7100, county: "Marin", sub: "North Bay", emp: ["US Army Corps of Engineers", "City of Sausalito", "Sausalito Marin City SD"], dist: 27, time: 32 },
    "Ross":           { pop: 2450, county: "Marin", sub: "North Bay", emp: ["Ross SD", "Town of Ross"], dist: 37, time: 42 },
    "Belvedere":      { pop: 2200, county: "Marin", sub: "North Bay", emp: ["City of Belvedere"], dist: 30, time: 35 },

    // === NAPA COUNTY (North Bay) ===
    "Napa":           { pop: 76921, county: "Napa", sub: "North Bay", emp: ["Queen of the Valley Medical Center", "Napa State Hospital", "Napa County", "Treasury Wine Estates", "Napa Valley USD"], dist: 48, time: 55 },
    "American Canyon": { pop: 21742, county: "Napa", sub: "North Bay", emp: ["City of American Canyon", "Napa Logistics Park"], dist: 39, time: 45 },
    "St. Helena":     { pop: 5257, county: "Napa", sub: "North Bay", emp: ["Adventist Health St. Helena", "Beringer Vineyards", "St. Helena USD"], dist: 66, time: 74 },
    "Calistoga":      { pop: 5022, county: "Napa", sub: "North Bay", emp: ["Calistoga Joint USD", "Sterling Vineyards", "City of Calistoga"], dist: 75, time: 83 },
    "Yountville":     { pop: 3280, county: "Napa", sub: "North Bay", emp: ["Veterans Home of California", "French Laundry/Thomas Keller Restaurant Group", "Domaine Chandon"], dist: 61, time: 68 },

    // === SOLANO COUNTY (North Bay) ===
    "Vallejo":        { pop: 123475, county: "Solano", sub: "North Bay", emp: ["Kaiser Permanente", "Sutter Health", "Six Flags Discovery Kingdom", "Touro University California", "City of Vallejo"], dist: 34, time: 39 },
    "Fairfield":      { pop: 122646, county: "Solano", sub: "North Bay", emp: ["Travis Air Force Base", "Jelly Belly Candy Co.", "NorthBay Health", "Fairfield-Suisun USD", "Anheuser-Busch"], dist: 50, time: 56 },
    "Vacaville":      { pop: 103994, county: "Solano", sub: "North Bay", emp: ["Genentech (manufacturing)", "Kaiser Permanente", "Vacaville USD", "NorthBay Health", "City of Vacaville"], dist: 58, time: 65 },
    "Suisun City":    { pop: 29614, county: "Solano", sub: "North Bay", emp: ["City of Suisun City", "Travis Credit Union"], dist: 50, time: 57 },
    "Benicia":        { pop: 26477, county: "Solano", sub: "North Bay", emp: ["Valero Benicia Refinery", "Benicia USD", "City of Benicia", "Amports", "Benicia Industrial Park"], dist: 41, time: 47 },
    "Dixon":          { pop: 20296, county: "Solano", sub: "North Bay", emp: ["Dixon USD", "City of Dixon"], dist: 69, time: 77 },
    "Rio Vista":      { pop: 10248, county: "Solano", sub: "North Bay", emp: ["City of Rio Vista", "River Delta USD"], dist: 69, time: 78 },

    // === SONOMA COUNTY (North Bay) ===
    "Santa Rosa":     { pop: 178500, county: "Sonoma", sub: "North Bay", emp: ["Keysight Technologies", "Kaiser Permanente", "County of Sonoma", "St. Joseph Health", "Santa Rosa Junior College"], dist: 71, time: 79 },
    "Petaluma":       { pop: 59688, county: "Sonoma", sub: "North Bay", emp: ["Petaluma City Schools", "Petaluma Health Center", "Lagunitas Brewing", "City of Petaluma", "Amy's Kitchen"], dist: 57, time: 65 },
    "Rohnert Park":   { pop: 44811, county: "Sonoma", sub: "North Bay", emp: ["Sonoma State University", "Graton Resort & Casino", "Cotati-Rohnert Park USD", "City of Rohnert Park"], dist: 64, time: 72 },
    "Windsor":        { pop: 25864, county: "Sonoma", sub: "North Bay", emp: ["Windsor USD", "Town of Windsor", "Jackson Family Wines"], dist: 80, time: 89 },
    "Healdsburg":     { pop: 11172, county: "Sonoma", sub: "North Bay", emp: ["Healdsburg USD", "City of Healdsburg"], dist: 85, time: 95 },
    "Sonoma":         { pop: 10537, county: "Sonoma", sub: "North Bay", emp: ["Sonoma Valley USD", "Sonoma Valley Hospital", "City of Sonoma"], dist: 68, time: 76 },
    "Cloverdale":     { pop: 8701, county: "Sonoma", sub: "North Bay", emp: ["Cloverdale USD", "City of Cloverdale"], dist: 101, time: 112 },
    "Sebastopol":     { pop: 7532, county: "Sonoma", sub: "North Bay", emp: ["Sebastopol Union SD", "City of Sebastopol", "The Barlow"], dist: 73, time: 81 },
    "Cotati":         { pop: 7347, county: "Sonoma", sub: "North Bay", emp: ["Cotati-Rohnert Park USD", "City of Cotati"], dist: 65, time: 73 }
};


// ---- County Data ----
const COUNTY_DATA = {
    "Alameda":       { pop: 1649060, gdp: 182.5, sub: "East Bay", cities: 14, industries: ["Advanced manufacturing", "Technology", "Healthcare", "Logistics", "R&D"], emp: ["Kaiser Permanente", "Tesla (Fremont)", "UC Berkeley", "Lawrence Berkeley National Lab", "Alameda County"] },
    "Contra Costa":  { pop: 1172607, gdp: 76.9, sub: "East Bay", cities: 19, industries: ["Healthcare", "Professional services", "Energy", "Logistics"], emp: ["Chevron (San Ramon)", "John Muir Health", "Kaiser Permanente", "PG&E (San Ramon)", "Mt. Diablo USD"] },
    "Marin":         { pop: 256400, gdp: 28.5, sub: "North Bay", cities: 11, industries: ["Professional services", "Technology", "Healthcare", "Finance"], emp: ["Autodesk", "MarinHealth", "County of Marin", "Ultragenyx Pharmaceutical", "San Quentin State Prison"] },
    "Napa":          { pop: 132727, gdp: 14.6, sub: "North Bay", cities: 5, industries: ["Wine/Agriculture", "Tourism/Hospitality", "Healthcare"], emp: ["Treasury Wine Estates", "Queen of the Valley Medical Center", "Napa State Hospital", "Napa County", "Constellation Brands"] },
    "San Francisco": { pop: 825000, gdp: 268.3, sub: "Peninsula", cities: 1, industries: ["Tech/Software/AI", "Finance", "Healthcare", "Government", "Tourism"], emp: ["City & County of SF", "UCSF", "Salesforce", "SF Unified School District", "Sutter Health"] },
    "San Mateo":     { pop: 742893, gdp: 217.0, sub: "Peninsula", cities: 20, industries: ["Biotechnology/Life sciences", "Technology", "Finance"], emp: ["Genentech (SSF)", "Gilead Sciences (Foster City)", "Oracle (Redwood City)", "Meta (Menlo Park)", "Visa (Foster City)"] },
    "Santa Clara":   { pop: 1926325, gdp: 438.5, sub: "South Bay", cities: 15, industries: ["Technology/Semiconductors", "Software/AI", "Hardware", "Biotech"], emp: ["Apple", "Google/Alphabet", "NVIDIA", "Cisco Systems", "Intel"] },
    "Solano":        { pop: 455101, gdp: 30.7, sub: "North Bay", cities: 7, industries: ["Military/Defense", "Healthcare", "Manufacturing", "Agriculture"], emp: ["Travis Air Force Base", "Kaiser Permanente", "NorthBay Health", "Jelly Belly Candy Co.", "Six Flags Discovery Kingdom"] },
    "Sonoma":        { pop: 485375, gdp: 37.7, sub: "North Bay", cities: 9, industries: ["Agriculture/Wine", "Healthcare", "Technology", "Tourism"], emp: ["Keysight Technologies", "Kaiser Permanente", "County of Sonoma", "St. Joseph Health System", "Medtronic"] }
};


// ---- Sub-region Data ----
const SUBREGION_DATA = {
    "East Bay": {
        pop: 2821667,
        gdp: 259.4,
        counties: ["Alameda", "Contra Costa"],
        cities: 33,
        industries: ["Advanced manufacturing (Tesla)", "Healthcare (Kaiser, John Muir)", "Energy (Chevron, PG&E)", "National laboratories (LLNL, LBNL)", "Logistics (Port of Oakland)", "Technology"],
        description: "Industrial and residential backbone of the Bay Area, home to the Port of Oakland, major refineries, national labs, and a diverse population base."
    },
    "South Bay": {
        pop: 1926325,
        gdp: 438.5,
        counties: ["Santa Clara"],
        cities: 15,
        industries: ["Technology/Semiconductors", "Software/AI", "Hardware manufacturing", "Autonomous vehicles", "Biotech/Medtech", "Venture capital"],
        description: "Silicon Valley — the world's leading technology and innovation hub, home to Apple, Google, NVIDIA, and thousands of startups."
    },
    "Peninsula": {
        pop: 1567893,
        gdp: 485.3,
        counties: ["San Francisco", "San Mateo"],
        cities: 21,
        industries: ["Biotechnology/Pharma", "Software/Cloud/AI", "Finance/Fintech", "Social media", "Government services", "Tourism"],
        description: "From San Francisco's urban core to the biotech corridor of South San Francisco, the Peninsula bridges culture, finance, and life sciences."
    },
    "North Bay": {
        pop: 1329603,
        gdp: 111.3,
        counties: ["Marin", "Napa", "Solano", "Sonoma"],
        cities: 32,
        industries: ["Wine/Agriculture", "Tourism/Hospitality", "Military/Defense (Travis AFB)", "Healthcare", "Technology (Keysight, Autodesk)"],
        description: "Wine country, military installations, and scenic communities — from Sausalito's waterfront to Napa Valley's vineyards."
    }
};


// ---- Bay Area Aggregate Data ----
const BAYAREA_DATA = {
    pop: 7670000,
    gdp: 1500,
    counties: 9,
    cities: 101,
    industries: ["Technology/Software/AI", "Biotechnology/Life Sciences", "Healthcare", "Financial Services", "Advanced Manufacturing", "Professional Services", "Tourism/Hospitality"],
    fortune500: 42,
    fortune1000: 73,
    description: "The San Francisco Bay Area is the 3rd largest metro economy in the United States, a global center of technology, innovation, and venture capital."
};


// ---- OAK Airport Data ----
const OAK_DATA = {
    name: "Oakland International Airport",
    code: "OAK",
    lat: 37.7213,
    lng: -122.2208,
    description: "Oakland San Francisco Bay Airport — the heart of the Bay Area's transportation network, serving over 13 million passengers annually with direct access to I-880 and BART Coliseum station.",
    airlines: 7,
    destinations: 60,
    passengers: "13.6M (2024)"
};


// ---- County FIPS to Name Mapping ----
const COUNTY_FIPS = {
    "001": "Alameda",
    "013": "Contra Costa",
    "041": "Marin",
    "055": "Napa",
    "075": "San Francisco",
    "081": "San Mateo",
    "085": "Santa Clara",
    "095": "Solano",
    "097": "Sonoma"
};

// ---- Sub-region Color Coding (grayscale) ----
const SUBREGION_COLORS = {
    "East Bay":   "#D0D0D0",
    "South Bay":  "#C0C0C0",
    "Peninsula":  "#B8B8B8",
    "North Bay":  "#D8D8D8"
};

// ---- Utility: Format number with commas ----
function formatNumber(n) {
    if (n === undefined || n === null) return "—";
    return n.toLocaleString('en-US');
}

// ---- Utility: Format GDP ----
function formatGDP(gdp) {
    if (gdp === undefined || gdp === null) return "—";
    if (gdp >= 1000) return "$" + (gdp / 1000).toFixed(1) + "T";
    return "$" + gdp.toFixed(1) + "B";
}
