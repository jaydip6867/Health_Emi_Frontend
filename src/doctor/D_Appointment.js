import React, { useEffect, useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import DoctorSidebar from './DoctorSidebar'
import DoctorNav from './DoctorNav'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Loader from '../Loader'

const D_Appointment = () => {
    var navigate = useNavigate();
    const [loading, setloading] = useState(false)

    const [doctor, setdoctor] = useState(null)
    const [token, settoken] = useState(null)

    useEffect(() => {
        var data = JSON.parse(localStorage.getItem('doctordata'));
        if (!data) {
            navigate('/doctor')
        }
        else {
            setdoctor(data.data.Data.doctorData);
            settoken(`Bearer ${data.data.Data.accessToken}`)
        }
    }, [navigate])

    
    return (
        <>
            <Container fluid className='p-0'>
                <Row className='g-0'>
                    <DoctorSidebar />
                    <Col xs={12} sm={10} className='p-3'>
                        <DoctorNav doctorname={doctor && doctor.name} />
                        <div className='bg-white rounded p-2'>
                            {
                                doctor === null ?
                                    'data loading' :
                                    <div>
                                        Appointment
                                    </div>
                            }
                        </div>
                    </Col>
                </Row>
            </Container>
            {loading ? <Loader /> : ''}
        </>
    )
}

export default D_Appointment