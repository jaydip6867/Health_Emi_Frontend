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

    const [appointment, setappointment] = useState(null)

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

    useEffect(()=>{
        appointmentlist()
    },[token])

    function appointmentlist() {
        setloading(true)
        axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/doctor/appointments/list',
            headers: {
                Authorization: token
            },
            data: {
                "search": '',
                "startDate": '18-06-2025',
                "endDate": '23-06-2025',
            }
        }).then((res) => {
            console.log(res)
            setappointment(res.data.Data)
        }).catch(function (error) {
            console.log(error);
            // toast(error.response.data.Message,{className:'custom-toast-error'})
        }).finally(() => {
            setloading(false)
        });
    }


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
                                        Table Data
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