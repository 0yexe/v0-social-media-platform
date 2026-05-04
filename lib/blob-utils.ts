/**
 * Utility functions for working with Vercel Blob storage
 */

/**
 * Get the URL to serve a private blob file
 * @param pathname - The pathname returned from blob upload
 * @returns URL to access the file through our API
 */
export function getBlobUrl(pathname: string | null | undefined): string {
  if (!pathname) return "/placeholder.svg"
  
  // If it's already a full URL (legacy data), return as is
  if (pathname.startsWith("http://") || pathname.startsWith("https://")) {
    return pathname
  }
  
  // For blob pathnames, route through our API
  return `/api/file?pathname=${encodeURIComponent(pathname)}`
}

/**
 * Check if a pathname is a video file
 * @param pathname - The file pathname or URL
 * @returns boolean indicating if it's a video
 */
export function isVideoFile(pathname: string | null | undefined): boolean {
  if (!pathname) return false
  const lowerPath = pathname.toLowerCase()
  return lowerPath.endsWith(".mp4") || lowerPath.endsWith(".webm") || lowerPath.endsWith(".mov")
}

/**
 * Get file extension from pathname
 * @param pathname - The file pathname
 * @returns File extension without dot
 */
export function getFileExtension(pathname: string): string {
  return pathname.split(".").pop()?.toLowerCase() || ""
}
