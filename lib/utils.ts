import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convert OKLCH (L in 0..1, C in 0..~0.5, H in degrees) to sRGB hex (#RRGGBB)
export function oklchToHex(L: number, C: number, Hdeg: number): string {
  // Convert OKLCH -> OKLab
  const H = (Hdeg * Math.PI) / 180
  const a = C * Math.cos(H)
  const b = C * Math.sin(H)

  // OKLab -> LMS'
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b

  // LMS' -> linear RGB
  const l = l_ * l_ * l_
  const m = m_ * m_ * m_
  const s = s_ * s_ * s_

  let r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
  let g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
  let b2 = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s

  // Linear RGB -> sRGB
  const compand = (x: number) =>
    x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055

  r = compand(r)
  g = compand(g)
  b2 = compand(b2)

  // Clamp 0..1
  const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
  r = clamp01(r)
  g = clamp01(g)
  b2 = clamp01(b2)

  // To hex
  const toHex = (x: number) => {
    const n = Math.round(x * 255)
    const s = n.toString(16).padStart(2, "0")
    return s
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b2)}`
}
