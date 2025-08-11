// tests/unit/frontend/test-3d-components.test.tsx
import React from 'react';
import { render } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import DynamicAgentEntity from '../../../frontend/src/components/DynamicAgentEntity';

describe('DynamicAgentEntity', () => {
  it('should render a sphere for DIRK.desktop agent', () => {
    const agent = {
      id: 'agent1',
      type: 'DIRK.desktop',
      workload: 50,
      performance: 80,
      communicationVolume: 5,
      taskProgress: [],
      position: [0, 0, 0],
    };
    render(
      <Canvas>
        <DynamicAgentEntity agent={agent} onHover={() => {}} />
      </Canvas>
    );
    // Assert that a sphere is rendered (this might require more advanced testing setup for Three.js components)
  });

  // Add more tests for different agent types, workload, performance, etc.
});
