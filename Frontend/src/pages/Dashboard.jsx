import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";

// logos
import { IoIosLogOut } from "react-icons/io";
import { TiPlus } from "react-icons/ti";
import { MdDelete } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import { ImBin } from "react-icons/im";
import { LuRecycle } from "react-icons/lu";

const link = import.meta.env.VITE_API_URL;

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
      const response = await axios.get(link + "/api/projects/", {
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
          `${link}/api/projects/${projectId}/delete/`,
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
        fetchProjects(token);
      } catch (error) {
        toast.error("Failed to delete project");
      }
    }
  };

  const handleRestoreClick = async (event, projectId, projecttitle) => {
    event.stopPropagation();
    const token = localStorage.getItem("token");

    try {
      const response = await axios.delete(
        `${link}/api/projects/${projectId}/restore/`,
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
      fetchProjects(token);
    } catch (error) {
      toast.error("Failed to restore project");
    }
  };

  const handleActualDeleteClick = async (event, projectId, projecttitle) => {
    event.stopPropagation();
    const token = localStorage.getItem("token");
    if (
      window.confirm(
        "Are you sure? you want to delete " + projecttitle + " project?"
      )
    ) {
      try {
        const response = await axios.delete(
          `${link}/api/projects/${projectId}/actual_delete/`,
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
        fetchProjects(token);
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
        link + "/api/create_project/",
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
        <div className="d-flex">
          <div className="popup_btn text-center">
            <Popup
              ref={popupRef}
              //onClose={() => setIsOpen(false)}
              trigger={
                <button className="btn">
                  {" "}
                  <ImBin style={{ fontSize: "30px", marginTop: "5px" }} />
                </button>
              }
              position="bottom right"
              contentStyle={{
                width: "400px",
                // padding: "20px",
                backgroundColor: "#f1f1f1",
                textAlign: "center",
              }}
            >
              <div className="project-list bg-white row m-3">
                {projects.filter((project) => project.isDeleted).length > 0 ? (
                  projects
                    .filter((project) => project.isDeleted)
                    .map((project) => (
                      <div
                        key={project.id}
                        className="project-card card"
                        onClick={() => handleCardClick(project.id)}
                      >
                        <div className="d-flex justify-content-between bg-white">
                          <h5 className="bg-white">{project.title}</h5>
                          <button
                            className="btn bg-white"
                            onClick={(event) =>
                              handleRestoreClick(
                                event,
                                project.id,
                                project.title
                              )
                            }
                          >
                            <LuRecycle
                              style={{
                                fontSize: "20px",
                                backgroundColor: "white",
                              }}
                            />
                          </button>
                          <button
                            className="btn bg-white"
                            onClick={(event) =>
                              handleActualDeleteClick(
                                event,
                                project.id,
                                project.title
                              )
                            }
                          >
                            <MdDelete
                              style={{
                                fontSize: "20px",
                                backgroundColor: "white",
                              }}
                            />
                          </button>
                        </div>
                        <p className="bg-white">
                          Created on:{" "}
                          {new Date(project.created_date).toLocaleString()}
                        </p>
                      </div>
                    ))
                ) : (
                  <p className="bg-white mt-5 text-center">
                    No projects available
                  </p>
                )}
              </div>
            </Popup>
          </div>
          <button onClick={() => navigate("/profile")} className="btn">
            <CgProfile style={{ fontSize: "30px" }} />
          </button>
          <button onClick={handleLogout} className="btn">
            <IoIosLogOut style={{ fontSize: "30px", color: "red" }} />
          </button>
        </div>
      </div>

      <div className="projects bg-white mx-5 p-3">
        <div className="project_header d-flex justify-content-between bg-white">
          <h3 className="heading bg-white">Projects</h3>
          <Popup
            ref={popupRef}
            open={isPopupOpen}
            onClose={() => setIsPopupOpen(false)}
            trigger={
              <button className="btn">
                <TiPlus
                  style={{ fontSize: "50px", backgroundColor: "white" }}
                />
              </button>
            }
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
          {projects.filter((project) => !project.isDeleted).length > 0 ? (
            projects
              .filter((project) => !project.isDeleted)
              .map((project) => (
                <div
                  key={project.id}
                  className="project-card card mb-2 p-3 col-md-3"
                  onClick={() => handleCardClick(project.id)}
                >
                  <div className="d-flex justify-content-between bg-white">
                    <h5 className="bg-white">{project.title}</h5>
                    <button
                      className="btn bg-white"
                      onClick={(event) =>
                        handleDeleteClick(event, project.id, project.title)
                      }
                    >
                      <MdDelete
                        style={{ fontSize: "20px", backgroundColor: "white" }}
                      />
                    </button>
                  </div>
                  <p className="bg-white">
                    Created on:{" "}
                    {new Date(project.created_date).toLocaleString()}
                  </p>
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
