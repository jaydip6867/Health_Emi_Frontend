import React, { useState } from 'react';
import { Button, Col } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import { GiHamburgerMenu } from 'react-icons/gi';
import { MdOutlineLogout, MdVaccines } from "react-icons/md";
import { IoCalendarOutline } from "react-icons/io5";
import { FiSettings, FiTruck, FiXCircle } from "react-icons/fi";
const HospitalSidebar = ({ hospital }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Toggle Button */}
      <div className="d-lg-none p-2 bg-light shadow-sm">
        <button className="btn btn-outline-secondary" onClick={toggleSidebar}>
          <GiHamburgerMenu />
        </button>
      </div>

      {/* Sidebar */}
      <Col xs={12} sm={4} md={3} className={`sidebar-wrapper ${isOpen ? 'open blackarea' : 'min-vh-100'} d-none d-md-block d-sm-block position-sticky top-0 mt-4`}>
        <div className="bg-white rounded sidebar-inner position-relative shadow-sm border border-top-0">
          <div className={`${isOpen ? 'd-block position-absolute top-0 end-0 z-3 p-2' : 'd-none'}`}>
            <FiXCircle style={{color:'white'}} onClick={toggleSidebar}/>
          </div>
          <div>
            <div className="patient_profile">
              <img
                src={
                  hospital?.logo ||
                  require("../Visitor/assets/profile_icon_img.png")
                }
                alt={`${hospital?.hospitalname} profile`}
              />
            </div>
            <div className="text-center py-3 align-items-center d-flex flex-column gap-2">
              <h5 style={{ color: 'var(--grayscale-color-800)' }}>{hospital?.hospitalname || 'Hospital'}</h5>
              {/* <p className='m-0' style={{ color: '#0E9384' }}>Patient</p> */}
            </div>

            <div className="sidebar_nav mt-3 px-3">
              <NavLink to={'/hospital/hospitaldashboard'} className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => setIsOpen(false)}>
                <IoCalendarOutline /> Dashboard
              </NavLink>
               <NavLink to={'/hospital/hospitaldoctors'} className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => setIsOpen(false)}>
                <IoCalendarOutline /> My Doctors
              </NavLink>
              <NavLink to={'/hospital/hospitalappointment'} className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => setIsOpen(false)}>
                <FiSettings /> Consultation Appointment
              </NavLink>
              <NavLink to={'/hospital/hospitalsurgeryappointment'} className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => setIsOpen(false)}>
                <FiTruck /> Surgery Appointment
              </NavLink>
              <NavLink to={'/hospital/hospitalblogs'} className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => setIsOpen(false)}>
                <FiTruck /> Blogs
              </NavLink>
              <NavLink to={'/hospital/hospitalsurgery'} className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => setIsOpen(false)}>
                <MdVaccines /> Surgery
              </NavLink>
              <NavLink to={'/hospital/hospitalprofile'} className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => setIsOpen(false)}>
                <FiSettings /> Settings
              </NavLink>
            </div>
          </div>
          <div className="mx-2">
            <Button
              className="w-100 logout-btn"
              onClick={() => (
                localStorage.removeItem("healthhospital"), navigate("/hospital")
              )}
            >
              <MdOutlineLogout size={20} /> Logout
            </Button>
          </div>
        </div>
      </Col>
    </>
  );
};

export default HospitalSidebar;
