export interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  dates: string;
  bullets: string[];
}

export const EXPERIENCE: ExperienceEntry[] = [
  {
    id: "monidor",
    company: "Monidor Oy",
    role: "AI & Full-Stack Engineer",
    dates: "Jan 2026 - Present · Oulu, Finland",
    bullets: [
      "Architected a multi-agent clinical AI system with specialised agents for intent classification (XLM-RoBERTa), patient-history retrieval, and LLM response generation, coordinated by a central orchestration layer",
      "Designed an agentic dispatcher that autonomously routes clinical queries to standard, temporal, multi-hop, or hybrid dense-sparse retrieval based on query intent",
      "Fed retrieval evaluations back into the routing agent for adaptive, self-improving behaviour over time",
      "Built a Node.js and PostgreSQL backend for patient vital-sign data (SpO2, EtCO2, capnography) with robust validation for missing readings and device errors",
      "Drove EU AI Act, GDPR, and MDR compliance: audit-logging pipelines, data-minimisation at ingestion, and AI risk classification for a high-risk medical system",
    ],
  },
  {
    id: "fricke",
    company: "Fricke und Mallah Microwave Technology",
    role: "Working Student - Agentic AI & Automation",
    dates: "Jun 2025 - Sep 2025 · Peine, Germany",
    bullets: [
      "Built an autonomous internal AI agent (LangChain + Mistral-7B) using CRM lookup, ERP search, and documentation retrieval as agent tools",
      "Engineered a FAISS-based retrieval pipeline for email triage and knowledge search, cutting manual processing effort by over 60% in testing",
      "Prepared CRM, ERP, and email corpora for agent-ready embedding search: cleaning, chunking, metadata tagging, and FAISS indexing",
      "Benchmarked Mistral-7B vs Llama 3 for autonomous reporting and multilingual summarisation, presenting model recommendations to management",
    ],
  },
  {
    id: "tu-chemnitz",
    company: "Technische Universität Chemnitz",
    role: "Student Assistant - Surgical Robotics",
    dates: "Mar 2025 - Oct 2025 · Chemnitz, Germany",
    bullets: [
      "Built perception-to-action agent demos for surgical lamp and robot control using MediaPipe, OpenCV, ROS2, and Gazebo - a full sense-decide-act loop",
      "Prototyped a multi-joint robotic arm simulation in Unity and RViz for an EU-funded research project, reusable across labs and clinical partners",
    ],
  },
  {
    id: "hof",
    company: "Hof University of Applied Sciences",
    role: "Student Researcher - Applied ML",
    dates: "Oct 2024 - Mar 2025 · Hof, Germany",
    bullets: [
      "Developed an explainable phishing-detection pipeline using DistilBERT and SHAP to classify suspicious text and surface predictions for end users",
      "Deployed the model as a FastAPI microservice with real-time inference, tracking accuracy, loss, and latency across runs with MLflow",
    ],
  },
  {
    id: "thesis",
    company: "Bachelor's Thesis",
    role: "Banana Leaf Disease Detection",
    dates: "2023 · India",
    bullets: [
      "Developed a hybrid CNN-LSTM model for banana leaf disease classification, achieving 94.5% test accuracy on Sigatoka and Xanthomonas detection",
      "Curated and augmented a dataset from the Mendeley repository and compared CNN vs CNN-LSTM on precision, recall, latency, and training-epoch analysis",
    ],
  },
];
