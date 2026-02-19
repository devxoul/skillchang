import type { MetadataRoute } from 'next'
import { source } from '@/lib/source'

const baseUrl = 'https://skillpad.dev'

export default function sitemap(): MetadataRoute.Sitemap {
  const docPages = source.getPages().map((page) => ({
    url: `${baseUrl}${page.url}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [
    {
      url: baseUrl,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/download`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...docPages,
  ]
}
