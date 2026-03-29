import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/hooks/useLanguage';
import {
  getMaterialsBySubject,
  getSubjects,
  resolveMediaUrl,
  type MaterialItem,
  type Subject,
} from '@/lib/api';
import { cn, fileExtensionFromPath, formatFileSizeFromMb } from '@/lib/utils';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const ITEMS_PER_PAGE = 18;

const MATERIALS_ILLUSTRATION_SRC = '/brand/document.png';

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

  const readStorageKey = 'materials_read_ids_v1';

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearchQuery(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial `q` from URL only
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

        const rows =
          activeSubject === null
            ? (
                await Promise.all(subjects.map((subject) => getMaterialsBySubject(subject.id, lang)))
              ).flat()
            : await getMaterialsBySubject(activeSubject, lang);

        const uniqueRows = Array.from(new Map(rows.map((item) => [item.id, item])).values());
        if (!active) return;
        setMaterials(uniqueRows);
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error
            ? err.message
            : t('Không tải được tài liệu', 'No se pudo cargar materiales')
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
  }, [activeSubject, lang, subjects, t]);

  useEffect(() => {
    if (!subjects.length) {
      setSubjectMaterialCounts({});
      return;
    }

    let active = true;

    (async () => {
      try {
        const rowsBySubject = await Promise.all(
          subjects.map((subject) => getMaterialsBySubject(subject.id, lang))
        );
        if (!active) return;

        const nextCounts = subjects.reduce<Record<number, number>>((acc, subject, index) => {
          const rows = rowsBySubject[index] || [];
          acc[subject.id] = rows.length;
          return acc;
        }, {});

        setSubjectMaterialCounts(nextCounts);
      } catch {
        if (!active) return;
        setSubjectMaterialCounts({});
      }
    })();

    return () => {
      active = false;
    };
  }, [lang, subjects]);

  const activeSubjectInfo = useMemo(
    () => subjects.find((subject) => subject.id === activeSubject),
    [subjects, activeSubject]
  );

  const readMaterialSet = useMemo(() => new Set(readMaterialIds), [readMaterialIds]);

  const normalizeForSearch = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const filteredMaterials = useMemo(() => {
    const q = normalizeForSearch(searchQuery);
    return materials.filter((material) => {
      const byRead =
        readFilter === 'all'
          ? true
          : readFilter === 'read'
            ? readMaterialSet.has(material.id)
            : !readMaterialSet.has(material.id);
      if (!byRead) return false;
      if (!q) return true;
      const blob = normalizeForSearch(
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
  }, [materials, readFilter, readMaterialSet, searchQuery]);

  const readCounts = useMemo(() => {
    const done = materials.filter((material) => readMaterialSet.has(material.id)).length;
    return {
      all: materials.length,
      read: done,
      unread: Math.max(materials.length - done, 0),
    };
  }, [materials, readMaterialSet]);

  const totalMaterialCount = useMemo(
    () => Object.values(subjectMaterialCounts).reduce((sum, count) => sum + Number(count || 0), 0),
    [subjectMaterialCounts]
  );

  const requestedSubjectId = useMemo(() => {
    const raw = Number(searchParams.get('subject'));
    if (!Number.isInteger(raw) || raw <= 0) return null;
    return raw;
  }, [searchParams]);

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
    if (prevSearchForPage.current === undefined) {
      prevSearchForPage.current = searchQuery;
      return;
    }
    if (prevSearchForPage.current === searchQuery) return;
    prevSearchForPage.current = searchQuery;
    setCurrentPage(1);
    const next = new URLSearchParams(searchParams);
    next.delete('page');
    setSearchParams(next, { replace: true });
  }, [searchQuery, searchParams, setSearchParams]);

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
                {t('Tài liệu', 'Materiales')}
              </p>
              <h1 className="mt-1.5 font-display text-[1.65rem] font-bold leading-tight tracking-tight text-foreground md:text-[2rem]">
                {t('Tài liệu học tập', 'Materiales de estudio')}
              </h1>
              <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-foreground/72 md:text-[0.97rem]">
                {t(
                  'Xem trực tiếp hoặc tải về tài liệu song ngữ để ôn tập',
                  'Visualiza directamente o descarga materiales bilingües para estudiar'
                )}
              </p>
              {activeSubjectInfo && (
                <p className="mt-3 text-[13px] text-foreground/70">
                  <span className="font-semibold text-foreground">{t('Chủ đề', 'Tema')}:</span>{' '}
                  {activeSubjectInfo.name}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex w-full flex-1 flex-col bg-background">
          <div className="w-full border-b border-primary/20 bg-card px-2 py-3.5 font-sans shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] sm:px-3">
            {!loadingSubjects && subjects.length > 0 && (
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:gap-4">
                <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
                  <div className="min-w-0 space-y-1.5">
                    <label
                      htmlFor="material-subject-filter"
                      className="block text-xs font-semibold uppercase tracking-[0.06em] text-primary/90"
                    >
                      {t('Chủ đề', 'Tema')}
                    </label>
                    <Select
                      value={activeSubject === null ? 'all' : String(activeSubject)}
                      onValueChange={(v) => applySubjectFilter(v === 'all' ? null : Number(v))}
                    >
                      <SelectTrigger
                        id="material-subject-filter"
                        className="h-9 w-full border-primary/25 bg-background text-sm font-medium text-foreground shadow-sm ring-1 ring-primary/10"
                      >
                        <SelectValue placeholder={t('Chọn chủ đề', 'Elige un tema')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          {t('Tất cả chủ đề', 'Todos los temas')} ({totalMaterialCount})
                        </SelectItem>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={String(subject.id)}>
                            {subject.name} ({subjectMaterialCounts[subject.id] || 0})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="min-w-0 space-y-1.5 sm:col-span-2 lg:col-span-1">
                    <label
                      htmlFor="material-search"
                      className="block text-xs font-semibold uppercase tracking-[0.06em] text-primary/90"
                    >
                      {t('Tìm kiếm', 'Buscar')}
                    </label>
                    <Input
                      id="material-search"
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('Tiêu đề, mô tả…', 'Título, descripción…')}
                      className="h-9 border-primary/25 bg-background px-3 text-sm font-medium text-foreground placeholder:text-muted-foreground/80 shadow-sm ring-1 ring-primary/10"
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className="shrink-0 lg:ml-auto lg:flex lg:flex-col lg:items-end">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.06em] text-primary/90 lg:text-right">
                    {t('Trạng thái đọc', 'Estado')}
                  </span>
                  <div
                    className="flex w-full flex-nowrap gap-0.5 rounded-full border border-primary/22 bg-primary/[0.1] p-1 shadow-sm lg:w-auto"
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
                          readFilter === key
                            ? 'border border-primary/20 bg-primary text-primary-foreground shadow-sm'
                            : 'border border-transparent text-primary hover:bg-background/75 hover:shadow-sm'
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

          <div className="w-full flex-1 px-2 pb-0 pt-4 sm:px-3 sm:pt-5">
            {!loadingSubjects && error && <p className="text-sm text-destructive mb-3">{error}</p>}

            {activeSubjectInfo?.description && (
              <p className="mb-4 max-w-3xl text-[13px] leading-relaxed text-foreground/68">
                {activeSubjectInfo.description}
              </p>
            )}

            {loadingMaterials && (
              <p className="text-sm text-muted-foreground">
                {t('Đang tải tài liệu...', 'Cargando materiales...')}
              </p>
            )}

            {!loadingMaterials && materials.length === 0 && !loadingSubjects && subjects.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {t('Chưa có tài liệu', 'No hay materiales')}
              </p>
            )}
            {!loadingMaterials && materials.length > 0 && filteredMaterials.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {t('Không có tài liệu phù hợp.', 'No hay materiales que coincidan.')}
              </p>
            )}

            {!loadingMaterials && filteredMaterials.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-5">
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
            )}

            {!loadingMaterials && filteredMaterials.length > 0 && (
              <div className="mt-8 -mx-2 flex flex-col items-center gap-4 border-t-2 border-primary/25 bg-card px-3 py-5 shadow-[0_-2px_12px_rgba(45,38,36,0.06)] sm:-mx-3 sm:gap-5 sm:px-4">
                <p className="text-center text-sm font-semibold tabular-nums text-foreground sm:text-[15px]">
                  {t('Trang', 'Página')} {effectivePage}/{totalPages} · {filteredMaterials.length}{' '}
                  {t('tài liệu', 'materiales')}
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

      <Footer />
    </div>
  );
};

export default Materials;
