export function extractSiteId() {
  const hostname = window.location.hostname;
  const urlParams = new URLSearchParams(window.location.search);
  const siteParam = urlParams.get('site');
  
  let siteId;
  if (hostname.includes('.') && !hostname.startsWith('localhost') && !hostname.startsWith('127.0.0.1')) {
    // Extract base name from Vercel URL pattern (handles fourth-site-123abc.vercel.app)
    const subdomain = hostname.split('.')[0];
    // Remove any Vercel-added suffixes (after last dash with random chars)
    siteId = subdomain.replace(/-[a-z0-9]{7,}$/i, '');
  } else {
    // For localhost, use query param or default
    siteId = siteParam || 'default';
  }
  
  return siteId;
}