import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../utils/cn";

export const LayoutTextFlip = ({ text, words, duration = 3000, className }) => {
  const [currentWord, setCurrentWord] = useState(words[0]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % words.length;
        setCurrentWord(words[newIndex]);
        return newIndex;
      });
    }, duration);

    return () => clearInterval(interval);
  }, [words, duration]);

  return (
    <div className={cn("inline-flex items-center", className)}>
      <span className="mr-2">{text}</span>
      <AnimatePresence mode="wait">
        <motion.span
          key={currentWord}
          initial={{ opacity: 0, y: 20, rotateX: 90 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          exit={{ opacity: 0, y: -20, rotateX: -90 }}
          transition={{
            duration: 0.4,
            ease: "easeInOut",
          }}
          className="inline-block text-accent font-bold"
          style={{
            transformStyle: "preserve-3d",
            transformOrigin: "center center",
          }}
        >
          {currentWord}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

export default LayoutTextFlip;
