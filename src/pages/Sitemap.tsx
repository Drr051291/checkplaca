import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Sitemap = () => {
  const [xml, setXml] = useState<string>("");

  useEffect(() => {
    const generateSitemap = async () => {
      try {
        // Fetch all published blog posts
        const { data: posts, error } = await supabase
          .from("blog_posts")
          .select("slug, updated_at, published_at")
          .eq("status", "published")
          .order("published_at", { ascending: false });

        if (error) throw error;

        const baseUrl = "https://checkplaca.lovable.app";
        const currentDate = new Date().toISOString().split('T')[0];

        // Build sitemap XML with proper formatting
        const urlEntries = [
          // Homepage - highest priority
          `  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`,
          // Blog index - high priority
          `  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`,
          // Individual blog posts
          ...(posts || []).map((post) => {
            const lastmod = (post.updated_at || post.published_at || currentDate).split('T')[0];
            return `  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
          }),
        ];

        const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlEntries.join("\n")}
</urlset>`;

        setXml(sitemapXml);
      } catch (error) {
        console.error("Error generating sitemap:", error);
        // Generate minimal sitemap on error
        const baseUrl = "https://checkplaca.lovable.app";
        const currentDate = new Date().toISOString().split('T')[0];
        const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;
        setXml(fallbackXml);
      }
    };

    generateSitemap();
  }, []);

  useEffect(() => {
    if (xml) {
      // Set proper content type and replace page content
      document.documentElement.innerHTML = '';
      
      // Create a pre element to display the XML
      const pre = document.createElement('pre');
      pre.style.cssText = 'word-wrap: break-word; white-space: pre-wrap; margin: 0; padding: 20px; font-family: monospace; font-size: 14px;';
      pre.textContent = xml;
      
      document.body.appendChild(pre);
      
      // Set content type hint for crawlers
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Type';
      meta.content = 'application/xml; charset=utf-8';
      document.head.appendChild(meta);
    }
  }, [xml]);

  return (
    <div style={{ fontFamily: "monospace", whiteSpace: "pre-wrap", padding: "20px" }}>
      {xml || "Generating sitemap..."}
    </div>
  );
};

export default Sitemap;
