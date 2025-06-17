// Debug function for preview mode
export function initializePreviewDebugging() {
  if (window.location.search.includes('preview=true')) {
    // Add a style to show when preview is active
    const style = document.createElement('style');
    style.textContent = `
      .preview-indicator {
        position: fixed;
        bottom: 10px;
        right: 10px;
        background: rgba(0,0,255,0.7);
        color: white;
        padding: 5px 10px;
        border-radius: 20px;
        font-size: 12px;
        z-index: 9999;
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);
    
    // Add indicator
    const indicator = document.createElement('div');
    indicator.className = 'preview-indicator';
    indicator.textContent = 'Preview Mode';
    document.body.appendChild(indicator);
    
    // Override console for debugging
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      originalConsoleLog(...args);
      if (typeof args[0] === 'string' && args[0].includes('[App]')) {
        indicator.textContent = `Preview: ${args[0].replace('[App] ', '')}`;
        setTimeout(() => {
          indicator.textContent = 'Preview Mode';
        }, 3000);
      }
    };
    
    window.debugPreview = {
      getState: () => {
        return {
          content: window._previewContent || null,
          config: window._previewConfig || null
        };
      },
      forceUpdate: () => {
        window.location.reload();
      }
    };
  }
}

// Export a helper for updating document title in preview mode
export function updatePreviewTitle(title) {
  if (window.location.search.includes('preview=true') && title) {
    document.title = `${title} (Preview)`;
  }
}