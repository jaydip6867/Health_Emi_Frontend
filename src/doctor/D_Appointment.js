import React, { useEffect, useState } from 'react'
import { Col, Container, Dropdown, Row, Table } from 'react-bootstrap'
import DoctorSidebar from './DoctorSidebar'
import DoctorNav from './DoctorNav'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Loader from '../Loader'
import CryptoJS from "crypto-js";

const D_Appointment = () => {
    const SECRET_KEY = "health-emi";
    var navigate = useNavigate();
    const [loading, setloading] = useState(false)

    const [doctor, setdoctor] = useState(null)
    const [token, settoken] = useState(null)


    useEffect(() => {
        var getlocaldata = localStorage.getItem('healthdoctor');
        if (getlocaldata != null) {
            const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            var data = JSON.parse(decrypted);
        }
        if (!data) {
            navigate('/doctor')
        }
        else {
            setdoctor(data.doctorData);
            settoken(`Bearer ${data.accessToken}`)
        }
    }, [navigate])

    const [appointment, setappointment] = useState(null)

    useEffect(() => {
        setloading(true)
        if (doctor) {
            setTimeout(() => {
                appointmentlist()
            }, 200);
        }
    }, [token])

    function appointmentlist() {
        // setloading(true)
        axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/doctor/appointments/list',
            headers: {
                Authorization: token
            }
        }).then((res) => {
            // console.log(res)
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
            <Container fluid className='p-0 panel'>
                <Row className='g-0'>
                    <DoctorSidebar />
                    <Col xs={12} sm={9} lg={10} className='p-3'>
                        <DoctorNav doctorname={doctor && doctor.name} />
                        <div className='bg-white rounded p-2'>
                            <h5 className='mb-4'>All Appointment</h5>
                            <Table bordered hover>
                                <thead>
                                    <tr>
                                        <th>No</th>
                                        <th>Patient Name</th>
                                        <th>Deases</th>
                                        <th>Date & Time</th>
                                        <th>Price</th>
                                        <th>Status</th>
                                        <th>Modify</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        appointment && appointment.map((v, i) => {
                                            return (
                                                <tr key={i}>
                                                    <th>{i + 1}</th>
                                                    <td>{v.patientname}</td>
                                                    <td>{v.surgerydetails.name}</td>
                                                    <td>{v.date} , {v.time}</td>
                                                    <td>{v.surgerydetails.price}</td>
                                                    <td>{v.status} </td>
                                                    <td>
                                                        <Dropdown>
                                                            <Dropdown.Toggle variant="secondary" size='sm' id="dropdown-basic">
                                                                Edit
                                                            </Dropdown.Toggle>

                                                            <Dropdown.Menu>
                                                                <Dropdown.Item href="#/action-1">Accept</Dropdown.Item>
                                                                <Dropdown.Item href="#/action-2">Cancel</Dropdown.Item>
                                                            </Dropdown.Menu>
                                                        </Dropdown>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </Table>
                        </div>
                    </Col>
                </Row>
            </Container>
            {loading ? <Loader /> : ''}
        </>
    )
}

export default D_Appointment