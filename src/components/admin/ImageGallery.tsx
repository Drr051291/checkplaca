import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Trash2,
  Check,
  Loader2
} from 'lucide-react';
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

interface ImageFile {
  name: string;
  url: string;
  createdAt: string;
  size: number;
}

interface ImageGalleryProps {
  onSelectImage: (url: string) => void;
  selectedImage?: string;
}

export const ImageGallery = ({ onSelectImage, selectedImage }: ImageGalleryProps) => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [filteredImages, setFilteredImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteImageName, setDeleteImageName] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const imagesPerPage = 12;

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('blog-images')
        .list('', {
          limit: 1000,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) throw error;

      const imageFiles: ImageFile[] = (data || [])
        .filter(file => file.name !== '.emptyFolderPlaceholder')
        .map(file => {
          const { data: { publicUrl } } = supabase.storage
            .from('blog-images')
            .getPublicUrl(file.name);

          return {
            name: file.name,
            url: publicUrl,
            createdAt: file.created_at || '',
            size: file.metadata?.size || 0
          };
        });

      setImages(imageFiles);
      setFilteredImages(imageFiles);
    } catch (error) {
      console.error('Erro ao carregar imagens:', error);
      toast.error('Erro ao carregar galeria de imagens');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  useEffect(() => {
    const filtered = images.filter(img =>
      img.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredImages(filtered);
    setCurrentPage(1);
  }, [searchQuery, images]);

  const handleDeleteImage = async () => {
    if (!deleteImageName) return;

    setDeleting(true);
    try {
      const { error } = await supabase.storage
        .from('blog-images')
        .remove([deleteImageName]);

      if (error) throw error;

      toast.success('Imagem deletada com sucesso');
      fetchImages();
    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      toast.error('Erro ao deletar imagem');
    } finally {
      setDeleting(false);
      setDeleteImageName(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Data desconhecida';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Pagination
  const totalPages = Math.ceil(filteredImages.length / imagesPerPage);
  const startIndex = (currentPage - 1) * imagesPerPage;
  const endIndex = startIndex + imagesPerPage;
  const currentImages = filteredImages.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          Nenhuma imagem na galeria ainda
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Faça upload ou arraste imagens para o editor
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome de arquivo..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {filteredImages.length} {filteredImages.length === 1 ? 'imagem' : 'imagens'}
        </span>
        {totalPages > 1 && (
          <span>
            Página {currentPage} de {totalPages}
          </span>
        )}
      </div>

      {/* Image Grid */}
      {currentImages.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Nenhuma imagem encontrada
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto pr-2">
          {currentImages.map((image) => (
            <Card
              key={image.name}
              className={`group relative cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-200 ${
                selectedImage === image.url ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => onSelectImage(image.url)}
            >
              {/* Image Preview */}
              <div className="aspect-square relative bg-muted">
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                
                {/* Selected Indicator */}
                {selectedImage === image.url && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <div className="bg-primary rounded-full p-2">
                      <Check className="h-6 w-6 text-primary-foreground" />
                    </div>
                  </div>
                )}

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteImageName(image.name);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Image Info */}
              <div className="p-2 bg-background">
                <p className="text-xs font-medium truncate" title={image.name}>
                  {image.name}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {formatFileSize(image.size)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(image.createdAt)}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Show first, last, current, and neighbors
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <Button
                    key={page}
                    variant={page === currentPage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                );
              } else if (
                page === currentPage - 2 ||
                page === currentPage + 2
              ) {
                return <span key={page} className="px-1">...</span>;
              }
              return null;
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteImageName} onOpenChange={() => setDeleteImageName(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar esta imagem? Esta ação não pode ser desfeita.
              {deleteImageName && (
                <p className="mt-2 font-mono text-sm break-all">
                  {deleteImageName}
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteImage} disabled={deleting}>
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deletando...
                </>
              ) : (
                'Deletar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
