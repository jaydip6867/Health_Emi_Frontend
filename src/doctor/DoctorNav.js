import React from 'react'
import { Button, Col, Container, Dropdown, Row } from 'react-bootstrap'
import { Link, NavLink, useNavigate } from 'react-router-dom'

const DoctorNav = (name) => {
    var navigate = useNavigate();
    return (
        // <Col xs={12} sm={10} className='p-3'>
            <div className='top_nav bg-white rounded p-2 shadow mb-4'>
                <Row className='align-items-center justify-content-between'>
                    <Col xs={'auto'}>
                        <h6 className='m-0'>Hello Doctor, {name == null ? name.doctorname : ''}</h6>
                    </Col>
                    <Col xs={'auto'} className='doctor_profile'>
                        <Dropdown>
                            <Dropdown.Toggle id="dropdown-basic">
                                Doctor Profile
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <NavLink to={'/doctor/doctorprofile'}>Profile</NavLink>
                                <Button className='btn-navbar' onClick={() => (localStorage.removeItem('doctordata'), navigate('/doctor'))}>Logout</Button>

                            </Dropdown.Menu>
                        </Dropdown>
                    </Col>
                </Row>
            </div>
        // </Col>
    )
}

export default DoctorNav