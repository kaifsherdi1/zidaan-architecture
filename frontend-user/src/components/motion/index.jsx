import React, { useEffect, useRef, useState } from 'react';
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  animate,
} from 'framer-motion';

/*
 * Scroll-driven motion primitives.
 *
 * Everything here animates only `transform` / `opacity` / `clip-path`, all of
 * which run on the compositor, and framer-motion reads scroll position with a
 * passive listener batched into rAF — so these stay smooth on phones too.
 * Every component renders a static version under prefers-reduced-motion.
 */

/** Thin bar pinned to the top of the viewport showing page scroll progress. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[2px] bg-accent-dark origin-left z-[60] pointer-events-none"
    />
  );
}

/**
 * Image that drifts slower than the page inside a cropped frame.
 * `strength` is the travel as a % of the frame height.
 */
export function ParallaxImage({ src, alt = '', className = '', imgClassName = '', strength = 12, loading = 'lazy' }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${strength}%`, `${strength}%`]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        loading={loading}
        style={reduce ? undefined : { y, scale: 1 + (strength * 2.2) / 100 }}
        className={`absolute inset-0 w-full h-full object-cover will-change-transform ${imgClassName}`}
      />
    </div>
  );
}

/** Wraps any block and moves it vertically against the scroll. */
export function Parallax({ children, offset = 60, className = '' }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);
  return (
    <motion.div ref={ref} style={reduce ? undefined : { y }} className={className}>
      {children}
    </motion.div>
  );
}

/** Image revealed by a curtain wipe the first time it enters the viewport. */
export function ImageReveal({ src, alt = '', className = '', direction = 'up', delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -12% 0px' });
  const reduce = useReducedMotion();
  const hidden = {
    up: 'inset(100% 0% 0% 0%)',
    left: 'inset(0% 100% 0% 0%)',
    right: 'inset(0% 0% 0% 100%)',
  }[direction];

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        initial={reduce ? false : { clipPath: hidden, scale: 1.25 }}
        animate={inView || reduce ? { clipPath: 'inset(0% 0% 0% 0%)', scale: 1 } : undefined}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: delay / 1000 }}
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
}

/**
 * Headline whose lines slide up from behind a mask.
 * Pass `lines` as an array of strings/nodes. `immediate` animates on mount
 * (for heroes) instead of on scroll-into-view.
 */
export function MaskText({ lines, as: Tag = 'h2', className = '', lineClassName = '', immediate = false, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  const reduce = useReducedMotion();
  const show = immediate || inView;

  return (
    <Tag ref={ref} className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <motion.span
            className={`block ${lineClassName}`}
            initial={reduce ? false : { y: '110%' }}
            animate={show || reduce ? { y: '0%' } : undefined}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: delay / 1000 + i * 0.12 }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/**
 * Animates the numeric part of a stat ("250+", "₹9,500 Cr+", "14") from 0
 * when it scrolls into view, keeping any prefix/suffix as-is.
 */
export function CountUp({ value, className = '', duration = 2 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  const reduce = useReducedMotion();
  const match = String(value).match(/^(\D*)([\d,]+)(.*)$/);
  const [display, setDisplay] = useState(match && !reduce ? `${match[1]}0${match[3]}` : value);

  useEffect(() => {
    if (!match || !inView || reduce) return undefined;
    const [, prefix, num, suffix] = match;
    const target = Number(num.replace(/,/g, ''));
    const useCommas = num.includes(',');
    const controls = animate(0, target, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        const n = Math.round(v);
        setDisplay(`${prefix}${useCommas ? n.toLocaleString('en-IN') : n}${suffix}`);
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, value, duration]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}

/**
 * Oversized text band that slides sideways as the page scrolls.
 * `direction` 1 moves left on scroll down, -1 moves right.
 */
export function ScrollText({ text, direction = 1, className = '' }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const x = useTransform(scrollYProgress, [0, 1], direction > 0 ? ['0%', '-35%'] : ['-35%', '0%']);
  const row = new Array(6).fill(text).join('  ·  ');

  return (
    <div ref={ref} className="overflow-hidden whitespace-nowrap select-none" aria-hidden="true">
      <motion.div style={reduce ? undefined : { x }} className={`inline-block will-change-transform ${className}`}>
        {row}
      </motion.div>
    </div>
  );
}

/**
 * Video card that grows into a full-bleed frame as it scrolls through the
 * viewport. Only plays (and only downloads) while on screen.
 */
export function ExpandingVideo({ sources, poster, children }) {
  const ref = useRef(null);
  const videoRef = useRef(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { margin: '200px 0px 200px 0px' });
  const [load, setLoad] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] });
  const inset = useTransform(scrollYProgress, [0, 1], [14, 0]);
  const radius = useTransform(scrollYProgress, [0, 1], [24, 0]);
  const clipPath = useTransform([inset, radius], ([i, r]) => `inset(${i}% ${i}% ${i}% ${i}% round ${r}px)`);
  const scale = useTransform(scrollYProgress, [0, 1], [1.2, 1]);
  const contentY = useTransform(scrollYProgress, [0.4, 1], [60, 0]);
  const contentOpacity = useTransform(scrollYProgress, [0.4, 1], [0, 1]);

  useEffect(() => {
    if (inView) setLoad(true);
    const v = videoRef.current;
    if (!v || reduce) return;
    if (inView) v.play().catch(() => {});
    else v.pause();
  }, [inView, load, reduce]);

  return (
    <section ref={ref} className="relative h-[85svh] sm:h-screen w-full bg-white">
      <motion.div style={reduce ? undefined : { clipPath }} className="absolute inset-0 overflow-hidden bg-black">
        <motion.div style={reduce ? undefined : { scale }} className="absolute inset-0 will-change-transform">
          {load && !reduce ? (
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              muted
              loop
              playsInline
              preload="metadata"
              poster={poster}
            >
              {sources.sm && <source src={sources.sm} type="video/mp4" media="(max-width: 767px)" />}
              <source src={sources.lg} type="video/mp4" />
            </video>
          ) : (
            <img src={poster} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
          )}
        </motion.div>
        <div className="absolute inset-0 bg-black/45" />
        <motion.div
          style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}
          className="absolute inset-0 flex items-center"
        >
          {children}
        </motion.div>
      </motion.div>
    </section>
  );
}
