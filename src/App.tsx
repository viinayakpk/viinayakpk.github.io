import SkipLink from "./components/layout/SkipLink";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Hero from "./components/hero/Hero";

export default function App() {
  return (
    <>
      <SkipLink />
      <Header />
      <main id="main">
        <Hero />
      </main>
      <Footer />
    </>
  );
}
