import React, { useState } from "react";
import { Col } from "react-bootstrap";
import { BiSolidCommentAdd, BiSolidUserBadge } from "react-icons/bi";
import { FaUserNurse, FaAmbulance } from "react-icons/fa";
import { FiTrello } from "react-icons/fi";
import { MdCalendarMonth, MdSpaceDashboard } from "react-icons/md";
import { NavLink } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";

const DoctorSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Toggle Button */}
      <div className="d-md-none p-2 bg-light shadow-sm">
        <button className="btn btn-outline-secondary" onClick={toggleSidebar}>
          <GiHamburgerMenu />
        </button>
      </div>

      {/* Sidebar */}
      <Col
        xs={12}
        sm={4}
        md={3}
        lg={2}
        className={`sidebar-wrapper ${
          isOpen ? "open" : ""
        } d-none d-md-block d-sm-block`}
      >
        <div className="bg-white min-vh-100 h-100 rounded shadow sidebar-inner">
          <div className="px-3">
            <h4 className="p-3 m-0 border-bottom text-center">Health Doctor</h4>
          </div>
          <div className="sidebar_nav mt-3 px-3">
            <NavLink
              to={"/doctor/doctordashboard"}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <MdSpaceDashboard /> 
              <span
                className="text-truncate"
                style={{ maxWidth: "150px" }}
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="Consultant Appointment"
              >
                Dashboard
              </span>
            </NavLink>
            <NavLink
              to={"/doctor/doctorappointment"}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <BiSolidUserBadge className="me-2" />
              <span
                className="text-truncate"
                style={{ maxWidth: "150px" }}
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="Consultant Appointment"
              >
                Consultant Appointment
              </span>
            </NavLink>
            <NavLink
              to={"/doctor/doctorsurgeryappointment"}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <BiSolidUserBadge /> Surgery Appointment
            </NavLink>
            <NavLink
              to={"/doctor/bookambulance"}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <FaAmbulance className="me-2" /> Book Ambulance
            </NavLink>
            <NavLink
              to={"/doctor/doctorsurgery"}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <FaUserNurse /> Surgery
            </NavLink>
            <NavLink
              to={"/doctor/doctorblog"}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <BiSolidCommentAdd /> Blog
            </NavLink>
            <NavLink
              to={"/doctor/doctorconsultation"}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <FiTrello /> Consultation
            </NavLink>
            <NavLink
              to={"/doctor/calender"}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <MdCalendarMonth /> Calendar
            </NavLink>
          </div>
        </div>
      </Col>
    </>
  );
};

export default DoctorSidebar;
