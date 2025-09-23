import React from 'react'
import { Col } from 'react-bootstrap'
import { FaUserGear } from 'react-icons/fa6'
import { AiFillSchedule } from "react-icons/ai";
import { RiCalendarScheduleFill } from "react-icons/ri";
import { NavLink } from 'react-router-dom'
import { BiSolidCommentAdd } from 'react-icons/bi';

const P_Sidebar = () => {
    return (
        <Col xs={12} sm={3} lg={2} className='position-sticky top-0 p-3 pe-0'>
            <div className='bg-white min-vh-100 rounded shadow'>
                {/* <div className='px-3'><h4 className='p-3 m-0 border-bottom text-center'>Health Patient</h4></div> */}
                <div className='sidebar_nav mt-3 ps-3 py-3'>
                    {/* <NavLink to={'/patient/patientdahsboard'} className={({ isActive }) => (isActive ? 'active' : '')}><MdSpaceDashboard />Dashboard</NavLink> */}
                    <NavLink to={'/patient/patientprofile'} className={({ isActive }) => (isActive ? 'active' : '')}><FaUserGear />Profile</NavLink>
                    {/* <NavLink to={'/patient/patientdoctorappointment'} className={({ isActive }) => (isActive ? 'active' : '')}><MdDifference />Add Appointment</NavLink> */}
                    <NavLink to={'/patient/appointment'} className={({ isActive }) => (isActive ? 'active' : '')} ><RiCalendarScheduleFill />Consultation Appointment</NavLink>
                    <NavLink to={'/patient/surgeries'} className={({ isActive }) => (isActive ? 'active' : '')} ><AiFillSchedule />Surgeries Appointment</NavLink>
                    <NavLink to={'/patient/blog'} className={({ isActive }) => (isActive ? 'active' : '')}><BiSolidCommentAdd />Blog</NavLink>
                </div>
            </div>
        </Col>
    )
}

export default P_Sidebar