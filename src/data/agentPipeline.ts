/**
 * The agent architecture: how Vinayak actually builds these systems.
 *
 * Distilled from the clinical multi-agent work (intent routing, adaptive retrieval,
 * eval-driven self-improvement), the LangGraph research workflow (planner → critic →
 * eval), and the LangChain/FAISS tool-calling agent.
 *
 * LAYOUT MODEL. Every node carries a `tier` (how deep into the pipeline it sits) and a
 * `lane` (where it sits across the fan-out). Nothing here stores pixel coordinates —
 * that separation is what lets the same architecture render as a wide diagram on a
 * desktop and a tall one on a phone, without maintaining two copies of the truth.
 *
 * The topology is hand-authored on purpose. It is fixed and known, so a force
 * simulation could only make it worse: it would produce a different, uncontrollable
 * arrangement on every load.
 */

export type NodeKind =
  | "io" // what goes in and what comes out
  | "gate" // guardrails — the things that can refuse
  | "router" // the routing decision
  | "llm" // an LLM call doing real work
  | "agent" // an autonomous sub-agent
  | "store" // data and tools the agents reach for
  | "quality"; // critic, eval — the part that keeps it honest

export interface PipelineNode {
  id: string;
  label: string;
  /** The concrete tech, not a category. This is the line that proves it's real. */
  detail: string;
  kind: NodeKind;
  /** Pipeline depth. Rendered as a column (wide) or a row (compact). */
  tier: number;
  /** Position across the fan-out, in lane units. 0 is the spine. */
  lane: number;
  /** Which narrative beat lights this up. */
  stage: number;
  /** Emphasised: the load-bearing nodes get drawn larger. */
  major?: boolean;
}

export interface PipelineLink {
  source: string;
  target: string;
  stage: number;
  /** A return path — drawn dashed, and routed around the graph rather than through it. */
  feedback?: boolean;
}

export interface PipelinePlane {
  id: string;
  label: string;
  /** Inclusive tier range this plane spans. */
  from: number;
  to: number;
}

export interface PipelineStage {
  id: string;
  label: string;
  copy: string;
}

/**
 * Colours are literal hex, not theme tokens, and they are chosen to hold up against
 * BOTH backgrounds — the cream `#fff8f4` and the near-black `#14100d`. A pale cyan that
 * looks right on dark simply vanishes on cream, which is exactly the mistake the old
 * 3D scene made everywhere.
 */
export const KIND_COLOR: Record<NodeKind, string> = {
  io: "#2a9d9f",
  gate: "#c98a1e",
  router: "#e8672e",
  llm: "#7c5cd6",
  agent: "#3b7dd8",
  store: "#b06a3b",
  quality: "#2f9e6e",
};

/** The horizontal bands. Naming the planes is what makes a diagram read as architecture. */
export const PIPELINE_PLANES: PipelinePlane[] = [
  { id: "control", label: "CONTROL PLANE", from: 0, to: 4 },
  { id: "agents", label: "AGENT PLANE", from: 5, to: 5 },
  { id: "capability", label: "CAPABILITY", from: 6, to: 6 },
  { id: "data", label: "DATA PLANE", from: 7, to: 7 },
  { id: "context", label: "CONTEXT ASSEMBLY", from: 8, to: 8 },
  { id: "quality", label: "QUALITY GATE", from: 9, to: 11 },
];

export const PIPELINE_NODES: PipelineNode[] = [
  // ── Control plane ────────────────────────────────────────────────────────────
  { id: "request", label: "Request", detail: "natural language", kind: "io", tier: 0, lane: 0, stage: 0 },
  {
    id: "guard-in",
    label: "Input Guardrails",
    detail: "PII redaction · injection defence",
    kind: "gate",
    tier: 1,
    lane: 0,
    stage: 0,
  },
  {
    id: "router",
    label: "Intent Router",
    detail: "XLM-RoBERTa · fine-tuned",
    kind: "router",
    tier: 2,
    lane: 0,
    stage: 1,
    major: true,
  },
  { id: "planner", label: "Planner", detail: "LLM · decomposes to a task DAG", kind: "llm", tier: 3, lane: -0.85, stage: 2 },
  { id: "memory", label: "Memory", detail: "episodic + working state", kind: "store", tier: 3, lane: 0.85, stage: 2 },
  {
    id: "orchestrator",
    label: "Orchestrator",
    detail: "LangGraph supervisor",
    kind: "llm",
    tier: 4,
    lane: 0,
    stage: 2,
    major: true,
  },

  // ── Agent plane: the fan-out ─────────────────────────────────────────────────
  { id: "a-retrieve", label: "Retrieval Agent", detail: "adaptive strategy", kind: "agent", tier: 5, lane: -1.5, stage: 3 },
  { id: "a-tool", label: "Tool Agent", detail: "MCP · function calling", kind: "agent", tier: 5, lane: -0.5, stage: 3 },
  { id: "a-reason", label: "Reasoning Agent", detail: "self-consistency", kind: "agent", tier: 5, lane: 0.5, stage: 3 },
  { id: "a-code", label: "Code Agent", detail: "sandboxed execution", kind: "agent", tier: 5, lane: 1.5, stage: 3 },

  // ── Capability: what each agent actually reaches for ──────────────────────────
  { id: "hybrid", label: "Hybrid Search", detail: "BM25 + dense · HyDE rewrite", kind: "llm", tier: 6, lane: -1.5, stage: 4 },
  { id: "mcp", label: "MCP Servers", detail: "CRM · Jira · web", kind: "store", tier: 6, lane: -0.5, stage: 4 },
  { id: "consist", label: "Self-Consistency", detail: "n-sample · majority vote", kind: "llm", tier: 6, lane: 0.5, stage: 4 },
  { id: "sandbox", label: "Sandbox", detail: "isolated Python", kind: "store", tier: 6, lane: 1.5, stage: 4 },

  // ── Data plane ───────────────────────────────────────────────────────────────
  { id: "vector", label: "Vector Store", detail: "FAISS · Qdrant", kind: "store", tier: 7, lane: -1.5, stage: 5 },
  { id: "sor", label: "Systems of Record", detail: "CRM · ERP · Postgres", kind: "store", tier: 7, lane: -0.5, stage: 5 },
  { id: "docs", label: "Document Store", detail: "S3 · parsed PDFs", kind: "store", tier: 7, lane: 0.5, stage: 5 },
  { id: "cache", label: "Semantic Cache", detail: "Redis · embedding TTL", kind: "store", tier: 7, lane: 1.5, stage: 5 },

  // ── Context assembly ─────────────────────────────────────────────────────────
  { id: "rerank", label: "Reranker", detail: "cross-encoder · top-k", kind: "llm", tier: 8, lane: -0.75, stage: 6 },
  { id: "compress", label: "Context Compression", detail: "token budget · dedupe", kind: "llm", tier: 8, lane: 0.75, stage: 6 },

  // ── Synthesis ────────────────────────────────────────────────────────────────
  {
    id: "synthesis",
    label: "Synthesis",
    detail: "grounded generation · cited",
    kind: "llm",
    tier: 9,
    lane: 0,
    stage: 7,
    major: true,
  },

  // ── Quality gate ─────────────────────────────────────────────────────────────
  { id: "critic", label: "Critic", detail: "LLM-as-judge · self-review", kind: "quality", tier: 10, lane: -0.85, stage: 8 },
  { id: "eval", label: "Eval", detail: "RAGAS · LangSmith traces", kind: "quality", tier: 10, lane: 0.85, stage: 8 },
  {
    id: "guard-out",
    label: "Output Guardrails",
    detail: "faithfulness gate · policy",
    kind: "gate",
    tier: 11,
    lane: 0,
    stage: 9,
  },

  // ── Egress ───────────────────────────────────────────────────────────────────
  { id: "answer", label: "Grounded Answer", detail: "cited · auditable", kind: "io", tier: 12, lane: 0, stage: 9, major: true },
];

export const PIPELINE_LINKS: PipelineLink[] = [
  { source: "request", target: "guard-in", stage: 0 },
  { source: "guard-in", target: "router", stage: 1 },

  { source: "router", target: "planner", stage: 2 },
  { source: "planner", target: "orchestrator", stage: 2 },
  { source: "memory", target: "orchestrator", stage: 2 },

  { source: "orchestrator", target: "a-retrieve", stage: 3 },
  { source: "orchestrator", target: "a-tool", stage: 3 },
  { source: "orchestrator", target: "a-reason", stage: 3 },
  { source: "orchestrator", target: "a-code", stage: 3 },

  { source: "a-retrieve", target: "hybrid", stage: 4 },
  { source: "a-tool", target: "mcp", stage: 4 },
  { source: "a-reason", target: "consist", stage: 4 },
  { source: "a-code", target: "sandbox", stage: 4 },

  { source: "hybrid", target: "vector", stage: 5 },
  { source: "hybrid", target: "docs", stage: 5 },
  { source: "mcp", target: "sor", stage: 5 },
  { source: "mcp", target: "cache", stage: 5 },

  { source: "vector", target: "rerank", stage: 6 },
  { source: "docs", target: "rerank", stage: 6 },
  { source: "sor", target: "compress", stage: 6 },
  { source: "cache", target: "compress", stage: 6 },
  { source: "consist", target: "compress", stage: 6 },
  { source: "sandbox", target: "compress", stage: 6 },

  { source: "rerank", target: "synthesis", stage: 7 },
  { source: "compress", target: "synthesis", stage: 7 },

  { source: "synthesis", target: "critic", stage: 8 },
  { source: "critic", target: "eval", stage: 8 },
  { source: "eval", target: "guard-out", stage: 9 },
  { source: "guard-out", target: "answer", stage: 9 },

  /*
   * The two edges that make this architecture *mine* rather than a framework diagram.
   *
   * The critic sends a failing draft back to be regenerated — so a bad answer is caught
   * before it ships, not after. And eval scores flow all the way back into the router,
   * so the system's routing decisions measurably improve with every query it serves.
   * A pipeline without these is a pipeline that cannot get better.
   */
  { source: "critic", target: "synthesis", stage: 8, feedback: true },
  { source: "eval", target: "router", stage: 9, feedback: true },
];

export const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: "request",
    label: "Request",
    copy: "A question arrives in plain language. Before anything else touches it, guardrails strip PII and screen for prompt injection — an untrusted string is not an instruction.",
  },
  {
    id: "route",
    label: "Route by intent",
    copy: "A fine-tuned classifier reads intent first. Routing is a decision, not a default — so a simple lookup never pays for a full agent swarm, and a hard question never gets fobbed off with one.",
  },
  {
    id: "plan",
    label: "Plan and orchestrate",
    copy: "A planner LLM decomposes the request into a task DAG, reading working and episodic memory for what came before. A LangGraph supervisor owns execution from there.",
  },
  {
    id: "fan-out",
    label: "Fan out to sub-agents",
    copy: "Specialised agents run in parallel — retrieval, tools, reasoning, code — each with one job and its own permissions. No single agent has to be good at everything.",
  },
  {
    id: "reach",
    label: "Reach for capability",
    copy: "Retrieval rewrites the query (HyDE) and goes hybrid, dense and sparse together. The tool agent speaks MCP. Reasoning samples itself n times and votes. Code runs sandboxed, never on the host.",
  },
  {
    id: "ground",
    label: "Ground it in real data",
    copy: "Vectors, systems of record, parsed documents, and a semantic cache that means the same question is never paid for twice. Everything downstream is anchored to something that exists.",
  },
  {
    id: "assemble",
    label: "Assemble the context",
    copy: "A cross-encoder reranks what came back, then compression dedupes it into the token budget. Most RAG dies here — retrieving is easy, deciding what deserves the context window is the job.",
  },
  {
    id: "synthesize",
    label: "Synthesise",
    copy: "One answer, generated strictly against retrieved evidence, with citations attached to the claims they support.",
  },
  {
    id: "verify",
    label: "Verify",
    copy: "An LLM critic reviews the draft and can send it straight back to be regenerated. Then eval scores it — RAGAS faithfulness and relevance, traced in LangSmith. An answer that cannot be traced does not ship.",
  },
  {
    id: "improve",
    label: "Close the loop",
    copy: "A final faithfulness gate has the right to refuse. And those eval scores flow back into the router, so the pipeline gets measurably better at choosing its own strategy over time.",
  },
];
