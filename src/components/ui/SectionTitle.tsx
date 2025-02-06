import { motion } from "framer-motion";

interface SectionTitleProps {
  title: string;
  className?: string;
}

export const SectionTitle = ({ title, className = "" }: SectionTitleProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative text-center mb-16 ${className}`}
    >
      <div className="absolute top-1/2 left-0 w-full h-px bg-mantra-gold/20">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-mantra-gold/20 to-transparent blur-sm" />
      </div>
      <h3 className="relative inline-block text-3xl font-bold text-mantra-gold px-8 bg-black">
        {title}
      </h3>
    </motion.div>
  );
};
