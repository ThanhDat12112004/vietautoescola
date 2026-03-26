import { BookOpen, Download, Eye, FileText } from '@/components/BrandIcons';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import {
  getMaterialsBySubject,
  getSubjects,
  resolveMediaUrl,
  type MaterialItem,
  type Subject,
} from '@/lib/api';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

const ITEMS_PER_PAGE = 20;

const Materials = () => {
  const { t, lang } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeSubject, setActiveSubject] = useState<number | null>(null);
  const [readFilter, setReadFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [subjectMaterialCounts, setSubjectMaterialCounts] = useState<Record<number, number>>({});
  const [readMaterialIds, setReadMaterialIds] = useState<number[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [error, setError] = useState('');

  const readStorageKey = 'materials_read_ids_v1';

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

  const filteredMaterials = useMemo(() => {
    return materials.filter((material) => {
      if (readFilter === 'all') return true;
      const isRead = readMaterialSet.has(material.id);
      return readFilter === 'read' ? isRead : !isRead;
    });
  }, [materials, readFilter, readMaterialSet]);

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

  return (
    <div className="app-page min-h-screen flex flex-col bg-[radial-gradient(circle_at_18%_12%,rgba(224,231,255,0.35),transparent_38%),radial-gradient(circle_at_84%_6%,rgba(226,232,240,0.45),transparent_34%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_55%,#f5f7fb_100%)]">
      <Navbar />
      <div className="px-2 py-4 md:px-4 md:py-6">
        <div className="container section-panel">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-7 w-7 text-primary" />
            <h1 className="font-display text-2xl md:text-3xl font-800">
              {t('Tài liệu học tập', 'Materiales de estudio')}
            </h1>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
            {t(
              'Xem trực tiếp hoặc tải về tài liệu song ngữ để ôn tập',
              'Visualiza directamente o descarga materiales bilingües para estudiar'
            )}
          </p>
          {activeSubjectInfo && (
            <p className="mt-2 text-sm font-semibold text-primary">
              {t('Chủ đề đang chọn', 'Tema seleccionado')}: {activeSubjectInfo.name}
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 px-2 pb-5 md:px-4 md:pb-8">
        <div className="container section-panel">
          {loadingSubjects && (
            <p className="text-sm text-muted-foreground">{t('Đang tải...', 'Cargando...')}</p>
          )}
          {!loadingSubjects && error && <p className="text-sm text-destructive mb-3">{error}</p>}

          {!loadingSubjects && subjects.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-slate-300/70 bg-slate-50/85 p-2 md:gap-2.5">
              <Button
                size="sm"
                variant={readFilter === 'all' ? 'default' : 'outline'}
                className="h-8 rounded-full px-3 text-xs md:h-9 md:text-sm"
                onClick={() => applyReadFilter('all')}
              >
                {t('Tất cả trạng thái', 'Todos los estados')} ({readCounts.all})
              </Button>
              <Button
                size="sm"
                variant={readFilter === 'read' ? 'default' : 'outline'}
                className="h-8 rounded-full px-3 text-xs md:h-9 md:text-sm"
                onClick={() => applyReadFilter('read')}
              >
                {t('Đã đọc', 'Leidos')} ({readCounts.read})
              </Button>
              <Button
                size="sm"
                variant={readFilter === 'unread' ? 'default' : 'outline'}
                className="h-8 rounded-full px-3 text-xs md:h-9 md:text-sm"
                onClick={() => applyReadFilter('unread')}
              >
                {t('Chưa đọc', 'No leidos')} ({readCounts.unread})
              </Button>
            </div>
          )}

          {!loadingSubjects && subjects.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-slate-300/70 bg-slate-50/85 p-2 md:gap-2.5">
              <Button
                size="sm"
                variant={activeSubject === null ? 'default' : 'outline'}
                className="h-8 rounded-full px-3 text-xs md:h-9 md:text-sm"
                onClick={() => applySubjectFilter(null)}
              >
                {t('Tất cả', 'Todos')} ({totalMaterialCount})
              </Button>
              {subjects.map((subject) => (
                <Button
                  key={subject.id}
                  size="sm"
                  variant={activeSubject === subject.id ? 'default' : 'outline'}
                  className="h-8 rounded-full px-3 text-xs md:h-9 md:text-sm"
                  onClick={() => applySubjectFilter(subject.id)}
                >
                  {subject.name} ({subjectMaterialCounts[subject.id] || 0})
                </Button>
              ))}
            </div>
          )}

          {activeSubjectInfo && (
            <p className="mb-5 text-xs text-muted-foreground md:text-sm">
              {activeSubjectInfo.description || ''}
            </p>
          )}

          {loadingMaterials && (
            <p className="text-sm text-muted-foreground">
              {t('Đang tải tài liệu...', 'Cargando materiales...')}
            </p>
          )}

          {!loadingMaterials && filteredMaterials.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {t('Chưa có tài liệu', 'No hay materiales')}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {pagedMaterials.map((material, i) => (
              <motion.div
                key={material.id}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
              >
                <Card className="card-hover h-full border-slate-300/70 bg-white shadow-sm">
                  <CardContent className="flex h-full flex-col p-4 md:p-5">
                    <div className="mb-3 flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                        <FileText className="h-5 w-5 text-slate-700 md:h-6 md:w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="mb-1 flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium md:text-xs ${
                              readMaterialSet.has(material.id)
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {readMaterialSet.has(material.id)
                              ? t('Đã đọc', 'Leido')
                              : t('Chưa đọc', 'No leido')}
                          </span>
                        </div>
                        <h3 className="mb-0.5 truncate font-display text-sm font-bold md:text-base">
                          {(lang === 'es' ? material.title_es : material.title_vi) ||
                            `${material.title_vi || '-'} / ${material.title_es || '-'}`}
                        </h3>
                        <p className="line-clamp-2 text-xs text-muted-foreground md:text-sm">
                          {(lang === 'es' ? material.description_es : material.description_vi) ||
                            t('Không có mô tả', 'Sin descripción')}
                        </p>
                      </div>
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-border/40 pt-3">
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground md:text-xs">
                        <span className="rounded-md bg-muted px-1.5 py-0.5 font-bold uppercase">
                          VI/ES
                        </span>
                        <span>
                          PDF
                          {material.file_size_mb_vi || material.file_size_mb_es
                            ? ` · VI ${material.file_size_mb_vi || '-'} MB · ES ${material.file_size_mb_es || '-'} MB`
                            : ''}
                        </span>
                      </div>
                      <div className="flex gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1 border-slate-300 bg-white text-xs text-slate-700 hover:bg-slate-50 md:h-9 md:text-sm"
                          onClick={() => openMaterialViewer(material, lang === 'es' ? 'es' : 'vi')}
                        >
                          <Eye className="h-3 w-3" />
                          {t('Xem', 'Ver')}
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="h-8 gap-1 border border-slate-800 bg-slate-900 text-xs text-white hover:bg-slate-800 md:h-9 md:text-sm"
                          onClick={() => downloadMaterial(material, lang === 'es' ? 'es' : 'vi')}
                        >
                          <Download className="h-3 w-3" />
                          {t('Tải', 'Descargar')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredMaterials.length > ITEMS_PER_PAGE && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
              <p className="text-xs text-slate-600 md:text-sm">
                {t('Trang', 'Página')} {effectivePage}/{totalPages} · {filteredMaterials.length}{' '}
                {t('tài liệu', 'materiales')}
              </p>
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 text-xs md:text-sm"
                  onClick={() => goToPage(effectivePage - 1)}
                  disabled={effectivePage <= 1}
                >
                  {t('Trước', 'Anterior')}
                </Button>
                {pageWindow.map((page) => (
                  <Button
                    key={page}
                    size="sm"
                    variant={page === effectivePage ? 'default' : 'outline'}
                    className="h-8 min-w-8 px-2 text-xs md:text-sm"
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 text-xs md:text-sm"
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

      <Footer />
    </div>
  );
};

export default Materials;
