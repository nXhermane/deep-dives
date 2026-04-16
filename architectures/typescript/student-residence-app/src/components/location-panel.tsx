"use client"

import { useState } from "react"
import { Trash2, ExternalLink, MapPin, Users, Globe, Map, List, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import type { Location, Stage, Student } from "@/lib/types"
import { LocationForm } from "./location-form"
import { MapWrapper } from "./map-wrapper"
import { mapsUrl } from "@/lib/geo"
import type { MapMarker } from "./leaflet-map"

interface LocationPanelProps {
  title: string
  description: string
  items: Location[]
  onSave: (items: Location[]) => void
  labelField: string
  accentClass: string
  emptyIcon: React.ReactNode
  showCapacity?: boolean
  students?: Student[]
}

export function LocationPanel({
  title,
  description,
  items,
  onSave,
  labelField,
  accentClass,
  emptyIcon,
  showCapacity = false,
  students = [],
}: LocationPanelProps) {
  const [viewMode, setViewMode] = useState<"list" | "map">("list")
  const [selectedItemForStudents, setSelectedItemForStudents] = useState<Location | null>(null)

  const addItem = (item: Location) => {
    onSave([...items, item])
  }

  const removeItem = (id: number) => {
    onSave(items.filter((item) => item.id !== id))
  }

  const updateCapacity = (id: number, value: string) => {
    const num = value === "" ? undefined : parseInt(value, 10)
    onSave(
      items.map((item) =>
        item.id === id
          ? { ...item, capacity: num && num > 0 ? num : undefined }
          : item
      )
    )
  }

  const mapMarkers: MapMarker[] = items.map((item) => ({
    lat: item.lat,
    lon: item.lon,
    label: item.name,
  }))

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tighter text-foreground uppercase text-glow">{title}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="size-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--primary)]" />
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{description}</p>
          </div>
        </div>
        {items.length > 0 && (
          <div className="flex gap-1 rounded-xl glass-dark p-1 border border-white/10">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-black uppercase tracking-widest transition-all ${
                viewMode === "list"
                  ? "bg-primary/20 text-primary shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              <List className="size-3.5" />
              Liste
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-black uppercase tracking-widest transition-all ${
                viewMode === "map"
                  ? "bg-primary/20 text-primary shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              <Map className="size-3.5" />
              Carte
            </button>
          </div>
        )}
      </div>

      {/* Add form */}
      <Card className="border-dashed border-white/10 bg-white/[0.02]">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="size-2 rounded-full bg-primary" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">Nouveau Point d'Entrée</span>
          </div>
          <LocationForm labelField={labelField} onAdd={addItem} />
        </CardContent>
      </Card>

      {/* Map overview */}
      {viewMode === "map" && items.length > 0 && (
        <MapWrapper
          markers={mapMarkers}
          className="h-80 w-full rounded-xl border border-border overflow-hidden shadow-sm"
        />
      )}

      {/* List */}
      {items.length === 0 ? (
        <Card className="border-dashed border-white/10 bg-white/[0.02]">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
              <div className="relative flex size-20 items-center justify-center rounded-3xl bg-white/5 border border-white/10 glass shadow-2xl">
                {emptyIcon}
              </div>
            </div>
            <h3 className="mt-6 text-sm font-black uppercase tracking-widest text-foreground">Secteur Non Indexé</h3>
            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Utilisez le terminal ci-dessus pour configurer ce secteur
            </p>
          </CardContent>
        </Card>
      ) : (
        viewMode === "list" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {items.map((item, i) => {
              const itemStudents = students.filter(s => s.residenceId === item.id)
              const studentCount = itemStudents.length

              return (
                <Card
                  key={item.id}
                  className="group relative overflow-hidden border-white/5 bg-white/5 transition-all duration-500 hover:border-primary/40 hover:bg-white/[0.08] hover:shadow-[0_0_30px_rgba(168,85,247,0.1)]"
                >
                  <CardContent className="flex flex-col gap-4 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-md rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className={`relative flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-xs font-black transition-transform group-hover:scale-110 ${accentClass}`}>
                          {String(i + 1).padStart(2, '0')}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <button
                          onClick={() => studentCount > 0 && setSelectedItemForStudents(item)}
                          className={`text-xs font-black uppercase tracking-wider text-foreground truncate block transition-colors ${studentCount > 0 ? 'hover:text-primary cursor-pointer' : 'cursor-default'}`}
                        >
                          {item.name}
                        </button>
                        <div className="mt-2 flex items-center gap-2">
                          {item.city && (
                            <Badge variant="secondary" className="bg-white/5 text-[10px] text-muted-foreground">
                              {item.city}
                            </Badge>
                          )}
                          {studentCount > 0 && (
                            <Badge
                              variant="default"
                              className="bg-primary/20 text-primary border-primary/30 text-[10px] cursor-pointer"
                              onClick={() => setSelectedItemForStudents(item)}
                            >
                              <Users className="size-2.5 mr-1" />
                              {studentCount} UNITES
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive/40 hover:text-destructive hover:bg-destructive/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        onClick={() => removeItem(item.id)}
                    aria-label={`Supprimer ${item.name}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/5">
                      <a
                        href={item.url || mapsUrl(item.lat, item.lon)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-all hover:bg-primary/20 hover:text-primary hover:border-primary/30 border border-transparent"
                      >
                        <MapPin className="size-3" />
                        COORDONNÉES
                        <ExternalLink className="size-3" />
                      </a>
                      {showCapacity && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                          <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">CAP:</span>
                          <Input
                            type="number"
                            min={1}
                            placeholder="MAX"
                            value={(item as Stage).capacity ?? ""}
                            onChange={(e) => updateCapacity(item.id, e.target.value)}
                            className="h-4 w-10 border-0 bg-transparent p-0 text-xs font-black text-primary shadow-none focus-visible:ring-0 text-center"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )
      )}

      {/* Students Modal */}
      <Dialog open={!!selectedItemForStudents} onOpenChange={(open) => !open && setSelectedItemForStudents(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Étudiants à {selectedItemForStudents?.name}</DialogTitle>
            <DialogDescription>
              Liste des étudiants résidant à cet emplacement.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-4">
            {selectedItemForStudents && students.filter(s => s.residenceId === selectedItemForStudents.id).length > 0 ? (
              students.filter(s => s.residenceId === selectedItemForStudents.id).map(student => (
                <div key={student.id} className="flex items-center gap-3 rounded-lg border border-border p-3 bg-secondary/20">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="size-4" />
                  </div>
                  <span className="text-sm font-medium">{student.name}</span>
                </div>
              ))
            ) : (
              <p className="text-center py-6 text-sm text-muted-foreground">
                Aucun étudiant enregistré pour cette résidence.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
