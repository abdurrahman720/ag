import { useState } from 'react';
import { io } from 'socket.io-client';
import AgentView from './components/AgentView';
import CloserView from './components/CloserView';
import './App.css';

const socket = io('http://localhost:3000');

function App() {
  const [userType, setUserType] = useState(null);
  const [userId, setUserId] = useState('');

  const handleLogin = (type) => {
    setUserType(type);
    setUserId(`${type}-${Math.random().toString(36).substr(2, 9)}`);
  };

  if (!userType) {
    return (
      <div className="app">
        <div className="login">
          <button onClick={() => handleLogin('agent')}>Login as Agent</button>
          <button onClick={() => handleLogin('closer')}>Login as Closer</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {userType === 'agent' ? (
        <AgentView socket={socket} agentId={userId} />
      ) : (
        <CloserView socket={socket} closerId={userId} />
      )}
    </div>
  );
}

export default App;
