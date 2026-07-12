export type ProjectCategory = "agentic" | "research" | "robotics";

export interface Project {
  id: string;
  title: string;
  description: string;
  stack: string[];
  category: ProjectCategory;
  meta?: string;
  href?: string;
  /** Tailwind gradient classes for the card header. */
  gradient?: string;
}

export const PROJECT_CATEGORIES: { id: ProjectCategory; label: string }[] = [
  { id: "agentic", label: "Agentic AI" },
  { id: "research", label: "Research" },
  { id: "robotics", label: "Robotics" },
];

export const PROJECTS: Project[] = [
  {
    id: "research-agent",
    title: "Evidence-Grounded Research System",
    description:
      "A graph-based multi-agent workflow: planner, query expansion, multi-source discovery, source-quality scoring, hybrid retrieval, synthesis, critic review, and automated eval agents.",
    stack: ["LangGraph", "Hybrid RAG", "RAGAS", "LangSmith"],
    category: "agentic",
    meta: "9-agent workflow",
    href: "https://github.com/viinayakpk",
    gradient: "from-[#2a78d6] to-[#4a3aa7]",
  },
  {
    id: "clinical-ai",
    title: "Multi-Agent Clinical AI System",
    description:
      "Specialised agents for intent classification, patient-history retrieval, and LLM response generation, with an agentic dispatcher that routes queries to the optimal retrieval strategy.",
    stack: ["XLM-RoBERTa", "Adaptive RAG", "Node.js", "PostgreSQL"],
    category: "agentic",
    meta: "EU AI Act compliant",
    gradient: "from-[#1baf7a] to-[#147f84]",
  },
  {
    id: "internal-agent",
    title: "Autonomous Internal Knowledge Agent",
    description:
      "A LangChain + Mistral-7B agent using CRM, ERP, and documentation retrieval as tools to automate reporting, follow-up, and knowledge lookup - cutting manual effort by 60%+.",
    stack: ["LangChain", "Mistral-7B", "FAISS"],
    category: "agentic",
    meta: "60%+ effort cut",
    gradient: "from-[#E8672E] to-[#eda100]",
  },
  {
    id: "phishing",
    title: "Explainable Phishing Detection",
    description:
      "A DistilBERT + SHAP pipeline that classifies suspicious text and surfaces model predictions for end users, deployed as a FastAPI microservice with MLflow tracking.",
    stack: ["DistilBERT", "SHAP", "FastAPI", "MLflow"],
    category: "research",
    href: "https://github.com/viinayakpk",
    gradient: "from-[#4a3aa7] to-[#2a78d6]",
  },
  {
    id: "thesis",
    title: "Banana Leaf Disease Detection",
    description:
      "A hybrid CNN-LSTM model combining spatial and temporal features for Sigatoka and Xanthomonas classification - 94.5% test accuracy, outperforming standalone CNN baselines.",
    stack: ["CNN-LSTM", "PyTorch"],
    category: "research",
    meta: "94.5% accuracy",
    gradient: "from-[#008300] to-[#1baf7a]",
  },
  {
    id: "surgical-robotics",
    title: "Surgical Robotics Simulation",
    description:
      "Perception-to-action agent demos for surgical lamp and robot control using a full sense-decide-act loop, plus a multi-joint robotic arm prototype for an EU-funded project.",
    stack: ["ROS2", "MediaPipe", "Gazebo", "Unity3D"],
    category: "robotics",
    gradient: "from-[#111111] to-[#4a3aa7]",
  },
];
