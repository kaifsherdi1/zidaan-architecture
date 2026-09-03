import React, { useEffect, useRef, useState } from 'react';

/**
 * Full-bleed autoplaying hero video with an instant poster paint, a small
 * mobile encode, and a static-image fallback for reduced-motion / failure.
 */
export default function HeroVideo({ sources, poster, alt = '' }) {
  const videoRef = useRef(null);
  const [failed, setFailed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e) => setReducedMotion(e.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  const showVideo = !failed && !reducedMotion;

  return (
    <div className="absolute inset-0 w-full h-full">
      <img
        src={poster}
        alt={alt}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
          showVideo ? 'opacity-0' : 'opacity-100'
        }`}
      />
      {showVideo && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={poster}
          onError={() => setFailed(true)}
        >
          {sources.sm && <source src={sources.sm} type="video/mp4" media="(max-width: 767px)" />}
          <source src={sources.lg} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
