import { useMemo } from "react";
import {
  KIND_COLOR,
  PIPELINE_LINKS,
  PIPELINE_NODES,
  PIPELINE_PLANES,
  type PipelineNode,
} from "@/data/agentPipeline";
import { useMediaQuery } from "@/lib/useMediaQuery";

/**
 * The architecture, drawn as a real diagram.
 *
 * ONE ARCHITECTURE, TWO LAYOUTS. The data model stores only `tier` (pipeline depth) and
 * `lane` (position across the fan-out) — never pixels. This file turns those into
 * coordinates, and it does so differently depending on the screen.
 *
 * That is not a nicety, it is the only way this works at all. Simply scaling a wide
 * diagram down to a 390px phone shrinks the *type* along with it, and at that size the
 * labels become the same illegible grey smudge that killed the 3D version. So the phone
 * gets a genuinely different layout: narrower lanes, taller tiers, a diagram that is
 * meant to be read top-to-bottom like a poster. Same topology, same truth, no second
 * copy to keep in sync.
 */

interface Layout {
  /** Half the horizontal distance between adjacent lanes. */
  laneGap: number;
  /** Vertical distance between adjacent tiers. */
  tierGap: number;
  padX: number;
  padY: number;
  width: number;
  /** Characters per line before a label wraps. */
  wrap: number;
  /**
   * Characters per line before the DETAIL wraps. On a phone the outermost lanes sit close
   * to the edge of the viewBox, and an unwrapped detail like "MCP · function calling" runs
   * straight off it — so the tech proof, which is the most convincing thing on the whole
   * diagram, is the first thing to get clipped. Wrapping it is what keeps it.
   */
  wrapDetail: number;
  fontLabel: number;
  fontDetail: number;
}

const WIDE: Layout = {
  laneGap: 168,
  // 70, not 76. Thirteen tiers at 76 made the diagram taller than the sticky viewport
  // could ever show, so the quality gate and the answer — the payoff — were permanently
  // cut off below the fold of their own panel.
  tierGap: 70,
  padX: 56,
  padY: 44,
  width: 780,
  wrap: 18,
  wrapDetail: 30,
  fontLabel: 12,
  fontDetail: 9,
};

/**
 * The phone layout. Lanes are squeezed and tiers are stretched, which trades width — the
 * dimension a phone has none of — for height, which it has infinitely much of.
 */
const COMPACT: Layout = {
  laneGap: 98,
  tierGap: 116,
  padX: 30,
  padY: 42,
  width: 400,
  wrap: 12,
  wrapDetail: 15,
  fontLabel: 12.5,
  fontDetail: 9,
};

const MAX_TIER = Math.max(...PIPELINE_NODES.map((n) => n.tier));

function height(l: Layout): number {
  return l.padY * 2 + MAX_TIER * l.tierGap;
}

const cx = (lane: number, l: Layout) => l.width / 2 + lane * l.laneGap;
const cy = (tier: number, l: Layout) => l.padY + tier * l.tierGap;

/** Greedy wrap into at most two lines. SVG `<text>` has no wrapping of its own. */
function wrapText(text: string, max: number): string[] {
  if (text.length <= max) return [text];
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    if (line && (line + " " + w).length > max) {
      lines.push(line);
      line = w;
    } else {
      line = line ? `${line} ${w}` : w;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 2);
}

interface PipelineDiagramProps {
  /**
   * The scroll-driven narrative playhead. Everything up to and including this stage is
   * live; later stages recede but stay legible. Omit it (the reduced-motion path does)
   * and the whole architecture simply renders at once.
   */
  activeStage?: number;
}

export default function PipelineDiagram({ activeStage }: PipelineDiagramProps) {
  const compact = useMediaQuery("(max-width: 767px)");
  const l = compact ? COMPACT : WIDE;
  const h = height(l);

  const byId = useMemo(() => new Map(PIPELINE_NODES.map((n) => [n.id, n])), []);

  /*
   * The scroll-driven build-up is a DESKTOP affordance, and only there.
   *
   * On desktop the diagram is sticky beside the beats, so dimming what you have not yet
   * read is genuinely helpful — the architecture assembles as you go. On mobile there is
   * no sticky panel: the diagram sits above the beats in normal flow, so the playhead is
   * still on stage 0 the entire time you are actually looking at it. The result was a
   * poster with two-thirds of itself greyed out, and no way to un-grey it.
   *
   * So on a phone the whole architecture is simply live. Nothing is hidden from a reader
   * who cannot yet scroll to the thing that would reveal it.
   */
  const playhead = compact ? undefined : activeStage;
  const reached = (stage: number) => playhead === undefined || stage <= playhead;
  const focused = (stage: number) => playhead !== undefined && stage === playhead;

  const pos = (n: PipelineNode) => ({ x: cx(n.lane, l), y: cy(n.tier, l) });

  return (
    <div className="arch">
      <svg
        viewBox={`0 0 ${l.width} ${h}`}
        className="arch__svg"
        role="img"
        aria-label="Agent architecture. A request passes input guardrails, is routed by a fine-tuned intent classifier, then planned into a task DAG and executed by a LangGraph orchestrator. Four sub-agents run in parallel — retrieval, tools, reasoning and code — reaching for hybrid search, MCP servers, self-consistency sampling and a sandbox. Those hit a data plane of vector store, systems of record, document store and semantic cache. Results are reranked by a cross-encoder and compressed into the token budget, synthesised into a cited answer, reviewed by an LLM critic, scored by RAGAS eval, and passed through an output faithfulness gate. The critic can send a draft back for regeneration, and eval scores feed back into the router so routing improves over time."
      >
        {/* ── The planes. Naming them is what turns a flowchart into an architecture. ── */}
        {PIPELINE_PLANES.map((plane) => {
          const top = cy(plane.from, l) - l.tierGap * 0.42;
          const bottom = cy(plane.to, l) + l.tierGap * 0.42;
          return (
            <g key={plane.id}>
              <rect
                x={6}
                y={top}
                width={l.width - 12}
                height={bottom - top}
                rx={10}
                className="arch__plane"
              />
              <text x={14} y={top + 12} className="arch__plane-label" style={{ fontSize: compact ? 7 : 7.6 }}>
                {plane.label}
              </text>
            </g>
          );
        })}

        {/* ── Edges ───────────────────────────────────────────────────────────────── */}
        {PIPELINE_LINKS.map((link) => {
          const from = byId.get(link.source);
          const to = byId.get(link.target);
          if (!from || !to) return null;

          const a = pos(from);
          const b = pos(to);
          const on = reached(link.stage);

          let d: string;
          if (link.feedback) {
            /*
             * Feedback edges are routed AROUND the graph, hard out to one side, rather
             * than straight back through the middle of it. A return path drawn through
             * the body of a diagram reads as a mistake; one that sweeps around the
             * outside reads as a loop, which is precisely what it is.
             */
            const side = l.width - 16;
            d = `M ${a.x} ${a.y} C ${side} ${a.y}, ${side} ${b.y}, ${b.x} ${b.y}`;
          } else {
            // A vertical S-curve: leaves its source downward, arrives at its target
            // downward. Straight diagonals between fan-out lanes turn into a cat's
            // cradle the moment there is more than one of them.
            const mid = (a.y + b.y) / 2;
            d = `M ${a.x} ${a.y} C ${a.x} ${mid}, ${b.x} ${mid}, ${b.x} ${b.y}`;
          }

          return (
            <g key={`${link.source}-${link.target}`}>
              <path
                d={d}
                fill="none"
                stroke={KIND_COLOR[from.kind]}
                strokeWidth={link.feedback ? 1 : 1.3}
                strokeDasharray={link.feedback ? "3 4" : undefined}
                opacity={on ? (link.feedback ? 0.5 : 0.42) : 0.14}
                className="arch__edge"
              />
              {/* The current, running along the wire. Only on live edges. */}
              {on && !link.feedback && (
                <path d={d} fill="none" stroke={KIND_COLOR[from.kind]} strokeWidth={1.9} className="arch__flow" />
              )}
            </g>
          );
        })}

        {/* ── Nodes ───────────────────────────────────────────────────────────────── */}
        {PIPELINE_NODES.map((n) => {
          const { x, y } = pos(n);
          const color = KIND_COLOR[n.kind];
          const on = reached(n.stage);
          const isFocus = focused(n.stage);
          const r = n.major ? (compact ? 9 : 8) : compact ? 6.5 : 5.8;
          const lines = wrapText(n.label, l.wrap);
          const details = wrapText(n.detail, l.wrapDetail);
          const labelStep = l.fontLabel + 1.5;
          const detailTop = y + r + 13 + lines.length * labelStep;

          return (
            <g key={n.id} className="arch__node" opacity={on ? 1 : 0.34}>
              {isFocus && (
                <circle cx={x} cy={y} r={r + 11} fill={color} opacity={0.13} className="arch__halo" />
              )}
              <circle cx={x} cy={y} r={r + 4.5} fill="none" stroke={color} strokeWidth={0.9} opacity={isFocus ? 0.75 : 0.28} />
              <circle cx={x} cy={y} r={r} fill={color} />

              {lines.map((line, i) => (
                <text
                  key={line}
                  x={x}
                  y={y + r + 13 + i * labelStep}
                  textAnchor="middle"
                  className="arch__label"
                  style={{ fontSize: l.fontLabel }}
                >
                  {line}
                </text>
              ))}

              {details.map((line, i) => (
                <text
                  key={line}
                  x={x}
                  y={detailTop + i * (l.fontDetail + 1.5)}
                  textAnchor="middle"
                  className="arch__detail"
                  style={{ fontSize: l.fontDetail }}
                >
                  {line}
                </text>
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
