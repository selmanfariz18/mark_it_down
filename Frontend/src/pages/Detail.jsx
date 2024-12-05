import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";

// icons
import { IoIosLogOut } from "react-icons/io";
import { IoMdDownload } from "react-icons/io";
import { MdEdit } from "react-icons/md";
import { TiTick } from "react-icons/ti";
import { TiPlus } from "react-icons/ti";
import { MdFileUpload } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import { ImCross } from "react-icons/im";
import {
  MdDelete,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
} from "react-icons/md";
import { LuRecycle } from "react-icons/lu";

const link = import.meta.env.VITE_API_URL;

const Detail = () => {
  const [projectDetails, setProjectDetails] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [isEditing, setIsEditing] = useState(null);
  const [editedDescription, setEditedDescription] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const popupRef = useRef();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      fetchProjectDetails(token, id);
    }
  }, [navigate, id]);

  const fetchProjectDetails = async (token, projectId) => {
    try {
      const response = await axios.get(`${link}/api/projects/${projectId}/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (response.status === 200) {
        setProjectDetails(response.data);
      }
    } catch (error) {
      toast.error("Failed to fetch project details");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleEditTitle = () => {
    setIsEditingTitle(true);
  };

  const handleSaveTitle = async () => {
    const token = localStorage.getItem("token");
    if (!editedTitle) {
      toast.error("Project title cannot be empty.");
      return;
    }

    try {
      const response = await axios.patch(
        `${link}/api/projects/${id}/update_title/`,
        { title: editedTitle },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setProjectDetails((prevDetails) => ({
          ...prevDetails,
          title: editedTitle,
        }));
        setIsEditingTitle(false);
        toast.success("Project title updated successfully!");
      }
    } catch (error) {
      toast.error("Failed to update project title.");
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!taskName) {
      toast.error("Task name cannot be empty.");
      return;
    }

    try {
      const response = await axios.post(
        `${link}/api/projects/${id}/add_task/`,
        { description: taskName },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      if (response.status === 201) {
        setProjectDetails((prevDetails) => ({
          ...prevDetails,
          tasks: [...prevDetails.tasks, response.data],
        }));

        setTaskName("");

        if (popupRef.current) {
          popupRef.current.close();
        }
      }
    } catch (error) {
      toast.error("Failed to add task.");
    }
  };

  const handleCheckboxChange = async (taskId, currentStatus) => {
    const token = localStorage.getItem("token");
    try {
      const newStatus = currentStatus === "done" ? "not_done" : "done";
      const response = await axios.patch(
        `${link}/api/tasks/${taskId}/update_status/`,
        {},
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setProjectDetails((prevDetails) => {
          const updatedTasks = prevDetails.tasks.map((task) =>
            task.id === taskId ? { ...task, status: newStatus } : task
          );
          return { ...prevDetails, tasks: updatedTasks };
        });
      }
    } catch (error) {
      toast.error("Failed to update task status.");
    }
  };

  const handleEditTask = (taskId, currentDescription) => {
    setIsEditing(taskId);
    setEditedDescription(currentDescription);
  };

  const handleDeleteTask = async (taskId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.delete(
        `${link}/api/tasks/${taskId}/delete/`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      if (response.status === 204) {
        setProjectDetails((prevDetails) => {
          const updatedTasks = prevDetails.tasks.map((task) =>
            task.id === taskId ? { ...task, status: newStatus } : task
          );
          return { ...prevDetails, tasks: updatedTasks };
        });
        toast.success("Task deleted successfully!");
      }
    } catch (error) {
      toast.error("Failed to delete task.");
    }
  };

  const handleRestoreTask = async (taskId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.delete(
        `${link}/api/tasks/${taskId}/restore/`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      if (response.status === 204) {
        setProjectDetails((prevDetails) => {
          const updatedTasks = prevDetails.tasks.map((task) =>
            task.id === taskId ? { ...task, status: newStatus } : task
          );
          return { ...prevDetails, tasks: updatedTasks };
        });
        toast.success("Task restored successfully!");
      }
    } catch (error) {
      toast.error("Failed to delete task.");
    }
  };

  const handleActualDeleteTask = async (taskId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.delete(
        `${link}/api/tasks/${taskId}/actual_delete/`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      if (response.status === 204) {
        setProjectDetails((prevDetails) => {
          const updatedTasks = prevDetails.tasks.map((task) =>
            task.id === taskId ? { ...task, status: newStatus } : task
          );
          return { ...prevDetails, tasks: updatedTasks };
        });
        toast.success("Task deleted successfully!");
      }
    } catch (error) {
      toast.error("Failed to delete task.");
    }
  };

  const handleSaveTask = async (taskId) => {
    const token = localStorage.getItem("token");
    if (!editedDescription) {
      toast.error("Task description cannot be empty.");
      return;
    }

    try {
      const response = await axios.patch(
        `${link}/api/tasks/${taskId}/update_description/`,
        { description: editedDescription },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Task updated successfully!");
        setProjectDetails((prevDetails) => {
          const updatedTasks = prevDetails.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  description: editedDescription,
                  last_updated_on: response.data.last_updated_on,
                }
              : task
          );
          return { ...prevDetails, tasks: updatedTasks };
        });
        setIsEditing(null);
        setEditedDescription("");
      }
    } catch (error) {
      toast.error("Failed to update task.");
    }
  };

  const generateMarkdown = () => {
    if (!projectDetails) return "";

    const { title, tasks } = projectDetails;

    const taskListMarkdownDone = tasks
      .filter((task) => task.status === "done")
      .map((task) => {
        return `- [x] ${task.description} `;
      })
      .join("\n\n");

    const taskListMarkdownNotDone = tasks
      .filter((task) => task.status === "not_done")
      .map((task) => {
        return `- [ ] ${task.description} `;
      })
      .join("\n\n");

    return `
# ${title}

### Summary : ${checkedTasks.length}/${AllTasks.length} Compleated
  
## Pending

${taskListMarkdownNotDone}
  
## Completed
  
${taskListMarkdownDone}
    `;
  };

  // Function to download Markdown file
  const downloadMarkdown = () => {
    const markdownContent = generateMarkdown();
    const blob = new Blob([markdownContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${projectDetails?.title}-tasks.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  //Upload to gists
  const uploadToGist = async () => {
    // Fetch the GitHub token from the backend
    const token = localStorage.getItem("token");

    try {
      const response = await axios.get(link + "/api/get_pac/", {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      const gitPac = response.data.git_pac;

      if (!gitPac || gitPac == "") {
        toast.error(
          "GitHub personal access token is not set. Please update your profile."
        );
        return;
      }

      const markdownContent = generateMarkdown();
      const gistData = {
        description: `${projectDetails?.title} - Task List`,
        public: false, // Set to false for a private gist
        files: {
          [`${projectDetails?.title}-tasks.md`]: {
            content: markdownContent,
          },
        },
      };

      // Proceed to upload the gist
      try {
        const gistResponse = await axios.post(
          "https://api.github.com/gists",
          gistData,
          {
            headers: {
              Authorization: `Bearer ${gitPac}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (gistResponse.status === 201) {
          toast.success(
            "Successfully uploaded to GitHub Gists as a private gist!"
          );
          window.open(gistResponse.data.html_url, "_blank"); // Open the new gist in a new tab
        }
      } catch (error) {
        toast.error("Failed to upload to GitHub Gists.");
        console.error(error);
      }
    } catch (error) {
      toast.error("Failed to fetch GitHub personal access token.");
      console.error(error);
    }
  };

  if (!projectDetails) {
    return <div>Loading...</div>;
  }

  const checkedTasks = projectDetails.tasks.filter(
    (task) => task.status === "done"
  );
  const uncheckedTasks = projectDetails.tasks.filter(
    (task) => task.status === "not_done"
  );

  const deletedTasks = projectDetails.deleted_task;

  const AllTasks = projectDetails.tasks;

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <>
      <ToastContainer />
      <div className="dashboard text-center m-3 mt-3 d-flex justify-content-between">
        <h1>Mark it Down</h1>
        <div className="d-flex">
          <button onClick={() => navigate("/profile")} className="btn">
            <CgProfile style={{ fontSize: "30px" }} />
          </button>
          <button onClick={handleLogout} className="btn">
            <IoIosLogOut style={{ fontSize: "30px", color: "red" }} />
          </button>
        </div>
      </div>
      <div className="Detail bg-white mx-5 p-3">
        <div className="project_header bg-white">
          <div className="d-flex justify-content-between bg-white">
            {isEditingTitle ? (
              <div
                className="d-flex bg-white title_edit"
                style={{
                  height: "35px",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: "auto",
                  marginBottom: "auto",
                }}
              >
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="form-control"
                  placeholder="Edit project title"
                />
                <button onClick={handleSaveTitle} className="btn mx-2 bg-white">
                  <TiTick
                    style={{
                      fontSize: "30px",
                      backgroundColor: "white",
                      color: "green",
                    }}
                  />
                </button>
                <button
                  className="btn"
                  onClick={() => {
                    setIsEditingTitle(false);
                    setEditedTitle(projectDetails.title);
                  }}
                >
                  <ImCross
                    style={{
                      fontSize: "15px",
                      color: "red",
                      backgroundColor: "white",
                    }}
                  />
                </button>
              </div>
            ) : (
              <div className="d-flex align-items-center bg-white mx-5">
                <h3 className="bg-white">{projectDetails.title}</h3>
                <button
                  onClick={() => {
                    setIsEditingTitle(true);
                    setEditedTitle(projectDetails.title);
                  }}
                  className="btn"
                >
                  <MdEdit
                    style={{
                      fontSize: "15px",
                      color: "black",
                      backgroundColor: "white",
                    }}
                  />
                </button>
              </div>
            )}
            <div className="d-flex bg-white">
              <button
                className="btn"
                style={{ width: "60px" }}
                onClick={uploadToGist}
              >
                <MdFileUpload
                  style={{
                    fontSize: "30px",
                    marginTop: "15px",
                    backgroundColor: "white",
                    marginLeft: "-22px",
                  }}
                />{" "}
                <p
                  className="bg-white d-flex"
                  style={{
                    fontSize: "10px",
                    width: "10px",
                    justifyContent: "center",
                    textAlign: "center",
                  }}
                >
                  Upload to gists
                </p>
              </button>
              <button className="btn" onClick={downloadMarkdown}>
                <IoMdDownload
                  style={{
                    fontSize: "30px",
                    backgroundColor: "white",
                    marginLeft: "-10px",
                  }}
                />
                <p
                  className="bg-white d-flex"
                  style={{
                    fontSize: "10px",
                    width: "10px",
                    justifyContent: "center",
                    textAlign: "center",
                  }}
                >
                  Download as .md
                </p>
              </button>
            </div>
          </div>
          <p className="bg-white mx-5">
            Summary : {checkedTasks.length}/{AllTasks.length} Done
          </p>
        </div>

        {/* Unchecked Tasks */}
        <div className="lists bg-white m-5 px-5">
          {uncheckedTasks.map((task) => (
            <div key={task.id} className="list d-flex bg-white">
              <input
                type="checkbox"
                onChange={() => handleCheckboxChange(task.id, task.status)}
              />
              {isEditing === task.id ? (
                <>
                  <input
                    type="text"
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="mt-3 mx-2 bg-white form-control"
                  />
                  <button
                    className="btn btn-white mt-2"
                    onClick={() => handleSaveTask(task.id)}
                  >
                    <TiTick
                      style={{
                        fontSize: "30px",
                        backgroundColor: "white",
                        color: "green",
                      }}
                    />
                  </button>
                </>
              ) : (
                <>
                  <h5 className="mt-3 mx-2 bg-white">{task.description}</h5>
                  <p className="mt-3 mx-2 bg-white text-muted">
                    Last Updated:{" "}
                    {new Date(task.last_updated_on).toLocaleString()}
                  </p>
                  <button
                    className="btn btn-white"
                    onClick={() => handleEditTask(task.id, task.description)}
                  >
                    <MdEdit
                      style={{ fontSize: "15px", backgroundColor: "white" }}
                    />
                  </button>
                  <button
                    className="btn btn-sm"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    <MdDelete
                      style={{ fontSize: "15px", backgroundColor: "white" }}
                    />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="popup_btn bg-white text-center">
          <Popup
            ref={popupRef}
            open={isOpen}
            //onClose={() => setIsOpen(false)}
            trigger={
              <button className="btn">
                {" "}
                <TiPlus
                  style={{ fontSize: "30px", backgroundColor: "white" }}
                />
              </button>
            }
            position="top"
            contentStyle={{
              width: "300px",
              padding: "20px",
              backgroundColor: "#f1f1f1",
              textAlign: "center",
            }}
          >
            <div className="mb-3 popup_h">Task</div>
            <form onSubmit={handleAddTask} className="popup_form">
              <input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="form-control mb-3"
                placeholder="Task Name"
                required
              />
              <button type="submit" className="btn btn-primary">
                Create
              </button>
            </form>
          </Popup>
        </div>

        {/* Checked Tasks */}
        <div className="lists bg-white m-5 px-5">
          {checkedTasks.map((task) => (
            <div key={task.id} className="list d-flex bg-white">
              <input
                type="checkbox"
                checked
                onChange={() => handleCheckboxChange(task.id, task.status)}
              />
              <h5 className="mt-3 mx-2 bg-white">
                <s>{task.description}</s>
              </h5>
              <p className="mt-3 mx-2 bg-white text-muted">
                Last Updated: {new Date(task.last_updated_on).toLocaleString()}
              </p>
              {/* Delete button */}
              <button
                className="btn btn-sm"
                onClick={() => handleDeleteTask(task.id)}
              >
                <MdDelete
                  style={{ fontSize: "15px", backgroundColor: "white" }}
                />
              </button>
            </div>
          ))}
        </div>

        {deletedTasks.length > 0 && (
          <div className="deleted-task-dropdown bg-white m-5 px-5">
            <div
              className="dropdown-header d-flex justify-content-between align-items-center bg-light p-3"
              onClick={toggleDropdown}
              style={{ cursor: "pointer" }}
            >
              <h5 className="m-0">Deleted Tasks</h5>
              {isDropdownOpen ? (
                <MdKeyboardArrowUp style={{ fontSize: "20px" }} />
              ) : (
                <MdKeyboardArrowDown style={{ fontSize: "20px" }} />
              )}
            </div>

            {/* Dropdown content */}
            {isDropdownOpen && (
              <div className="lists bg-white px-5">
                {deletedTasks.map((deleted_task) => (
                  <div key={deleted_task.id} className="list d-flex bg-white">
                    <h5 className="mt-3 mx-2">
                      <s className="deleted">{deleted_task.description}</s>
                    </h5>
                    <p className="mt-3 mx-2 bg-white text-muted">
                      Last Updated:{" "}
                      {new Date(deleted_task.last_updated_on).toLocaleString()}
                    </p>
                    <button
                      className="btn btn-sm"
                      onClick={() => handleRestoreTask(deleted_task.id)}
                    >
                      <LuRecycle
                        style={{ fontSize: "15px", backgroundColor: "white" }}
                      />
                    </button>
                    {/* Delete button */}

                    <button
                      className="btn btn-sm"
                      onClick={() => handleActualDeleteTask(deleted_task.id)}
                    >
                      <MdDelete
                        style={{ fontSize: "15px", backgroundColor: "white" }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Detail;
