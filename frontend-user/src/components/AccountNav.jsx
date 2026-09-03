import React from 'react';
import { NavLink } from 'react-router-dom';

const LINKS = [
  { to: '/dashboard', label: 'Overview' },
  { to: '/saved', label: 'Saved' },
  { to: '/my-bookings', label: 'Viewings' },
  { to: '/profile', label: 'Profile' },
];

export default function AccountNav() {
  return (
    <nav className="flex gap-2 overflow-x-auto border-b border-black/10 mb-12 -mx-1">
      {LINKS.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end
          className={({ isActive }) =>
            `whitespace-nowrap px-4 py-3 text-[11px] uppercase tracking-[0.2em] font-bold border-b-2 -mb-px transition-colors ${
              isActive ? 'border-black text-black' : 'border-transparent text-black/40 hover:text-black'
            }`
          }
        >
          {l.label}
        </NavLink>
      ))}
    </nav>
  );
}
