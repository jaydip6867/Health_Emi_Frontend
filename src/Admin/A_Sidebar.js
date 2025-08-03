import React from 'react'
import { Col, NavLink } from 'react-bootstrap'
import { MdCardGiftcard, MdDifference, MdOutlineListAlt, MdSpaceDashboard } from 'react-icons/md'

const A_Sidebar = () => {
    return (
        <>
            <Col xs={12} sm={3} lg={2} className='position-sticky top-0 min-vh-100 p-3 pe-0'>
                <div className='bg-white h-100 rounded shadow'>
                    <div className='px-3'><h4 className='p-3 m-0 border-bottom text-center'>Health Admin</h4></div>
                    <div className='sidebar_nav mt-3 ps-3'>
                        <NavLink to={'/healthadmin/patientdahsboard'} className={({ isActive }) => (isActive ? 'active' : '')}><MdSpaceDashboard />Dashboard</NavLink>
                        <NavLink to={'/healthadmin/patientdoctorappointment'} className={({ isActive }) => (isActive ? 'active' : '')}><MdDifference />Appointment</NavLink>
                        <NavLink to={'/healthadmin/blog'} className={({ isActive }) => (isActive ? 'active' : '')}><MdCardGiftcard />Blog</NavLink>
                    </div>
                </div>
            </Col>
        </>
    )
}

export default A_Sidebar
