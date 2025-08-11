import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({ children, onClick, className }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      className={cn("px-6 py-3 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300", className)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
};

export default AnimatedButton;
