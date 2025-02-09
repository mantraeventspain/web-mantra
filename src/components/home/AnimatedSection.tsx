import { motion, useScroll, useTransform } from "framer-motion";
import { ReactNode, useRef } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export const AnimatedSection = ({
  children,
  delay = 0,
  className = "",
}: AnimatedSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [100, 0, 0, -100]);
  const scale = useTransform(
    scrollYProgress,
    [0, 0.3, 0.7, 1],
    [0.8, 1, 1, 0.8]
  );

  return (
    <motion.div
      ref={ref}
      style={{
        opacity,
        y,
        scale,
      }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.16, 1, 0.3, 1], // Curva de animación suave tipo Apple
      }}
      className={`w-full py-12 scroll-mt-12 will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  );
};
