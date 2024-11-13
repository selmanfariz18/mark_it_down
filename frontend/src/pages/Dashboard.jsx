import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";

const Dashboard = () => {
  const [projectName, setProjectName] = useState("");
  const [error, setError] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
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

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        "http://localhost:8000/api/create_project/",
        { title: projectName },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      if (response.status === 201) {
        setProjectName("");

        toast.success("Project Created Successfully!");

        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Project Creation Failed";
      setError(errorMsg);

      toast.error(errorMsg, {});
    }
  };

  return (
    <>
      <ToastContainer />

      <div className="dashboard text-center m-3 mt-3 d-flex justify-content-between">
        <h1>Mark it Down</h1>
        <button onClick={handleLogout} className="btn btn-danger">
          Logout
        </button>
      </div>

      <div className="projects bg-white mx-5 p-3">
        <div className="project_header d-flex justify-content-between">
          <h3 className="heading">Projects</h3>
          <Popup
            open={isPopupOpen}
            onClose={() => setIsPopupOpen(false)}
            trigger={<button className="btn">Add</button>}
            position="left"
            contentStyle={{
              width: "300px",
              padding: "20px",
              backgroundColor: "#f1f1f1",
              textAlign: "center",
            }}
          >
            <div className="mb-3">New Project</div>
            <form onSubmit={handleProjectSubmit}>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="form-control mb-3"
                placeholder="Enter Project Name"
                required
              />
              <button type="submit" className="btn btn-primary">
                Create
              </button>
            </form>
          </Popup>
        </div>
        <div className="project-list bg-white">
          {/* Project Cards */}
          <div className="project-card card mb-2 p-3">
            <h5>Project 1</h5>
            <p>Created on: 2024-11-10</p>
          </div>
          <div className="project-card card mb-2 p-3">
            <h5>Project 2</h5>
            <p>Created on: 2024-11-11</p>
          </div>
          <div className="project-card card mb-2 p-3">
            <h5>Project 3</h5>
            <p>Created on: 2024-11-12</p>
          </div>
          <div className="project-card card mb-2 p-3">
            <h5>Project 4</h5>
            <p>Created on: 2024-11-13</p>
          </div>
          <div className="project-card card mb-2 p-3">
            <h5>Project 5</h5>
            <p>Created on: 2024-11-14</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
