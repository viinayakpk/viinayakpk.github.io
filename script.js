const revealItems = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

revealItems.forEach((item) => revealObserver.observe(item));

const portrait = document.querySelector(".portrait-wrap");

if (portrait && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  window.addEventListener("pointermove", (event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 12;
    const y = (event.clientY / window.innerHeight - 0.5) * 12;
    portrait.style.setProperty("--tilt-x", `${x}px`);
    portrait.style.setProperty("--tilt-y", `${y}px`);
  });
}

const modes = {
  automate: {
    label: "Agent sessions",
    title: "Break large engineering tasks into controlled agent loops.",
    copy:
      "Codex handles scoped patches, Claude pressure-tests plans and diffs, and Kimi/local models help reason across long or messy context.",
  },
  retrieve: {
    label: "Adaptive RAG",
    title: "Route retrieval by the shape of the question.",
    copy:
      "Standard, temporal, multi-hop, and hybrid dense-sparse retrieval are selected by task instead of being forced through one generic RAG path.",
  },
  tune: {
    label: "Transformer tuning",
    title: "Tune transformers around the workflow, not the benchmark alone.",
    copy:
      "Domain data, multilingual intent parsing, prompt design, and evaluation loops are tied back to how the software is actually used.",
  },
  ship: {
    label: "Production systems",
    title: "Connect models to APIs, databases, reports, and users.",
    copy:
      "Build Node.js and FastAPI services, PostgreSQL schemas, browser reports, Docker workflows, and tracking with MLflow so AI work can be operated.",
  },
};

const modeButtons = document.querySelectorAll(".mode-tab");
const modeLabel = document.querySelector("#mode-label");
const modeTitle = document.querySelector("#mode-title");
const modeCopy = document.querySelector("#mode-copy");

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selected = modes[button.dataset.mode];
    if (!selected) return;

    modeButtons.forEach((item) => {
      item.classList.remove("active");
      item.setAttribute("aria-selected", "false");
    });

    button.classList.add("active");
    button.setAttribute("aria-selected", "true");
    modeLabel.textContent = selected.label;
    modeTitle.textContent = selected.title;
    modeCopy.textContent = selected.copy;
  });
});

const claudeAgent = document.querySelector("#claude-agent");

if (claudeAgent) {
  let reactionTimer;

  const reactClaude = () => {
    window.clearTimeout(reactionTimer);
    claudeAgent.classList.remove("is-reacting");
    void claudeAgent.offsetWidth;
    claudeAgent.classList.add("is-reacting");
    reactionTimer = window.setTimeout(() => {
      claudeAgent.classList.remove("is-reacting");
    }, 820);
  };

  const setClaudePanel = (isOpen) => {
    document.body.classList.toggle("claude-panel-open", isOpen);
    claudeAgent.setAttribute("aria-expanded", String(isOpen));
  };

  claudeAgent.addEventListener("click", () => {
    reactClaude();
    setClaudePanel(!document.body.classList.contains("claude-panel-open"));
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setClaudePanel(false);
    }
  });
}
