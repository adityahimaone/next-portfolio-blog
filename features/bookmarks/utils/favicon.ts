/**
 * Extracts clean domain name from a full URL.
 * e.g. "https://www.github.com/adityahimaone" -> "github.com"
 */
export function extractDomain(url: string): string {
  try {
    const formattedUrl = url.startsWith('http://') || url.startsWith('https://') 
      ? url 
      : `https://${url}`
    const parsed = new URL(formattedUrl)
    return parsed.hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

/**
 * Returns a high-res Google Favicon API URL for a target website domain.
 */
export function getFaviconUrl(url: string, customFaviconUrl?: string): string {
  if (customFaviconUrl && customFaviconUrl.trim().length > 0) {
    return customFaviconUrl.trim()
  }
  const domain = extractDomain(url)
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`
}
