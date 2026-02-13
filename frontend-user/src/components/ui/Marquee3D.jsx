import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

export const Marquee3D = ({ items, className, pauseOnHover = true }) => {
  return (
    <div className={cn("relative flex overflow-hidden", className)}>
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%)",
          backgroundSize: "100% 40px",
        }}
      />
      <motion.div
        className="flex gap-4"
        animate={{
          x: [0, -1000],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 20,
            ease: "linear",
          },
        }}
        style={{
          willChange: "transform",
        }}
      >
        {[...items, ...items].map((item, idx) => (
          <div
            key={idx}
            className="flex-shrink-0 w-80 h-48 bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            style={{
              transform: "perspective(1000px) rotateY(-5deg)",
              transformStyle: "preserve-3d",
            }}
          >
            {item}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default Marquee3D;
