/**
 * The composite agent pipeline: how Vinayak actually builds agentic systems,
 * distilled from the clinical multi-agent work (intent routing, adaptive
 * retrieval, eval-driven self-improvement), the LangGraph research workflow
 * (planner -> critic -> eval), and the LangChain/FAISS tool-calling agent.
 *
 * Layout is DELIBERATELY hand-authored rather than force-simulated. The
 * topology is fixed and known, so a physics solver can only make it worse:
 * it produces a different, uncontrollable result on every load. `col` is the
 * pipeline depth (left -> right), `row` the vertical slot, `z` a small depth
 * offset purely for art direction.
 */

export type NodeKind = "request" | "router" | "agent" | "resource" | "synthesis" | "verify" | "output";

export interface PipelineNode {
  id: string;
  label: string;
  /** Small mono caption under the label - the concrete tech, not a category. */
  detail: string;
  kind: NodeKind;
  col: number;
  row: number;
  z: number;
  /** Scroll stage at which this node lights up. */
  stage: number;
}

export interface PipelineLink {
  source: string;
  target: string;
  stage: number;
  /** Long return path that arcs back under the graph, drawn differently. */
  feedback?: boolean;
}

export interface PipelineStage {
  id: string;
  label: string;
  copy: string;
}

/** Emissive colours, tuned to read against both --bg values in tokens.css. */
export const KIND_COLOR: Record<NodeKind, string> = {
  request: "#83e4e5",
  router: "#e8672e",
  agent: "#a78bfa",
  resource: "#eda100",
  synthesis: "#ff8f5e",
  verify: "#1baf7a",
  output: "#83e4e5",
};

export const KIND_RADIUS: Record<NodeKind, number> = {
  request: 0.44,
  router: 0.72,
  agent: 0.52,
  resource: 0.4,
  synthesis: 0.68,
  verify: 0.44,
  output: 0.56,
};

export const PIPELINE_NODES: PipelineNode[] = [
  { id: "request", label: "Request", detail: "natural language", kind: "request", col: 0, row: 0, z: 0, stage: 0 },

  { id: "router", label: "Intent Router", detail: "XLM-RoBERTa", kind: "router", col: 1, row: 0, z: 0.3, stage: 1 },

  { id: "retrieval", label: "Retrieval Agent", detail: "adaptive strategy", kind: "agent", col: 2, row: -1, z: 0.9, stage: 2 },
  { id: "tooling", label: "Tool Agent", detail: "LangChain", kind: "agent", col: 2, row: 0, z: -0.5, stage: 2 },
  { id: "reasoning", label: "Reasoning Agent", detail: "LangGraph", kind: "agent", col: 2, row: 1, z: 0.7, stage: 2 },

  { id: "index", label: "Hybrid Index", detail: "FAISS · dense + sparse", kind: "resource", col: 3, row: -1.2, z: 1.2, stage: 3 },
  { id: "sources", label: "Systems of Record", detail: "CRM · ERP · Docs", kind: "resource", col: 3, row: 0.2, z: -0.9, stage: 3 },

  { id: "synthesis", label: "Synthesis", detail: "grounded generation", kind: "synthesis", col: 4, row: 0, z: 0.2, stage: 4 },

  { id: "critic", label: "Critic", detail: "self-review", kind: "verify", col: 5, row: -0.95, z: 0.6, stage: 5 },
  { id: "eval", label: "Eval", detail: "RAGAS · LangSmith", kind: "verify", col: 5, row: 0.95, z: -0.4, stage: 5 },

  { id: "output", label: "Grounded Answer", detail: "cited · auditable", kind: "output", col: 6, row: 0, z: 0, stage: 6 },
];

export const PIPELINE_LINKS: PipelineLink[] = [
  { source: "request", target: "router", stage: 1 },

  { source: "router", target: "retrieval", stage: 2 },
  { source: "router", target: "tooling", stage: 2 },
  { source: "router", target: "reasoning", stage: 2 },

  { source: "retrieval", target: "index", stage: 3 },
  { source: "tooling", target: "sources", stage: 3 },

  { source: "index", target: "synthesis", stage: 4 },
  { source: "sources", target: "synthesis", stage: 4 },
  { source: "reasoning", target: "synthesis", stage: 4 },

  { source: "synthesis", target: "critic", stage: 5 },
  { source: "critic", target: "eval", stage: 5 },

  { source: "eval", target: "output", stage: 6 },

  // The edge that makes this architecture yours: evaluation scores feed back
  // into the router, so routing decisions improve with every query.
  { source: "eval", target: "router", stage: 6, feedback: true },
];

export const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: "request",
    label: "Request",
    copy: "A question arrives in plain language. Nothing about it says which system holds the answer.",
  },
  {
    id: "route",
    label: "Route by intent",
    copy: "A fine-tuned classifier reads intent first. Routing is a decision, not a default — so the query only pays for the work it actually needs.",
  },
  {
    id: "fan-out",
    label: "Fan out",
    copy: "Specialised agents run in parallel, each with one job and its own tools. No single agent has to be good at everything.",
  },
  {
    id: "ground",
    label: "Ground it",
    copy: "Retrieval goes hybrid — dense and sparse together over FAISS — while the tool agent reaches into the real systems of record.",
  },
  {
    id: "synthesize",
    label: "Synthesise",
    copy: "Everything the agents found converges into one answer, generated strictly against retrieved evidence.",
  },
  {
    id: "verify",
    label: "Verify",
    copy: "A critic reviews the draft, then eval scores it on faithfulness and relevance. An answer that cannot be traced does not ship.",
  },
  {
    id: "improve",
    label: "Close the loop",
    copy: "Those eval scores flow back into the router. The pipeline gets measurably better at choosing its own strategy over time.",
  },
];
