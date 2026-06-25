export const BUDGET_THEMES = [
  { label: "Green", value: "#277C78" },
  { label: "Cyan", value: "#82C9D7" },
  { label: "Navy", value: "#626070" },
  { label: "Sand", value: "#F2CDAC" },
  { label: "Purple", value: "#826CB0" },
  { label: "Red", value: "#C94736" },
  { label: "Turquoise", value: "#597C7C" },
  { label: "Brown", value: "#93674F" },
  { label: "Magenta", value: "#934F6F" },
  { label: "Blue", value: "#3F82B2" },
  { label: "Grey", value: "#97A0AC" },
  { label: "Army", value: "#7F9161" },
  { label: "Pink", value: "#AF81BA" },
  { label: "Orange", value: "#BE6C49" },
] as const

export type BudgetTheme = (typeof BUDGET_THEMES)[number]["value"]
