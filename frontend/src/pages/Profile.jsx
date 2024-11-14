import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { IoIosLogOut } from "react-icons/io";
import { RxAvatar } from "react-icons/rx";

const Profile = () => {
  const [username, setUsername] = useState("");
  const [gitPac, setGitPac] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchProfile(token);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const fetchProfile = async (token) => {
    try {
      const response = await axios.get("http://localhost:8000/api/profile/", {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      if (response.status === 200) {
        setUsername(response.data.username);
        setGitPac(response.data.git_pac || "");
      }
    } catch (error) {
      toast.error("Failed to fetch profile details");
    }
  };

  const handleSaveGitPac = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.put(
        "http://localhost:8000/api/profile/",
        { git_pac: gitPac },
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        toast.success("Git PAC updated successfully!");
        setIsEditing(false);
      }
    } catch (error) {
      toast.error("Failed to update Git PAC");
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="dashboard text-center m-3 mt-3 d-flex justify-content-between">
        <h1>Mark it Down</h1>
        <button onClick={handleLogout} className="btn">
          <IoIosLogOut style={{ fontSize: "30px", color: "red" }} />
        </button>
      </div>
      <div className="Detail bg-white mx-5 p-3">
        <div className="profile_pic bg-white text-center">
          <RxAvatar style={{ fontSize: "150px", background: "white" }} />
        </div>
        <h3 className="profile_name text-center bg-white">{username}</h3>
        <div className="text-center bg-white">
          <label htmlFor="gitPac" className="d-block bg-white">
            Git PAC:
          </label>
          <input
            id="gitPac"
            type="password"
            value={gitPac}
            onChange={(e) => setGitPac(e.target.value)}
            readOnly={!isEditing}
            className="form-control mx-auto"
            style={{ width: "300px" }}
          />
          {isEditing ? (
            <button className="btn btn-success mt-3" onClick={handleSaveGitPac}>
              Save
            </button>
          ) : (
            <button
              className="btn btn-primary mt-3"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;
