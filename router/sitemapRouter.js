import express from "express";

const router = express.Router();

router.get("/sitemap.xml", async (req, res) => {
  try {
    const FRONTEND_URL = "https://blogs.bablukumar.online";
    const BACKEND_API = "https://my-portfolio-backend-5p6u.onrender.com/api/v1/blog/getall";

    // ✅ Fetch all blogs (without axios)
    const response = await fetch(BACKEND_API);
    const data = await response.json();
    const blogs = data.blogs || [];

    // ✅ Generate XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static pages
    const staticPages = [
      `${FRONTEND_URL}/`,
      `${FRONTEND_URL}/blog`,
    ];

    staticPages.forEach((url) => {
      xml += `  <url>\n`;
      xml += `    <loc>${url}</loc>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>1.0</priority>\n`;
      xml += `  </url>\n`;
    });

    // Dynamic blog URLs
    blogs.forEach((blog) => {
      xml += `  <url>\n`;
      xml += `    <loc>${FRONTEND_URL}/blog/${blog._id}</loc>\n`;
      xml += `    <lastmod>${new Date(blog.updatedAt).toISOString()}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    // ✅ Send as XML
    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (error) {
    console.error("Error generating sitemap:", error.message);
    res.status(500).send("Error generating sitemap");
  }
});

export default router;
