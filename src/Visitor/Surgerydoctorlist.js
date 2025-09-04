import React, { useEffect, useState } from 'react'
import NavBar from './Component/NavBar'
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap'
import Loader from '../Loader'
import FooterBar from './Component/FooterBar'
import axios from 'axios'
import { Link, useParams } from 'react-router-dom'
import CryptoJS from "crypto-js";
import { useNavigate } from 'react-router-dom';
import SearchBox from './Component/SearchBox'
import { MdFilterListAlt } from 'react-icons/md'

const Surgerydoctorlist = () => {
    const SECRET_KEY = "health-emi";
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
    const [loading, setloading] = useState(false)
    var { id } = useParams()
    const d_id = atob(decodeURIComponent(id))
    const [doctor_list, setdoclist] = useState([])

    useEffect(() => {
        // console.log('id = ', d_id)
        setloading(true)
        if (d_id) {
            getdoctorlist(d_id)
        }
    }, [d_id])

    const getdoctorlist = async (d) => {
        await axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/user/doctors/list',
            data: {
                surgerytypeid: d
            }
        }).then((res) => {
            setdoclist(res.data.Data)
            console.log('doctor ', res.data.Data)
        }).catch(function (error) {
            console.log(error);
        }).finally(() => {
            setloading(false)
        });
    }

    return (
        <>
            <NavBar logindata={patient} />
            {/* search box */}
            <SearchBox />

            {/* filter by below list */}
            <Container>
                <Row className='justify-content-center'>
                    <Col xs='auto'>
                        <Button variant='secondary' className='rounded-pill'><MdFilterListAlt className='fs-5' />Filter</Button>
                    </Col>
                    <Col xs='auto'>
                        <Form.Select className='rounded-pill outline-secondary'>
                            <option>Gender</option>
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                        </Form.Select>
                    </Col>
                    <Col xs='auto'>
                        <Form.Select className='rounded-pill outline-secondary'>
                            <option>Fees</option>
                            <option>0 - 1000</option>
                            <option>1000 - 2000</option>
                            <option>2000 - 5000</option>
                            <option>5000 - 15000</option>
                            <option>15000 up</option>
                        </Form.Select>
                    </Col>
                    <Col xs='auto'>
                        <Form.Select className='rounded-pill outline-secondary'>
                            <option>Availability</option>
                        </Form.Select>
                    </Col>
                    <Col xs='auto'>
                        <Form.Select className='rounded-pill outline-secondary'>
                            <option>Consult Type</option>
                        </Form.Select>
                    </Col>
                    <Col xs='auto'>
                        <Form.Select className='rounded-pill outline-secondary'>
                            <option>Experience</option>
                            {['0+', '1+', '2+', '3+', '4+', '5+', '10+', '20+'].map((level) => (
                                <option key={level} value={level}>
                                    {level} years
                                </option>
                            ))}
                        </Form.Select>
                    </Col>
                </Row>
            </Container>
            {/* doctor list section */}
            <section className='py-5'>
                <Container>
                    <h2 className='mb-5'>{doctor_list && doctor_list[0]?.surgerytypeid?.surgerytypename} Doctors List</h2>
                    <Row>
                        <Col xs={12} md={8}>
                            <Row xs={1} className="g-4">
                                {doctor_list.length <= 0 ? <Col>No Doctor Found...</Col> : doctor_list.map((doc, i) => (
                                    <Col key={i}>
                                        <Card className="mb-3 border-0 p-3 border-top rounded-0">
                                            <Row className="g-0">
                                                <Col md={4}>
                                                    {
                                                        doc.identityproof === '' ? <Card.Img
                                                            variant="top"
                                                            src={require('../assets/image/doctor_img.jpg')}
                                                            alt={`Photo of ${doc.name}`}
                                                            style={{ width: "150px", height: "150px", objectFit: "contain", borderRadius: "50%" }}
                                                        /> : <Card.Img
                                                            variant="top"
                                                            src={doc.identityproof}
                                                            alt={`Photo of ${doc.name}`}
                                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                        />
                                                    }
                                                </Col>
                                                <Col md={8}>
                                                    <Card.Body>
                                                        <Card.Title>Dr. {doc.name}</Card.Title>
                                                        <span>{doc.specialty}</span><br />
                                                        <span>{doc.experience} years experience overall</span>
                                                        <p><b>{doc.hospital_address}</b>. {doc.hospital_name}</p>

                                                        <Link to={`/doctorprofile/${encodeURIComponent(btoa(doc._id))}`} className="text-body-primary text-decoration-none">View Profile</Link>

                                                    </Card.Body>
                                                </Col>
                                            </Row>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </Col>
                        <Col className='position-sticky top-0'>
                            lorem sd
                        </Col>
                    </Row>
                </Container>
            </section>
            <FooterBar />
            {loading ? <Loader /> : ''}
        </>
    )
}

export default Surgerydoctorlist