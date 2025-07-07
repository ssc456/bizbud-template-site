export function extractSiteId() {
  // First try to get from environment variable if available
  if (import.meta.env?.VITE_SITE_ID) {
    return import.meta.env.VITE_SITE_ID;
  }
  
  const hostname = window.location.hostname;
  const urlParams = new URLSearchParams(window.location.search);
  const siteParam = urlParams.get('site');
  
  // For local dev, prioritize query parameter
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return siteParam || 'default';
  }
  
  // For production, handle different EntryNets URL formats
  if (hostname.includes('.') && hostname.includes('entrynets.com')) {
    // Get the subdomain (everything before first dot)
    const subdomain = hostname.split('.')[0];

    // Extract the base site ID by removing known common EntryNets suffixes
    // This handles both "seven-site-three" and "seven-site-5vggcvu10-scotts-projects"
    
    // First, check if it's a GitHub user format (-username)
    if (subdomain.includes('-scotts-projects-')) {
      return subdomain.split('-scotts-projects-')[0];
    }
    
    // Split by hyphens
    const parts = subdomain.split('-');
    
    // If only one or two parts, return as is
    if (parts.length <= 2) return subdomain;
    
    // Otherwise, assume the last segment is a suffix added by Vercel
    // Join all parts except the last one
    return parts.slice(0, -1).join('-');
  }
  
  // If custom domain or can't determine, use query param or default
  return siteParam || hostname.split('.')[0] || 'default';
}

// Export original site ID directly (for use in admin forms)
export function getOriginalSiteId() {
  // First check environment variable
  if (import.meta.env?.VITE_SITE_ID) {
    return import.meta.env.VITE_SITE_ID;
  }
  
  // Then check query parameter
  const siteParam = new URLSearchParams(window.location.search).get('site');
  if (siteParam) return siteParam;
  
  // Extract from URL with our main function
  return extractSiteId();
}