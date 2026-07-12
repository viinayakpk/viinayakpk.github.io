import SkipLink from "./components/layout/SkipLink";
import SiteBackground from "./components/layout/SiteBackground";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Hero from "./components/hero/Hero";
import AgentArchitectureSection from "./components/agent/AgentArchitectureSection";
import TechIconField from "./components/tech-field/TechIconField";
import Marquee from "./components/marquee/Marquee";
import ProjectGrid from "./components/projects/ProjectGrid";
import StatsStrip from "./components/stats/StatsStrip";
import WorkExperienceSection from "./components/experience/WorkExperienceSection";
import Terminal from "./components/terminal/Terminal";
import TerminalHint from "./components/terminal/TerminalHint";

export default function App() {
  return (
    <>
      <SkipLink />
      <SiteBackground />
      <Header />
      <main id="main">
        <Hero />
        <AgentArchitectureSection />
        <TechIconField />
        <ProjectGrid />
        <StatsStrip />
        <Marquee />
        <WorkExperienceSection />
      </main>
      <Footer />
      <Terminal />
      <TerminalHint />
    </>
  );
}
