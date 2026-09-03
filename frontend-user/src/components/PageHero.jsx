import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Standard inner-page hero. Either an image banner (image prop) or a
 * clean typographic header on white (default).
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

  return (
    <section
      className={
        isImage
          ? 'relative w-full min-h-[70vh] flex items-end overflow-hidden'
          : 'bg-white pt-36 sm:pt-44 pb-14 sm:pb-20'
      }
    >
      {isImage && (
        <>
          <img
            src={image}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* content legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/20" />
          {/* extra scrim behind the fixed navbar */}
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/45 to-transparent" />
        </>
      )}

      <div
        className={`section-container relative z-10 ${
          isImage ? 'pt-36 sm:pt-40 pb-14 sm:pb-20' : ''
        }`}
      >
        <div
          className={`${align === 'center' ? 'mx-auto text-center' : ''} max-w-3xl`}
        >
          {breadcrumb && (
            <nav
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
            </nav>
          )}

          {eyebrow && (
            <span className={isImage ? 'eyebrow-light' : 'eyebrow'}>{eyebrow}</span>
          )}

          <h1
            className={`font-sans font-bold uppercase tracking-tighter leading-[0.92] text-4xl sm:text-6xl lg:text-7xl ${
              isImage ? 'text-white' : 'text-black'
            }`}
          >
            {title}
          </h1>

          {intro && (
            <p
              className={`mt-7 text-base sm:text-lg font-light leading-relaxed ${
                isImage ? 'text-white/80' : 'text-secondary'
              } ${align === 'center' ? 'mx-auto' : ''} max-w-xl`}
            >
              {intro}
            </p>
          )}

          {actions && (
            <div
              className={`mt-9 flex flex-wrap gap-4 ${
                align === 'center' ? 'justify-center' : ''
              }`}
            >
              {actions}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
