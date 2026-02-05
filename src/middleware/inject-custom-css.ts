/**
 * Middleware to inject custom CSS into proxied gateway HTML responses
 * Improves readability and personalizes the Control UI
 */

const CUSTOM_CSS = `
<style id="samwise-custom-styles">
  /* Fix low-contrast text - make navigation readable */
  .nav-item, .nav-link, [class*="nav"] {
    color: #e0e0e0 !important;
  }
  
  /* Replace those tan/brown blocks with proper dark styling */
  .nav-section, [class*="section"] {
    background: rgba(255, 255, 255, 0.03) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
  }
  
  /* Personalize the header */
  h1:first-of-type, .app-title, [class*="title"]:first-of-type {
    &::after {
      content: " 🥔";
    }
  }
  
  /* Better contrast for sidebar items */
  aside a, aside button, .sidebar a, .sidebar button {
    color: #d0d0d0 !important;
    transition: color 0.2s;
  }
  
  aside a:hover, aside button:hover, .sidebar a:hover, .sidebar button:hover {
    color: #ffffff !important;
    background: rgba(255, 255, 255, 0.08) !important;
  }
  
  /* Active/selected state */
  aside a.active, aside button.active, .sidebar a.active, .sidebar button.active,
  [aria-current="page"] {
    color: #60a5fa !important;
    background: rgba(96, 165, 250, 0.1) !important;
  }
</style>
`;

export async function injectCustomCSS(response: Response): Promise<Response> {
  const contentType = response.headers.get('content-type') || '';
  
  // Only inject into HTML responses
  if (!contentType.includes('text/html')) {
    return response;
  }
  
  try {
    let html = await response.text();
    
    // Inject custom CSS before closing </head> tag
    if (html.includes('</head>')) {
      html = html.replace('</head>', `${CUSTOM_CSS}</head>`);
    }
    
    // Create new response with modified HTML
    return new Response(html, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch {
    // If anything goes wrong, return original response
    return response;
  }
}
