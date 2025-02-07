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
      <div className="absolute top-1/2 left-0 w-full h-px">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-mantra-gold/20 to-transparent" />
      </div>
      <h3 className="relative inline-block text-3xl font-bold text-mantra-gold px-8">
        <span className="relative z-10">{title}</span>
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/0 backdrop-blur-[2px]" />
      </h3>
    </motion.div>
  );
};
