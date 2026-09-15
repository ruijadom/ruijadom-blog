'use client'

import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'
import svgPanZoom from 'svg-pan-zoom'
import { ZoomIn, ZoomOut, Maximize2, Move } from 'lucide-react'

interface MermaidProps {
  chart: string
  className?: string
}

let mermaidInitialized = false
let instanceCounter = 0

export function Mermaid({ chart, className = '' }: MermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const panZoomInstance = useRef<any>(null)
  const [isReady, setIsReady] = useState(false)
  const [instanceId] = useState(() => `mermaid-${++instanceCounter}`)

  useEffect(() => {
    if (!mermaidInitialized) {
      mermaid.initialize({
        startOnLoad: true,
        theme: 'dark',
        themeVariables: {
          primaryColor: '#1e293b',
          primaryTextColor: '#e2e8f0',
          primaryBorderColor: '#475569',
          lineColor: '#64748b',
          secondaryColor: '#334155',
          tertiaryColor: '#0f172a',
          background: '#0f172a',
          mainBkg: '#1e293b',
          secondBkg: '#334155',
          textColor: '#e2e8f0',
          fontSize: '16px',
          fontFamily: 'var(--font-lexend), sans-serif',
        },
        flowchart: {
          padding: 20,
          nodeSpacing: 80,
          rankSpacing: 80,
          curve: 'basis',
          useMaxWidth: false,
        },
        sequence: {
          diagramMarginX: 50,
          diagramMarginY: 30,
          actorMargin: 80,
          width: 200,
          height: 80,
          boxMargin: 20,
          useMaxWidth: false,
        },
      })
      mermaidInitialized = true
    }

    const renderDiagram = async () => {
      if (!containerRef.current) return

      try {
        // Clear container
        containerRef.current.innerHTML = ''

        // Render diagram using mermaid.render API
        const { svg } = await mermaid.render(`svg-${instanceId}`, chart)
        
        // Create wrapper div
        const wrapper = document.createElement('div')
        wrapper.innerHTML = svg
        
        const svgElement = wrapper.querySelector('svg')
        if (svgElement && containerRef.current) {
          svgElement.removeAttribute('height')
          svgElement.style.width = '100%'
          svgElement.style.height = '500px'
          svgElement.style.border = '1px solid hsl(var(--border))'
          svgElement.style.borderRadius = '8px'
          svgElement.style.backgroundColor = 'hsl(var(--secondary))'
          
          containerRef.current.appendChild(svgElement)

          // Initialize pan-zoom
          try {
            panZoomInstance.current = svgPanZoom(svgElement, {
              zoomEnabled: true,
              controlIconsEnabled: false,
              fit: true,
              center: true,
              minZoom: 0.5,
              maxZoom: 10,
              zoomScaleSensitivity: 0.3,
              mouseWheelZoomEnabled: false, // Disable scroll zoom
              preventMouseEventsDefault: false, // Allow normal scroll behavior
            })
            setIsReady(true)
          } catch (error) {
            console.error('Error initializing pan-zoom:', error)
          }
        }
      } catch (error) {
        console.error('Error rendering mermaid diagram:', error)
      }
    }

    renderDiagram()

    return () => {
      if (panZoomInstance.current) {
        try {
          panZoomInstance.current.destroy()
        } catch (error) {
          console.error('Error destroying pan-zoom:', error)
        }
        panZoomInstance.current = null
      }
      setIsReady(false)
    }
  }, [chart, instanceId])

  const handleZoomIn = () => {
    if (panZoomInstance.current) {
      panZoomInstance.current.zoomIn()
    }
  }

  const handleZoomOut = () => {
    if (panZoomInstance.current) {
      panZoomInstance.current.zoomOut()
    }
  }

  const handleReset = () => {
    if (panZoomInstance.current) {
      panZoomInstance.current.reset()
    }
  }

  const handleFit = () => {
    if (panZoomInstance.current) {
      panZoomInstance.current.fit()
      panZoomInstance.current.center()
    }
  }

  return (
    <div className={`my-8 w-full ${className}`}>
      <div
        ref={containerRef}
        className="relative w-full"
        style={{
          minHeight: '500px',
        }}
      />
      {isReady && (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={handleZoomIn}
            className="flex items-center gap-1 rounded-md border border-border bg-secondary px-3 py-1.5 text-sm text-secondary-foreground transition-colors hover:bg-accent"
            title="Zoom In"
          >
            <ZoomIn className="size-4" />
            Zoom In
          </button>
          <button
            onClick={handleZoomOut}
            className="flex items-center gap-1 rounded-md border border-border bg-secondary px-3 py-1.5 text-sm text-secondary-foreground transition-colors hover:bg-accent"
            title="Zoom Out"
          >
            <ZoomOut className="size-4" />
            Zoom Out
          </button>
          <button
            onClick={handleFit}
            className="flex items-center gap-1 rounded-md border border-border bg-secondary px-3 py-1.5 text-sm text-secondary-foreground transition-colors hover:bg-accent"
            title="Fit to Screen"
          >
            <Maximize2 className="size-4" />
            Fit
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 rounded-md border border-border bg-secondary px-3 py-1.5 text-sm text-secondary-foreground transition-colors hover:bg-accent"
            title="Reset View"
          >
            <Move className="size-4" />
            Reset
          </button>
          <span className="ml-2 text-xs text-muted-foreground">
            💡 Drag to pan • Use buttons to zoom
          </span>
        </div>
      )}
    </div>
  )
}
