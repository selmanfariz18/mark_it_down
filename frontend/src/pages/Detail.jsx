import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";

const Detail = () => {
  const [projectName, setProjectName] = useState("");
  const [error, setError] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   if (!token) {
  //     navigate("/login");
  //   } else {
  //     fetchProjects(token);
  //   }
  // }, [navigate]);

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
          <h3 className="heading bg-white mt-5 mx-5">Title</h3>
        </div>
        {/* Unchecked */}
        <div className="lists bg-white m-5 px-5">
          <div className="list d-flex bg-white">
            <input type="checkbox" name="" id="" />
            <p className="mt-3 mx-2 bg-white">Go home</p>
          </div>
          <div className="list d-flex bg-white">
            <input type="checkbox" name="" id="" />
            <p className="mt-3 mx-2 bg-white">Ride Bike</p>
          </div>
        </div>
        <div className="add_button bg-white">
          <button className="bg-white mx-5">Add</button>
        </div>
        {/* Chcked points */}
        <div className="lists bg-white m-5 px-5">
          <div className="list d-flex bg-white">
            <input type="checkbox" name="" id="" checked="True" />
            <p className="mt-3 mx-2 bg-white">
              <s className="bg-white">Go home</s>
            </p>
          </div>
          <div className="list d-flex bg-white">
            <input type="checkbox" name="" id="" checked="True" />
            <p className="mt-3 mx-2 bg-white">
              <s className="bg-white">Ride Bike</s>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Detail;
