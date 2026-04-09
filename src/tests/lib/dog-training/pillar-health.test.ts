import { describe, it, expect } from "vitest"
import { calculatePillarHealth, healthBand } from "@/lib/dog-training/pillar-health"

describe("calculatePillarHealth", () => {
  it("returns 0 for empty pillar", () => {
    expect(calculatePillarHealth([])).toBe(0)
  })

  it("returns 0 when only untrained skills", () => {
    expect(
      calculatePillarHealth([
        { status: "new", progress: 0, trainedCount: 0 },
        { status: "new", progress: 0, trainedCount: 0 },
      ]),
    ).toBe(0)
  })

  it("returns 100 for all-mastery fully-progressed skills", () => {
    expect(
      calculatePillarHealth([
        { status: "mastery", progress: 1, trainedCount: 40 },
        { status: "mastery", progress: 1, trainedCount: 40 },
      ]),
    ).toBe(100)
  })

  it("averages trained skills only", () => {
    const result = calculatePillarHealth([
      { status: "fluency", progress: 0.5, trainedCount: 5 }, // (2+0.5)/5=0.5 → 50
      { status: "new", progress: 0, trainedCount: 0 }, // ignored
    ])
    expect(result).toBe(50)
  })

  it("returns rounded integer", () => {
    const result = calculatePillarHealth([
      { status: "acquisition", progress: 0.3, trainedCount: 1 }, // (1+0.3)/5=0.26 → 26
    ])
    expect(result).toBe(26)
  })
})

describe("healthBand", () => {
  it("classifies into success/accent/warning/danger", () => {
    expect(healthBand(90)).toBe("success")
    expect(healthBand(75)).toBe("success")
    expect(healthBand(50)).toBe("accent")
    expect(healthBand(40)).toBe("accent")
    expect(healthBand(30)).toBe("warning")
    expect(healthBand(15)).toBe("warning")
    expect(healthBand(10)).toBe("danger")
    expect(healthBand(0)).toBe("danger")
  })
})
