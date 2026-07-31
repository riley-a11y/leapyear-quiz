/**
 * LeapYear public scholarship campaign lead capture.
 * POST /api/scholarship-interest
 *
 * Keeps Airtable credentials and campaign attribution server-side. This route
 * intentionally does not send email; the website promises personal follow-up.
 */

const DEFAULT_BASE_ID = 'app4NpJ7gQZvHpwGe';
const DEFAULT_PEOPLE_TABLE_ID = 'tblyVLwjm2UylfKt5';
const DEFAULT_FORMS_TABLE_ID = 'tblAyNLc86qgpWIFM';
const SCHOLARSHIP_SOURCE_ID = 'recFvgxmvLH3PUmxV';
const MAX_BODY_BYTES = 16 * 1024;
const MIN_FORM_TIME_MS = 900;

const ALLOWED_ORIGINS = new Set([
  'https://leap-year-website.vercel.app',
  'https://www.startleapyear.com',
  'https://startleapyear.com',
]);

// Preview deployments owned by the LeapYear website Vercel project.
const SITE_PREVIEW_ORIGIN =
  /^https:\/\/leap-year-website(?:-[a-z0-9-]+)?-riley-startleapyeas-projects\.vercel\.app$/i;

const PEOPLE_FIELD = {
  email: 'fld4zOZVE7E6zcIcV',
  firstName: 'fldTXig6K6riXgAdA',
  lastName: 'fldPjhZqYTI22dFZ3',
  phone: 'fldkZBAXm556NUp4g',
  type: 'fldjMvmCFoenGP7fF',
  leadSource: 'flddN90lGUeJJGM15',
  createLead: 'fldLSGxtFg3fG83cr',
};

const FORM_FIELD = {
  submitter: 'fldCEbWrWki4hAPVB',
  type: 'fldqeE677A1Bfr0Pv',
  cohort: 'flddmlmCi1CRrarVA',
  sponsorFirstName: 'flddY9nZCSRF3jJel',
  sponsorLastName: 'fldnnOY7uT5AkEmtK',
  sponsorPhone: 'fldMpQRztqF7KYBPZ',
  sponsorEmail: 'fld8edzN72O5Tmick',
  studentFirstName: 'fldc9bvcx2yf88oKI',
  studentLastName: 'fldvspHfgviRsnr9b',
  studentEmail: 'fldw5SbQgpEkUopmp',
  studentPhone: 'fldfBwIFhG4MoRDz2',
  sponsorRelationship: 'fld0y7Bo3hmZSKtTT',
  notes: 'fld89FHw9xIngFK39',
};

const VALID_ROLES = new Set(['student', 'parent', 'family']);
const VALID_COHORTS = new Set(['2026', '2027', 'other']);
const UTM_FIELDS = [
  ['utm_source', 'utm_source'],
  ['utm_medium', 'utm_medium'],
  ['utm_campaign', 'utm_campaign'],
  ['utm_content', 'utm_content'],
];

const normalizeText = (value, maxLength) =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

const sanitizeAttribution = (value) =>
  normalizeText(value, 160).replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ');

const escapeFormulaString = (value) =>
  value.replaceAll('\\', '\\\\').replaceAll('"', '\\"');

const getHeader = (request, name) => {
  const headers = request.headers || {};
  return headers[name] ?? headers[name.toLowerCase()] ?? headers.get?.(name) ?? '';
};

const isAllowedOrigin = (origin) =>
  !origin || ALLOWED_ORIGINS.has(origin) || SITE_PREVIEW_ORIGIN.test(origin);

const setResponseHeaders = (request, response) => {
  const origin = normalizeText(getHeader(request, 'origin'), 300);
  if (origin && isAllowedOrigin(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Vary', 'Origin');
  }
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Cache-Control', 'no-store');
};

const isBodyTooLarge = (request) => {
  const contentLength = Number(getHeader(request, 'content-length'));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) return true;

  try {
    if (typeof request.body === 'string') {
      return Buffer.byteLength(request.body, 'utf8') > MAX_BODY_BYTES;
    }
    if (Buffer.isBuffer(request.body)) return request.body.length > MAX_BODY_BYTES;
    if (request.body && typeof request.body === 'object') {
      return Buffer.byteLength(JSON.stringify(request.body), 'utf8') > MAX_BODY_BYTES;
    }
  } catch {
    return true;
  }
  return false;
};

const parseBody = (request) => {
  if (request.body && typeof request.body === 'object' && !Buffer.isBuffer(request.body)) {
    return Array.isArray(request.body) ? {} : request.body;
  }

  const rawBody = Buffer.isBuffer(request.body)
    ? request.body.toString('utf8')
    : typeof request.body === 'string'
      ? request.body
      : '';
  if (!rawBody) return {};

  const contentType = String(getHeader(request, 'content-type')).toLowerCase();
  if (contentType.includes('application/json')) {
    try {
      const parsed = JSON.parse(rawBody);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }
  return Object.fromEntries(new URLSearchParams(rawBody));
};

const linkedRecordIds = (value) =>
  Array.isArray(value)
    ? value.map((item) => (typeof item === 'string' ? item : item?.id)).filter(Boolean)
    : [];

const selectNames = (value) =>
  Array.isArray(value)
    ? value.map((item) => (typeof item === 'string' ? item : item?.name)).filter(Boolean)
    : [];

const airtableRequest = async (path, options = {}) => {
  const apiKey = process.env.AIRTABLE_API_KEY?.trim();
  if (!apiKey) throw new Error('AIRTABLE_API_KEY is not configured');

  const airtableResponse = await fetch(`https://api.airtable.com/v0/${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const result = await airtableResponse.json().catch(() => ({}));
  if (!airtableResponse.ok) {
    throw new Error(`Airtable request failed with status ${airtableResponse.status}`);
  }
  return result;
};

const buildNotes = ({ cohort, attribution }) => {
  const cohortLabel = cohort === 'other' ? 'Other/future cohort' : `Fall ${cohort}`;
  const sentences = [
    `Fall 2026 Scholarship Campaign inquiry. Interested cohort: ${cohortLabel}.`,
  ];
  if (cohort === '2026') sentences.push('Priority: prompt personal follow-up requested.');

  const utmNotes = UTM_FIELDS.flatMap(([key, label]) =>
    attribution[key] ? [`${label}: ${attribution[key]}`] : [],
  );
  if (utmNotes.length) sentences.push(`Attribution — ${utmNotes.join('; ')}.`);

  return sentences.join(' ');
};

module.exports = async function handler(request, response) {
  setResponseHeaders(request, response);

  const origin = normalizeText(getHeader(request, 'origin'), 300);
  if (origin && !isAllowedOrigin(origin)) {
    return response.status(403).json({ message: 'Request origin is not allowed.' });
  }
  if (request.method === 'OPTIONS') return response.status(204).end();
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST, OPTIONS');
    return response.status(405).json({ message: 'Method not allowed.' });
  }
  if (isBodyTooLarge(request)) {
    return response.status(413).json({ message: 'Request is too large.' });
  }

  const body = parseBody(request);
  const firstName = normalizeText(body.firstName, 80);
  const lastName = normalizeText(body.lastName, 80);
  const email = normalizeText(body.email, 254).toLowerCase();
  const phone = normalizeText(body.phone, 30);
  const role = normalizeText(body.role, 20).toLowerCase();
  const cohort = normalizeText(body.cohort, 20).toLowerCase();
  const website = normalizeText(body.website, 200);
  const startedAt = Number(body.startedAt);
  const attribution = Object.fromEntries(
    UTM_FIELDS.map(([key]) => [key, sanitizeAttribution(body[key])]),
  );

  if (website) return response.status(200).json({ ok: true });
  if (!Number.isFinite(startedAt) || startedAt <= 0) {
    return response.status(400).json({ message: 'Please refresh the page and try again.' });
  }
  if (Date.now() - startedAt < MIN_FORM_TIME_MS) {
    return response.status(429).json({ message: 'Please wait a moment and try again.' });
  }

  const phoneDigits = phone.replace(/\D/g, '');
  if (
    !firstName ||
    !lastName ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    phoneDigits.length < 7 ||
    phoneDigits.length > 15 ||
    !VALID_ROLES.has(role) ||
    !VALID_COHORTS.has(cohort)
  ) {
    return response
      .status(400)
      .json({ message: 'Please complete every field with valid contact information.' });
  }

  const baseId = process.env.AIRTABLE_BASE_ID || DEFAULT_BASE_ID;
  const peopleTableId = process.env.PEOPLE_TABLE_ID || DEFAULT_PEOPLE_TABLE_ID;
  const formsTableId = process.env.FORMS_TABLE_ID || DEFAULT_FORMS_TABLE_ID;
  const peoplePath = `${baseId}/${peopleTableId}`;
  const formsPath = `${baseId}/${formsTableId}`;
  const personType =
    role === 'student' ? 'Student Prospect' : role === 'parent' ? 'Parent Prospect' : 'Sponsor';

  try {
    // Airtable formulas reference the live field name; writes below use its stable field ID.
    const formula = `LOWER({Email})=LOWER("${escapeFormulaString(email)}")`;
    const query = new URLSearchParams({
      filterByFormula: formula,
      maxRecords: '1',
      returnFieldsByFieldId: 'true',
    });
    const existingResult = await airtableRequest(`${peoplePath}?${query}`);
    const existing = existingResult.records?.[0];
    let personId;

    if (existing) {
      personId = existing.id;
      const current = existing.fields || {};
      const fields = {};
      if (!current[PEOPLE_FIELD.firstName]) fields[PEOPLE_FIELD.firstName] = firstName;
      if (!current[PEOPLE_FIELD.lastName]) fields[PEOPLE_FIELD.lastName] = lastName;
      if (!current[PEOPLE_FIELD.phone]) fields[PEOPLE_FIELD.phone] = phone;

      const currentSources = linkedRecordIds(current[PEOPLE_FIELD.leadSource]);
      if (!currentSources.includes(SCHOLARSHIP_SOURCE_ID)) {
        fields[PEOPLE_FIELD.leadSource] = [...currentSources, SCHOLARSHIP_SOURCE_ID];
      }

      const currentTypes = selectNames(current[PEOPLE_FIELD.type]);
      if (!currentTypes.includes(personType)) {
        fields[PEOPLE_FIELD.type] = [...currentTypes, personType];
      }

      if (Object.keys(fields).length) {
        await airtableRequest(peoplePath, {
          method: 'PATCH',
          body: JSON.stringify({ records: [{ id: existing.id, fields }], typecast: true }),
        });
      }
    } else {
      const created = await airtableRequest(peoplePath, {
        method: 'POST',
        body: JSON.stringify({
          records: [
            {
              fields: {
                [PEOPLE_FIELD.email]: email,
                [PEOPLE_FIELD.firstName]: firstName,
                [PEOPLE_FIELD.lastName]: lastName,
                [PEOPLE_FIELD.phone]: phone,
                [PEOPLE_FIELD.type]: [personType],
                [PEOPLE_FIELD.leadSource]: [SCHOLARSHIP_SOURCE_ID],
                [PEOPLE_FIELD.createLead]: true,
              },
            },
          ],
          typecast: true,
        }),
      });
      personId = created.records?.[0]?.id;
    }

    if (!personId) throw new Error('Airtable person record was not returned');

    const formFields = {
      [FORM_FIELD.submitter]: [personId],
      [FORM_FIELD.type]:
        role === 'student' ? 'Website Lead Form (Student)' : 'Website Lead Form (Sponsor)',
      [FORM_FIELD.notes]: buildNotes({ cohort, attribution }),
    };

    if (cohort !== 'other') formFields[FORM_FIELD.cohort] = cohort;
    if (role === 'student') {
      formFields[FORM_FIELD.studentFirstName] = firstName;
      formFields[FORM_FIELD.studentLastName] = lastName;
      formFields[FORM_FIELD.studentEmail] = email;
      formFields[FORM_FIELD.studentPhone] = phone;
    } else {
      formFields[FORM_FIELD.sponsorFirstName] = firstName;
      formFields[FORM_FIELD.sponsorLastName] = lastName;
      formFields[FORM_FIELD.sponsorEmail] = email;
      formFields[FORM_FIELD.sponsorPhone] = phone;
      formFields[FORM_FIELD.sponsorRelationship] = role === 'parent' ? 'Parent' : 'Other';
    }

    await airtableRequest(formsPath, {
      method: 'POST',
      body: JSON.stringify({ records: [{ fields: formFields }], typecast: true }),
    });

    return response.status(200).json({ ok: true });
  } catch (error) {
    console.error('Scholarship interest submission failed', error);
    return response
      .status(500)
      .json({ message: 'We could not save your information. Please try again in a moment.' });
  }
};
