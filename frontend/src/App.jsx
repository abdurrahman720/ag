import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import AgentView from "./components/AgentView";
import CloserView from "./components/CloserView";
import "./App.css";

const socket = io("http://localhost:5009");

function App() {
  const [userType, setUserType] = useState(null);
  const [userId, setUserId] = useState("");
  const savedAgent = JSON.parse(localStorage.getItem("activeAgent"));
  const savedCloser = JSON.parse(localStorage.getItem("activeCloser"));

  console.log(savedCloser);
  console.log(savedAgent);

  useEffect(() => {
    if (savedAgent) {
      console.log("setting saved agent");
      setUserId(savedAgent.agentId);
      setUserType("agent");
    }
    if (savedCloser) {
      console.log("setting saved closer");
      console.log(savedCloser);
      setUserId(savedCloser.closerId);
      setUserType("closer");
    }
  }, []);

  const handleLogin = (type) => {
    console.log(type);
    setUserType(type);
    setUserId(`${type}-${Math.random().toString(36).substr(2, 9)}`);
    // if (type === "agent") {
    //   localStorage.setItem(
    //     "activeAgent",
    //     JSON.stringify({
    //       agentId: userId,
    //       name: "",
    //       helpText: "",
    //       assignedCloser: null,
    //       handRaised: false,
    //       isLoggedIn: false,
    //     })
    //   );
    // }
    // if (type === "closer") {
    //   localStorage.setItem(
    //     "activeCloser",
    //     JSON.stringify({
    //       closerId: userId,
    //       name: "",
    //       isLoggedIn: false,
    //       raisedHands: [],
    //       currentAssignment: null,
    //     })
    //   );
    // }
  };

  if (!userType) {
    return (
      <div className="app">
        <div className="login">
          <button onClick={() => handleLogin("agent")}>Login as Agent</button>
          <button onClick={() => handleLogin("closer")}>Login as Closer</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {userType === "agent" ? (
        <AgentView socket={socket} agentId={userId} setUserType={setUserType} />
      ) : (
        <CloserView
          socket={socket}
          closerId={userId}
          setUserType={setUserType}
        />
      )}
    </div>
  );
}

export default App;
