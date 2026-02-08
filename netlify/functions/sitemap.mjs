import { query } from "./_lib/db.mjs";

function xml(s=""){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

export default async (event) => {
  const siteUrl = process.env.URL || process.env.DEPLOY_PRIME_URL || "";
  const base = siteUrl || "";

  const qs = event.queryStringParameters || {};
  const page = Math.max(1, Math.min(50, parseInt(qs.page || "1", 10) || 1));
  const limit = 2000;
  const offset = (page - 1) * limit;

  const { rows: totalRows } = await query(`SELECT COUNT(*)::int AS c FROM entities`);
  const total = totalRows[0]?.c || 0;

  const { rows } = await query(
    `SELECT slug FROM entities ORDER BY name ASC LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  const staticPages = ["/", "/search.html", "/names.html", "/about.html", "/partners.html", "/impressum.html", "/datenschutz.html", "/agb.html"];

  const urls = [];
  if (page === 1) {
    for (const p of staticPages) {
      urls.push(`<url><loc>${xml(base ? new URL(p, base).toString() : p)}</loc></url>`);
    }
  }
  for (const r of rows) {
    const p = `/file/${r.slug}`;
    urls.push(`<url><loc>${xml(base ? new URL(p, base).toString() : p)}</loc></url>`);
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=600, s-maxage=3600",
      "X-Sitemap-Page": String(page),
      "X-Sitemap-Total": String(total),
    },
    body
  };
};
