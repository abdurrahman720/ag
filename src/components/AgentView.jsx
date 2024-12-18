import { useState, useEffect } from 'react';

function AgentView({ socket, agentId }) {
  const [name, setName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [helpText, setHelpText] = useState('');
  const [assignedCloser, setAssignedCloser] = useState(null);

  useEffect(() => {
    socket.on('requestAccepted', ({ agentId: acceptedAgentId, closerName }) => {
      if (acceptedAgentId === agentId) {
        setHandRaised(true);
        setAssignedCloser(closerName);
      }
    });

    socket.on('requestCompleted', ({ agentId: completedAgentId }) => {
      if (completedAgentId === agentId) {
        setHandRaised(false);
        setHelpText('');
        setAssignedCloser(null);
      }
    });

    return () => {
      socket.off('requestAccepted');
      socket.off('requestCompleted');
    };
  }, [socket, agentId]);

  const handleLogin = () => {
    if (name.trim()) {
      setIsLoggedIn(true);
    }
  };

  const raiseHand = () => {
    if (!handRaised) {
      socket.emit('raiseHand', { 
        agentId, 
        name,
        helpText: helpText.trim() 
      });
      setHandRaised(true);
    }
  };

  const cancelRequest = () => {
    socket.emit('cancelRequest', { agentId });
    setHandRaised(false);
    setHelpText('');
    setAssignedCloser(null);
  };

  if (!isLoggedIn) {
    return (
      <div className="login-view">
        <h2>Agent Login</h2>
        <div className="login-form">
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="name-input"
            autoFocus
          />
          <button 
            onClick={handleLogin}
            disabled={!name.trim()}
            className="login-button"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-view">
      <h2>Welcome, {name}</h2>
      <div className="login-form">
        {!handRaised ? (
          <div className="raise-hand-section">
            <textarea
              placeholder="Describe what you need help with (optional)"
              value={helpText}
              onChange={(e) => setHelpText(e.target.value)}
              className="help-text"
              rows={3}
            />
            <button 
              className="raise-hand"
              onClick={raiseHand}
            >
              Raise Hand
            </button>
          </div>
        ) : (
          <div className="active-request">
            {assignedCloser ? (
              <>
                <p className="assigned-closer">Closer {assignedCloser} is helping you</p>
                <span className="status-indicator status-active">Active</span>
              </>
            ) : (
              <p>Your request is active</p>
            )}
            {helpText && <p className="help-preview">"{helpText}"</p>}
            <button 
              className="cancel-request"
              onClick={cancelRequest}
            >
              Cancel Request
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AgentView;
