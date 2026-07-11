const SECTION_SELECTOR = "main > section[id]";

export function scrollToNextSection() {
  const sections = Array.from(document.querySelectorAll<HTMLElement>(SECTION_SELECTOR));
  const current = window.scrollY + 120;
  const next = sections.find((section) => section.offsetTop > current);
  (next ?? sections[sections.length - 1])?.scrollIntoView({ behavior: "smooth", block: "start" });
}
