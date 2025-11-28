import React, { useEffect, useMemo, useState } from 'react'
import Loader from '../Loader'
import { Button, Card, Col, Container, Modal, OverlayTrigger, Row, Tooltip } from 'react-bootstrap'
import P_Sidebar from './P_Sidebar'
import NavBar from '../Visitor/Component/NavBar'
import FooterBar from '../Visitor/Component/FooterBar'
import CryptoJS from "crypto-js";
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import SmartDataTable from '../components/SmartDataTable'
import { BsCameraVideo, BsClipboard } from 'react-icons/bs'
import { PiHospital } from "react-icons/pi";
import { HiOutlineHome } from "react-icons/hi";
import { MdOutlineRemoveRedEye, MdDownload, MdVisibility, MdVerified, MdClose } from 'react-icons/md'
import { API_BASE_URL, SECRET_KEY, STORAGE_KEYS } from '../config'
import { FiClock, FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import Swal from 'sweetalert2'
import { AiFillStar, AiOutlineStar } from 'react-icons/ai'

const P_Appointment = () => {

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
      url: `${API_BASE_URL}/user/appointments`,
      headers: {
        Authorization: token
      }
    }).then((res) => {
      // console.log('appointment = ', res.data.Data);
      setappoint(res.data.Data)
    }).catch(function (error) {
      // console.log(error);
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

  async function submitAppointmentReview(e) {
    e && e.preventDefault()
    if (!reviewTargetId || !reviewTitle || !reviewDesc || !reviewRating) {
      Swal.fire({ title: 'Please complete all fields', icon: 'warning' })
      return
    }
    try {
      setSubmittingReview(true)
      await axios({
        method: 'post',
        url: `${API_BASE_URL}/user/appointments/review`,
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
      // console.log(error)
      Swal.fire({ title: error?.response?.data?.Message || 'Failed to submit review', icon: 'error' })
    } finally {
      setSubmittingReview(false)
    }
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

  // Get status badge styling (using CSS variables)
  const getStatusBadge = (status) => {
    const statusConfig = {
      'Accept': { bg: 'var(--primary-color-600)', text: 'Accepted', dot: 'var(--primary-color-600)' },
      'Pending': { bg: 'var(--secondary-color-600)', text: 'Pending', dot: 'var(--secondary-color-600)' },
      'Cancel': { bg: 'var(--grayscale-color-700)', text: 'Cancelled', dot: 'var(--grayscale-color-700)' },
      'Completed': { bg: 'var(--tertary-color-600)', text: 'Completed', dot: 'var(--tertary-color-600)' },
    };
    return statusConfig[status] || { bg: 'var(--grayscale-color-500)', text: status, dot: 'var(--grayscale-color-500)' };
  };

  // Appointment type pill
  const getTypePill = (type) => {
    const t = (type || '').toLowerCase()
    if (t.includes('clinic')) return { label: 'Clinic Visit', cls: 'badge-type badge-type--clinic', icon: <PiHospital size={16} /> }
    if (t.includes('home')) return { label: 'Home Visit', cls: 'badge-type badge-type--home', icon: <HiOutlineHome size={16} /> }
    return { label: type || 'EOPD', cls: 'badge-type badge-type--eopd', icon: <BsCameraVideo size={16} /> }
  }

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
    width: '50px',
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
    name: 'Reason',
    selector: row => row.appointment_reason || '',
    cell: row => (
      <div className="d-flex align-items-center gap-2 text-muted">
        <BsClipboard size={16} className="text-muted" />
        <span className="text-truncate" style={{ maxWidth: 280 }}>{row.appointment_reason}</span>
      </div>
    ),
  },
  {
    name: 'Date & Time',
    selector: row => `${row.date || ''} ${row.time || ''}`,
    cell: row => (
      <div className="d-flex align-items-center gap-2 text-muted">
        <FiClock size={16} className="text-muted" />
        <span>{`${row.date} , ${row.time}`}</span>
      </div>
    ),
  },
  {
    name: 'Type',
    selector: row => row.visit_types || '',
    cell: row => {
      const t = getTypePill(row.visit_types)
      return (
        <span className={t.cls}>
          {t.icon}
          {t.label}
        </span>
      )
    },
  },
  {
    name: 'Action',
    cell: row => (
      <div className='d-inline-flex gap-2 align-items-center'>
        <OverlayTrigger placement="top" overlay={renderTooltip('View Details')}>
          <button
            className="btn btn-sm p-1 appt-view-btn"
            onClick={() => btnview(row._id)}
          >
            <MdOutlineRemoveRedEye size={18} />
          </button>
        </OverlayTrigger>
        {row.status === "Pending" && (
          <OverlayTrigger placement="top" overlay={renderTooltip('Cancel')}>
            <button
              className="btn btn-sm p-1 apt_status_btn danger"
              onClick={() => appointmentbtn(row._id)}
            >
              <MdClose size={18} />
            </button>
          </OverlayTrigger>
        )}
      </div>

    ),
    width: '80px',
    center: true
  }]

  const appointmentbtn = async (id, s) => {
    await Swal.fire({
      title: "Are you sure?",
      text: "You Want to Cancel this Appointment?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "var(--primary-color-600)",
      cancelButtonColor: "#ff0000",
      confirmButtonText: "Yes, Cancel it!"
    }).then((result) => {
      if (result.isConfirmed) {
        axios({
          method: 'post',
          url: `${API_BASE_URL}/user/appointments/cancel`,
          headers: {
            Authorization: token
          },
          data: {
            appointmentid: id,
          }
        }).then((res) => {
          getappointments();
        }).catch(function (error) {
          // console.log(error);
          // toast(error.response.data.Message,{className:'custom-toast-error'})
        }).finally(() => {
          Swal.fire({
            title: "Deleted!",
            text: "Your file has been deleted.",
            icon: "success"
          });
        });
      }
    });

  }

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
        <Row className='align-items-start'>
          <P_Sidebar patient={patient} />
          <Col xs={12} md={9} className='p-3'>
            {/* <P_nav patientname={patient && patient.name} /> */}
            <div className='appointments-card p-3 mb-3 position-sticky top-0'>
              <div className='d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 border-bottom py-3'>
                <h4 className='mb-0'>Consultation Appointments</h4>
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
        {/* Appointment detail modal */}
        {
          single_view && single_view.map((v, i) => {
            const typePill = getTypePill(v?.visit_types);
            const status = getStatusBadge(v?.status);
            const hospital = (v?.doctorid?.hospitals && v?.doctorid?.hospitals[0]) || {};
            const clinicName = hospital?.name || v?.surgerydetails?.surgerytype || '-';
            const clinicLocation = [hospital?.address, hospital?.city, hospital?.state].filter(Boolean).join(', ');
            const fee = Number(v?.totalamount || 0);
            return (
              <Modal show={show} onHide={handleClose} centered size="lg" key={i}>
                <Modal.Header closeButton>
                  <Modal.Title>Appointment Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <div className='p-2 rounded-3' style={{ background: 'var(--white)' }}>
                    {/* Header: Doctor block and badges */}
                    <div className='d-flex flex-wrap align-items-center justify-content-between gap-3 border rounded p-3'>
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
                          <p className='mb-0'>Visit Type</p>
                          <span className='badge d-inline-flex align-items-center gap-2' style={{ background: '#F1F5F8', color: '#253948' }}>{typePill.icon}{typePill.label}</span>
                        </div>
                        <div>
                          <p className='mb-0'>Consultation Status</p>
                          <span className='badge' style={{ background: '#E8F7EE', color: '#1F9254' }}>
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
                          <div className='text-muted small mb-1'>Appointment Date & Time</div>
                          <div className='d-flex align-items-center gap-2'>
                            <FiClock />
                            <span>{v?.date}, {v?.time}</span>
                          </div>
                        </Col>
                        <Col md={6} xs={12}>
                          <div className='text-muted small mb-1'>Clinic Name</div>
                          <div className='d-flex align-items-center gap-2'>
                            <PiHospital size={18} />
                            <span>{clinicName}</span>
                          </div>
                        </Col>
                        <Col md={6} xs={12}>
                          <div className='text-muted small mb-1'>Clinic Location</div>
                          <div className='d-flex align-items-center gap-2'>
                            <FiMapPin />
                            <span className='text-truncate'>{clinicLocation || '-'}</span>
                          </div>
                        </Col>
                        <Col md={6} xs={12}>
                          <div className='text-muted small mb-1'>Consultation Reason</div>
                          <div className='text-truncate'>{v?.appointment_reason || '-'}</div>
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
                                  {/* Fallback thumbnail - attempting to render image/embed */}
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
                      v.status === "Completed" && v?.is_review === false ? (
                        <div className='d-flex justify-content-end mt-4'>
                          <Button variant='primary' onClick={() => openReviewModal(v?._id)}>Write a Review</Button>
                        </div>
                      ) : null
                    }
                  </div>
                </Modal.Body>
              </Modal>
            )
          })
        }

        {/* Review Modal */}
        <Modal show={showReview} onHide={closeReviewModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>Write a Review</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={submitAppointmentReview}>
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
                  placeholder='Share details about your consultation'
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

      </Container>
      {loading ? <Loader /> : ''}
      <FooterBar />
    </>
  )

}
export default P_Appointment