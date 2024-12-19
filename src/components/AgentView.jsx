import { useState, useEffect } from "react";

function AgentView({ socket, agentId, setUserType }) {
  const [name, setName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [helpText, setHelpText] = useState("");
  const [assignedCloser, setAssignedCloser] = useState(null);

  const savedAgent = JSON.parse(localStorage.getItem("activeAgent"));

  console.log(savedAgent);

  useEffect(() => {
    if (savedAgent) {
      setIsLoggedIn(savedAgent.isLoggedIn);
      setName(savedAgent.name);
      setHelpText(savedAgent.helpText);
      setHandRaised(savedAgent.handRaised);
      setAssignedCloser(savedAgent.assignedCloser);
    }
  }, []);

  useEffect(() => {
    socket.on("requestAccepted", ({ agentId: acceptedAgentId, closerName }) => {
      if (acceptedAgentId === agentId) {
        setHandRaised(true);
        setAssignedCloser(closerName);

        localStorage.setItem(
          "activeAgent",
          JSON.stringify({
            ...savedAgent,
            assignedCloser: closerName,
            handRaised: true,
          })
        );
      }
    });

    socket.on("requestCompleted", ({ agentId: completedAgentId }) => {
      if (completedAgentId === agentId) {
        setHandRaised(false);
        setHelpText("");
        setAssignedCloser(null);
        localStorage.setItem(
          "activeAgent",
          JSON.stringify({
            ...savedAgent,
            helpText: "",
            assignedCloser: null,
            handRaised: false,
          })
        );
      }
    });

    return () => {
      socket.off("requestAccepted");
      socket.off("requestCompleted");
    };
  }, [socket, agentId]);

  const handleLogin = () => {
    if (name.trim()) {
      setIsLoggedIn(true);
      localStorage.setItem(
        "activeAgent",
        JSON.stringify({
          ...savedAgent,
          isLoggedIn: true,
        })
      );
    }
  };

  const handleLogout = () => {
    try {
      setIsLoggedIn(false);
      setName("");
      setHandRaised(false);
      setHelpText("");
      setAssignedCloser(null);
      setUserType(null);
      localStorage.removeItem("activeAgent");
    } catch (error) {
      console.log(error);
    }
  };

  const raiseHand = () => {
    if (!handRaised) {
      socket.emit("raiseHand", {
        agentId,
        name,
        helpText: helpText.trim(),
      });
      setHandRaised(true);

      localStorage.setItem(
        "activeAgent",
        JSON.stringify({
          ...savedAgent,
          helpText: helpText.trim(),
          handRaised: true,
        })
      );
    }
  };

  const cancelRequest = () => {
    socket.emit("cancelRequest", { agentId });
    setHandRaised(false);
    setHelpText("");
    setAssignedCloser(null);
    localStorage.removeItem("activeAgent");
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
            onChange={(e) => {
              setName(e.target.value);
              localStorage.setItem(
                "activeAgent",
                JSON.stringify({
                  agentId,
                  name: e.target.value,
                  helpText: "",
                  assignedCloser: null,
                  handRaised: false,
                  isLoggedIn: false,
                })
              );
            }}
            className="name-input"
            autoFocus
          />
          <button
            onClick={handleLogin}
            disabled={!name?.trim()}
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
      <button
        style={{ backgroundColor: "red" }}
        onClick={() => handleLogout()}
        className="accept-button"
      >
        Logout
      </button>
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
            <button className="raise-hand" onClick={raiseHand}>
              Raise Hand
            </button>
          </div>
        ) : (
          <div className="active-request">
            {assignedCloser ? (
              <>
                <p className="assigned-closer">
                  Closer {assignedCloser} is helping you
                </p>
                <span className="status-indicator status-active">Active</span>
              </>
            ) : (
              <p>Your request is active</p>
            )}
            {helpText && <p className="help-preview">"{helpText}"</p>}
            <button className="cancel-request" onClick={cancelRequest}>
              Cancel Request
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AgentView;
