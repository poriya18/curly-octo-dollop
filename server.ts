import express from "express";
import path from "path";
import axios from "axios";
import * as cheerio from "cheerio";
import cors from "cors";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API constraints check:
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/search", async (req, res) => {
    try {
      const q = req.query.q || '';
      if (!q) {
        return res.json({ results: [] });
      }
      
      const response = await axios.get(`https://kashoob.com/search?q=${encodeURIComponent(q as string)}`);
      const $ = cheerio.load(response.data);
      
      const results: any[] = [];
      $('.content-item').each((i, el) => {
        const linkTag = $(el).find('a').first();
        const href = linkTag.attr('href');
        const img = $(el).find('img').attr('src');
        let rawText = $(el).text().replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
        
        let title = '';
        let subtitle = '';
        
        // Find elements with text to distinguish Title and Subtitle
        const bodyText = $(el).find('.content-item-body').text().trim().replace(/\n/g, ' ');
        if (bodyText) {
          // split by logic if possible or just use it
          title = bodyText.replace(/\s+/g, ' ').trim();
        } else {
          title = rawText;
        }

        // To make it beautiful, let's extract the singer or use rawText as subtitle
        if (href && title) {
          results.push({ 
            id: href, 
            href, 
            title, 
            img, 
            subtitle: rawText !== title ? rawText.replace(title, '').trim() : '' 
          });
        }
      });
      
      // Filter out non-audio/video items
      const validResults = results.filter(r => r.href.includes('/audio/') || r.href.includes('/video/'));
      
      res.json({ results: validResults });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ error: 'Search failed' });
    }
  });

  app.post("/api/track", async (req, res) => {
    try {
      const { href } = req.body;
      if (!href) return res.status(400).json({ error: 'No href provided' });

      // make sure href is an absolute url to kashoob
      const targetUrl = href.startsWith('http') ? href : `https://kashoob.com${href}`;
      
      const response = await axios.get(targetUrl);
      const $ = cheerio.load(response.data);
      
      let mediaUrl = '';
      let isVideo = false;
      $('audio, video').each((i, el) => {
        if (el.tagName.toLowerCase() === 'video') isVideo = true;
        const src = $(el).attr('src');
        if (src) mediaUrl = src;
        $(el).find('source').each((j, sel) => {
          const s = $(sel).attr('src');
          if (s) mediaUrl = s;
        });
      });
      
      const pageTitle = $('title').text().replace('- کآشوب', '').trim();
      res.json({ mediaUrl, title: pageTitle, isVideo });
    } catch (error) {
      console.error('Track fetch error:', error);
      res.status(500).json({ error: 'Track fetch failed' });
    }
  });

  app.get("/api/stream", async (req, res) => {
    try {
      const { url } = req.query;
      if (!url) return res.status(400).json({ error: 'No url provided' });

      const targetUrl = url as string;
      const headers: Record<string, string> = {};
      if (req.headers.range) {
        headers['range'] = req.headers.range;
      }

      const response = await axios({
        url: targetUrl,
        method: 'GET',
        responseType: 'stream',
        headers,
        validateStatus: (status) => status >= 200 && status < 400
      });

      res.status(response.status);
      res.setHeader('Content-Type', response.headers['content-type'] || 'audio/mpeg');
      res.setHeader('Accept-Ranges', 'bytes');
      if (response.headers['content-length']) {
        res.setHeader('Content-Length', response.headers['content-length']);
      }
      if (response.headers['content-range']) {
        res.setHeader('Content-Range', response.headers['content-range']);
      }
      
      response.data.pipe(res);
    } catch (error) {
      console.error('Stream error:', error);
      res.status(500).json({ error: 'Stream failed' });
    }
  });

  app.get("/api/download", async (req, res) => {
    try {
      const { url, title } = req.query;
      if (!url) return res.status(400).json({ error: 'No url provided' });

      const targetUrl = url as string;
      const parsedUrl = new URL(targetUrl);
      const filename = title ? `${title}${path.extname(parsedUrl.pathname) || '.mp3'}` : path.basename(parsedUrl.pathname);

      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
      
      const response = await axios({
        url: targetUrl,
        method: 'GET',
        responseType: 'stream'
      });

      response.data.pipe(res);
    } catch (error) {
      console.error('Download error:', error);
      res.status(500).json({ error: 'Download failed' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
