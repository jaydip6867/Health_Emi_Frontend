import React from 'react'
import { Col } from 'react-bootstrap'
import { MdCardGiftcard, MdDifference, MdOutlineListAlt, MdSpaceDashboard } from 'react-icons/md'
import { Link } from 'react-router-dom'

const P_Sidebar = () => {
    return (
        <>
            <Col xs={12} sm={3} lg={2} className='position-sticky top-0 min-vh-100 p-3 pe-0'>
                <div className='bg-white h-100 rounded shadow'>
                    <div className='px-3'><h4 className='p-3 m-0 border-bottom text-center'>Health Patient</h4></div>
                    <div className='sidebar_nav mt-3 ps-3'>
                        <Link to={'/patient/patientdahsboard'} className={({ isActive }) => (isActive ? 'active' : '')}><MdSpaceDashboard />Dashboard</Link>
                        <Link to={'/patient/patientdoctorappointment'} className={({ isActive }) => (isActive ? 'active' : '')}><MdDifference />Add Appointment</Link>
                        <Link to={'/patient/appointment'} className={({ isActive }) => (isActive ? 'active' : '')} ><MdOutlineListAlt />View Appointment</Link>
                        <Link to={'/patient/blog'} className={({ isActive }) => (isActive ? 'active' : '')}><MdCardGiftcard />Blog</Link>
                    </div>
                </div>
            </Col>
        </>
    )
}

export default P_Sidebar