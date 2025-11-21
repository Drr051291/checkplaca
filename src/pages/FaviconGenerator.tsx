import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";
import { generateAndSetFavicon } from "@/utils/generateFavicon";
import { useToast } from "@/hooks/use-toast";

const FaviconGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    toast({
      title: "Gerando favicon...",
      description: "Isso pode levar alguns segundos.",
    });

    const success = await generateAndSetFavicon();
    
    setIsGenerating(false);

    if (success) {
      toast({
        title: "✅ Favicon gerado!",
        description: "O arquivo foi baixado. Salve-o como 'favicon.png' na pasta 'public/'.",
      });
    } else {
      toast({
        title: "Erro ao gerar favicon",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Gerar Favicon
          </CardTitle>
          <CardDescription>
            Clique no botão para gerar um favicon personalizado para o Checkplaca
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Gerar Favicon
              </>
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground mt-4">
            Após a geração, o arquivo será baixado automaticamente. 
            Salve-o como 'favicon.png' na pasta 'public/' do projeto.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FaviconGenerator;
