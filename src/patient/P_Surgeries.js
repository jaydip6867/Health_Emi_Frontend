import React, { useEffect, useState } from 'react'
import Loader from '../Loader'
import { Col, Container, Modal, Row, Button, Form, Tooltip, OverlayTrigger } from 'react-bootstrap'
import P_Sidebar from './P_Sidebar'
import P_nav from './P_nav'
import NavBar from '../Visitor/Component/NavBar'
import FooterBar from '../Visitor/Component/FooterBar'
import CryptoJS from "crypto-js";
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import DataTable from 'react-data-table-component'
import { MdCurrencyRupee, MdOutlineRemoveRedEye } from 'react-icons/md'

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
        sortable: true,
        width: '80px'
    }, {
        name: 'Doctor Name',
        cell: row => (
            <div className="d-flex align-items-center flex-wrap gap-3">
                <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                    style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: '#6366F1',
                        fontSize: '14px'
                    }}
                >
                    {getInitials(row.doctorid?.name)}
                </div>
                <span className="fw-medium" style={{ color: '#111827' }}>{row.doctorid?.name}</span>
            </div>
        )
    },
    {
        name: 'Surgery',
        cell: row => row?.surgerydetails?.name
    },
    {
        name: 'Price',
        cell: row => {
            return `₹ ${row?.surgerydetails?.price} /-`
        }
    },
    {
        name: 'Date & Time',
        cell: row => `${row?.date} ${row?.time}`
    },
    {
        name: 'Status',
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
        width: '120px'
    },
    {
        name: 'Payment Status',
        cell: row => {
            const statusInfo = getStatusBadge(row.payment_status);
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
        width: '150px'
    },
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
                    <Col xs={12} sm={9} lg={10} className='p-3'>
                        {/* <P_nav patientname={patient && patient.name} /> */}
                        <div className='bg-white rounded p-3 mb-3'>
                            <h5 className='mb-3'>All Surgery Appointments</h5>
                            <DataTable columns={columns} data={appoint_data ? appoint_data : ''} pagination customStyles={customTableStyles} />

                        </div>
                    </Col>
                </Row>
                {/* view single surgery */}
                {
                    single_view && single_view.map((v, i) => {
                        return (
                            <Modal show={show} onHide={handleClose} centered size="xl" key={i}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Surgery Appointment Detail</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <Row className="p-4">
                                        <Col xs={12} lg={6}>
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
                                        <Col xs={12} lg={6}>
                                            <div className="bg-light rounded p-3 h-100 shadow">
                                                <h6 className="text-muted mb-3">Medical Reports</h6>
                                                {Array.isArray(v.report) ? (
                                                    <div className="d-flex flex-column gap-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                                        {v.report?.map((r, i) => {
                                                            // Determine file type based on URL extension
                                                            const fileExtension = r.split('.').pop().toLowerCase();
                                                            const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension);
                                                            const isPdf = fileExtension === 'pdf';

                                                            return (
                                                                <div key={i} className="border rounded p-2 bg-white">
                                                                    {isImage ? (
                                                                        <div className="text-center">
                                                                            <img
                                                                                src={r}
                                                                                alt={`Report ${i + 1}`}
                                                                                className="img-fluid rounded"
                                                                                style={{ maxHeight: '200px', cursor: 'pointer' }}
                                                                                onClick={() => window.open(r, '_blank')}
                                                                            />
                                                                            <div className="mt-2">
                                                                                <small className="text-muted">Image Report {i + 1}</small>
                                                                                <br />
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="outline-primary"
                                                                                    onClick={() => {
                                                                                        const link = document.createElement('a');
                                                                                        link.href = r;
                                                                                        link.download = `report_${i + 1}.${fileExtension}`;
                                                                                        link.click();
                                                                                    }}
                                                                                >
                                                                                    Download
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div>
                                                                            <div className="d-flex align-items-center justify-content-between mb-2">
                                                                                <div className="d-flex align-items-center">
                                                                                    <i className="bi bi-file-earmark-pdf text-danger me-2" style={{ fontSize: '24px' }}></i>
                                                                                    <div>
                                                                                        <strong>Report {i + 1}</strong>
                                                                                        <br />
                                                                                        {/* <small className="text-muted">.{fileExtension} file</small> */}
                                                                                    </div>
                                                                                </div>
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="success"
                                                                                    onClick={() => {
                                                                                        const link = document.createElement('a');
                                                                                        link.href = r;
                                                                                        link.download = `report_${i + 1}.${fileExtension}`;
                                                                                        link.click();
                                                                                    }}
                                                                                >
                                                                                    Download
                                                                                </Button>
                                                                            </div>
                                                                            <div className="border rounded" style={{ height: '300px' }}>
                                                                                <iframe
                                                                                    src={`https://docs.google.com/gview?url=${r}&embedded=true`}
                                                                                    width="100%"
                                                                                    height="100%"
                                                                                    style={{ borderRadius: '4px', border: 'none' }}
                                                                                    title={`Report ${i + 1}`}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <div className="text-center text-muted py-4">
                                                        <i className="bi bi-file-earmark-x" style={{ fontSize: '48px' }}></i>
                                                        <p className="mt-2">No reports uploaded</p>
                                                    </div>
                                                )}
                                            </div>
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