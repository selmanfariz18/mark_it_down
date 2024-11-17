import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

// icons
import { IoIosLogOut } from "react-icons/io";
import { RxAvatar } from "react-icons/rx";
import { MdEdit } from "react-icons/md";
import { TiTick } from "react-icons/ti";

const link = import.meta.env.VITE_API_URL;

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
      const response = await axios.get(link + "/api/profile/", {
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
        link + "/api/profile/",
        { git_pac: gitPac },
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        toast.success("GitHub PAC updated successfully!");
        setIsEditing(false);
      }
    } catch (error) {
      toast.error("Failed to update GitHub PAC");
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

        <div className="bg-white mx-3 my-5 row">
          {/* Left Column - GitHub PAC Input */}
          <div className="col-md-6 d-flex align-items-center bg-white">
            <label htmlFor="gitPac" className="d-block bg-white">
              GitHub PAC:
            </label>
            <input
              id="gitPac"
              type="password"
              value={gitPac}
              onChange={(e) => setGitPac(e.target.value)}
              readOnly={!isEditing}
              className="form-control mx-3"
              style={{ width: "300px", height: "30px" }}
            />
            {isEditing ? (
              <button className="btn" onClick={handleSaveGitPac}>
                <TiTick
                  style={{
                    fontSize: "30px",
                    backgroundColor: "white",
                    color: "green",
                  }}
                />
              </button>
            ) : (
              <button className="btn" onClick={() => setIsEditing(true)}>
                <MdEdit
                  style={{
                    fontSize: "20px",
                    color: "black",
                    backgroundColor: "white",
                  }}
                />
              </button>
            )}
          </div>

          {/* Right Column - Instructions */}
          <div className="col-md-6 bg-white">
            <h5 className="bg-white">
              How to Generate a GitHub PAC for Gists:
            </h5>
            <ol className="bg-white">
              <li className="bg-white">
                Go to your GitHub account and navigate to{" "}
                <a
                  className="bg-white"
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Personal Access Tokens
                </a>
                .
              </li>
              <li className="bg-white">
                Click on{" "}
                <strong className="bg-white">Generate new token</strong>.
              </li>
              <li className="bg-white">
                Set a name/description for the token.
              </li>
              <li className="bg-white">
                Under <strong className="bg-white">Repository Access</strong>,
                select the scopes:
                <ul className="bg-white">
                  <li className="bg-white">
                    <code>gist</code> - for creating and managing gists.
                  </li>
                </ul>
              </li>
              <li className="bg-white">
                Click <strong className="bg-white">Generate token</strong>.
              </li>
              <li className="bg-white">
                Copy the generated token and paste it into the "GitHub PAC"
                field on this page.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
