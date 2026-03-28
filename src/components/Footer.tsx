const Footer = () => (
  <footer className="border-t border-border py-8 sm:py-12 bg-background" role="contentinfo">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
        <div>
          <h3 className="font-bold mb-4 bg-gradient-hero [-webkit-background-clip:text] [background-clip:text] [-webkit-text-fill-color:transparent] [text-fill-color:transparent]">
            Checkplaca
          </h3>
          <p className="text-sm text-muted-foreground">
            Consulta veicular com dados públicos disponíveis. Relatórios completos para compra segura de veículos usados.
          </p>
        </div>
        <nav aria-label="Links institucionais">
          <h4 className="font-semibold mb-4">Institucional</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="/sobre" className="hover:text-primary transition-smooth">Sobre nós</a></li>
            <li><a href="/como-funciona" className="hover:text-primary transition-smooth">Como funciona</a></li>
            <li><a href="/#faq" className="hover:text-primary transition-smooth">Dúvidas frequentes</a></li>
            <li><a href="/blog" className="hover:text-primary transition-smooth">Blog</a></li>
          </ul>
        </nav>
        <nav aria-label="Links de suporte">
          <h4 className="font-semibold mb-4">Suporte</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-primary transition-smooth">Ajuda</a></li>
            <li><a href="#" className="hover:text-primary transition-smooth">Contato</a></li>
            <li><a href="/#faq" className="hover:text-primary transition-smooth">FAQ</a></li>
          </ul>
        </nav>
        <nav aria-label="Links legais">
          <h4 className="font-semibold mb-4">Legal</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="/termos-de-uso" className="hover:text-primary transition-smooth">Termos de uso</a></li>
            <li><a href="/politica-de-privacidade" className="hover:text-primary transition-smooth">Política de privacidade</a></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-border pt-8 mt-8 text-center text-sm text-muted-foreground">
        <p className="mb-2">© {new Date().getFullYear()} Checkplaca. Todos os direitos reservados.</p>
        <p className="text-xs">
          Os dados fornecidos são obtidos de fontes públicas disponíveis. A Checkplaca é um serviço independente que não possui vínculo ou autorização de órgãos governamentais. Não nos responsabilizamos por eventuais inconsistências nas bases de dados consultadas.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
