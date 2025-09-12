import React from 'react'
import { Col } from 'react-bootstrap'
import { BiSolidCommentAdd, BiSolidUserBadge } from 'react-icons/bi'
import { FaUserNurse } from 'react-icons/fa'
import { FiTrello } from 'react-icons/fi'
import { MdCalendarMonth  , MdSpaceDashboard } from 'react-icons/md'
import { NavLink } from 'react-router-dom'

const DoctorSidebar = () => {
    return (
        <Col xs={12} sm={3} lg={2} className='sticky-md-up top-0 min-vh-100 p-3 pe-0'>
            <div className='bg-white h-100 rounded shadow'>
                <div className='px-3'><h4 className='p-3 m-0 border-bottom text-center'>Health Doctor</h4></div>
                <div className='sidebar_nav mt-3 ps-3'>
                    <NavLink to={'/doctor/doctordashboard'} className={({ isActive }) => (isActive ? 'active' : '')}><MdSpaceDashboard /> Dashboard</NavLink>
                    <NavLink to={'/doctor/doctorappointment'} className={({ isActive }) => (isActive ? 'active' : '')}><BiSolidUserBadge/>Consultant Appointment</NavLink>
                    {/* <NavLink to={'/doctor/doctorsurgeryappointment'} className={({ isActive }) => (isActive ? 'active' : '')}><BiSolidUserBadge/>Surgery Appointment</NavLink> */}
                    <NavLink to={'/doctor/doctorsurgery'} className={({ isActive }) => (isActive ? 'active' : '')} ><FaUserNurse/>Surgery</NavLink>
                    <NavLink to={'/doctor/doctorblog'} className={({ isActive }) => (isActive ? 'active' : '')} ><BiSolidCommentAdd   />Blog</NavLink>
                    <NavLink to={'/doctor/doctorconsultation'} className={({ isActive }) => (isActive ? 'active' : '')}><FiTrello /> Consultation</NavLink>
                    <NavLink to={'/doctor/calender'} className={({ isActive }) => (isActive ? 'active' : '')}><MdCalendarMonth /> Calender</NavLink>
                </div>
            </div>
        </Col>
    )
}

export default DoctorSidebar