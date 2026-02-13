import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "../../utils/cn";

export const DraggableCard = ({ children, className, containerClassName }) => {
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(0, { stiffness: 300, damping: 30 });
  const rotateY = useSpring(0, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e) => {
    if (!cardRef.current || isDragging) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const rotateXValue = ((e.clientY - centerY) / rect.height) * -20;
    const rotateYValue = ((e.clientX - centerX) / rect.width) * 20;

    rotateX.set(rotateXValue);
    rotateY.set(rotateYValue);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <div className={cn("perspective-1000", containerClassName)}>
      <motion.div
        ref={cardRef}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.1}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          x,
          y,
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className={cn(
          "cursor-grab active:cursor-grabbing",
          className
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default DraggableCard;
