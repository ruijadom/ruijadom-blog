'use client'

import dynamic from 'next/dynamic'

export const Mermaid = dynamic(
  () => import('./mermaid').then((mod) => mod.Mermaid),
  {
    ssr: false,
    loading: () => (
      <div className="my-8 flex h-[500px] items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground">
        Loading diagram...
      </div>
    ),
  }
)
