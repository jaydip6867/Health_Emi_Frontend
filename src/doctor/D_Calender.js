import React, { useEffect, useState } from 'react'
import { Button, Col, Container, Dropdown, Modal, Row, Table } from 'react-bootstrap'
import DoctorSidebar from './DoctorSidebar'
import DoctorNav from './DoctorNav'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Loader from '../Loader'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const D_Calender = () => {
    var navigate = useNavigate();
    const [loading, setloading] = useState(false)

    const [doctor, setdoctor] = useState(null)
    const [token, settoken] = useState(null)

    const [appointment, setappointment] = useState(null)

    useEffect(() => {
        var data = JSON.parse(localStorage.getItem('doctordata'));
        if (!data) {
            navigate('/doctor')
        }
        else {
            setdoctor(data.data.Data.doctorData);
            settoken(`Bearer ${data.data.Data.accessToken}`)
        }
    }, [navigate])

    useEffect(() => {
        setloading(true)
        if (doctor) {
            setTimeout(() => {
                appointmentlist()
            }, 200);
            console.log(appointment)
        }
    }, [token])

    function appointmentlist() {
        // setloading(true)
        axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/doctor/appointments/list',
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
            console.log(formattedAppointments)
            setappointment(formattedAppointments);
        }).catch(function (error) {
            console.log(error);
            // toast(error.response.data.Message,{className:'custom-toast-error'})
        }).finally(() => {
            setloading(false)
        });
    }



    const [showModal, setShowModal] = useState(false);
    // const [selectedInfo, setSelectedInfo] = useState(null);
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
            <Container fluid className='p-0'>
                <Row className='g-0'>
                    <DoctorSidebar />
                    <Col xs={12} sm={9} lg={10} className='p-3'>
                        <DoctorNav doctorname={doctor && doctor.name} />
                        <div className='bg-white rounded p-2'>
                            {/* <h5 className='mb-4'>Calendar</h5> */}
                            <FullCalendar
                                eventDidMount={(info) => {
                                    info.el.style.backgroundColor = '#003366';
                                    info.el.style.color = '#fff';
                                    info.el.style.borderRadius = '5px';
                                    info.el.style.padding = '2px 5px';
                                }}
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                initialView="dayGridMonth"
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridYear,dayGridMonth,timeGridWeek,timeGridDay' // Buttons for switching
                                }}
                                events={appointment}
                                // dateClick={handleDateClick}
                                eventClick={(info) => {
                                    if (!info) {
                                        setSelectedAppointment(null)
                                    } {
                                        setSelectedAppointment(info.event.extendedProps); // Store full object
                                        setShowModal(true);
                                    }
                                    console.log(info.event.extendedProps)
                                }}

                                height="auto"
                            />
                        </div>
                    </Col>
                </Row>
            </Container>
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Appointment Detail</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p><strong>Patient Name:</strong> {selectedAppointment?.patientname}</p>
                    <p><strong>Mobile:</strong> {selectedAppointment?.mobile}</p>
                    <p><strong>Time:</strong> {selectedAppointment?.time}</p>
                    <p><strong>Reason:</strong> {selectedAppointment?.appointment_reason}</p>
                    <p><strong>Status:</strong> {selectedAppointment?.status}</p>
                    <p><strong>Surgery:</strong> {selectedAppointment?.surgerydetails?.name}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
            {loading ? <Loader /> : ''}
        </>
    )
}

export default D_Calender