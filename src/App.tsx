import SkipLink from "./components/layout/SkipLink";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

export default function App() {
  return (
    <>
      <SkipLink />
      <Header />
      <main id="main" className="pt-32">
        <section
          id="top"
          className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center"
        >
          <p className="font-mono text-sm uppercase tracking-[0.3em] text-accent">Rebuilding</p>
          <h1 className="text-4xl font-semibold sm:text-6xl">Vinayak Paroonon Kooloth</h1>
          <p className="max-w-xl text-text-muted">
            AI systems engineer. The new site is being assembled in public — full launch incoming.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
