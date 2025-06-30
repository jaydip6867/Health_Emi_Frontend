import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import Loader from '../Loader';
import { Button, Card, Col, Container, Image, ListGroup, Modal, Row } from 'react-bootstrap';
import P_Sidebar from './P_Sidebar';
import P_nav from './P_nav';
import { FaMapMarkerAlt } from 'react-icons/fa';
import 'react-calendar/dist/Calendar.css';
import Calendar from 'react-calendar';
import { FaEnvelope, FaFacebook, FaInstagram, FaLinkedin, FaPhone, FaStar, FaTwitter, FaWhatsapp } from 'react-icons/fa6';

const P_DoctorProfile = () => {

    const [value, onChange] = useState(new Date());

    var { id } = useParams('id')
    const d_id = atob(decodeURIComponent(id))
    // console.log(d_id)
    var navigate = useNavigate();
    const [loading, setloading] = useState(false)

    const [patient, setpatient] = useState(null)
    const [token, settoken] = useState(null)

    useEffect(() => {
        var data = JSON.parse(localStorage.getItem('PatientLogin'));
        if (!data) {
            navigate('/patient')
        }
        else {
            setpatient(data.userData);
            settoken(`Bearer ${data.accessToken}`)
        }
    }, [navigate])

    const [doctor_profile, setdocprofile] = useState(null)

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
            url: 'https://healtheasy-o25g.onrender.com/user/doctors/getone',
            headers: {
                Authorization: token
            },
            data: {
                "doctorid": d_id
            }
        }).then((res) => {
            setdocprofile(res.data.Data)
            console.log('doctor ', res.data.Data)
        }).catch(function (error) {
            console.log(error);
        }).finally(() => {
            setloading(false)
        });
    }

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    function appointmentbtn() {
        handleShow()
    }
    return (
        <>
            <Container fluid className='p-0'>
                <Row className='g-0'>
                    <P_Sidebar />
                    <Col xs={12} sm={9} lg={10} className='p-3'>
                        <P_nav patientname={patient && patient.name} />
                        <Card className="p-4 shadow border-0">
                            {
                                doctor_profile === null ? <Col>No Doctor Found</Col> : <Row>
                                    {/* Doctor Info */}
                                    <Col md={8}>
                                        <div className="d-flex align-items-start">
                                            {doctor_profile.identityproof == '' ? <Image src={require('../assets/image/doctor_img.jpg')} roundedCircle className="me-3" width={120} /> : <Image src={doctor_profile.identityproof} roundedCircle className="me-3" width={120} />}
                                            {/* <Image src="https://via.placeholder.com/80" roundedCircle className="me-3" /> */}
                                            <div>
                                                <h5>Dr. {doctor_profile.name}</h5>
                                                <p className="mb-1 text-muted">{doctor_profile.specialty}</p>
                                                <div className="d-flex align-items-center mb-1">
                                                    <FaMapMarkerAlt className="me-2 text-primary" />
                                                    <small>{doctor_profile.hospital_address}</small>
                                                </div>
                                                <div className="d-flex align-items-center mb-1">
                                                    <FaEnvelope className="me-2 text-primary" />
                                                    <small>{doctor_profile.email}</small>
                                                </div>
                                                <div className="d-flex align-items-center mb-1">
                                                    <FaPhone className="me-2 text-primary" />
                                                    <small>{doctor_profile.mobile}</small>
                                                </div>
                                                <div className="text-warning">
                                                    {[...Array(5)].map((_, i) => (
                                                        <FaStar key={i} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        {/* Bio */}
                                        <h6 className="mt-3 pt-3">Short Bio</h6>
                                        <ul className="ps-3 small">
                                            <li>
                                                <strong>Positive Feedback:</strong> “Dr. {doctor_profile.name} was excellent at explaining my condition...”
                                            </li>
                                            <li>
                                                <strong>Constructive Feedback:</strong> “I found it a bit challenging to reach out...”
                                            </li>
                                        </ul>

                                        {/* Services */}
                                        <h6 className="mt-4">Services and price list</h6>
                                        <ListGroup variant="flush">
                                            <ListGroup.Item className="d-flex justify-content-between">
                                                <span>Orthopedic consultation</span><strong>$550</strong>
                                            </ListGroup.Item>
                                            <ListGroup.Item className="d-flex justify-content-between">
                                                <span>Delivery blocks</span><strong>$460</strong>
                                            </ListGroup.Item>
                                            <ListGroup.Item className="d-flex justify-content-between">
                                                <span>Ultrasound injection</span><strong>$460</strong>
                                            </ListGroup.Item>
                                        </ListGroup>
                                    </Col>

                                    {/* Sidebar */}
                                    <Col md={4} className="mt-4 mt-md-0">
                                        {/* <div className="d-flex justify-content-end mb-3">
                                            <FaFacebook className="me-2 text-primary" />
                                            <FaInstagram className="me-2 text-danger" />
                                            <FaTwitter className="me-2 text-info" />
                                            <FaWhatsapp className="me-2 text-success" />
                                            <FaLinkedin className="me-2 text-primary" />
                                        </div> */}

                                        <Card className="p-3 shadow border-0 border-top border-primary">
                                            <h6>About the doctor</h6>
                                            <ul className="list-unstyled small">
                                                <li><strong>{doctor_profile.experience} years of experience</strong><br />At oral surgery clinics in USA</li>
                                                <li className="mt-2"><strong>85% Recommend</strong><br />358 patients recommend this doctor</li>
                                                <li className="mt-2"><strong>Online consultations</strong><br />Consultation possible on-site or online</li>
                                            </ul>
                                            <Button variant="primary" onClick={appointmentbtn} className="mt-3 w-100">Book an appointment now →</Button>
                                        </Card>
                                    </Col>
                                </Row>
                            }
                        </Card>
                    </Col>
                </Row>
            </Container>
            <Modal show={show} size='lg' onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Book Appointment</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col xs={12} md={6}><Calendar onChange={onChange} value={value} minDate={new Date()} /></Col>
                        <Col xs={12} md={6}>Time</Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleClose}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
            {loading ? <Loader /> : ''}
        </>
    )
}

export default P_DoctorProfile