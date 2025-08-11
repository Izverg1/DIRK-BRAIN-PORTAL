import React, { useState, useEffect } from 'react';

interface ContextAwareVoiceFeedbackProps {
  message: string;
  systemState: any; // This would be a more detailed type in a real app
}

const ContextAwareVoiceFeedback: React.FC<ContextAwareVoiceFeedbackProps> = ({ message, systemState }) => {
  const [displayMessage, setDisplayMessage] = useState('');

  useEffect(() => {
    let feedback = message;

    // Example of context-aware feedback
    if (message.includes('deploying agent')) {
      if (systemState.activeAgents && systemState.activeAgents.length > 5) {
        feedback += ' Please note, system load is currently high.';
      } else {
        feedback += ' System resources are optimal for deployment.';
      }
    } else if (message.includes('agent status')) {
      if (systemState.criticalAgents && systemState.criticalAgents.length > 0) {
        feedback += ` There are ${systemState.criticalAgents.length} agents in critical state.`;
      } else {
        feedback += ' All agents are healthy.';
      }
    }

    setDisplayMessage(feedback);
  }, [message, systemState]);

  if (!displayMessage) return null;

  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(0, 255, 255, 0.8)',
      color: 'black',
      padding: '10px 20px',
      borderRadius: '5px',
      zIndex: 1000,
      fontSize: '1.2em',
      textAlign: 'center',
    }}>
      {displayMessage}
    </div>
  );
};

export default ContextAwareVoiceFeedback;
