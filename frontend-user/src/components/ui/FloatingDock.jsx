import React, { useRef, useState } from "react";
import { IconHome, IconBuildingSkyscraper, IconUsers, IconCalendar, IconBell, IconUser } from "@tabler/icons-react";
import { cn } from "../../utils/cn";
import { Link, useLocation } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import NotificationDropdown from "../NotificationDropdown";

export const FloatingDock = ({ items, desktopClassName, mobileClassName }) => {
  return (
    <>
      <FloatingDockDesktop items={items} className={desktopClassName} />
      <FloatingDockMobile items={items} className={mobileClassName} />
    </>
  );
};

const FloatingDockMobile = ({ items, className }) => {
  const location = useLocation();

  return (
    <div className={cn("fixed bottom-0 left-0 right-0 z-50 md:hidden", className)}>
      <div className="mx-auto flex items-center justify-around bg-gray-900/90 backdrop-blur-lg border-t border-gray-700 px-4 py-3">
        {items.map((item) => (
          <Link
            key={item.title}
            to={item.href}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
              location.pathname === item.href
                ? "text-blue-400"
                : "text-gray-400 hover:text-white"
            )}
          >
            <div className="h-6 w-6">{item.icon}</div>
            <span className="text-xs">{item.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

const FloatingDockDesktop = ({ items, className }) => {
  let mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "hidden md:flex h-16 gap-4 items-end rounded-2xl bg-gray-900/90 backdrop-blur-lg border border-gray-700 px-4 pb-3 fixed bottom-8 left-1/2 -translate-x-1/2 z-50",
        className
      )}
    >
      {items.map((item) => (
        <IconContainer mouseX={mouseX} key={item.title} {...item} />
      ))}
    </motion.div>
  );
};

function IconContainer({ mouseX, title, icon, href }) {
  let ref = useRef(null);
  const location = useLocation();

  let distance = useTransform(mouseX, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  let widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  let heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);

  let widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);
  let heightTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);

  let width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  let widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const [hovered, setHovered] = useState(false);
  const isActive = location.pathname === href;

  return (
    <Link to={href}>
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          "aspect-square rounded-full flex items-center justify-center relative",
          isActive ? "bg-blue-500" : "bg-gray-800 hover:bg-gray-700"
        )}
      >
        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className="flex items-center justify-center text-white"
        >
          {icon}
        </motion.div>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 2, x: "-50%" }}
            className="px-2 py-0.5 whitespace-pre rounded-md bg-gray-800 border border-gray-700 text-white absolute left-1/2 -translate-x-1/2 -top-8 w-fit text-xs"
          >
            {title}
          </motion.div>
        )}
      </motion.div>
    </Link>
  );
}

export default FloatingDock;
