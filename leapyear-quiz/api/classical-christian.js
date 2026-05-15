/**
 * LeapYear — Classical Christian Webinar Lead Capture
 * POST /api/classical-christian
 *
 * Accepts { email, name?, phone?, gradYear? } and writes to Airtable People
 * table with "Classical Christian Webinar" Lead Source attribution.
 * Deduplicates by email. Powers the in-page "Send me the replay" modal on
 * the webinar landing page for parents who can't attend any live session.
 */

const AIRTABLE_BASE = process.env.AIRTABLE_BASE_ID || 'app4NpJ7gQZvHpwGe';
const PEOPLE_TABLE = process.env.PEOPLE_TABLE_ID || 'tblyVLwjm2UylfKt5';
const CLASSICAL_CHRISTIAN_LEAD_SOURCE_ID =
  process.env.CLASSICAL_CHRISTIAN_LEAD_SOURCE_ID || 'rec6xfROJTbVTbNFk';

const PPL = {
  preferredEmail: 'fld4zOZVE7E6zcIcV',
  firstName:      'fldTXig6K6riXgAdA',
  lastName:       'fldPjhZqYTI22dFZ3',
  phone:          'fldkZBAXm556NUp4g',
  hsGradYear:     'fld5FhrqX4GoEfnKA',
  type:           'fldjMvmCFoenGP7fF',
  createLead:     'fldLSGxtFg3fG83cr',
  leadSource:     'flddN90lGUeJJGM15',
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
  return {
    id: rec.id,
    leadSources,
    firstName: rec.fields[PPL.firstName] || null,
    lastName: rec.fields[PPL.lastName] || null,
    phone: rec.fields[PPL.phone] || null,
    gradYear: rec.fields[PPL.hsGradYear]?.name || rec.fields[PPL.hsGradYear] || null,
  };
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, name, phone, gradYear } = req.body || {};

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const [firstName = '', ...rest] = (name || '').trim().split(/\s+/);
    const lastName = rest.join(' ');
    const gradYearClean = (gradYear || '').toString().trim();

    const existing = await findPersonByEmail(email);

    if (existing) {
      const updates = {};
      if (!existing.leadSources.includes(CLASSICAL_CHRISTIAN_LEAD_SOURCE_ID)) {
        updates[PPL.leadSource] = [...existing.leadSources, CLASSICAL_CHRISTIAN_LEAD_SOURCE_ID];
      }
      if (firstName && !existing.firstName) updates[PPL.firstName] = firstName;
      if (lastName && !existing.lastName) updates[PPL.lastName] = lastName;
      if (phone && !existing.phone) updates[PPL.phone] = phone;
      if (gradYearClean && !existing.gradYear) updates[PPL.hsGradYear] = gradYearClean;

      if (Object.keys(updates).length > 0) {
        await airtableFetch(PEOPLE_TABLE, 'PATCH', {
          typecast: true,
          records: [{ id: existing.id, fields: updates }],
        });
      }
    } else {
      const fields = {
        [PPL.preferredEmail]: email,
        [PPL.createLead]: true,
        [PPL.leadSource]: [CLASSICAL_CHRISTIAN_LEAD_SOURCE_ID],
        [PPL.type]: ['Parent/Guardian'],
      };
      if (firstName) fields[PPL.firstName] = firstName;
      if (lastName) fields[PPL.lastName] = lastName;
      if (phone) fields[PPL.phone] = phone;
      if (gradYearClean) fields[PPL.hsGradYear] = gradYearClean;

      await airtableFetch(PEOPLE_TABLE, 'POST', {
        typecast: true,
        records: [{ fields }],
      });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Classical Christian submit error:', err.message);
    console.error('Stack:', err.stack);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
};
