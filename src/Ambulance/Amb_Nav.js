import React from 'react'
import { Button, Col, Dropdown, Row } from 'react-bootstrap'
import { NavLink, useNavigate } from 'react-router-dom'

const Amb_Nav = (name) => {

    var navigate = useNavigate();
    return (
        <div className='top_nav bg-white rounded p-2 shadow-sm mb-4'>
            <Row className='align-items-center justify-content-between'>
                <Col xs={'auto'}>
                    <h6 className='m-0 ps-2'>Hello Mr. {name && name.ambulancename}</h6>
                </Col>
                <Col xs={'auto'} className='doctor_profile'>
                    <Dropdown>
                        <Dropdown.Toggle id="dropdown-basic">
                            Ambulance Profile
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            <NavLink to={'/ambulance/profileambulance'} className='text-decoration-none d-block text-center p-2 profile_nav'>Profile</NavLink>
                            <Button className='btn-navbar' onClick={() => (localStorage.removeItem('healthambulance'), localStorage.removeItem('ambulance_socket'), localStorage.removeItem('lastAmbulanceRequest'), navigate('/ambulance'))}>
                                Logout
                            </Button>

                        </Dropdown.Menu>
                    </Dropdown>
                </Col>
            </Row>
        </div>
    )
}

export default Amb_Nav