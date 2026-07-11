import SkipLink from "./components/layout/SkipLink";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Hero from "./components/hero/Hero";
import TechIconField from "./components/tech-field/TechIconField";
import Marquee from "./components/marquee/Marquee";
import ProjectGrid from "./components/projects/ProjectGrid";
import RagLoopSection from "./components/rag-loop/RagLoopSection";

export default function App() {
  return (
    <>
      <SkipLink />
      <Header />
      <main id="main">
        <Hero />
        <TechIconField />
        <Marquee />
        <ProjectGrid />
        <RagLoopSection />
      </main>
      <Footer />
    </>
  );
}
