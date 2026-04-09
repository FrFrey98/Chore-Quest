import { describe, it, expect } from "vitest"
import { applyTrainingBoost } from "@/lib/dog-training/progress"

const day = (n: number) => new Date(2026, 0, n, 12, 0, 0)

describe("applyTrainingBoost", () => {
  it("promotes new → acquisition on first training", () => {
    const result = applyTrainingBoost({
      status: "new",
      progress: 0,
      bestStatus: "new",
      trainedCount: 0,
      firstTrainedAt: null,
      rating: "okay",
      now: day(1),
    })
    expect(result.status).toBe("acquisition")
    expect(result.progress).toBeCloseTo(0.08)
    expect(result.trainedCount).toBe(1)
    expect(result.bestStatus).toBe("acquisition")
  })

  it("adds boost within same stage", () => {
    const result = applyTrainingBoost({
      status: "acquisition",
      progress: 0.3,
      bestStatus: "acquisition",
      trainedCount: 3,
      firstTrainedAt: day(1),
      rating: "good",
      now: day(2),
    })
    expect(result.status).toBe("acquisition")
    expect(result.progress).toBeCloseTo(0.45)
    expect(result.trainedCount).toBe(4)
  })

  it("does not promote to fluency without 5 sessions", () => {
    const result = applyTrainingBoost({
      status: "acquisition",
      progress: 0.95,
      bestStatus: "acquisition",
      trainedCount: 2,
      firstTrainedAt: day(1),
      rating: "good",
      now: day(2),
    })
    expect(result.status).toBe("acquisition")
    expect(result.progress).toBeCloseTo(1.0)
    expect(result.trainedCount).toBe(3)
  })

  it("promotes acquisition → fluency when sessions and progress both met", () => {
    const result = applyTrainingBoost({
      status: "acquisition",
      progress: 0.95,
      bestStatus: "acquisition",
      trainedCount: 4,
      firstTrainedAt: day(1),
      rating: "good",
      now: day(2),
    })
    expect(result.status).toBe("fluency")
    expect(result.progress).toBe(0)
    expect(result.bestStatus).toBe("fluency")
    expect(result.trainedCount).toBe(5)
  })

  it("does not promote to proficiency without minDays elapsed", () => {
    const result = applyTrainingBoost({
      status: "fluency",
      progress: 0.95,
      bestStatus: "fluency",
      trainedCount: 9,
      firstTrainedAt: day(1),
      rating: "good",
      now: day(5),
    })
    expect(result.status).toBe("fluency")
    expect(result.progress).toBeCloseTo(1.0)
  })

  it("promotes fluency → proficiency when all criteria met", () => {
    const result = applyTrainingBoost({
      status: "fluency",
      progress: 0.95,
      bestStatus: "fluency",
      trainedCount: 9,
      firstTrainedAt: day(1),
      rating: "good",
      now: day(30),
    })
    expect(result.status).toBe("proficiency")
    expect(result.progress).toBe(0)
    expect(result.trainedCount).toBe(10)
  })

  it("sets firstTrainedAt on first training", () => {
    const result = applyTrainingBoost({
      status: "new",
      progress: 0,
      bestStatus: "new",
      trainedCount: 0,
      firstTrainedAt: null,
      rating: "okay",
      now: day(5),
    })
    expect(result.firstTrainedAt?.getTime()).toBe(day(5).getTime())
  })
})
