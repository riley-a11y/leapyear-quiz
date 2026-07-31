const test = require('node:test');
const assert = require('node:assert/strict');
const handler = require('../api/scholarship-interest');

const baseBody = (overrides = {}) => ({
  firstName: 'Jordan',
  lastName: 'Taylor',
  email: 'jordan@example.com',
  phone: '5125550199',
  role: 'student',
  cohort: '2026',
  startedAt: String(Date.now() - 2_000),
  website: '',
  ...overrides,
});

const jsonResponse = (payload, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => payload,
});

const runRequest = async (body) => {
  const calls = [];
  const originalFetch = global.fetch;
  const originalApiKey = process.env.AIRTABLE_API_KEY;
  process.env.AIRTABLE_API_KEY = 'test-token';

  global.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    if (!options.method) return jsonResponse({ records: [] });
    if (String(url).includes('/tblyVLwjm2UylfKt5')) {
      return jsonResponse({ records: [{ id: 'recPerson12345678' }] });
    }
    if (String(url).includes('/tblAyNLc86qgpWIFM')) {
      return jsonResponse({ records: [{ id: 'recForm123456789' }] });
    }
    throw new Error(`Unexpected Airtable request: ${url}`);
  };

  const response = {
    headers: {},
    statusCode: 200,
    payload: undefined,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return payload;
    },
    end() {
      return undefined;
    },
  };

  try {
    await handler(
      {
        method: 'POST',
        headers: {
          origin: 'https://leap-year-website.vercel.app',
          'content-type': 'application/json',
        },
        body,
      },
      response,
    );
    return { calls, response };
  } finally {
    global.fetch = originalFetch;
    if (originalApiKey === undefined) delete process.env.AIRTABLE_API_KEY;
    else process.env.AIRTABLE_API_KEY = originalApiKey;
  }
};

const createdFormFields = (calls) => {
  const request = calls.find(
    ({ url, options }) =>
      url.includes('/tblAyNLc86qgpWIFM') && options.method === 'POST',
  );
  assert.ok(request, 'expected a Forms record request');
  return JSON.parse(request.options.body).records[0].fields;
};

test('requires a write-in when Other is selected', async () => {
  const { calls, response } = await runRequest(baseBody({ role: 'other' }));

  assert.equal(response.statusCode, 400);
  assert.match(response.payload.message, /connected to the student/i);
  assert.equal(calls.length, 0);
});

test('maps Other and the optional note into the sponsor form record', async () => {
  const { calls, response } = await runRequest(
    baseBody({
      role: 'other',
      roleOther: 'Grandparent\n',
      additionalInfo: 'Please call after 4.\r\nWe are traveling this week.',
      utm_source: 'newsletter',
      utm_medium: 'email',
    }),
  );
  const fields = createdFormFields(calls);

  assert.equal(response.statusCode, 200);
  assert.equal(fields.fldqeE677A1Bfr0Pv, 'Website Lead Form (Sponsor)');
  assert.equal(fields.fld0y7Bo3hmZSKtTT, 'Other');
  assert.equal(fields.fldLoEKj9dv2L5niP, 'Grandparent');
  assert.match(fields.fld89FHw9xIngFK39, /Visitor note:\nPlease call after 4\.\nWe are traveling this week\./);
  assert.match(fields.fld89FHw9xIngFK39, /Campaign: Fall 2026 Scholarship Campaign inquiry\./);
  assert.match(fields.fld89FHw9xIngFK39, /utm_source=newsletter; utm_medium=email\./);
});

test('ignores a role write-in for a parent submission', async () => {
  const { calls, response } = await runRequest(
    baseBody({ role: 'parent', roleOther: 'Should not be stored', additionalInfo: '' }),
  );
  const fields = createdFormFields(calls);

  assert.equal(response.statusCode, 200);
  assert.equal(fields.fld0y7Bo3hmZSKtTT, 'Parent');
  assert.equal(fields.fldLoEKj9dv2L5niP, undefined);
  assert.doesNotMatch(fields.fld89FHw9xIngFK39, /Visitor note:/);
  assert.match(fields.fld89FHw9xIngFK39, /Interested cohort: Fall 2026\./);
});

test('rejects an oversized optional note before contacting Airtable', async () => {
  const { calls, response } = await runRequest(
    baseBody({ additionalInfo: 'x'.repeat(1_001) }),
  );

  assert.equal(response.statusCode, 400);
  assert.match(response.payload.message, /under 1,000 characters/i);
  assert.equal(calls.length, 0);
});

test('continues accepting the legacy family role when a write-in is present', async () => {
  const { calls, response } = await runRequest(
    baseBody({ role: 'family', roleOther: 'Older sibling' }),
  );
  const fields = createdFormFields(calls);

  assert.equal(response.statusCode, 200);
  assert.equal(fields.fld0y7Bo3hmZSKtTT, 'Other');
  assert.equal(fields.fldLoEKj9dv2L5niP, 'Older sibling');
});
