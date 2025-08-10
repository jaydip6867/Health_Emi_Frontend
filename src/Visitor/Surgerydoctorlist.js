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
        console.log('id = ', d_id)
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
                    <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                        {doctor_list.length <= 0 ? <Col>No Doctor Found...</Col> : doctor_list.map((doc, i) => (
                            <Col key={i}>
                                <Card className="h-100 doctor_list">
                                    {/* Card image container */}
                                    <div>
                                        {
                                            doc.identityproof === '' ? <Card.Img
                                                variant="top"
                                                src={require('../assets/image/doctor_img.jpg')}
                                                alt={`Photo of ${doc.name}`}
                                                style={{ width: "150px", height: "150px", objectFit: "contain", borderRadius:"50%"}}
                                            /> : <Card.Img
                                                variant="top"
                                                src={doc.identityproof}
                                                alt={`Photo of ${doc.name}`}
                                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                            />
                                        }
                                    </div>

                                    <Card.Body className="d-flex flex-column">
                                        <Card.Title className="d-flex align-items-center justify-content-between">
                                            <span style={{ fontSize: "1rem", fontWeight: 600 }}>{doc.name}</span>
                                        </Card.Title>

                                        <Card.Subtitle className="mb-2 text-muted">{doc.specialization}</Card.Subtitle>

                                        <Card.Text className="mt-auto">
                                            <strong>Contact: </strong>
                                            <a href={`tel:${doc.phone}`} style={{ textDecoration: "none" }}>
                                                {doc.phone}
                                            </a>
                                        </Card.Text>
                                    </Card.Body>

                                    <Card.Footer className="text-muted small">
                                        ID: {doc.id}
                                    </Card.Footer>
                                    <Link to={`/doctorprofile/${encodeURIComponent(btoa(doc._id))}`} className='stretched-link'></Link>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>
            <FooterBar />
            {loading ? <Loader /> : ''}
        </>
    )
}

export default Surgerydoctorlist