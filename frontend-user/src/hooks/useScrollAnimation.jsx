import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useScrollAnimation(animationType = "fade-up", delay = 0) {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let ctx = gsap.context(() => {
      let initialVars = { opacity: 0, y: 50 };

      if (animationType === "fade-in") initialVars = { opacity: 0 };
      if (animationType === "slide-left") initialVars = { opacity: 0, x: -50 };
      if (animationType === "slide-right") initialVars = { opacity: 0, x: 50 };
      if (animationType === "scale-up") initialVars = { opacity: 0, scale: 0.8 };

      gsap.fromTo(
        element,
        initialVars,
        {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          duration: 1,
          delay: delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: element,
            start: "top 80%", // Animation starts when top of element hits 80% viewport height
            toggleActions: "play none none reverse",
          },
        }
      );
    }, element);

    return () => ctx.revert();
  }, [animationType, delay]);

  return elementRef;
}
