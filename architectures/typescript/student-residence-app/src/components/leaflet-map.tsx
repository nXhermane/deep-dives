"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix default marker icon issue with bundlers
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const accentIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

export interface MapMarker {
  lat: number
  lon: number
  label: string
  color?: "default" | "accent"
}

interface LeafletMapProps {
  center?: [number, number]
  zoom?: number
  markers?: MapMarker[]
  onClick?: (lat: number, lon: number) => void
  selectedPosition?: { lat: number; lon: number } | null
  className?: string
  interactive?: boolean
}

export default function LeafletMap({
  center = [6.37, 2.39],
  zoom = 12,
  markers = [],
  onClick,
  selectedPosition,
  className = "h-64 w-full rounded-lg",
  interactive = true,
}: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)
  const selectedMarkerRef = useRef<L.Marker | null>(null)
  const [isReady, setIsReady] = useState(false)

  const initMap = useCallback(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center,
      zoom,
      zoomControl: true,
      scrollWheelZoom: interactive,
      dragging: interactive,
    })

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      maxZoom: 19,
    }).addTo(map)

    const markersLayer = L.layerGroup().addTo(map)
    markersLayerRef.current = markersLayer
    mapRef.current = map

    if (onClick) {
      map.on("click", (e: L.LeafletMouseEvent) => {
        onClick(e.latlng.lat, e.latlng.lng)
      })
    }

    setIsReady(true)
  }, [center, zoom, onClick, interactive])

  useEffect(() => {
    initMap()
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update markers
  useEffect(() => {
    if (!isReady || !markersLayerRef.current) return
    markersLayerRef.current.clearLayers()
    markers.forEach((m) => {
      const icon = m.color === "accent" ? accentIcon : defaultIcon
      L.marker([m.lat, m.lon], { icon })
        .bindPopup(`<b>${m.label}</b>`)
        .addTo(markersLayerRef.current!)
    })

    if (markers.length > 0 && !selectedPosition) {
      const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lon] as [number, number]))
      mapRef.current?.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 })
    }
  }, [markers, isReady, selectedPosition])

  // Update selected position marker
  useEffect(() => {
    if (!isReady || !mapRef.current) return
    if (selectedMarkerRef.current) {
      selectedMarkerRef.current.remove()
      selectedMarkerRef.current = null
    }
    if (selectedPosition) {
      const redIcon = L.icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      })
      selectedMarkerRef.current = L.marker(
        [selectedPosition.lat, selectedPosition.lon],
        { icon: redIcon }
      )
        .bindPopup("<b>Position selectionnee</b>")
        .addTo(mapRef.current)
      mapRef.current.setView([selectedPosition.lat, selectedPosition.lon], 15)
    }
  }, [selectedPosition, isReady])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ zIndex: 0 }}
    />
  )
}
