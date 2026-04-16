"use client"

import { useState, useCallback } from "react"
import { Link2, Search, MapPin, Plus, Loader2, Crosshair, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import type { Location } from "@/lib/types"
import {
  geocode,
  parseGoogleMapsUrl,
  extractNameFromUrl,
  mapsUrl,
  reverseGeocode,
  extractCity,
  type NominatimResult,
} from "@/lib/geo"
import { MapWrapper } from "./map-wrapper"

interface LocationFormProps {
  labelField: string
  onAdd: (location: Location) => void
  compact?: boolean
}

type InputMode = "search" | "map" | "url" | "gps"

export function LocationForm({ labelField, onAdd, compact = false }: LocationFormProps) {
  const [mode, setMode] = useState<InputMode>("search")
  const [name, setName] = useState("")
  const [city, setCity] = useState("")
  const [gmUrl, setGmUrl] = useState("")
  const [urlError, setUrlError] = useState("")
  const [address, setAddress] = useState("")
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([])
  const [searching, setSearching] = useState(false)
  const [mLat, setMLat] = useState("")
  const [mLon, setMLon] = useState("")
  const [mapPickedPos, setMapPickedPos] = useState<{ lat: number; lon: number } | null>(null)
  const [mapLoading, setMapLoading] = useState(false)

  const resetForm = () => {
    setName("")
    setCity("")
    setGmUrl("")
    setUrlError("")
    setAddress("")
    setSuggestions([])
    setMLat("")
    setMLon("")
    setMapPickedPos(null)
  }

  const addFromUrl = async () => {
    setUrlError("")
    if (!gmUrl.trim()) {
      setUrlError("Collez une URL Google Maps.")
      return
    }
    const coords = parseGoogleMapsUrl(gmUrl)
    if (!coords) {
      setUrlError("Impossible d'extraire les coordonnees.")
      return
    }
    const autoName = name.trim() || extractNameFromUrl(gmUrl)
    if (!autoName) {
      setUrlError("Entrez un nom pour ce lieu.")
      return
    }
    let resolvedCity = city.trim()
    if (!resolvedCity) {
      const rev = await reverseGeocode(coords.lat, coords.lon)
      if (rev) resolvedCity = extractCity(rev)
    }
    onAdd({
      id: Date.now(),
      name: autoName,
      lat: coords.lat,
      lon: coords.lon,
      url: gmUrl.trim(),
      city: resolvedCity || undefined,
    })
    resetForm()
  }

  const handleSearch = async () => {
    if (!address.trim()) return
    setSearching(true)
    try {
      const results = await geocode(address)
      setSuggestions(results)
    } catch {
      setSuggestions([])
    }
    setSearching(false)
  }

  const addFromSuggestion = (s: NominatimResult) => {
    const finalName = name.trim() || s.display_name.split(",")[0]
    if (!finalName) return
    const resolvedCity = city.trim() || extractCity(s)
    onAdd({
      id: Date.now(),
      name: finalName,
      address: s.display_name,
      lat: parseFloat(s.lat),
      lon: parseFloat(s.lon),
      url: mapsUrl(parseFloat(s.lat), parseFloat(s.lon)),
      city: resolvedCity || undefined,
    })
    resetForm()
  }

  const handleMapClick = useCallback(async (lat: number, lon: number) => {
    setMapPickedPos({ lat, lon })
    setMapLoading(true)
    try {
      const rev = await reverseGeocode(lat, lon)
      if (rev) {
        const resolvedCity = extractCity(rev)
        if (resolvedCity) setCity(resolvedCity)
        if (!name.trim()) {
          const displayParts = rev.display_name?.split(",")
          if (displayParts?.[0]) setName(displayParts[0].trim())
        }
        setAddress(rev.display_name || "")
      }
    } catch {
      // ignore
    }
    setMapLoading(false)
  }, [name])

  const confirmMapPick = () => {
    if (!mapPickedPos || !name.trim()) return
    onAdd({
      id: Date.now(),
      name: name.trim(),
      lat: mapPickedPos.lat,
      lon: mapPickedPos.lon,
      url: mapsUrl(mapPickedPos.lat, mapPickedPos.lon),
      address: address || undefined,
      city: city.trim() || undefined,
    })
    resetForm()
  }

  const addManual = async () => {
    if (!name.trim() || !mLat || !mLon) return
    const lat = parseFloat(mLat)
    const lon = parseFloat(mLon)
    if (isNaN(lat) || isNaN(lon)) return
    let resolvedCity = city.trim()
    if (!resolvedCity) {
      const rev = await reverseGeocode(lat, lon)
      if (rev) resolvedCity = extractCity(rev)
    }
    onAdd({
      id: Date.now(),
      name: name.trim(),
      lat,
      lon,
      url: mapsUrl(lat, lon),
      city: resolvedCity || undefined,
    })
    resetForm()
  }

  const modes: { key: InputMode; label: string; icon: React.ReactNode }[] = [
    { key: "search", label: "Recherche", icon: <Search className="size-3.5" /> },
    { key: "map", label: "Carte", icon: <Crosshair className="size-3.5" /> },
    { key: "url", label: "URL Maps", icon: <Link2 className="size-3.5" /> },
    { key: "gps", label: "GPS", icon: <MapPin className="size-3.5" /> },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Mode selector */}
      <div className="flex flex-wrap gap-2">
        {modes.map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-black uppercase tracking-widest transition-all ${
              mode === m.key
                ? "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                : "bg-white/5 text-muted-foreground border border-transparent hover:bg-white/10 hover:text-foreground"
            }`}
          >
            {m.icon}
            {m.label}
          </button>
        ))}
      </div>

      {/* Name + City row */}
      {!compact ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{labelField}</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`ENTRER ${labelField.toUpperCase()}`}
              className="h-10 bg-white/5 border-white/10 rounded-xl focus:border-primary/50 text-[11px] font-bold uppercase tracking-wider"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
              Ville / Village
            </Label>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="EX: COTONOU, ABOMEY-CALAVI"
              className="h-10 bg-white/5 border-white/10 rounded-xl focus:border-primary/50 text-[11px] font-bold uppercase tracking-wider"
            />
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={labelField.toUpperCase()}
            className="h-10 bg-white/5 border-white/10 rounded-xl focus:border-primary/50 text-[11px] font-bold uppercase tracking-wider"
          />
          <Input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="VILLE / VILLAGE"
            className="h-10 bg-white/5 border-white/10 rounded-xl focus:border-primary/50 text-[11px] font-bold uppercase tracking-wider"
          />
        </div>
      )}

      {/* Search mode */}
      {mode === "search" && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Rechercher un lieu, adresse, quartier..."
              className="h-9 flex-1 bg-secondary/30 border-border/60"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button
              size="sm"
              onClick={handleSearch}
              disabled={searching}
              className="h-9 gap-1.5"
            >
              {searching ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Search className="size-4" />
              )}
            </Button>
          </div>
          {suggestions.length > 0 && (
            <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm">
              {suggestions.map((s, i) => {
                const sCity = extractCity(s)
                return (
                  <button
                    key={i}
                    onClick={() => addFromSuggestion(s)}
                    className="flex w-full items-start gap-3 border-b border-border/40 px-3 py-2.5 text-left transition-colors hover:bg-accent/10 last:border-b-0"
                  >
                    <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground leading-snug truncate">
                        {s.display_name}
                      </p>
                      {sCity && (
                        <Badge variant="secondary" className="mt-1 text-xs font-normal">
                          {sCity}
                        </Badge>
                      )}
                    </div>
                    <Plus className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Map mode */}
      {mode === "map" && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground">
            Cliquez sur la carte pour selectionner un emplacement
          </p>
          <MapWrapper
            center={[6.37, 2.39]}
            zoom={12}
            onClick={handleMapClick}
            selectedPosition={mapPickedPos}
            className="h-72 w-full rounded-lg border border-border overflow-hidden"
          />
          {mapPickedPos && (
            <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <Crosshair className="size-3.5 text-primary" />
                  <span className="text-xs font-mono text-foreground">
                    {mapPickedPos.lat.toFixed(6)}, {mapPickedPos.lon.toFixed(6)}
                  </span>
                  {mapLoading && <Loader2 className="size-3 animate-spin text-primary" />}
                </div>
                {address && (
                  <p className="mt-0.5 text-xs text-muted-foreground truncate">{address}</p>
                )}
                {city && (
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {city}
                  </Badge>
                )}
              </div>
              <Button
                size="sm"
                onClick={confirmMapPick}
                disabled={!name.trim()}
                className="gap-1.5"
              >
                <Plus className="size-4" />
                Ajouter
              </Button>
            </div>
          )}
        </div>
      )}

      {/* URL mode */}
      {mode === "url" && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Input
              value={gmUrl}
              onChange={(e) => {
                setGmUrl(e.target.value)
                setUrlError("")
              }}
              placeholder="Collez l'URL Google Maps ici..."
              className="h-9 flex-1 text-xs bg-secondary/30 border-border/60"
            />
            <Button size="sm" onClick={addFromUrl} className="h-9 px-3">
              <Plus className="size-4" />
            </Button>
          </div>
          {urlError && (
            <p className="text-xs text-destructive">{urlError}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Le nom et la ville seront extraits automatiquement si non renseignes.
          </p>
        </div>
      )}

      {/* GPS mode */}
      {mode === "gps" && (
        <div className="flex gap-2">
          <Input
            value={mLat}
            onChange={(e) => setMLat(e.target.value)}
            placeholder="Latitude"
            className="h-9 flex-1 bg-secondary/30 border-border/60"
            type="number"
            step="any"
          />
          <Input
            value={mLon}
            onChange={(e) => setMLon(e.target.value)}
            placeholder="Longitude"
            className="h-9 flex-1 bg-secondary/30 border-border/60"
            type="number"
            step="any"
          />
          <Button size="sm" onClick={addManual} className="h-9 px-3">
            <Plus className="size-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
