import { useState, useEffect } from 'react';

function CloserView({ socket, closerId }) {
  const [name, setName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [raisedHands, setRaisedHands] = useState([]);
  const [currentAssignment, setCurrentAssignment] = useState(null);

  useEffect(() => {
    socket.on('initialState', ({ raisedHands: initialHands }) => {
      setRaisedHands(initialHands.map(hand => ({
        ...hand,
        raisedAt: new Date(hand.timestamp).toLocaleTimeString()
      })));
    });

    socket.on('handRaised', ({ agentId, name, helpText, timestamp }) => {
      setRaisedHands(prev => [...prev, { 
        agentId,
        name,
        helpText,
        raisedAt: new Date(timestamp).toLocaleTimeString()
      }]);
    });

    socket.on('requestAccepted', ({ closerId: acceptingCloserId, agentId, agentName }) => {
      if (acceptingCloserId === closerId) {
        setCurrentAssignment({ agentId, agentName });
      }
      setRaisedHands(prev => prev.filter(hand => hand.agentId !== agentId));
    });

    socket.on('requestCancelled', ({ agentId }) => {
      if (currentAssignment?.agentId === agentId) {
        setCurrentAssignment(null);
      }
      setRaisedHands(prev => prev.filter(hand => hand.agentId !== agentId));
    });

    socket.on('requestCompleted', ({ closerId: completingCloserId }) => {
      if (completingCloserId === closerId) {
        setCurrentAssignment(null);
      }
    });

    return () => {
      socket.off('initialState');
      socket.off('handRaised');
      socket.off('requestAccepted');
      socket.off('requestCancelled');
      socket.off('requestCompleted');
    };
  }, [socket, closerId, currentAssignment]);

  const handleLogin = () => {
    if (name.trim()) {
      setIsLoggedIn(true);
    }
  };

  const acceptRequest = (agentId) => {
    if (!currentAssignment) {
      socket.emit('closerJoin', { closerId, closerName: name, agentId });
    }
  };

  const completeRequest = () => {
    if (currentAssignment) {
      socket.emit('completeRequest', { 
        closerId, 
        agentId: currentAssignment.agentId 
      });
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="login-view">
        <h2>Closer Login</h2>
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
      <div className="closer-card">
        {currentAssignment ? (
          <div className="current-assignment">
            <h3>Current Assignment</h3>
            <div className="assignment-details">
              <div className="agent-info">
                <p className="agent-name">Agent: {currentAssignment.agentName}</p>
                <span className="status-indicator status-active">Active</span>
              </div>
              <button onClick={completeRequest} className="complete-button">
                Complete
              </button>
            </div>
          </div>
        ) : raisedHands.length === 0 ? (
          <div className="no-hands">
            <h3>No Active Requests</h3>
            <p>Waiting for agent requests...</p>
          </div>
        ) : (
          <div className="hands-list">
            {raisedHands.map(({ agentId, name, helpText, raisedAt }) => (
              <div key={agentId} className="hand-item">
                <div className="hand-info">
                  <div className="hand-header">
                    <h3>{name}</h3>
                    <div className="timer">{raisedAt}</div>
                  </div>
                  {helpText && (
                    <div className="help-text">
                      {helpText}
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => acceptRequest(agentId)}
                  className="accept-button"
                >
                  Accept
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CloserView;
