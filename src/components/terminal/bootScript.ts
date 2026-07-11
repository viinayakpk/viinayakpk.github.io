export interface TerminalLine {
  prefix?: string;
  text: string;
  color?: "codex" | "claude" | "kimi" | "muted" | "accent";
}

export const BOOT_LINES: TerminalLine[] = [
  { text: "Agent OS v1.0 [Vinayak Kooloth Edition]", color: "muted" },
  { text: "Loading agentic workflow... done.", color: "muted" },
  { text: "Initializing engineering loop... done.", color: "muted" },
  { text: "" },
  { prefix: "codex/plan", text: "$ inspect repo -> constraints", color: "codex" },
  { prefix: "codex/plan", text: "$ split work -> worker loops", color: "codex" },
  { prefix: "codex/plan", text: "$ patch -> test -> review", color: "codex" },
  { text: "" },
  { prefix: "claude/diff", text: "> architecture pressure test", color: "claude" },
  { prefix: "claude/diff", text: "> trace failure path", color: "claude" },
  { prefix: "claude/diff", text: "> keep final call human", color: "claude" },
  { text: "" },
  { prefix: "kimi/reason", text: "> local read on legacy context", color: "kimi" },
  { prefix: "kimi/reason", text: "> schema risk surfaced", color: "kimi" },
  { prefix: "kimi/reason", text: "> smaller change proposed", color: "kimi" },
  { text: "" },
  { text: "status: engineering judgment stays human. agents stay tools.", color: "accent" },
];
