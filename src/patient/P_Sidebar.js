import { Button, Col } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import { MdOutlineLogout } from "react-icons/md";
import { IoCalendarOutline } from "react-icons/io5";
import { FiSettings, FiTruck } from "react-icons/fi";
const P_Sidebar = ({ patient }) => {
  const navigate = useNavigate();
  return (
    <Col xs={12} md={3} className="sticky-top min-vh-100 pe-0">
      <div className="py-5">
        <div className="bg-white patient_side_height m-md-0">
          <div>
            <div className="patient_profile">
              <img
                src={
                  patient?.profile_pic ||
                  require("../Visitor/assets/profile_icon_img.png")
                }
              />
            </div>
            <div className="sidebar_nav mt-3 px-2 py-3">
              <NavLink
                to={"/patient/appointment"}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <IoCalendarOutline />
                <span>Consultation Appointment</span>
              </NavLink>
              <NavLink
                to={"/patient/surgeries"}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <IoCalendarOutline />
                <span>Surgeries Appointment</span>
              </NavLink>
              <NavLink
                to={"/patient/ambulancerequest"}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <FiTruck/>
                <span>Book ambulance</span>
              </NavLink>
              <NavLink
                to={"/patient/patientprofile"}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <FiSettings />
                <span>Settings</span>
              </NavLink>
            </div>
          </div>
          <div className="mx-2">
            <Button
              className="w-100 logout-btn"
              onClick={() => (
                localStorage.removeItem("PatientLogin"), navigate("/patient")
              )}
            >
              <MdOutlineLogout size={20} /> Logout
            </Button>
          </div>
        </div>
      </div>
    </Col>
  );
};

export default P_Sidebar;
