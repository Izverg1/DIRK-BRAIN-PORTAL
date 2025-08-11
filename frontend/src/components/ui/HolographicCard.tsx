'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';

interface HolographicCardProps {
  title: string;
  description: string;
  content: React.ReactNode;
  footer?: React.ReactNode;
}

export function HolographicCard({ title, description, content, footer }: HolographicCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-lg shadow-lg"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      }}
    >
      <Card className="bg-transparent border-none shadow-none">
        <CardHeader>
          <CardTitle className="text-purple-400 text-2xl font-bold">{title}</CardTitle>
          <CardDescription className="text-gray-300">{description}</CardDescription>
        </CardHeader>
        <CardContent className="text-white">{content}</CardContent>
        {footer && <CardFooter>{footer}</CardFooter>}
      </Card>
      {/* Holographic overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(45deg, rgba(128, 0, 128, 0.2), rgba(0, 255, 255, 0.2), rgba(128, 0, 128, 0.2))',
          mixBlendMode: 'overlay',
          opacity: 0.7,
        }}
      />
    </motion.div>
  );
}
