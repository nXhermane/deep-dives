export interface Location {
  id: number
  name: string
  lat: number
  lon: number
  url: string
  address?: string
  city?: string // ville ou village associe
}

export interface Residence extends Location {}

export interface Stage extends Location {
  capacity?: number // max number of students, undefined = unlimited
}

export interface Student {
  id: number
  name: string
  residenceId: number
}

export interface RankedStage extends Stage {
  distance: number
}

export interface ClassementEntry {
  student: Student
  residence: Residence
  stage: RankedStage
  allStages: RankedStage[]
  reassigned?: boolean
  isRandomTieBreak?: boolean
}
