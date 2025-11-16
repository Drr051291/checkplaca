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

        const baseUrl = window.location.origin;
        const currentDate = new Date().toISOString();

        // Build sitemap XML
        const urlEntries = [
          // Homepage
          `  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`,
          // Blog index
          `  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`,
          // Individual blog posts
          ...(posts || []).map((post) => {
            const lastmod = post.updated_at || post.published_at || currentDate;
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
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urlEntries.join("\n")}
</urlset>`;

        setXml(sitemapXml);
      } catch (error) {
        console.error("Error generating sitemap:", error);
      }
    };

    generateSitemap();
  }, []);

  useEffect(() => {
    if (xml) {
      // Replace page content with XML
      const htmlElement = document.documentElement;
      htmlElement.innerHTML = `<pre style="word-wrap: break-word; white-space: pre-wrap;">${xml.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>`;
    }
  }, [xml]);

  return (
    <div style={{ fontFamily: "monospace", whiteSpace: "pre-wrap", padding: "20px" }}>
      {xml || "Generating sitemap..."}
    </div>
  );
};

export default Sitemap;
