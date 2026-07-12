import { KIND_COLOR, PIPELINE_LINKS, PIPELINE_NODES } from "@/data/agentPipeline";

const W = 760;
const H = 340;
const PAD_X = 60;
const CX = (col: number) => PAD_X + (col / 6) * (W - PAD_X * 2);
const CY = (row: number) => H / 2 + row * 62;

const NODE = new Map(PIPELINE_NODES.map((n) => [n.id, n]));

interface PipelineDiagramProps {
  /**
   * The scroll-driven narrative playhead. Everything up to and including this stage
   * is drawn at full strength; everything after it is held back, so the architecture
   * assembles itself as you read down the beats.
   *
   * Omit it (the reduced-motion and low-capability paths do) and the whole diagram
   * simply renders at once, fully legible with no motion at all.
   */
  activeStage?: number;
}

/**
 * The pipeline, drawn as a real diagram.
 *
 * This started life as the WebGL-free fallback for a 3D version of the same graph.
 * It is now the only version, and the section is better for it — the 3D scene could
 * only ever hold two or three nodes in frame at a legible size, so the thing it was
 * supposedly showing (the *shape* of the architecture: routed, parallel, grounded,
 * looped) was the one thing you could never actually see. Here all seven stages and
 * the feedback edge are visible at once, the labels are crisp text at any zoom, and
 * it costs no GPU at all.
 */
export default function PipelineDiagram({ activeStage }: PipelineDiagramProps) {
  // No playhead → everything is "reached", i.e. the whole diagram is drawn.
  const reached = (stage: number) => activeStage === undefined || stage <= activeStage;
  const isFocused = (stage: number) => activeStage !== undefined && stage === activeStage;

  return (
    <div className="flex h-full w-full items-center justify-center p-4">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full max-w-[760px]"
        role="img"
        aria-label="Agent pipeline: a request is routed by intent, fanned out to parallel retrieval, tool and reasoning agents, grounded against a hybrid FAISS index and systems of record, synthesised, then reviewed by a critic and scored by eval - whose scores feed back into the router."
      >
        {PIPELINE_LINKS.map((link) => {
          const from = NODE.get(link.source);
          const to = NODE.get(link.target);
          if (!from || !to) return null;

          const x1 = CX(from.col);
          const y1 = CY(from.row);
          const x2 = CX(to.col);
          const y2 = CY(to.row);

          const d = link.feedback
            ? `M ${x1} ${y1} C ${x1} ${H - 14}, ${x2} ${H - 14}, ${x2} ${y2}`
            : `M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`;

          const on = reached(link.stage);

          return (
            <path
              key={`${link.source}-${link.target}`}
              d={d}
              fill="none"
              stroke={KIND_COLOR[from.kind]}
              strokeWidth={link.feedback ? 1.1 : 1.4}
              strokeDasharray={link.feedback ? "4 4" : undefined}
              /*
               * Un-reached edges stay clearly visible, not near-invisible. The entire
               * reason this section is a diagram and not a 3D scene is so the whole
               * shape of the architecture reads at a glance — dimming the not-yet-
               * narrated parts into nothing would throw that away and just reproduce
               * the 3D version's failure by other means. They recede; they do not
               * disappear.
               */
              opacity={on ? (link.feedback ? 0.6 : 0.5) : 0.2}
              style={{ transition: "opacity 600ms ease" }}
            />
          );
        })}

        {PIPELINE_NODES.map((node) => {
          const x = CX(node.col);
          const y = CY(node.row);
          const color = KIND_COLOR[node.kind];
          const on = reached(node.stage);
          const focused = isFocused(node.stage);

          return (
            <g
              key={node.id}
              opacity={on ? 1 : 0.45}
              style={{ transition: "opacity 600ms ease" }}
            >
              {/* The focused stage gets a soft halo — the one piece of emphasis that
                  survives at this size without shouting. */}
              {focused && (
                <circle cx={x} cy={y} r={22} fill={color} opacity={0.14}>
                  <animate
                    attributeName="r"
                    values="18;24;18"
                    dur="2.4s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
              <circle cx={x} cy={y} r={node.kind === "router" || node.kind === "synthesis" ? 9 : 6} fill={color} />
              <circle
                cx={x}
                cy={y}
                r={14}
                fill="none"
                stroke={color}
                strokeWidth={0.8}
                opacity={focused ? 0.7 : 0.3}
                style={{ transition: "opacity 600ms ease" }}
              />
              <text
                x={x}
                y={y + 30}
                textAnchor="middle"
                className="fill-[var(--text)] font-sans"
                style={{ fontSize: 11, fontWeight: 600 }}
              >
                {node.label}
              </text>
              <text
                x={x}
                y={y + 43}
                textAnchor="middle"
                className="fill-[var(--text-quiet)] font-mono"
                style={{ fontSize: 8.5 }}
              >
                {node.detail}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
