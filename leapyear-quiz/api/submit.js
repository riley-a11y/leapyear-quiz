/**
 * LeapYear Quiz — Submit Endpoint
 * POST /api/submit
 *
 * Receives quiz results, writes to Airtable (Quiz Results + People),
 * sends results email via Resend, returns token.
 */

const { nanoid } = require('nanoid');

// Airtable config
const AIRTABLE_BASE = process.env.AIRTABLE_BASE_ID || 'app4NpJ7gQZvHpwGe';
const QUIZ_TABLE = process.env.QUIZ_RESULTS_TABLE_ID || 'tbloJLR4kV4KZmQJw';
const PEOPLE_TABLE = process.env.PEOPLE_TABLE_ID || 'tblyVLwjm2UylfKt5';
const LEAD_SOURCE_ID = process.env.QUIZ_LEAD_SOURCE_ID || 'recMgmeKCOKp2cjeT';

// Airtable field IDs for Quiz Results
const QR = {
  token:          'fldkWmyvZIVs3PmE0',
  person:         'fldocfI5M0q4oCqMd',
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
  submitted:      'fldAS4GVQo0QSIaAS',
};

// People table field IDs
const PPL = {
  firstName:      'fldTXig6K6riXgAdA',
  preferredEmail: 'fld4zOZVE7E6zcIcV',
  type:           'fldjMvmCFoenGP7fF',
  createLead:     'fldLSGxtFg3fG83cr',
  leadSource:     'flddN90lGUeJJGM15',
};

// Core drives for email (static — avoids importing large content.js)
const CORE_DRIVES = {
  philosopher: 'understanding life',
  explorer:    'experiencing the world',
  builder:     'making things real',
  organizer:   'bringing order to chaos',
  analyst:     'decoding systems',
  connector:   'forming relationships',
  mobilizer:   'rallying others toward a vision',
  creator:     'self-expression and beauty',
};

// Archetype colors for email styling
const COLORS = {
  philosopher: '#6B8FA3',
  explorer:    '#D4883A',
  builder:     '#8B6F47',
  organizer:   '#5A7247',
  analyst:     '#4A6670',
  connector:   '#C2785C',
  mobilizer:   '#B85C3A',
  creator:     '#7B6B8A',
};

// --- Airtable helpers ---

async function airtableFetch(table, method, body, recordId) {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE}/${table}` + (recordId ? `/${recordId}` : '');
  const res = await fetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Airtable ${method} ${table}: ${res.status} ${text}`);
  }
  return res.json();
}

async function findPersonByEmail(email) {
  const formula = encodeURIComponent(`{Preferred Email} = "${email}"`);
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE}/${PEOPLE_TABLE}?filterByFormula=${formula}&maxRecords=1`;
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.records && data.records.length > 0 ? data.records[0].id : null;
}

async function createPerson(name, email, role) {
  // Map role to People table Type field values
  const typeMap = {
    student: 'Student',
    parent: 'Parent',
    other: null, // Don't set a type for "other"
  };
  const typeValue = typeMap[role] || typeMap[role?.toLowerCase()];

  const fields = {
    [PPL.firstName]: name,
    [PPL.preferredEmail]: email,
    [PPL.createLead]: true,
    [PPL.leadSource]: [LEAD_SOURCE_ID],
  };
  if (typeValue) {
    fields[PPL.type] = [typeValue];
  }

  const result = await airtableFetch(PEOPLE_TABLE, 'POST', {
    records: [{ fields }],
  });
  return result.records[0].id;
}

async function createQuizResult(token, personId, data) {
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const fields = {
    [QR.token]:          token,
    [QR.primaryType]:    cap(data.primary),
    [QR.secondaryType]:  cap(data.secondary),
    [QR.primaryScore]:   data.primaryScore,
    [QR.secondaryScore]: data.secondaryScore,
    [QR.isBalanced]:     data.isBalanced || false,
    [QR.isRenaissance]:  data.isRenaissance || false,
    [QR.growthMindset]:  data.growthMindsetTier || 'mixed',
    [QR.tension]:        data.tensionTemplate || '',
    [QR.socialFlavor]:   data.socialFlavor || 'balanced',
    [QR.shadows]:        Array.isArray(data.shadows) ? data.shadows.join(',') : '',
    [QR.submitted]:      new Date().toISOString(),
  };

  // Link to Person if available
  if (personId) {
    fields[QR.person] = [personId];
  }

  // Add individual archetype scores
  const archetypes = ['philosopher', 'analyst', 'builder', 'organizer', 'connector', 'mobilizer', 'creator', 'explorer'];
  archetypes.forEach(a => {
    if (data.allScores && data.allScores[a] != null) {
      fields[QR[a]] = parseFloat(data.allScores[a]);
    }
  });

  return airtableFetch(QUIZ_TABLE, 'POST', { records: [{ fields }] });
}

// --- Email ---

async function sendResultsEmail(name, email, primary, token) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set — skipping email');
    return;
  }

  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const typeName = cap(primary);
  const coreDrive = CORE_DRIVES[primary] || '';
  const color = COLORS[primary] || '#DD5E32';
  const resultsUrl = `https://personality.startleapyear.com/results/${token}`;
  const calendlyUrl = `https://calendly.com/riley-startleapyear/leapyear-student-interview-clone?hide_gdpr_banner=1&primary_color=dd5e32&utm_content=${token}`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#1a1a1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
        <!-- Logo -->
        <tr><td style="padding-bottom:32px;">
          <img src="https://cdn.prod.website-files.com/67d4936e49a6f8c99c6f200f/67d4bd8cd5c87245e13ee7dc_logo-light.svg" alt="LeapYear" width="120" style="display:block;">
        </td></tr>
        <!-- Greeting -->
        <tr><td style="color:#faf7f1;font-size:18px;line-height:1.5;padding-bottom:8px;">
          Hey ${name},
        </td></tr>
        <!-- Result -->
        <tr><td style="padding:24px 0 32px;">
          <div style="font-size:14px;text-transform:uppercase;letter-spacing:2px;color:#999;margin-bottom:8px;">Your archetype</div>
          <div style="font-size:36px;font-weight:700;color:${color};line-height:1.2;">${typeName}</div>
          <div style="font-size:16px;color:#ccc;margin-top:8px;">Your core drive: <strong style="color:#faf7f1;">${coreDrive}</strong></div>
        </td></tr>
        <!-- Primary CTA -->
        <tr><td style="padding-bottom:16px;">
          <a href="${resultsUrl}" style="display:inline-block;padding:16px 40px;background:${color};color:#1a1a1a;font-size:16px;font-weight:700;text-decoration:none;border-radius:100px;">See Your Full Results</a>
        </td></tr>
        <!-- Secondary CTA -->
        <tr><td style="padding-bottom:40px;">
          <a href="${calendlyUrl}" style="display:inline-block;padding:14px 36px;background:transparent;color:#faf7f1;font-size:15px;font-weight:600;text-decoration:none;border-radius:100px;border:1px solid rgba(250,247,241,0.25);">Book a Call with a Coach</a>
        </td></tr>
        <!-- Description -->
        <tr><td style="color:#999;font-size:14px;line-height:1.6;padding-bottom:40px;">
          Your full results include your strengths, shadows, internal tensions, and growth mindset profile — built from 5 validated research instruments. Click above to explore everything.
        </td></tr>
        <!-- Footer -->
        <tr><td style="border-top:1px solid #333;padding-top:24px;color:#666;font-size:12px;line-height:1.5;">
          LeapYear — A 9-month gap year experience<br>
          <a href="https://startleapyear.com" style="color:#888;text-decoration:underline;">startleapyear.com</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Riley Simpson <rileysimpson@startleapyear.com>',
      to: [email],
      subject: `${name}, you're a ${typeName}. Here are your results.`,
      html,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Resend error:', res.status, text);
  }
}

// --- Handler ---

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      name, email, role,
      primary, secondary, primaryScore, secondaryScore,
      isBalanced, isRenaissance,
      allScores, growthMindsetTier, tensionTemplate, socialFlavor, shadows,
    } = req.body;

    if (!name || !email || !primary) {
      return res.status(400).json({ error: 'Missing required fields: name, email, primary' });
    }

    // 1. Generate token
    const token = nanoid(12);

    // 2. Find or create Person in CRM
    let personId;
    try {
      personId = await findPersonByEmail(email);
      if (!personId) {
        personId = await createPerson(name, email, role || 'student');
      }
    } catch (err) {
      console.error('People table error:', err.message);
      // Continue without person link — still create quiz result
      personId = null;
    }

    // 3. Create Quiz Result
    try {
      const quizData = {
        primary, secondary, primaryScore, secondaryScore,
        isBalanced, isRenaissance,
        allScores, growthMindsetTier, tensionTemplate, socialFlavor, shadows,
      };
      await createQuizResult(token, personId, quizData);
    } catch (err) {
      console.error('Quiz Results table error:', err.message);
      // Still return token — client has localStorage backup
    }

    // 4. Send email (non-blocking — don't let email failure block response)
    sendResultsEmail(name, email, primary, token).catch(err => {
      console.error('Email send error:', err.message);
    });

    // 5. Return token + primary
    return res.status(200).json({ token, primary });

  } catch (err) {
    console.error('Submit handler error:', err);
    // Generate a token anyway so the client can still navigate
    const fallbackToken = nanoid(12);
    return res.status(200).json({ token: fallbackToken, primary: req.body?.primary || 'explorer' });
  }
};
