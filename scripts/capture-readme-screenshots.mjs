import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const BASE = process.env.SCREENSHOT_BASE_URL ?? 'http://localhost:5173';
const OUT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'docs',
  'screenshots',
);

const applicantUser = {
  id: 'usr-applicant-1',
  firstName: 'Alex',
  lastName: 'Morgan',
  email: 'alex.morgan@company.com',
  role: 'APPLICANT',
};

const reviewerUser = {
  id: 'usr-reviewer-1',
  firstName: 'Jordan',
  lastName: 'Lee',
  email: 'jordan.lee@company.com',
  role: 'REVIEWER',
};

const mockApplications = [
  {
    id: 'app-001',
    title: 'Q2 Marketing Campaign Budget',
    description: 'Funding request for digital advertising and content production.',
    status: 'SUBMITTED',
    applicantId: applicantUser.id,
    applicant: { firstName: 'Alex', lastName: 'Morgan' },
    type: 'Budget',
    priority: 'HIGH',
    amount: 12500,
    justification: 'Supports the product launch planned for July.',
    submittedAt: '2026-06-18T09:30:00.000Z',
    createdAt: '2026-06-10T14:00:00.000Z',
    updatedAt: '2026-06-18T09:30:00.000Z',
  },
  {
    id: 'app-002',
    title: 'Design System Audit',
    description: 'External review of component library and accessibility standards.',
    status: 'UNDER_REVIEW',
    applicantId: applicantUser.id,
    applicant: { firstName: 'Alex', lastName: 'Morgan' },
    type: 'Consulting',
    priority: 'MEDIUM',
    amount: 4800,
    justification: 'Aligns UI patterns before the next release cycle.',
    submittedAt: '2026-06-12T11:15:00.000Z',
    createdAt: '2026-06-08T10:00:00.000Z',
    updatedAt: '2026-06-20T16:45:00.000Z',
  },
  {
    id: 'app-003',
    title: 'Team Offsite Planning',
    description: 'Venue deposit and travel allocation for the annual team offsite.',
    status: 'APPROVED',
    applicantId: applicantUser.id,
    applicant: { firstName: 'Alex', lastName: 'Morgan' },
    type: 'Travel',
    priority: 'LOW',
    amount: 9200,
    justification: 'Approved during last quarter planning review.',
    submittedAt: '2026-05-28T08:00:00.000Z',
    createdAt: '2026-05-20T13:20:00.000Z',
    updatedAt: '2026-06-02T10:10:00.000Z',
  },
  {
    id: 'app-004',
    title: 'Vendor Security Assessment',
    description: 'Third-party penetration test for the payments integration.',
    status: 'CHANGES_REQUESTED',
    applicantId: applicantUser.id,
    applicant: { firstName: 'Alex', lastName: 'Morgan' },
    type: 'Security',
    priority: 'HIGH',
    amount: 6500,
    justification: 'Required before production rollout.',
    submittedAt: '2026-06-05T15:40:00.000Z',
    createdAt: '2026-06-01T09:00:00.000Z',
    updatedAt: '2026-06-22T12:00:00.000Z',
  },
];

const mockEvents = [
  {
    type: 'STATUS_CHANGE',
    id: 'evt-1',
    createdAt: '2026-06-10T14:00:00.000Z',
    fromStatus: null,
    toStatus: 'DRAFT',
    changedByName: 'Alex Morgan',
  },
  {
    type: 'STATUS_CHANGE',
    id: 'evt-2',
    createdAt: '2026-06-18T09:30:00.000Z',
    fromStatus: 'DRAFT',
    toStatus: 'SUBMITTED',
    changedByName: 'Alex Morgan',
  },
  {
    type: 'COMMENT',
    id: 'evt-3',
    createdAt: '2026-06-19T11:00:00.000Z',
    comment: 'Please attach the vendor quote before review begins.',
    reviewerName: 'Jordan Lee',
  },
];

function fulfill(route, data) {
  return route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ success: true, data }),
  });
}

async function waitForApp(page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1200);
}

async function signIn(page, role) {
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 120_000 });
  await waitForApp(page);
  await page.getByRole('button', { name: role === 'applicant' ? 'Applicant' : 'Reviewer' }).click();
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(
    role === 'applicant' ? '**/dashboard' : '**/queue',
    { timeout: 60_000 },
  );
  await waitForApp(page);
}

async function signOut(page) {
  await page.goto(`${BASE}/profile`, { waitUntil: 'domcontentloaded', timeout: 120_000 });
  await waitForApp(page);
  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.waitForURL('**/login', { timeout: 30_000 });
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

await page.route('**/api/**', async (route) => {
  const request = route.request();
  const url = new URL(request.url());
  const apiPath = url.pathname;
  const method = request.method();

  if (apiPath === '/api/auth/login' && method === 'POST') {
    const body = JSON.parse(request.postData() || '{}');
    const user = body.email?.includes('jordan') ? reviewerUser : applicantUser;
    return fulfill(route, { token: 'mock-screenshot-token', user });
  }

  if (apiPath === '/api/auth/me' && method === 'GET') {
    const stored = await page.evaluate(() => localStorage.getItem('reviewtrack_user'));
    const user = stored ? JSON.parse(stored) : applicantUser;
    return fulfill(route, user);
  }

  if (apiPath === '/api/auth/logout' && method === 'POST') {
    return fulfill(route, { message: 'Logged out' });
  }

  if (apiPath === '/api/applications/my' && method === 'GET') {
    return fulfill(route, mockApplications);
  }

  if (apiPath === '/api/reviewer/applications' && method === 'GET') {
    return fulfill(route, mockApplications.filter((app) => app.status !== 'DRAFT'));
  }

  const detailMatch = apiPath.match(/^\/api\/(?:reviewer\/)?applications\/([^/]+)$/);
  if (detailMatch && method === 'GET') {
    const app = mockApplications.find((item) => item.id === detailMatch[1]) ?? mockApplications[0];
    return fulfill(route, app);
  }

  const eventsMatch = apiPath.match(/^\/api\/applications\/([^/]+)\/events$/);
  if (eventsMatch && method === 'GET') {
    return fulfill(route, mockEvents);
  }

  return fulfill(route, {});
});

await mkdir(OUT, { recursive: true });

await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 120_000 });
await waitForApp(page);
await page.screenshot({ path: path.join(OUT, 'login.png') });

await signIn(page, 'applicant');
await page.screenshot({ path: path.join(OUT, 'dashboard.png') });

await page.goto(`${BASE}/applications/new`, { waitUntil: 'domcontentloaded', timeout: 120_000 });
await waitForApp(page);
await page.screenshot({ path: path.join(OUT, 'applicant-view.png') });

await page.goto(`${BASE}/applications/app-001`, { waitUntil: 'domcontentloaded', timeout: 120_000 });
await waitForApp(page);
await page.screenshot({ path: path.join(OUT, 'application-detail.png') });

await signOut(page);

await signIn(page, 'reviewer');
await page.screenshot({ path: path.join(OUT, 'reviewer-queue.png') });

await browser.close();
console.log(`Screenshots saved to ${OUT}`);
