import React, { useEffect, useState } from 'react'
import Loader from '../Loader'
import { Button, Card, Col, Container, Modal, OverlayTrigger, Row, Tooltip } from 'react-bootstrap'
import P_Sidebar from './P_Sidebar'
import NavBar from '../Visitor/Component/NavBar'
import FooterBar from '../Visitor/Component/FooterBar'
import CryptoJS from "crypto-js";
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import SmartDataTable from '../components/SmartDataTable'
import { MdOutlineRemoveRedEye, MdDownload, MdVisibility } from 'react-icons/md'

const P_Appointment = () => {
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
            url: 'https://healtheasy-o25g.onrender.com/user/appointments',
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
        console.log(datasingle)
    }

    // Download PDF function
    const handleDownloadPDF = (pdfUrl, patientName) => {
        if (!pdfUrl) return;
        
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `prescription_${patientName?.replace(/\s+/g, '_') || 'patient'}_${Date.now()}.pdf`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    // Generate initials for profile picture fallback
    const getInitials = (name) => {
        if (!name) return 'N/A';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    // Get status badge styling
    const getStatusBadge = (status) => {
        const statusConfig = {
            'Accept': { bg: '#10B981', text: 'Accepted', dot: '#10B981' },
            'Pending': { bg: '#F59E0B', text: 'Pending', dot: '#F59E0B' },
            'Cancel': { bg: '#EF4444', text: 'Cancelled', dot: '#EF4444' },
            'Discharged': { bg: '#10B981', text: 'Discharged', dot: '#10B981' },
            'Ext. hospitalization': { bg: '#F97316', text: 'Ext. hospitalization', dot: '#F97316' },
            'Unavailable': { bg: '#6B7280', text: 'Unavailable', dot: '#6B7280' },
            'Surgical intervention': { bg: '#8B5CF6', text: 'Surgical intervention', dot: '#8B5CF6' },
            'In surgery': { bg: '#EAB308', text: 'In surgery', dot: '#EAB308' },
            'Expected hospital stay': { bg: '#8B5CF6', text: 'Expected hospital stay', dot: '#8B5CF6' }
        };
        return statusConfig[status] || { bg: '#6B7280', text: status, dot: '#6B7280' };
    };

    // Custom table styles
    const customTableStyles = {
        table: {
            style: {
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
            },
        },
        headCells: {
            style: {
                fontSize: '14px',
                fontWeight: '600',
                backgroundColor: '#F9FAFB',
                color: '#374151',
                borderBottom: '1px solid #E5E7EB',
                paddingTop: '16px',
                paddingBottom: '16px',
                paddingLeft: '16px',
                paddingRight: '16px',
            },
        },
        rows: {
            style: {
                borderBottom: '1px solid #F3F4F6',
                '&:hover': {
                    backgroundColor: '#F9FAFB',
                    cursor: 'pointer'
                },
                '&:last-child': {
                    borderBottom: 'none'
                }
            },
        },
        cells: {
            style: {
                paddingTop: '16px',
                paddingBottom: '16px',
                paddingLeft: '16px',
                paddingRight: '16px',
                fontSize: '14px',
                color: '#374151'
            },
        },
        pagination: {
            style: {
                borderTop: '1px solid #E5E7EB',
                backgroundColor: '#F9FAFB'
            }
        }
    };

    const renderTooltip = (label) => (props) => (
        <Tooltip id="button-tooltip" {...props}>
            {label} Appointment
        </Tooltip>
    );

    // table data
    const columns = [{
        name: 'No',
        selector: (row, index) => index + 1,
        maxWidth: '80px',
        minWidth: '80px',
        width: '80px',
    }, {
        name: 'Doctor Name',
        selector: row => row.doctorid?.name || '',
        cell: row => (
            <div className="d-flex align-items-center text-truncate gap-3">
                <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                    style={{
                        width: '40px',
                        height: '40px',
                        minWidth: '40px',
                        backgroundColor: '#6366F1',
                        fontSize: '14px'
                    }}
                >
                    {getInitials(row.doctorid?.name)}
                </div>
                <span className="fw-medium" style={{ color: '#111827' }}>{row.doctorid?.name}</span>
            </div>
        ),
    },
    {
        name: 'Reason',
        selector: row => row.appointment_reason || '',
        cell: row => <span style={{ color: '#6B7280', fontSize: '14px' }}>{row.appointment_reason}</span>,
    },
    {
        name: 'Date & Time',
        selector: row => `${row.date || ''} ${row.time || ''}`,
        cell: row => <span style={{ color: '#6B7280', fontSize: '14px' }}>{`${row.date} , ${row.time}`}</span>,
    },
    {
        name: 'Status',
        selector: row => row.status || '',
        cell: row => {
            const statusInfo = getStatusBadge(row.status);
            return (
                <div className="d-flex align-items-center gap-2">
                    <div
                        className="rounded-circle"
                        style={{
                            width: '8px',
                            height: '8px',
                            backgroundColor: statusInfo.dot
                        }}
                    ></div>
                    <span style={{ color: '#6B7280', fontSize: '14px' }}>
                        {statusInfo.text}
                    </span>
                </div>
            );
        },
        width: '120px',
    },
    {
        name: 'Type',
        selector: row => row.visit_types || '',
        cell: row => <span style={{ color: '#6B7280', fontSize: '14px' }}>{row.visit_types}</span>,
    },
    // {
    //     name: 'Payment Status',
    //     selector: row => row.payment_status || '',
    //     cell: row => {
    //         const statusInfo = getStatusBadge(row.payment_status);
    //         return (
    //             <div className="d-flex align-items-center gap-2">
    //                 <div
    //                     className="rounded-circle"
    //                     style={{
    //                         width: '8px',
    //                         height: '8px',
    //                         backgroundColor: statusInfo.dot
    //                     }}
    //                 ></div>
    //                 <span style={{ color: '#6B7280', fontSize: '14px' }}>
    //                     {statusInfo.text}
    //                 </span>
    //             </div>
    //         );
    //     },
    //     width: '150px',
    // },
    {
        name: 'View',
        cell: row => (
            <OverlayTrigger placement="top" overlay={renderTooltip('View Details')}>
                <button
                    className="btn btn-sm p-1"
                    style={{
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: '#6366F1',
                        borderRadius: '6px'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#F3F4F6'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    onClick={() => btnview(row._id)}
                >
                    <MdOutlineRemoveRedEye size={18} />
                </button>
            </OverlayTrigger>
        ),
        width: '80px',
        center: true
    }]
    return (
        <>
            <NavBar logindata={patient} />
            <Container fluid className='p-0 panel'>
                <Row className='g-0'>
                    <P_Sidebar />
                    <Col xs={12} md={10} className='p-3'>
                        {/* <P_nav patientname={patient && patient.name} /> */}
                        <div className='bg-white rounded p-3 mb-3'>
                            <h5 className='mb-3'>All Appointments</h5>
                            <SmartDataTable columns={columns} data={appoint_data ? appoint_data : []} pagination customStyles={customTableStyles} />
                        </div>
                    </Col>
                </Row>
                {/* view single surgery */}
                {
                    single_view && single_view.map((v, i) => {
                        return (
                            <Modal show={show} onHide={handleClose} centered size="lg" key={i}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Appointment Detail</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <Row>
                                        <Col xs={12} md={6}>
                                            <Card className="mb-4 border-light">
                                                <Card.Body>
                                                    <Card.Title className="label_head">Doctor Information</Card.Title>
                                                    <Row>
                                                        <Col xs={12}>
                                                            <div className='label_box'>
                                                                <span className="label_title">Doctor Name:</span>
                                                                <p>{v?.doctorid?.name}</p>
                                                            </div>
                                                        </Col>
                                                        <Col xs={12}>
                                                            <div className='label_box'>
                                                                <span className="label_title">Doctor Specialty:</span>
                                                                <p>{v?.doctorid?.specialty}</p>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col xs={12} md={6}>
                                            <Card className="mb-4 border-light">
                                                <Card.Body>
                                                    <Card.Title className="label_head">Consultation Information</Card.Title>
                                                    <Row>
                                                        <Col xs={12}>
                                                            <div className='label_box'>
                                                                <span className="label_title">Consultation Name:</span>
                                                                <p>{v?.surgerydetails?.name}</p>
                                                            </div>
                                                        </Col>
                                                        <Col xs={12}>
                                                            <div className='label_box'>
                                                                <span className="label_title">Date & Time:</span>
                                                                <p>{v?.date} , {v?.time}</p>
                                                            </div>
                                                        </Col>
                                                        <Col xs={12}>
                                                            <div className='label_box'>
                                                                <span className="label_title">Reason:</span>
                                                                <p>{v?.appointment_reason}</p>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        
                                        {/* Prescription Section */}
                                        {v?.doctor_remark && (
                                            <Col xs={12}>
                                                <Card className="mb-4 border-light">
                                                    <Card.Body>
                                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                                            <Card.Title className="label_head mb-0">Prescription</Card.Title>
                                                            <div className="d-flex gap-2">
                                                                <Button
                                                                    variant="outline-primary"
                                                                    size="sm"
                                                                    onClick={() => window.open(v.doctor_remark, '_blank')}
                                                                    className="d-flex align-items-center gap-2"
                                                                >
                                                                    <MdVisibility size={18} />
                                                                    View PDF
                                                                </Button>
                                                                <Button
                                                                    variant="primary"
                                                                    size="sm"
                                                                    onClick={() => handleDownloadPDF(v.doctor_remark, patient?.name)}
                                                                    className="d-flex align-items-center gap-2"
                                                                >
                                                                    <MdDownload size={18} />
                                                                    Download
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        <div className="border rounded p-2" style={{ backgroundColor: '#f8f9fa' }}>
                                                            <iframe
                                                                src={`https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(v.doctor_remark)}`}
                                                                style={{
                                                                    width: '100%',
                                                                    height: '400px',
                                                                    border: 'none',
                                                                    borderRadius: '4px'
                                                                }}
                                                                title="Prescription PDF"
                                                            />
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        )}
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

export default P_Appointment