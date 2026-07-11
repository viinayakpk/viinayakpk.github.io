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
    dates: "Jan 2026 - Present",
    bullets: [
      "Built a multilingual clinical AI assistant: fine-tuned XLM-RoBERTa intent parsing, adaptive RAG over patient history, LLM answer synthesis in 1-3s.",
      "Benchmarked standard, temporal, multi-hop, and hybrid dense-sparse RAG, then implemented adaptive routing by query type.",
      "Built Node.js/PostgreSQL vitals reporting for SpO2, EtCO2, and capnography waveforms.",
    ],
  },
  {
    id: "fricke",
    company: "Fricke und Mallah Microwave Technology GmbH",
    role: "Working Student, AI Agent Development",
    dates: "Jun 2025 - Sep 2025",
    bullets: [
      "Led a LangChain + Mistral-7B internal assistant integrated with CRM/ERP systems.",
      "FAISS-powered RAG pipeline for email triage — cut manual processing effort by 60%+.",
      "Benchmarked Mistral-7B vs. Llama-3 for reporting and multilingual summarization.",
    ],
  },
  {
    id: "tu-chemnitz",
    company: "Technische Universität Chemnitz",
    role: "Student Assistant, Surgical Robotics Simulation",
    dates: "Mar 2025 - Oct 2025",
    bullets: [
      "Gesture-based robot control using ROS2, MediaPipe, OpenCV, and Gazebo.",
      "Prototyped a multi-joint robotic arm in Unity/RViz for an EU-funded research project.",
    ],
  },
  {
    id: "hof",
    company: "Hof University of Applied Sciences",
    role: "Student Researcher, Applied Machine Learning",
    dates: "Oct 2024 - Mar 2025",
    bullets: [
      "Explainable phishing-detection pipeline: DistilBERT + SHAP.",
      "Deployed as a FastAPI microservice with MLflow experiment tracking.",
    ],
  },
];
