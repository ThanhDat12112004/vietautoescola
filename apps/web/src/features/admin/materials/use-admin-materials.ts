import { useEffect, useMemo } from 'react';
import { clampPage, paginateItems, searchByKeyword } from '@/features/admin/admin.selectors';

export function useAdminMaterials(params: {
  materials: any[];
  materialSearch: string;
  selectedSubjectId: number | null;
  adminMaterialsListPage: number;
  setAdminMaterialsListPage: (value: number | ((p: number) => number)) => void;
  pageSize: number;
}) {
  const {
    materials,
    materialSearch,
    selectedSubjectId,
    adminMaterialsListPage,
    setAdminMaterialsListPage,
    pageSize,
  } = params;

  const filteredMaterials = useMemo(
    () =>
      searchByKeyword(materials, materialSearch, (item) => [
        item.title_vi,
        item.title_es,
        item.description_vi,
        item.description_es,
      ]),
    [materials, materialSearch]
  );

  useEffect(() => {
    setAdminMaterialsListPage(1);
  }, [materialSearch, selectedSubjectId, setAdminMaterialsListPage]);

  useEffect(() => {
    const { totalPages } = clampPage(adminMaterialsListPage, filteredMaterials.length, pageSize);
    setAdminMaterialsListPage((p) => (p > totalPages ? totalPages : p));
  }, [adminMaterialsListPage, filteredMaterials.length, pageSize, setAdminMaterialsListPage]);

  const { totalPages: adminMaterialsTotalPages, safePage: adminMaterialsPage } = clampPage(
    adminMaterialsListPage,
    filteredMaterials.length,
    pageSize
  );

  const paginatedMaterials = useMemo(
    () => paginateItems(filteredMaterials, adminMaterialsPage, pageSize),
    [filteredMaterials, adminMaterialsPage, pageSize]
  );

  return {
    filteredMaterials,
    adminMaterialsTotalPages,
    adminMaterialsPage,
    paginatedMaterials,
  };
}
