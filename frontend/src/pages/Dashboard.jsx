import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="dashboard">
      <h1>Welcome to your Dashboard!</h1>
      <button onClick={handleLogout} className="btn btn-danger">
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
