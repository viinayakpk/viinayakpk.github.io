import python from "simple-icons/icons/python.svg?raw";
import typescript from "simple-icons/icons/typescript.svg?raw";
import javascript from "simple-icons/icons/javascript.svg?raw";
import nodedotjs from "simple-icons/icons/nodedotjs.svg?raw";
import cplusplus from "simple-icons/icons/cplusplus.svg?raw";
import postgresql from "simple-icons/icons/postgresql.svg?raw";
import fastapi from "simple-icons/icons/fastapi.svg?raw";
import docker from "simple-icons/icons/docker.svg?raw";
import pytorch from "simple-icons/icons/pytorch.svg?raw";
import tensorflow from "simple-icons/icons/tensorflow.svg?raw";
import langchain from "simple-icons/icons/langchain.svg?raw";
import openai from "simple-icons/icons/openai.svg?raw";
import amazonwebservices from "simple-icons/icons/amazonwebservices.svg?raw";
import opencv from "simple-icons/icons/opencv.svg?raw";
import scikitlearn from "simple-icons/icons/scikitlearn.svg?raw";

function extractPath(svg: string): string {
  const match = svg.match(/<path d="([^"]+)"/);
  if (!match) throw new Error("Could not extract SVG path data");
  return match[1];
}

export interface StackIcon {
  id: string;
  label: string;
  /** SVG path data (viewBox 0 0 24 24), or undefined for text-glyph icons. */
  d?: string;
  glyph?: string;
  /** Tile background and foreground colors (colored logo tiles). */
  bg?: string;
  fg?: string;
}

export const STACK_ICONS: StackIcon[] = [
  { id: "python", label: "Python", d: extractPath(python), bg: "#FFD343", fg: "#3776AB" },
  { id: "typescript", label: "TypeScript", d: extractPath(typescript), bg: "#3178C6", fg: "#ffffff" },
  { id: "langchain", label: "LangChain", d: extractPath(langchain), bg: "#111111", fg: "#ffffff" },
  { id: "openai", label: "OpenAI / LLMs", d: extractPath(openai), bg: "#111111", fg: "#ffffff" },
  { id: "pytorch", label: "PyTorch", d: extractPath(pytorch), bg: "#111111", fg: "#EE4C2C" },
  { id: "tensorflow", label: "TensorFlow", d: extractPath(tensorflow), bg: "#111111", fg: "#FF6F00" },
  { id: "fastapi", label: "FastAPI", d: extractPath(fastapi), bg: "#111111", fg: "#009688" },
  { id: "postgresql", label: "PostgreSQL", d: extractPath(postgresql), bg: "#111111", fg: "#4169E1" },
  { id: "nodedotjs", label: "Node.js", d: extractPath(nodedotjs), bg: "#111111", fg: "#5FA04E" },
  { id: "docker", label: "Docker", d: extractPath(docker), bg: "#111111", fg: "#2496ED" },
  { id: "scikitlearn", label: "Scikit-learn", d: extractPath(scikitlearn), bg: "#111111", fg: "#F7931E" },
  { id: "amazonwebservices", label: "AWS", d: extractPath(amazonwebservices), bg: "#111111", fg: "#FF9900" },
  { id: "opencv", label: "OpenCV", d: extractPath(opencv), bg: "#111111", fg: "#5C3EE8" },
  { id: "javascript", label: "JavaScript", d: extractPath(javascript), bg: "#F7DF1E", fg: "#111111" },
  { id: "cplusplus", label: "C++", d: extractPath(cplusplus), bg: "#111111", fg: "#00599C" },
];
