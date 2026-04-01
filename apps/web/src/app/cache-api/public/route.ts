import { NextResponse } from 'next/server';

type PublicResource =
  | 'quizzes'
  | 'categories'
  | 'types'
  | 'subjects'
  | 'materials'
  | 'leaderboard'
  | 'summary';

const API_ORIGIN =
  process.env.INTERNAL_API_BASE_URL ||
  process.env.API_ORIGIN ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:8080';

const RESOURCE_REVALIDATE_SECONDS: Record<PublicResource, number> = {
  quizzes: 60,
  categories: 60,
  types: 60,
  subjects: 60,
  materials: 60,
  leaderboard: 15,
  summary: 30,
};

function normalizeLang(value: string | null) {
  return String(value || 'vi').trim().toLowerCase() === 'es' ? 'es' : 'vi';
}

function normalizePeriod(value: string | null) {
  const normalized = String(value || 'all').trim().toLowerCase();
  if (normalized === 'week' || normalized === 'month') return normalized;
  return 'all';
}

function normalizeLimit(value: string | null) {
  const parsed = Number(value || 10);
  if (!Number.isFinite(parsed)) return 10;
  return Math.min(100, Math.max(1, Math.floor(parsed)));
}

function normalizePage(value: string | null) {
  const parsed = Number(value || 1);
  if (!Number.isFinite(parsed) || parsed <= 0) return 1;
  return Math.floor(parsed);
}

function normalizeSubjectId(value: string | null) {
  const parsed = Number(value || 0);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.floor(parsed);
}

function isPublicResource(value: string): value is PublicResource {
  return (
    value === 'quizzes' ||
    value === 'categories' ||
    value === 'types' ||
    value === 'subjects' ||
    value === 'materials' ||
    value === 'leaderboard' ||
    value === 'summary'
  );
}

function buildUpstreamPath(resource: PublicResource, query: URLSearchParams) {
  const lang = normalizeLang(query.get('lang'));

  if (resource === 'quizzes') {
    const limit = Number(query.get('limit'));
    const page = Number(query.get('page'));
    const params = new URLSearchParams({ lang });
    if (Number.isFinite(limit) && limit > 0) {
      params.set('limit', String(Math.min(Math.floor(limit), 100)));
      params.set('page', String(Number.isFinite(page) && page > 0 ? Math.floor(page) : 1));
    }
    return `/api/quizzes?${params.toString()}`;
  }

  if (resource === 'categories') {
    return `/api/categories?lang=${lang}`;
  }

  if (resource === 'types') {
    return `/api/types?lang=${lang}`;
  }

  if (resource === 'subjects') {
    return `/materials/subjects?lang=${lang}`;
  }

  if (resource === 'materials') {
    const subjectId = normalizeSubjectId(query.get('subjectId'));
    if (!subjectId) {
      return null;
    }
    return `/materials/subjects/${subjectId}/materials?lang=${lang}`;
  }

  if (resource === 'leaderboard') {
    const limit = normalizeLimit(query.get('limit'));
    const period = normalizePeriod(query.get('period'));
    return `/stats/leaderboard?limit=${limit}&period=${period}`;
  }

  return '/stats/summary';
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const resourceParam = String(requestUrl.searchParams.get('resource') || '').trim().toLowerCase();

  if (!isPublicResource(resourceParam)) {
    return NextResponse.json({ message: 'Invalid cache resource' }, { status: 400 });
  }

  const upstreamPath = buildUpstreamPath(resourceParam, requestUrl.searchParams);
  if (!upstreamPath) {
    return NextResponse.json({ message: 'subjectId is required for materials resource' }, { status: 400 });
  }

  const authHeader = request.headers.get('authorization');
  const isAuthScopedRequest = resourceParam === 'quizzes' && Boolean(authHeader);
  const revalidateSeconds = RESOURCE_REVALIDATE_SECONDS[resourceParam];

  const upstreamHeaders: Record<string, string> = {};
  if (authHeader) {
    upstreamHeaders.Authorization = authHeader;
  }
  if (request.headers.get('ngrok-skip-browser-warning')) {
    upstreamHeaders['ngrok-skip-browser-warning'] = 'true';
  }

  const upstreamResponse = await fetch(`${API_ORIGIN}${upstreamPath}`, {
    headers: upstreamHeaders,
    ...(isAuthScopedRequest ? { cache: 'no-store' } : { next: { revalidate: revalidateSeconds } }),
  });

  const responseText = await upstreamResponse.text();

  if (!upstreamResponse.ok) {
    try {
      const parsed = JSON.parse(responseText);
      return NextResponse.json(parsed, { status: upstreamResponse.status });
    } catch {
      return NextResponse.json(
        { message: responseText || `Upstream request failed (${upstreamResponse.status})` },
        { status: upstreamResponse.status }
      );
    }
  }

  try {
    const parsed = JSON.parse(responseText);
    const response = NextResponse.json(parsed, { status: 200 });

    if (isAuthScopedRequest) {
      response.headers.set('Cache-Control', 'private, no-store');
      response.headers.set('Vary', 'Authorization');
    } else {
      const browserMaxAge = Math.max(5, Math.min(revalidateSeconds, 60));
      response.headers.set(
        'Cache-Control',
        `public, max-age=${browserMaxAge}, s-maxage=${revalidateSeconds}, stale-while-revalidate=${Math.max(
          revalidateSeconds * 4,
          60
        )}`
      );
    }

    return response;
  } catch {
    return NextResponse.json({ message: 'Invalid upstream JSON payload' }, { status: 502 });
  }
}
