import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import DoctorNav from './DoctorNav';
import { Button, Col, Container, Form, Modal, Row } from 'react-bootstrap';
import DoctorSidebar from './DoctorSidebar';
import CryptoJS from "crypto-js";
import Loader from '../Loader';
import { toast, ToastContainer } from 'react-toastify';
import Swal from 'sweetalert2';
import axios from 'axios';

const D_Consultation = () => {
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

    useEffect(() => {
        if (token) {
            getconsultant()
        }
    }, [token])

    const [consultdata,setconsultdata] = useState(null)

    function getconsultant() {
        setloading(true)
        axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/user/doctors/getone',
            data: {
                "doctorid": doctor._id
            }
        }).then((res) => {
            // console.log(res.data.Data)
            setconsultdata(res.data.Data.consultationsDetails)
            if(res.data.Data.consultationsDetails){
                const c_data = { home_visit_price: res.data.Data.consultationsDetails.home_visit_price, clinic_visit_price: res.data.Data.consultationsDetails.clinic_visit_price, eopd_price: res.data.Data.consultationsDetails.eopd_price }
                setconsult(c_data)
            }
        }).catch(function (error) {
            // console.log(error);
            toast(error.response.data.Message, { className: 'custom-toast-error' })
        }).finally(() => {
            setloading(false)
        });
    }

    const obj = { home_visit_price: '', clinic_visit_price: '', eopd_price: '' }
    const [consult, setconsult] = useState(obj)

    // display surgery in model
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const selconsult = (e) => {
        const { name, value } = e.target;
        setconsult(consult => ({
            ...consult,
            [name]: value
        }))
    }

    const addconsultant = async () => {
        setloading(true)
        axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/doctor/consultations/save',
            headers: {
                Authorization: token,
            },
            // data: surgery
            data: consult
        }).then((res) => {
            // toast('Surgery added...', { className: 'custom-toast-success' })
            Swal.fire({
                title: "Consultant Added...",
                icon: "success",
            });
            // getsurgery()
            setconsult(obj);
            handleClose()
        }).catch(function (error) {
            // console.log(error);
            toast(error.response.data.Message, { className: 'custom-toast-error' })
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
                        <div className='bg-white rounded p-3 shadow '>
                            <Row className='mt-2 mb-3 justify-content-between'>
                                <Col xs={'auto'}>
                                    <h4>My Consultation Charges</h4>
                                </Col>
                                <Col xs={'auto'}>
                                    <Button variant='primary' onClick={handleShow}>{consultdata!==null ? 'Edit':'Add'} Consultation</Button>
                                </Col>
                            </Row>
                            <div>
                                <p><b>Home Visit :- </b> {consultdata?.home_visit_price}</p>
                                <p><b>Clinic Visit :- </b> {consultdata?.clinic_visit_price}</p>
                                <p><b>EOPD :- </b> {consultdata?.eopd_price}</p>
                            </div>
                        </div>
                    </Col>
                </Row>
                {/* add surgery */}
                <Modal show={show} onHide={handleClose} centered size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>Add Surgery Detail</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row className='g-4'>
                            <Col xs={12} md={12}>
                                <div className='bg-white rounded p-3 shadow'>
                                    <Form className='row register_doctor'>
                                        <Form.Group controlId="hv" className='mb-3 col-md-4'>
                                            <div className='position-relative'>
                                                <Form.Label>Home Visit Price</Form.Label>
                                                <Form.Control placeholder="Ex:- 500" name="home_visit_price" value={consult.home_visit_price} onChange={selconsult} />
                                            </div>
                                        </Form.Group>

                                        <Form.Group controlId="cv" className='mb-3 col-md-4'>
                                            <div className='position-relative'>
                                                <Form.Label>Clinic Visit Price</Form.Label>
                                                <Form.Control placeholder="Ex:- 500" name="clinic_visit_price" value={consult.clinic_visit_price} onChange={selconsult} />
                                            </div>
                                        </Form.Group>

                                        <Form.Group controlId="eopd" className='mb-3 col-md-4'>
                                            <div className='position-relative'>
                                                <Form.Label>EOPD Price</Form.Label>
                                                <Form.Control placeholder="Ex:- 1000" name="eopd_price" value={consult.eopd_price} onChange={selconsult} />
                                            </div>
                                        </Form.Group>

                                        <Form.Group className='col-12'>
                                            <Form.Control type='button' value={'Add Consultation'} onClick={addconsultant} className='theme_btn' />
                                        </Form.Group>
                                    </Form>
                                </div>
                            </Col>
                        </Row>
                    </Modal.Body>
                </Modal>
            </Container>
            <ToastContainer />
            {loading ? <Loader /> : ''}
        </>
    )
}

export default D_Consultation