import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://muse-music.example.com';
  const isDevDomain = /dev\.musemusic\.phitik\.com$/i.test(siteUrl);

  if (isDevDomain) {
    // บน dev domain ไม่ให้สร้าง sitemap
    return [];
  }

  const paths = ['', '/login', '/register', '/account'] as const;
  const routes: MetadataRoute.Sitemap = paths.map((route) => ({
    url: `${siteUrl}${route || '/'}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.7,
  }));

  return routes;
}


