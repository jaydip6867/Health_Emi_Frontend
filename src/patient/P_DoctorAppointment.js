import React, { useEffect, useRef, useState } from 'react'
import { Button, Card, Col, Container, Form, Image, Row, Badge, InputGroup, Dropdown } from 'react-bootstrap';
import P_Sidebar from './P_Sidebar';
import P_nav from './P_nav';
import NavBar from '../Visitor/Component/NavBar'
import FooterBar from '../Visitor/Component/FooterBar'
import Loader from '../Loader';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BsGeoAltFill, BsHeart, BsStarFill, BsSearch, BsFilter, BsGrid3X3Gap } from 'react-icons/bs';
import { MdVerified, MdAccessTime } from 'react-icons/md';
import CryptoJS from "crypto-js";
import '../doctor/css/doctor.css';

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
    const [dispdoctorlist, setdispdoctorlist] = useState(null)
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
            // headers: {
            //     Authorization: token
            // },
            data: {
                "search": d
            }
        }).then((res) => {
            setdoctorlist(res.data.Data)
            setdispdoctorlist(res.data.Data)
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
            // getdoctordata(value);
            setdispdoctorlist(doctorlist)
            // console.log(doctorlist)
        }, 500);
    }

    const catfilterdoctor = (s) => {
        setloading(true)
        setTimeout(() => {
            if (s !== 'All') {
                var filter_data = doctorlist.filter((v)=>{
                    return v?.specialty == s
                })
                setdispdoctorlist(filter_data)
            }
            else{
                setdispdoctorlist(doctorlist)
            }
            setloading(false)
        }, 200);
        // console.log(filter_data)
    }

    return (
        <>
        <NavBar logindata={patient} />
            <Container fluid className='p-0 panel'>
                <Row className='g-0'>
                    <P_Sidebar />
                    <Col xs={12} sm={9} lg={10} className='p-3'>
                        {/* <P_nav patientname={patient && patient.name} /> */}
                        {/* Enhanced Filter Section */}
                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Header className="bg-gradient border-0 py-3">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center">
                                        <BsFilter className="me-2 text-primary" size={20} />
                                        <h5 className="mb-0 fw-bold text-dark">Find Your Doctor</h5>
                                    </div>
                                    <Badge bg="primary" className="rounded-pill">
                                        {dispdoctorlist?.length || 0} doctors found
                                    </Badge>
                                </div>
                            </Card.Header>
                            <Card.Body className="p-4">
                                

                                {/* Category Filter Pills */}
                                <div className="mb-3">
                                    <h6 className="text-muted mb-3 fw-semibold">Filter by Specialty</h6>
                                    <div className="d-flex flex-wrap gap-2">
                                        <Button 
                                            variant="primary" 
                                            className="rounded-pill px-3 py-1 fw-semibold"
                                            onClick={() => catfilterdoctor('All')}
                                        >
                                            All Specialties
                                        </Button>
                                        {
                                            category && category.map((v, i) => {
                                                return (
                                                    <Button 
                                                        variant="outline-primary" 
                                                        className="rounded-pill px-3 py-1"
                                                        key={i} 
                                                        onClick={() => catfilterdoctor(v)}
                                                    >
                                                        {v}
                                                    </Button>
                                                )
                                            })
                                        }
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                        {/* Enhanced Doctor List Section */}
                        <Card className="border-0 shadow-sm">
                            <Card.Header className="bg-light border-0 py-3">
                                <div className="d-flex align-items-center justify-content-between">
                                    <h5 className="mb-0 fw-bold text-dark">Available Doctors</h5>
                                    <div className="d-flex align-items-center text-muted">
                                        <small>Showing {dispdoctorlist?.length || 0} results</small>
                                    </div>
                                </div>
                            </Card.Header>
                            <Card.Body className="p-4">
                                <Row className='g-4'>
                                    {
                                        dispdoctorlist === null || dispdoctorlist?.length === 0 ? 
                                        <Col xs={12}>
                                            <div className="text-center py-5">
                                                <div className="mb-3">
                                                    <BsSearch size={48} className="text-muted" />
                                                </div>
                                                <h5 className="text-muted mb-2">No Doctors Found</h5>
                                                <p className="text-muted">Try adjusting your search criteria or browse all specialties.</p>
                                                <Button variant="primary" onClick={() => catfilterdoctor('All')}>
                                                    View All Doctors
                                                </Button>
                                            </div>
                                        </Col> :
                                        dispdoctorlist.map((v, i) => {
                                            return (
                                                <Col xs={12} sm={6} lg={4} xl={3} key={i}>
                                                    <Card className="h-100 border-0 shadow-sm hover-card" style={{ transition: 'all 0.3s ease' }}>
                                                        <Card.Body className="p-4">
                                                            {/* Doctor Image */}
                                                            <div className="text-center pt-2 pb-3">
                                                                <div className="position-relative d-inline-block">
                                                                    {v?.identityproof === '' || v?.identityproof === null || v?.identityproof === undefined ? 
                                                                        <Image 
                                                                            src={require('../assets/image/doctor_img.jpg')} 
                                                                            roundedCircle 
                                                                            width={100} 
                                                                            height={100}
                                                                            style={{ objectFit: 'cover' }}
                                                                        />
                                                                        :
                                                                        <Image 
                                                                            src={`https://healtheasy-o25g.onrender.com/uploads/${v?.identityproof}`} 
                                                                            roundedCircle 
                                                                            width={100} 
                                                                            height={100}
                                                                            style={{ objectFit: 'cover' }}
                                                                        />
                                                                    }
                                                                    
                                                                </div>
                                                            </div>

                                                            {/* Doctor Name */}
                                                            <Card.Title className="h6 fw-bold mb-1 text-dark text-center">
                                                                Dr. {v?.name}
                                                            </Card.Title>

                                                            {/* Specialty Badge */}
                                                            <div className="text-center mb-3">
                                                                <Badge 
                                                                    bg="primary-subtle" 
                                                                    text='primary'
                                                                    className="rounded-pill px-3 py-2"
                                                                    style={{ fontSize: '0.75rem' }}
                                                                >
                                                                    {v?.specialty || 'General Medicine'}
                                                                </Badge>
                                                            </div>

                                                            {/* Experience */}
                                                            <div className="d-flex align-items-center justify-content-center mb-2 text-muted">
                                                                <MdAccessTime className="me-1" size={14} />
                                                                <small>{v?.experience || '5+'} years experience</small>
                                                            </div>

                                                            {/* Location */}
                                                            <div className="d-flex align-items-center justify-content-center mb-3 text-muted">
                                                                <BsGeoAltFill className="me-1" size={12} />
                                                                <small className="text-truncate" style={{ maxWidth: '150px' }}>
                                                                    {v?.hospital_address || 'Location not specified'}
                                                                </small>
                                                            </div>

                                                            {/* Action Button */}
                                                            <div className="text-center">
                                                                <Link 
                                                                    to={`/patient/doctor_ap/${encodeURIComponent(btoa(v?._id))}`} 
                                                                    className="btn d-block btn-outline-primary btn-sm rounded-pill px-4 fw-semibold text-decoration-none"
                                                                >
                                                                    View Profile
                                                                </Link>
                                                            </div>
                                                        </Card.Body>
                                                    </Card>
                                                </Col>
                                            )
                                        })
                                    }
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
            {loading ? <Loader /> : ''}
            <FooterBar />
        </>
    )
}

export default P_DoctorAppointment