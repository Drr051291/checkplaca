import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface StickyCTAProps {
  label: string;
  price: string;
  buttonText: string;
  onClick: () => void;
  showAfterScroll?: number;
  className?: string;
}

export const StickyCTA = ({ 
  label, 
  price, 
  buttonText, 
  onClick, 
  showAfterScroll = 300,
  className 
}: StickyCTAProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > showAfterScroll);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [showAfterScroll]);

  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border shadow-xl p-3 sm:hidden",
      "animate-slide-up",
      className
    )}>
      <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
        <div className="min-w-0 flex-1">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="font-bold text-primary animate-pulse-slow">{price}</div>
        </div>
        <Button 
          onClick={onClick}
          className={cn(
            "gradient-primary font-semibold shadow-strong shrink-0",
            "transition-all duration-200",
            "hover:shadow-xl hover:scale-105",
            "active:scale-95"
          )}
        >
          <Sparkles className="w-4 h-4 mr-1.5 animate-pulse" />
          {buttonText}
        </Button>
      </div>
    </div>
  );
};