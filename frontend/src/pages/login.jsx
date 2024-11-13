import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:8000/api/signin/", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);

      toast.success("Login Successful!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Login failed.";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="login">
      <ToastContainer />

      <h1>Login</h1>
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
            type="button"
            className="btn btn-link"
            onClick={() => navigate("/register")}
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
