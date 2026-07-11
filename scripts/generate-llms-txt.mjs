import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "../public");
mkdirSync(outDir, { recursive: true });

const content = `# Vinayak Paroonon Kooloth

> AI Systems Engineer — clinical AI assistants, adaptive RAG, fine-tuned transformers, agentic software delivery.

Website: https://viinayakpk.github.io
Email: vinayakparoononkooloth@gmail.com
LinkedIn: https://linkedin.com/in/vinayakparoononkooloth
GitHub: https://github.com/viinayakpk

## Summary

Vinayak is an AI & Full-Stack Engineer based in Oulu, Finland (open to relocation across the EU),
with an MSc in Artificial Intelligence & Robotics from Hof University of Applied Sciences.
He builds clinical AI assistants, adaptive/multi-strategy RAG systems, fine-tuned multilingual
transformers, and robotics simulations, and works with agentic coding tools (Codex, Claude Code)
as part of his engineering workflow.

## Experience

### AI & Full-Stack Engineer — Monidor Oy (Jan 2026 - Present)
Built a multilingual clinical AI assistant combining a fine-tuned XLM-RoBERTa intent parser,
adaptive RAG retrieval over patient history, and LLM-based answer synthesis, delivering
responses in 1-3 seconds. Benchmarked standard, temporal, multi-hop, and hybrid dense-sparse
RAG strategies and implemented adaptive routing between them. Also built a Node.js/PostgreSQL
vitals reporting system for SpO2/EtCO2/capnography data.

### Working Student, AI Agent Development — Fricke und Mallah Microwave Technology GmbH (Jun-Sep 2025)
Built a LangChain + Mistral-7B internal assistant integrated with CRM/ERP systems, with a
FAISS-powered RAG pipeline for email triage that cut manual processing effort by 60%+.

### Student Assistant, Surgical Robotics Simulation — TU Chemnitz (Mar-Oct 2025)
ROS2, MediaPipe, OpenCV, and Gazebo simulations for gesture-based robot control, plus a
multi-joint robotic arm prototype in Unity/RViz for an EU-funded research project.

### Student Researcher, Applied Machine Learning — Hof University of Applied Sciences (Oct 2024 - Mar 2025)
Built a DistilBERT + SHAP explainable phishing-detection pipeline, deployed as a FastAPI
service with MLflow experiment tracking.

## Selected Projects

- RAG backend: FastAPI + Postgres/pgvector, Voyage embeddings/reranking, knowledge-graph extraction.
- Tree-Extracton-pipeline: geometry-aware PDF parsing to structured LLM extraction with confidence scoring.
- LLM-Email-Classification-Explainability: DistilBERT + SHAP phishing classifier, 92% F1, FastAPI/Docker.
- Bachelor's thesis: CNN-LSTM hybrid model for banana leaf disease detection, 94.5% test accuracy.

## Technical Skills

LLM & RAG: LangChain, FAISS, LlamaIndex, Mistral-7B, Llama 3, Phi-4, sentence transformers, vector databases.
Machine Learning: PyTorch, TensorFlow, Scikit-learn, XLM-RoBERTa, DistilBERT, CNNs, LSTMs, SHAP, MLflow.
Backend: Python, TypeScript, Node.js, FastAPI, PostgreSQL, Docker, GitHub Actions.
Robotics & Vision: ROS2, Gazebo, Unity3D, RViz, OpenCV, MediaPipe, YOLOv7.
`;

writeFileSync(path.join(outDir, "llms.txt"), content, "utf8");
console.log("Generated public/llms.txt");
