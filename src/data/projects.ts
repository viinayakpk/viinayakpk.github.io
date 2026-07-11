export type ProjectCategory = "production" | "research" | "robotics";

export interface Project {
  id: string;
  title: string;
  description: string;
  stack: string[];
  category: ProjectCategory;
  meta?: string;
  href?: string;
}

export const PROJECT_CATEGORIES: { id: ProjectCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "production", label: "Production" },
  { id: "research", label: "Research" },
  { id: "robotics", label: "Robotics" },
];

export const PROJECTS: Project[] = [
  {
    id: "clinical-assistant",
    title: "Multilingual clinical AI assistant",
    description:
      "Fine-tuned XLM-RoBERTa intent parser, adaptive RAG over patient history, and LLM answer synthesis — clinician responses in 1-3 seconds.",
    stack: ["XLM-RoBERTa", "Adaptive RAG", "Node.js", "PostgreSQL"],
    category: "production",
    meta: "1-3s response",
  },
  {
    id: "rag",
    title: "rag",
    description:
      "FastAPI + Postgres/pgvector RAG backend with Voyage embeddings/reranking and knowledge-graph extraction via Claude.",
    stack: ["FastAPI", "pgvector", "Voyage", "Knowledge graphs"],
    category: "research",
    href: "https://github.com/viinayakpk/rag",
  },
  {
    id: "tree-extraction",
    title: "Tree-Extracton-pipeline",
    description:
      "Geometry-aware PDF parsing into structured chunks, extracted via LLM (DeepSeek) with confidence scoring and a golden eval set.",
    stack: ["DeepSeek", "PDF parsing", "Eval harness"],
    category: "production",
    href: "https://github.com/viinayakpk/Tree-Extracton-pipeline",
  },
  {
    id: "email-classification",
    title: "LLM-Email-Classification-Explainability",
    description:
      "DistilBERT phishing classifier with SHAP token-level explainability, deployed as a FastAPI service with Docker.",
    stack: ["DistilBERT", "SHAP", "FastAPI", "Docker"],
    category: "research",
    meta: "92% F1",
    href: "https://github.com/viinayakpk/LLM-Email-Classification-Explainability",
  },
  {
    id: "surgical-robotics",
    title: "Surgical robotics simulation",
    description:
      "Gesture-based lamp control and a multi-joint robotic arm prototype for an EU-funded human-robot collaboration project at TU Chemnitz.",
    stack: ["ROS2", "MediaPipe", "Gazebo", "Unity3D", "RViz"],
    category: "robotics",
  },
  {
    id: "thesis",
    title: "Banana leaf disease detection",
    description:
      "Hybrid CNN-LSTM architecture combining spatial and temporal features — 94.5% test accuracy, outperforming standalone CNN baselines.",
    stack: ["CNN-LSTM", "PyTorch"],
    category: "research",
    meta: "94.5% accuracy",
  },
  {
    id: "ai-and-robotics",
    title: "ai-and-robotics",
    description: "Point cloud and mesh reconstruction experiments (Poisson surface reconstruction).",
    stack: ["Point clouds", "Mesh reconstruction"],
    category: "robotics",
    href: "https://github.com/viinayakpk/ai-and-robotics",
  },
];
