import { useEffect, useRef, useState } from "react";
import { stops } from "./journey";

// One native scroll container. The camera consumes these public layout bounds;
// it never scrolls the page or delays access to a chapter.
export function useJourney(scrollRef) {
  const [active, setActive] = useState(0);
  const layout = useRef({ index: 0, progress: 0, blend: 0, bounds: [] });
  useEffect(() => {
    const scroller = scrollRef.current;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const stage = scroller.getBoundingClientRect();
      const bounds = stops.map((stop) => {
        const section = document.getElementById(stop.anchor);
        const scene = section
          .querySelector(".scene-window")
          .getBoundingClientRect();
        return {
          top: section.offsetTop,
          height: section.offsetHeight,
          scene: {
            x: scene.x - stage.x,
            y: scene.y - stage.y,
            width: scene.width,
            height: scene.height,
          },
        };
      });
      const previous = layout.current;
      if (
        previous.bounds.length &&
        (previous.width !== stage.width || previous.height !== stage.height)
      ) {
        const oldScroll = scroller.scrollTop;
        const chapter = bounds[previous.index];
        scroller.scrollTop = chapter.top + previous.progress * chapter.height;
        const shift = scroller.scrollTop - oldScroll;
        bounds.forEach((bound) => {
          bound.scene.y -= shift;
        });
      }
      // The incoming chapter becomes active as its upper edge enters the
      // leading 38% of the reading surface, in either scroll direction.
      const lead = scroller.scrollTop + stage.height * 0.38;
      let index = 0;
      bounds.forEach((bound, i) => {
        if (bound.top <= lead) index = i;
      });
      const current = bounds[index];
      const progress =
        (scroller.scrollTop - current.top) / Math.max(1, current.height);
      layout.current = {
        index,
        progress,
        bounds,
        width: stage.width,
        height: stage.height,
        scrollTop: scroller.scrollTop,
      };
      setActive(index);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(scroller);
    scroller
      .querySelectorAll(".chapter")
      .forEach((section) => observer.observe(section));
    scroller.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    measure();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      scroller.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [scrollRef]);
  return { active, layout };
}
