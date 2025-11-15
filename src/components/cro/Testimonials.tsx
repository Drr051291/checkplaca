import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Testimonials = () => {
  const testimonials = [
    {
      name: "Carlos Silva",
      initials: "CS",
      text: "Descobri débitos que o vendedor não mencionou. Economizei mais de R$ 3.000! Vale cada centavo.",
      rating: 5
    },
    {
      name: "Ana Paula",
      initials: "AP",
      text: "Relatório muito completo! Todas as informações que eu precisava para comprar meu carro usado com segurança.",
      rating: 5
    },
    {
      name: "Roberto Mendes",
      initials: "RM",
      text: "Rápido e confiável. Em 5 minutos tinha o relatório completo na mão. Recomendo!",
      rating: 5
    }
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {testimonials.map((testimonial, i) => (
        <Card key={i} className="border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Avatar className="shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {testimonial.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-semibold text-sm">{testimonial.name}</p>
                  <div className="flex gap-0.5">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="w-3 h-3 fill-primary text-primary" />
                    ))}
                  </div>
                </div>
                <Quote className="w-4 h-4 text-muted-foreground mb-1" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {testimonial.text}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
