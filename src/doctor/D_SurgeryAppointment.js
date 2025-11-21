import React, { useEffect, useMemo, useState } from 'react'
import { Button, Card, Col, Container, Modal, OverlayTrigger, Row, Tooltip } from 'react-bootstrap'
import DoctorSidebar from './DoctorSidebar'
import DoctorNav from './DoctorNav'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Loader from '../Loader'
import CryptoJS from "crypto-js";
import Swal from 'sweetalert2'
import SmartDataTable from '../components/SmartDataTable'
import { MdClose, MdDone, MdOutlineAutorenew, MdOutlineRemoveRedEye } from 'react-icons/md'
import DatePicker from 'react-datepicker'
import { format } from 'date-fns'
import { API_BASE_URL, SECRET_KEY, STORAGE_KEYS } from '../config'
import { FiClipboard, FiClock } from 'react-icons/fi'
import NavBar from '../Visitor/Component/NavBar'
import FooterBar from '../Visitor/Component/FooterBar'
const D_SurgeryAppointment = () => {
    var navigate = useNavigate();
    const [loading, setloading] = useState(false)

    const [doctor, setdoctor] = useState(null)
    const [token, settoken] = useState(null)


    useEffect(() => {
        var getlocaldata = localStorage.getItem(STORAGE_KEYS.DOCTOR);
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

    const [appointment, setappointment] = useState(null)

    useEffect(() => {
        setloading(true)
        if (doctor) {
            appointmentlist()
        }
    }, [token])

    const appointmentlist = async () => {
        // setloading(true)
        await axios({
            method: 'post',
            url: `${API_BASE_URL}/doctor/surgeryappointments/list`,
            headers: {
                Authorization: token
            }
        }).then((res) => {
            console.log(res.data.Data)
            setappointment(res.data.Data)
        }).catch(function (error) {
            console.log(error);
            // toast(error.response.data.Message,{className:'custom-toast-error'})
        }).finally(() => {
            setloading(false)
        });
    }

    const appointmentbtn = async (id, s) => {
        setloading(true)
        await axios({
            method: 'post',
            url: `${API_BASE_URL}/doctor/surgeryappointments/changestatus`,
            headers: {
                Authorization: token
            },
            data: {
                appointmentid: id,
                status: s
            }
        }).then((res) => {
            // console.log(res)
            Swal.fire({
                title: `Surgery Appointment ${s}...`,
                icon: "success",
            });
            appointmentlist()
        }).catch(function (error) {
            console.log(error);
            // toast(error.response.data.Message,{className:'custom-toast-error'})
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
        var datasingle = appointment.filter((v, i) => { return v._id === id })
        setsingleview(datasingle);
        handleShow()
        console.log(datasingle)
    }

    // reschedule appoinetment date
    const [selectedDate, setSelectedDate] = useState(null);

    const [showreschedule, setrescheduleShow] = useState(false);
    const [schedule_data, setschedule_data] = useState(null);

    const handlerescheduleClose = () => setrescheduleShow(false);
    const handlerescheduleShow = () => setrescheduleShow(true);

    const reschedule_modal = (id) => {
        var data = appointment.filter((v) => {
            return v._id === id
        })
        setschedule_data(data)
        // console.log(data)
        handlerescheduleShow()
        console.log(data)
    }

    const formattedDateTime = selectedDate
        ? format(selectedDate, 'dd-MM-yyyy hh:mm a')
        : '';
    const reschedule_appointment = (date) => {
        // Split at the space before the time
        const [datePart, timePart, meridiem] = formattedDateTime.split(' ');
        // Combine time + meridiem
        const timeWithMeridiem = `${timePart} ${meridiem}`;
        // console.log(apt_data, datePart, timeWithMeridiem )
        // console.log(schedule_data)

        axios({
            method: 'post',
            url: `${API_BASE_URL}/doctor/surgeryappointments/reschedule`,
            headers: {
                Authorization: token
            },
            data: {
                appointmentid: schedule_data[0]._id,
                date: datePart,
                time: timeWithMeridiem
            }
        }).then((res) => {
            // console.log('doctor ', res.data.Data)
            Swal.fire({
                title: "Surgery Appointment Rescheduled Done...",
                icon: "success",
            });
            appointmentlist()
            handlerescheduleClose()
        }).catch(function (error) {
            console.log(error);
        }).finally(() => {
            setloading(false)
        });

    }

    // Generate initials for profile picture fallback
    const getInitials = (name) => {
        if (!name) return 'N/A';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    // Get status badge styling
    const getStatusBadge = (status) => {
        const statusConfig = {
            'Accept': { bg: 'var(--primary-color-600)', text: 'Accepted', dot: 'var(--primary-color-600)' },
            'Pending': { bg: 'var(--secondary-color-600)', text: 'Pending', dot: 'var(--secondary-color-600)' },
            'Cancel': { bg: 'var(--grayscale-color-700)', text: 'Cancelled', dot: 'var(--grayscale-color-700)' },
            'Completed': { bg: 'var(--tertary-color-600)', text: 'Completed', dot: 'var(--tertary-color-600)' },
        };
        return statusConfig[status] || { bg: 'var(--grayscale-color-500)', text: status, dot: 'var(--grayscale-color-500)' };
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
        width: '50px',
    }, {
        name: 'Patient Name',
        selector: row => row.patientname,
        cell: row => (
            <div className="d-flex align-items-center text-truncate gap-3">
                <img
                    // src={row.doctorid?.profile_pic}
                    src={row.patientid?.profile_pic || require('../Visitor/assets/profile_icon_img.png')}
                    alt="Patient"
                    className="rounded-circle appt-avatar"
                />
                <span className="fw-semibold appt-doctor-name">{row?.patientname}</span>
            </div>
        ),
    },
    {
        name: 'Surgery Name',
        selector: row => row.surgerydetails?.name || '',
        cell: row => (
            <div className="d-flex align-items-center gap-2 text-muted small">
                <FiClipboard size={16} />
                <span>{row.surgerydetails?.name}</span>
            </div>
        )
    },
    {
        name: 'Date & Time',
        selector: row => `${row.date || ''} ${row.time || ''}`,
        cell: row => (
            <div className="d-flex align-items-center gap-2 text-muted small">
                <FiClock size={16} className="text-muted" />
                <span>{`${row.date} , ${row.time}`}</span>
            </div>
        ),
    },
    {
        name: 'Amount',
        selector: row => row.status || '',
        cell: row => (
            <div className="d-flex align-items-center gap-2 text-muted small">
                <span className="text-muted appt-price">₹</span>
                <span className="text-truncate"> ₹ {row?.price || '0'}</span>
            </div>
        ),
    },
    {
        name: 'View',
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
    }, {
        name: 'Action',
        cell: row => (
            <div className="d-flex align-items-center gap-1">
                {row.status === "Pending" && (
                    <>
                        <OverlayTrigger placement="top" overlay={renderTooltip('Accept')}>
                            <button
                                className="btn btn-sm p-1 apt_status_btn success"
                                onClick={() => appointmentbtn(row._id, 'Accept')}
                            >
                                <MdDone size={18} />
                            </button>
                        </OverlayTrigger>

                        <OverlayTrigger placement="top" overlay={renderTooltip('Cancel')}>
                            <button
                                className="btn btn-sm p-1 apt_status_btn danger"
                                onClick={() => appointmentbtn(row._id, 'Cancel')}
                            >
                                <MdClose size={18} />
                            </button>
                        </OverlayTrigger>

                        <OverlayTrigger placement="top" overlay={renderTooltip('Reschedule')}>
                            <button
                                className="btn btn-sm p-1 apt_status_btn dark"
                                onClick={() => reschedule_modal(row._id)}
                            >
                                <MdOutlineAutorenew size={18} />
                            </button>
                        </OverlayTrigger>
                    </>
                )}
                {row.status === "Accept" && (
                    <button
                        className="btn btn-sm apt_accept_btn"
                    // onClick={() => handleOpenStartAppointment(row)}
                    >
                        Start Appointment
                    </button>
                )}
                {row.status === "Completed" && (
                    <span className="btn btn-sm apt_complete_btn">Complete</span>
                )}
                {row.status === "Cancel" && (
                    <span className="btn btn-sm apt_cancel_btn">Cancelled</span>
                )}

            </div>
        ),
        width: '150px',
        center: true
    }]

    const [activeTab, setActiveTab] = useState('Pending')

    // Filter by status based on active tab
    const filteredData = useMemo(() => {
        if (!appointment) return []
        const map = {
            'Pending': ['Pending'],
            'Accepted': ['Accept'],
            'Completed': ['Completed'],
            'Cancelled': ['Cancel']
        }
        const allowed = map[activeTab] || []
        return appointment.filter(r => allowed.includes(r.status))
    }, [appointment, activeTab])

    const counts = useMemo(() => {
        const c = { Pending: 0, Accepted: 0, Completed: 0, Cancelled: 0 }
            ; (appointment || []).forEach(r => {
                if (r.status === 'Pending') c.Pending++
                else if (r.status === 'Accept') c.Accepted++
                else if (r.status === 'Completed') c.Completed++
                else if (r.status === 'Cancel') c.Cancelled++
            })
        return c
    }, [appointment])
    return (
        <>
            <NavBar />
            <Container className='my-4'>
                <Row className="align-items-start">
                    <DoctorSidebar />
                    <Col xs={12} md={9}>
                        <div className='appointments-card mb-3'>
                            <div className='d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 border-bottom pb-3'>
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
                            <Modal show={show} onHide={handleClose} centered size="lg" key={i}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Surgery Appointment Detail</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <Row className="p-4">
                                        <Col xs={12} lg={6}>
                                            <Card className="mb-4 border-light">
                                                <Card.Body>
                                                    <Card.Title className="label_head">Patient Information</Card.Title>
                                                    <Row>
                                                        <Col xs={12}>
                                                            <div className='label_box'>
                                                                <span className="label_title">Patient Name:</span>
                                                                <p>{v?.patientname}</p>
                                                            </div>
                                                        </Col>
                                                        <Col xs={12}>
                                                            <div className='label_box'>
                                                                <span className="label_title">Patient Mobile:</span>
                                                                <p>{v?.mobile}</p>
                                                            </div>
                                                        </Col>
                                                        <Col xs={6}>
                                                            <div className='label_box'>
                                                                <span className="label_title">Blood Group:</span>
                                                                <p>{!v?.createdByuser?.blood_group ? 'Not Defined.' : v?.createdByuser?.blood_group}</p>
                                                            </div>
                                                        </Col>
                                                        <Col xs={6}>
                                                            <div className='label_box'>
                                                                <span className="label_title">Gender:</span>
                                                                <p>{!v?.createdByuser?.gender ? 'Not Defined.' : v?.createdByuser?.gender}</p>
                                                            </div>
                                                        </Col>
                                                        {!v?.alt_name ? '' : <Col xs={12}>
                                                            <div className='label_box'>
                                                                <span className="label_title">Alternative Name:</span>
                                                                <p>{v?.alt_name}</p>
                                                            </div>
                                                        </Col>}
                                                        {!v?.alt_mobile ? '' : <Col xs={12}>
                                                            <div className='label_box'>
                                                                <span className="label_title">Alternative Mobile:</span>
                                                                <p>{v?.alt_mobile}</p>
                                                            </div>
                                                        </Col>}
                                                    </Row>
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
                                    </Row>
                                </Modal.Body>
                            </Modal>
                        )
                    })
                }
                {/* reschedule surgery surgery */}
                {
                    schedule_data && schedule_data.map((v, i) => {
                        return (
                            <Modal show={showreschedule} onHide={handlerescheduleClose} centered size="lg" key={i}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Reschedule Surgery</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    {/* <p>Surgery Name :- {v?.surgerydetails.name}</p> */}
                                    {/* <Form.Label>New Appointment Date</Form.Label><br /> */}
                                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                        <h5 >Select New Appointment Date & Time</h5>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            marginBottom: '20px'
                                        }}>
                                            <DatePicker
                                                selected={selectedDate}
                                                onChange={(date) => setSelectedDate(date)}
                                                showTimeSelect
                                                timeFormat="hh:mm aa"
                                                timeIntervals={30}
                                                dateFormat="MMMM d, yyyy h:mm aa"
                                                minDate={new Date()}
                                                inline
                                                calendarClassName="custom-calendar"
                                                className="custom-datepicker"
                                                wrapperClassName="date-picker-wrapper"
                                            />
                                        </div>
                                    </div>
                                    <style jsx global>{`
                                                                            .custom-calendar {
                                                                                border: 1px solid #e0e0e0;
                                                                                border-radius: 8px;
                                                                                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                                                                                padding: 15px;
                                                                                background: white;
                                                                            }
                                                                            .react-datepicker__header {
                                                                                background-color: #f8f9fa;
                                                                                border-bottom: 1px solid #e0e0e0;
                                                                                position: relative;
                                                                                padding-top: 12px;
                                                                                display: flex;
                                                                                justify-content: center;
                                                                                align-items: center;
                                                                            }
                                                                            .react-datepicker__navigation {
                                                                                top: 18px !important;
                                                                                position: absolute;
                                                                                font-weight: 500;
                                                                            }
                                                                            .react-datepicker__day--selected,
                                                                            .react-datepicker__day--keyboard-selected {
                                                                                background-color: #3f51b5;
                                                                                color: white;
                                                                            }
                                                                            .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item--selected {
                                                                                background-color: #3f51b5;
                                                                                color: white;
                                                                            }
                                                                            .react-datepicker__navigation--next,
                                                                            .react-datepicker__navigation--previous {
                                                                                border-color: #3f51b5;
                                                                            }
                                                                            .react-datepicker__navigation--next:hover,
                                                                            .react-datepicker__navigation--previous:hover {
                                                                                border-color: #303f9f;
                                                                            }
                                                                            .custom-calendar .react-datepicker-time__header {
                                                                                color: #fff !important;
                                                                            }
                                                                        `}</style>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button onClick={reschedule_appointment}>Reschedule Date</Button>
                                </Modal.Footer>
                            </Modal>
                        )
                    })
                }
            </Container>
            <FooterBar />
            {loading ? <Loader /> : ''}
        </>
    )
}

export default D_SurgeryAppointment