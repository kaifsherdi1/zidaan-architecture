import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

const EASE = [0.16, 1, 0.3, 1];

// Staggered entrance for the hero's text blocks.
const item = (i) => ({
  initial: { opacity: 0, y: 36 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1, ease: EASE, delay: 0.15 + i * 0.12 },
});

/**
 * Standard inner-page hero. Either an image banner (image prop) or a
 * clean typographic header on white (default). Image heroes drift with a
 * parallax as the page scrolls and the copy fades away.
 */
export default function PageHero({
  eyebrow,
  title,
  intro,
  image,
  breadcrumb,
  align = 'left',
  actions,
}) {
  const isImage = Boolean(image);
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.08, 1.2]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const m = (i) => (reduce ? {} : item(i));

  return (
    <section
      ref={ref}
      className={
        isImage
          ? 'relative w-full min-h-[70vh] flex items-end overflow-hidden bg-black'
          : 'bg-white pt-36 sm:pt-44 pb-14 sm:pb-20'
      }
    >
      {isImage && (
        <>
          <motion.img
            src={image}
            alt=""
            aria-hidden="true"
            style={reduce ? undefined : { y: imgY, scale: imgScale }}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute inset-0 w-full h-full object-cover will-change-transform"
          />
          {/* content legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/20" />
          {/* extra scrim behind the fixed navbar */}
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/45 to-transparent" />
        </>
      )}

      <motion.div
        style={isImage && !reduce ? { y: textY, opacity: textOpacity } : undefined}
        className={`section-container relative z-10 ${
          isImage ? 'pt-36 sm:pt-40 pb-14 sm:pb-20' : ''
        }`}
      >
        <div
          className={`${align === 'center' ? 'mx-auto text-center' : ''} max-w-3xl`}
        >
          {breadcrumb && (
            <motion.nav
              {...m(0)}
              className={`mb-6 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.3em] ${
                isImage ? 'text-white/60' : 'text-black/35'
              } ${align === 'center' ? 'justify-center' : ''}`}
            >
              {breadcrumb.map((crumb, i) => (
                <span key={crumb.label} className="flex gap-2">
                  {crumb.to ? (
                    <Link to={crumb.to} className="opacity-70 hover:opacity-100 transition-opacity">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span>{crumb.label}</span>
                  )}
                  {i < breadcrumb.length - 1 && <span>/</span>}
                </span>
              ))}
            </motion.nav>
          )}

          {eyebrow && (
            <motion.span {...m(1)} className={isImage ? 'eyebrow-light' : 'eyebrow'}>
              {eyebrow}
            </motion.span>
          )}

          <div className="overflow-hidden pb-[0.1em]">
            <motion.h1
              initial={reduce ? false : { y: '105%' }}
              animate={{ y: 0 }}
              transition={{ duration: 1.1, ease: EASE, delay: 0.3 }}
              className={`font-sans font-bold uppercase tracking-tighter leading-[0.92] text-4xl sm:text-6xl lg:text-7xl ${
                isImage ? 'text-white' : 'text-black'
              }`}
            >
              {title}
            </motion.h1>
          </div>

          {intro && (
            <motion.p
              {...m(3)}
              className={`mt-7 text-base sm:text-lg font-light leading-relaxed ${
                isImage ? 'text-white/80' : 'text-secondary'
              } ${align === 'center' ? 'mx-auto' : ''} max-w-xl`}
            >
              {intro}
            </motion.p>
          )}

          {actions && (
            <motion.div
              {...m(4)}
              className={`mt-9 flex flex-wrap gap-4 ${
                align === 'center' ? 'justify-center' : ''
              }`}
            >
              {actions}
            </motion.div>
          )}
        </div>
      </motion.div>
    </section>
  );
}
