/**
 * LeapYear Assessment — Scoring Algorithm (V2)
 *
 * Takes an object of raw responses (keyed by item ID) and returns:
 *   - Primary archetype + score
 *   - Secondary archetype + score
 *   - All 8 archetype composite scores (normalized 0–100)
 *   - Output modifiers (growth mindset tier, shadow selectors, social flavor)
 *   - Profile flags (balanced, renaissance)
 *
 * IMPORTANT: All weights in this file are starting hypotheses.
 * They MUST be calibrated by testing with the founding cohort
 * (Dominic → Philosopher, Holden → Explorer, Claire → Organizer,
 *  Sawyer → Analyst, Mackenzie → Builder, Kaden → Mobilizer, etc.)
 *
 * Item IDs follow the V2 inventory: A1–A33, B1–B10, C1–C6, D1–D28, E1–E8
 */

// ============================================================
// CONFIGURATION — Adjust these weights during calibration
// ============================================================

const ARCHETYPE_WEIGHTS = {
  philosopher: {
    orvisErudition: 0.35,
    ncs6: 0.40,
    intellect: 0.15,
    imagination: 0.10
  },
  explorer: {
    ceiTotal: 0.75,
    embracingBonus: 0.15,  // applied only if Embracing > Stretching
    lowOrderliness: 0.10
  },
  builder: {
    orvisProduction: 0.20,
    achievementEfficacy: 0.40,
    lowVulnerability: 0.20,
    selfDiscipline: 0.15,
    lowOtherScalesDiscount: 0.05
  },
  organizer: {
    orvisOrganization: 0.65,
    orderliness: 0.25,
    selfDiscipline: 0.10
  },
  analyst: {
    orvisAnalysis: 0.30,
    ncs6: 0.30,
    orderliness: 0.20,
    intellect: 0.20
  },
  connector: {
    orvisAltruism: 0.65,
    cooperation: 0.20,
    lowAssertiveness: 0.15
  },
  mobilizer: {
    orvisLeadership: 0.55,
    assertiveness: 0.30,
    lowCooperation: 0.15
  },
  creator: {
    orvisCreativity: 0.55,
    artisticInterests: 0.25,
    imagination: 0.20
  }
};

// Builder discount: if another archetype outscores Builder before discount,
// reduce Builder by this percentage. Calibrate with real students.
const BUILDER_DISCOUNT_PERCENT = 12;

// Balanced/Renaissance thresholds (in normalized 0–100 points)
const BALANCED_THRESHOLD = 5;   // top 2 within this range
const RENAISSANCE_THRESHOLD = 5; // top 3 within this range

// Growth mindset tiers (on 0–100 normalized scale)
// Original Dweck thresholds: 4.0/6 and 3.0/6 → normalized to 0–100
const GROWTH_MINDSET_HIGH = 60;  // corresponds to ~4.0 on 1–6 scale
const GROWTH_MINDSET_LOW = 40;   // corresponds to ~3.0 on 1–6 scale

// Shadow modifier thresholds (on normalized 0–100 facet scores)
const SHADOW_HIGH_THRESHOLD = 65;
const SHADOW_LOW_THRESHOLD = 35;


// ============================================================
// STEP 1: Calculate Raw Scores
// ============================================================

/**
 * Reverse-scores an item response.
 * @param {number} value - The raw response (1-based Likert)
 * @param {number} scaleMax - The maximum value on the scale (e.g. 5 for IPIP, 6 for Dweck)
 * @returns {number} The reversed score
 */
function reverseScore(value, scaleMax) {
  return (scaleMax + 1) - value;
}

/**
 * Sums a list of item responses from the response object.
 * @param {Object} responses - Full response object keyed by item ID
 * @param {string[]} itemIds - Array of item IDs to sum
 * @returns {number} Sum of responses
 */
function sumItems(responses, itemIds) {
  return itemIds.reduce((sum, id) => {
    const val = responses[id];
    if (val === undefined || val === null) {
      console.warn(`Missing response for item ${id}`);
      return sum;
    }
    return sum + val;
  }, 0);
}

/**
 * Calculates all raw scale scores from responses.
 * Handles reverse scoring where needed.
 * @param {Object} responses - Raw responses keyed by item ID (A1, B2, etc.)
 * @returns {Object} Raw scores for each scale/signal
 */
function calculateRawScores(responses) {
  // ---- ORVIS scales (all positively keyed, 1–5 Likert) ----
  const orvisLeadership = sumItems(responses, ['A1', 'A2', 'A3', 'A4', 'A5']);
  const orvisOrganization = sumItems(responses, ['A6', 'A7', 'A8', 'A9', 'A10']);
  const orvisAltruism = sumItems(responses, ['A11', 'A12', 'A13', 'A14', 'A15']);
  const orvisCreativity = sumItems(responses, ['A16', 'A17', 'A18', 'A19', 'A20']);
  const orvisAnalysis = sumItems(responses, ['A21', 'A22', 'A23', 'A24', 'A25']);
  const orvisErudition = sumItems(responses, ['A26', 'A27', 'A28', 'A29', 'A30']);
  const orvisProduction = sumItems(responses, ['A31', 'A32', 'A33']);

  // ---- CEI-II (all positively keyed, 1–5 Likert) ----
  const ceiStretching = sumItems(responses, ['B1', 'B3', 'B5', 'B7', 'B9']);
  const ceiEmbracing = sumItems(responses, ['B2', 'B4', 'B6', 'B8', 'B10']);
  const ceiTotal = ceiStretching + ceiEmbracing;

  // ---- NCS-6 (C3 and C4 reverse scored, 1–5 Likert) ----
  // Build a copy with reverse scoring applied
  const ncs6Responses = { ...responses };
  ncs6Responses['C3'] = reverseScore(responses['C3'], 5);
  ncs6Responses['C4'] = reverseScore(responses['C4'], 5);
  const ncs6 = sumItems(ncs6Responses, ['C1', 'C2', 'C3', 'C4', 'C5', 'C6']);

  // ---- IPIP-NEO facets (1–5 Likert, minus-keyed items reversed) ----
  // Achievement-Striving: D1(+), D2(+), D3(+), D4(−)
  const achievementStriving =
    responses['D1'] + responses['D2'] + responses['D3'] + reverseScore(responses['D4'], 5);

  // Self-Efficacy: D5(+), D6(+), D7(+), D8(−)
  const selfEfficacy =
    responses['D5'] + responses['D6'] + responses['D7'] + reverseScore(responses['D8'], 5);

  // Combined Builder IPIP signal
  const builderAchievementEfficacy = achievementStriving + selfEfficacy;

  // 2-item facets: each has one + and one − keyed item
  const imagination = responses['D9'] + reverseScore(responses['D10'], 5);
  const intellect = responses['D11'] + reverseScore(responses['D12'], 5);
  const artisticInterests = responses['D13'] + reverseScore(responses['D14'], 5);
  const orderliness = responses['D15'] + reverseScore(responses['D16'], 5);
  const selfDiscipline = responses['D17'] + reverseScore(responses['D18'], 5);
  const assertiveness = responses['D19'] + reverseScore(responses['D20'], 5);
  const gregariousness = responses['D21'] + reverseScore(responses['D22'], 5);
  const cooperation = responses['D23'] + reverseScore(responses['D24'], 5);
  const vulnerability = responses['D25'] + reverseScore(responses['D26'], 5);
  const selfConsciousness = responses['D27'] + reverseScore(responses['D28'], 5);

  // ---- Dweck Growth Mindset (1–6 Likert) ----
  // Entity items (E1–E4): higher raw = more growth mindset (agreement = fixed, so higher number on scale = more disagreement = more growth)
  // Incremental items (E5–E8): reverse scored (subtract from 7)
  const dweckScores = [
    responses['E1'],
    responses['E2'],
    responses['E3'],
    responses['E4'],
    reverseScore(responses['E5'], 6),
    reverseScore(responses['E6'], 6),
    reverseScore(responses['E7'], 6),
    reverseScore(responses['E8'], 6)
  ];
  const growthMindset = dweckScores.reduce((a, b) => a + b, 0) / 8;

  return {
    // ORVIS
    orvisLeadership,
    orvisOrganization,
    orvisAltruism,
    orvisCreativity,
    orvisAnalysis,
    orvisErudition,
    orvisProduction,

    // CEI-II
    ceiTotal,
    ceiStretching,
    ceiEmbracing,

    // NCS-6
    ncs6,

    // IPIP Builder signals
    builderAchievementEfficacy,
    achievementStriving,
    selfEfficacy,

    // IPIP texture facets
    imagination,
    intellect,
    artisticInterests,
    orderliness,
    selfDiscipline,
    assertiveness,
    gregariousness,
    cooperation,
    vulnerability,
    selfConsciousness,

    // Dweck
    growthMindset
  };
}


// ============================================================
// STEP 2: Normalize to 0–100
// ============================================================

/**
 * Scale ranges for each raw score.
 * [minimum possible, maximum possible]
 */
const SCALE_RANGES = {
  // ORVIS 5-item scales: min=5 (all 1s), max=25 (all 5s)
  orvisLeadership: [5, 25],
  orvisOrganization: [5, 25],
  orvisAltruism: [5, 25],
  orvisCreativity: [5, 25],
  orvisAnalysis: [5, 25],
  orvisErudition: [5, 25],

  // ORVIS 3-item scale: min=3, max=15
  orvisProduction: [3, 15],

  // CEI-II total (10 items, 1–5): min=10, max=50
  ceiTotal: [10, 50],
  ceiStretching: [5, 25],
  ceiEmbracing: [5, 25],

  // NCS-6 (6 items after reverse scoring, 1–5): min=6, max=30
  ncs6: [6, 30],

  // Builder combined (8 items after reverse scoring, 1–5): min=8, max=40
  builderAchievementEfficacy: [8, 40],

  // 2-item IPIP facets (after reverse scoring): min=2, max=10
  imagination: [2, 10],
  intellect: [2, 10],
  artisticInterests: [2, 10],
  orderliness: [2, 10],
  selfDiscipline: [2, 10],
  assertiveness: [2, 10],
  gregariousness: [2, 10],
  cooperation: [2, 10],
  vulnerability: [2, 10],
  selfConsciousness: [2, 10],

  // Dweck average: min=1.0, max=6.0
  growthMindset: [1.0, 6.0]
};

/**
 * Normalizes a raw score to a 0–100 scale.
 * @param {number} rawScore
 * @param {number} min - Minimum possible raw score
 * @param {number} max - Maximum possible raw score
 * @returns {number} Normalized score (0–100)
 */
function normalize(rawScore, min, max) {
  if (max === min) return 50; // safety fallback
  return ((rawScore - min) / (max - min)) * 100;
}

/**
 * Normalizes all raw scores to 0–100.
 * @param {Object} raw - Raw scores from calculateRawScores()
 * @returns {Object} Normalized scores (0–100)
 */
function normalizeAllScores(raw) {
  const normalized = {};
  for (const [key, value] of Object.entries(raw)) {
    if (SCALE_RANGES[key]) {
      const [min, max] = SCALE_RANGES[key];
      normalized[key] = normalize(value, min, max);
    } else {
      // Pass through scores without defined ranges (like growthMindset raw)
      normalized[key] = value;
    }
  }
  return normalized;
}


// ============================================================
// STEP 3: Calculate Composite Archetype Scores
// ============================================================

/**
 * Inverts a normalized score (0–100).
 * Used for "low X" signals (e.g., low Vulnerability for Builder).
 * A person scoring 80 on Vulnerability gets a "low Vulnerability" of 20.
 */
function invert(normalizedScore) {
  return 100 - normalizedScore;
}

/**
 * Calculates composite archetype scores from normalized signals.
 * @param {Object} n - Normalized scores (0–100)
 * @returns {Object} Composite scores for each archetype (0–100)
 */
function calculateArchetypeScores(n) {
  const w = ARCHETYPE_WEIGHTS;

  // --- Philosopher ---
  const philosopher =
    w.philosopher.orvisErudition * n.orvisErudition +
    w.philosopher.ncs6 * n.ncs6 +
    w.philosopher.intellect * n.intellect +
    w.philosopher.imagination * n.imagination;

  // --- Explorer ---
  // Embracing bonus: if Embracing > Stretching, add the bonus weight using Embracing score
  // Otherwise, redistribute that weight to ceiTotal
  const embracingGtStretching = n.ceiEmbracing > n.ceiStretching;
  const explorer = embracingGtStretching
    ? w.explorer.ceiTotal * n.ceiTotal +
      w.explorer.embracingBonus * n.ceiEmbracing +
      w.explorer.lowOrderliness * invert(n.orderliness)
    : (w.explorer.ceiTotal + w.explorer.embracingBonus) * n.ceiTotal +
      w.explorer.lowOrderliness * invert(n.orderliness);

  // --- Builder (three-signal approach) ---
  let builder =
    w.builder.orvisProduction * n.orvisProduction +
    w.builder.achievementEfficacy * n.builderAchievementEfficacy +
    w.builder.lowVulnerability * invert(n.vulnerability) +
    w.builder.selfDiscipline * n.selfDiscipline;
  // The low-other-scales component is handled in Step 3b (discount applied after all scores calculated)

  // --- Organizer ---
  const organizer =
    w.organizer.orvisOrganization * n.orvisOrganization +
    w.organizer.orderliness * n.orderliness +
    w.organizer.selfDiscipline * n.selfDiscipline;

  // --- Analyst ---
  const analyst =
    w.analyst.orvisAnalysis * n.orvisAnalysis +
    w.analyst.ncs6 * n.ncs6 +
    w.analyst.orderliness * n.orderliness +
    w.analyst.intellect * n.intellect;

  // --- Connector ---
  const connector =
    w.connector.orvisAltruism * n.orvisAltruism +
    w.connector.cooperation * n.cooperation +
    w.connector.lowAssertiveness * invert(n.assertiveness);

  // --- Mobilizer ---
  const mobilizer =
    w.mobilizer.orvisLeadership * n.orvisLeadership +
    w.mobilizer.assertiveness * n.assertiveness +
    w.mobilizer.lowCooperation * invert(n.cooperation);

  // --- Creator ---
  const creator =
    w.creator.orvisCreativity * n.orvisCreativity +
    w.creator.artisticInterests * n.artisticInterests +
    w.creator.imagination * n.imagination;

  const scores = {
    philosopher,
    explorer,
    builder,
    organizer,
    analyst,
    connector,
    mobilizer,
    creator
  };

  // --- Step 3b: Builder low-other-scales discount ---
  // If Mobilizer, Philosopher, or Explorer score higher than Builder (pre-discount),
  // the respondent's achievement drive is likely channeled elsewhere.
  // Apply a discount to the Builder score.
  const competingScores = [scores.mobilizer, scores.philosopher, scores.explorer];
  const maxCompeting = Math.max(...competingScores);

  if (maxCompeting > scores.builder) {
    // HYPOTHESIS: discount Builder by BUILDER_DISCOUNT_PERCENT
    // This prevents high-achievers who are really Mobilizers/Philosophers from
    // being misclassified as Builders.
    scores.builder = scores.builder * (1 - BUILDER_DISCOUNT_PERCENT / 100);
  }

  return scores;
}


// ============================================================
// STEP 4: Assign Primary & Secondary Archetypes
// ============================================================

/**
 * The 4 orientations and their member archetypes.
 */
const ORIENTATIONS = {
  thinking: ['philosopher', 'analyst'],
  doing: ['builder', 'organizer'],
  relating: ['connector', 'mobilizer'],
  experiencing: ['explorer', 'creator']
};

/**
 * Returns the orientation for a given archetype.
 */
function getOrientation(archetype) {
  for (const [orientation, archetypes] of Object.entries(ORIENTATIONS)) {
    if (archetypes.includes(archetype)) return orientation;
  }
  return null;
}

/**
 * Assigns primary and secondary archetypes and detects profile flags.
 * @param {Object} scores - Composite archetype scores
 * @returns {Object} Assignment result
 */
function assignArchetypes(scores) {
  // Sort archetypes by score descending
  const ranked = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .map(([archetype, score]) => ({ archetype, score: Math.round(score * 10) / 10 }));

  const primary = ranked[0];
  const secondary = ranked[1];
  const tertiary = ranked[2];

  // Detect balanced profile (top 2 within threshold)
  const isBalanced = (primary.score - secondary.score) <= BALANCED_THRESHOLD;

  // Detect renaissance profile (top 3 within threshold)
  const isRenaissance = isBalanced && (primary.score - tertiary.score) <= RENAISSANCE_THRESHOLD;

  // Determine orientation pairing for tension template selection
  const primaryOrientation = getOrientation(primary.archetype);
  const secondaryOrientation = getOrientation(secondary.archetype);
  const sameOrientation = primaryOrientation === secondaryOrientation;

  return {
    primary: primary.archetype,
    primaryScore: primary.score,
    secondary: secondary.archetype,
    secondaryScore: secondary.score,
    allScores: ranked,
    isBalanced,
    isRenaissance,
    primaryOrientation,
    secondaryOrientation,
    sameOrientation
  };
}


// ============================================================
// STEP 5: Determine Output Modifiers
// ============================================================

/**
 * Determines which tension template to use based on orientation pairing.
 * Returns a key identifying one of 10 tension templates.
 */
const TENSION_MAP = {
  // Cross-orientation tensions (6)
  'doing+thinking': 'action_vs_reflection',
  'doing+relating': 'output_vs_people',
  'doing+experiencing': 'structure_vs_freedom',
  'relating+thinking': 'ideas_vs_relationships',
  'experiencing+thinking': 'depth_vs_breadth',
  'experiencing+relating': 'community_vs_independence',
  // Within-orientation tensions (4)
  'thinking+thinking': 'theory_vs_systems',
  'doing+doing': 'vision_vs_execution',
  'relating+relating': 'depth_vs_breadth_relational',
  'experiencing+experiencing': 'inner_vs_outer'
};

function getTensionTemplate(primaryOrientation, secondaryOrientation) {
  // Sort the two orientations alphabetically so lookup is consistent
  const pair = [primaryOrientation, secondaryOrientation].sort().join('+');
  return TENSION_MAP[pair] || 'action_vs_reflection'; // fallback
}

/**
 * Determines all output modifiers from normalized facet scores and growth mindset.
 * These drive the conditional content selection in the output assembly engine.
 *
 * @param {Object} normalized - Normalized scores (0–100)
 * @param {Object} assignment - Archetype assignment result
 * @returns {Object} All output modifiers
 */
function determineOutputModifiers(normalized, assignment) {
  // --- Growth mindset tier ---
  // growthMindset is normalized to 0–100 like everything else
  const gmNorm = normalized.growthMindset;
  let growthMindsetTier;
  if (gmNorm >= GROWTH_MINDSET_HIGH) {
    growthMindsetTier = 'high';
  } else if (gmNorm <= GROWTH_MINDSET_LOW) {
    growthMindsetTier = 'low';
  } else {
    growthMindsetTier = 'mixed';
  }

  // --- Shadow selectors ---
  // Each facet can fire a HIGH or LOW shadow sentence if it crosses the threshold
  const shadows = [];

  // Vulnerability
  if (normalized.vulnerability >= SHADOW_HIGH_THRESHOLD) {
    shadows.push('vulnerability_high');
  } else if (normalized.vulnerability <= SHADOW_LOW_THRESHOLD) {
    shadows.push('vulnerability_low');
  }

  // Self-Discipline (especially relevant for Explorer, Mobilizer)
  if (normalized.selfDiscipline <= SHADOW_LOW_THRESHOLD) {
    if (['explorer', 'mobilizer'].includes(assignment.primary)) {
      shadows.push('selfDiscipline_low');
    }
  } else if (normalized.selfDiscipline >= SHADOW_HIGH_THRESHOLD) {
    shadows.push('selfDiscipline_high');
  }

  // Assertiveness
  if (normalized.assertiveness >= SHADOW_HIGH_THRESHOLD) {
    shadows.push('assertiveness_high');
  } else if (normalized.assertiveness <= SHADOW_LOW_THRESHOLD) {
    shadows.push('assertiveness_low');
  }

  // Gregariousness
  if (normalized.gregariousness >= SHADOW_HIGH_THRESHOLD) {
    shadows.push('gregariousness_high');
  } else if (normalized.gregariousness <= SHADOW_LOW_THRESHOLD) {
    shadows.push('gregariousness_low');
  }

  // Cooperation (especially relevant for Analyst, Mobilizer)
  if (normalized.cooperation <= SHADOW_LOW_THRESHOLD) {
    if (['analyst', 'mobilizer'].includes(assignment.primary)) {
      shadows.push('cooperation_low');
    }
  } else if (normalized.cooperation >= SHADOW_HIGH_THRESHOLD) {
    shadows.push('cooperation_high');
  }

  // Self-Consciousness
  if (normalized.selfConsciousness >= SHADOW_HIGH_THRESHOLD) {
    shadows.push('selfConsciousness_high');
  } else if (normalized.selfConsciousness <= SHADOW_LOW_THRESHOLD) {
    shadows.push('selfConsciousness_low');
  }

  // Imagination
  if (normalized.imagination >= SHADOW_HIGH_THRESHOLD) {
    shadows.push('imagination_high');
  } else if (normalized.imagination <= SHADOW_LOW_THRESHOLD) {
    shadows.push('imagination_low');
  }

  // Intellect
  if (normalized.intellect >= SHADOW_HIGH_THRESHOLD) {
    shadows.push('intellect_high');
  } else if (normalized.intellect <= SHADOW_LOW_THRESHOLD) {
    shadows.push('intellect_low');
  }

  // Artistic Interests
  if (normalized.artisticInterests >= SHADOW_HIGH_THRESHOLD) {
    shadows.push('artisticInterests_high');
  } else if (normalized.artisticInterests <= SHADOW_LOW_THRESHOLD) {
    shadows.push('artisticInterests_low');
  }

  // Orderliness
  if (normalized.orderliness >= SHADOW_HIGH_THRESHOLD) {
    shadows.push('orderliness_high');
  } else if (normalized.orderliness <= SHADOW_LOW_THRESHOLD) {
    shadows.push('orderliness_low');
  }

  // Pick 2–4 shadow modifiers (prioritize the most extreme scores)
  // Sort by how far each facet is from the midpoint (50), take top 2-4
  const shadowsLimited = shadows.slice(0, 4);

  // --- Tension template ---
  const tensionTemplate = getTensionTemplate(
    assignment.primaryOrientation,
    assignment.secondaryOrientation
  );

  // --- Social flavor (Gregariousness) ---
  let socialFlavor;
  if (normalized.gregariousness >= SHADOW_HIGH_THRESHOLD) {
    socialFlavor = 'social';
  } else if (normalized.gregariousness <= SHADOW_LOW_THRESHOLD) {
    socialFlavor = 'independent';
  } else {
    socialFlavor = 'balanced';
  }

  return {
    growthMindsetTier,
    growthMindsetScore: gmNorm,
    shadows: shadowsLimited,
    tensionTemplate,
    socialFlavor,

    // Pass through useful flags for the output assembly engine
    vulnerabilityLevel: normalized.vulnerability >= SHADOW_HIGH_THRESHOLD ? 'high'
      : normalized.vulnerability <= SHADOW_LOW_THRESHOLD ? 'low' : 'moderate',
    selfConsciousnessLevel: normalized.selfConsciousness >= SHADOW_HIGH_THRESHOLD ? 'high'
      : normalized.selfConsciousness <= SHADOW_LOW_THRESHOLD ? 'low' : 'moderate'
  };
}


// ============================================================
// MAIN ENTRY POINT
// ============================================================

/**
 * Scores a complete set of assessment responses.
 *
 * @param {Object} responses - Raw responses keyed by item ID.
 *   Example: { A1: 4, A2: 5, A3: 3, ..., E8: 2 }
 *   All 85 items must be present.
 *
 * @returns {Object} Complete scoring result:
 *   {
 *     primary: 'philosopher',
 *     primaryScore: 78.3,
 *     secondary: 'explorer',
 *     secondaryScore: 71.1,
 *     pairingKey: 'philosopher_explorer',   // for pairing name lookup
 *     isBalanced: false,
 *     isRenaissance: false,
 *     allScores: [...],                     // all 8 ranked
 *     modifiers: {
 *       growthMindsetTier: 'high',
 *       shadows: ['vulnerability_high', 'cooperation_low'],
 *       tensionTemplate: 'depth_vs_breadth',
 *       socialFlavor: 'social',
 *       ...
 *     },
 *     raw: {...},        // raw scores for debugging
 *     normalized: {...}  // normalized scores for debugging
 *   }
 */
export function scoreAssessment(responses) {
  // Validate input
  const expectedItems = 85;
  const providedItems = Object.keys(responses).length;
  if (providedItems < expectedItems) {
    console.warn(`Expected ${expectedItems} responses, got ${providedItems}. Missing items may affect accuracy.`);
  }

  // Step 1: Raw scores
  const raw = calculateRawScores(responses);

  // Step 2: Normalize
  const normalized = normalizeAllScores(raw);

  // Step 3: Composite archetype scores
  const archetypeScores = calculateArchetypeScores(normalized);

  // Step 4: Assign archetypes
  const assignment = assignArchetypes(archetypeScores);

  // Step 5: Output modifiers
  const modifiers = determineOutputModifiers(normalized, assignment);

  // Build pairing key (alphabetical order for consistent lookup)
  const pairingKey = [assignment.primary, assignment.secondary].sort().join('_');

  return {
    // Core result
    primary: assignment.primary,
    primaryScore: assignment.primaryScore,
    secondary: assignment.secondary,
    secondaryScore: assignment.secondaryScore,
    pairingKey,

    // Profile flags
    isBalanced: assignment.isBalanced,
    isRenaissance: assignment.isRenaissance,

    // Full rankings
    allScores: assignment.allScores,

    // Output assembly instructions
    modifiers,

    // Debug data (useful during calibration, can strip for production)
    _debug: {
      raw,
      normalized,
      archetypeScores
    }
  };
}


// ============================================================
// DISPLAY HELPER (for testing / calibration)
// ============================================================

/**
 * Formats a scoring result as a readable string for testing.
 */
export function formatResult(result) {
  const lines = [];

  const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);

  lines.push('═══════════════════════════════════════');
  lines.push(`  YOU ARE: The ${capitalize(result.primary)}`);
  lines.push(`  WITH: ${capitalize(result.secondary)} tendencies`);
  lines.push('═══════════════════════════════════════');

  if (result.isRenaissance) {
    lines.push('  ★ Renaissance Profile — you resist easy categorization');
  } else if (result.isBalanced) {
    lines.push('  ★ Balanced Profile — your top two types are closely matched');
  }

  lines.push('');
  lines.push('  All Archetype Scores:');
  for (const { archetype, score } of result.allScores) {
    const bar = '█'.repeat(Math.round(score / 3));
    const marker = archetype === result.primary ? ' ◀ PRIMARY'
      : archetype === result.secondary ? ' ◀ secondary' : '';
    lines.push(`    ${capitalize(archetype).padEnd(12)} ${score.toFixed(1).padStart(5)}  ${bar}${marker}`);
  }

  lines.push('');
  lines.push(`  Growth Mindset: ${result.modifiers.growthMindsetTier} (${result.modifiers.growthMindsetScore.toFixed(0)}/100)`);
  lines.push(`  Tension Template: ${result.modifiers.tensionTemplate}`);
  lines.push(`  Social Flavor: ${result.modifiers.socialFlavor}`);
  lines.push(`  Shadow Modifiers: ${result.modifiers.shadows.join(', ') || 'none fired'}`);

  return lines.join('\n');
}
