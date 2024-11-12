import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [Name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [Confirmpassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== Confirmpassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/api/signup/",
        {
          first_name: Name,
          email: email,
          password: password,
          confirm_password: Confirmpassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        setSuccess("Registration successful! Please login.");
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (error) {
      console.error("Error response:", error);
      setError(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Registration failed."
      );
    }
  };

  return (
    <div className="register">
      <h1>Register</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="text"
            value={Name}
            onChange={(e) => setName(e.target.value)}
            className="form-control"
            placeholder="Name"
            required
          />
        </div>
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
          <input
            type="password"
            value={Confirmpassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="form-control"
            placeholder="Confirm Password"
            required
          />
        </div>
        <div className="mb-3">
          <button
            type="submit"
            className="btn btn-link"
            onClick={() => {
              navigate("/login");
            }}
          >
            Already registered? Login here
          </button>
        </div>
        <button type="submit" className="btn btn-primary">
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
