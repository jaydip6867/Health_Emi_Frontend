import { Card, Col, Row } from "react-bootstrap"
import { MdCalendarMonth } from "react-icons/md"
import { FaStar } from "react-icons/fa6"
import { CiLocationOn } from "react-icons/ci";
import defaultDoctorImg from "../../assets/image/doctor_img.jpg"
import { useNavigate } from "react-router-dom"

const DoctorListComponents = ({ details }) => {
    const navigate = useNavigate();
    // console.log(details)
    return (
        <>
            <Card text="secondary" className="my-3 rounded-4 doctor_card doctor-card-v2 overflow-hidden">
                <div className="position-relative">
                    <img
                        src={details?.profile_pic || defaultDoctorImg}
                        alt={`Dr. ${details?.name || 'Doctor'}`}
                        className="w-100 doctor-card-img"
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = defaultDoctorImg; }}
                    />
                    <div className="rating-badge-orange d-inline-flex align-items-center gap-2 position-absolute top-0 start-0 m-3 px-2 py-1 rounded-3">
                        <FaStar size={14} className="text-white" />
                        <small className="fw-bold text-white fs-7">{details?.averageRating === 0 ? '0' : details?.averageRating + '.0'}</small>
                    </div>
                </div>

                <Card.Body className="pt-3 pb-4 px-0">
                    <div className="d-flex align-items-center justify-content-between mb-2 pe-2">
                        <div className="spec-chip d-inline-flex align-items-center" style={{width: '60%'}}>
                            <small className="fw-semibold text-truncate">{details?.specialty || 'Specialist'}</small>
                        </div>
                        <div className="chip chip-available">
                            {details?.is_available === true ? <small className="fw-semibold fs-7 px-2 py-1 rounded-3" style={{backgroundColor: '#EDF9F0', color: '#04BD6C'}}>Available</small> : <small className="fw-semibold fs-7 px-2 py-1 rounded-3" style={{backgroundColor: '#ebebebff', color: '#797979ff'}}>Unavailable</small>}
                        </div>
                    </div>

                    <div className="px-3">
                        <h5 className="mb-2 doctor_name">Dr. {details?.name}</h5>
                        <div className="d-flex align-items-start mb-3 location">
                            <CiLocationOn className="me-1 pt-1 fs-6" />
                            <small>
                                {details?.city}{details?.city ? ', ' : ''}{details?.state}
                            </small>
                        </div>

                        <div className="dotted-divider my-3"></div>

                        <Row className="align-items-center g-2 consultation_fees justify-content-between">
                            <Col xs="auto">
                                <small className="small">Consultation Fees</small>
                                <div className="fees-amount">₹ {details?.consultationsDetails?.clinic_visit_price || 0}</div>
                            </Col>
                            <Col xs="auto" className="text-end">
                                <button onClick={() => navigate(`/doctorprofile/${encodeURIComponent(btoa(details._id))}`)} className="btn-book px-4 py-2 d-flex align-items-center gap-2 ">
                                    <MdCalendarMonth size={16} />
                                    <span className="d-block text-nowrap">Book Now</span>
                                </button>
                            </Col>
                        </Row>
                    </div>

                    {/* <Link to={`/doctorprofile/${encodeURIComponent(btoa(details._id))}`} className="m-0 stretched-link"></Link> */}
                </Card.Body>
            </Card>
        </>
    )
}

export default DoctorListComponents