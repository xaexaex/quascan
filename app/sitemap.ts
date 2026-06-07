import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://www.quascan.xyz',
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },
    {
      url: 'https://www.quascan.xyz/blocks',
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.8,
    },
    {
      url: 'https://www.quascan.xyz/transactions',
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.8,
    },
    {
      url: 'https://www.quascan.xyz/validators',
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.7,
    },
  ];
}
