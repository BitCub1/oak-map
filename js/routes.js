/* ============================================================
   OAK — ROUTES MODULE (v2)
   Accurate pre-computed highway corridors and BART paths to OAK.
   Routes follow real highway alignments with no backtracking.
   ============================================================ */

const OAKRoutes = (function () {

    const OAK = [37.7213, -122.2208];

    // ================================================================
    // BART STATION COORDINATES
    // ================================================================
    const BART_STATIONS = {
        "Richmond": [37.9370, -122.3527],
        "El Cerrito del Norte": [37.9253, -122.3169],
        "El Cerrito Plaza": [37.9028, -122.2993],
        "North Berkeley": [37.8740, -122.2833],
        "Downtown Berkeley": [37.8700, -122.2681],
        "Ashby": [37.8531, -122.2700],
        "MacArthur": [37.8283, -122.2674],
        "19th St Oakland": [37.8083, -122.2690],
        "12th St Oakland": [37.8034, -122.2720],
        "Lake Merritt": [37.7974, -122.2655],
        "Fruitvale": [37.7750, -122.2241],
        "Coliseum": [37.7539, -122.1968],
        "Oakland Airport": [37.7133, -122.2124],
        "San Leandro": [37.7228, -122.1607],
        "Bay Fair": [37.6970, -122.1269],
        "Hayward": [37.6700, -122.0870],
        "South Hayward": [37.6351, -122.0574],
        "Union City": [37.5910, -122.0176],
        "Fremont": [37.5574, -121.9765],
        "Warm Springs": [37.5023, -121.9397],
        "Milpitas": [37.4103, -121.8913],
        "Berryessa": [37.3693, -121.8748],
        "Rockridge": [37.8440, -122.2512],
        "Orinda": [37.8784, -122.1837],
        "Lafayette": [37.8933, -122.1247],
        "Walnut Creek": [37.9056, -122.0669],
        "Pleasant Hill": [37.9283, -122.0560],
        "Concord": [37.9738, -122.0297],
        "Pittsburg/Bay Point": [38.0189, -121.9452],
        "Pittsburg Center": [38.0176, -121.8894],
        "Antioch": [38.0040, -121.7816],
        "West Oakland": [37.8048, -122.2949],
        "Embarcadero": [37.7930, -122.3968],
        "Montgomery": [37.7894, -122.4016],
        "Powell": [37.7845, -122.4079],
        "Civic Center": [37.7794, -122.4137],
        "16th St Mission": [37.7650, -122.4194],
        "24th St Mission": [37.7523, -122.4187],
        "Glen Park": [37.7330, -122.4340],
        "Balboa Park": [37.7220, -122.4474],
        "Daly City": [37.7063, -122.4691],
        "Colma": [37.6846, -122.4658],
        "South San Francisco": [37.6640, -122.4440],
        "San Bruno": [37.6376, -122.4163],
        "Millbrae": [37.5999, -122.3864],
        "San Francisco International Airport": [37.6159, -122.3924],
        "Castro Valley": [37.6907, -122.0759],
        "West Dublin/Pleasanton": [37.6996, -121.9287],
        "Dublin/Pleasanton": [37.7017, -121.8993]
    };

    // ================================================================
    // BART PATHS TO COLISEUM (unchanged — these were accurate)
    // ================================================================
    const BART_TO_COLISEUM = {
        "Coliseum": [],
        "Oakland Airport": ["Coliseum"],
        "Fruitvale": ["Coliseum"],
        "Lake Merritt": ["Fruitvale", "Coliseum"],
        "12th St Oakland": ["Lake Merritt", "Fruitvale", "Coliseum"],
        "19th St Oakland": ["12th St Oakland", "Lake Merritt", "Fruitvale", "Coliseum"],
        "MacArthur": ["19th St Oakland", "12th St Oakland", "Lake Merritt", "Fruitvale", "Coliseum"],
        "Ashby": ["MacArthur", "19th St Oakland", "12th St Oakland", "Lake Merritt", "Fruitvale", "Coliseum"],
        "Downtown Berkeley": ["Ashby", "MacArthur", "19th St Oakland", "12th St Oakland", "Lake Merritt", "Fruitvale", "Coliseum"],
        "North Berkeley": ["Downtown Berkeley", "Ashby", "MacArthur", "19th St Oakland", "12th St Oakland", "Lake Merritt", "Fruitvale", "Coliseum"],
        "El Cerrito Plaza": ["North Berkeley", "Downtown Berkeley", "Ashby", "MacArthur", "19th St Oakland", "12th St Oakland", "Lake Merritt", "Fruitvale", "Coliseum"],
        "El Cerrito del Norte": ["El Cerrito Plaza", "North Berkeley", "Downtown Berkeley", "Ashby", "MacArthur", "19th St Oakland", "12th St Oakland", "Lake Merritt", "Fruitvale", "Coliseum"],
        "Richmond": ["El Cerrito del Norte", "El Cerrito Plaza", "North Berkeley", "Downtown Berkeley", "Ashby", "MacArthur", "19th St Oakland", "12th St Oakland", "Lake Merritt", "Fruitvale", "Coliseum"],
        "San Leandro": ["Coliseum"],
        "Bay Fair": ["San Leandro", "Coliseum"],
        "Hayward": ["Bay Fair", "San Leandro", "Coliseum"],
        "South Hayward": ["Hayward", "Bay Fair", "San Leandro", "Coliseum"],
        "Union City": ["South Hayward", "Hayward", "Bay Fair", "San Leandro", "Coliseum"],
        "Fremont": ["Union City", "South Hayward", "Hayward", "Bay Fair", "San Leandro", "Coliseum"],
        "Warm Springs": ["Fremont", "Union City", "South Hayward", "Hayward", "Bay Fair", "San Leandro", "Coliseum"],
        "Milpitas": ["Warm Springs", "Fremont", "Union City", "South Hayward", "Hayward", "Bay Fair", "San Leandro", "Coliseum"],
        "Berryessa": ["Milpitas", "Warm Springs", "Fremont", "Union City", "South Hayward", "Hayward", "Bay Fair", "San Leandro", "Coliseum"],
        "Rockridge": ["MacArthur", "19th St Oakland", "12th St Oakland", "Lake Merritt", "Fruitvale", "Coliseum"],
        "Orinda": ["Rockridge", "MacArthur", "19th St Oakland", "12th St Oakland", "Lake Merritt", "Fruitvale", "Coliseum"],
        "Lafayette": ["Orinda", "Rockridge", "MacArthur", "19th St Oakland", "12th St Oakland", "Lake Merritt", "Fruitvale", "Coliseum"],
        "Walnut Creek": ["Lafayette", "Orinda", "Rockridge", "MacArthur", "19th St Oakland", "12th St Oakland", "Lake Merritt", "Fruitvale", "Coliseum"],
        "Pleasant Hill": ["Walnut Creek", "Lafayette", "Orinda", "Rockridge", "MacArthur", "19th St Oakland", "12th St Oakland", "Lake Merritt", "Fruitvale", "Coliseum"],
        "Concord": ["Pleasant Hill", "Walnut Creek", "Lafayette", "Orinda", "Rockridge", "MacArthur", "19th St Oakland", "12th St Oakland", "Lake Merritt", "Fruitvale", "Coliseum"],
        "Pittsburg/Bay Point": ["Concord", "Pleasant Hill", "Walnut Creek", "Lafayette", "Orinda", "Rockridge", "MacArthur", "19th St Oakland", "12th St Oakland", "Lake Merritt", "Fruitvale", "Coliseum"],
        "Pittsburg Center": ["Pittsburg/Bay Point", "Concord", "Pleasant Hill", "Walnut Creek", "Lafayette", "Orinda", "Rockridge", "MacArthur", "19th St Oakland", "12th St Oakland", "Lake Merritt", "Fruitvale", "Coliseum"],
        "Antioch": ["Pittsburg Center", "Pittsburg/Bay Point", "Concord", "Pleasant Hill", "Walnut Creek", "Lafayette", "Orinda", "Rockridge", "MacArthur", "19th St Oakland", "12th St Oakland", "Lake Merritt", "Fruitvale", "Coliseum"],
        "West Oakland": ["12th St Oakland", "Lake Merritt", "Fruitvale", "Coliseum"],
        "Embarcadero": ["West Oakland", "12th St Oakland", "Lake Merritt", "Fruitvale", "Coliseum"],
        "Montgomery": ["Embarcadero", "West Oakland", "12th St Oakland", "Lake Merritt", "Fruitvale", "Coliseum"],
        "Powell": ["Montgomery", "Embarcadero", "West Oakland", "12th St Oakland", "Lake Merritt", "Fruitvale", "Coliseum"],
        "Civic Center": ["Powell", "Montgomery", "Embarcadero", "West Oakland", "12th St Oakland", "Lake Merritt", "Fruitvale", "Coliseum"],
        "16th St Mission": ["Civic Center", "Powell", "Montgomery", "Embarcadero", "West Oakland", "12th St Oakland", "Lake Merritt", "Fruitvale", "Coliseum"],
        "24th St Mission": ["16th St Mission", "Civic Center", "Powell", "Montgomery", "Embarcadero", "West Oakland", "12th St Oakland", "Lake Merritt", "Fruitvale", "Coliseum"],
        "Glen Park": ["24th St Mission", "16th St Mission", "Civic Center", "Powell", "Montgomery", "Embarcadero", "West Oakland", "12th St Oakland", "Lake Merritt", "Fruitvale", "Coliseum"],
        "Balboa Park": ["Glen Park", "24th St Mission", "16th St Mission", "Civic Center", "Powell", "Montgomery", "Embarcadero", "West Oakland", "12th St Oakland", "Lake Merritt", "Fruitvale", "Coliseum"],
        "Daly City": ["Balboa Park", "Glen Park", "24th St Mission", "16th St Mission", "Civic Center", "Powell", "Montgomery", "Embarcadero", "West Oakland", "12th St Oakland", "Lake Merritt", "Fruitvale", "Coliseum"],
        "Colma": ["Daly City", "Balboa Park", "Glen Park", "24th St Mission", "16th St Mission", "Civic Center", "Powell", "Montgomery", "Embarcadero", "West Oakland", "12th St Oakland", "Lake Merritt", "Fruitvale", "Coliseum"],
        "South San Francisco": ["Colma", "Daly City", "Balboa Park", "Glen Park", "24th St Mission", "16th St Mission", "Civic Center", "Powell", "Montgomery", "Embarcadero", "West Oakland", "12th St Oakland", "Lake Merritt", "Fruitvale", "Coliseum"],
        "San Bruno": ["South San Francisco", "Colma", "Daly City", "Balboa Park", "Glen Park", "24th St Mission", "16th St Mission", "Civic Center", "Powell", "Montgomery", "Embarcadero", "West Oakland", "12th St Oakland", "Lake Merritt", "Fruitvale", "Coliseum"],
        "Millbrae": ["San Bruno", "South San Francisco", "Colma", "Daly City", "Balboa Park", "Glen Park", "24th St Mission", "16th St Mission", "Civic Center", "Powell", "Montgomery", "Embarcadero", "West Oakland", "12th St Oakland", "Lake Merritt", "Fruitvale", "Coliseum"],
        "San Francisco International Airport": ["San Bruno", "South San Francisco", "Colma", "Daly City", "Balboa Park", "Glen Park", "24th St Mission", "16th St Mission", "Civic Center", "Powell", "Montgomery", "Embarcadero", "West Oakland", "12th St Oakland", "Lake Merritt", "Fruitvale", "Coliseum"],
        "Castro Valley": ["Bay Fair", "San Leandro", "Coliseum"],
        "West Dublin/Pleasanton": ["Castro Valley", "Bay Fair", "San Leandro", "Coliseum"],
        "Dublin/Pleasanton": ["West Dublin/Pleasanton", "Castro Valley", "Bay Fair", "San Leandro", "Coliseum"]
    };

    // ================================================================
    // HIGHWAY CORRIDOR SEGMENTS (accurate waypoints)
    // ================================================================

    // ---- Shared "last mile" segments ----
    // I-880 from San Leandro north to OAK (Hegenberger exit)
    var _880_SL_OAK = [[37.707,-122.120],[37.735,-122.190],[37.721,-122.221]];
    // I-880 from Coliseum/Oakland south to OAK
    var _880_OAK_OAK = [[37.753,-122.198],[37.735,-122.190],[37.721,-122.221]];
    // I-880 through Oakland (I-980 junction to OAK)
    var _880_OAK_S = [[37.805,-122.280],[37.778,-122.225],[37.753,-122.198],[37.735,-122.190],[37.721,-122.221]];

    // ---- I-880 SOUTH (north from Milpitas to OAK) ----
    var _I880S = [[37.432,-121.900],[37.485,-121.929],[37.506,-121.944],[37.558,-122.000],[37.600,-122.035],[37.628,-122.070],[37.670,-122.087],[37.697,-122.110],[37.707,-122.120],[37.735,-122.190],[37.721,-122.221]];

    // ---- CA-24 from Caldecott to OAK (via I-580/I-980/I-880) ----
    var _CA24_OAK = [[37.858,-122.220],[37.844,-122.251],[37.828,-122.267],[37.805,-122.280],[37.778,-122.225],[37.753,-122.198],[37.735,-122.190],[37.721,-122.221]];

    // ---- I-580 W from Dublin to OAK (via I-238 to I-880) ----
    var _I580W = [[37.706,-121.920],[37.700,-121.935],[37.691,-122.076],[37.697,-122.092],[37.696,-122.112],[37.707,-122.120],[37.735,-122.190],[37.721,-122.221]];

    // ---- Bay Bridge (SF approach to OAK) ----
    var _BAY_BRIDGE = [[37.785,-122.393],[37.798,-122.378],[37.817,-122.354],[37.827,-122.313],[37.810,-122.276],[37.778,-122.225],[37.753,-122.198],[37.735,-122.190],[37.721,-122.221]];

    // ---- I-80 North (Vallejo to Emeryville then I-880 to OAK) ----
    var _I80N_OAK = [[38.104,-122.257],[38.019,-122.230],[37.970,-122.336],[37.936,-122.339],[37.903,-122.299],[37.863,-122.282],[37.831,-122.292],[37.810,-122.276],[37.778,-122.225],[37.753,-122.198],[37.735,-122.190],[37.721,-122.221]];

    // ---- GG Bridge to Bay Bridge (through SF) ----
    var _GGB_BB = [
        [37.855, -122.483], // Waldo Grade (Sausalito lateral)
        [37.848, -122.481], // Waldo Tunnel
        [37.840, -122.478], // Vista Point
        [37.832, -122.479], // North end GGB
        [37.818, -122.478], // Middle GGB
        [37.808, -122.475], // South end GGB / Toll Plaza
        [37.801, -122.471], // Presidio Parkway
        [37.799, -122.459], // Richardson Ave
        [37.798, -122.448], // Lombard St / Lyon St
        [37.800, -122.436], // Lombard St / Fillmore St
        [37.801, -122.426], // Lombard St / Van Ness Ave
        [37.788, -122.421], // Van Ness Ave / Broadway
        [37.777, -122.419], // Van Ness Ave / McAllister St (Civic Center)
        [37.770, -122.413], // 13th St / Mission St (US-101 S ramp)
        [37.773, -122.404], // I-80
        [37.785, -122.393]  // I-80 Bay Bridge approach
    ];

    // ---- San Mateo Bridge (CA-92 west to Hayward, then I-880 to OAK) ----
    var _SM_BRIDGE = [[37.562,-122.273],[37.580,-122.200],[37.605,-122.130],[37.628,-122.070],[37.670,-122.087],[37.697,-122.110],[37.707,-122.120],[37.735,-122.190],[37.721,-122.221]];

    // ---- Dumbarton Bridge (CA-84 west to I-880 at Fremont, then I-880 N to OAK) ----
    var _DB_BRIDGE = [[37.479,-122.153],[37.496,-122.118],[37.513,-122.066],[37.525,-121.960],[37.558,-122.000],[37.600,-122.035],[37.628,-122.070],[37.670,-122.087],[37.697,-122.110],[37.707,-122.120],[37.735,-122.190],[37.721,-122.221]];

    // ================================================================
    // PER-CITY HIGHWAY ROUTES
    // Built using concat of connector waypoints + corridor segments
    // ================================================================
    var R = {};

    // ---- ALAMEDA COUNTY (East Bay) ----
    R["Oakland"]     = [[37.804,-122.271]].concat(_880_OAK_S.slice(1));
    R["Fremont"]     = _I880S.slice(2);
    R["Hayward"]     = _I880S.slice(5);
    R["Berkeley"]    = [[37.872,-122.273],[37.863,-122.282],[37.831,-122.292]].concat(_880_OAK_S);
    R["San Leandro"] = _880_SL_OAK.slice(0);
    R["Livermore"]   = [[37.682,-121.769]].concat(_I580W);
    R["Alameda"]     = [[37.765,-122.242],[37.778,-122.225]].concat(_880_OAK_OAK);
    R["Pleasanton"]  = [[37.662,-121.875]].concat(_I580W);
    R["Dublin"]      = _I580W.slice(0);
    R["Union City"]  = _I880S.slice(3);
    R["Newark"]      = [[37.522,-122.040],[37.525,-121.960]].concat(_I880S.slice(3));
    R["Albany"]       = [[37.887,-122.298],[37.863,-122.282],[37.831,-122.292]].concat(_880_OAK_S);
    R["Emeryville"]  = [[37.831,-122.285],[37.831,-122.292]].concat(_880_OAK_S);
    R["Piedmont"]    = [[37.824,-122.232],[37.810,-122.240],[37.778,-122.225]].concat(_880_OAK_OAK);

    // ---- CONTRA COSTA COUNTY (East Bay) ----
    // Walnut Creek, Lafayette, Orinda, Moraga → CA-24 W through Caldecott Tunnel
    R["Walnut Creek"]  = [[37.906,-122.067],[37.893,-122.125],[37.878,-122.184]].concat(_CA24_OAK);
    R["Lafayette"]     = [[37.893,-122.125],[37.878,-122.184]].concat(_CA24_OAK);
    R["Orinda"]        = [[37.878,-122.184]].concat(_CA24_OAK);
    R["Moraga"]        = [[37.835,-122.130],[37.844,-122.170],[37.858,-122.220]].concat(_CA24_OAK);
    // Concord, Pleasant Hill, Clayton → CA-24 W via Walnut Creek
    R["Concord"]       = [[37.978,-122.031],[37.928,-122.056],[37.906,-122.067],[37.893,-122.125],[37.878,-122.184]].concat(_CA24_OAK);
    R["Pleasant Hill"] = [[37.948,-122.061],[37.906,-122.067],[37.893,-122.125],[37.878,-122.184]].concat(_CA24_OAK);
    R["Clayton"]       = [[37.941,-121.936],[37.938,-122.000],[37.906,-122.067],[37.893,-122.125],[37.878,-122.184]].concat(_CA24_OAK);
    // SR-4 corridor: Antioch, Pittsburg, Oakley, Brentwood → SR-4 W to Concord → CA-24
    R["Antioch"]       = [[38.004,-121.782],[38.018,-121.889],[38.019,-121.945],[37.978,-122.031],[37.928,-122.056],[37.906,-122.067],[37.893,-122.125],[37.878,-122.184]].concat(_CA24_OAK);
    R["Pittsburg"]     = [[38.018,-121.889],[38.019,-121.945],[37.978,-122.031],[37.928,-122.056],[37.906,-122.067],[37.893,-122.125],[37.878,-122.184]].concat(_CA24_OAK);
    R["Oakley"]        = [[37.997,-121.713],[38.004,-121.782],[38.018,-121.889],[38.019,-121.945],[37.978,-122.031],[37.928,-122.056],[37.906,-122.067],[37.893,-122.125],[37.878,-122.184]].concat(_CA24_OAK);
    R["Brentwood"]     = [[37.932,-121.696],[38.004,-121.782],[38.018,-121.889],[38.019,-121.945],[37.978,-122.031],[37.928,-122.056],[37.906,-122.067],[37.893,-122.125],[37.878,-122.184]].concat(_CA24_OAK);
    // San Ramon, Danville → I-680 S to I-580 W
    R["San Ramon"]     = [[37.780,-121.978],[37.740,-121.935]].concat(_I580W);
    R["Danville"]      = [[37.820,-122.020],[37.780,-121.978],[37.740,-121.935]].concat(_I580W);
    // Richmond, San Pablo → I-80 S corridor
    R["Richmond"]      = _I80N_OAK.slice(3);
    R["San Pablo"]     = [[37.962,-122.346]].concat(_I80N_OAK.slice(3));
    R["El Cerrito"]    = _I80N_OAK.slice(4);
    R["Hercules"]      = _I80N_OAK.slice(1);
    R["Pinole"]        = _I80N_OAK.slice(2);
    R["Martinez"]      = [[38.019,-122.134],[37.978,-122.031],[37.928,-122.056],[37.906,-122.067],[37.893,-122.125],[37.878,-122.184]].concat(_CA24_OAK);

    // ---- SAN FRANCISCO ----
    R["San Francisco"] = _BAY_BRIDGE.slice(0);

    // ---- SAN MATEO COUNTY (Peninsula via bridges) ----
    // Cities near San Mateo Bridge (CA-92)
    R["San Mateo"]     = _SM_BRIDGE.slice(0);
    R["Foster City"]   = [[37.559,-122.271]].concat(_SM_BRIDGE);
    R["Burlingame"]    = [[37.584,-122.344],[37.562,-122.273]].concat(_SM_BRIDGE.slice(1));
    R["Hillsborough"] = [[37.574,-122.345],[37.562,-122.273]].concat(_SM_BRIDGE.slice(1));
    R["San Carlos"]    = [[37.507,-122.260],[37.520,-122.260],[37.562,-122.273]].concat(_SM_BRIDGE.slice(1));
    R["Belmont"]       = [[37.520,-122.276],[37.562,-122.273]].concat(_SM_BRIDGE.slice(1));
    R["Millbrae"]      = [[37.599,-122.387],[37.584,-122.344],[37.562,-122.273]].concat(_SM_BRIDGE.slice(1));
    R["Half Moon Bay"] = [[37.464,-122.429],[37.494,-122.330],[37.562,-122.273]].concat(_SM_BRIDGE.slice(1));
    R["Redwood City"]  = [[37.485,-122.236],[37.490,-122.200],[37.513,-122.066]].concat(_DB_BRIDGE.slice(3));
    // Cities near Bay Bridge (via SF)
    R["Daly City"]     = [[37.688,-122.470],[37.775,-122.419]].concat(_BAY_BRIDGE);
    R["South San Francisco"] = [[37.655,-122.408],[37.681,-122.400],[37.715,-122.395],[37.750,-122.405],[37.775,-122.405]].concat(_BAY_BRIDGE);
    R["San Bruno"]     = [[37.631,-122.411],[37.655,-122.408],[37.681,-122.400],[37.715,-122.395],[37.750,-122.405],[37.775,-122.405]].concat(_BAY_BRIDGE);
    R["Pacifica"]      = [[37.614,-122.487],[37.688,-122.470],[37.775,-122.419]].concat(_BAY_BRIDGE);
    R["Brisbane"]      = [[37.681,-122.400],[37.715,-122.395],[37.750,-122.405],[37.775,-122.405]].concat(_BAY_BRIDGE);
    R["Colma"]         = [[37.677,-122.459],[37.688,-122.470],[37.775,-122.419]].concat(_BAY_BRIDGE);
    // Cities near Dumbarton Bridge (CA-84)
    R["Menlo Park"]    = [[37.453,-122.182]].concat(_DB_BRIDGE);
    R["East Palo Alto"] = [[37.469,-122.141]].concat(_DB_BRIDGE);
    R["Atherton"]      = [[37.461,-122.198],[37.479,-122.153]].concat(_DB_BRIDGE.slice(1));
    R["Woodside"]      = [[37.430,-122.254],[37.440,-122.200],[37.479,-122.153]].concat(_DB_BRIDGE.slice(1));
    R["Portola Valley"] = [[37.384,-122.235],[37.430,-122.254],[37.440,-122.200],[37.479,-122.153]].concat(_DB_BRIDGE.slice(1));

    // ---- SANTA CLARA COUNTY (South Bay) ----
    // San Jose, Milpitas → I-880 N
    R["San Jose"]      = [[37.338,-121.886],[37.380,-121.890]].concat(_I880S);
    R["Milpitas"]      = _I880S.slice(0);
    R["Sunnyvale"]     = [[37.369,-122.036],[37.393,-122.032],[37.432,-121.900]].concat(_I880S.slice(1));
    R["Santa Clara"]   = [[37.354,-121.955],[37.393,-122.032],[37.432,-121.900]].concat(_I880S.slice(1));
    // Cities via Dumbarton Bridge
    R["Mountain View"] = [[37.386,-122.084],[37.440,-122.120],[37.479,-122.153]].concat(_DB_BRIDGE.slice(1));
    R["Palo Alto"]     = [[37.442,-122.143],[37.479,-122.153]].concat(_DB_BRIDGE.slice(1));
    R["Los Altos"]     = [[37.385,-122.114],[37.440,-122.120],[37.479,-122.153]].concat(_DB_BRIDGE.slice(1));
    R["Los Altos Hills"] = [[37.371,-122.138],[37.440,-122.120],[37.479,-122.153]].concat(_DB_BRIDGE.slice(1));
    // Cities via I-880 (further south)
    R["Cupertino"]     = [[37.323,-122.032],[37.354,-121.955],[37.393,-122.032],[37.432,-121.900]].concat(_I880S.slice(1));
    R["Campbell"]      = [[37.287,-121.950],[37.310,-121.920],[37.338,-121.886],[37.380,-121.890]].concat(_I880S);
    R["Los Gatos"]     = [[37.227,-121.975],[37.268,-121.960],[37.310,-121.920],[37.338,-121.886],[37.380,-121.890]].concat(_I880S);
    R["Saratoga"]      = [[37.264,-122.023],[37.268,-121.960],[37.310,-121.920],[37.338,-121.886],[37.380,-121.890]].concat(_I880S);
    R["Monte Sereno"]  = [[37.236,-121.993],[37.268,-121.960],[37.310,-121.920],[37.338,-121.886],[37.380,-121.890]].concat(_I880S);
    R["Gilroy"]        = [[37.006,-121.568],[37.130,-121.654],[37.238,-121.780],[37.338,-121.886],[37.380,-121.890]].concat(_I880S);
    R["Morgan Hill"]   = [[37.131,-121.654],[37.238,-121.780],[37.338,-121.886],[37.380,-121.890]].concat(_I880S);

    // ---- MARIN COUNTY (North Bay via GG Bridge) ----
    var _MARIN_OAK = _GGB_BB.concat(_BAY_BRIDGE);
    R["Sausalito"]     = [[37.860,-122.486]].concat(_MARIN_OAK);
    R["Mill Valley"]   = [[37.906,-122.542],[37.882,-122.478]].concat(_MARIN_OAK);
    R["Tiburon"]       = [[37.874,-122.457],[37.882,-122.478]].concat(_MARIN_OAK);
    R["Belvedere"]     = [[37.872,-122.465],[37.882,-122.478]].concat(_MARIN_OAK);
    R["Corte Madera"]  = [[37.925,-122.528],[37.910,-122.510],[37.882,-122.478]].concat(_MARIN_OAK);
    R["Larkspur"]      = [[37.934,-122.535],[37.910,-122.510],[37.882,-122.478]].concat(_MARIN_OAK);
    R["San Anselmo"]   = [[37.975,-122.561],[37.960,-122.530],[37.910,-122.510],[37.882,-122.478]].concat(_MARIN_OAK);
    R["Fairfax"]       = [[37.987,-122.589],[37.975,-122.561],[37.960,-122.530],[37.910,-122.510],[37.882,-122.478]].concat(_MARIN_OAK);
    R["Ross"]          = [[37.963,-122.555],[37.960,-122.530],[37.910,-122.510],[37.882,-122.478]].concat(_MARIN_OAK);
    R["San Rafael"]    = [[37.974,-122.512],[37.960,-122.530],[37.910,-122.510],[37.882,-122.478]].concat(_MARIN_OAK);
    R["Novato"]        = [[38.009,-122.534],[37.974,-122.512],[37.960,-122.530],[37.910,-122.510],[37.882,-122.478]].concat(_MARIN_OAK);

    // ---- NAPA COUNTY (via CA-29 to I-80) ----
    var _NAPA_I80 = [[38.175,-122.230]].concat(_I80N_OAK);
    R["Napa"]          = [[38.298,-122.287],[38.253,-122.263],[38.175,-122.230]].concat(_I80N_OAK);
    R["American Canyon"] = _NAPA_I80.slice(0);
    R["Yountville"]    = [[38.402,-122.360],[38.367,-122.414],[38.298,-122.287],[38.253,-122.263],[38.175,-122.230]].concat(_I80N_OAK);
    R["St. Helena"]    = [[38.506,-122.470],[38.402,-122.360],[38.298,-122.287],[38.253,-122.263],[38.175,-122.230]].concat(_I80N_OAK);
    R["Calistoga"]     = [[38.579,-122.598],[38.506,-122.470],[38.402,-122.360],[38.298,-122.287],[38.253,-122.263],[38.175,-122.230]].concat(_I80N_OAK);

    // ---- SOLANO COUNTY (via I-80) ----
    R["Vallejo"]       = _I80N_OAK.slice(0);
    R["Benicia"]       = [[38.049,-122.157],[38.104,-122.257]].concat(_I80N_OAK.slice(1));
    R["Fairfield"]     = [[38.249,-122.040],[38.200,-122.120],[38.104,-122.257]].concat(_I80N_OAK.slice(1));
    R["Vacaville"]     = [[38.357,-121.988],[38.249,-122.040],[38.200,-122.120],[38.104,-122.257]].concat(_I80N_OAK.slice(1));
    R["Suisun City"]   = [[38.238,-122.040],[38.249,-122.040],[38.200,-122.120],[38.104,-122.257]].concat(_I80N_OAK.slice(1));
    R["Dixon"]         = [[38.446,-121.823],[38.357,-121.988],[38.249,-122.040],[38.200,-122.120],[38.104,-122.257]].concat(_I80N_OAK.slice(1));
    R["Rio Vista"]     = [[38.176,-121.692],[38.200,-121.850],[38.249,-122.040],[38.200,-122.120],[38.104,-122.257]].concat(_I80N_OAK.slice(1));

    // ---- SONOMA COUNTY (via US-101 S to GG Bridge) ----
    var _SONOMA_OAK = [[38.082,-122.550],[38.009,-122.534],[37.974,-122.512],[37.960,-122.530],[37.910,-122.510],[37.882,-122.478]].concat(_MARIN_OAK);
    R["Petaluma"]      = [[38.259,-122.636]].concat(_SONOMA_OAK);
    R["Cotati"]        = [[38.329,-122.708]].concat([[38.340,-122.700]]).concat(_SONOMA_OAK.slice(0));
    R["Rohnert Park"]  = [[38.340,-122.701]].concat(_SONOMA_OAK);
    R["Santa Rosa"]    = [[38.440,-122.714]].concat(_SONOMA_OAK);
    R["Sebastopol"]    = [[38.402,-122.824],[38.395,-122.750],[38.340,-122.700]].concat(_SONOMA_OAK);
    R["Sonoma"]        = [[38.292,-122.458],[38.260,-122.500],[38.259,-122.636]].concat(_SONOMA_OAK);
    R["Windsor"]       = [[38.547,-122.817],[38.490,-122.750],[38.440,-122.714]].concat(_SONOMA_OAK);
    R["Healdsburg"]    = [[38.613,-122.869],[38.547,-122.817],[38.490,-122.750],[38.440,-122.714]].concat(_SONOMA_OAK);
    R["Cloverdale"]    = [[38.806,-123.017],[38.700,-122.950],[38.613,-122.869],[38.547,-122.817],[38.490,-122.750],[38.440,-122.714]].concat(_SONOMA_OAK);

    // ================================================================
    // NEAREST BART STATION PER CITY
    // ================================================================
    var CITY_BART = {
        "Oakland": "12th St Oakland", "Fremont": "Fremont", "Hayward": "Hayward",
        "Berkeley": "Downtown Berkeley", "San Leandro": "San Leandro",
        "Livermore": "Dublin/Pleasanton", "Alameda": "12th St Oakland",
        "Pleasanton": "Dublin/Pleasanton", "Dublin": "Dublin/Pleasanton",
        "Union City": "Union City", "Newark": "Fremont",
        "Albany": "El Cerrito Plaza", "Emeryville": "MacArthur", "Piedmont": "MacArthur",
        "Concord": "Concord", "Antioch": "Antioch", "Richmond": "Richmond",
        "Pittsburg": "Pittsburg Center", "Walnut Creek": "Walnut Creek",
        "Oakley": "Antioch", "Pleasant Hill": "Pleasant Hill",
        "San Pablo": "Richmond", "El Cerrito": "El Cerrito Plaza",
        "Lafayette": "Lafayette", "Orinda": "Orinda",
        "San Francisco": "Embarcadero",
        "Daly City": "Daly City", "South San Francisco": "South San Francisco",
        "San Bruno": "San Bruno", "Colma": "Colma", "Millbrae": "Millbrae",
        "San Jose": "Berryessa", "Milpitas": "Milpitas",
        "Brisbane": "Balboa Park"
    };

    // ================================================================
    // PUBLIC API
    // ================================================================

    // ================================================================
    // HIGHWAY ROUTE EXTENSION FOR CITIES WITHOUT BART STATIONS
    // ================================================================
    var STATION_TO_CITY_EXTENSIONS = {
        "Danville": {
            "Walnut Creek": [[37.9056, -122.0669], [37.890, -122.058], [37.850, -122.032]]
        },
        "Clayton": {
            "Concord": [[37.9737, -122.0291], [37.955, -121.970]]
        }
    };

    function isStationInCity(stationName, cityName) {
        if (!stationName || !cityName) return false;
        var s = normalizeStationName(stationName).toLowerCase();
        var c = cityName.toLowerCase();
        
        if (s.indexOf(c) !== -1 || c.indexOf(s) !== -1) return true;
        
        if (s === "berryessa" && c === "san jose") return true;
        if (s === "bay fair" && c === "san leandro") return true;
        
        var oaklandStations = ["macarthur", "fruitvale", "coliseum", "lake merritt", "rockridge", "west oakland", "12th st oakland", "19th st oakland", "oakland airport"];
        if (c === "oakland" && oaklandStations.indexOf(s) !== -1) return true;
        
        var berkeleyStations = ["downtown berkeley", "north berkeley", "ashby"];
        if (c === "berkeley" && berkeleyStations.indexOf(s) !== -1) return true;
        
        var ecStations = ["el cerrito del norte", "el cerrito plaza"];
        if (c === "el cerrito" && ecStations.indexOf(s) !== -1) return true;
        
        var sfStations = ["embarcadero", "montgomery", "powell", "civic center", "16th st mission", "24th st mission", "glen park", "balboa park"];
        if (c === "san francisco" && sfStations.indexOf(s) !== -1) return true;
        
        if ((s === "dublin/pleasanton" || s === "west dublin/pleasanton") && (c === "dublin" || c === "pleasanton")) return true;
        
        return false;
    }

    function getHighwayRoute(cityName) {
        return R[cityName] || null;
    }

    function getExtendedHighwayRoute(cityName) {
        var route = R[cityName];
        if (!route) return null;

        var nearestStation = getNearestBartStation(cityName);
        if (nearestStation && !isStationInCity(nearestStation, cityName)) {
            // Check if we have a custom extension path
            if (STATION_TO_CITY_EXTENSIONS[cityName] && STATION_TO_CITY_EXTENSIONS[cityName][nearestStation]) {
                var ext = STATION_TO_CITY_EXTENSIONS[cityName][nearestStation];
                return ext.concat(route);
            }
            // Fallback: Connect the nearest BART station to the closest vertex on the highway route,
            // then trace backwards to the start of the route to ensure it follows actual road corridors.
            var stationCoords = BART_STATIONS[nearestStation];
            if (stationCoords && route.length > 0) {
                var minD = Infinity;
                var closestIdx = 0;
                for (var i = 0; i < route.length; i++) {
                    var dy = route[i][0] - stationCoords[0];
                    var dx = route[i][1] - stationCoords[1];
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < minD) {
                        minD = dist;
                        closestIdx = i;
                    }
                }
                
                var extended = [stationCoords];
                for (var i = closestIdx; i >= 0; i--) {
                    extended.push(route[i]);
                }
                for (var i = 0; i < route.length; i++) {
                    extended.push(route[i]);
                }
                return extended;
            }
        }
        return route;
    }

    function getBartRoute(cityNameOrStationName) {
        var stationName = normalizeStationName(cityNameOrStationName);
        if (!BART_STATIONS[stationName]) {
            stationName = getNearestBartStation(cityNameOrStationName);
        }
        if (!stationName || !BART_STATIONS[stationName]) return null;

        var path = BART_TO_COLISEUM[stationName];
        var route = [];
        var startCoords = BART_STATIONS[stationName];
        if (startCoords) route.push(startCoords);

        if (path) {
            for (var i = 0; i < path.length; i++) {
                var coords = BART_STATIONS[path[i]];
                if (coords) route.push(coords);
            }
        }

        var oakCoords = BART_STATIONS["Oakland Airport"];
        if (stationName !== "Oakland Airport" && oakCoords) {
            if (route.length === 0 || route[route.length - 1] !== oakCoords) {
                route.push(oakCoords);
            }
        }

        return route;
    }

    function getNearestBartStation(cityName) {
        if (CITY_BART[cityName]) {
            return CITY_BART[cityName];
        }
        var cityRoute = R[cityName];
        if (!cityRoute || cityRoute.length === 0) return null;
        var cityPt = cityRoute[0];

        var minDest = Infinity;
        var nearestStation = null;

        for (var stationName in BART_STATIONS) {
            var stationPt = BART_STATIONS[stationName];
            var dLat = stationPt[0] - cityPt[0];
            var dLng = stationPt[1] - cityPt[1];
            var distSq = dLat * dLat + dLng * dLng;
            if (distSq < minDest) {
                minDest = distSq;
                nearestStation = stationName;
            }
        }
        return nearestStation;
    }

    function getBartStations() {
        return BART_STATIONS;
    }

    function normalizeStationName(name) {
        if (!name) return "";
        // Normalize unicode/accented characters
        var norm = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        const map = {
            "berryessa/north san jose": "Berryessa",
            "oakland city center - 12th street": "12th St Oakland",
            "powell street": "Powell",
            "16th street mission": "16th St Mission",
            "19th street oakland": "19th St Oakland",
            "24th street mission": "24th St Mission",
            "montgomery street": "Montgomery",
            "pleasant hill/contra costa centre": "Pleasant Hill",
            "warm springs/south fremont": "Warm Springs",
            "oakland international airport": "Oakland Airport",
            "pittsburg/bay point transfer": "Pittsburg/Bay Point",
            "north concord/martinez": "Concord",
            "san francisco international airport": "San Francisco International Airport"
        };
        
        var key = norm.toLowerCase().trim();
        if (map[key]) return map[key];
        return name;
    }

    function getDisplayStationName(internalName) {
        const map = {
            "Berryessa": "Berryessa/North San José",
            "12th St Oakland": "Oakland Center - 12th Street",
            "Powell": "Powell Street",
            "16th St Mission": "16th Street Mission",
            "19th St Oakland": "19th Street Oakland",
            "24th St Mission": "24th Street Mission",
            "Montgomery": "Montgomery Street",
            "Pleasant Hill": "Pleasant Hill/Contra Costa Centre",
            "Warm Springs": "Warm Springs/South Fremont",
            "Oakland Airport": "Oakland International Airport"
        };
        return map[internalName] || internalName;
    }

    return {
        getHighwayRoute: getHighwayRoute,
        getExtendedHighwayRoute: getExtendedHighwayRoute,
        getBartRoute: getBartRoute,
        getNearestBartStation: getNearestBartStation,
        getBartStations: getBartStations,
        normalizeStationName: normalizeStationName,
        getDisplayStationName: getDisplayStationName,
        isStationInCity: isStationInCity,
        OAK: OAK
    };
})();
