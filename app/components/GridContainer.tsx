import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GridContainerProps {
  children: ReactNode;
  zoomLevel: number;
  baseWidth?: number;
  className?: string;
}

export const GridContainer = ({ 
  children, 
  zoomLevel, 
  baseWidth = 900,
  className = ""
}: GridContainerProps) => {
  return (
    <motion.div
      className={`grid grid-cols-3 grid-rows-3 gap-6 aspect-square bg-gray-50 ${className}`}
      style={{ 
        width: `${baseWidth * zoomLevel}px`,
        transition: 'width 0.3s ease'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {children}
    </motion.div>
  );
}; 