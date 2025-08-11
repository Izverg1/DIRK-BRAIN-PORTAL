// tests/unit/frontend/test-agent-universe.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import AgentUniverse from '../../../frontend/src/app/AgentUniverse';

describe('AgentUniverse', () => {
  it('should render without crashing', () => {
    render(<AgentUniverse />);
    // Add assertions here, e.g., check for canvas element
    expect(screen.getByRole('canvas')).toBeInTheDocument();
  });

  // Add more tests for agent rendering, hover effects, etc.
});
