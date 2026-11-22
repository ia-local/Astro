/**
 * cosmology-engine.js
 * Moteur Bio-Astronomique & Les 5 Échelles Cosmiques — AstroHub
 * Intègre astronomy-engine (éphémérides JPL) + double repère Sidéral / Tropical
 */

const SIGNS_ORDER = [
    "Bélier", "Taureau", "Gémeaux", "Cancer",
    "Lion", "Vierge", "Balance", "Scorpion",
    "Sagittaire", "Capricorne", "Verseau", "Poissons"
];

const ELEMENT_COLORS = {
    "Feu": "#ff4d6d",
    "Terre": "#52b788",
    "Air": "#4ea8de",
    "Eau": "#7b2cbf"
};

// Frontières astronomiques réelles de l'UAI le long de l'écliptique (longitude J2000 en degrés)
const IAU_CONSTELLATIONS = [
    { name: "Pisces (Poissons)", start: 351.6, end: 28.7 },
    { name: "Aries (Bélier)", start: 28.7, end: 53.4 },
    { name: "Taurus (Taureau)", start: 53.4, end: 90.1 },
    { name: "Gemini (Gémeaux)", start: 90.1, end: 118.0 },
    { name: "Cancer", start: 118.0, end: 138.0 },
    { name: "Leo (Lion)", start: 138.0, end: 173.9 },
    { name: "Virgo (Vierge)", start: 173.9, end: 217.8 },
    { name: "Libra (Balance)", start: 217.8, end: 241.0 },
    { name: "Scorpius (Scorpion)", start: 241.0, end: 247.6 },
    { name: "Ophiuchus (Serpentaire)", start: 247.6, end: 266.3 },
    { name: "Sagittarius (Sagittaire)", start: 266.3, end: 299.7 },
    { name: "Capricornus (Capricorne)", start: 299.7, end: 327.5 },
    { name: "Aquarius (Verseau)", start: 327.5, end: 351.6 }
];

const BODIES_CONFIG = [
    { key: "Sun", name: "Soleil", symbol: "☉", color: "#ffd166", auScale: 0.25 },
    { key: "Moon", name: "Lune", symbol: "☽", color: "#e0fbfc", auScale: 0.14 },
    { key: "Mercury", name: "Mercure", symbol: "☿", color: "#adb5bd", auScale: 0.34 },
    { key: "Venus", name: "Vénus", symbol: "♀", color: "#f4a261", auScale: 0.43 },
    { key: "Mars", name: "Mars", symbol: "♂", color: "#ff4d6d", auScale: 0.53 },
    { key: "Jupiter", name: "Jupiter", symbol: "♃", color: "#ee9b00", auScale: 0.65 },
    { key: "Saturn", name: "Saturne", symbol: "♄", color: "#e9c46a", auScale: 0.76 },
    { key: "Uranus", name: "Uranus", symbol: "♅", color: "#4ea8de", auScale: 0.85 },
    { key: "Neptune", name: "Neptune", symbol: "♆", color: "#4361ee", auScale: 0.93 },
    { key: "Pluto", name: "Pluton", symbol: "♇", color: "#b5179e", auScale: 1.00 }
];

const SCALES_INFO = [
    {
        id: 5,
        name: "Échelle 5 — L'Univers (Torus)",
        speed: "Expansion H₀ (~70 km/s/Mpc)",
        role: "Topologie globale et référentiel géométrique absolu (360°)."
    },
    {
        id: 4,
        name: "Échelle 4 — Le Cosmos (Superamas)",
        speed: "~600 km/s (vers Grand Attracteur)",
        role: "Toile de fond stellaire lointaine et superamas de la Vierge."
    },
    {
        id: 3,
        name: "Échelle 3 — La Galaxie (Voie Lactée)",
        speed: "~230 km/s (Période ~225 Ma)",
        role: "Repère Sidéral : constellations réelles & Centre Galactique (~266,8°)."
    },
    {
        id: 2,
        name: "Échelle 2 — Le Système Solaire",
        speed: "Orbite hélicoïdale autour du Soleil",
        role: "Repère Tropical : saisons, longitudes écliptiques, distances UA & barycentre."
    },
    {
        id: 1,
        name: "Échelle 1 — Le Système Terre-Lune",
        speed: "Rotation 24h / Orbite 27,3 j",
        role: "Horizon local, forces de marée (0–120), déclinaison lunaire & chronobiologie."
    }
];

// Données de repli intégrées (identiques à vivant-data.json pour exécution sans serveur local)
const EMBEDDED_VIVANT_DATA = {
    "Bélier": {
        symbol: "♈", constellation: "Aries (Bélier)", element: "Feu", biodynamicPart: "Fruits & Graines", ruler: "Mars",
        humain: { energie: "Impulsion vive, réactivité neuromusculaire élevée, besoin d'initiative et d'action directe.", chronobiologie: "Pic matinal de cortisol dynamique ; canaliser la tension nerveuse par un effort physique bref.", conseil: "Lancer une action concrète ou trancher une décision en attente." },
        animal: { comportement: "Vivacité accrue chez les prédateurs et les espèces territoriales ; déplacements rapides.", conseil: "Privilégier les séances de jeu actif et de dépense énergétique en extérieur." },
        vegetal: { organe: "Fruits & Graines", action: "Jour Fruits : idéal pour semer, greffer ou récolter les plantes fruitières (tomates, courges, pois, arbres fruitiers).", seve: "Stimulation de la mise à fruit et de la maturation des semences." },
        mineral: { resonance: "Oxydes de fer, hématite, quartz hématoïde — conductivité thermique et dynamisme géomagnétique." }
    },
    "Taureau": {
        symbol: "♉", constellation: "Taurus (Taureau)", element: "Terre", biodynamicPart: "Racines & Bulbes", ruler: "Vénus",
        humain: { energie: "Ancrage sensoriel, endurance calme, recherche de stabilité matérielle et de rythme régulier.", chronobiologie: "Métabolisme orienté vers l'assimilation et la récupération profonde ; sommeil réparateur favorisé.", conseil: "Consolider les acquis, structurer un projet durable et soigner l'alimentation." },
        animal: { comportement: "Phase de pâturage calme, rumination prolongée et recherche de confort thermique.", conseil: "Maintenir des routines stables et renforcer l'apprentissage par récompense calme." },
        vegetal: { organe: "Racines & Tubercules", action: "Jour Racines : propice aux radis, panais, pommes de terre, carottes, travail du sol et amendements.", seve: "Concentration des réserves nutritives dans le système racinaire." },
        mineral: { resonance: "Silicates denses, argiles fertiles, calcite et cuivre natif — cohésion cristalline." }
    },
    "Gémeaux": {
        symbol: "♊", constellation: "Gemini (Gémeaux)", element: "Air", biodynamicPart: "Fleurs", ruler: "Mercure",
        humain: { energie: "Agilité intellectuelle, curiosité, besoin d'échange verbal, d'écriture et de mobilité.", chronobiologie: "Vigilance cérébrale rapide mais dispersion possible en fin de journée ; aérer l'espace de travail.", conseil: "Rédiger, documenter, synthétiser des informations ou tester de nouvelles idées." },
        animal: { comportement: "Vocalisations fréquentes, exploration curieuse de l'environnement, activité élevée des oiseaux.", conseil: "Stimuler l'intelligence par des exercices olfactifs ou vocaux variés." },
        vegetal: { organe: "Fleurs & Plantes aromatiques à fleurs", action: "Jour Fleurs : favoriser les plantes ornementales, pollinisatrices, artichauts, brocolis et récolte de fleurs.", seve: "Montée vers les bourgeons floraux et production d'huiles essentielles." },
        mineral: { resonance: "Agate rubanée, mica, fluorite — polarisation optique et échanges ioniques." }
    },
    "Cancer": {
        symbol: "♋", constellation: "Cancer", element: "Eau", biodynamicPart: "Feuilles & Tiges", ruler: "Lune",
        humain: { energie: "Sensibilité émotionnelle accrue, réceptivité intuitive, besoin de protection et de foyer.", chronobiologie: "Forte sensibilité aux marées hydriques internes et à la mélatonine ; privilégier le calme le soir.", conseil: "Prendre soin de son environnement proche, restaurer l'équilibre intérieur." },
        animal: { comportement: "Synchronisation forte des espèces littorales et aquatiques avec le marnage ; instinct protecteur.", conseil: "Respecter les zones de repli et veiller à une hydratation optimale." },
        vegetal: { organe: "Feuilles & Salades", action: "Jour Feuilles : idéal pour laitues, épinards, choux, herbes feuillues (sauge, persil) et arrosage.", seve: "Circulation hydrique abondante dans le limbe foliaire ; éviter la récolte de conservation." },
        mineral: { resonance: "Pierre de lune (adulaire), nacre, gypse — forte affinité avec l'eau interstitielle." }
    },
    "Lion": {
        symbol: "♌", constellation: "Leo (Lion)", element: "Feu", biodynamicPart: "Fruits & Graines", ruler: "Soleil",
        humain: { energie: "Rayonnement personnel, créativité affirmée, générosité et clarté de direction.", chronobiologie: "Tonus cardiovasculaire soutenu ; exposition à la lumière naturelle particulièrement bénéfique.", conseil: "Présenter une réalisation aboutie, créer ou fédérer autour d'une vision." },
        animal: { comportement: "Postures d'affirmation sociale, phases de repos solaire alternant avec des pics d'activité.", conseil: "Favoriser les activités extérieures lumineuses et les interactions sociales." },
        vegetal: { organe: "Fruits & Graines", action: "Jour Fruits : excellent pour récolter les fruits mûrs destinés à la conservation et sélectionner les graines.", seve: "Synthèse des sucres et vitalité solaire maximale dans les organes fructifères." },
        mineral: { resonance: "Pyrite, ambre fossile, quartz citrin — piézoélectricité et réflexion solaire." }
    },
    "Vierge": {
        symbol: "♍", constellation: "Virgo (Vierge)", element: "Terre", biodynamicPart: "Racines & Bulbes", ruler: "Mercure",
        humain: { energie: "Précision analytique, sens de l'ordre, rigueur technique et discernement pratique.", chronobiologie: "Attention fine aux détails ; système digestif sensible au stress, privilégier la sobriété.", conseil: "Auditer, nettoyer le code ou les données, organiser les protocoles et les outils." },
        animal: { comportement: "Toilettage minutieux, tri alimentaire sélectif et vigilance aux micro-variations du milieu.", conseil: "Contrôler l'hygiène de l'habitat, les rations et le suivi sanitaire." },
        vegetal: { organe: "Racines & Désherbage", action: "Jour Racines : binage, sarclage, bouturage de fin d'été et entretien des cultures racinaires.", seve: "Structuration des tissus fibreux et cicatrisation nette des tailles." },
        mineral: { resonance: "Jaspe, péridot, quartz hyalin — régularité réticulaire et pureté structurale." }
    },
    "Balance": {
        symbol: "♎", constellation: "Libra (Balance)", element: "Air", biodynamicPart: "Fleurs", ruler: "Vénus",
        humain: { energie: "Recherche d'harmonie, sens esthétique, coopération équilibrée et diplomatie.", chronobiologie: "Équilibre neurovégétatif ; favorable aux activités artistiques, musicales (432 Hz) et relationnelles.", conseil: "Ajuster l'ergonomie d'une interface, dialoguer et harmoniser les priorités." },
        animal: { comportement: "Comportements d'apaisement, parades coordonnées et cohabitation pacifique.", conseil: "Encourager la socialisation calme entre espèces ou congénères." },
        vegetal: { organe: "Fleurs & Plantes mellifères", action: "Jour Fleurs : plantation de vivaces fleuries, entretien des bordures et équilibre pollinisateur.", seve: "Équilibre harmonieux entre croissance aérienne et floraison." },
        mineral: { resonance: "Lapis-lazuli, tourmaline, calcite optique — symétrie et équilibre des charges." }
    },
    "Scorpion": {
        symbol: "♏", constellation: "Scorpius (Scorpion)", element: "Eau", biodynamicPart: "Feuilles & Tiges", ruler: "Pluton / Mars",
        humain: { energie: "Concentration intense, profondeur d'investigation, résilience et transformation.", chronobiologie: "Régénération cellulaire nocturne prononcée ; évacuer les tensions accumulées.", conseil: "Aller au fond d'un problème complexe, éliminer le superflu." },
        animal: { comportement: "Discrétion accrue, activité crépusculaire et nocturne renforcée, instinct de piste.", conseil: "Respecter le calme et proposer des activités de recherche en profondeur." },
        vegetal: { organe: "Feuilles & Compostage", action: "Jour Feuilles : arrosage profond, préparation des purins végétaux et retournement du compost.", seve: "Activation microbiologique du sol et absorption humique." },
        mineral: { resonance: "Obsidienne, magnétite, grenat — magnétisme profond et roches volcaniques." }
    },
    "Sagittaire": {
        symbol: "♐", constellation: "Sagittarius (Centre Galactique)", element: "Feu", biodynamicPart: "Fruits & Graines", ruler: "Jupiter",
        humain: { energie: "Vision globale, ouverture philosophique, élan d'exploration et synthèse stratégique.", chronobiologie: "Besoin d'espace et de mouvement ample ; respiration profonde et marche en plein air.", conseil: "Prendre de la hauteur sur l'architecture d'ensemble et planifier à long terme." },
        animal: { comportement: "Instinct migratoire et exploratoire marqué, besoin de grands espaces de déplacement.", conseil: "Allonger les promenades et varier les itinéraires de découverte." },
        vegetal: { organe: "Fruits & Plantes grimpantes", action: "Jour Fruits : semis de légumineuses grimpantes, entretien des vergers et taille de fructification.", seve: "Élongation des tiges fructifères et vigueur de croissance." },
        mineral: { resonance: "Turquoise, sodalite, labradorite — iridescence spectrale et ouverture optique." }
    },
    "Capricorne": {
        symbol: "♑", constellation: "Capricornus (Capricorne)", element: "Terre", biodynamicPart: "Racines & Écorces", ruler: "Saturne",
        humain: { energie: "Sobriété stoïcienne, persévérance, maîtrise du temps et architecture solide.", chronobiologie: "Endurance à l'effort prolongé ; veiller à l'échauffement articulaire par temps frais.", conseil: "Finaliser les tâches exigeantes, documenter et pérenniser les acquis." },
        animal: { comportement: "Économie d'énergie, vigilance calme et recherche de points hauts ou abrités.", conseil: "Privilégier la régularité et la discipline douce." },
        vegetal: { organe: "Racines & Plantes vivaces ligneuses", action: "Jour Racines : plantation d'arbres et arbustes, travail des sols lourds, conservation longue durée.", seve: "Renforcement des parois cellulosiques et de la résistance au froid." },
        mineral: { resonance: "Quartz fumé, granit, onyx — structure cristalline stable et haute densité." }
    },
    "Verseau": {
        symbol: "♒", constellation: "Aquarius (Verseau)", element: "Air", biodynamicPart: "Fleurs", ruler: "Uranus / Saturne",
        humain: { energie: "Originalité technique, pensée systémique en réseau, émancipation et innovation.", chronobiologie: "Excitabilité électrique du système nerveux ; couper les écrans 1h avant le sommeil.", conseil: "Prototyper une solution novatrice, expérimenter de nouveaux algorithmes." },
        animal: { comportement: "Comportements atypiques ou inventifs, sensibilité aux variations électromagnétiques et météo.", conseil: "Introduire un nouvel enrichissement ludique dans l'environnement." },
        vegetal: { organe: "Fleurs & Graines oléagineuses", action: "Jour Fleurs : aération des serres, semis de fleurs champêtres et stimulation de la floraison.", seve: "Circulation rapide et sensibilité accrue aux variations atmosphériques." },
        mineral: { resonance: "Améthyste, cristal de roche, célestine — résonance piézoélectrique haute fréquence." }
    },
    "Poissons": {
        symbol: "♓", constellation: "Pisces (Poissons)", element: "Eau", biodynamicPart: "Feuilles & Tiges", ruler: "Neptune / Jupiter",
        humain: { energie: "Intuition globale, empathie, créativité musicale et contemplative.", chronobiologie: "Rêves intenses et perméabilité émotionnelle ; phase idéale pour la méditation et la musique.", conseil: "Laisser décanter les idées, composer ou contempler sans forcer." },
        animal: { comportement: "Forte activité de la faune marine et des zones humides ; sensibilité aux courants et marées.", conseil: "Approche douce et observation silencieuse." },
        vegetal: { organe: "Feuilles & Plantes aquatiques/humides", action: "Jour Feuilles : semis de feuillages tendres, paillage humide et soins doux au feuillage.", seve: "Hydratation tissulaire maximale ; éviter les tailles sévères." },
        mineral: { resonance: "Aigue-marine, halite, opale hydratée — échange ionique en milieu aqueux." }
    }
};

class CosmologyEngine {
    constructor() {
        this.vivantData = EMBEDDED_VIVANT_DATA;
        this.referentialMode = "double"; // "double" | "sideral" | "tropical"
        this.currentDate = new Date();
        this.observer = { lat: 49.23, lon: -0.18, label: "Bavent (49.23° N, 0.18° O)" };
        this.lastSnapshot = null;
    }

    async init() {
        // Chargement optionnel de vivant-data.json si servi via HTTP/HTTPS
        try {
            const res = await fetch("./vivant-data.json");
            if (res.ok) {
                const json = await res.json();
                if (json && json.signs) {
                    this.vivantData = json.signs;
                }
            }
        } catch (err) {
            // Repli silencieux sur EMBEDDED_VIVANT_DATA (mode file://)
        }
    }

    normalizeDeg(deg) {
        return ((deg % 360) + 360) % 360;
    }

    shortestAngleDiff(a, b) {
        let diff = this.normalizeDeg(b - a);
        if (diff > 180) diff -= 360;
        return diff;
    }

    formatDegMin(deg) {
        const d = Math.floor(deg);
        const m = Math.floor((deg - d) * 60);
        return `${String(d).padStart(2, "0")}°${String(m).padStart(2, "0")}'`;
    }

    getZodiacInfo(lonDeg) {
        const norm = this.normalizeDeg(lonDeg);
        const signIndex = Math.floor(norm / 30);
        const degInSign = norm % 30;
        const signName = SIGNS_ORDER[signIndex];
        const signMeta = this.vivantData[signName] || EMBEDDED_VIVANT_DATA[signName];
        return {
            longitude: norm,
            signIndex,
            signName,
            symbol: signMeta.symbol,
            element: signMeta.element,
            biodynamicPart: signMeta.biodynamicPart,
            degInSign,
            formatted: `${this.formatDegMin(degInSign)} ${signMeta.symbol} ${signName}`
        };
    }

    getIAUConstellation(j2000Lon) {
        const lon = this.normalizeDeg(j2000Lon);
        for (const c of IAU_CONSTELLATIONS) {
            if (c.start > c.end) {
                if (lon >= c.start || lon < c.end) return c.name;
            } else {
                if (lon >= c.start && lon < c.end) return c.name;
            }
        }
        return "Pisces (Poissons)";
    }

    getAzimuthCardinal(az) {
        const dirs = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
        const idx = Math.round(this.normalizeDeg(az) / 45) % 8;
        return dirs[idx];
    }

    /**
     * Calcul complet de l'état des 5 Échelles Cosmiques à l'instant T
     */
    computeSnapshot(dateObj, lat, lon) {
        if (typeof Astronomy === "undefined") {
            throw new Error("La bibliothèque astronomy-engine n'est pas chargée.");
        }

        const time = Astronomy.MakeTime(dateObj);
        const timeStepPlus = Astronomy.MakeTime(new Date(dateObj.getTime() + 6 * 3600 * 1000));
        const timeStepMinus = Astronomy.MakeTime(new Date(dateObj.getTime() - 6 * 3600 * 1000));
        const obs = new Astronomy.Observer(lat, lon, 15);

        // Siècles juliens depuis J2000.0
        const T = time.ut / 36525.0;
        // Précession générale en longitude depuis J2000 (en degrés)
        const precessionDeg = (50.28796195 * T + 1.1054348 * T * T) / 3600.0;
        // Ayanamsa Fagan-Bradley / Galactique à la date T (aligne 0° Bélier sidéral sur les étoiles fixes)
        const ayanamsaDeg = 24.04204 + 1.39697128 * T;
        // Centre Galactique (Sagittarius A* ~ 266.84° J2000)
        const galacticCenterJ2000 = 266.84;
        const galacticCenterTropical = this.normalizeDeg(galacticCenterJ2000 + precessionDeg);
        const galacticCenterSidereal = this.normalizeDeg(galacticCenterTropical - ayanamsaDeg);

        const bodies = BODIES_CONFIG.map(cfg => {
            const bodyEnum = Astronomy.Body[cfg.key];
            const geoVec = Astronomy.GeoVector(bodyEnum, time, true);
            const eclJ2000 = Astronomy.Ecliptic(geoVec);

            // Longitude Tropicale (date T) et Sidérale
            const lonTropical = this.normalizeDeg(eclJ2000.elon + precessionDeg);
            const lonSidereal = this.normalizeDeg(lonTropical - ayanamsaDeg);

            // Vitesse orbitale géocentrique (°/jour) par différence finie sur 12h
            const eclPlus = Astronomy.Ecliptic(Astronomy.GeoVector(bodyEnum, timeStepPlus, true)).elon;
            const eclMinus = Astronomy.Ecliptic(Astronomy.GeoVector(bodyEnum, timeStepMinus, true)).elon;
            const deltaLon = this.shortestAngleDiff(eclMinus, eclPlus);
            const speedDegPerDay = deltaLon / 0.5; // 12h = 0.5 jour
            const isRetrograde = cfg.key !== "Sun" && cfg.key !== "Moon" && speedDegPerDay < 0;

            // Distance géocentrique et héliocentrique
            const distGeoAU = Math.hypot(geoVec.x, geoVec.y, geoVec.z);
            const distGeoKm = distGeoAU * Astronomy.KM_PER_AU;

            let distHelioAU = 0;
            if (cfg.key !== "Sun") {
                const helioVec = Astronomy.HelioVector(bodyEnum, time);
                distHelioAU = Math.hypot(helioVec.x, helioVec.y, helioVec.z);
            }

            // Coordonnées horizontales locales (Échelle 1)
            const eq = Astronomy.Equator(bodyEnum, time, obs, true, true);
            const hor = Astronomy.Horizon(time, obs, eq.ra, eq.dec, "normal");

            const tropicalZodiac = this.getZodiacInfo(lonTropical);
            const siderealZodiac = this.getZodiacInfo(lonSidereal);
            const iauConstellation = this.getIAUConstellation(eclJ2000.elon);

            return {
                ...cfg,
                lonJ2000: eclJ2000.elon,
                lonTropical,
                lonSidereal,
                elat: eclJ2000.elat,
                tropicalZodiac,
                siderealZodiac,
                iauConstellation,
                distGeoAU,
                distGeoKm,
                distHelioAU,
                speedDegPerDay,
                isRetrograde,
                altitude: hor.altitude,
                azimuth: hor.azimuth,
                azimuthDir: this.getAzimuthCardinal(hor.azimuth),
                declination: eq.dec
            };
        });

        const sun = bodies.find(b => b.key === "Sun");
        const moon = bodies.find(b => b.key === "Moon");

        // Illumination & Phase Lunaire
        const moonIllum = Astronomy.Illumination(Astronomy.Body.Moon, time);
        const moonPhaseAngle = Astronomy.MoonPhase(time);
        const illuminationPct = moonIllum.phase_fraction * 100;

        let phaseName = "Nouvelle Lune";
        if (moonPhaseAngle >= 22.5 && moonPhaseAngle < 67.5) phaseName = "Premier Croissant";
        else if (moonPhaseAngle >= 67.5 && moonPhaseAngle < 112.5) phaseName = "Premier Quartier";
        else if (moonPhaseAngle >= 112.5 && moonPhaseAngle < 157.5) phaseName = "Lune Gibbeuse Croissante";
        else if (moonPhaseAngle >= 157.5 && moonPhaseAngle < 202.5) phaseName = "Pleine Lune";
        else if (moonPhaseAngle >= 202.5 && moonPhaseAngle < 247.5) phaseName = "Lune Gibbeuse Décroissante";
        else if (moonPhaseAngle >= 247.5 && moonPhaseAngle < 292.5) phaseName = "Dernier Quartier";
        else if (moonPhaseAngle >= 292.5 && moonPhaseAngle < 337.5) phaseName = "Dernier Croissant";

        // Lune Montante vs Descendante (dérivée de la déclinaison géocentrique)
        const timePlus1h = Astronomy.MakeTime(new Date(dateObj.getTime() + 3600 * 1000));
        const moonEqNow = Astronomy.Equator(Astronomy.Body.Moon, time, obs, true, true);
        const moonEqNext = Astronomy.Equator(Astronomy.Body.Moon, timePlus1h, obs, true, true);
        const isMoonAscending = moonEqNext.dec > moonEqNow.dec;

        // Indice de Gravité & Marées (0 à 120)
        // Loi gravitationnelle différentielle en 1 / d^3
        const meanMoonKm = 384400.0;
        const tidalForceMoon = Math.pow(meanMoonKm / moon.distGeoKm, 3);
        const tidalForceSun = 0.4605 * Math.pow(1.0 / sun.distGeoAU, 3);
        const syzygyAngleRad = ((moon.lonTropical - sun.lonTropical) * Math.PI) / 180.0;
        const combinedTidal = Math.sqrt(
            tidalForceMoon * tidalForceMoon +
            tidalForceSun * tidalForceSun +
            2 * tidalForceMoon * tidalForceSun * Math.cos(2 * syzygyAngleRad)
        );
        const tidalIndex = Math.round(
            Math.min(120, Math.max(20, 20 + ((combinedTidal - 0.35) / 1.385) * 100))
        );

        let tidalRegime = "Moyenne-Eau";
        if (tidalIndex >= 95) tidalRegime = "Grande Vive-Eau (Syzygie forte)";
        else if (tidalIndex >= 75) tidalRegime = "Vive-Eau";
        else if (tidalIndex <= 45) tidalRegime = "Grande Morte-Eau (Quadrature)";
        else if (tidalIndex <= 60) tidalRegime = "Morte-Eau";

        // Proximité Périgée (356 500 km) / Apogée (406 700 km)
        const perigeeRatio = Math.max(0, Math.min(100, ((406700 - moon.distGeoKm) / (406700 - 356500)) * 100));
        let apsisLabel = "Distance moyenne";
        if (perigeeRatio >= 80) apsisLabel = "Proche Périgée (gravité max)";
        else if (perigeeRatio <= 20) apsisLabel = "Proche Apogée (gravité min)";

        // Durée du jour local (Chronobiologie Échelle 1)
        let dayLengthStr = "—";
        try {
            const startOfDay = new Date(dateObj);
            startOfDay.setHours(0, 0, 0, 0);
            const rise = Astronomy.SearchRiseSet(Astronomy.Body.Sun, obs, +1, Astronomy.MakeTime(startOfDay), 1);
            const set = Astronomy.SearchRiseSet(Astronomy.Body.Sun, obs, -1, Astronomy.MakeTime(startOfDay), 1);
            if (rise && set) {
                const diffMs = set.date.getTime() - rise.date.getTime();
                if (diffMs > 0) {
                    const hrs = Math.floor(diffMs / 3600000);
                    const mins = Math.round((diffMs % 3600000) / 60000);
                    const fmtTime = d => d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
                    dayLengthStr = `${hrs}h${String(mins).padStart(2, "0")} (${fmtTime(rise.date)} → ${fmtTime(set.date)})`;
                }
            }
        } catch (e) {
            dayLengthStr = "Calcul polaire / hors horizon";
        }

        // Aspects planétaires majeurs (orbe 6°)
        const aspects = [];
        const aspectDefs = [
            { name: "Conjonction", angle: 0, orb: 6, color: "#ffd166" },
            { name: "Sextile", angle: 60, orb: 4, color: "#4ea8de" },
            { name: "Carré", angle: 90, orb: 5, color: "#ff4d6d" },
            { name: "Trigone", angle: 120, orb: 6, color: "#52b788" },
            { name: "Opposition", angle: 180, orb: 6, color: "#ee9b00" }
        ];

        for (let i = 0; i < bodies.length; i++) {
            for (let j = i + 1; j < bodies.length; j++) {
                const diff = Math.abs(this.shortestAngleDiff(bodies[i].lonTropical, bodies[j].lonTropical));
                for (const asp of aspectDefs) {
                    if (Math.abs(diff - asp.angle) <= asp.orb) {
                        aspects.push({
                            b1: bodies[i],
                            b2: bodies[j],
                            type: asp.name,
                            orb: Math.abs(diff - asp.angle).toFixed(1),
                            color: asp.color
                        });
                    }
                }
            }
        }

        this.lastSnapshot = {
            dateObj,
            precessionDeg,
            ayanamsaDeg,
            galacticCenterTropical,
            galacticCenterSidereal,
            bodies,
            sun,
            moon,
            illuminationPct,
            moonPhaseAngle,
            phaseName,
            isMoonAscending,
            tidalIndex,
            tidalRegime,
            perigeeRatio,
            apsisLabel,
            dayLengthStr,
            aspects
        };

        return this.lastSnapshot;
    }

    /**
     * Génère la roue SVG des 5 Échelles Cosmiques
     */
    renderCosmicWheelSVG(svgElement, snapshot, mode = "double") {
        const cx = 310;
        const cy = 310;
        const rScale5 = 296; // Échelle 5 : Univers (Torus gradué)
        const rScale4 = 278; // Échelle 4 : Cosmos (Étoiles & Superamas)
        const rScale3 = 248; // Échelle 3 : Galaxie (Sidéral / Voie Lactée)
        const rScale2 = 205; // Échelle 2 : Système Solaire (Tropical / Planètes)
        const rInner = 92;   // Frontière Échelle 1 : Système Terre-Lune

        let svg = `<defs>
            <radialGradient id="cosmosBg" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#141b2d"/>
                <stop offset="70%" stop-color="#0d1322"/>
                <stop offset="100%" stop-color="#070a12"/>
            </radialGradient>
            <radialGradient id="earthGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#4ea8de" stop-opacity="0.45"/>
                <stop offset="100%" stop-color="#4ea8de" stop-opacity="0"/>
            </radialGradient>
        </defs>`;

        // Fond cosmique
        svg += `<circle cx="${cx}" cy="${cy}" r="${rScale5}" fill="url(#cosmosBg)" stroke="#23314d" stroke-width="2"/>`;

        // Échelle 5 : Anneau Torus gradué tous les 10°
        for (let deg = 0; deg < 360; deg += 10) {
            const rad = ((deg - 90) * Math.PI) / 180;
            const r1 = deg % 30 === 0 ? rScale5 - 12 : rScale5 - 6;
            const x1 = cx + r1 * Math.cos(rad);
            const y1 = cy + r1 * Math.sin(rad);
            const x2 = cx + rScale5 * Math.cos(rad);
            const y2 = cy + rScale5 * Math.sin(rad);
            svg += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${deg % 30 === 0 ? '#4ea8de' : '#263552'}" stroke-width="${deg % 30 === 0 ? 1.5 : 0.8}"/>`;
        }

        // Échelle 4 : Toile de fond stellaire (étoiles déterministes) & Superamas de la Vierge
        svg += `<circle cx="${cx}" cy="${cy}" r="${rScale4}" fill="none" stroke="#1e2a44" stroke-width="1" stroke-dasharray="3,4"/>`;
        for (let s = 0; s < 48; s++) {
            const angle = ((s * 137.508) % 360) * (Math.PI / 180);
            const dist = rScale3 + 6 + ((s * 19) % 20);
            const sx = cx + dist * Math.cos(angle);
            const sy = cy + dist * Math.sin(angle);
            const sr = (s % 3 === 0) ? 1.5 : 0.9;
            svg += `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="${sr}" fill="#f4f6f9" opacity="${0.35 + (s % 5) * 0.12}"/>`;
        }

        // Axe du Centre Galactique (Échelle 3)
        const gcAngle = mode === "tropical" ? snapshot.galacticCenterTropical : snapshot.galacticCenterSidereal;
        const gcRad = ((gcAngle - 90) * Math.PI) / 180;
        const gcX = cx + rScale3 * Math.cos(gcRad);
        const gcY = cy + rScale3 * Math.sin(gcRad);
        svg += `<line x1="${cx}" y1="${cy}" x2="${gcX.toFixed(1)}" y2="${gcY.toFixed(1)}" stroke="#b5179e" stroke-width="1.2" stroke-dasharray="5,4" opacity="0.75"/>`;
        svg += `<circle cx="${gcX.toFixed(1)}" cy="${gcY.toFixed(1)}" r="5" fill="#b5179e"/>`;
        svg += `<text x="${(cx + (rScale3 + 14) * Math.cos(gcRad)).toFixed(1)}" y="${(cy + (rScale3 + 14) * Math.sin(gcRad)).toFixed(1)}" fill="#e0aaff" font-size="9" font-weight="bold" text-anchor="middle" dominant-baseline="middle">GC</text>`;

        // Échelle 3 : Anneau Sidéral (Constellations)
        svg += `<circle cx="${cx}" cy="${cy}" r="${rScale3}" fill="none" stroke="${mode === 'tropical' ? '#25334d' : '#7b2cbf'}" stroke-width="${mode === 'tropical' ? 1 : 2}"/>`;
        if (mode === "double" || mode === "sideral") {
            const offsetSid = mode === "double" ? snapshot.ayanamsaDeg : 0;
            for (let i = 0; i < 12; i++) {
                const startDeg = i * 30 + offsetSid;
                const midDeg = startDeg + 15;
                const radLine = ((startDeg - 90) * Math.PI) / 180;
                const radMid = ((midDeg - 90) * Math.PI) / 180;

                const x1 = cx + rScale2 * Math.cos(radLine);
                const y1 = cy + rScale2 * Math.sin(radLine);
                const x2 = cx + rScale3 * Math.cos(radLine);
                const y2 = cy + rScale3 * Math.sin(radLine);
                svg += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#3a2d5c" stroke-width="1"/>`;

                const signName = SIGNS_ORDER[i];
                const sym = EMBEDDED_VIVANT_DATA[signName].symbol;
                const tx = cx + ((rScale2 + rScale3) / 2) * Math.cos(radMid);
                const ty = cy + ((rScale2 + rScale3) / 2) * Math.sin(radMid);
                svg += `<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" fill="#c77dff" font-size="13" text-anchor="middle" dominant-baseline="middle">${sym}</text>`;
            }
        }

        // Échelle 2 : Anneau Tropical (Signes & Éléments)
        svg += `<circle cx="${cx}" cy="${cy}" r="${rScale2}" fill="none" stroke="${mode === 'sideral' ? '#25334d' : '#4ea8de'}" stroke-width="${mode === 'sideral' ? 1 : 2}"/>`;
        if (mode === "double" || mode === "tropical") {
            const outerR = mode === "tropical" ? rScale3 : rScale2;
            const innerR = mode === "tropical" ? rScale2 : rScale2 - 32;
            for (let i = 0; i < 12; i++) {
                const startDeg = i * 30;
                const midDeg = startDeg + 15;
                const radLine = ((startDeg - 90) * Math.PI) / 180;
                const radMid = ((midDeg - 90) * Math.PI) / 180;
                const signName = SIGNS_ORDER[i];
                const meta = EMBEDDED_VIVANT_DATA[signName];
                const elColor = ELEMENT_COLORS[meta.element];

                const x1 = cx + innerR * Math.cos(radLine);
                const y1 = cy + innerR * Math.sin(radLine);
                const x2 = cx + outerR * Math.cos(radLine);
                const y2 = cy + outerR * Math.sin(radLine);
                svg += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#2b3d5e" stroke-width="1"/>`;

                const tx = cx + ((innerR + outerR) / 2) * Math.cos(radMid);
                const ty = cy + ((innerR + outerR) / 2) * Math.sin(radMid);
                svg += `<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" fill="${elColor}" font-size="13" font-weight="bold" text-anchor="middle" dominant-baseline="middle">${meta.symbol}</text>`;
            }
            svg += `<circle cx="${cx}" cy="${cy}" r="${innerR}" fill="none" stroke="#2b3d5e" stroke-width="1"/>`;
        }

        // Calcul des coordonnées écran des 10 astres dans la zone Échelle 2 (entre rInner et rPlanMax)
        const rPlanMin = rInner + 14;
        const rPlanMax = (mode === "double") ? rScale2 - 42 : rScale2 - 14;

        const planetCoords = snapshot.bodies.map(b => {
            const lon = (mode === "sideral") ? b.lonSidereal : b.lonTropical;
            const rad = ((lon - 90) * Math.PI) / 180;
            const r = rPlanMin + b.auScale * (rPlanMax - rPlanMin);
            return {
                body: b,
                lon,
                rad,
                x: cx + r * Math.cos(rad),
                y: cy + r * Math.sin(rad),
                orbitR: r
            };
        });

        // Tracé des aspects géométriques majeurs entre astres
        for (const asp of snapshot.aspects) {
            const p1 = planetCoords.find(p => p.body.key === asp.b1.key);
            const p2 = planetCoords.find(p => p.body.key === asp.b2.key);
            if (p1 && p2) {
                svg += `<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="${asp.color}" stroke-width="1" opacity="0.32"/>`;
            }
        }

        // Orbites et marqueurs des 10 astres
        for (const p of planetCoords) {
            svg += `<circle cx="${cx}" cy="${cy}" r="${p.orbitR.toFixed(1)}" fill="none" stroke="#1b263b" stroke-width="0.6"/>`;
            // Ligne de visée vers l'anneau zodiacal
            const rimX = cx + rScale2 * Math.cos(p.rad);
            const rimY = cy + rScale2 * Math.sin(p.rad);
            svg += `<line x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="${rimX.toFixed(1)}" y2="${rimY.toFixed(1)}" stroke="${p.body.color}" stroke-width="0.7" opacity="0.4"/>`;

            svg += `<g class="planet-node" data-planet="${p.body.key}" style="cursor:pointer;">
                <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="10" fill="#0a0e17" stroke="${p.body.color}" stroke-width="1.6"/>
                <text x="${p.x.toFixed(1)}" y="${(p.y + 0.5).toFixed(1)}" fill="${p.body.color}" font-size="11" font-weight="bold" text-anchor="middle" dominant-baseline="middle">${p.body.symbol}</text>
                <title>${p.body.name} : ${mode === 'sideral' ? p.body.siderealZodiac.formatted + ' (Sidéral)' : p.body.tropicalZodiac.formatted + ' (Tropical)'} | Haut. ${p.body.altitude.toFixed(1)}°</title>
            </g>`;
        }

        // Échelle 1 : Système Terre-Lune au centre
        svg += `<circle cx="${cx}" cy="${cy}" r="${rInner}" fill="#0b1324" stroke="#4ea8de" stroke-width="1.8"/>`;
        svg += `<circle cx="${cx}" cy="${cy}" r="42" fill="url(#earthGlow)"/>`;

        // Orbite elliptique de la Lune (excentricité visuelle)
        const moonAngle = ((mode === "sideral" ? snapshot.moon.lonSidereal : snapshot.moon.lonTropical) - 90) * (Math.PI / 180);
        const moonOrbitR = 54 + (1 - snapshot.perigeeRatio / 100) * 18; // Plus proche = Périgée
        svg += `<ellipse cx="${cx - 4}" cy="${cy + 2}" rx="66" ry="60" fill="none" stroke="#4ea8de" stroke-width="1" stroke-dasharray="3,3" opacity="0.65"/>`;

        // Terre au centre
        svg += `<circle cx="${cx}" cy="${cy}" r="16" fill="#1d4ed8" stroke="#4ea8de" stroke-width="2"/>`;
        svg += `<path d="M ${cx - 8} ${cy - 4} Q ${cx} ${cy - 10} ${cx + 7} ${cy - 2} T ${cx + 4} ${cy + 9} Q ${cx - 5} ${cy + 8} ${cx - 8} ${cy - 4}" fill="#52b788" opacity="0.85"/>`;
        svg += `<text x="${cx}" y="${cy + 28}" fill="#90e0ef" font-size="8.5" font-weight="bold" text-anchor="middle">TERRE (Éch. 1)</text>`;

        // Lune sur son orbite centrale
        const mx = cx + moonOrbitR * Math.cos(moonAngle);
        const my = cy + moonOrbitR * Math.sin(moonAngle);
        svg += `<circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="7" fill="#f8f9fa" stroke="#4ea8de" stroke-width="1.5"/>`;
        svg += `<text x="${mx.toFixed(1)}" y="${(my - 11).toFixed(1)}" fill="#f4f6f9" font-size="8.5" font-weight="bold" text-anchor="middle">☽ ${Math.round(snapshot.illuminationPct)}%</text>`;

        svgElement.innerHTML = svg;
    }

    /**
     * Calcul de thème natal rapide pour le Module Duo
     */
    computeBirthProfile(dateStr) {
        if (!dateStr || typeof Astronomy === "undefined") return null;
        const d = new Date(`${dateStr}T12:00:00Z`);
        if (isNaN(d.getTime())) return null;

        const time = Astronomy.MakeTime(d);
        const T = time.ut / 36525.0;
        const precessionDeg = (50.28796195 * T + 1.1054348 * T * T) / 3600.0;
        const ayanamsaDeg = 24.04204 + 1.39697128 * T;

        const sunEcl = Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body.Sun, time, true)).elon;
        const moonEcl = Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body.Moon, time, true)).elon;

        const sunTrop = this.getZodiacInfo(sunEcl + precessionDeg);
        const sunSid = this.getZodiacInfo(sunEcl + precessionDeg - ayanamsaDeg);
        const moonTrop = this.getZodiacInfo(moonEcl + precessionDeg);
        const moonSid = this.getZodiacInfo(moonEcl + precessionDeg - ayanamsaDeg);

        return {
            dateStr,
            sunTrop,
            sunSid,
            moonTrop,
            moonSid
        };
    }

    analyzeDuoWithSky(dateA, dateB, snapshot) {
        const pA = this.computeBirthProfile(dateA);
        const pB = this.computeBirthProfile(dateB);
        if (!pA || !pB || !snapshot) return null;

        const sunDelta = Math.abs(this.shortestAngleDiff(pA.sunTrop.longitude, pB.sunTrop.longitude));
        let synergieBase = "Complémentarité dynamique";
        if (Math.abs(sunDelta - 180) <= 15) synergieBase = "Polarité Opposée Complémentaire (Axe 180° — L'Ancre & La Voile)";
        else if (Math.abs(sunDelta - 120) <= 12) synergieBase = "Harmonie Trigone (120° — Fluidité naturelle)";
        else if (Math.abs(sunDelta - 90) <= 12) synergieBase = "Stimulation Carré (90° — Création par l'action)";
        else if (Math.abs(sunDelta - 60) <= 10) synergieBase = "Coopération Sextile (60° — Échange constructif)";
        else if (sunDelta <= 12) synergieBase = "Conjonction Solaire (0° — Unité de direction)";

        // Transit de la Lune du jour sur les Soleils natals
        const moonToA = Math.abs(this.shortestAngleDiff(snapshot.moon.lonTropical, pA.sunTrop.longitude));
        const moonToB = Math.abs(this.shortestAngleDiff(snapshot.moon.lonTropical, pB.sunTrop.longitude));

        const describeTransit = (deg) => {
            if (deg <= 10) return "Conjonction lunaire active (amplification émotionnelle)";
            if (Math.abs(deg - 120) <= 10) return "Trigone lunaire (fluidité et soutien)";
            if (Math.abs(deg - 60) <= 8) return "Sextile lunaire (dialogue favorisé)";
            if (Math.abs(deg - 90) <= 10) return "Carré lunaire (ajustement demandé)";
            if (Math.abs(deg - 180) <= 10) return "Opposition lunaire (mise en lumière)";
            return "Transit neutre / intégration calme";
        };

        return {
            pA,
            pB,
            synergieBase,
            transitA: describeTransit(moonToA),
            transitB: describeTransit(moonToB)
        };
    }
}

window.CosmologyEngine = CosmologyEngine;
window.SCALES_INFO = SCALES_INFO;
window.ELEMENT_COLORS = ELEMENT_COLORS;
