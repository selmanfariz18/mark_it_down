import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:8000/api/signin/", {
        email,
        password,
      });
      localStorage.setItem("token", response.data.token);
      navigate("/dashboard");
    } catch (error) {
      setError(error.response?.data?.message || "Login failed.");
    }
  };

  return (
    <div className="login">
      <h1>Login</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-control"
            placeholder="Email"
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-control"
            placeholder="Password"
            required
          />
        </div>
        <div className="mb-3">
          <button
            type="submit"
            className="btn btn-link"
            onClick={() => {
              navigate("/register");
            }}
          >
            New here? Register Now
          </button>
        </div>
        <button type="submit" className="btn btn-primary">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
