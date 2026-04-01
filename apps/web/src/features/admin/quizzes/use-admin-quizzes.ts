import { useEffect, useMemo } from 'react';
import { clampPage, filterAdminQuizzes, paginateItems } from '@/features/admin/admin.selectors';

export function useAdminQuizzes(params: {
  adminQuizzes: any[];
  selectedQuizTypeFilter: string;
  quizListFilterGroupId: string;
  quizListFilterCategoryId: string;
  quizSearch: string;
  getQuizTypeFilterKey: (item: any) => string;
  getQuizTypeDisplayName: (item: any) => string;
  adminQuizzesListPage: number;
  setAdminQuizzesListPage: (value: number | ((p: number) => number)) => void;
  pageSize: number;
}) {
  const {
    adminQuizzes,
    selectedQuizTypeFilter,
    quizListFilterGroupId,
    quizListFilterCategoryId,
    quizSearch,
    getQuizTypeFilterKey,
    getQuizTypeDisplayName,
    adminQuizzesListPage,
    setAdminQuizzesListPage,
    pageSize,
  } = params;

  const filteredAdminQuizzes = useMemo(
    () =>
      filterAdminQuizzes({
        adminQuizzes,
        selectedQuizTypeFilter,
        quizListFilterGroupId,
        quizListFilterCategoryId,
        quizSearch,
        getQuizTypeFilterKey,
        getQuizTypeDisplayName,
      }),
    [
      adminQuizzes,
      selectedQuizTypeFilter,
      quizListFilterGroupId,
      quizListFilterCategoryId,
      quizSearch,
      getQuizTypeFilterKey,
      getQuizTypeDisplayName,
    ]
  );

  useEffect(() => {
    setAdminQuizzesListPage(1);
  }, [quizSearch, selectedQuizTypeFilter, setAdminQuizzesListPage]);

  useEffect(() => {
    const { totalPages } = clampPage(adminQuizzesListPage, filteredAdminQuizzes.length, pageSize);
    setAdminQuizzesListPage((p) => (p > totalPages ? totalPages : p));
  }, [adminQuizzesListPage, filteredAdminQuizzes.length, pageSize, setAdminQuizzesListPage]);

  const { totalPages: adminQuizzesTotalPages, safePage: adminQuizzesPage } = clampPage(
    adminQuizzesListPage,
    filteredAdminQuizzes.length,
    pageSize
  );
  const paginatedAdminQuizzes = useMemo(
    () => paginateItems(filteredAdminQuizzes, adminQuizzesPage, pageSize),
    [filteredAdminQuizzes, adminQuizzesPage, pageSize]
  );

  return {
    filteredAdminQuizzes,
    adminQuizzesTotalPages,
    adminQuizzesPage,
    paginatedAdminQuizzes,
  };
}
