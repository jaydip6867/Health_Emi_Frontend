import React, { useState } from 'react';
import { Col } from 'react-bootstrap';
import { NavLink, useNavigate } from 'react-router-dom';
import { GiHamburgerMenu } from 'react-icons/gi';
import { Button } from 'react-bootstrap';
import { FiActivity, FiCalendar, FiDollarSign, FiFilePlus, FiLayout, FiLogOut, FiMessageSquare, FiSettings, FiTruck, FiXCircle } from "react-icons/fi";
import { IoCalendarOutline } from "react-icons/io5";
import { TbRosetteDiscountCheckFilled } from "react-icons/tb";
import { isPast } from 'date-fns';


const DoctorSidebar = ({ doctor }) => {
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
            <Col xs={12} sm={4} md={3} className={`sidebar-wrapper ${isOpen ? 'open blackarea' : 'min-vh-100'} d-none d-md-block d-sm-block position-sticky top-0`} >
                <div className="bg-white rounded sidebar-inner position-relative">
                    <div className={`${isOpen ? 'd-block position-absolute top-0 end-0 z-3 p-2' : 'd-none'}`}><FiXCircle style={{color:'white'}} onClick={toggleSidebar}/></div>
                    <div>
                        <div className='patient_profile'>
                            <img src={doctor?.profile_pic || require('../Visitor/assets/profile_icon_img.png')} />
                        </div>
                        <div className='text-center py-3 align-items-center d-flex flex-column gap-2'>
                            {doctor?.is_available === true ? <span className='apt_complete_btn small'>Available</span> : <span className='apt_dark_btn small'>Not Available</span>}
                            <div>
                                <h5 style={{ color: 'var(--grayscale-color-800)' }}>Dr. {doctor?.name} <TbRosetteDiscountCheckFilled fill='#0E9384'/></h5>
                                <p className='m-0' style={{ color: '#0E9384' }}>{doctor?.specialty} Psychologist</p>
                            </div>
                        </div>

                        <div className="sidebar_nav mt-3 px-3">
                            <NavLink to={'/doctor/doctordashboard'} className={({ isActive }) => (isActive ? 'active' : '')}>
                                <FiLayout /> Dashboard
                            </NavLink>
                            <NavLink to={'/doctor/doctorappointment'} className={({ isActive }) => (isActive ? 'active' : '')}>
                                <IoCalendarOutline /> Consultant Appointment
                            </NavLink>
                            <NavLink to={'/doctor/doctorsurgeryappointment'} className={({ isActive }) => (isActive ? 'active' : '')}>
                                <IoCalendarOutline /> Surgery Appointment
                            </NavLink>
                            <NavLink to={'/doctor/doctorsurgery'} className={({ isActive }) => (isActive ? 'active' : '')}>
                                <FiActivity /> My Surgery
                            </NavLink>
                            <NavLink to={'/doctor/doctorblog'} className={({ isActive }) => (isActive ? 'active' : '')}>
                                <FiFilePlus /> Blog
                            </NavLink>
                            <NavLink to={'/doctor/doctorconsultation'} className={({ isActive }) => (isActive ? 'active' : '')}>
                                <FiDollarSign /> Consultation
                            </NavLink>
                            <NavLink to={'/doctor/doctorreviews'} className={({ isActive }) => (isActive ? 'active' : '')}>
                                <FiMessageSquare /> Reviews
                            </NavLink>
                            <NavLink to={'/doctor/calender'} className={({ isActive }) => (isActive ? 'active' : '')}>
                                <FiCalendar /> Calendar
                            </NavLink>
                            <NavLink to={'/doctor/ambulance-request'} className={({ isActive }) => (isActive ? 'active' : '')}>
                                <FiTruck /> Ambulance Booking
                            </NavLink>
                            <NavLink to={'/doctor/doctorprofile'} className={({ isActive }) => (isActive ? 'active' : '')}>
                                <FiSettings />Settings
                            </NavLink>
                        </div>
                    </div>
                    <div className='mx-2'>
                        <Button className='w-100 logout-btn' onClick={() => (localStorage.removeItem('healthdoctor'), navigate('/doctor'))}><FiLogOut size={20} /> Logout</Button>

                    </div>
                </div>
            </Col>
        </>
    );
};

export default DoctorSidebar;
