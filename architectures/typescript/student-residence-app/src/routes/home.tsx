import { Users, Home, Building2, BarChart3, MapPin, Orbit, Sparkles } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/hooks/use-app-store"
import { StudentsTab } from "@/components/students-tab"
import { LocationPanel } from "@/components/location-panel"
import { ClassementTab } from "@/components/classement-tab"

export default function Page() {
  const {
    residences,
    stages,
    students,
    loaded,
    saveResidences,
    saveStages,
    saveStudents,
  } = useAppStore()

  if (!loaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-background overflow-hidden">
        {/* Animated background for loading */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)] opacity-10 animate-pulse" />

        <div className="relative flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
            <div className="relative flex size-20 items-center justify-center rounded-3xl bg-primary/10 border border-primary/30 glass-dark shadow-[0_0_30px_rgba(168,85,247,0.4)]">
              <Orbit className="size-10 text-primary animate-[spin_4s_linear_infinite]" />
              <MapPin className="size-5 text-primary absolute" />
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-2xl font-bold tracking-widest text-foreground uppercase text-glow">StageProx</h2>
            <div className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary animate-bounce" />
              <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
              <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[10%] -left-[10%] size-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] size-[30%] rounded-full bg-accent/10 blur-[100px]" />
        <div className="absolute -bottom-[10%] left-[20%] size-[50%] rounded-full bg-primary/5 blur-[150px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl">
        <div className="relative mx-auto max-w-5xl px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-primary to-accent opacity-50 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-200" />
                <div className="relative flex size-12 items-center justify-center rounded-xl bg-background border border-white/10 shadow-xl">
                  <Orbit className="size-6 text-primary" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black tracking-tighter text-foreground sm:text-2xl text-glow uppercase">
                    StageProx
                  </h1>
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-xs font-bold uppercase tracking-widest">
                    v3.0 Core
                  </Badge>
                </div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">
                  Optimisation spatiale de stages
                </p>
              </div>
            </div>

            {/* Live counters - Futuristic pill style */}
            <div className="flex items-center gap-3">
              {[
                { label: 'Etudiants', value: students.length, icon: Users, color: 'text-primary' },
                { label: 'Residences', value: residences.length, icon: Home, color: 'text-accent' },
                { label: 'Stages', value: stages.length, icon: Building2, color: 'text-warning' }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-end">
                  <div className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/5 bg-white/5 px-2.5 py-1 sm:px-3 glass">
                    <item.icon className={`size-3 ${item.color}`} />
                    <span className="text-xs sm:text-xs font-black font-mono">{item.value}</span>
                  </div>
                  <span className="hidden sm:block text-[10px] uppercase tracking-tighter text-muted-foreground mt-0.5">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Tabs defaultValue="students" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-14 p-1 glass-dark rounded-2xl border border-white/10">
            {[
              { id: 'students', label: 'Etudiants', icon: Users },
              { id: 'residences', label: 'Residences', icon: Home },
              { id: 'stages', label: 'Stages', icon: Building2 },
              { id: 'classement', label: 'Classement', icon: BarChart3 },
            ].map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="rounded-xl transition-all duration-300 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_15px_rgba(168,85,247,0.2)] group"
              >
                <tab.icon className="size-4 mr-2 transition-transform group-data-[state=active]:scale-110" />
                <span className="hidden sm:inline font-bold uppercase tracking-widest text-xs">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-6">
            <TabsContent value="students">
              <StudentsTab
                students={students}
                residences={residences}
                onSaveStudents={saveStudents}
                onSaveResidences={saveResidences}
              />
            </TabsContent>

            <TabsContent value="residences">
              <LocationPanel
                title="Residences des etudiants"
                description={`${residences.length} residence(s) enregistree(s)`}
                items={residences}
                onSave={saveResidences}
                labelField="Nom / Quartier"
                accentClass="bg-primary"
                emptyIcon={<Home className="size-6 text-muted-foreground" />}
                students={students}
              />
            </TabsContent>

            <TabsContent value="stages">
              <LocationPanel
                title="Lieux de stage"
                description={`${stages.length} lieu(x) de stage enregistre(s)`}
                items={stages}
                onSave={saveStages}
                labelField="Nom du lieu de stage"
                accentClass="bg-warning text-warning-foreground"
                emptyIcon={<Building2 className="size-6 text-muted-foreground" />}
                showCapacity
              />
            </TabsContent>

            <TabsContent value="classement">
              <ClassementTab
                students={students}
                residences={residences}
                stages={stages}
              />
            </TabsContent>
          </div>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-white/5 bg-background/40 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--primary)]" />
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                StageProx v3.0 // Neural Engine Active
              </p>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-xs uppercase tracking-widest text-muted-foreground/60">© 2024 Spatial Intelligence</span>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary">
                <Sparkles className="size-3" />
                Quantum Ready
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
