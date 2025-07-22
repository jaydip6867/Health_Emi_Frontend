import React from 'react'
import { Button, Col, Dropdown, NavLink, Row } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const P_nav = (name) => {
    var navigate = useNavigate();
    return (
        // <Col xs={12} sm={10} className='p-3'>
                <div className='top_nav bg-white rounded p-2 shadow-sm mb-4'>
                    <Row className='align-items-center justify-content-between'>
                        <Col xs={'auto'}>
                            <h6 className='m-0'>Hello Mr, {name && name.patientname}</h6>
                        </Col>
                        <Col xs={'auto'} className='doctor_profile'>
                            <Dropdown>
                                <Dropdown.Toggle id="dropdown-basic">
                                    Patient Profile
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    <Link to={'/patient/patientprofile'} className='text-decoration-none d-block text-center p-2 profile_nav'>Profile</Link>
                                    <Button className='btn-navbar' onClick={() => (localStorage.removeItem('PatientLogin'), navigate('/patient'))}>Logout</Button>

                                </Dropdown.Menu>
                            </Dropdown>
                        </Col>
                    </Row>
                </div>
        // </Col>
    )
}

export default P_nav