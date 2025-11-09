import { useEditor, EditorContent } from '@tiptap/react';
import { ImageGallery } from './ImageGallery';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Image as ImageIcon,
  Link as LinkIcon,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  Eye,
  Upload,
  Loader2
} from 'lucide-react';
import { useState, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export const RichTextEditor = ({ content, onChange, placeholder }: RichTextEditorProps) => {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline hover:text-primary/80',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Escreva o conteúdo do post aqui...',
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[400px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione apenas imagens');
      return null;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo: 5MB');
      return null;
    }

    setUploadingImage(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      toast.success('Imagem carregada com sucesso!');
      return publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao fazer upload da imagem');
      return null;
    } finally {
      setUploadingImage(false);
    }
  }, []);

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    const publicUrl = await uploadImage(file);
    if (publicUrl) {
      editor.chain().focus().setImage({ src: publicUrl }).run();
    }
  }, [editor, uploadImage]);

  const handleDrop = useCallback(async (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    setIsDragging(false);
    dragCounter.current = 0;

    if (!editor) return;

    const files = Array.from(event.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      toast.error('Nenhuma imagem encontrada');
      return;
    }

    // Upload all images
    for (const file of imageFiles) {
      const publicUrl = await uploadImage(file);
      if (publicUrl) {
        editor.chain().focus().setImage({ src: publicUrl }).run();
      }
    }
  }, [editor, uploadImage]);

  const handleDragEnter = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounter.current++;
    
    if (event.dataTransfer.items && event.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounter.current--;
    
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const addImageByUrl = useCallback(() => {
    if (!imageUrl) return;
    
    if (editor) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
    }
    
    setImageUrl('');
    setShowImageDialog(false);
  }, [editor, imageUrl]);

  const setLink = useCallback(() => {
    if (!linkUrl) return;

    if (editor) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
    }

    setLinkUrl('');
    setShowLinkDialog(false);
  }, [editor, linkUrl]);

  if (!editor) {
    return null;
  }

  const MenuButton = ({ onClick, active, disabled, children, title }: any) => (
    <Button
      type="button"
      variant={active ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="h-8 w-8 p-0"
    >
      {children}
    </Button>
  );

  return (
    <div className="space-y-4">
      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-4">
          {/* Toolbar */}
          <Card className="p-2">
            <div className="flex flex-wrap gap-1">
              {/* Text Formatting */}
              <MenuButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                active={editor.isActive('bold')}
                title="Negrito"
              >
                <Bold className="h-4 w-4" />
              </MenuButton>

              <MenuButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                active={editor.isActive('italic')}
                title="Itálico"
              >
                <Italic className="h-4 w-4" />
              </MenuButton>

              <MenuButton
                onClick={() => editor.chain().focus().toggleCode().run()}
                active={editor.isActive('code')}
                title="Código"
              >
                <Code className="h-4 w-4" />
              </MenuButton>

              <div className="w-px h-8 bg-border mx-1" />

              {/* Headings */}
              <MenuButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                active={editor.isActive('heading', { level: 1 })}
                title="Título 1"
              >
                <Heading1 className="h-4 w-4" />
              </MenuButton>

              <MenuButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                active={editor.isActive('heading', { level: 2 })}
                title="Título 2"
              >
                <Heading2 className="h-4 w-4" />
              </MenuButton>

              <MenuButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                active={editor.isActive('heading', { level: 3 })}
                title="Título 3"
              >
                <Heading3 className="h-4 w-4" />
              </MenuButton>

              <div className="w-px h-8 bg-border mx-1" />

              {/* Lists */}
              <MenuButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                active={editor.isActive('bulletList')}
                title="Lista com marcadores"
              >
                <List className="h-4 w-4" />
              </MenuButton>

              <MenuButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                active={editor.isActive('orderedList')}
                title="Lista numerada"
              >
                <ListOrdered className="h-4 w-4" />
              </MenuButton>

              <MenuButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                active={editor.isActive('blockquote')}
                title="Citação"
              >
                <Quote className="h-4 w-4" />
              </MenuButton>

              <div className="w-px h-8 bg-border mx-1" />

              {/* Insert Elements */}
              <MenuButton
                onClick={() => setShowLinkDialog(true)}
                title="Adicionar link"
              >
                <LinkIcon className="h-4 w-4" />
              </MenuButton>

              <MenuButton
                onClick={() => setShowImageDialog(true)}
                title="Adicionar imagem"
              >
                <ImageIcon className="h-4 w-4" />
              </MenuButton>

              <MenuButton
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                title="Linha horizontal"
              >
                <Minus className="h-4 w-4" />
              </MenuButton>

              <div className="w-px h-8 bg-border mx-1" />

              {/* History */}
              <MenuButton
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                title="Desfazer"
              >
                <Undo className="h-4 w-4" />
              </MenuButton>

              <MenuButton
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                title="Refazer"
              >
                <Redo className="h-4 w-4" />
              </MenuButton>
            </div>
          </Card>

          {/* Editor with Drag & Drop */}
          <div 
            className="relative"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
          >
            <Card className={`border-2 transition-all duration-200 ${
              isDragging 
                ? 'border-primary bg-primary/5 shadow-lg' 
                : 'border-border focus-within:border-primary'
            }`}>
              <EditorContent editor={editor} />
            </Card>

            {/* Drag & Drop Overlay */}
            {isDragging && (
              <div className="absolute inset-0 flex items-center justify-center bg-primary/10 backdrop-blur-sm border-2 border-dashed border-primary rounded-lg pointer-events-none">
                <div className="text-center p-8 bg-background/90 rounded-lg shadow-lg">
                  <Upload className="h-16 w-16 text-primary mx-auto mb-4 animate-bounce" />
                  <p className="text-lg font-semibold text-primary">
                    Solte as imagens aqui
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Suporta múltiplas imagens • Máx: 5MB cada
                  </p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <Card className="p-8">
            <div 
              className="prose prose-lg dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: content || '<p class="text-muted-foreground">Nada para visualizar ainda...</p>' }}
            />
          </Card>
        </TabsContent>
      </Tabs>

      {/* Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="link-url">URL do Link</Label>
              <Input
                id="link-url"
                placeholder="https://exemplo.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    setLink();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={setLink}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Adicionar Imagem</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="gallery" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="gallery">Galeria</TabsTrigger>
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="url">URL</TabsTrigger>
            </TabsList>

            <TabsContent value="gallery" className="flex-1 overflow-hidden">
              <ImageGallery
                onSelectImage={(url) => {
                  if (editor) {
                    editor.chain().focus().setImage({ src: url }).run();
                    setShowImageDialog(false);
                  }
                }}
              />
            </TabsContent>

            <TabsContent value="upload" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image-upload">Fazer Upload de Imagem</Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
                <p className="text-xs text-muted-foreground">
                  Tamanho máximo: 5MB • Formatos: JPG, PNG, GIF, WebP
                </p>
              </div>
              
              {uploadingImage && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Fazendo upload...
                </div>
              )}
            </TabsContent>

            <TabsContent value="url" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image-url">URL da Imagem</Label>
                <Input
                  id="image-url"
                  placeholder="https://exemplo.com/imagem.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addImageByUrl();
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Cole o link de uma imagem da internet
                </p>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowImageDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={addImageByUrl} disabled={!imageUrl}>
                  Adicionar Imagem
                </Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};
