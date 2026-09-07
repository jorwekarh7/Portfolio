    // src/SectionsPanel.jsx
    import React, { useEffect } from "react";

    function PanelFrame({ title, onClose, children }) {
    // close on ESC
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose?.();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
        <div
        style={{
            position: "fixed",
            inset: 0,
            zIndex: 40,
            pointerEvents: "none",
        }}
        >
        {/* dim background */}
        <div
            onClick={onClose}
            style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            backdropFilter: "blur(2px)",
            pointerEvents: "auto",
            }}
        />

        {/* right drawer */}
        <aside
            style={{
            position: "absolute",
            right: 16,
            top: 80,
            bottom: 16,
            width: "min(92vw, 420px)",
            background:
                "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.05))",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 16,
            padding: 16,
            color: "#fff",
            overflow: "auto",
            pointerEvents: "auto",
            boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
            }}
        >
            <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 8,
            }}
            >
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{title}</h3>
            <button className="btn-ghost" onClick={onClose}>
                Close
            </button>
            </div>
            {children}
        </aside>
        </div>
    );
    }

    export default function SectionsPanel({ panel, onClose }) {
    if (!panel) return null;

    if (panel === "about") {
        return (
        <PanelFrame title="About" onClose={onClose}>
            <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
            I’m <b>Harshal Jorwekar</b>, a software engineer who likes building
            reliable, high-performance systems end-to-end. I completed my M.S. in
            Data Science at Northeastern University (Silicon Valley) and previously
            shipped production software at FIS Global (’21–’23).
            </p>
            <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
            Recent work spans a Retrieval-Augmented LLM for IAST-transliterated
            Sanskrit (<i>“Sanskrita”</i>), a real-time multi-modal gesture
            recognition system achieving <b>97.25%</b> accuracy with
            <b> &lt;40&nbsp;ms</b> latency, a voice AI assistant, and this playful
            WebGL/Three.js portfolio.
            </p>
            <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
            I care about performance tuning, clean DX, and thoughtful UX—whether
            that’s a crisp API, a resilient backend, or a shader that makes a scene
            feel alive. My toolkit includes <b>Python</b>, <b>Java</b>,
            <b> Node.js/React</b>, <b>FastAPI/Flask</b>, <b>.NET&nbsp;Core</b>,
            <b> SQL/NoSQL</b>, <b>Docker/Kubernetes</b>, <b>AWS/GCP</b>,
            <b> Kafka/Spark</b>, and <b>PyTorch</b>. I’m looking for roles across
            backend, full-stack, platform/SRE, or ML engineering where I can ship
            measurable impact and keep learning fast.
            </p>
        </PanelFrame>
        );
    }

    if (panel === "skills") {
        return (
        <PanelFrame title="Skills" onClose={onClose}>
            <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
            Explore the system — the tiny satellites orbiting each planet are my
            skill badges. Pan, rotate, and zoom to discover them.
            </p>
        </PanelFrame>
        );
    }

    if (panel === "projects") {
        return (
        <PanelFrame title="Projects" onClose={onClose}>
            <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
            Tour the planets to explore my projects. Pan, rotate, and zoom through
            the system — or use the name buttons along the bottom to teleport
            straight to a planet.
            </p>
        </PanelFrame>
        );
    }

    if (panel === "contact") {
        return (
        <PanelFrame title="Contact" onClose={onClose}>
            <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
            Swing by <b>Earth</b> to find my socials and contact links.
            </p>
        </PanelFrame>
        );
    }

    return null;
    }
