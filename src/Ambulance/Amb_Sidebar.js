import React from 'react'
import { Button, Col } from 'react-bootstrap'
import { FiLogOut, FiSettings } from 'react-icons/fi'
import { MdLocalHospital, MdSpaceDashboard } from 'react-icons/md'
import { Navigate, NavLink, useNavigate } from 'react-router-dom'

const Amb_dashboard = ({ ambulance }) => {
    const navigate = useNavigate();
    return (
        <Col xs={12} sm={3} className='sticky-md-up top-0 min-vh-100 p-3 pe-0'>
            <div className='bg-white h-100 rounded shadow'>
                {/* <div className='px-3'><h5 className='py-3 m-0 border-bottom text-center'>Health Ambulance</h5></div> */}
                <div className='patient_profile ambulance_profile'>
                    <img src={ambulance?.driver_pic || require('../Visitor/assets/profile_icon_img.png')} alt={`${ambulance?.fullname} profile`} />
                </div>
                <div>
                    <h5 className='text-center' style={{ color: 'var(--grayscale-color-800)' }}>{ambulance?.fullname}</h5>
                </div>
                <div className='sidebar_nav mt-3 ps-3'>
                    <NavLink to={'/ambulance/ambdashboard'} className={({ isActive }) => (isActive ? 'active' : '')}><MdSpaceDashboard /> Dashboard</NavLink>
                    <NavLink
                        to='/ambulance/ambrequests'
                        className={({ isActive }) => (isActive ? 'active' : '')}
                    >
                        <MdLocalHospital className="me-2" /> Ambulance Requests
                    </NavLink>
                    <NavLink to={'/ambulance/profileambulance'} className={({ isActive }) => (isActive ? 'active' : '')}>
                        <FiSettings /> Settings
                    </NavLink>
                    <div className='mx-2 '>
                        <Button className='w-100 logout-btn' onClick={() => (localStorage.removeItem('healthambulance'), localStorage.removeItem('ambulance_socket'), localStorage.removeItem('lastAmbulanceRequest'), navigate('/ambulance'))}><FiLogOut size={20} /> Logout</Button>
                    </div>
                </div>
            </div>
        </Col>
    )
}

export default Amb_dashboard