/**
 * LeapYear — Brentwood Christian School Lead Capture
 * POST /api/brentwood
 *
 * Captures email from the Brentwood Christian School intermediary page,
 * writes to Airtable People table with Brentwood lead source attribution.
 */

const AIRTABLE_BASE = process.env.AIRTABLE_BASE_ID || 'app4NpJ7gQZvHpwGe';
const PEOPLE_TABLE = process.env.PEOPLE_TABLE_ID || 'tblyVLwjm2UylfKt5';
const BRENTWOOD_LEAD_SOURCE_ID = process.env.BRENTWOOD_LEAD_SOURCE_ID || 'recGo8Gv1qB0XDPHv';

const PPL = {
  preferredEmail: 'fld4zOZVE7E6zcIcV',
  type:           'fldjMvmCFoenGP7fF',
  createLead:     'fldLSGxtFg3fG83cr',
  leadSource:     'flddN90lGUeJJGM15',
  hsGradYear:     'fld5FhrqX4GoEfnKA',
};

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
  const formula = encodeURIComponent(`LOWER({Preferred Email}) = LOWER("${email}")`);
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE}/${PEOPLE_TABLE}?filterByFormula=${formula}&maxRecords=1&returnFieldsByFieldId=true`;
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.records || data.records.length === 0) return null;
  const rec = data.records[0];
  const leadSources = (rec.fields[PPL.leadSource] || []).map(ls => ls.id || ls);
  const gradYear = rec.fields[PPL.hsGradYear]?.name || null;
  return { id: rec.id, leadSources, gradYear };
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, gradYear } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const existing = await findPersonByEmail(email);

    if (existing) {
      // Append Brentwood lead source if not already present
      const updates = {};
      if (!existing.leadSources.includes(BRENTWOOD_LEAD_SOURCE_ID)) {
        updates[PPL.leadSource] = [...existing.leadSources, BRENTWOOD_LEAD_SOURCE_ID];
      }
      if (gradYear && !existing.gradYear) {
        updates[PPL.hsGradYear] = gradYear;
      }
      if (Object.keys(updates).length > 0) {
        await airtableFetch(PEOPLE_TABLE, 'PATCH', {
          typecast: true,
          records: [{ id: existing.id, fields: updates }],
        });
      }
    } else {
      // Create new person
      const fields = {
        [PPL.preferredEmail]: email,
        [PPL.createLead]: true,
        [PPL.leadSource]: [BRENTWOOD_LEAD_SOURCE_ID],
        [PPL.type]: ['Student'],
      };
      if (gradYear) {
        fields[PPL.hsGradYear] = gradYear;
      }
      await airtableFetch(PEOPLE_TABLE, 'POST', {
        typecast: true,
        records: [{ fields }],
      });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Brentwood submit error:', err.message);
    console.error('Stack:', err.stack);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
};
