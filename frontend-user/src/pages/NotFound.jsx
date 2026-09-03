import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <Layout>
      <section className="min-h-[70vh] flex items-center bg-white">
        <div className="section-container text-center">
          <span className="eyebrow mx-auto w-fit">Error 404</span>
          <h1 className="text-6xl sm:text-8xl font-bold uppercase tracking-tighter mb-8">
            Page not found
          </h1>
          <p className="text-secondary font-light max-w-md mx-auto mb-10">
            The page you're looking for has moved or never existed. Let's get you back on track.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/">
              <Button variant="minimal">Return home</Button>
            </Link>
            <Link to="/properties">
              <Button variant="link">Browse properties</Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
