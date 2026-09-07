import {
  Component,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { links } from "./portfolioContent";
import { stops, stopForHash } from "./journey";
import { useJourney } from "./useJourney";
import ProjectDetail from "./ProjectDetail";

const SolarScene = lazy(async () => {
  if (
    import.meta.env.DEV &&
    new URLSearchParams(location.search).get("qa") === "loading"
  ) {
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  return import("./SolarScene");
});

function useMedia(query) {
  const [matches, setMatches] = useState(() => matchMedia(query).matches);
  useEffect(() => {
    const media = matchMedia(query);
    const update = () => setMatches(matchMedia(query).matches);
    update();
    media.addEventListener("change", update);
    window.addEventListener("resize", update);
    return () => {
      media.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, [query]);
  return matches;
}

class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function ExternalLink({ href, children, primary = false }) {
  return (
    <a
      className={primary ? "primary" : "text-link"}
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      {children} <span aria-hidden="true">↗</span>
    </a>
  );
}

export default function App() {
  const compact = useMedia("(max-width: 760px)");
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const scrollRef = useRef();
  const { active, layout } = useJourney(scrollRef);
  const [mode, setMode] = useState("guided");
  const [focus, setFocus] = useState(null);
  const [fitAll, setFitAll] = useState(false);
  const [visible, setVisible] = useState(!document.hidden);
  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  const [details, setDetails] = useState(false);
  const [project, setProject] = useState(null);
  const [indexOpen, setIndexOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const [resetKey, setResetKey] = useState(0);
  const onReady = useCallback(() => setReady(true), []);
  const onFailure = useCallback(() => {
    setFailed(true);
    setMode("guided");
    setFocus(null);
  }, []);
  const animate = ready && !reduced && visible;
  const sceneOff = failed;

  const navigate = useCallback((anchor, history = true) => {
    const stop = stopForHash(anchor);
    setMode("guided");
    setFocus(null);
    setIndexOpen(false);
    if (history && location.hash !== `#${stop.anchor}`)
      window.history.pushState(null, "", `#${stop.anchor}`);
    scrollRef.current?.scrollTo({
      top: document.getElementById(stop.anchor)?.offsetTop || 0,
      behavior: "instant",
    });
  }, []);
  useEffect(() => {
    const restore = () => navigate(location.hash, false);
    const frame = requestAnimationFrame(restore);
    window.addEventListener("popstate", restore);
    window.addEventListener("hashchange", restore);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("popstate", restore);
      window.removeEventListener("hashchange", restore);
    };
  }, [navigate]);
  useEffect(() => {
    const key = (event) => {
      if (event.key === "Escape" && !document.querySelector("dialog[open]")) {
        setMode("guided");
        setFocus(null);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  const internal = (anchor) => (event) => {
    event.preventDefault();
    navigate(anchor);
  };
  const current = stops[active];
  const overview = () => {
    setResetKey((value) => value + 1);
    navigate("overview");
  };

  return (
    <div
      className={`portfolio ${mode === "free" ? "is-exploring" : ""} ${sceneOff ? "scene-off" : ""}`}
    >
      <a className="skip-link" href="#work" onClick={internal("work")}>
        Skip to selected work
      </a>
      <header className="app-header">
        <a
          className="brand"
          href="#overview"
          aria-label="Harshal Jorwekar home"
          onClick={internal("overview")}
        >
          HJ<span>.</span>
        </a>
        <nav aria-label="Main navigation">
          <a
            href="#work"
            onClick={internal("work")}
            aria-current={
              mode === "guided" && current.kind === "project"
                ? "location"
                : undefined
            }
          >
            Work
          </a>
          <a
            href="#about"
            onClick={internal("about")}
            aria-current={
              mode === "guided" && active === 3 ? "location" : undefined
            }
          >
            About
          </a>
          <a
            href="#contact"
            onClick={internal("contact")}
            aria-current={
              mode === "guided" && active === 8 ? "location" : undefined
            }
          >
            Contact
          </a>
        </nav>
      </header>

      <div className="stage">
        <div className="scene-layer" aria-hidden="true" style={{ visibility: ready ? "visible" : "hidden" }}>
          {!sceneOff && (
            <SceneBoundary onFailure={onFailure}>
              <Suspense fallback={null}>
                <SolarScene
                  mode={mode}
                  fitAll={fitAll}
                  visible={visible}
                  focus={focus}
                  active={active}
                  layout={layout}
                  compact={compact}
                  details={details && !compact}
                  animate={animate}
                  resetKey={resetKey}
                  onSelect={(name) => setFocus(name)}
                  onInteract={() => setFocus(null)}
                  onReady={onReady}
                  onFailure={onFailure}
                />
              </Suspense>
            </SceneBoundary>
          )}
        </div>
        <main
          className="scroll-journey"
          ref={scrollRef}
          tabIndex={0}
          aria-label="Portfolio journey"
          inert={mode === "free" ? true : undefined}
        >
          {stops.map((stop) => (
            <section
              key={stop.anchor}
              id={stop.anchor}
              data-planet={stop.planet || "sun"}
              className={`chapter chapter-${stop.kind}`}
              aria-labelledby={`title-${stop.anchor}`}
            >
              <div className="scene-window" aria-hidden="true">
                {sceneOff && (
                  <div className="fallback-label">
                    <span className="orbit-mark">
                      {String(stop.index).padStart(2, "0")}
                    </span>
                    <span>{stop.planet || "The solar system"}</span>
                  </div>
                )}
              </div>
              <div className="chapter-copy">
                <p className="chapter-label">
                  <span>
                    {String(stop.index).padStart(2, "0")} /{" "}
                    {stop.planet || "Welcome aboard"}
                  </span>
                  <span className="label-rule" />
                </p>
                {stop.kind === "opening" && (
                  <>
                    <p className="role">Software Engineer</p>
                    <h1 id="title-overview">
                      Harshal
                      <br />
                      Jorwekar<span>.</span>
                    </h1>
                    <p className="hero-intro">
                      Building software, <br />
                      systems &amp; AI.
                    </p>
                    <div className="actions">
                      <a
                        className="primary"
                        href="#work"
                        onClick={internal("work")}
                      >
                        Explore my work <span aria-hidden="true">↗</span>
                      </a>
                      <ExternalLink href={links.resume}>
                        View résumé
                      </ExternalLink>
                    </div>
                    <a
                      className="scroll-cue"
                      href="#work"
                      onClick={internal("work")}
                    >
                      Scroll into my world <span aria-hidden="true">↓</span>
                    </a>
                  </>
                )}
                {stop.kind === "project" && (
                  <>
                    <p className="category">{stop.project.category}</p>
                    <h2 id={`title-${stop.anchor}`}>{stop.project.name}</h2>
                    <p className="summary">{stop.project.summary}</p>
                    <ul className="tags" aria-label="Technologies">
                      {stop.project.tech.slice(0, 4).map((tech) => (
                        <li key={tech}>{tech}</li>
                      ))}
                    </ul>
                    <div className="actions">
                      <button
                        className="primary"
                        onClick={() => setProject(stop.project)}
                      >
                        View project <span aria-hidden="true">↗</span>
                      </button>
                      <a
                        className="next-stop"
                        href={`#${stops[stop.index + 1].anchor}`}
                        onClick={internal(stops[stop.index + 1].anchor)}
                      >
                        Next: {stops[stop.index + 1].planet}{" "}
                        <span aria-hidden="true">↓</span>
                      </a>
                    </div>
                  </>
                )}
                {stop.kind === "personal" && (
                  <>
                    <p className="category">About / A little closer to home</p>
                    <h2 id="title-about">
                      Curiosity,
                      <br />
                      engineered.
                    </h2>
                    <p className="summary">
                      I’m Harshal, a software engineer with an M.S. in Data
                      Science from Northeastern University, Silicon Valley, and
                      previous experience at FIS Global.
                    </p>
                    <p className="body-copy">
                      My work connects backend systems, machine learning, and
                      thoughtful interfaces. This solar system is a place for
                      all three to meet.
                    </p>
                    <div className="actions">
                      <ExternalLink href={links.resume} primary>
                        View résumé
                      </ExternalLink>
                      <ExternalLink href={links.github}>GitHub</ExternalLink>
                    </div>
                  </>
                )}
                {stop.kind === "closing" && (
                  <>
                    <p className="category">Contact / Beyond the last orbit</p>
                    <h2 id="title-contact">
                      There’s more
                      <br />
                      to explore<span>.</span>
                    </h2>
                    <p className="summary">
                      Thanks for travelling through my work. Find my projects
                      and background here.
                    </p>
                    <div className="contact-links">
                      <ExternalLink href={links.github}>GitHub</ExternalLink>
                      <ExternalLink href={links.linkedin}>
                        LinkedIn
                      </ExternalLink>
                      <ExternalLink href={links.resume}>Résumé</ExternalLink>
                    </div>
                    <p className="fine-print">
                      LinkedIn and résumé use the existing portfolio
                      destinations; provider access is still being confirmed.
                    </p>
                    <a
                      className="text-link"
                      href="#overview"
                      onClick={internal("overview")}
                    >
                      Back to the solar system ↑
                    </a>
                  </>
                )}
              </div>
            </section>
          ))}
        </main>

        {mode === "free" && (
          <aside
            className="explore-panel"
            aria-label="Explore the solar system"
          >
            <label className="destination-label" htmlFor="destination">
              Explore the solar system
            </label>
            <select
              id="destination"
              value={focus || ""}
              onChange={(event) => {
                setFocus(event.target.value || null);
                setFitAll(false);
                setResetKey((value) => value + 1);
              }}
            >
              <option value="">Solar system</option>
              {stops.slice(1).map((stop) => (
                <option key={stop.planet} value={stop.planet}>
                  {stop.planet}
                </option>
              ))}
            </select>
            <div className="explore-actions">
              <button
                onClick={() => {
                  setFocus(null);
                  setFitAll(true);
                  setResetKey((value) => value + 1);
                }}
              >
                Fit all planets
              </button>
              {focus && (
                <button
                  onClick={() => {
                    const stop = stops.find((stop) => stop.planet === focus);
                    if (stop.project) setProject(stop.project);
                    else navigate(stop.anchor);
                  }}
                >
                  {stops.find((stop) => stop.planet === focus)?.project
                    ? "View project"
                    : "Visit chapter"}{" "}
                  ↗
                </button>
              )}
            </div>
            {!compact && (
              <label className="detail-toggle">
                <input
                  type="checkbox"
                  checked={details}
                  onChange={(event) => setDetails(event.target.checked)}
                />{" "}
                Skills &amp; links
              </label>
            )}
            <p className="explore-help">
              Drag to orbit · Scroll or pinch to zoom
            </p>
          </aside>
        )}
        {(!ready || failed) && (
          <p className="loading-status" role="status">
            {failed
              ? "3D unavailable · all chapters remain accessible"
              : "Loading the solar system · content ready"}
          </p>
        )}
      </div>

      <footer className="flight-bar">
        <div className="mode-switch" role="group" aria-label="Journey mode">
          <button
            aria-pressed={mode === "guided"}
            onClick={() => {
              setMode("guided");
              setFocus(null);
            }}
          >
            Guided
          </button>
          <button
            aria-pressed={mode === "free"}
            disabled={sceneOff}
            onClick={() => {
              setMode("free");
              setFocus(null);
              setFitAll(false);
              setResetKey((value) => value + 1);
            }}
          >
            Explore
          </button>
        </div>
        <div className="chapter-progress">
          <span>
            {mode === "guided"
              ? String(active).padStart(2, "0") + " / 08"
              : "Exploring"}
          </span>
          <span>
            {mode === "free"
              ? focus || "Solar system"
              : current.planet || "Overview"}
          </span>
        </div>
        <div className="utility-controls">
          <button
            onClick={() => setIndexOpen(true)}
            aria-label="Open project index"
          >
            Projects
          </button>
          <button onClick={overview}>Overview</button>
        </div>
      </footer>
      {project && (
        <ProjectDetail project={project} onClose={() => setProject(null)} />
      )}
      {indexOpen && (
        <ProjectIndex
          onClose={() => setIndexOpen(false)}
          onNavigate={navigate}
        />
      )}
    </div>
  );
}

function ProjectIndex({ onClose, onNavigate }) {
  const ref = useRef();
  useEffect(() => {
    const previous = document.activeElement;
    const dialog = ref.current;
    dialog.showModal();
    return () => {
      dialog.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      className="index-dialog"
      ref={ref}
      aria-labelledby="index-title"
      onCancel={onClose}
    >
      <div className="detail-top">
        <h2 id="index-title">Your flight plan.</h2>
        <button onClick={onClose} aria-label="Close project index">
          Close ×
        </button>
      </div>
      <p>Jump straight to a chapter, or follow the full journey.</p>
      <nav aria-label="Project index">
        {stops.map((stop) => (
          <a
            key={stop.anchor}
            href={`#${stop.anchor}`}
            onClick={(event) => {
              event.preventDefault();
              onNavigate(stop.anchor);
            }}
          >
            <span>{String(stop.index).padStart(2, "0")}</span>
            <strong>{stop.label}</strong>
            <span>{stop.planet || "Overview"}</span>
            <span>↗</span>
          </a>
        ))}
      </nav>
    </dialog>
  );
}
