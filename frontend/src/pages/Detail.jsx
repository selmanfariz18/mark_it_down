import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";

const Detail = () => {
  const [projectDetails, setProjectDetails] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [isEditing, setIsEditing] = useState(null); // To track which task is being edited
  const [editedDescription, setEditedDescription] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();

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

        // Close the popup by toggling `isOpen`
        setIsOpen((prev) => !prev); // Toggle state to force a re-render
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
      // window.location.reload();
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
        //window.location.reload();
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
        <button onClick={handleLogout} className="btn btn-danger">
          Logout
        </button>
      </div>
      <div className="Detail bg-white mx-5 p-3">
        <div className="project_header bg-white">
          <h3 className="heading bg-white mt-5 mx-5">{projectDetails.title}</h3>
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
                    className="btn btn-success mt-3"
                    onClick={() => handleSaveTask(task.id)}
                  >
                    Done
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
                    className="btn btn-warning mt-3"
                    onClick={() => handleEditTask(task.id, task.description)}
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="popup_btn bg-white text-center">
          <Popup
            open={isOpen}
            onClose={() => setIsOpen(false)}
            trigger={<button className="btn">Add</button>}
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
