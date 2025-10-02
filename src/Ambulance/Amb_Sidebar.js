import React from 'react'
import { Col } from 'react-bootstrap'
import { MdCalendarMonth, MdCardGiftcard, MdDifference, MdDiversity1, MdSpaceDashboard } from 'react-icons/md'
import { NavLink } from 'react-router-dom'

const Amb_dashboard = () => {
    return (
        <Col xs={12} sm={3} lg={2} className='sticky-md-up top-0 min-vh-100 p-3 pe-0'>
            <div className='bg-white h-100 rounded shadow'>
                <div className='px-3'><h5 className='py-3 m-0 border-bottom text-center'>Health Ambulance</h5></div>
                <div className='sidebar_nav mt-3 ps-3'>
                    <NavLink to={'/ambulance/ambdashboard'} className={({ isActive }) => (isActive ? 'active' : '')}><MdSpaceDashboard /> Dashboard</NavLink>
                    {/* <NavLink to={'/doctor/doctorappointment'} className={({ isActive }) => (isActive ? 'active' : '')}><MdDifference />Appointment</NavLink> */}
                    {/* <NavLink to={'/doctor/doctorsurgery'} className={({ isActive }) => (isActive ? 'active' : '')} ><MdDiversity1 />Surgery</NavLink> */}
                    {/* <NavLink to={'/doctor/doctorblog'} className={({ isActive }) => (isActive ? 'active' : '')} ><MdCardGiftcard />Blog</NavLink> */}
                    {/* <NavLink to={'/doctor/calender'} className={({ isActive }) => (isActive ? 'active' : '')}><MdCalendarMonth /> Calender</NavLink> */}
                </div>
            </div>
        </Col>
    )
}

export default Amb_dashboard