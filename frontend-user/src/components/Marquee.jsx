import React from 'react';

const Marquee = () => {
  const text = "Zidaan Architecture";

  // Repeating the text multiple times to ensure the loop is seamless
  const repeatedText = new Array(15).fill(text).join(" • ");

  return (
    <div className="relative py-12 border-t border-black/5 bg-white marquee-container">
      <div className="animate-marquee">
        <span className="text-[3vw] md:text-[1.8vw] font-bold uppercase tracking-[0.3em] text-stroke opacity-40 leading-none py-2 px-12 whitespace-nowrap">
          {new Array(30).fill(text).join(" • ")} •
        </span>
        <span className="text-[3vw] md:text-[1.8vw] font-bold uppercase tracking-[0.3em] text-stroke opacity-40 leading-none py-2 px-12 whitespace-nowrap">
          {new Array(30).fill(text).join(" • ")} •
        </span>
      </div>
    </div>
  );
};

export default Marquee;
