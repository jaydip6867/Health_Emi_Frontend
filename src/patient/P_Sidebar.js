import React from 'react'
import { Col } from 'react-bootstrap'
import { MdDifference, MdOutlineListAlt, MdSpaceDashboard } from 'react-icons/md'
import { NavLink } from 'react-router-dom'

const P_Sidebar = () => {
    return (
        <>
            <Col xs={12} sm={3} lg={2} className='position-sticky top-0 vh-100 p-3 pe-0'>
                <div className='bg-white h-100 rounded shadow'>
                    <div className='px-3'><h4 className='p-3 m-0 border-bottom text-center'>Health Patient</h4></div>
                    <div className='sidebar_nav mt-3 ps-3'>
                        <NavLink to={'/patient/patientdahsboard'} className={({ isActive }) => (isActive ? 'active' : '')}><MdSpaceDashboard />Dashboard</NavLink>
                        <NavLink to={'/patient/patientdoctorappointment'} className={({ isActive }) => (isActive ? 'active' : '')}><MdDifference />Add Appointment</NavLink>
                        <NavLink to={'/patient/appointment'} className={({ isActive }) => (isActive ? 'active' : '')} ><MdOutlineListAlt />View Appointment</NavLink>
                        <NavLink to={'/patient/blog'} className={({ isActive }) => (isActive ? 'active' : '')}>Blog</NavLink>
                    </div>
                </div>
            </Col>
        </>
    )
}

export default P_Sidebar