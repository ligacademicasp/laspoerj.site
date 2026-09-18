import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/area-interna/", "/login", "/recuperar-senha", "/nova-senha"],
    },
    sitemap: "https://laspoerj-site-djm2.vercel.app/sitemap.xml",
  };
}
