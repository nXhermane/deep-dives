"use client"

import { useState, useEffect, useCallback } from "react"
import type { Residence, Stage, Student } from "@/lib/types"
import { INIT_RESIDENCES, INIT_STAGES, INIT_STUDENTS } from "@/lib/data"

const STORAGE_KEYS = {
  residences: "stageprox_residences_v1",
  stages: "stageprox_stages_v1",
  students: "stageprox_students_v1",
}

export function useAppStore() {
  const [residences, setResidences] = useState<Residence[]>(INIT_RESIDENCES)
  const [stages, setStages] = useState<Stage[]>(INIT_STAGES)
  const [students, setStudents] = useState<Student[]>(INIT_STUDENTS)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const r = localStorage.getItem(STORAGE_KEYS.residences)
      const s = localStorage.getItem(STORAGE_KEYS.stages)
      const st = localStorage.getItem(STORAGE_KEYS.students)
      if (r) setResidences(JSON.parse(r))
      if (s) setStages(JSON.parse(s))
      if (st) setStudents(JSON.parse(st))
    } catch {
      // ignore
    }
    setLoaded(true)
  }, [])

  const saveResidences = useCallback((data: Residence[]) => {
    setResidences(data)
    try {
      localStorage.setItem(STORAGE_KEYS.residences, JSON.stringify(data))
    } catch {
      // ignore
    }
  }, [])

  const saveStages = useCallback((data: Stage[]) => {
    setStages(data)
    try {
      localStorage.setItem(STORAGE_KEYS.stages, JSON.stringify(data))
    } catch {
      // ignore
    }
  }, [])

  const saveStudents = useCallback((data: Student[]) => {
    setStudents(data)
    try {
      localStorage.setItem(STORAGE_KEYS.students, JSON.stringify(data))
    } catch {
      // ignore
    }
  }, [])

  return {
    residences,
    stages,
    students,
    loaded,
    saveResidences,
    saveStages,
    saveStudents,
  }
}
