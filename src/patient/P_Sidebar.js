import React from 'react'
import { Col } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'

const P_Sidebar = () => {
    return (
        <>
            <Col xs={12} sm={3} lg={2} className='text-bg-dark position-sticky top-0 vh-100'>
                <h4 className='p-2 m-0 border-bottom text-center'>Health Doctor</h4>
                <div className='sidebar_nav'>
                    <NavLink to={'/patient/patientdahsboard'} className={({ isActive }) => (isActive ? 'active' : '')}>Dashboard</NavLink>
                    {/* <NavLink to={'/doctor/doctorappointment'} className={({ isActive }) => (isActive ? 'active' : '')}>Appointment</NavLink> */}
                    {/* <NavLink to={'/doctor/doctorsurgery'} className={({ isActive }) => (isActive ? 'active' : '')} >Surgery</NavLink> */}
                    {/* <NavLink to={'/doctor/calender'} className={({ isActive }) => (isActive ? 'active' : '')}>Calender</NavLink> */}
                </div>
            </Col>
        </>
    )
}

export default P_Sidebar