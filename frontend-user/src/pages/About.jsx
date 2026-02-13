import React from 'react';
import Layout from '../components/Layout';
import { Heading, Text } from '../components/ui/Typography';
import aboutHero from '../assets/images/Realx-30x40-image3.png';

export default function About() {
  return (
    <Layout>
      <section className="pt-40 pb-20 bg-white">
        <div className="section-container">
          <div className="max-w-4xl">
            <span className="text-[10px] uppercase tracking-[0.5em] text-black/40 mb-6 block">
              The Vision
            </span>
            <Heading level={1} className="mb-12">
              The Poetry<br />of <span className="font-serif-italic normal-case text-accent">Space</span>
            </Heading>
            <Text className="text-xl md:text-2xl font-light text-secondary leading-relaxed italic">
              "We believe that every structure has a soul, and our mission is to unveil it through minimal design and pure materiality."
            </Text>
          </div>
        </div>
      </section>

      <section className="h-[70vh] w-full overflow-hidden">
        <img src={aboutHero} alt="Studio Philosophy" className="w-full h-full object-cover" />
      </section>

      <section className="section-padding bg-white">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div>
              <Heading level={2} className="mb-10">Our Approach</Heading>
              <div className="space-y-8 text-secondary font-light">
                <p>Founded in 2024, Zidaan Architectures was established with a singular focus: to redefine high-end residential and commercial architecture through the lens of minimalism and emotional resonance.</p>
                <p>We approach each project as a unique dialogue between the client's aspirations, the site's inherent characteristics, and the timeless principles of light and form. Our studio does not follow trends; we seek to create enduring architecture that remains relevant for generations.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {[
                { title: "Pure Forms", desc: "Reducing architectural elements to their most essential expression." },
                { title: "Honest Materials", desc: "Celebrating the raw beauty of stone, wood, concrete, and glass." },
                { title: "Natural Light", desc: "Utilizing light as a primary building material to sculpt interior volumes." },
                { title: "Emotional Depth", desc: "Designing spaces that evoke stillness, contemplation, and wonder." }
              ].map((value, i) => (
                <div key={i} className="bg-background-off p-8 border border-black/5">
                  <h4 className="text-sm font-bold uppercase tracking-widest mb-4">{value.title}</h4>
                  <p className="text-xs text-secondary leading-loose font-light">{value.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
