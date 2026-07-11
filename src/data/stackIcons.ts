import python from "simple-icons/icons/python.svg?raw";
import typescript from "simple-icons/icons/typescript.svg?raw";
import nodedotjs from "simple-icons/icons/nodedotjs.svg?raw";
import fastapi from "simple-icons/icons/fastapi.svg?raw";
import postgresql from "simple-icons/icons/postgresql.svg?raw";
import docker from "simple-icons/icons/docker.svg?raw";
import pytorch from "simple-icons/icons/pytorch.svg?raw";
import tensorflow from "simple-icons/icons/tensorflow.svg?raw";
import scikitlearn from "simple-icons/icons/scikitlearn.svg?raw";
import opencv from "simple-icons/icons/opencv.svg?raw";
import amazonwebservices from "simple-icons/icons/amazonwebservices.svg?raw";
import githubactions from "simple-icons/icons/githubactions.svg?raw";
import huggingface from "simple-icons/icons/huggingface.svg?raw";
import jupyter from "simple-icons/icons/jupyter.svg?raw";

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
}

export const STACK_ICONS: StackIcon[] = [
  { id: "python", label: "Python", d: extractPath(python) },
  { id: "typescript", label: "TypeScript", d: extractPath(typescript) },
  { id: "nodedotjs", label: "Node.js", d: extractPath(nodedotjs) },
  { id: "fastapi", label: "FastAPI", d: extractPath(fastapi) },
  { id: "postgresql", label: "PostgreSQL", d: extractPath(postgresql) },
  { id: "docker", label: "Docker", d: extractPath(docker) },
  { id: "pytorch", label: "PyTorch", d: extractPath(pytorch) },
  { id: "tensorflow", label: "TensorFlow", d: extractPath(tensorflow) },
  { id: "scikitlearn", label: "Scikit-learn", d: extractPath(scikitlearn) },
  { id: "opencv", label: "OpenCV", d: extractPath(opencv) },
  { id: "ros2", label: "ROS2", glyph: "ROS" },
  { id: "langchain", label: "LangChain", glyph: "LC" },
  { id: "aws", label: "AWS", d: extractPath(amazonwebservices) },
  { id: "githubactions", label: "GitHub Actions", d: extractPath(githubactions) },
  { id: "huggingface", label: "Hugging Face", d: extractPath(huggingface) },
  { id: "jupyter", label: "Jupyter", d: extractPath(jupyter) },
];
