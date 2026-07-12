export interface Stat {
  id: string;
  value: string;
  label: string;
}

export const STATS: Stat[] = [
  { id: "accuracy", value: "94.5%", label: "Thesis Model Accuracy" },
  { id: "effort", value: "60%+", label: "Manual Effort Reduced" },
  { id: "agents", value: "9", label: "Agent Workflow Stages" },
];
