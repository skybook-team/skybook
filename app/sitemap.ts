import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://skybookfare.com'
  return [
    { url: base,                  lastModified: new Date(), changeFrequency: 'daily', priority: 1   },
    { url: `${base}/search`,      lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/about`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/contact`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/help`,        lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/baggage`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/privacy`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${base}/terms`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ]
}
