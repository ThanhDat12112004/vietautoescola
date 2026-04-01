import { useEffect, useMemo } from 'react';
import { clampPage, computeUserQuickStats, filterAndSortUsers, paginateItems } from '@/features/admin/admin.selectors';

export function useAdminUsers(params: {
  users: any[];
  userSearch: string;
  userCreatedFrom: string;
  userCreatedTo: string;
  userCreatedSort: 'asc' | 'desc';
  userRoleFilter: string;
  userStatusFilter: 'all' | 'active' | 'inactive';
  parseDateSafe: (value: unknown) => Date | null;
  adminUsersListPage: number;
  setAdminUsersListPage: (value: number | ((p: number) => number)) => void;
  pageSize: number;
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
    adminUsersListPage,
    setAdminUsersListPage,
    pageSize,
  } = params;

  const adminUserQuickStats = useMemo(() => computeUserQuickStats(users, parseDateSafe), [users, parseDateSafe]);

  const filteredUsers = useMemo(
    () =>
      filterAndSortUsers({
        users,
        userSearch,
        userCreatedFrom,
        userCreatedTo,
        userCreatedSort,
        userRoleFilter,
        userStatusFilter,
        parseDateSafe,
      }),
    [
      users,
      userSearch,
      userCreatedFrom,
      userCreatedTo,
      userCreatedSort,
      userRoleFilter,
      userStatusFilter,
      parseDateSafe,
    ]
  );

  useEffect(() => {
    setAdminUsersListPage(1);
  }, [
    userSearch,
    userCreatedFrom,
    userCreatedTo,
    userCreatedSort,
    userRoleFilter,
    userStatusFilter,
    setAdminUsersListPage,
  ]);

  useEffect(() => {
    const { totalPages } = clampPage(adminUsersListPage, filteredUsers.length, pageSize);
    setAdminUsersListPage((p) => (p > totalPages ? totalPages : p));
  }, [adminUsersListPage, filteredUsers.length, pageSize, setAdminUsersListPage]);

  const { totalPages: adminUsersTotalPages, safePage: adminUsersPage } = clampPage(
    adminUsersListPage,
    filteredUsers.length,
    pageSize
  );
  const paginatedUsers = useMemo(
    () => paginateItems(filteredUsers, adminUsersPage, pageSize),
    [filteredUsers, adminUsersPage, pageSize]
  );

  return {
    adminUserQuickStats,
    filteredUsers,
    adminUsersTotalPages,
    adminUsersPage,
    paginatedUsers,
  };
}
