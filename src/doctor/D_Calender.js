import React, { useEffect, useState } from 'react'
import { Col, Container, Modal, Row, Card, Badge } from 'react-bootstrap'
import DoctorSidebar from './DoctorSidebar'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Loader from '../Loader'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import CryptoJS from "crypto-js";
import { API_BASE_URL, SECRET_KEY, STORAGE_KEYS } from '../config';
import NavBar from '../Visitor/Component/NavBar'
import FooterBar from '../Visitor/Component/FooterBar'

dayjs.extend(utc);

const D_Calender = () => {
    var navigate = useNavigate();
    const [loading, setloading] = useState(false)

    const [doctor, setdoctor] = useState(null)
    const [token, settoken] = useState(null)

    const [appointment, setappointment] = useState(null)

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

    useEffect(() => {
        setloading(true)
        if (doctor) {
            setTimeout(() => {
                appointmentlist()
            }, 200);
            // console.log(appointment)
        }
    }, [token])

    function appointmentlist() {
        // setloading(true)
        axios({
            method: 'post',
            url: `${API_BASE_URL}/doctor/appointments/list`,
            headers: {
                Authorization: token
            }
        }).then((res) => {

            // console.log(res.data.Data)
            const formattedAppointments = res.data.Data.map((item) => {
                const [day, month, year] = item.date.split("-");
                const fullDate = `${year}-${month}-${day} ${item.time}`;

                // Convert to UTC ISO format for FullCalendar
                const start = dayjs.utc(fullDate).toISOString();

                return {
                    ...item,
                    title: item.patientname, // Optional: for FullCalendar display
                    start,                   // This is what FullCalendar needs
                };
            });
            setappointment(formattedAppointments);
        }).catch(function (error) {
        }).finally(() => {
            setloading(false)
        });
    }



    const [showModal, setShowModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    // Click on existing event
    const handleEventClick = (clickInfo) => {
        setSelectedAppointment({
            title: clickInfo.appointment.name,
            start: clickInfo.appointment.start,
            end: clickInfo.event.endStr,
            id: clickInfo.event.id,
        });
        setShowModal(true);
    };

    // Click on empty time slot
    const handleDateClick = (info) => {
        setSelectedAppointment({
            title: 'New Appointment',
            start: info.dateStr,
            end: null,
        });
        setShowModal(true);
    };
    return (
        <>
        <NavBar logindata={doctor}/>
            <Container className='my-4'>
                <Row className='align-items-start'>
                    <DoctorSidebar doctor={doctor} />
                    <Col xs={12} lg={9}>
                        {/* Calendar Header */}
                        <div className='appointments-card mb-3'>
                            <div className='d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 border-bottom pb-3'>
                                <h4>All Appointments</h4>
                                <Badge text='white' className='apt_accept_btn'>
                                    {appointment ? appointment.length : 0} Appointments
                                </Badge>
                            </div>
                        </div>

                        {/* Calendar Container */}
                        <Card className='border-0 shadow-sm'>
                            <Card.Body>
                                <style>
                                    {`
                                        .fc {
                                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                                        }
                                        .fc-header-toolbar {
                                            margin-bottom: 1.5rem !important;
                                            padding: 1rem;
                                            background: var(--white) !important;
                                            border: 1px solid #e5e7eb !important;
                                            border-radius: 12px !important;
                                            box-shadow: 0 2px 8px rgba(0,0,0,0.06) !important;
                                        }
                                        .fc-toolbar-title {
                                            color: #253948 !important;
                                            font-size: 1.25rem !important;
                                            font-weight: 600 !important;
                                        }
                                        .fc-toolbar {
                                            flex-wrap: wrap;
                                            gap: 0.5rem;
                                        }
                                        .fc-button {
                                            background: var(--white) !important;
                                            border: 1px solid #e5e7eb !important;
                                            color: #6b7280 !important;
                                            border-radius: 8px !important;
                                            padding: 0.375rem 0.75rem !important;
                                            margin: 0 0.25rem !important;
                                            font-weight: 500 !important;
                                            font-size: 0.875rem !important;
                                            transition: all 0.2s ease !important;
                                            box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
                                        }
                                        .fc-button:hover {
                                            background: #f8fafc !important;
                                            border-color: var(--primary-color-500) !important;
                                            color: var(--primary-color-600) !important;
                                            box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
                                        }
                                        .fc-button-active {
                                            background: var(--primary-color-600) !important;
                                            border-color: var(--primary-color-600) !important;
                                            color: var(--white) !important;
                                            box-shadow: 0 2px 4px rgba(0,0,0,0.15) !important;
                                        }
                                        .fc-daygrid-day {
                                            transition: all 0.2s ease !important;
                                            cursor: pointer !important;
                                            border: 1px solid #f3f4f6 !important;
                                        }
                                        .fc-daygrid-day:hover {
                                            background: #f8fafc !important;
                                            border-color: var(--primary-color-200) !important;
                                            box-shadow: 0 2px 8px rgba(0,0,0,0.05) !important;
                                        }
                                        .fc-daygrid-day-number {
                                            transition: all 0.2s ease !important;
                                            color: #374151 !important;
                                            font-weight: 500 !important;
                                        }
                                        .fc-daygrid-day:hover .fc-daygrid-day-number {
                                            color: var(--primary-color-600) !important;
                                            font-weight: 600 !important;
                                        }
                                        .fc-day-today {
                                            background-color: #f0f9ff !important;
                                            border: 2px solid var(--primary-color-500) !important;
                                        }
                                        .fc-day-today .fc-daygrid-day-number {
                                            color: var(--primary-color-600) !important;
                                            font-weight: 700 !important;
                                        }
                                        .fc-col-header-cell {
                                            background: #f8fafc !important;
                                            font-weight: 600 !important;
                                            color: #374151 !important;
                                            padding: 0.75rem 0 !important;
                                            border-bottom: 2px solid #e5e7eb !important;
                                            text-transform: uppercase !important;
                                            font-size: 0.75rem !important;
                                            letter-spacing: 0.05em !important;
                                        }
                                        .fc-scrollgrid {
                                            border-radius: 12px !important;
                                            overflow: hidden;
                                            box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important;
                                            border: 1px solid #e5e7eb !important;
                                        }
                                        .fc-event {
                                            border-radius: 6px !important;
                                            border: none !important;
                                            padding: 2px 6px !important;
                                            font-weight: 500 !important;
                                            font-size: 0.75rem !important;
                                            box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
                                            transition: all 0.2s ease !important;
                                            cursor: pointer !important;
                                        }
                                        .fc-event:hover {
                                            transform: translateY(-1px) !important;
                                            box-shadow: 0 2px 6px rgba(0,0,0,0.15) !important;
                                        }
                                        .modal-header .btn-close {
                                            filter: invert(1) grayscale(100%) brightness(200%) !important;
                                        }
                                        .fc-theme-standard .fc-scrollgrid {
                                            border: 1px solid #e5e7eb !important;
                                        }
                                        .fc-theme-standard td, .fc-theme-standard th {
                                            border: 1px solid #f3f4f6 !important;
                                        }
                                    `}
                                </style>
                                <FullCalendar
                                    eventDidMount={(info) => {
                                        // Dynamic colors based on appointment status - matching D_Appointment page
                                        const status = info.event.extendedProps.status;
                                        let backgroundColor, textColor;

                                        switch (status?.toLowerCase()) {
                                            case 'accepted':
                                            case 'accept':
                                                backgroundColor = '#04BD6C';
                                                textColor = '#fff';
                                                break;
                                            case 'pending':
                                                backgroundColor = '#ffc107';
                                                textColor = '#000';
                                                break;
                                            case 'cancel':
                                                backgroundColor = '#dc3545';
                                                textColor = '#fff';
                                                break;
                                            case 'completed':
                                                backgroundColor = '#17a2b8';
                                                textColor = '#fff';
                                                break;
                                            default:
                                                backgroundColor = '#6f42c1';
                                                textColor = '#fff';
                                        }

                                        info.el.style.backgroundColor = backgroundColor;
                                        info.el.style.color = textColor;
                                        info.el.style.borderRadius = '6px';
                                        info.el.style.padding = '2px 6px';
                                        info.el.style.fontSize = '0.75rem';
                                        info.el.style.fontWeight = '500';
                                        info.el.style.cursor = 'pointer';
                                        info.el.style.border = 'none';
                                        info.el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                                    }}
                                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                    initialView="dayGridMonth"
                                    headerToolbar={{
                                        left: 'prev,next today',
                                        center: 'title',
                                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                                    }}
                                    events={appointment}
                                    eventClick={(info) => {
                                        if (!info) {
                                            setSelectedAppointment(null)
                                        } else {
                                            setSelectedAppointment(info.event.extendedProps);
                                            setShowModal(true);
                                        }
                                        // console.log(info.event.extendedProps)
                                    }}
                                    height="auto"
                                    dayMaxEvents={3}
                                    moreLinkClick="popover"
                                    eventDisplay="block"
                                    displayEventTime={true}
                                    eventTimeFormat={{
                                        hour: 'numeric',
                                        minute: '2-digit',
                                        meridiem: 'short'
                                    }}
                                />
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton className='bg-primary text-white'>
                    <Modal.Title className='d-flex align-items-center'>
                        Appointment Details
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className='p-4'>
                    <Row className='g-4'>
                        <Col md={6}>
                            <Card className='h-100 border-0 bg-light'>
                                <Card.Body>
                                    <h6 className='text-primary mb-3'>Patient Information</h6>
                                    <div className='mb-2'>
                                        <strong>Name:</strong>
                                        <div className='text-muted'>{selectedAppointment?.patientname || 'N/A'}</div>
                                    </div>
                                    <div className='mb-2'>
                                        <strong>Mobile:</strong>
                                        <div className='text-muted'>{selectedAppointment?.mobile || 'N/A'}</div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6}>
                            <Card className='h-100 border-0 bg-light'>
                                <Card.Body>
                                    <h6 className='text-success mb-3'>Appointment Details</h6>
                                    <div className='mb-2'>
                                        <strong>Time:</strong>
                                        <div className='text-muted'>{selectedAppointment?.time || 'N/A'}</div>
                                    </div>
                                    <div className='mb-2'>
                                        <strong>Status:</strong>
                                        <div>
                                            <Badge
                                                bg={
                                                    selectedAppointment?.status?.toLowerCase() === 'accept' ? 'success' :
                                                        selectedAppointment?.status?.toLowerCase() === 'pending' ? 'warning' :
                                                            selectedAppointment?.status?.toLowerCase() === 'cancel' ? 'danger' :
                                                                selectedAppointment?.status?.toLowerCase() === 'completed' ? 'info' : 'secondary'
                                                }
                                                className='px-3 py-2'
                                            >
                                                {selectedAppointment?.status || 'N/A'}
                                            </Badge>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={12}>
                            <Card className='border-0 bg-light'>
                                <Card.Body>
                                    <h6 className='text-info mb-3'>Additional Information</h6>
                                    <div className='mb-3'>
                                        <strong>Reason for Visit:</strong>
                                        <div className='text-muted mt-1'>
                                            {selectedAppointment?.appointment_reason || 'No reason specified'}
                                        </div>
                                    </div>
                                    {selectedAppointment?.surgerydetails?.name && (
                                        <div className='mb-2'>
                                            <strong>Surgery:</strong>
                                            <div className='text-muted mt-1'>
                                                {selectedAppointment.surgerydetails.name}
                                            </div>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>
            <FooterBar />
            {loading ? <Loader /> : ''}
        </>
    )
}

export default D_Calender