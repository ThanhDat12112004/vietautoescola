import { BookOpen, Download, Eye, FileText } from '@/components/BrandIcons';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

const Materials = () => {
  const { t, lang } = useLanguage();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeSubject, setActiveSubject] = useState<number | null>(null);
  const [readFilter, setReadFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [readMaterialIds, setReadMaterialIds] = useState<number[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [error, setError] = useState('');
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState('');
  const [selectedPdfTitle, setSelectedPdfTitle] = useState('');

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

  const openMaterialViewer = (material: MaterialItem, language: 'vi' | 'es') => {
    const filePath = language === 'es' ? material.file_path_es : material.file_path_vi;
    const title = language === 'es' ? material.title_es : material.title_vi;
    markMaterialAsRead(material.id);
    setSelectedPdfUrl(resolveMediaUrl(filePath));
    setSelectedPdfTitle(title);
    setPdfViewerOpen(true);
  };

  const downloadMaterial = (material: MaterialItem, language: 'vi' | 'es') => {
    const filePath = language === 'es' ? material.file_path_es : material.file_path_vi;
    markMaterialAsRead(material.id);
    window.open(resolveMediaUrl(filePath), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="app-page min-h-screen flex flex-col bg-[radial-gradient(circle_at_15%_20%,rgba(255,214,224,0.45),transparent_42%),radial-gradient(circle_at_85%_10%,rgba(255,228,171,0.45),transparent_35%),linear-gradient(180deg,#f9edf1_0%,#f4f7ff_55%,#f7eef5_100%)]">
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
        </div>
      </div>

      <div className="flex-1 px-2 pb-5 md:px-4 md:pb-8">
        <div className="container section-panel">
          {loadingSubjects && (
            <p className="text-sm text-muted-foreground">{t('Đang tải...', 'Cargando...')}</p>
          )}
          {!loadingSubjects && error && <p className="text-sm text-destructive mb-3">{error}</p>}

          {!loadingSubjects && subjects.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2 md:gap-2.5">
              <Button
                size="sm"
                variant={readFilter === 'all' ? 'default' : 'outline'}
                className="h-8 rounded-full px-3 text-xs md:h-9 md:text-sm"
                onClick={() => setReadFilter('all')}
              >
                {t('Tất cả trạng thái', 'Todos los estados')}
              </Button>
              <Button
                size="sm"
                variant={readFilter === 'read' ? 'default' : 'outline'}
                className="h-8 rounded-full px-3 text-xs md:h-9 md:text-sm"
                onClick={() => setReadFilter('read')}
              >
                {t('Đã đọc', 'Leidos')}
              </Button>
              <Button
                size="sm"
                variant={readFilter === 'unread' ? 'default' : 'outline'}
                className="h-8 rounded-full px-3 text-xs md:h-9 md:text-sm"
                onClick={() => setReadFilter('unread')}
              >
                {t('Chưa đọc', 'No leidos')}
              </Button>
            </div>
          )}

          {!loadingSubjects && subjects.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2 md:gap-2.5">
              <Button
                size="sm"
                variant={activeSubject === null ? 'default' : 'outline'}
                className="h-8 rounded-full px-3 text-xs md:h-9 md:text-sm"
                onClick={() => setActiveSubject(null)}
              >
                {t('Tất cả', 'Todos')}
              </Button>
              {subjects.map((subject) => (
                <Button
                  key={subject.id}
                  size="sm"
                  variant={activeSubject === subject.id ? 'default' : 'outline'}
                  className="h-8 rounded-full px-3 text-xs md:h-9 md:text-sm"
                  onClick={() => setActiveSubject(subject.id)}
                >
                  {subject.name}
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
            {filteredMaterials.map((material, i) => (
              <motion.div
                key={material.id}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
              >
                <Card className="card-hover glassmorph-card h-full border-border/50">
                  <CardContent className="flex h-full flex-col p-4 md:p-5">
                    <div className="mb-3 flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <FileText className="h-5 w-5 text-primary md:h-6 md:w-6" />
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

                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground md:text-xs">
                        <span className="uppercase font-bold px-1.5 py-0.5 rounded bg-muted">
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
                          className="h-8 gap-1 text-xs md:h-9 md:text-sm"
                          onClick={() => openMaterialViewer(material, lang === 'es' ? 'es' : 'vi')}
                        >
                          <Eye className="h-3 w-3" />
                          {t('Xem', 'Ver')}
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="h-8 gap-1 text-xs md:h-9 md:text-sm"
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
        </div>
      </div>

      <Dialog open={pdfViewerOpen} onOpenChange={setPdfViewerOpen}>
        <DialogContent className="h-[85vh] max-w-6xl overflow-hidden border border-primary/20 p-0">
          <DialogHeader className="border-b border-border/60 px-4 py-3">
            <DialogTitle className="pr-8 font-display text-base font-bold text-[#64172f] md:text-lg">
              {selectedPdfTitle || t('Xem tài liệu PDF', 'Ver material PDF')}
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              {t('Xem trực tiếp tài liệu ngay trên web', 'Visualiza el material directamente en la web')}
            </DialogDescription>
          </DialogHeader>

          <div className="h-[calc(85vh-86px)] w-full bg-white">
            {selectedPdfUrl ? (
              <iframe
                title={selectedPdfTitle || 'PDF viewer'}
                src={selectedPdfUrl}
                className="h-full w-full"
              />
            ) : null}
          </div>

          <div className="absolute bottom-3 right-3">
            <Button
              size="sm"
              className="bg-[linear-gradient(135deg,#7a2038_0%,#b23d58_65%,#ca8a04_100%)] text-white hover:opacity-95"
              onClick={() => selectedPdfUrl && window.open(selectedPdfUrl, '_blank', 'noopener,noreferrer')}
            >
              {t('Mở tab mới', 'Abrir en nueva pestaña')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Materials;
