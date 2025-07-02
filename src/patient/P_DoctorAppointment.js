import React, { useEffect, useRef, useState } from 'react'
import { Button, Card, Col, Container, Form, Image, Row, Table } from 'react-bootstrap';
import P_Sidebar from './P_Sidebar';
import P_nav from './P_nav';
import Loader from '../Loader';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BsGeoAltFill, BsHeart, BsStarFill } from 'react-icons/bs';
import CryptoJS from "crypto-js";

const P_DoctorAppointment = () => {
    const SECRET_KEY = "health-emi";
    var navigate = useNavigate();
    const [loading, setloading] = useState(false)

    const [patient, setpatient] = useState(null)
    const [token, settoken] = useState(null)

    useEffect(() => {
        var getlocaldata = localStorage.getItem('PatientLogin');
        if (getlocaldata != null) {
            const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            var data = JSON.parse(decrypted);
        }
        if (!data) {
            navigate('/patient')
        }
        else {
            setpatient(data.userData);
            settoken(`Bearer ${data.accessToken}`)
        }
    }, [navigate])

    // const [searchdoc, setsearchdoc] = useState('')
    const [doctorlist, setdoctorlist] = useState(null)
    const [searchdoctorlist, setsearchdoctorlist] = useState(null)
    const typingTimeoutRef = useRef(null);
    const [category, setcategory] = useState(null)

    useEffect(() => {
        setloading(true)
        if (patient) {
            setTimeout(() => {
                getdoctordata()
            }, 200);
        }
    }, [patient])

    function getdoctordata(d) {
        axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/user/doctors/list',
            headers: {
                Authorization: token
            },
            data: {
                "search": d
            }
        }).then((res) => {
            setdoctorlist(res.data.Data)
            // console.log('doctor ', res.data.Data)
            var doctordata = res.data.Data.map(doctor => doctor.name)
            setsearchdoctorlist(doctordata)
            const doctors = res.data.Data;
            const categories = [...new Set(
                doctors
                    .map(item => item.specialty)
                    .filter(s => s != null) // optional: remove undefined/null
            )];
            setcategory(categories);
        }).catch(function (error) {
            console.log(error);
        }).finally(() => {
            setloading(false)
        });
    }

    function doclistdata(e) {
        const value = e.target.value;
        // console.log(value)
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set a new timer
        typingTimeoutRef.current = setTimeout(() => {
            getdoctordata(value);
            console.log(doctorlist)
        }, 500);
    }

    return (
        <>
            <Container fluid className='p-0'>
                <Row className='g-0'>
                    <P_Sidebar />
                    <Col xs={12} sm={9} lg={10} className='p-3'>
                        <P_nav patientname={patient && patient.name} />
                        <div className='bg-white rounded p-3 mb-3'>
                            <h5>Search Doctor</h5>
                            <div className='py-2'>
                                {/* <Form.Label htmlFor="inputPassword5">Search Docotor</Form.Label> */}
                                <Form.Control type="email" list="doctor_data" onChange={(e) => doclistdata(e)} placeholder="Ex:- Dr. mahesh" />
                                <datalist id='doctor_data'>
                                    {searchdoctorlist && searchdoctorlist.map((v, i) => {
                                        return (
                                            <option key={i} value={v}></option>
                                        )
                                    })}
                                </datalist>
                            </div>
                            <div className='mt-2 d-flex gap-2 w-100 overflow-x-auto'>
                                <Button variant="outline-dark rounded-pill px-4 btn-sm">All</Button>
                                {
                                    category && category.map((v, i) => {
                                        return (
                                            <Button variant="outline-dark rounded-pill px-4 btn-sm" key={i}>{v}</Button>
                                        )
                                    })
                                }
                            </div>
                        </div>
                        <div className='bg-white rounded p-3'>
                            <h5>Doctor List</h5>
                            <Row className='g-4'>
                                {
                                    doctorlist === null ? <Col>No Doctor Found</Col> :
                                        doctorlist.map((v, i) => {
                                            return (
                                                <Col xs={12} sm={6} md={4} key={i}>
                                                    <Card className="shadow-sm rounded-4" style={{ maxWidth: '420px' }}>
                                                        <Row className="g-0 align-items-center">
                                                            <Col xs={4}>
                                                                {v.identityproof == '' ? <Image src={require('../assets/image/doctor_img.jpg')} roundedCircle fluid className="m-3" width={80} /> : <Image src={v.identityproof} roundedCircle fluid width={80} className="m-3" />}
                                                            </Col>
                                                            <Col xs={8}>
                                                                <Card.Body className="p-2">
                                                                    {/* Doctor Name & Favorite Icon */}
                                                                    <div className="d-flex justify-content-between align-items-center">
                                                                        <Card.Title className="mb-1 fs-6 fw-bold">Dr. {v.name}</Card.Title>
                                                                        <BsHeart className="text-muted" />
                                                                    </div>

                                                                    {/* Specialty */}
                                                                    <Card.Text className="mb-1 text-secondary" style={{ fontSize: '0.9rem' }}>
                                                                        {v.specialty}
                                                                    </Card.Text>

                                                                    {/* Location */}
                                                                    <Card.Text className="d-flex align-items-center mb-1 text-secondary" style={{ fontSize: '0.85rem' }}>
                                                                        <BsGeoAltFill className="me-1" /> {v.hospital_address}
                                                                    </Card.Text>

                                                                    {/* Rating */}
                                                                    <div className="d-flex align-items-center" style={{ fontSize: '0.85rem' }}>
                                                                        <BsStarFill className="text-warning me-1" />
                                                                        <span className="fw-semibold me-1">5</span>
                                                                        <span className="text-muted">(1,245 Reviews)</span>
                                                                    </div>
                                                                    <Link to={`/patient/doctor_ap/${encodeURIComponent(btoa(v._id))}`} className="stretched-link"></Link>
                                                                </Card.Body>
                                                            </Col>
                                                        </Row>
                                                    </Card>
                                                </Col>
                                            )
                                        })
                                }

                            </Row>
                        </div>
                    </Col>
                </Row>
            </Container>
            {loading ? <Loader /> : ''}
        </>
    )
}

export default P_DoctorAppointment