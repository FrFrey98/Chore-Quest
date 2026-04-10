import { describe, it, expect } from "vitest"
import {
  statusRank,
  nextStatus,
  previousStatus,
  compareStatus,
  isHigherStatus,
} from "@/lib/dog-training/status"

describe("status utilities", () => {
  it("ranks statuses 0 through 5", () => {
    expect(statusRank("new")).toBe(0)
    expect(statusRank("acquisition")).toBe(1)
    expect(statusRank("mastery")).toBe(5)
  })

  it("returns next status", () => {
    expect(nextStatus("new")).toBe("acquisition")
    expect(nextStatus("proficiency")).toBe("maintenance")
    expect(nextStatus("mastery")).toBe(null)
  })

  it("returns previous status", () => {
    expect(previousStatus("new")).toBe(null)
    expect(previousStatus("acquisition")).toBe("new")
    expect(previousStatus("mastery")).toBe("maintenance")
  })

  it("compares statuses", () => {
    expect(compareStatus("fluency", "acquisition")).toBeGreaterThan(0)
    expect(compareStatus("new", "new")).toBe(0)
    expect(compareStatus("acquisition", "proficiency")).toBeLessThan(0)
  })

  it("checks higher status", () => {
    expect(isHigherStatus("fluency", "acquisition")).toBe(true)
    expect(isHigherStatus("fluency", "fluency")).toBe(false)
    expect(isHigherStatus("new", "mastery")).toBe(false)
  })
})
