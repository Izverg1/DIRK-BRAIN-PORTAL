import React, { useState, useEffect } from 'react';
import { Html } from '@react-three/drei';
import { AnimatePresence, motion } from 'framer-motion';

interface AmbientNotificationProps {
  message: string;
  position?: [number, number, number];
  duration?: number; // in milliseconds
}

const AmbientNotification: React.FC<AmbientNotificationProps> = ({
  message,
  position = [0, 2, 0],
  duration = 3000,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <AnimatePresence>
      {visible && (
        <Html position={position} center>
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm"
          >
            {message}
          </motion.div>
        </Html>
      )}
    </AnimatePresence>
  );
};

export default AmbientNotification;
