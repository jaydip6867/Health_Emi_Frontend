import React, { useEffect, useState } from 'react'
import Loader from '../Loader'
import { Col, Container, Modal, Row, Button, Form } from 'react-bootstrap'
import P_Sidebar from './P_Sidebar'
import P_nav from './P_nav'
import NavBar from '../Visitor/Component/NavBar'
import FooterBar from '../Visitor/Component/FooterBar'
import CryptoJS from "crypto-js";
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import DataTable from 'react-data-table-component'
import { MdOutlineRemoveRedEye } from 'react-icons/md'

const P_Surgeries = () => {
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

    useEffect(() => {
        setloading(true)
        if (patient) {
            setTimeout(() => {
                getappointments()
            }, 200);
        }
    }, [patient])

    const [appoint_data, setappoint] = useState(null)

    function getappointments(d) {
        axios({
            method: 'get',
            url: 'https://healtheasy-o25g.onrender.com/user/surgeryappointments',
            headers: {
                Authorization: token
            }
        }).then((res) => {
            // console.log('appointment = ', res.data.Data.docs);
            setappoint(res.data.Data.docs)
        }).catch(function (error) {
            console.log(error);
        }).finally(() => {
            setloading(false)
        });
    }

    // display Appointment Details in model
    const [show, setShow] = useState(false);
    const [single_view, setsingleview] = useState(null);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    function btnview(id) {
        var datasingle = appoint_data.filter((v, i) => { return v._id === id })
        setsingleview(datasingle);
        handleShow()
        // console.log(datasingle)
    }

    // table data
    const columns = [{
        name: 'No',
        selector: (row, index) => index + 1,
        sortable: true,
        maxWidth: '80px',
        minWidth: '80px',
        width: '80px'
    }, {
        name: 'Doctor Name',
        cell: row => row?.doctorid?.name
    },
    {
        name: 'Surgery',
        cell: row => row?.surgerydetails?.name
    },
    {
        name: 'Price',
        cell: row => row?.surgerydetails?.price
    },
    {
        name: 'Date & Time',
        cell: row => `${row?.date} ${row?.time}`
    },
    {
        name: 'Status',
        cell: row => {
            let badgeClass = 'badge bg-secondary'; // default

            if (row?.status === 'Accept') {
                badgeClass = 'badge bg-success';
            } else if (row?.status === 'Cancel') {
                badgeClass = 'badge bg-danger';
            } else if (row?.status === 'Pending') {
                badgeClass = 'badge bg-secondary';
            }

            return <span className={badgeClass}>{row?.status}</span>;
        },
        sortable: true
    },
    {
        name: 'View',
        cell: row => <MdOutlineRemoveRedEye onClick={() => btnview(row?._id)} className='text-primary fs-5' />,
        maxWidth: '80px',
        minWidth: '80px',
        width: '80px'
    }]
    return (
        <>
            <NavBar logindata={patient} />
            <Container fluid className='p-0 panel'>
                <Row className='g-0'>
                    <P_Sidebar />
                    <Col xs={12} sm={9} lg={10} className='p-3'>
                        {/* <P_nav patientname={patient && patient.name} /> */}
                        <div className='bg-white rounded p-3 mb-3'>
                            <h5 className='mb-3'>All Surgery Appointments</h5>
                            <DataTable columns={columns} data={appoint_data ? appoint_data : ''} pagination />

                        </div>
                    </Col>
                </Row>
                {/* view single surgery */}
                {
                    single_view && single_view.map((v, i) => {
                        return (
                            <Modal show={show} onHide={handleClose} centered size="lg" key={i}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Surgery Appointment Detail</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <Row className="p-4">
                                        <Col xs={6}>
                                            <Row className="g-3">
                                                <Col xs={12}>
                                                    <div className="bg-light rounded p-3 h-100 shadow">
                                                        <h6 className="text-muted mb-2">Patient Information</h6>
                                                        <div className="mb-2">
                                                            <strong>Name:</strong> <span className="text-primary">{v.patientname}</span>
                                                        </div>
                                                        <div>
                                                            <strong>Mobile:</strong> <span className="text-success">{v.mobile}</span>
                                                        </div>
                                                    </div>
                                                </Col>
                                                <Col xs={12}>
                                                    <div className="bg-light rounded p-3 h-100 shadow">
                                                        <h6 className="text-muted mb-2">Surgery Details</h6>
                                                        <div className="mb-2">
                                                            <strong>Surgery:</strong> <span className="text-info">{v.surgerydetails.name}</span>
                                                        </div>
                                                        <div>
                                                            <strong>Price:</strong> <span className="text-warning fw-bold">₹{v.surgerydetails.price}</span>
                                                        </div>
                                                    </div>
                                                </Col>
                                                <Col xs={12}>
                                                    <div className="bg-light rounded p-3 h-100 shadow">
                                                        <h6 className="text-muted mb-2">Appointment Schedule</h6>
                                                        <div className="d-flex align-items-center">
                                                            <i className="bi bi-calendar-event text-primary me-2"></i>
                                                            <strong>Date:</strong> <span className="ms-2">{v.date}</span>
                                                        </div>
                                                        <div className="d-flex align-items-center mt-2">
                                                            <i className="bi bi-clock text-success me-2"></i>
                                                            <strong>Time:</strong> <span className="ms-2">{v.time}</span>
                                                        </div>
                                                    </div>
                                                </Col>
                                                {
                                                    v.alt_name && v.alt_mobile ? <Col xs={12}>
                                                        <div className="bg-light rounded p-3 h-100 shadow">
                                                            <h6 className="text-muted mb-2">Patient Relative Information</h6>
                                                            <div className="mb-2">
                                                                <strong>Relative Name:</strong> <span className="text-primary">{v.alt_name}</span>
                                                            </div>
                                                            <div>
                                                                <strong>Relative Mobile:</strong> <span className="text-success">{v.alt_mobile}</span>
                                                            </div>
                                                        </div>
                                                    </Col> : ''
                                                }
                                            </Row>
                                        </Col>
                                        <Col xs={6}>
                                            <iframe src={v.report} />
                                        </Col>
                                    </Row>
                                </Modal.Body>
                            </Modal>
                        )
                    })
                }
            </Container>
            {loading ? <Loader /> : ''}
            <FooterBar />
        </>
    )
}

export default P_Surgeries