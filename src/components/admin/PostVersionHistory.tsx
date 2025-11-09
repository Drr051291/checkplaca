import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  History,
  RotateCcw,
  Eye,
  Clock,
  User,
  ChevronRight,
  Loader2,
  FileText
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Version {
  id: string;
  version_number: number;
  title: string;
  content: string;
  excerpt: string;
  status: string;
  created_at: string;
  change_summary: string | null;
}

interface PostVersionHistoryProps {
  postId: string;
  currentTitle: string;
  onRestore: (version: Version) => void;
}

export const PostVersionHistory = ({ postId, currentTitle, onRestore }: PostVersionHistoryProps) => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewVersion, setPreviewVersion] = useState<Version | null>(null);
  const [restoreVersion, setRestoreVersion] = useState<Version | null>(null);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    fetchVersions();
  }, [postId]);

  const fetchVersions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_post_versions')
        .select('*')
        .eq('post_id', postId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      setVersions(data || []);
    } catch (error) {
      console.error('Erro ao buscar versões:', error);
      toast.error('Erro ao carregar histórico de versões');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!restoreVersion) return;

    setRestoring(true);
    try {
      await onRestore(restoreVersion);
      toast.success(`Versão ${restoreVersion.version_number} restaurada com sucesso!`);
      setRestoreVersion(null);
    } catch (error) {
      console.error('Erro ao restaurar versão:', error);
      toast.error('Erro ao restaurar versão');
    } finally {
      setRestoring(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeDiff = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    return formatDate(dateString);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="text-center py-8">
        <History className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">
          Nenhuma versão anterior ainda
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          As versões serão criadas automaticamente quando você editar o post
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Histórico de Versões</h3>
          </div>
          <Badge variant="secondary">
            {versions.length} {versions.length === 1 ? 'versão' : 'versões'}
          </Badge>
        </div>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {versions.map((version, index) => (
              <Card
                key={version.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          v{version.version_number}
                        </Badge>
                        <Badge variant={version.status === 'published' ? 'default' : 'secondary'}>
                          {version.status}
                        </Badge>
                      </div>
                      
                      <h4 className="font-medium truncate mb-1">
                        {version.title}
                      </h4>
                      
                      {version.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {version.excerpt}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{getTimeDiff(version.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPreviewVersion(version)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => setRestoreVersion(version)}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewVersion} onOpenChange={() => setPreviewVersion(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Versão {previewVersion?.version_number} - Preview
            </DialogTitle>
          </DialogHeader>

          {previewVersion && (
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {/* Metadata */}
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Status:</span>{' '}
                      <Badge variant={previewVersion.status === 'published' ? 'default' : 'secondary'}>
                        {previewVersion.status}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Data:</span>{' '}
                      {formatDate(previewVersion.created_at)}
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-2xl font-bold mb-2">{previewVersion.title}</h3>
                  {previewVersion.excerpt && (
                    <p className="text-lg text-muted-foreground">{previewVersion.excerpt}</p>
                  )}
                </div>

                <Separator />

                {/* Content */}
                <div
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: previewVersion.content }}
                />
              </div>
            </ScrollArea>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewVersion(null)}>
              Fechar
            </Button>
            {previewVersion && (
              <Button onClick={() => {
                setRestoreVersion(previewVersion);
                setPreviewVersion(null);
              }}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Restaurar Esta Versão
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={!!restoreVersion} onOpenChange={() => setRestoreVersion(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restaurar Versão Anterior</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja restaurar a versão {restoreVersion?.version_number}?
              <div className="mt-3 p-3 bg-muted rounded-lg">
                <p className="font-medium text-foreground mb-1">
                  {restoreVersion?.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  Criada em: {restoreVersion && formatDate(restoreVersion.created_at)}
                </p>
              </div>
              <p className="mt-3 text-sm">
                A versão atual será salva no histórico antes da restauração.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={restoring}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore} disabled={restoring}>
              {restoring ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Restaurando...
                </>
              ) : (
                <>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Restaurar
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
