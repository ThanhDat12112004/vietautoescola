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
import { BookOpen, Download, Eye, FileText } from 'lucide-react';
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
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoadingSubjects(true);
        const data = await getSubjects(lang);
        if (!active) return;
        setSubjects(data);
        setActiveSubject(data[0]?.id ?? null);
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
    if (!activeSubject) {
      setMaterials([]);
      return;
    }

    let active = true;

    (async () => {
      try {
        setLoadingMaterials(true);
        const rows = await getMaterialsBySubject(activeSubject, lang);
        if (!active) return;
        setMaterials(rows);
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
  }, [activeSubject, lang, t]);

  const activeSubjectInfo = useMemo(
    () => subjects.find((subject) => subject.id === activeSubject),
    [subjects, activeSubject]
  );

  const openMaterial = (filePath: string) => {
    window.open(resolveMediaUrl(filePath), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="bg-hero-pattern py-10 md:py-14">
        <div className="container">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-7 w-7 text-primary" />
            <h1 className="font-display text-2xl md:text-3xl font-800">
              {t('Tài liệu học tập', 'Materiales de estudio')}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {t(
              'Xem trực tiếp hoặc tải về tài liệu song ngữ để ôn tập',
              'Visualiza directamente o descarga materiales bilingües para estudiar'
            )}
          </p>
        </div>
      </div>

      <div className="container py-8 flex-1">
        {loadingSubjects && (
          <p className="text-sm text-muted-foreground">{t('Đang tải...', 'Cargando...')}</p>
        )}
        {!loadingSubjects && error && <p className="text-sm text-destructive mb-3">{error}</p>}

        {!loadingSubjects && subjects.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {subjects.map((subject) => (
              <Button
                key={subject.id}
                size="sm"
                variant={activeSubject === subject.id ? 'default' : 'outline'}
                className="rounded-full h-8 text-xs"
                onClick={() => setActiveSubject(subject.id)}
              >
                {subject.name}
              </Button>
            ))}
          </div>
        )}

        {activeSubjectInfo && (
          <p className="text-xs text-muted-foreground mb-4">
            {activeSubjectInfo.description || ''}
          </p>
        )}

        {loadingMaterials && (
          <p className="text-sm text-muted-foreground">
            {t('Đang tải tài liệu...', 'Cargando materiales...')}
          </p>
        )}

        {!loadingMaterials && materials.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {t('Chưa có tài liệu', 'No hay materiales')}
          </p>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {materials.map((material, i) => (
            <motion.div
              key={material.id}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              <Card className="card-hover h-full border-border/50">
                <CardContent className="p-4 flex flex-col h-full">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-bold text-sm mb-0.5 truncate">
                        {material.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {material.description || t('Không có mô tả', 'Sin descripción')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="uppercase font-bold px-1.5 py-0.5 rounded bg-muted">
                        {material.lang_code === 'vi' ? 'VI' : 'ES'}
                      </span>
                      <span>
                        PDF
                        {material.file_size_mb ? ` · ${material.file_size_mb} MB` : ''}
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 h-7 text-xs"
                        onClick={() => openMaterial(material.file_path)}
                      >
                        <Eye className="h-3 w-3" />
                        {t('Xem', 'Ver')}
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="gap-1 h-7 text-xs"
                        onClick={() => openMaterial(material.file_path)}
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

      <Footer />
    </div>
  );
};

export default Materials;
