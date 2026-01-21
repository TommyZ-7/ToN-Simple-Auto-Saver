import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  currentPage: string;
}

const pageVariants = {
  initial: {
    opacity: 0,
    x: 20,
    filter: "blur(4px)",
  },
  animate: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    filter: "blur(4px)",
    transition: {
      duration: 0.2,
    },
  },
};

export function PageContainer({ children, currentPage }: PageContainerProps) {
  return (
    <div className="flex-1 overflow-hidden bg-[#1a1a1a]">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="h-full overflow-y-auto"
        >
          <div className="p-8 max-w-5xl mx-auto">{children}</div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
