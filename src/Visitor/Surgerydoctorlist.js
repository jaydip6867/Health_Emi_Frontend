import React, { useEffect, useState } from 'react'
import NavBar from './Component/NavBar'
import { Card, Col, Container, Row } from 'react-bootstrap'
import Loader from '../Loader'
import FooterBar from './Component/FooterBar'
import axios from 'axios'
import { Link, useParams } from 'react-router-dom'

const Surgerydoctorlist = () => {
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
            <NavBar />
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
                                                            <span>{doc.specialty}</span><br/>
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