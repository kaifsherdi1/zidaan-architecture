import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Marquee from './Marquee';

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Marquee />
      <Footer />
    </div>
  );
}
