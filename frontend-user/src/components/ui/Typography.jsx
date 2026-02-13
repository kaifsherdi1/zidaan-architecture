import React from 'react';

export const Heading = ({
  children,
  level = 1,
  className = '',
  serif = false,
  reveal = false
}) => {
  const Tag = `h${level}`;

  const levels = {
    1: 'text-5xl md:text-7xl lg:text-8xl leading-[0.9] tracking-tighter',
    2: 'text-4xl md:text-5xl lg:text-6xl leading-[1] tracking-tight',
    3: 'text-2xl md:text-3xl lg:text-4xl leading-[1.1] tracking-normal',
    4: 'text-xl md:text-2xl lg:text-3xl leading-[1.2]',
  };

  const baseClasses = serif ? 'font-serif-italic capitalize' : 'font-sans font-bold uppercase';
  const revealClasses = reveal ? 'text-reveal' : '';

  return (
    <div className={reveal ? 'overflow-hidden' : ''}>
      <Tag className={`${levels[level]} ${baseClasses} ${revealClasses} ${className}`}>
        {children}
      </Tag>
    </div>
  );
};

export const Text = ({
  children,
  variant = 'body',
  className = '',
  light = false
}) => {
  const variants = {
    body: 'text-base md:text-lg leading-relaxed',
    small: 'text-sm md:text-base leading-normal',
    tiny: 'text-xs uppercase tracking-widest',
    display: 'text-lg md:text-xl font-medium leading-snug',
  };

  const weightClass = light ? 'font-light' : 'font-normal';

  return (
    <p className={`${variants[variant]} ${weightClass} ${className}`}>
      {children}
    </p>
  );
};
