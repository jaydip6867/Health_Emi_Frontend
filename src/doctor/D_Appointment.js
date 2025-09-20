import React, { useEffect, useState } from 'react'
import { Badge, Button, Card, Col, Container, Dropdown, Form, ListGroup, ListGroupItem, Modal, OverlayTrigger, Row, Table, Tooltip } from 'react-bootstrap'
import DoctorSidebar from './DoctorSidebar'
import DoctorNav from './DoctorNav'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Loader from '../Loader'
import CryptoJS from "crypto-js";
import Swal from 'sweetalert2'
import SmartDataTable from '../components/SmartDataTable'
import { MdClose, MdDone, MdOutlineAutorenew, MdOutlineRemoveRedEye, MdEdit, MdDelete, MdMoreVert } from 'react-icons/md'
import DatePicker from 'react-datepicker'
import { format } from 'date-fns'

const D_Appointment = () => {
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
            url: 'https://healtheasy-o25g.onrender.com/doctor/appointments/list',
            headers: {
                Authorization: token
            }
        }).then((res) => {
            // console.log(res.data.Data)
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
            url: 'https://healtheasy-o25g.onrender.com/doctor/appointments/changestatus',
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
                title: `Appointment ${s}...`,
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
    const [v, setsingleview] = useState(null);

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
            url: 'https://healtheasy-o25g.onrender.com/doctor/appointments/reschedule',
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
                title: "Appointment Rescheduled Done...",
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

    const renderTooltip = (label) => (props) => (
        <Tooltip id="button-tooltip" {...props}>
            {label} Appointment
        </Tooltip>
    );

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

    // table data
    const columns = [{
        name: 'No',
        cell: (row, index) => index + 1,
        width: '50px'
    }, {
        name: 'Patient Name',
        selector: row => row.patientname,
        cell: row => (
            <div className="d-flex align-items-center gap-3">
                <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                    style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: '#6366F1',
                        fontSize: '14px'
                    }}
                >
                    {getInitials(row.patientname)}
                </div>
                <span className="fw-medium" style={{ color: '#111827' }}>{row.patientname}</span>
            </div>
        ),
        // sortable: true,
    },
    {
        name: 'Diseases',
        selector: row => row.surgerydetails?.name,
        cell: row => (
            <span style={{ color: '#6B7280', fontSize: '14px' }}>
                {row.surgerydetails?.name || 'General Consultation OR Not Specified'}
            </span>
        ),
        // sortable: true,
    },
    {
        name: 'Date & Time',
        selector: row => row.date,
        cell: row => (
            <span style={{ color: '#6B7280', fontSize: '14px' }}>
                {row.date} , {row.time}
            </span>
        ),
        // sortable: true,
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
        // sortable: true,
        width: '120px',
    },
    {
        name: 'Payment Status',
        selector: row => row.payment_status,
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
        // sortable: true,
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
        width: '80px'
    }, {
        name: 'Action',
        cell: row => (
            <div className="d-flex align-items-center gap-1">
                {row.status === "Pending" && (
                    <>
                        <OverlayTrigger placement="top" overlay={renderTooltip('Accept')}>
                            <button
                                className="btn btn-sm p-1"
                                style={{
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    color: '#10B981',
                                    borderRadius: '6px'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#F0FDF4'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                onClick={() => appointmentbtn(row._id, 'Accept')}
                            >
                                <MdDone size={18} />
                            </button>
                        </OverlayTrigger>

                        <OverlayTrigger placement="top" overlay={renderTooltip('Cancel')}>
                            <button
                                className="btn btn-sm p-1"
                                style={{
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    color: '#EF4444',
                                    borderRadius: '6px'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#FEF2F2'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                onClick={() => appointmentbtn(row._id, 'Cancel')}
                            >
                                <MdClose size={18} />
                            </button>
                        </OverlayTrigger>

                        <OverlayTrigger placement="top" overlay={renderTooltip('Reschedule')}>
                            <button
                                className="btn btn-sm p-1"
                                style={{
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    color: '#6B7280',
                                    borderRadius: '6px'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#F3F4F6'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                onClick={() => reschedule_modal(row._id)}
                            >
                                <MdOutlineAutorenew size={18} />
                            </button>
                        </OverlayTrigger>
                    </>
                )}

            </div>
        ),
        width: '130px',
        center: true
    }]


    return (
        <>
            <Container fluid className='p-0 panel'>
                <Row className='g-0'>
                    <DoctorSidebar />
                    <Col xs={12} md={9} lg={10} className='p-3'>
                        <DoctorNav doctorname={doctor && doctor.name} />
                        <div className='bg-white rounded p-2'>
                            <h5 className='mb-4'>All Appointment</h5>
                            <div className='p-3'>
                                <SmartDataTable columns={columns} data={appointment ? appointment : []} pagination customStyles={customTableStyles} />
                            </div>
                        </div>
                    </Col>
                </Row>
                {/* view single surgery */}
                {
                    v && v.map((v, i) => {
                        return (
                            <Modal show={show} onHide={handleClose} centered size="lg" key={i}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Appointment Detail</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <Row className="g-3">
                                        <Col xs={12} md={6}>

                                            {/* <div className="label_box">
                                                <div className="label_head">
                                                    <h5>Patient Information</h5>
                                                </div>
                                                <p><strong>Name:</strong> {v.patientname}</p>
                                                <p><strong>Mobile:</strong> {v.mobile}</p>
                                            </div> */}
                                            <Card className="mb-4 border-light">
                                                <Card.Body>
                                                    <Card.Title className="label_head">Patient Information</Card.Title>
                                                    <Row>
                                                        <Col xs={12}>
                                                            <div className='label_box'>
                                                                <span className="label_title">Name:</span>
                                                                <p>{v?.patientname}</p>
                                                            </div>
                                                        </Col>
                                                        <Col xs={12}>
                                                            <div className='label_box'>
                                                                <span className="label_title">Mobile:</span>
                                                                <p>{v?.mobile}</p>
                                                            </div>
                                                        </Col>
                                                        <Col xs={6}>
                                                            <div className='label_box'>
                                                                <span className="label_title">Blood Group:</span>
                                                                <p>{v?.createdByuser?.blood_group === '' ? 'Not Defined.' : v?.createdByuser?.blood_group}</p>
                                                            </div>
                                                        </Col>
                                                        <Col xs={6}>
                                                            <div className='label_box'>
                                                                <span className="label_title">Gender:</span>
                                                                <p>{v?.createdByuser?.gender === '' ? 'Not Defined.' : v?.createdByuser?.gender}</p>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </Card.Body>
                                            </Card>

                                        </Col>
                                        <Col md={6}>
                                            <Card className="mb-4 border-light">
                                                <Card.Body>
                                                    <Card.Title className="label_head">Surgery Information</Card.Title>
                                                    <Row>
                                                        <Col xs={12}>
                                                            <div className='label_box'>
                                                                <span className="label_title">Surgery:</span>
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
                                        <Col md={4}>
                                            <Card className='border-light text-center'>
                                                <Card.Body>
                                                    <Card.Title className="label_head">Payment Status</Card.Title>
                                                    <Badge className="rounded-pill px-4 py-2 fs-6" bg={v?.payment_status === "Pending" ? "warning" : "success"}>{v.payment_status}</Badge>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={4}>
                                            <Card className='border-light'>
                                                <Card.Body className="text-center">
                                                    <Card.Title className="label_head">Visit Type</Card.Title>
                                                    <div className='label_box'>
                                                        <Badge className="rounded-pill px-4 py-2 fs-6" bg={'secondary'}>{v?.visit_types}</Badge>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={6}>
                                            <Card className="border-light">
                                                <Card.Body>
                                                    <Card.Title className="label_head">Features Available</Card.Title>
                                                    <div className='label_box'>
                                                        <p>{v?.surgerydetails?.additional_features}</p>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={6}>
                                            <Card className="border-light">
                                                <Card.Body>
                                                    <Card.Title className="label_head">Reports</Card.Title>
                                                    {
                                                        v?.report?.length === 0 ? <div className="label_box"><p>No Reports.</p></div> : v?.report?.map((v, i) => {
                                                            return (
                                                                <div className='label_box' key={i}>
                                                                    <iframe src={v?.name}></iframe>
                                                                </div>
                                                            )
                                                        })
                                                    }
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
                                    <Form.Label>New Appointment Date</Form.Label><br />
                                    <DatePicker selected={selectedDate}
                                        onChange={(date) => setSelectedDate(date)}
                                        showTimeSelect
                                        timeFormat="hh:mm a"
                                        timeIntervals={15}
                                        dateFormat="dd-MM-yyyy hh:mm a"
                                        placeholderText="Select date and time"
                                        minDate={new Date()} />
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button onClick={reschedule_appointment}>Reschedule Date</Button>
                                </Modal.Footer>
                            </Modal>
                        )
                    })
                }
            </Container >
            {loading ? <Loader /> : ''
            }
        </>
    )
}

export default D_Appointment