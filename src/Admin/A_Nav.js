import React from 'react'
import { Button, Col, Dropdown, NavLink, Row } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const A_Nav = () => {
    var navigate = useNavigate();
    return (
        <>
            <div className='top_nav bg-white rounded p-2 shadow-sm mb-4'>
                <Row className='align-items-center justify-content-between'>
                    <Col xs={'auto'}>
                        <h6 className='m-0'>Hello Admin,</h6>
                    </Col>
                    <Col xs={'auto'} className='doctor_profile'>
                        <Button className='btn-navbar btn-danger btn-sm' onClick={() => (localStorage.removeItem('healthadmincredit'), navigate('/healthadmin'))}>Logout</Button>

                        {/* <Dropdown>
                            <Dropdown.Toggle id="dropdown-basic">
                                Patient Profile
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Link to={'/healthadmin/patientprofile'} className='text-decoration-none d-block text-center p-2 profile_nav'>Profile</Link>
                                <Button className='btn-navbar' onClick={() => (localStorage.removeItem('healthadmincredit'), navigate('/healthadmin'))}>Logout</Button>

                            </Dropdown.Menu>
                        </Dropdown> */}
                    </Col>
                </Row>
            </div>
        </>
    )
}

export default A_Nav
