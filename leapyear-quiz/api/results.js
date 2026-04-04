/**
 * LeapYear Quiz — Results Endpoint
 * GET /api/results?token=xxx
 *
 * Fetches quiz result from Airtable and returns the lightweight score object.
 * The client reconstructs full narratives from content.js.
 */

const AIRTABLE_BASE = process.env.AIRTABLE_BASE_ID || 'app4NpJ7gQZvHpwGe';
const QUIZ_TABLE = process.env.QUIZ_RESULTS_TABLE_ID || 'tbloJLR4kV4KZmQJw';

// Field IDs for Quiz Results table
const FIELDS = {
  token:          'fldkWmyvZIVs3PmE0',
  primaryType:    'fldZlSmbtV25i1NIx',
  secondaryType:  'fld7eajQd4qdiON0G',
  primaryScore:   'fld9whxM7vCTBL6PH',
  secondaryScore: 'fldnEU82h3lV646pZ',
  philosopher:    'fldTUyaryt1V7Np6N',
  analyst:        'fldwxtIcj0vgKGQe5',
  builder:        'fldsEUvHi6asSCyPV',
  organizer:      'fldDpOvUelNdC9yxM',
  connector:      'fldOPr3HYuAXNYlf9',
  mobilizer:      'fldCqsCFwxHWfsKVx',
  creator:        'fldfFVfa6YTOfNLGI',
  explorer:       'fld6w1XNdOPyzIs5f',
  isBalanced:     'fld01CcMsnTRzTYX1',
  isRenaissance:  'fldXQSIqRrWu9wzKN',
  growthMindset:  'fldMu5yC7c2b7JmNU',
  tension:        'fldGmCIcLY3Yl8VtA',
  socialFlavor:   'fldOLJfzcLtKyOHtG',
  shadows:        'fld4l1h4Z0wtroQbI',
};

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.query.token;
  if (!token || token.length < 8) {
    return res.status(400).json({ error: 'Missing or invalid token' });
  }

  try {
    const formula = encodeURIComponent(`{Token} = "${token}"`);
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE}/${QUIZ_TABLE}?filterByFormula=${formula}&maxRecords=1&returnFieldsByFieldId=true`;

    const airtableRes = await fetch(url, {
      headers: { 'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}` },
    });

    if (!airtableRes.ok) {
      console.error('Airtable error:', airtableRes.status, await airtableRes.text());
      return res.status(502).json({ error: 'Database error' });
    }

    const data = await airtableRes.json();
    if (!data.records || data.records.length === 0) {
      return res.status(404).json({ error: 'Result not found' });
    }

    const f = data.records[0].fields;

    // Read select field values (Airtable returns { id, name, color } for selects)
    const selectName = v => (v && typeof v === 'object' && v.name) ? v.name : v;

    // Reconstruct the result object in the shape that renderResults() expects
    const archetypes = ['philosopher', 'analyst', 'builder', 'organizer', 'connector', 'mobilizer', 'creator', 'explorer'];
    const allScores = archetypes
      .map(a => ({
        archetype: a,
        score: f[FIELDS[a]] || 0,
      }))
      .sort((a, b) => b.score - a.score);

    const primaryName = selectName(f[FIELDS.primaryType])?.toLowerCase() || allScores[0].archetype;
    const secondaryName = selectName(f[FIELDS.secondaryType])?.toLowerCase() || allScores[1].archetype;

    // Build pairing key (alphabetical sort)
    const pairingKey = [primaryName, secondaryName].sort().join('_');

    // Parse shadows from comma-separated string
    const shadowsRaw = f[FIELDS.shadows] || '';
    const shadowsArr = shadowsRaw ? shadowsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

    const result = {
      primary: primaryName,
      primaryScore: f[FIELDS.primaryScore] || 0,
      secondary: secondaryName,
      secondaryScore: f[FIELDS.secondaryScore] || 0,
      pairingKey,
      isBalanced: f[FIELDS.isBalanced] || false,
      isRenaissance: f[FIELDS.isRenaissance] || false,
      allScores,
      modifiers: {
        growthMindsetTier: selectName(f[FIELDS.growthMindset]) || 'mixed',
        tensionTemplate: f[FIELDS.tension] || '',
        socialFlavor: selectName(f[FIELDS.socialFlavor]) || 'balanced',
        shadows: shadowsArr,
      },
    };

    // Cache immutable results for 24 hours
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    return res.status(200).json(result);

  } catch (err) {
    console.error('Results handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
