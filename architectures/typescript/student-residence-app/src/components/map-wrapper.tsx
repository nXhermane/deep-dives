import React, { Suspense, lazy } from "react"
import type { MapMarker } from "./leaflet-map"

const LeafletMap = lazy(() => import("./leaflet-map"))

const LoadingMap = () => (
  <div className="flex h-64 w-full items-center justify-center rounded-lg bg-muted/50 border border-border">
    <div className="flex flex-col items-center gap-2">
      <div className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <span className="text-xs text-muted-foreground">Chargement de la carte...</span>
    </div>
  </div>
)

interface MapWrapperProps {
  center?: [number, number]
  zoom?: number
  markers?: MapMarker[]
  onClick?: (lat: number, lon: number) => void
  selectedPosition?: { lat: number; lon: number } | null
  className?: string
  interactive?: boolean
}

export function MapWrapper(props: MapWrapperProps) {
  return (
    <Suspense fallback={<LoadingMap />}>
      <LeafletMap {...props} />
    </Suspense>
  )
}
