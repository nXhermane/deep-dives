export function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function mapsUrl(lat: number, lon: number): string {
  return `https://www.google.com/maps?q=${lat},${lon}`
}

export function directionsUrl(
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number
): string {
  return `https://www.google.com/maps/dir/${fromLat},${fromLon}/${toLat},${toLon}`
}

const NOMINATIM = "https://nominatim.openstreetmap.org"

export interface NominatimResult {
  display_name: string
  lat: string
  lon: string
  address?: {
    city?: string
    town?: string
    village?: string
    hamlet?: string
    suburb?: string
    state?: string
    county?: string
  }
}

export async function geocode(q: string): Promise<NominatimResult[]> {
  const r = await fetch(
    `${NOMINATIM}/search?q=${encodeURIComponent(q)}&format=json&limit=6&addressdetails=1`,
    { headers: { "Accept-Language": "fr" } }
  )
  return r.json()
}

export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<NominatimResult | null> {
  try {
    const r = await fetch(
      `${NOMINATIM}/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
      { headers: { "Accept-Language": "fr" } }
    )
    return r.json()
  } catch {
    return null
  }
}

export function extractCity(result: NominatimResult): string {
  const a = result.address
  if (!a) return ""
  return a.city || a.town || a.village || a.hamlet || a.suburb || a.county || ""
}

export function parseGoogleMapsUrl(
  url: string
): { lat: number; lon: number } | null {
  try {
    const place = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/)
    if (place) return { lat: parseFloat(place[1]), lon: parseFloat(place[2]) }
    const at = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (at) return { lat: parseFloat(at[1]), lon: parseFloat(at[2]) }
    const q = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (q) return { lat: parseFloat(q[1]), lon: parseFloat(q[2]) }
    return null
  } catch {
    return null
  }
}

export function extractNameFromUrl(url: string): string {
  try {
    const match = url.match(/\/place\/([^/@]+)/)
    if (match) return decodeURIComponent(match[1].replace(/\+/g, " "))
    return ""
  } catch {
    return ""
  }
}
