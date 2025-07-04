import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import Loader from '../Loader';
import { Button, Card, Col, Container, Form, Image, ListGroup, Modal, Row, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import P_Sidebar from './P_Sidebar';
import P_nav from './P_nav';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { FaEnvelope, FaPhone, FaStar, } from 'react-icons/fa6';
import CryptoJS from "crypto-js";
import DatePicker from "react-datepicker";
import { format } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";
import Swal from 'sweetalert2';

const P_DoctorProfile = () => {
    const SECRET_KEY = "health-emi";
    const [selectedDate, setSelectedDate] = useState(null);
    // const [time, settime] = useState(['9:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM'])
    // const [chtime, setchtime] = useState('');

    var { id } = useParams('id')
    const d_id = atob(decodeURIComponent(id))
    // console.log(d_id)
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
            // console.log('doctor ', res.data.Data)
        }).catch(function (error) {
            console.log(error);
        }).finally(() => {
            setloading(false)
        });
    }

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    var app_obj = { alt_mobile: '', surgeryid: '', appointment_reason: '', report: '' }
    const [apt_data, setaptdata] = useState(app_obj)

    function appchangedata(e) {
        const { name, value } = e.target;
        setaptdata(apt_data => ({
            ...apt_data,
            [name]: value
        }))
    }


    function appointmentbtn(id) {
        // Split at the space before the time
        const [datePart, timePart, meridiem] = formattedDateTime.split(' ');
        // Combine time + meridiem
        const timeWithMeridiem = `${timePart} ${meridiem}`;
        // console.log(apt_data, datePart, timeWithMeridiem )
        setloading(true)
        axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/user/appointments/save',
            headers: {
                Authorization: token
            },
            data: {
                "patientname": patient.name,
                "mobile": patient.mobile,
                "alt_mobile": apt_data.alt_mobile,
                "date": datePart,
                "time": timeWithMeridiem,
                "surgeryid": apt_data.surgeryid,
                "appointment_reason": apt_data.appointment_reason,
                "report": apt_data.report,
                "doctorid": id
            }
        }).then((res) => {
            Swal.fire({
                title: "Appointment Add Successfully...",
                icon: "success",
                confirmButtonText: 'Ok.'
            }).then((result) => {
                navigate('/patient/appointment');
            });
        }).catch(function (error) {
            Swal.fire({
                title: "Something Went Wrong.",
                text: "Something Is Missing. Please Check Details...",
                icon: "error",
            });
        }).finally(() => {
            setloading(false)
        });
    }

    const formattedDateTime = selectedDate
        ? format(selectedDate, 'dd-MM-yyyy hh:mm a')
        : '';
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
                                            {
                                                doctor_profile && doctor_profile.surgeriesDetails.map((v, i) => {
                                                    return (
                                                        <ListGroup.Item className="d-flex justify-content-between" key={i}>
                                                            <span>{v.name}</span><strong>₹{v.price}</strong>
                                                        </ListGroup.Item>
                                                    )
                                                })
                                            }

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
                                            <Button variant="primary" onClick={handleShow} className="mt-3 w-100">Book an appointment now →</Button>
                                        </Card>
                                    </Col>
                                </Row>
                            }
                        </Card>
                    </Col>
                </Row>
            </Container>
            {
                patient && doctor_profile && <Modal show={show} size='lg' onHide={handleClose} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Book Appointment</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row className='g-4'>
                            <Col xs={12}>
                                <Form>
                                    <Row className='g-4'>
                                        <Col xs={4}><Form.Label>Name</Form.Label><Form.Control value={patient.name} disabled></Form.Control></Col>
                                        <Col xs={4}><Form.Label>Phone Number</Form.Label><Form.Control value={patient.mobile} disabled></Form.Control></Col>
                                        <Col xs={4}><Form.Label>Alt Phone Number</Form.Label><Form.Control value={apt_data.alt_mobile} name='alt_mobile' onChange={appchangedata} placeholder='Alt. Phone Number'></Form.Control></Col>
                                        <Col xs={4}><Form.Label>Surgery</Form.Label><Form.Select name='surgeryid' onChange={appchangedata}>
                                            <option value=''>Select Surgery</option>
                                            {
                                                doctor_profile.surgeriesDetails.map((v, i) => {
                                                    return (
                                                        <option value={v._id} key={i}>{v.name}</option>
                                                    )
                                                })
                                            }
                                        </Form.Select></Col>
                                        <Col xs={4}><Form.Label>Reason</Form.Label><Form.Control value={apt_data.appointment_reason} name='appointment_reason' onChange={appchangedata} placeholder='Appointment Reason' ></Form.Control></Col>
                                        <Col xs={4}><Form.Label>Reports</Form.Label><Form.Control type='file' value={apt_data.report} name='report' onChange={appchangedata}></Form.Control></Col>
                                    </Row>
                                </Form>
                            </Col>
                            <Col xs={12} md={6}><DatePicker selected={selectedDate}
                                onChange={(date) => setSelectedDate(date)}
                                showTimeSelect
                                timeFormat="hh:mm a"
                                timeIntervals={15}
                                dateFormat="dd-MM-yyyy hh:mm a"
                                placeholderText="Select date and time"
                                minDate={new Date()} /></Col>
                            {/* <Col xs={12} md={6}>
                                <ToggleButtonGroup type="radio" name="options" defaultValue={1} className='btnradio-app flex-wrap gap-2'>
                                    {
                                        time.map((v, i) => {
                                            return (
                                                <ToggleButton key={i} value={v} variant='outline-dark' id={`time-btn-${i}`} name='time' onClick={() => setchtime(v)}>{v}</ToggleButton>
                                            )
                                        })
                                    }
                                </ToggleButtonGroup>
                            </Col> */}
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={() => { appointmentbtn(doctor_profile._id); handleClose() }}>
                            Save Changes
                        </Button>
                    </Modal.Footer>
                </Modal>
            }
            {loading ? <Loader /> : ''}
        </>
    )
}

export default P_DoctorProfile