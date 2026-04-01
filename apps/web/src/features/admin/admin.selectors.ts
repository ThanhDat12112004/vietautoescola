type AnyRecord = Record<string, any>;

function toSearchText(values: unknown[]) {
  return values
    .map((value) => String(value || ''))
    .join(' ')
    .toLowerCase();
}

export function filterByGroupId<T extends AnyRecord>(
  items: T[],
  groupId: string,
  key: keyof T
) {
  if (groupId === 'all') return items;
  const gid = Number(groupId);
  if (!Number.isFinite(gid) || gid <= 0) return items;
  return items.filter((item) => Number(item[key]) === gid);
}

export function searchByKeyword<T>(items: T[], keyword: string, toFields: (item: T) => unknown[]) {
  const k = keyword.trim().toLowerCase();
  if (!k) return items;
  return items.filter((item) => toSearchText(toFields(item)).includes(k));
}

export function mapTopicGroupsForLanguage(
  groups: Array<{ id: number; name_vi?: string; name_es?: string }>,
  lang: 'vi' | 'es'
) {
  return groups
    .map((g) => ({
      id: g.id,
      name: (lang === 'vi' ? g.name_vi : g.name_es) || `Group #${g.id}`,
    }))
    .sort((a, b) => a.id - b.id);
}

export function computeUserQuickStats(
  users: Array<{ is_active?: boolean; created_at?: unknown }>,
  parseDateSafe: (value: unknown) => Date | null
) {
  const total = users.length;
  const active = users.filter((u) => u.is_active).length;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const newToday = users.filter((u) => {
    const ca = parseDateSafe(u.created_at);
    return ca != null && ca >= start && ca <= end;
  }).length;
  return { total, active, inactive: total - active, newToday };
}

export function paginateItems<T>(items: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function clampPage(page: number, totalItems: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  return { totalPages, safePage };
}

export function filterAdminQuizzes(params: {
  adminQuizzes: AnyRecord[];
  selectedQuizTypeFilter: string;
  quizListFilterGroupId: string;
  quizListFilterCategoryId: string;
  quizSearch: string;
  getQuizTypeFilterKey: (item: AnyRecord) => string;
  getQuizTypeDisplayName: (item: AnyRecord) => string;
}) {
  const {
    adminQuizzes,
    selectedQuizTypeFilter,
    quizListFilterGroupId,
    quizListFilterCategoryId,
    quizSearch,
    getQuizTypeFilterKey,
    getQuizTypeDisplayName,
  } = params;

  const byType =
    selectedQuizTypeFilter === 'all'
      ? adminQuizzes
      : adminQuizzes.filter((quizItem) => getQuizTypeFilterKey(quizItem) === selectedQuizTypeFilter);
  const byGroup =
    quizListFilterGroupId === 'all'
      ? byType
      : byType.filter((item) => Number(item.quiz_topic_group_id) === Number(quizListFilterGroupId));
  const byCategory =
    quizListFilterCategoryId === 'all'
      ? byGroup
      : byGroup.filter((item) => Number(item.category_id) === Number(quizListFilterCategoryId));

  return searchByKeyword(byCategory, quizSearch, (item) => [
    item.id,
    item.title_vi,
    item.title_es,
    getQuizTypeDisplayName(item),
  ]);
}

export function filterAndSortUsers(params: {
  users: AnyRecord[];
  userSearch: string;
  userCreatedFrom: string;
  userCreatedTo: string;
  userCreatedSort: 'asc' | 'desc';
  userRoleFilter: string;
  userStatusFilter: 'all' | 'active' | 'inactive';
  parseDateSafe: (value: unknown) => Date | null;
}) {
  const {
    users,
    userSearch,
    userCreatedFrom,
    userCreatedTo,
    userCreatedSort,
    userRoleFilter,
    userStatusFilter,
    parseDateSafe,
  } = params;

  const keyword = userSearch.trim().toLowerCase();
  const fromDate = userCreatedFrom ? new Date(`${userCreatedFrom}T00:00:00`) : null;
  const toDate = userCreatedTo ? new Date(`${userCreatedTo}T23:59:59`) : null;

  const filtered = users.filter((item) => {
    const roleLower = String(item.role || '').toLowerCase();
    if (userRoleFilter !== 'all' && roleLower !== userRoleFilter) return false;

    if (userStatusFilter === 'active' && !item.is_active) return false;
    if (userStatusFilter === 'inactive' && item.is_active) return false;

    const matchesKeyword = keyword
      ? [item.username, item.email, item.full_name, item.role]
          .map((value) => String(value || ''))
          .join(' ')
          .toLowerCase()
          .includes(keyword)
      : true;
    if (!matchesKeyword) return false;

    const createdAt = parseDateSafe(item.created_at);
    if (!createdAt) return true;
    if (fromDate && createdAt < fromDate) return false;
    if (toDate && createdAt > toDate) return false;
    return true;
  });

  return filtered.sort((a, b) => {
    const aTime = parseDateSafe(a.created_at)?.getTime() ?? 0;
    const bTime = parseDateSafe(b.created_at)?.getTime() ?? 0;
    return userCreatedSort === 'desc' ? bTime - aTime : aTime - bTime;
  });
}
