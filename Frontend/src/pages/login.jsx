import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const link = import.meta.env.VITE_API_URL;

  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword(password)) {
      toast.error(
        "Password must be at least 8 characters long, include uppercase, lowercase, a number, and a special character."
      );
      return;
    }

    try {
      const response = await axios.post(link + "/api/signin/", {
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
    <>
      <ToastContainer />
      <div className="login card bg-white">
        <h1 className="bg-white mb-5">Mark It Down</h1>
        <h4 className="bg-white">Login</h4>
        <form onSubmit={handleSubmit} className="bg-white text-center">
          <div className="mb-3 bg-white">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control bg-white"
              placeholder="Email"
              required
            />
          </div>
          <div className="mb-3 bg-white">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              placeholder="Password"
              required
            />
          </div>
          <div className="mb-3 bg-white">
            <button
              type="button"
              className="btn btn-link bg-white"
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
    </>
  );
};

export default Login;
