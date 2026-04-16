"use client"

import { useState } from "react"
import { Plus, Trash2, User, MapPin, Home, Globe, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Student, Residence } from "@/lib/types"
import { LocationForm } from "./location-form"

interface StudentsTabProps {
  students: Student[]
  residences: Residence[]
  onSaveStudents: (students: Student[]) => void
  onSaveResidences: (residences: Residence[]) => void
}

export function StudentsTab({
  students,
  residences,
  onSaveStudents,
  onSaveResidences,
}: StudentsTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [studentName, setStudentName] = useState("")
  const [residenceMode, setResidenceMode] = useState<"select" | "create">("select")
  const [selectedResidenceId, setSelectedResidenceId] = useState<string>("")
  const [showNewResForm, setShowNewResForm] = useState(false)
  const [searchFilter, setSearchFilter] = useState("")

  const handleAddStudent = () => {
    if (!studentName.trim() || !selectedResidenceId) return
    const newStudent: Student = {
      id: Date.now(),
      name: studentName.trim(),
      residenceId: parseInt(selectedResidenceId),
    }
    onSaveStudents([...students, newStudent])
    setStudentName("")
    setSelectedResidenceId("")
    setDialogOpen(false)
  }

  const handleNewResidence = (residence: Residence) => {
    onSaveResidences([...residences, residence])
    setSelectedResidenceId(String(residence.id))
    setShowNewResForm(false)
    setResidenceMode("select")
  }

  const removeStudent = (id: number) => {
    onSaveStudents(students.filter((s) => s.id !== id))
  }

  const getResidence = (resId: number) => {
    return residences.find((r) => r.id === resId)
  }

  const filteredStudents = searchFilter.trim()
    ? students.filter(
        (s) =>
          s.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
          getResidence(s.residenceId)?.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
          getResidence(s.residenceId)?.city?.toLowerCase().includes(searchFilter.toLowerCase())
      )
    : students

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tighter text-foreground uppercase text-glow">
            Répertoire Étudiants
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="size-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--primary)]" />
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {students.length} Unités indexées
            </p>
          </div>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="rounded-xl group">
          <Plus className="size-4 mr-2 transition-transform group-hover:rotate-90" />
          Nouveau
        </Button>
      </div>

      {/* Search bar */}
      {students.length > 0 && (
        <div className="relative group">
          <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary/30 to-accent/30 opacity-0 blur transition duration-500 group-focus-within:opacity-100" />
          <div className="relative">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Scanner la base de données..."
              className="h-12 pl-12 bg-white/5 border-white/10 rounded-xl backdrop-blur-md focus:border-primary/50 transition-all font-medium uppercase text-xs tracking-widest"
            />
          </div>
        </div>
      )}

      {students.length === 0 ? (
        <Card className="border-dashed border-white/10 bg-white/[0.02]">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
              <div className="relative flex size-20 items-center justify-center rounded-3xl bg-white/5 border border-white/10 glass shadow-2xl">
                <User className="size-8 text-primary/40" />
              </div>
            </div>
            <h3 className="mt-6 text-sm font-black uppercase tracking-widest text-foreground">Base de données vide</h3>
            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Initialisez l'entrée d'un nouvel étudiant
            </p>
            <Button onClick={() => setDialogOpen(true)} variant="outline" className="mt-6">
              Lancer l'indexation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filteredStudents.map((student, i) => {
            const res = getResidence(student.residenceId)
            return (
              <Card
                key={student.id}
                className="group relative overflow-hidden border-white/5 bg-white/5 transition-all duration-500 hover:border-primary/40 hover:bg-white/[0.08] hover:shadow-[0_0_30px_rgba(168,85,247,0.1)]"
              >
                <div className="absolute top-0 right-0 p-2">
                   <div className="size-1 rounded-full bg-primary/40 group-hover:bg-primary group-hover:shadow-[0_0_8px_var(--primary)] transition-all" />
                </div>
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-md rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-white/10 text-xs font-black text-primary transition-transform group-hover:scale-110">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs uppercase tracking-wider text-foreground truncate group-hover:text-primary transition-colors">
                        {student.name}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <Home className="size-3 text-muted-foreground" />
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground truncate max-w-[120px]">
                          {res?.name ?? "Inconnue"}
                        </span>
                      </div>
                      {res?.city && (
                        <Badge
                          variant="secondary"
                          className="bg-accent/10 text-accent border-accent/20"
                        >
                          {res.city}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive/40 hover:text-destructive hover:bg-destructive/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    onClick={() => removeStudent(student.id)}
                    aria-label={`Supprimer ${student.name}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
          {searchFilter && filteredStudents.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Aucun resultat pour &quot;{searchFilter}&quot;
            </p>
          )}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg glass border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter text-glow">Nouvelle Unité</DialogTitle>
            <DialogDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Indexation d'un nouvel étudiant dans le système
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-6 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="student-name" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                Identifiant Étudiant
              </Label>
              <Input
                id="student-name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="NOM DE L'UNITÉ"
                className="h-10"
              />
            </div>

            <div className="flex flex-col gap-3">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Localisation Résidentielle</Label>
              <div className="flex gap-2 p-1 glass-dark rounded-xl border border-white/5 w-fit">
                <button
                  onClick={() => {
                    setResidenceMode("select")
                    setShowNewResForm(false)
                  }}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                    residenceMode === "select"
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <MapPin className="size-3" />
                  Existante
                </button>
                <button
                  onClick={() => {
                    setResidenceMode("create")
                    setShowNewResForm(true)
                  }}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                    residenceMode === "create"
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Plus className="size-3" />
                  Nouvelle
                </button>
              </div>
            </div>

            {residenceMode === "select" && (
              <Select
                value={selectedResidenceId}
                onValueChange={setSelectedResidenceId}
              >
                <SelectTrigger className="w-full h-10 bg-white/5 border-white/10 rounded-xl focus:ring-primary/20 transition-all text-[11px] font-bold uppercase tracking-wider">
                  <SelectValue placeholder="SÉLECTIONNER UN SECTEUR" />
                </SelectTrigger>
                <SelectContent>
                  {residences.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      <div className="flex items-center gap-2">
                        <span>{r.name}</span>
                        {r.city && (
                          <span className="text-xs text-muted-foreground">
                            ({r.city})
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {showNewResForm && (
              <div className="rounded-xl border border-dashed border-primary/20 bg-muted/30 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Creer une nouvelle residence
                </p>
                <LocationForm
                  labelField="Nom du quartier"
                  onAdd={handleNewResidence}
                  compact
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleAddStudent}
              disabled={!studentName.trim() || !selectedResidenceId}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
