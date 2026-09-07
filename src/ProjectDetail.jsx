import { useRef, useEffect } from "react";
import { links } from "./portfolioContent";
export default function ProjectDetail({ project, onClose }) {
  const dialog = useRef();
  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement;
    element.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      element.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      aria-labelledby="project-title"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === dialog.current) onClose();
      }}
    >
      <div className="detail-top">
        <span className="eyebrow">{project.id} / project notes</span>
        <button autoFocus onClick={onClose} aria-label="Close project details">
          Close ×
        </button>
      </div>
      <p className="eyebrow accent">{project.category}</p>
      <h2 id="project-title">{project.name}</h2>
      <p className="detail-lead">{project.summary}</p>
      {project.problem ? (
        <div className="detail-grid">
          {[
            ["The problem", project.problem],
            ["My contribution", project.contribution],
            ["The approach", project.approach],
            ["Outcome & evaluation", project.result],
          ].map(([title, body]) => (
            <section key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
            </section>
          ))}
        </div>
      ) : (
        <p>
          This project is part of the wider collection. Its full case study is
          being reviewed; the first featured case study is SANSKRITA.
        </p>
      )}
      <ul className="tags">
        {project.tech.map((tech) => (
          <li key={tech}>{tech}</li>
        ))}
      </ul>
      <a
        className="text-link"
        href={links.github}
        target="_blank"
        rel="noreferrer"
      >
        Visit my GitHub profile ↗
      </a>
      <p className="fine-print">
        A project-specific source link has not yet been confirmed.
      </p>
    </dialog>
  );
}
