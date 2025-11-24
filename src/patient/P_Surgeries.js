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
import { FiClock, FiMail, FiPhone } from "react-icons/fi";
import Swal from 'sweetalert2'
import { AiFillStar, AiOutlineStar } from 'react-icons/ai'

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

    // review modal state
    const [showReview, setShowReview] = useState(false)
    const [reviewTitle, setReviewTitle] = useState('')
    const [reviewDesc, setReviewDesc] = useState('')
    const [reviewRating, setReviewRating] = useState(0)
    const [reviewTargetId, setReviewTargetId] = useState(null)
    const [submittingReview, setSubmittingReview] = useState(false)

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

    function openReviewModal(appointmentId) {
        setReviewTargetId(appointmentId)
        setShowReview(true)
    }

    function closeReviewModal() {
        if (submittingReview) return
        setShowReview(false)
        setReviewTitle('')
        setReviewDesc('')
        setReviewRating(0)
        setReviewTargetId(null)
    }

    async function submitSurgeryReview(e) {
        e && e.preventDefault()
        if (!reviewTargetId || !reviewTitle || !reviewDesc || !reviewRating) {
            Swal.fire({ title: 'Please complete all fields', icon: 'warning' })
            return
        }
        try {
            setSubmittingReview(true)
            await axios({
                method: 'post',
                url: `${API_BASE_URL}/user/surgeryappointments/review`,
                headers: { Authorization: token },
                data: {
                    appointmentid: reviewTargetId,
                    title: reviewTitle,
                    description: reviewDesc,
                    rating: reviewRating,
                }
            })
            Swal.fire({ title: 'Review submitted', icon: 'success' })
            closeReviewModal()
        } catch (error) {
            console.log(error)
            Swal.fire({ title: error?.response?.data?.Message || 'Failed to submit review', icon: 'error' })
        } finally {
            setSubmittingReview(false)
        }
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
                <span className="fw-semibold appt-doctor-name" >{row.doctorid?.name} <span className="verified"><MdVerified size={16} /></span></span>
            </div>
        ),
    },
    {
        name: 'Surgery Name',
        selector: row => row?.surgerydetails?.name || '',
        cell: row => (
            <div className="d-flex align-items-center gap-2 text-muted">
                <BsClipboard size={16} className="text-muted" />
                <span className="text-truncate" style={{ maxWidth: 280 }}>{row?.surgerydetails?.name}</span>
            </div>
        ),
    },
    {
        name: 'Price',
        selector: row => `${row?.price || ''}`,
        cell: row => (
            <div className="d-flex align-items-center gap-2 text-muted">
                <span className="text-muted appt-price">₹</span>
                <span className="text-truncate">{row?.price}</span>
            </div>
        ),
        // cell: row => <span className=' text-nowrap'>₹{row?.surgerydetails?.price}/-</span>,
    },
    {
        name: 'Date & Time',
        selector: row => `${row?.date || ''} ${row?.time || ''}`,
        cell: row => (
            <div className="d-flex align-items-center gap-2 text-muted">
                <FiClock size={16} className="text-muted" />
                <span>{`${row.date} , ${row.time}`}</span>
            </div>
        ),
    },
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
                    <P_Sidebar patient={patient} />
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
                        const fee = Number(v?.price || 0);
                        const status = getStatusBadge(v?.status);
                        return (
                            <Modal show={show} onHide={handleClose} centered size="lg" key={i}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Surgery Appointment Detail</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <div className='p-2 rounded-3 border rounded' style={{ background: 'var(--white)' }}>
                                        {/* Header: Doctor block and badges */}
                                        <div className='d-flex flex-wrap align-items-center justify-content-between gap-3 p-3'>
                                            <div className='d-flex align-items-center gap-3'>
                                                <img src={v?.doctorid?.profile_pic} className='rounded-3' style={{ width: 72, height: 72, objectFit: 'cover' }} />
                                                <div>
                                                    <div className='d-flex align-items-center gap-2 flex-wrap'>
                                                        <h5 className='mb-0'>{v?.doctorid?.name}</h5>
                                                        <span className='text-primary d-inline-flex align-items-center' title='Verified'>
                                                            <MdVerified size={18} fill='#0697B8' />
                                                        </span>
                                                    </div>
                                                    <div className='text-muted small'><FiMail className='me-1' /> {v?.doctorid?.email}</div>
                                                    <div className='text-muted small'><FiPhone className='me-1' /> +91 {v?.doctorid?.mobile}</div>
                                                </div>
                                            </div>
                                            <div className='d-flex align-items-center text-center gap-3 flex-wrap appointment_model'>
                                                <div>
                                                    <p className='mb-0'>Ward Type</p>
                                                    <span className='badge d-inline-flex align-items-center gap-2' style={{ background: '#F1F5F8', color: '#253948' }}>{v?.roomtype}</span>
                                                </div>
                                                <div>
                                                    <p className='mb-0'>Surgery Status</p>
                                                    <span className='badge d-inline-flex align-items-center gap-2' style={{ background: '#E8F7EE', color: '#1F9254' }}>
                                                        {status.text}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className='mb-0'>Consultation Fee</p>
                                                    <span className='badge' style={{ background: '#E04F16', color: '#fff' }}>₹ {fee}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Summary row */}
                                        <div className='border rounded p-3 mt-3'>
                                            <Row className='g-3'>
                                                <Col md={6} xs={12}>
                                                    <div className='text-muted small mb-1'>Clinic Name</div>
                                                    <div className='d-flex align-items-center gap-2'>
                                                        <span>{v?.surgerydetails?.name}</span>
                                                    </div>
                                                </Col>
                                                <Col md={6} xs={12}>
                                                    <div className='text-muted small mb-1'>Appointment Date & Time</div>
                                                    <div className='d-flex align-items-center gap-2'>
                                                        <FiClock />
                                                        <span>{v?.date}, {v?.time}</span>
                                                    </div>
                                                </Col>

                                                <Col md={6} xs={12}>
                                                    <div className='text-muted small mb-1'>Clinic Name</div>
                                                    <div className='d-flex align-items-center gap-2'>
                                                        <span className='text-truncate'>{v?.hospitalname || '-'}</span>
                                                    </div>
                                                </Col>
                                                <Col md={6} xs={12}>
                                                    <div className='text-muted small mb-1'>Clinic Address</div>
                                                    <div className='d-flex align-items-center gap-2'>
                                                        <span className='text-truncate'>{v?.clinicLocation || '-'}</span>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </div>
                                        <hr />
                                        {/* Reports */}
                                        <div className='mt-3'>
                                            <div className='fw-semibold mb-3'>Reports</div>
                                            <Row className='g-3'>
                                                {(v?.report || []).length > 0 ? (
                                                    v.report.map((url, idx) => (
                                                        <Col md={4} sm={6} xs={12} key={idx}>
                                                            <Card className='h-100'>
                                                                <div className='ratio ratio-16x9 bg-light'>
                                                                    <iframe src={url} title={`report_${idx}`} className='w-100 h-100 border-0'></iframe>
                                                                </div>
                                                                <Card.Body className='d-flex justify-content-between align-items-center'>
                                                                    <div className='small text-muted'>Report {idx + 1}</div>
                                                                    <Button size='sm' variant='outline-primary' onClick={() => window.open(url, '_blank')}>View</Button>
                                                                </Card.Body>
                                                            </Card>
                                                        </Col>
                                                    ))
                                                ) : (
                                                    <Col xs={12}>
                                                        <div className='text-muted small'>No reports uploaded.</div>
                                                    </Col>
                                                )}
                                            </Row>
                                        </div>
                                        <hr />
                                        {/* Prescription */}
                                        <div >
                                            <div className='fw-semibold mb-3'>Prescription</div>
                                            <div className='border rounded p-3 mt-3 col-lg-5 col-md-9 col-12'>
                                                {v?.doctor_remark ? (
                                                    <>
                                                        {/* <div className='d-flex gap-2 mb-2'>
                                    <Button variant='outline-primary' size='sm' onClick={() => window.open(v.doctor_remark, '_blank')} className='d-flex align-items-center gap-2'>
                                      <MdVisibility size={18} /> View
                                    </Button>
                                    <Button variant='primary' size='sm' onClick={() => handleDownloadPDF(v.doctor_remark, patient?.name)} className='d-flex align-items-center gap-2'>
                                      <MdDownload size={18} /> Download
                                    </Button>
                                  </div> */}
                                                        <div className='border rounded' style={{ backgroundColor: '#f8f9fa' }}>
                                                            <iframe
                                                                src={`https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(v.doctor_remark)}`}
                                                                style={{ width: '100%', height: '200px', border: 'none', borderRadius: '4px' }}
                                                                title='Prescription PDF'
                                                            />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className='text-muted small'>No prescription uploaded.</div>
                                                )}
                                            </div>
                                            {
                                                v.status === "Completed" ? <div className='d-flex justify-content-end mt-4'>
                                                    <Button variant='primary' onClick={() => openReviewModal(v?._id)}>Write a Review</Button>
                                                </div> : ''
                                            }
                                        </div>
                                    </div>

                                </Modal.Body>
                                {/* <Modal.Body>
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
                                </Modal.Body> */}
                            </Modal>
                        )
                    })
                }
            </Container >
            {/* Review Modal */}
            <Modal show={showReview} onHide={closeReviewModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Write a Review</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={submitSurgeryReview}>
                        <div className='mb-3'>
                            <label className='form-label'>Title</label>
                            <input
                                type='text'
                                className='form-control'
                                value={reviewTitle}
                                onChange={(e) => setReviewTitle(e.target.value)}
                                placeholder='Great experience'
                            />
                        </div>
                        <div className='mb-3'>
                            <label className='form-label'>Description</label>
                            <textarea
                                className='form-control'
                                rows={4}
                                value={reviewDesc}
                                onChange={(e) => setReviewDesc(e.target.value)}
                                placeholder='Share details about your surgery process'
                            />
                        </div>
                        <div className='mb-3'>
                            <label className='form-label me-2'>Rating</label>
                            <div className='d-inline-flex gap-1 align-items-center'>
                                {[1, 2, 3, 4, 5].map(n => (
                                    <button key={n} type='button' className='btn btn-link p-0' onClick={() => setReviewRating(n)} aria-label={`Rate ${n} star`}>
                                        {reviewRating >= n ? <AiFillStar size={22} color="#f5a623" /> : <AiOutlineStar size={22} color="#f5a623" />}
                                    </button>
                                ))}
                                <span className='ms-2 small text-muted'>{reviewRating} / 5</span>
                            </div>
                        </div>
                        <div className='d-flex justify-content-end gap-2'>
                            <Button variant='secondary' onClick={closeReviewModal} disabled={submittingReview}>Cancel</Button>
                            <Button variant='primary' type='submit' disabled={submittingReview}>
                                {submittingReview ? 'Submitting...' : 'Submit Review'}
                            </Button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>
            {loading ? <Loader /> : ''
            }
            <FooterBar />
        </>
    )
}

export default P_Surgeries