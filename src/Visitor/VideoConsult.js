import React, { useEffect, useState } from 'react'
import NavBar from './Component/NavBar'
import FooterBar from './Component/FooterBar'
import { Card, Col, Container, Image, Row } from 'react-bootstrap'
import { FaAngleRight } from 'react-icons/fa'
import axios from 'axios'
import Loader from '../Loader'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from 'react-slick'
import AppDownload from './Component/AppDownload'
import CryptoJS from "crypto-js";
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, SECRET_KEY } from '../config';

const VideoConsult = () => {
    var navigate = useNavigate();

    const [patient, setpatient] = useState(null)
    const [token, settoken] = useState(null)

    useEffect(() => {
        var getlocaldata = localStorage.getItem('PatientLogin');
        if (getlocaldata != null) {
            const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            var data = JSON.parse(decrypted);
        }
        if (data) {
            setpatient(data.userData);
            settoken(`Bearer ${data.accessToken}`)
        }
    }, [navigate])
    var settings = {
        infinite: true,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        centerPadding: '15px',
        responsive: [
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: 4,
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 3,
                }
            },
            {
                breakpoint: 576,
                settings: {
                    slidesToShow: 2,
                }
            }
        ]
    };
    const [loading, setloading] = useState(false)
    const [doctorlist, setdoctorlist] = useState([])
    useEffect(() => {
        setloading(true)
        getdoctordata()
    }, [])

    const getdoctordata = async () => {
        await axios({
            method: 'post',
            url: `${API_BASE_URL}/user/doctors`,
            data: {
                "page": 1,
                "limit": 10,
                "search": ''
            }
        }).then((res) => {
            console.log(res.data.Data.docs)
            setdoctorlist(res.data.Data.docs)
        }).catch(function (error) {
            console.log(error);
        }).finally(() => {
            setloading(false)
        });
    }

    return (
        <>
            <NavBar logindata={patient} />
            {/* offers section */}
            <section className='py-5'>
                <Container>
                    <div className='text-center sec_head'>
                        <h2>Offers</h2>
                        {/* <p>Private online consultations with verified doctors in all specialists</p> */}
                    </div>
                    <Row>
                        <Col xs={12} md={6}>
                            <div className='offer_box rounded-1 p-4' style={{ 'backgroundColor': '#96d3bf' }}>
                                <div className='offer_box_content'>
                                    <div className='badge bg-light text-success px-3 py-2 rounded-0 fs-6'>OFFER</div>
                                    <h3 className='my-3'>Download the App & get ₹200 HealthCash</h3>
                                    <h5 className='mb-0'>Download App <FaAngleRight /></h5>
                                </div>
                            </div>
                        </Col>
                        <Col xs={12} md={6}>
                            <div className='offer_box rounded-1 p-4' style={{ 'backgroundColor': '#feba7f' }}>
                                <div className='offer_box_content'>
                                    <div className='badge bg-light text-warning px-3 py-2 rounded-0 fs-6'>OFFER</div>
                                    <h3 className='my-3'>Consult with specialists at just ₹199</h3>
                                    <h5 className='mb-0'>Consult Now <FaAngleRight /></h5>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>
            {/* Our Doctors Section */}
            <section className='py-5'>
                <Container>
                    <div className='text-center sec_head'>
                        <h2>Our Doctors</h2>
                        {/* <p>Private online consultations with verified doctors in all specialists</p> */}
                    </div>
                    <Slider {...settings} className='doctor_slider'>
                        {
                            doctorlist.map((v, i) => {
                                return (
                                    <div key={i} className='px-2'>
                                        <Card className="rounded-4" key={i}>
                                            <Row className="g-0 align-items-center">
                                                <Col xs={4}>
                                                    {v.identityproof === '' ? <Image src={require('../assets/image/doctor_img.jpg')} roundedCircle fluid className="m-2" width={80} /> : <Image src={v.identityproof} roundedCircle fluid width={80} className="m-2" />}
                                                </Col>
                                                <Col xs={8}>
                                                    <Card.Body className="p-2">
                                                        {/* Doctor Name & Favorite Icon */}
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <Card.Title className="mb-1 fs-6 fw-bold">{v.name}</Card.Title>
                                                        </div>

                                                        {/* Specialty */}
                                                        <Card.Text className="mb-1 text-secondary" style={{ fontSize: '0.9rem' }}>
                                                            {v.specialty}
                                                        </Card.Text>

                                                    </Card.Body>
                                                </Col>
                                            </Row>
                                        </Card>
                                    </div>
                                )
                            })
                        }
                    </Slider>
                </Container>
            </section>
            {/* benefit section */}
            <section className='py-5 text-bg-dark'>
                <Container>
                    <div className='text-center sec_head'>
                        <h2>Benefits of Online Consultation</h2>
                        {/* <p>Private online consultations with verified doctors in all specialists</p> */}
                    </div>
                    <div>
                        <Row>
                            <Col xs={12} sm={6} md={4}>
                                <div className='benefit_box p-3'>
                                    <h4>Consult Top Doctors 24x7</h4>
                                    <p>Connect instantly with a 24x7 specialist or choose to video visit a particular doctor.</p>
                                </div>
                            </Col>
                            <Col xs={12} sm={6} md={4}>
                                <div className='benefit_box p-3'>
                                    <h4>Consult Top Doctors 24x7</h4>
                                    <p>Connect instantly with a 24x7 specialist or choose to video visit a particular doctor.</p>
                                </div>
                            </Col>
                            <Col xs={12} sm={6} md={4}>
                                <div className='benefit_box p-3'>
                                    <h4>Consult Top Doctors 24x7</h4>
                                    <p>Connect instantly with a 24x7 specialist or choose to video visit a particular doctor.</p>
                                </div>
                            </Col>
                            <Col xs={12} sm={6} md={4}>
                                <div className='benefit_box p-3'>
                                    <h4>Consult Top Doctors 24x7</h4>
                                    <p>Connect instantly with a 24x7 specialist or choose to video visit a particular doctor.</p>
                                </div>
                            </Col>
                            <Col xs={12} sm={6} md={4}>
                                <div className='benefit_box p-3'>
                                    <h4>Consult Top Doctors 24x7</h4>
                                    <p>Connect instantly with a 24x7 specialist or choose to video visit a particular doctor.</p>
                                </div>
                            </Col>
                            <Col xs={12} sm={6} md={4}>
                                <div className='benefit_box p-3'>
                                    <h4>Consult Top Doctors 24x7</h4>
                                    <p>Connect instantly with a 24x7 specialist or choose to video visit a particular doctor.</p>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Container>
            </section>
            {/* App Download Section */}
            <AppDownload />
            <FooterBar />
            {loading ? <Loader /> : ''}
        </>
    )
}

export default VideoConsult