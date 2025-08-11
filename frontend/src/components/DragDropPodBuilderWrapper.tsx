'use client';

import dynamic from 'next/dynamic';

// Dynamically import DragDropPodBuilder with SSR disabled to avoid hydration issues
const DragDropPodBuilder = dynamic(
  () => import('./DragDropPodBuilder'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading Agent Pod Builder...</p>
        </div>
      </div>
    )
  }
);

export default function DragDropPodBuilderWrapper() {
  return <DragDropPodBuilder />;
}