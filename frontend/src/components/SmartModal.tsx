import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SmartModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  context?: string; // Optional prop to simulate context awareness
}

const SmartModal: React.FC<SmartModalProps> = ({ isOpen, onClose, children, context }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose} // Close modal when clicking outside
        >
          <motion.div
            className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full relative"
            initial={{ y: "-100vh", opacity: 0 }}
            animate={{ y: "0", opacity: 1 }}
            exit={{ y: "100vh", opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            {context && (
              <div className="text-sm text-gray-400 mb-4">Context: {context}</div>
            )}
            {children}
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              onClick={onClose}
            >
              &times;
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SmartModal;
