/**
 * LeapYear × Texas Homeschool Coalition scholarship lead capture.
 * POST /api/thsc-scholarship
 *
 * Runs in the existing campaign-form project so Airtable credentials remain
 * server-side and shared with LeapYear's other attributed lead forms.
 */

const DEFAULT_BASE_ID = 'app4NpJ7gQZvHpwGe';
const DEFAULT_PEOPLE_TABLE_ID = 'tblyVLwjm2UylfKt5';
const DEFAULT_FORMS_TABLE_ID = 'tblAyNLc86qgpWIFM';
const THSC_SOURCE_ID = 'recKz84I0BCbPDf6Y';
const DEFAULT_SITE_ORIGIN = 'https://leap-year-website.vercel.app';

const ALLOWED_ORIGINS = new Set([
  'https://leap-year-website.vercel.app',
  'https://www.startleapyear.com',
  'https://startleapyear.com',
]);

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

const normalizeText = (value, maxLength) =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

const escapeFormulaString = (value) =>
  value.replaceAll('\\', '\\\\').replaceAll('"', '\\"');

const escapeHtml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const parseBody = (request) => {
  if (request.body && typeof request.body === 'object') return request.body;
  if (typeof request.body !== 'string') return {};
  if (request.headers['content-type']?.includes('application/json')) {
    try {
      return JSON.parse(request.body);
    } catch {
      return {};
    }
  }
  return Object.fromEntries(new URLSearchParams(request.body));
};

const airtableRequest = async (path, options = {}) => {
  const apiKey = process.env.AIRTABLE_API_KEY;
  if (!apiKey) throw new Error('AIRTABLE_API_KEY is not configured');

  const response = await fetch(`https://api.airtable.com/v0/${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Airtable request failed with status ${response.status}`);
  }
  return result;
};

const getSiteOrigin = (request) => {
  const requestOrigin = normalizeText(request.headers.origin, 300);
  if (ALLOWED_ORIGINS.has(requestOrigin)) return requestOrigin;

  const configured = process.env.PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');

  return DEFAULT_SITE_ORIGIN;
};

const setCorsHeaders = (request, response) => {
  const requestOrigin = normalizeText(request.headers.origin, 300);
  if (ALLOWED_ORIGINS.has(requestOrigin)) {
    response.setHeader('Access-Control-Allow-Origin', requestOrigin);
    response.setHeader('Vary', 'Origin');
  }
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Cache-Control', 'no-store');
};

const sendScholarshipEmail = async ({ request, firstName, email, cohort }) => {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.SCHOLARSHIP_FROM_EMAIL?.trim();
  if (!apiKey || !from) return false;

  const cohortLabel =
    cohort === '2026' ? 'Fall 2026' : cohort === '2027' ? 'Fall 2027' : 'a future cohort';
  const applicationUrl = `${getSiteOrigin(request)}/apply/start?source=thsc`;
  const safeName = escapeHtml(firstName);
  const safeCohort = escapeHtml(cohortLabel);

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [email],
      reply_to: process.env.SCHOLARSHIP_REPLY_TO?.trim() || undefined,
      subject: 'LeapYear scholarship details for THSC families',
      html: `
        <div style="background:#f5f1eb;color:#071411;font-family:Arial,sans-serif;padding:32px 20px;">
          <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:20px;padding:36px;">
            <p style="margin:0 0 24px;color:#dd5e32;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;">LeapYear × Texas Homeschool Coalition</p>
            <h1 style="margin:0 0 20px;font-size:34px;line-height:1.1;">Thanks for reaching out, ${safeName}.</h1>
            <p style="font-size:17px;line-height:1.65;">LeapYear is a nine-month Christian leadership program in Austin. Students get real work experience, grow in their faith, and build the confidence to choose what comes next.</p>
            <p style="font-size:17px;line-height:1.65;">LeapYear is still awarding merit- and need-based aid for Fall 2026, including possible full-tuition awards. Full tuition covers the LeapYear program. Housing and ordinary living expenses are separate.</p>
            <div style="margin:28px 0;padding:22px;border-left:4px solid #dd5e32;background:#f1efec;">
              <strong>${safeCohort}</strong>
              <p style="margin:8px 0 0;line-height:1.55;">The Fall 2026 cohort begins August 23. The scholarship priority deadline is Friday, July 31. Admissions decisions are rolling, so applying earlier is better.</p>
            </div>
            <p style="font-size:17px;line-height:1.65;">Most students finish the application in less than an hour. You can begin now and save your work as you go.</p>
            <p style="margin:30px 0;">
              <a href="${applicationUrl}" style="display:inline-block;background:#dd5e32;color:#ffffff;text-decoration:none;font-weight:700;padding:15px 24px;border-radius:999px;">Start the application →</a>
            </p>
            <p style="color:#595755;font-size:14px;line-height:1.55;">If you selected Fall 2026, someone from LeapYear will follow up to answer questions and explain the scholarship process.</p>
          </div>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    throw new Error(`Scholarship email failed with status ${response.status}`);
  }
  return true;
};

module.exports = async function handler(request, response) {
  setCorsHeaders(request, response);

  if (request.method === 'OPTIONS') return response.status(204).end();
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST, OPTIONS');
    return response.status(405).json({ message: 'Method not allowed.' });
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

  if (website) return response.status(200).json({ ok: true, emailSent: false });
  if (Number.isFinite(startedAt) && Date.now() - startedAt < 900) {
    return response.status(429).json({ message: 'Please wait a moment and try again.' });
  }

  if (
    !firstName ||
    !lastName ||
    !/^\S+@\S+\.\S+$/.test(email) ||
    phone.length < 7 ||
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
    const formula = `LOWER({Preferred Email})=LOWER("${escapeFormulaString(email)}")`;
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

      const currentSources = Array.isArray(current[PEOPLE_FIELD.leadSource])
        ? current[PEOPLE_FIELD.leadSource]
        : [];
      if (!currentSources.includes(THSC_SOURCE_ID)) {
        fields[PEOPLE_FIELD.leadSource] = [...currentSources, THSC_SOURCE_ID];
      }

      const currentTypes = Array.isArray(current[PEOPLE_FIELD.type])
        ? current[PEOPLE_FIELD.type]
        : [];
      if (!currentTypes.includes(personType)) {
        fields[PEOPLE_FIELD.type] = [...currentTypes, personType];
      }
      if (!current[PEOPLE_FIELD.createLead]) fields[PEOPLE_FIELD.createLead] = true;

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
                [PEOPLE_FIELD.leadSource]: [THSC_SOURCE_ID],
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
      [FORM_FIELD.notes]: `Texas Homeschool Coalition scholarship inquiry. Interested cohort: ${
        cohort === 'other' ? 'Other' : `Fall ${cohort}`
      }.${cohort === '2026' ? ' Priority: immediate personal follow-up requested.' : ''}`,
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

    let emailSent = false;
    try {
      emailSent = await sendScholarshipEmail({ request, firstName, email, cohort });
    } catch (error) {
      console.error('THSC scholarship follow-up email failed', error);
    }

    return response.status(200).json({ ok: true, emailSent });
  } catch (error) {
    console.error('THSC scholarship submission failed', error);
    return response
      .status(500)
      .json({ message: 'We could not save your information. Please try again in a moment.' });
  }
};
