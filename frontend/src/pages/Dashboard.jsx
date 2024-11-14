import React, { useState, useEffect, useRef } from "react";
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
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();
  const popupRef = useRef();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      fetchProjects(token);
    }
  }, [navigate]);

  const fetchProjects = async (token) => {
    try {
      const response = await axios.get("http://localhost:8000/api/projects/", {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      if (response.status === 200) {
        setProjects(response.data);
      }
    } catch (error) {
      toast.error("Failed to fetch projects");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleCardClick = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  const handleDeleteClick = async (event, projectId, projecttitle) => {
    event.stopPropagation();
    const token = localStorage.getItem("token");
    if (
      window.confirm(
        "Are you sure? you want to delete " + projecttitle + " project?"
      )
    ) {
      try {
        const response = await axios.delete(
          `http://localhost:8000/api/projects/${projectId}/delete/`,
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        );
        if (response.status === 204) {
          toast.success("Project deleted successfully!");
          setProjects((prevProjects) =>
            prevProjects.filter((project) => project.id !== projectId)
          );
        }
      } catch (error) {
        toast.error("Failed to delete project");
      }
    }
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
        fetchProjects(token);
        if (popupRef.current) {
          popupRef.current.close();
        }
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Project Creation Failed";
      setError(errorMsg);
      toast.error(errorMsg);
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
        <div className="project_header d-flex justify-content-between bg-white">
          <h3 className="heading bg-white">Projects</h3>
          <Popup
            ref={popupRef}
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
            <div className="mb-3 popup_h">New Project</div>
            <form onSubmit={handleProjectSubmit} className="popup_form">
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

        <div className="project-list bg-white row">
          {projects.length > 0 ? (
            projects.map((project) => (
              <div
                key={project.id}
                className="project-card card mb-2 p-3 col-md-3"
                onClick={() => handleCardClick(project.id)}
              >
                <div className="d-flex justify-content-between bg-white">
                  <h5 className="bg-white">{project.title}</h5>
                  <button
                    className="bg-white"
                    onClick={(event) =>
                      handleDeleteClick(event, project.id, project.title)
                    }
                  >
                    delete
                  </button>
                </div>
                <p className="bg-white">Created on: {project.created_date}</p>
              </div>
            ))
          ) : (
            <p className="bg-white mt-5 text-center">No projects available</p>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
