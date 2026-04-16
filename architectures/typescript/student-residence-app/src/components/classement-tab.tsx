"use client"

import { useState, useMemo } from "react"
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MapPin,
  Navigation,
  LayoutGrid,
  Table2,
  User,
  Home,
  Building2,
  AlertTriangle,
  Users,
  Globe,
  Map as MapIcon,
  Shuffle,
  Dices,
  Search,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Student, Residence, Stage, RankedStage, ClassementEntry } from "@/lib/types"
import { haversine, directionsUrl, mapsUrl } from "@/lib/geo"
import { MapWrapper } from "./map-wrapper"
import type { MapMarker } from "./leaflet-map"

interface ClassementTabProps {
  students: Student[]
  residences: Residence[]
  stages: Stage[]
}

function getDistanceColor(d: number): string {
  if (d < 2) return "bg-success/20 text-success border-success/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]"
  if (d < 5) return "bg-warning/20 text-warning border-warning/30 shadow-[0_0_10px_rgba(234,179,8,0.2)]"
  return "bg-destructive/20 text-destructive border-destructive/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
}

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function ClassementTab({ students, residences, stages }: ClassementTabProps) {
  const [expanded, setExpanded] = useState<number | null>(null)
  const [view, setView] = useState<"cards" | "table" | "map" | "by-stage">("cards")
  const [seed, setSeed] = useState(0)
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<"distance" | "name" | "stage" | "residence">("distance")

  const relancer = () => setSeed(s => s + 1)

  const { classement, stageUsage } = useMemo(() => {
    if (!stages.length) return { classement: [] as ClassementEntry[], stageUsage: new Map<number, number>() }

    const usage = new Map<number, number>()
    stages.forEach((s) => usage.set(s.id, 0))

    const isFull = (stageId: number) => {
      const stage = stages.find((s) => s.id === stageId)
      if (!stage || !stage.capacity) return false
      return (usage.get(stageId) ?? 0) >= stage.capacity
    }

    if (students.length > 0) {
      const studentData = students
        .map((student) => {
          const residence = residences.find((r) => r.id === student.residenceId)
          if (!residence) return null
          const ranked: RankedStage[] = stages
            .map((s) => ({
              ...s,
              distance: haversine(residence.lat, residence.lon, s.lat, s.lon),
            }))
            .sort((a, b) => a.distance - b.distance)
          return { student, residence, ranked }
        })
        .filter(Boolean) as Array<{
          student: Student
          residence: Residence
          ranked: RankedStage[]
        }>

      const allPairs: Array<{
        studentIdx: number
        stageIdx: number
        distance: number
        score: number
        randomWeight: number
      }> = []
      studentData.forEach((sd, sIdx) => {
        sd.ranked.forEach((rs, rIdx) => {
          // capacity bonus: favor larger centers slightly
          const capacityBonus = Math.min(0.1, (rs.capacity || 0) / 1000)
          const score = rs.distance - capacityBonus

          const randomWeight = seededRandom(sIdx * 133 + rIdx * 77 + seed * 555)

          allPairs.push({
            studentIdx: sIdx,
            stageIdx: rIdx,
            distance: rs.distance,
            score,
            randomWeight
          })
        })
      })

      allPairs.sort((a, b) => {
        if (Math.abs(a.score - b.score) < 0.001) {
          return a.randomWeight - b.randomWeight
        }
        return a.score - b.score
      })

      const assigned = new Set<number>()
      const results: ClassementEntry[] = []

      for (const pair of allPairs) {
        if (assigned.has(pair.studentIdx)) continue
        const sd = studentData[pair.studentIdx]
        const stage = sd.ranked[pair.stageIdx]
        if (isFull(stage.id)) continue

        usage.set(stage.id, (usage.get(stage.id) ?? 0) + 1)
        assigned.add(pair.studentIdx)
        const isReassigned = pair.stageIdx > 0

        const isRandomTieBreak = allPairs.some(p =>
          p !== pair &&
          Math.abs(p.score - pair.score) < 0.001 &&
          p.stageIdx === pair.stageIdx
        )

        results.push({
          student: sd.student,
          residence: sd.residence,
          stage,
          allStages: sd.ranked,
          reassigned: isReassigned,
          isRandomTieBreak,
        })
      }

      results.sort((a, b) => a.stage.distance - b.stage.distance)
      return { classement: results, stageUsage: usage }
    }

    const fallback: ClassementEntry[] = residences
      .map((residence) => {
        const ranked: RankedStage[] = stages
          .map((s) => ({
            ...s,
            distance: haversine(residence.lat, residence.lon, s.lat, s.lon),
          }))
          .sort((a, b) => a.distance - b.distance)

        return {
          student: { id: residence.id, name: residence.name, residenceId: residence.id },
          residence,
          stage: ranked[0],
          allStages: ranked,
          reassigned: false,
          isRandomTieBreak: false,
        }
      })
      .sort((a, b) => (a.stage?.distance ?? 99) - (b.stage?.distance ?? 99))

    return { classement: fallback, stageUsage: usage }
  }, [students, residences, stages, seed])

  const filteredClassement = useMemo(() => {
    let list = [...classement]

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (entry) =>
          entry.student.name.toLowerCase().includes(q) ||
          entry.stage.name.toLowerCase().includes(q) ||
          entry.residence.name.toLowerCase().includes(q)
      )
    }

    list.sort((a, b) => {
      if (sortKey === "distance") return a.stage.distance - b.stage.distance
      if (sortKey === "name") return a.student.name.localeCompare(b.student.name)
      if (sortKey === "stage") return a.stage.name.localeCompare(b.stage.name)
      if (sortKey === "residence") return a.residence.name.localeCompare(b.residence.name)
      return 0
    })

    return list
  }, [classement, search, sortKey])

  const byStage = useMemo(() => {
    const groups = new Map<number, ClassementEntry[]>()
    stages.forEach((s) => groups.set(s.id, []))
    filteredClassement.forEach((entry) => {
      const list = groups.get(entry.stage.id)
      if (list) list.push(entry)
    })
    return groups
  }, [filteredClassement, stages])

  const stats = useMemo(() => {
    const close = classement.filter((c) => c.stage.distance < 2).length
    const medium = classement.filter(
      (c) => c.stage.distance >= 2 && c.stage.distance < 5
    ).length
    const far = classement.filter((c) => c.stage.distance >= 5).length
    const reassigned = classement.filter((c) => c.reassigned).length
    return { close, medium, far, reassigned }
  }, [classement])

  const mapMarkers: MapMarker[] = useMemo(() => {
    const markers: MapMarker[] = []
    filteredClassement.forEach((entry) => {
      markers.push({
        lat: entry.residence.lat,
        lon: entry.residence.lon,
        label: `${entry.student.name} (Residence: ${entry.residence.name})`,
        color: "default" as const,
      })
    })
    stages.forEach((s) => {
      markers.push({
        lat: s.lat,
        lon: s.lon,
        label: `Stage: ${s.name}${s.city ? ` (${s.city})` : ""}`,
        color: "accent" as const,
      })
    })
    return markers
  }, [classement, stages])

  if (!residences.length || !stages.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-muted/80">
            <Table2 className="size-8 text-muted-foreground" />
          </div>
          <p className="mt-4 text-sm font-medium text-muted-foreground">
            Ajoutez des residences et des lieux de stage pour lancer le classement
          </p>
          <p className="text-xs text-muted-foreground">
            {residences.length} residence(s) - {stages.length} lieu(x) de stage
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tighter text-foreground uppercase text-glow">
            Affectation Optimale
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="size-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--primary)]" />
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {classement.length} Liaisons Neurales Établies
            </p>
          </div>
        </div>
        <div className="flex gap-1 rounded-xl glass-dark p-1 border border-white/10">
          {(
            [
              { key: "cards" as const, icon: LayoutGrid, label: "Cartes" },
              { key: "table" as const, icon: Table2, label: "Tableau" },
              { key: "by-stage" as const, icon: Building2, label: "Stages" },
              { key: "map" as const, icon: MapIcon, label: "Carte" },
            ] as const
          ).map((v) => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-black uppercase tracking-widest transition-all ${
                view === v.key
                  ? "bg-primary/20 text-primary shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              <v.icon className="size-3.5" />
              <span className="hidden sm:inline">{v.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search and Sort bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un étudiant, un stage ou une résidence..."
            className="pl-10 glass-dark border-white/10 text-xs font-bold"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="glass-dark border-white/10 text-[10px] font-black uppercase tracking-widest min-w-[140px]">
                  Trier par : {sortKey}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-dark border-white/10">
                <DropdownMenuItem className="text-[10px] font-black uppercase tracking-widest cursor-pointer" onClick={() => setSortKey('distance')}>Distance</DropdownMenuItem>
                <DropdownMenuItem className="text-[10px] font-black uppercase tracking-widest cursor-pointer" onClick={() => setSortKey('name')}>Nom Étudiant</DropdownMenuItem>
                <DropdownMenuItem className="text-[10px] font-black uppercase tracking-widest cursor-pointer" onClick={() => setSortKey('stage')}>Nom Stage</DropdownMenuItem>
                <DropdownMenuItem className="text-[10px] font-black uppercase tracking-widest cursor-pointer" onClick={() => setSortKey('residence')}>Résidence</DropdownMenuItem>
              </DropdownMenuContent>
           </DropdownMenu>

           <Button
             variant="outline"
             size="sm"
             onClick={relancer}
             className="glass-dark border-white/10 text-[10px] font-black uppercase tracking-widest gap-2 text-primary hover:bg-primary/10 transition-all"
           >
             <Shuffle className="size-3.5" />
             Relancer
           </Button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: '< 2 km', value: stats.close, color: 'text-success', bg: 'bg-success/5', border: 'border-success/20' },
          { label: '2-5 km', value: stats.medium, color: 'text-warning', bg: 'bg-warning/5', border: 'border-warning/20' },
          { label: '> 5 km', value: stats.far, color: 'text-destructive', bg: 'bg-destructive/5', border: 'border-destructive/20' },
          { label: 'Réaffecté', value: stats.reassigned, color: 'text-primary', bg: 'bg-primary/5', border: 'border-primary/20', icon: AlertTriangle }
        ].map((stat, i) => (
          <Card key={i} className={`${stat.bg} ${stat.border} border shadow-xl`}>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <span className={`text-3xl font-black ${stat.color} text-glow`}>{stat.value}</span>
              <div className="mt-2 flex items-center gap-1.5">
                {stat.icon && <stat.icon className={`size-3 ${stat.color}`} />}
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Capacity usage */}
      {students.length > 0 && stages.some((s) => s.capacity) && (
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <Users className="size-4 text-primary" />
              <span className="text-sm font-bold text-foreground">
                Capacite des lieux de stage
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              {stages.map((stage) => {
                const used = stageUsage.get(stage.id) ?? 0
                const cap = stage.capacity
                const pct = cap ? Math.min((used / cap) * 100, 100) : 0
                const full = cap ? used >= cap : false
                return (
                  <div key={stage.id} className="flex items-center gap-3">
                    <div className="flex w-36 items-center gap-1.5 truncate">
                      <span className="truncate text-xs font-medium text-foreground">
                        {stage.name}
                      </span>
                      {stage.city && (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          ({stage.city})
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      {cap ? (
                        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                              full
                                ? "bg-destructive"
                                : pct > 70
                                  ? "bg-warning"
                                  : "bg-success"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      ) : (
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary/30"
                            style={{ width: used > 0 ? "100%" : "0%" }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs font-mono font-bold text-foreground">
                        {used}
                      </span>
                      <span className="text-xs text-muted-foreground">/</span>
                      <span className="text-xs font-mono text-muted-foreground">
                        {cap ?? "Illimite"}
                      </span>
                      {full && (
                        <AlertTriangle className="size-3.5 text-destructive" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map view */}
      {view === "map" && (
        <MapWrapper
          markers={mapMarkers}
          className="h-96 w-full rounded-xl border border-border overflow-hidden shadow-sm"
        />
      )}

      {/* Cards view */}
      {view === "cards" && (
        <div className="grid grid-cols-1 gap-4">
          {filteredClassement.length === 0 && search && (
             <Card className="border-dashed bg-white/[0.02]">
               <CardContent className="py-16 text-center">
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Aucun résultat pour "{search}"</p>
               </CardContent>
             </Card>
          )}
          {filteredClassement.map((entry, i) => (
            <Card
              key={`${entry.student.id}-${entry.residence.id}`}
              className={`group overflow-hidden border-white/5 bg-white/5 transition-all duration-500 hover:border-primary/40 hover:bg-white/[0.08] ${
                entry.reassigned ? "border-l-2 border-l-destructive" : ""
              }`}
            >
              <CardContent className="p-0">
                <div
                  className="flex w-full items-start gap-5 p-5 text-left"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-md rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-white/10 text-xs font-black text-primary transition-transform group-hover:scale-110">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-4">
                        {students.length > 0 && (
                          <div className="flex items-center gap-3">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                               <User className="size-4" />
                            </div>
                            <span className="text-sm font-black uppercase tracking-wider text-foreground group-hover:text-primary transition-colors">
                              {entry.student.name}
                            </span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                           <div className="space-y-2">
                             <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
                               <Home className="size-3 text-accent" />
                               ORIGINE
                             </div>
                             <div className="flex items-center gap-2">
                               <span className="text-[11px] font-bold text-foreground truncate max-w-[150px]">{entry.residence.name}</span>
                               {entry.residence.city && (
                                 <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20 px-1.5 py-0 text-[10px]">
                                   {entry.residence.city}
                                 </Badge>
                               )}
                             </div>
                           </div>

                           <div className="space-y-2">
                             <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
                               <Building2 className="size-3 text-warning" />
                               AFFECTATION
                             </div>
                             <div className="flex items-center gap-2">
                               <span className="text-[11px] font-bold text-foreground truncate max-w-[150px]">{entry.stage.name}</span>
                               {entry.stage.city && (
                                 <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20 px-1.5 py-0 text-[10px]">
                                   {entry.stage.city}
                                 </Badge>
                               )}
                             </div>
                           </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-center gap-3 bg-white/5 rounded-2xl p-4 border border-white/5 min-w-[120px]">
                        <span
                          className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-black tracking-tighter ${getDistanceColor(
                            entry.stage.distance
                          )}`}
                        >
                          {entry.stage.distance.toFixed(2)} KM
                        </span>

                        <a
                          href={directionsUrl(
                            entry.residence.lat,
                            entry.residence.lon,
                            entry.stage.lat,
                            entry.stage.lon
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
                        >
                          <Navigation className="size-3" />
                          ITINÉRAIRE
                        </a>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => setExpanded(expanded === i ? null : i)}
                         aria-expanded={expanded === i}
                         className="h-8 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-primary/10"
                       >
                         {expanded === i ? "Masquer Protocoles" : "Voir Alternatives"}
                         {expanded === i ? <ChevronUp className="ml-2 size-3" /> : <ChevronDown className="ml-2 size-3" />}
                       </Button>

                       <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                         {entry.isRandomTieBreak && (
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-warning bg-warning/10 px-2 py-0.5 rounded-full border border-warning/20">
                              <Dices className="size-3" />
                              DÉPARTAGE ALÉATOIRE
                            </div>
                         )}
                         {entry.reassigned && (
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-destructive animate-pulse">
                              <AlertTriangle className="size-3" />
                              RÉAFFECTATION SYSTÈME
                            </div>
                         )}
                       </div>
                    </div>
                  </div>
                </div>

                {expanded === i && (
                  <div className="border-t border-white/5 bg-white/[0.02] p-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="mb-4">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                        Analyse des Points de Proximité
                      </p>
                    </div>
                    <div className="space-y-2">
                      {entry.allStages.map((s, j) => (
                        <div
                          key={s.id}
                          className={`flex items-center gap-4 rounded-xl border p-3 transition-all ${
                            s.id === entry.stage.id
                              ? "bg-primary/10 border-primary/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                              : "bg-white/5 border-transparent opacity-60 hover:opacity-100 hover:bg-white/[0.08]"
                          }`}
                        >
                          <span
                            className={`flex size-6 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                              s.id === entry.stage.id
                                ? "bg-primary text-white"
                                : "bg-white/10 text-muted-foreground"
                            }`}
                          >
                            {String(j + 1).padStart(2, '0')}
                          </span>
                          <div className="flex flex-1 items-center gap-2 min-w-0">
                            <span
                              className={`text-[11px] font-bold truncate uppercase tracking-wider ${
                                s.id === entry.stage.id ? "text-primary" : "text-foreground"
                              }`}
                            >
                              {s.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span
                              className={`text-xs font-black tracking-tighter ${
                                s.distance < 2 ? "text-success" : s.distance < 5 ? "text-warning" : "text-destructive"
                              }`}
                            >
                              {s.distance.toFixed(2)} KM
                            </span>

                            {s.id === entry.stage.id && (
                              <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">
                                SELECTIONNÉ
                              </Badge>
                            )}
                            {j === 0 && s.id !== entry.stage.id && (
                              <Badge variant="outline" className="border-warning/30 text-warning text-[10px]">
                                OPTIMAL
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* By Stage view */}
      {view === "by-stage" && (
        <div className="grid grid-cols-1 gap-6">
          {stages.map((stage) => {
            const assigned = byStage.get(stage.id) ?? []
            return (
              <Card key={stage.id} className="overflow-hidden border-white/5 bg-white/5 group hover:border-primary/30 transition-all duration-500">
                <div className="bg-white/[0.03] border-b border-white/5 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-warning/10 border border-warning/20 text-warning">
                       <Building2 className="size-5" />
                    </div>
                    <div>
                      <span className="font-black text-xs uppercase tracking-wider text-foreground block group-hover:text-warning transition-colors">{stage.name}</span>
                      {stage.city && (
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-0.5 block">{stage.city}</span>
                      )}
                    </div>
                  </div>
                  <Badge variant="default" className="bg-white/10 text-muted-foreground border-white/10 px-3">
                    <Users className="size-3 mr-1.5" />
                    {assigned.length} / {stage.capacity ?? "∞"}
                  </Badge>
                </div>
                <CardContent className="p-0">
                  {assigned.length === 0 ? (
                    <div className="p-10 text-center">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/40 italic">Aucune liaison active détectée</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {assigned.map((entry) => (
                        <div key={entry.student.id} className="flex items-center justify-between p-4 px-6 hover:bg-white/[0.02] transition-colors group/item">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-3">
                              <User className="size-3.5 text-primary opacity-60 group-hover/item:opacity-100" />
                              <span className="text-xs font-black uppercase tracking-wider text-foreground group-hover/item:text-primary transition-all">{entry.student.name}</span>
                            </div>
                            <div className="flex items-center gap-2 ml-6">
                              <Home className="size-3 text-accent opacity-40" />
                              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground truncate max-w-[200px]">{entry.residence.name}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`text-xs font-black px-3 py-1.5 rounded-lg uppercase tracking-tighter ${getDistanceColor(entry.stage.distance)}`}>
                              {entry.stage.distance.toFixed(2)} KM
                            </span>
                            <a
                              href={directionsUrl(entry.residence.lat, entry.residence.lon, entry.stage.lat, entry.stage.lon)}
                              target="_blank"
                              rel="noreferrer"
                              className="size-8 flex items-center justify-center rounded-lg bg-white/5 text-muted-foreground hover:bg-primary/20 hover:text-primary transition-all border border-white/5 hover:border-primary/30 shadow-xl"
                            >
                              <Navigation className="size-3.5" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Table view */}
      {view === "table" && (
        <Card className="overflow-hidden border-white/5 bg-white/5 shadow-2xl">
          <div className="bg-primary/20 border-b border-primary/30 px-6 py-4 flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
              Matrice de Données - {filteredClassement.length} Entrées Indexées
            </p>
            {search && (
               <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Filtre: {search}</span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">#</th>
                  {students.length > 0 && (
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Unité</th>
                  )}
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Origine</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Cible</th>
                  <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-widest text-muted-foreground">Prox</th>
                  <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-widest text-muted-foreground">Nav</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredClassement.map((entry, i) => (
                  <tr
                    key={`${entry.student.id}-${entry.residence.id}`}
                    className={`transition-colors hover:bg-white/[0.03] ${
                      entry.reassigned ? "bg-destructive/[0.03]" : ""
                    }`}
                  >
                    <td className="px-6 py-4 text-xs font-black text-primary/60">
                      {String(i + 1).padStart(2, '0')}
                    </td>
                    {students.length > 0 && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="size-3 text-primary/40" />
                          <span className="text-[11px] font-bold uppercase text-foreground">
                            {entry.student.name}
                          </span>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <span className="text-[11px] font-medium text-muted-foreground uppercase">{entry.residence.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[11px] font-black uppercase text-foreground">{entry.stage.name}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-black tracking-tighter ${getDistanceColor(
                          entry.stage.distance
                        )}`}
                      >
                        {entry.stage.distance.toFixed(2)} KM
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <a
                        href={directionsUrl(
                          entry.residence.lat,
                          entry.residence.lon,
                          entry.stage.lat,
                          entry.stage.lon
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex size-8 items-center justify-center rounded-lg bg-white/5 text-muted-foreground hover:bg-primary/20 hover:text-primary transition-all border border-white/5"
                      >
                        <Navigation className="size-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Stats footer */}
          <div className="grid grid-cols-3 divide-x border-t">
            <div className="flex flex-col items-center py-3">
              <span className="text-lg font-bold text-success">{stats.close}</span>
              <span className="text-xs text-muted-foreground">{"< 2 km"}</span>
            </div>
            <div className="flex flex-col items-center py-3">
              <span className="text-lg font-bold text-warning">{stats.medium}</span>
              <span className="text-xs text-muted-foreground">{"2-5 km"}</span>
            </div>
            <div className="flex flex-col items-center py-3">
              <span className="text-lg font-bold text-destructive">{stats.far}</span>
              <span className="text-xs text-muted-foreground">{"> 5 km"}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Legend */}
      <Card className="border-border/60">
        <CardContent className="flex items-center justify-center gap-6 py-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-success" />
            <span className="text-xs text-muted-foreground">{"< 2 km - tres proche"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-warning" />
            <span className="text-xs text-muted-foreground">{"2-5 km - accessible"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-destructive" />
            <span className="text-xs text-muted-foreground">{"> 5 km - eloigne"}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
