import React, { useEffect, useMemo, useState } from 'react'
import Loader from '../Loader'
import { Col, Container, Modal, Row, Button, Tooltip, OverlayTrigger, Card } from 'react-bootstrap'
import P_Sidebar from './P_Sidebar'
import NavBar from '../Visitor/Component/NavBar'
import FooterBar from '../Visitor/Component/FooterBar'
import CryptoJS from "crypto-js";
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import SmartDataTable from '../components/SmartDataTable'
import { MdOutlineRemoveRedEye, MdVerified } from 'react-icons/md'
import { API_BASE_URL, SECRET_KEY, STORAGE_KEYS } from '../config'
import { BsClipboard } from 'react-icons/bs'
import { FiClock } from "react-icons/fi";

const P_Surgeries = () => {

    var navigate = useNavigate();
    const [loading, setloading] = useState(false)

    const [patient, setpatient] = useState(null)
    const [token, settoken] = useState(null)

    useEffect(() => {
        var getlocaldata = localStorage.getItem(STORAGE_KEYS.PATIENT);
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
    const [activeTab, setActiveTab] = useState('Pending')

    function getappointments(d) {
        axios({
            method: 'get',
            url: `${API_BASE_URL}/user/surgeryappointments`,
            headers: {
                Authorization: token
            }
        }).then((res) => {
            console.log('appointment = ', res.data.Data.docs);
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
        };
        return statusConfig[status] || { bg: '#6B7280', text: status, dot: '#6B7280' };
    };

    // Minimal table inline styles; visuals handled in CSS
    const customTableStyles = {
        table: { backgroundColor: 'transparent', borderRadius: 0, boxShadow: 'none' }
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
        width: '40px',
    }, {
        name: 'Doctor Name',
        selector: row => row.doctorid?.name || '',
        cell: row => (
            <div className="d-flex align-items-center text-truncate gap-3">
                <img
                    src={row.doctorid?.profile_pic}
                    className="rounded-circle appt-avatar"
                />
                <span className="fw-semibold appt-doctor-name">{row.doctorid?.name} <span className="verified"><MdVerified size={16} /></span></span>
            </div>
        ),
    },
    {
        name: 'Surgery Name',
        selector: row => row?.surgerydetails?.name || '',
        cell: row => (
            <div className="d-flex align-items-center gap-2 text-muted small">
                <BsClipboard size={16} className="text-muted" />
                <span className="text-truncate" style={{ maxWidth: 280 }}>{row?.surgerydetails?.name}</span>
            </div>
        ),
    },
    {
        name: 'Price',
        selector: row => `${row?.price || ''}`,
        cell: row => (
            <div className="d-flex align-items-center gap-2 text-muted small">
                <span className="text-muted appt-price">₹</span>
                <span className="text-truncate" style={{ maxWidth: 280 }}>{row?.price}</span>
            </div>
        ),
        // cell: row => <span className=' text-nowrap'>₹{row?.surgerydetails?.price}/-</span>,
    },
    {
        name: 'Date & Time',
        selector: row => `${row?.date || ''} ${row?.time || ''}`,
        cell: row => (
            <div className="d-flex align-items-center gap-2 text-muted small">
                <FiClock size={16} className="text-muted" />
                <span>{`${row.date} , ${row.time}`}</span>
            </div>
        ),
        // cell: row => `${row?.date} ${row?.time}`,
    },
    // {
    //     name: 'Status',
    //     selector: row => row.status || '',
    //     cell: row => {
    //         const statusInfo = getStatusBadge(row.status);
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
    //     width: '120px',
    // },
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
        cell: row => (
            <OverlayTrigger placement="top" overlay={renderTooltip('View Details')}>
                <button
                    className="btn btn-sm p-1 appt-view-btn"
                    onClick={() => btnview(row._id)}
                >
                    <MdOutlineRemoveRedEye size={18} />
                </button>
            </OverlayTrigger>
        ),
        width: '80px',
        center: true
    }]

    // Filter by status based on active tab
    const filteredData = useMemo(() => {
        if (!appoint_data) return []
        const map = {
            'Pending': ['Pending'],
            'Accepted': ['Accept'],
            'Completed': ['Completed'],
            'Cancelled': ['Cancel']
        }
        const allowed = map[activeTab] || []
        return appoint_data.filter(r => allowed.includes(r.status))
    }, [appoint_data, activeTab])

    const counts = useMemo(() => {
        const c = { Pending: 0, Accepted: 0, Completed: 0, Cancelled: 0 }
            ; (appoint_data || []).forEach(r => {
                if (r.status === 'Pending') c.Pending++
                else if (r.status === 'Accept') c.Accepted++
                else if (r.status === 'Completed') c.Completed++
                else if (r.status === 'Cancel') c.Cancelled++
            })
        return c
    }, [appoint_data])
    return (
        <>
            <NavBar logindata={patient} />
            <Container>
                <Row>
                    <P_Sidebar />
                    <Col xs={12} md={9} className='p-3'>
                        {/* <P_nav patientname={patient && patient.name} /> */}
                        <div className='appointments-card p-3 mb-3'>
                            <div className='d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 border-bottom py-3'>
                                <h4 className='mb-0'>Surgery Appointments</h4>
                            </div>
                            <div className='appt-tabs d-flex gap-2 mb-3 flex-wrap'>
                                <button type='button' className={`appt-tab ${activeTab === 'Pending' ? 'active' : ''}`} onClick={() => setActiveTab('Pending')}>Pending <span className='count'>{counts.Pending}</span></button>
                                <button type='button' className={`appt-tab ${activeTab === 'Accepted' ? 'active' : ''}`} onClick={() => setActiveTab('Accepted')}>Accepted <span className='count'>{counts.Accepted}</span></button>
                                <button type='button' className={`appt-tab ${activeTab === 'Completed' ? 'active' : ''}`} onClick={() => setActiveTab('Completed')}>Completed <span className='count'>{counts.Completed}</span></button>
                                <button type='button' className={`appt-tab ${activeTab === 'Cancelled' ? 'active' : ''}`} onClick={() => setActiveTab('Cancelled')}>Cancelled <span className='count'>{counts.Cancelled}</span></button>
                            </div>
                            <SmartDataTable className="appointments-table" columns={columns} data={filteredData} pagination customStyles={customTableStyles} />

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
                                                        <Col xs={6}>
                                                            <div className='label_box'>
                                                                <span className="label_title">Gender:</span>
                                                                <p>{!v?.doctorid?.gender ? 'Not Defined.' : v?.doctorid?.gender}</p>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </Card.Body>
                                            </Card>
                                            <Card className="border-light">
                                                <Card.Body>
                                                    <Card.Title className="label_head">Medical Reports</Card.Title>
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
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col xs={12} lg={6}>
                                            <Card className="mb-4 border-light">
                                                <Card.Body>
                                                    <Card.Title className="label_head">Appointment Schedule</Card.Title>
                                                    <Row>
                                                        <Col xs={12}>
                                                            <div className='label_box'>
                                                                <span className="label_title">Surgery Name:</span>
                                                                <p>{v?.surgerydetails?.name}</p>
                                                            </div>
                                                        </Col>
                                                        <Col xs={12}>
                                                            <div className='label_box'>
                                                                <span className="label_title">Date & TIme</span>
                                                                <p>{v?.date} , {v?.time}</p>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </Card.Body>
                                            </Card>
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