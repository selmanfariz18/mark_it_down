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

const Detail = () => {
  const [projectDetails, setProjectDetails] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [isEditing, setIsEditing] = useState(null); // To track which task is being edited
  const [editedDescription, setEditedDescription] = useState("");
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
      const response = await axios.get(
        `http://localhost:8000/api/projects/${projectId}/`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

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

  const handleAddTask = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!taskName) {
      toast.error("Task name cannot be empty.");
      return;
    }

    try {
      // Add the task to the backend
      const response = await axios.post(
        `http://localhost:8000/api/projects/${id}/add_task/`,
        { description: taskName },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      if (response.status === 201) {
        // Update the project details with the newly added task
        setProjectDetails((prevDetails) => ({
          ...prevDetails,
          tasks: [...prevDetails.tasks, response.data],
        }));

        // Clear the task input field
        setTaskName("");

        // Close the popup using the reference
        if (popupRef.current) {
          popupRef.current.close();
        }

        // toast.success("Task added successfully!");
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
        `http://localhost:8000/api/tasks/${taskId}/update_status/`,
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

  const handleSaveTask = async (taskId) => {
    const token = localStorage.getItem("token");
    if (!editedDescription) {
      toast.error("Task description cannot be empty.");
      return;
    }

    try {
      const response = await axios.patch(
        `http://localhost:8000/api/tasks/${taskId}/update_description/`,
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

  // Function to generate Markdown content
  const generateMarkdown = () => {
    if (!projectDetails) return "";

    const { title, tasks } = projectDetails;

    // Separate the tasks into done and not done
    const taskListMarkdownDone = tasks
      .filter((task) => task.status === "done") // Filter only completed tasks
      .map((task) => {
        return `- [x] ${task.description} `;
      })
      .join("\n\n");

    const taskListMarkdownNotDone = tasks
      .filter((task) => task.status === "not_done") // Filter only pending tasks
      .map((task) => {
        return `- [ ] ${task.description} `;
      })
      .join("\n\n");

    return `
# ${title}

### Summary : ${checkedTasks.length}/${AllTasks.length} Done
  
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
      const response = await axios.get("http://localhost:8000/api/get_pac/", {
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
  const AllTasks = projectDetails.tasks;

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
            <h3 className="heading bg-white mt-5 mx-5">
              {projectDetails.title}
            </h3>
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
                      style={{ fontSize: "30px", backgroundColor: "white" }}
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
                      style={{ fontSize: "20px", backgroundColor: "white" }}
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
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Detail;
