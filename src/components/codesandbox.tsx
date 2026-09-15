'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface CodeSandboxProps {
  /**
   * Full CodeSandbox URL or sandbox ID
   */
  src?: string;
  
  /**
   * Sandbox ID (must be a real CodeSandbox ID)
   */
  sandboxId?: string;
  
  /**
   * Pre-defined template to create new sandbox
   */
  template?: 'react' | 'vue' | 'angular' | 'vanilla' | 'node' | 'static';
  
  /**
   * Iframe height
   */
  height?: number;
  
  /**
   * Show console
   */
  console?: boolean;
  
  /**
   * Show preview
   */
  preview?: boolean;
  
  /**
   * Theme (light or dark)
   */
  theme?: 'light' | 'dark';
  
  /**
   * Sandbox title
   */
  title?: string;
  
  /**
   * Additional CodeSandbox settings
   */
  options?: {
    fontsize?: number;
    hidenavigation?: boolean;
    hidedevtools?: boolean;
    codemirror?: boolean;
    runonclick?: boolean;
    forcerefresh?: boolean;
    expanddevtools?: boolean;
    editorsize?: number;
  };
  
  /**
   * Files to create a dynamic sandbox
   */
  files?: Record<string, string>;
  
  /**
   * Dependencies for dynamic sandbox
   */
  dependencies?: Record<string, string>;
  
  /**
   * Additional CSS class
   */
  className?: string;
}

export function CodeSandbox({
  src,
  sandboxId,
  template = 'react',
  height = 500,
  console = false,
  preview = true,
  theme = 'dark',
  title,
  options = {},
  files,
  dependencies,
  className
}: CodeSandboxProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sandboxUrl, setSandboxUrl] = useState<string>('');

  // Function to create dynamic sandbox using CodeSandbox API
  const createDynamicSandbox = useCallback(async (): Promise<string> => {
    if (!files) throw new Error('Files not provided');

    const sandboxData = {
      files: {
        'package.json': {
          content: JSON.stringify({
            name: 'dynamic-sandbox',
            version: '1.0.0',
            main: 'index.js',
            dependencies: dependencies || {
              react: '^18.0.0',
              'react-dom': '^18.0.0',
              'react-scripts': '^5.0.0'
            },
            scripts: {
              start: 'react-scripts start',
              build: 'react-scripts build',
              test: 'react-scripts test',
              eject: 'react-scripts eject'
            }
          }, null, 2)
        },
        'public/index.html': {
          content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Dynamic Sandbox</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>`
        },
        ...Object.entries(files).reduce((acc, [path, content]) => {
          acc[path] = { content };
          return acc;
        }, {} as Record<string, { content: string }>)
      }
    };

    try {
      const response = await fetch('https://codesandbox.io/api/v1/sandboxes/define', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sandboxData)
      });

      if (!response.ok) {
        throw new Error('Failed to create sandbox');
      }

      const result = await response.json();
      return `https://codesandbox.io/embed/${result.sandbox_id}`;
    } catch {
      // Fallback: use GET method with parameters
      const parameters = btoa(JSON.stringify(sandboxData));
      return `https://codesandbox.io/api/v1/sandboxes/define?parameters=${parameters}`;
    }
  }, [files, dependencies]);

  useEffect(() => {
    const createSandboxUrl = async () => {
      try {
        if (src) {
          // If src is a full URL
          if (src.startsWith('http')) {
            setSandboxUrl(src);
          } else {
            // If src is just an ID
            setSandboxUrl(`https://codesandbox.io/embed/${src}`);
          }
        } else if (sandboxId) {
          setSandboxUrl(`https://codesandbox.io/embed/${sandboxId}`);
        } else if (files) {
          // Create dynamic sandbox
          const dynamicUrl = await createDynamicSandbox();
          setSandboxUrl(dynamicUrl);
        } else {
          // Empty template
          setSandboxUrl(`https://codesandbox.io/embed/new?template=${template}`);
        }
      } catch (err) {
        setError('Error creating sandbox URL');
        setIsLoading(false);
      }
    };

    createSandboxUrl();
  }, [src, sandboxId, template, files, dependencies, createDynamicSandbox]);

  // Build URL parameters
  const buildUrlParams = () => {
    const params = new URLSearchParams();
    
    if (theme) params.append('theme', theme);
    if (!preview) params.append('view', 'editor');
    if (console) params.append('console', '1');
    
    // Add custom options
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    return params.toString();
  };

  const urlParams = buildUrlParams();
  const finalUrl = sandboxUrl ? `${sandboxUrl}?${urlParams}` : '';

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError('Sandbox not found or not public');
  };

  if (!finalUrl && !isLoading) {
    return (
      <div className={cn('my-8 w-full', className)}>
        <div className="rounded-lg border bg-background p-8 text-center">
          <p className="text-sm text-red-500">Error: Sandbox URL could not be created</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('my-8 w-full', className)}>
      {title && (
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <a
            href={sandboxUrl.replace('/embed/', '/s/')}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Open in CodeSandbox ↗
          </a>
        </div>
      )}
      
      <div className="relative overflow-hidden rounded-lg border bg-background">
        {isLoading && (
          <div 
            className="absolute inset-0 z-10 flex items-center justify-center bg-background/95"
            style={{ height: `${height}px` }}
          >
            <div className="flex items-center space-x-3">
              <div className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <span className="text-sm text-muted-foreground">Loading sandbox...</span>
            </div>
          </div>
        )}
        
        {error && (
          <div 
            className="flex items-center justify-center bg-background p-8 text-center"
            style={{ height: `${height}px` }}
          >
            <div className="space-y-3">
              <p className="text-sm text-red-500">{error}</p>
              <p className="text-xs text-muted-foreground">
                Check if the sandbox ID is correct and if it&apos;s public
              </p>
              {sandboxUrl && (
                <a
                  href={sandboxUrl.replace('/embed/', '/s/')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm text-primary hover:underline"
                >
                  Try opening directly
                </a>
              )}
            </div>
          </div>
        )}
        
        {finalUrl && (
          <iframe
            src={finalUrl}
            width="100%"
            height={height}
            title={title || 'CodeSandbox Demo'}
            allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
            sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
            loading="lazy"
            className="w-full border-0"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        )}
      </div>
    </div>
  );
}

// Component to create dynamic sandboxes easily
export function DynamicCodeSandbox({
  files,
  dependencies,
  height = 500,
  title,
  className
}: {
  files: Record<string, string>;
  dependencies?: Record<string, string>;
  height?: number;
  title?: string;
  className?: string;
}) {
  return (
    <CodeSandbox
      files={files}
      dependencies={dependencies}
      height={height}
      title={title}
      className={className}
      theme="dark"
      options={{
        fontsize: 14,
        hidenavigation: false,
        expanddevtools: true
      }}
    />
  );
}

// Simplified version for direct use in MDX
export function CodeSandboxEmbed({ 
  id, 
  height = 500, 
  title 
}: { 
  id: string; 
  height?: number; 
  title?: string;
}) {
  return <CodeSandbox sandboxId={id} height={height} title={title} />;
} 