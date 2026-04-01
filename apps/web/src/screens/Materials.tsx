import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  getMaterialCountsBySubject,
  getMaterialsBySubject,
  getSubjects,
  type MaterialItem,
  type Subject,
} from '@/lib/api/materials';
import { resolveMediaUrl } from '@/lib/api/upload';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useLanguage } from '@/hooks/useLanguage';
import { cn, fileExtensionFromPath, formatFileSizeFromMb } from '@/lib/utils';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const ITEMS_PER_PAGE = 18;

const MATERIALS_ILLUSTRATION_SRC = '/brand/document.png';

function normalizeSearchValue(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function resolveMaterialPageCount(material: MaterialItem, lang: 'vi' | 'es'): number | null {
  if (material.page_count != null && Number.isFinite(Number(material.page_count))) {
    const n = Number(material.page_count);
    if (n > 0) return Math.floor(n);
  }
  const p1 = lang === 'es' ? material.page_count_es : material.page_count_vi;
  const p2 = lang === 'es' ? material.page_count_vi : material.page_count_es;
  const raw =
    p1 != null && Number.isFinite(Number(p1))
      ? Number(p1)
      : p2 != null && Number.isFinite(Number(p2))
        ? Number(p2)
        : null;
  if (raw != null && raw > 0) return Math.floor(raw);
  return null;
}

/** Đuôi file + số trang (PDF) + dung lượng theo ngôn ngữ UI. */
function materialFileSummary(
  material: MaterialItem,
  lang: 'vi' | 'es',
  pageLabel: (n: number) => string,
  options?: { omitPages?: boolean }
): string | null {
  const pathPrimary = lang === 'es' ? material.file_path_es : material.file_path_vi;
  const pathAlt = lang === 'es' ? material.file_path_vi : material.file_path_es;
  const sizePrimary = lang === 'es' ? material.file_size_mb_es : material.file_size_mb_vi;
  const sizeAlt = lang === 'es' ? material.file_size_mb_vi : material.file_size_mb_es;
  const path = pathPrimary || pathAlt;
  const ext = fileExtensionFromPath(path);
  const pick =
    sizePrimary != null && Number.isFinite(Number(sizePrimary))
      ? Number(sizePrimary)
      : sizeAlt != null && Number.isFinite(Number(sizeAlt))
        ? Number(sizeAlt)
        : null;
  const sizeLabel = formatFileSizeFromMb(pick);

  const pages = options?.omitPages ? null : resolveMaterialPageCount(material, lang);

  const parts: string[] = [];
  if (ext) parts.push(ext);
  if (pages != null) parts.push(pageLabel(pages));
  if (sizeLabel) parts.push(sizeLabel);
  return parts.length ? parts.join(' · ') : null;
}

const Materials = () => {
  const { t, lang } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeTopicGroup, setActiveTopicGroup] = useState<string>('');
  const [expandedTopicGroup, setExpandedTopicGroup] = useState<string>('');
  const [activeSubject, setActiveSubject] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [readFilter, setReadFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [subjectMaterialCounts, setSubjectMaterialCounts] = useState<Record<number, number>>({});
  const [readMaterialIds, setReadMaterialIds] = useState<number[]>([]);
  const prevSearchForPage = useRef<string | undefined>(undefined);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [error, setError] = useState('');
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);
  const isGlobalSearch = normalizeSearchValue(debouncedSearchQuery).length > 0;

  const readStorageKey = 'materials_read_ids_v1';

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearchQuery(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial `q` from URL only
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(readStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      const normalized = parsed
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value > 0);
      setReadMaterialIds(Array.from(new Set(normalized)));
    } catch {
      setReadMaterialIds([]);
    }
  }, []);

  const persistReadMaterialIds = (nextIds: number[]) => {
    setReadMaterialIds(nextIds);
    try {
      window.localStorage.setItem(readStorageKey, JSON.stringify(nextIds));
    } catch {
      // Ignore storage errors to avoid breaking the UI.
    }
  };

  const markMaterialAsRead = (materialId: number) => {
    if (readMaterialIds.includes(materialId)) return;
    persistReadMaterialIds([...readMaterialIds, materialId]);
  };

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoadingSubjects(true);
        const data = await getSubjects(lang);
        if (!active) return;
        setSubjects(data);
        setActiveSubject((prev) => {
          if (prev === null) return null;
          if (data.some((item) => item.id === prev)) return prev;
          return null;
        });
        setError('');
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error
            ? err.message
            : t('Không tải được môn học', 'No se pudo cargar asignaturas')
        );
      } finally {
        if (active) {
          setLoadingSubjects(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [lang, t]);

  useEffect(() => {
    if (!subjects.length) {
      setMaterials([]);
      return;
    }

    let active = true;

    (async () => {
      try {
        setLoadingMaterials(true);
        const subjectsInActiveGroup = activeTopicGroup
          ? subjects.filter(
              (subject) => String(subject.material_topic_group_name || '').trim() === activeTopicGroup
            )
          : subjects;

        const rows =
          isGlobalSearch
            ? (
                await Promise.all(subjects.map((subject) => getMaterialsBySubject(subject.id, lang)))
              ).flat()
            : activeSubject != null
              ? await getMaterialsBySubject(activeSubject, lang)
              : (
                  await Promise.all(
                    subjectsInActiveGroup.map((subject) => getMaterialsBySubject(subject.id, lang))
                  )
                ).flat();

        const uniqueRows = Array.from(new Map(rows.map((item) => [item.id, item])).values());
        if (!active) return;
        setMaterials(uniqueRows);
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error
            ? err.message
            : t('Không tải được tài liệu', 'No se pudo cargar el temario')
        );
      } finally {
        if (active) {
          setLoadingMaterials(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [activeSubject, activeTopicGroup, isGlobalSearch, lang, subjects, t]);

  useEffect(() => {
    if (!subjects.length) {
      setSubjectMaterialCounts({});
      return;
    }

    let active = true;

    (async () => {
      try {
        const countRows = await getMaterialCountsBySubject();
        if (!active) return;

        const subjectIdSet = new Set(subjects.map((subject) => subject.id));

        setSubjectMaterialCounts(
          Object.fromEntries(
            countRows
              .filter((row) => subjectIdSet.has(Number(row.subject_id)))
              .map((row) => [Number(row.subject_id), Number(row.total || 0)])
          )
        );
      } catch {
        if (!active) return;
        setSubjectMaterialCounts({});
      }
    })();

    return () => {
      active = false;
    };
  }, [subjects]);

  const activeSubjectInfo = useMemo(
    () => subjects.find((subject) => subject.id === activeSubject),
    [subjects, activeSubject]
  );
  const formatSubjectLabel = (subject: Subject) => {
    const parent = String(subject.material_topic_group_name || '').trim();
    if (!parent) return subject.name;
    return `${parent} • ${subject.name}`;
  };
  const materialTopicGroups = useMemo(() => {
    const names = subjects
      .map((subject) => String(subject.material_topic_group_name || '').trim())
      .filter(Boolean);
    return Array.from(new Set(names));
  }, [subjects]);

  const subjectsForActiveGroup = useMemo(() => {
    if (!activeTopicGroup) return subjects;
    return subjects.filter(
      (subject) => String(subject.material_topic_group_name || '').trim() === activeTopicGroup
    );
  }, [activeTopicGroup, subjects]);

  const subjectsByGroup = useMemo(() => {
    const result: Record<string, Subject[]> = {};
    for (const subject of subjects) {
      const group = String(subject.material_topic_group_name || '').trim();
      if (!group) continue;
      if (!result[group]) result[group] = [];
      result[group].push(subject);
    }
    return result;
  }, [subjects]);

  const readMaterialSet = useMemo(() => new Set(readMaterialIds), [readMaterialIds]);

  const filteredMaterials = useMemo(() => {
    const q = normalizeSearchValue(debouncedSearchQuery);
    return materials.filter((material) => {
      const byRead =
        readFilter === 'all'
          ? true
          : readFilter === 'read'
            ? readMaterialSet.has(material.id)
            : !readMaterialSet.has(material.id);
      if (!byRead) return false;
      if (!q) return true;
      const blob = normalizeSearchValue(
        [
          material.title_vi,
          material.title_es,
          material.title,
          material.description_vi || '',
          material.description_es || '',
          material.description || '',
        ].join(' ')
      );
      return blob.includes(q);
    });
  }, [debouncedSearchQuery, materials, readFilter, readMaterialSet]);

  const readCounts = useMemo(() => {
    const done = materials.filter((material) => readMaterialSet.has(material.id)).length;
    return {
      all: materials.length,
      read: done,
      unread: Math.max(materials.length - done, 0),
    };
  }, [materials, readMaterialSet]);

  const requestedSubjectId = useMemo(() => {
    const raw = Number(searchParams.get('subject'));
    if (!Number.isInteger(raw) || raw <= 0) return null;
    return raw;
  }, [searchParams]);
  const requestedTopicGroup = useMemo(
    () => String(searchParams.get('topic_group') || '').trim(),
    [searchParams]
  );

  const requestedPage = useMemo(() => {
    const raw = Number(searchParams.get('page'));
    return Number.isInteger(raw) && raw > 0 ? raw : 1;
  }, [searchParams]);

  useEffect(() => {
    setCurrentPage(requestedPage);
  }, [requestedPage]);

  useEffect(() => {
    if (requestedSubjectId === null) return;
    if (subjects.some((subject) => subject.id === requestedSubjectId)) {
      setActiveSubject(requestedSubjectId);
    }
  }, [requestedSubjectId, subjects]);

  useEffect(() => {
    if (!activeSubjectInfo) return;
    const parentGroup = String(activeSubjectInfo.material_topic_group_name || '').trim();
    if (!parentGroup) return;
    if (activeTopicGroup !== parentGroup) {
      setActiveTopicGroup(parentGroup);
    }
    setExpandedTopicGroup((prev) => prev || parentGroup);
  }, [activeSubjectInfo, activeTopicGroup]);

  useEffect(() => {
    if (!requestedTopicGroup) return;
    if (!Object.keys(subjectsByGroup).includes(requestedTopicGroup)) return;
    setActiveTopicGroup(requestedTopicGroup);
    setExpandedTopicGroup(requestedTopicGroup);
  }, [requestedTopicGroup, subjectsByGroup]);

  useEffect(() => {
    if (prevSearchForPage.current === undefined) {
      prevSearchForPage.current = debouncedSearchQuery;
      return;
    }
    if (prevSearchForPage.current === debouncedSearchQuery) return;
    prevSearchForPage.current = debouncedSearchQuery;
    setCurrentPage(1);
    const next = new URLSearchParams(searchParams);
    next.delete('page');
    setSearchParams(next, { replace: true });
  }, [debouncedSearchQuery, searchParams, setSearchParams]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredMaterials.length / ITEMS_PER_PAGE)),
    [filteredMaterials.length]
  );

  const effectivePage = Math.min(currentPage, totalPages);

  useEffect(() => {
    if (currentPage <= totalPages) return;
    setCurrentPage(totalPages);
    const next = new URLSearchParams(searchParams);
    if (totalPages <= 1) {
      next.delete('page');
    } else {
      next.set('page', String(totalPages));
    }
    setSearchParams(next, { replace: true });
  }, [currentPage, searchParams, setSearchParams, totalPages]);

  const pagedMaterials = useMemo(() => {
    const start = (effectivePage - 1) * ITEMS_PER_PAGE;
    return filteredMaterials.slice(start, start + ITEMS_PER_PAGE);
  }, [effectivePage, filteredMaterials]);

  const goToPage = (page: number) => {
    const nextPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const next = new URLSearchParams(searchParams);
    if (nextPage === 1) {
      next.delete('page');
    } else {
      next.set('page', String(nextPage));
    }
    setSearchParams(next, { replace: true });
  };

  const resetPage = () => {
    setCurrentPage(1);
    const next = new URLSearchParams(searchParams);
    next.delete('page');
    setSearchParams(next, { replace: true });
  };

  const applyReadFilter = (value: 'all' | 'read' | 'unread') => {
    setReadFilter(value);
    resetPage();
  };

  const applySubjectFilter = (subjectId: number | null) => {
    setActiveSubject(subjectId);
    const next = new URLSearchParams(searchParams);
    if (subjectId === null) {
      next.delete('subject');
    } else {
      next.set('subject', String(subjectId));
    }
    next.delete('page');
    setCurrentPage(1);
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    if (!activeTopicGroup) return;
    setExpandedTopicGroup((prev) => prev || activeTopicGroup);
  }, [activeTopicGroup]);

  useEffect(() => {
    if (activeSubject === null) return;
    if (!subjectsForActiveGroup.some((subject) => subject.id === activeSubject)) {
      setActiveSubject(null);
    }
  }, [activeSubject, subjectsForActiveGroup]);

  const pageWindow = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const start = Math.max(1, effectivePage - 2);
    const end = Math.min(totalPages, start + 4);
    const adjustedStart = Math.max(1, end - 4);
    return Array.from({ length: end - adjustedStart + 1 }, (_, i) => adjustedStart + i);
  }, [effectivePage, totalPages]);

  const openMaterialViewer = async (material: MaterialItem, language: 'vi' | 'es') => {
    const filePath = language === 'es' ? material.file_path_es : material.file_path_vi;
    const directUrl = resolveMediaUrl(filePath);

    markMaterialAsRead(material.id);

    try {
      const headers: Record<string, string> = {};
      if (directUrl.includes('ngrok-free.app')) {
        headers['ngrok-skip-browser-warning'] = 'true';
      }

      const response = await fetch(directUrl, { headers });
      if (!response.ok) {
        throw new Error(`PDF fetch failed (${response.status})`);
      }

      const blob = await response.blob();
      const blobType = (blob.type || '').toLowerCase();

      if (blobType.includes('text/html')) {
        throw new Error('Received HTML instead of PDF');
      }

      const blobUrl = URL.createObjectURL(blob);
      window.location.assign(blobUrl);
    } catch {
      window.location.assign(directUrl);
    }
  };

  const downloadMaterial = (material: MaterialItem, language: 'vi' | 'es') => {
    const filePath = language === 'es' ? material.file_path_es : material.file_path_vi;
    markMaterialAsRead(material.id);
    window.open(resolveMediaUrl(filePath), '_blank', 'noopener,noreferrer');
  };

  const uiLang: 'vi' | 'es' = lang === 'es' ? 'es' : 'vi';

  return (
    <div className="app-page flex min-h-screen flex-col bg-background">
      <Navbar />
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="border-b-2 border-primary/25 bg-card">
          <div className="w-full px-2 py-5 sm:px-3 md:py-6">
            <div className="max-w-3xl border-l-[3px] border-primary/60 pl-3 sm:pl-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary/80">
                {t('Tài liệu', 'Temario')}
              </p>
              <h1 className="mt-1.5 font-display text-[1.65rem] font-bold leading-tight tracking-tight text-foreground md:text-[2rem]">
                {t('Tài liệu học tập', 'Temario de estudio')}
              </h1>
              <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-foreground/72 md:text-[0.97rem]">
                {t(
                  'Xem trực tiếp hoặc tải về tài liệu song ngữ để ôn tập',
                  'Visualiza directamente o descarga contenido bilingüe del temario para estudiar'
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-1 flex-col bg-background">
          <div className="w-full border-b border-primary/20 bg-card px-2 py-3.5 font-sans shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] sm:px-3">
            {!loadingSubjects && subjects.length > 0 && (
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:gap-4">
                <div className="min-w-0 flex-1 lg:flex lg:justify-center">
                  <div className="min-w-0 space-y-1.5 lg:w-full lg:max-w-xl">
                    <div className="flex items-center gap-3">
                      <label
                        htmlFor="material-search"
                        className="shrink-0 text-xs font-semibold uppercase tracking-[0.06em] text-primary/90"
                      >
                        {t('Tìm kiếm', 'Buscar')}
                      </label>
                      <div className="relative flex-1">
                        <span
                          aria-hidden
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-primary/70"
                        >
                          🔍
                        </span>
                        <Input
                          id="material-search"
                          type="search"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder={t('Tiêu đề, mô tả…', 'Título, descripción…')}
                          className="h-12 rounded-lg border border-primary/25 bg-white/95 pl-10 pr-4 text-sm font-semibold text-foreground placeholder:text-muted-foreground/70 shadow-[0_8px_22px_rgba(143,34,61,0.12)] ring-1 ring-white/70 backdrop-blur-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/35"
                          autoComplete="off"
                        />
                      </div>
                    </div>
                  </div>
                </div>


                <div className="shrink-0 lg:ml-auto lg:flex lg:flex-col lg:items-end">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.06em] text-primary/90 lg:text-right">
                    {t('Trạng thái đọc', 'Estado')}
                  </span>
                  <div
                    className="flex w-full flex-wrap gap-0.5 rounded-full border border-primary/18 bg-primary/[0.06] p-1 shadow-sm lg:w-auto lg:flex-nowrap"
                    role="group"
                    aria-label={t('Lọc theo đã đọc', 'Filtrar por leídos')}
                  >
                    {(['all', 'read', 'unread'] as const).map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => applyReadFilter(key)}
                        className={cn(
                          'min-h-8 flex-1 whitespace-nowrap rounded-full px-2.5 py-1.5 text-center text-xs font-semibold transition-[color,background-color,box-shadow,border-color] sm:px-3',
                          key === 'all' &&
                            (readFilter === key
                              ? 'border border-primary/35 bg-primary/18 text-primary shadow-sm'
                              : 'border border-transparent bg-transparent text-primary/80 hover:bg-primary/10'),
                          key === 'read' &&
                            (readFilter === key
                              ? 'border border-emerald-300 bg-emerald-100 text-emerald-800 shadow-sm'
                              : 'border border-transparent bg-transparent text-emerald-700 hover:bg-emerald-50'),
                          key === 'unread' &&
                            (readFilter === key
                              ? 'border border-rose-300 bg-rose-100 text-rose-800 shadow-sm'
                              : 'border border-transparent bg-transparent text-rose-700 hover:bg-rose-50')
                        )}
                      >
                        {key === 'all' && (
                          <>
                            {t('Tất cả', 'Todos')} <span className="tabular-nums">({readCounts.all})</span>
                          </>
                        )}
                        {key === 'read' && (
                          <>
                            {t('Đã đọc', 'Leídos')}{' '}
                            <span className="tabular-nums">({readCounts.read})</span>
                          </>
                        )}
                        {key === 'unread' && (
                          <>
                            {t('Chưa đọc', 'Pend.')}{' '}
                            <span className="tabular-nums">({readCounts.unread})</span>
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {loadingSubjects && (
              <p className="text-sm text-muted-foreground">{t('Đang tải...', 'Cargando...')}</p>
            )}
          </div>

          <div className="w-full flex-1 px-2 pb-0 pt-0 sm:px-3 sm:pt-0 xl:px-0">
            <div className="mb-2 grid grid-cols-1 gap-3 rounded-xl border border-primary/20 bg-card p-3 xl:hidden sm:grid-cols-2">
              <label className="text-sm font-semibold text-primary/90">
                {t('Loại chủ đề', 'Grupo de tema')}
                <select
                  className="mt-1 h-11 w-full rounded-md border border-primary/25 bg-background px-3 text-base"
                  value={activeTopicGroup}
                  onChange={(e) => {
                    const group = e.target.value;
                    setActiveTopicGroup(group);
                    setExpandedTopicGroup(group);
                    applySubjectFilter(null);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">{t('Tất cả loại chủ đề', 'Todos los grupos')}</option>
                  {materialTopicGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold text-primary/90">
                {t('Chủ đề', 'Tema')}
                <select
                  className="mt-1 h-11 w-full rounded-md border border-primary/25 bg-background px-3 text-base"
                  value={activeSubject == null ? '' : String(activeSubject)}
                  onChange={(e) => {
                    applySubjectFilter(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value="">{t('Tất cả chủ đề', 'Todos los temas')}</option>
                  {subjectsForActiveGroup.map((subject) => (
                    <option key={subject.id} value={String(subject.id)}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-[252px_minmax(0,1fr)] xl:gap-0">
              <aside className="hidden border border-primary/20 bg-white p-2 shadow-md xl:block">
                <p className="border-b border-[#e7d9dd] px-2 pb-2 text-base font-extrabold uppercase tracking-[0.06em] text-[#6b1b31]">
                  {t('Loại chủ đề', 'Grupo de tema')}
                </p>
                <div className="space-y-0 overflow-hidden border border-[#e7d9dd] bg-white">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTopicGroup('');
                      setActiveSubject(null);
                      setExpandedTopicGroup('');
                      setCurrentPage(1);
                    }}
                    className={cn(
                      'w-full border-b border-[#ece6e8] bg-white px-3 py-2 text-left text-[15px] font-semibold',
                      !activeTopicGroup
                        ? 'bg-[#8f223d] text-white'
                        : 'text-[#6b1b31] hover:bg-[#fafafa]'
                    )}
                  >
                    {t('Tất cả', 'Todos')}
                  </button>
                  {materialTopicGroups.map((group) => {
                    const isOpen = expandedTopicGroup === group;
                    const children = subjectsByGroup[group] || [];
                    return (
                      <div key={group} className="border-b border-[#ece6e8] bg-white last:border-b-0">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTopicGroup(group);
                            if (!isOpen) {
                              setExpandedTopicGroup(group);
                              applySubjectFilter(null);
                            } else {
                              setExpandedTopicGroup('');
                            }
                            setCurrentPage(1);
                          }}
                          className={cn(
                            'flex w-full items-center justify-between bg-white px-3 py-2.5 text-left text-[17px] font-semibold transition-colors',
                            activeTopicGroup === group
                              ? 'bg-[#8f223d] text-white'
                              : 'text-[#6b1b31] hover:bg-[#fafafa]'
                          )}
                        >
                          <span>{group}</span>
                          <span
                            className={cn(
                              'text-xl leading-none',
                              activeTopicGroup === group ? 'text-white' : 'text-primary/80'
                            )}
                          >
                            {isOpen ? '▾' : '▸'}
                          </span>
                        </button>
                        {isOpen && (
                          <div className="border-t border-[#ece6e8] bg-white">
                            {children.map((subject) => (
                              <button
                                key={subject.id}
                                type="button"
                                onClick={() => {
                                  setActiveTopicGroup(group);
                                  applySubjectFilter(subject.id);
                                }}
                                className={cn(
                                  'w-full truncate whitespace-nowrap border-b border-[#f0e3e7] bg-white px-3 py-2 text-left text-sm font-normal last:border-b-0',
                                  activeTopicGroup === group && activeSubject === subject.id
                                    ? 'bg-[#f6d4dd] text-[#7a2038]'
                                    : 'text-foreground hover:bg-[#fafafa]'
                                )}
                              >
                                {subject.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </aside>
              <div>

            {!loadingSubjects && error && <p className="text-sm text-destructive mb-3">{error}</p>}

            {loadingMaterials && (
              <p className="text-sm text-muted-foreground">
                {t('Đang tải tài liệu...', 'Cargando el temario...')}
              </p>
            )}

            {!loadingMaterials && materials.length === 0 && !loadingSubjects && subjects.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {t('Chưa có tài liệu', 'No hay contenido en el temario')}
              </p>
            )}
            {!loadingMaterials && materials.length > 0 && filteredMaterials.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {t('Không có tài liệu phù hợp.', 'Sin coincidencias en el temario.')}
              </p>
            )}

            {!loadingMaterials && filteredMaterials.length > 0 && (
              <>
              <div className="mb-3 border border-[#ece6e8] bg-white px-3 py-2 text-xs sm:text-sm text-primary">
                <span className="font-semibold">
                  {activeTopicGroup || t('Tất cả loại chủ đề', 'Todos los grupos')}
                </span>
                {!activeSubjectInfo && (
                  <>
                    {' '}
                    &gt; <span>{t('Tất cả tài liệu', 'Todos los materiales')}</span>
                  </>
                )}
                {activeSubjectInfo && (
                  <>
                    {' '}
                    &gt;{' '}
                    <span>{activeSubjectInfo.name}</span>
                  </>
                )}
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-3 md:gap-6 xl:pl-3">
                {pagedMaterials.map((material) => {
                  const pageCount = resolveMaterialPageCount(material, uiLang);
                  const fileLine = materialFileSummary(
                    material,
                    uiLang,
                    (n) => t(`${n} trang`, `${n} páginas`),
                    { omitPages: true }
                  );
                  return (
                    <div key={material.id}>
                      <Card className="h-full overflow-hidden border border-foreground/10 bg-card shadow-sm transition-all hover:border-primary/25 hover:shadow-md">
                        <CardContent className="flex h-full flex-row items-stretch gap-0 p-0">
                          <div className="flex w-[4.75rem] shrink-0 flex-col items-center justify-center self-stretch border-r border-foreground/10 bg-primary/[0.07] px-1.5 py-2 sm:w-[5.25rem] md:w-28">
                            <div className="flex flex-col items-center gap-0.5">
                              <img
                                src={MATERIALS_ILLUSTRATION_SRC}
                                alt=""
                                className="h-auto max-h-[4rem] w-full object-contain object-center sm:max-h-[4.25rem]"
                                aria-hidden
                              />
                              <div className="flex flex-col items-center gap-0 text-center leading-none">
                                {pageCount != null ? (
                                  <>
                                    <span className="font-display text-lg font-bold tabular-nums text-primary sm:text-xl">
                                      {pageCount}
                                    </span>
                                    <span className="max-w-[4.5rem] text-[9px] font-semibold leading-tight text-primary/85">
                                      {t('trang', 'pág.')}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-[10px] font-semibold leading-tight text-muted-foreground">
                                    —
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col p-4 md:p-5">
                          <div className="mb-3">
                            <span
                              className={cn(
                                'inline-block rounded border px-2 py-0.5 text-[11px] font-semibold',
                                readMaterialSet.has(material.id)
                                  ? 'border-emerald-900/20 bg-emerald-950/[0.06] text-emerald-900/85 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-100/90'
                                  : 'border-foreground/12 bg-muted/40 text-foreground/70'
                              )}
                            >
                              {readMaterialSet.has(material.id)
                                ? t('Đã đọc', 'Leido')
                                : t('Chưa đọc', 'No leido')}
                            </span>
                            <h3 className="mt-2 font-display text-[15px] font-bold leading-snug text-foreground sm:text-base md:text-[1.1rem]">
                              {(lang === 'es' ? material.title_es : material.title_vi) ||
                                `${material.title_vi || '-'} / ${material.title_es || '-'}`}
                            </h3>
                            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-foreground/68">
                              {(lang === 'es' ? material.description_es : material.description_vi) ||
                                t('Không có mô tả', 'Sin descripción')}
                            </p>
                          </div>

                          <div className="mt-auto border-t border-foreground/10 pt-4">
                            {fileLine && (
                              <p className="mb-3 text-[12px] font-medium text-foreground/55">{fileLine}</p>
                            )}
                            <div className="flex gap-2">
                              <div className="min-w-0 flex-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-9 w-full rounded-md border-2 border-[#991b1b] bg-[#B91C1C] text-[12px] font-semibold text-white shadow-[0_3px_10px_rgba(185,28,28,0.28)] transition-colors hover:border-[#7f1d1d] hover:bg-[#991b1b] hover:text-white focus-visible:ring-[#B91C1C]/40 sm:text-[13px]"
                                  onClick={() => openMaterialViewer(material, uiLang)}
                                >
                                  {t('Xem', 'Ver')}
                                </Button>
                              </div>
                              <div className="min-w-0 flex-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-9 w-full rounded-md border border-gray-300 bg-[#E5E7EB] text-[12px] font-semibold text-[#374151] shadow-sm transition-colors hover:border-gray-400 hover:bg-gray-300 hover:text-[#1f2937] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white sm:text-[13px]"
                                  onClick={() => downloadMaterial(material, uiLang)}
                                >
                                  {t('Tải xuống', 'Descargar')}
                                </Button>
                              </div>
                            </div>
                          </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
              </>
            )}

            {!loadingMaterials && filteredMaterials.length > 0 && (
              <div className="mt-8 flex flex-col items-center gap-4 rounded-b-xl border-t-2 border-primary/25 bg-card px-3 py-5 shadow-[0_-2px_12px_rgba(45,38,36,0.06)] sm:gap-5 sm:px-4">
                <p className="text-center text-sm font-semibold tabular-nums text-foreground sm:text-[15px]">
                  {t('Trang', 'Página')} {effectivePage}/{totalPages} · {filteredMaterials.length}{' '}
                  {t('tài liệu', 'documentos del temario')}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-10 min-h-10 border-primary/30 bg-background px-4 text-sm font-semibold text-foreground shadow-sm hover:bg-primary/[0.08] sm:text-[15px]"
                    onClick={() => goToPage(effectivePage - 1)}
                    disabled={effectivePage <= 1}
                  >
                    {t('Trước', 'Anterior')}
                  </Button>
                  {pageWindow.map((page) => (
                    <Button
                      key={page}
                      size="sm"
                      variant="outline"
                      className={cn(
                        'h-10 min-h-10 min-w-10 border-primary/25 px-3 text-sm font-semibold shadow-sm sm:min-w-11 sm:text-[15px]',
                        page === effectivePage
                          ? 'border-primary/50 bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
                          : 'bg-card text-foreground hover:bg-primary/[0.08]'
                      )}
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-10 min-h-10 border-primary/30 bg-background px-4 text-sm font-semibold text-foreground shadow-sm hover:bg-primary/[0.08] sm:text-[15px]"
                    onClick={() => goToPage(effectivePage + 1)}
                    disabled={effectivePage >= totalPages}
                  >
                    {t('Sau', 'Siguiente')}
                  </Button>
                </div>
              </div>
            )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Materials;
