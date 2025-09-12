import React, { useEffect, useState } from 'react'
import { Button, Col, Container, Dropdown, Form, Modal, OverlayTrigger, Row, Table, Tooltip } from 'react-bootstrap'
import DoctorSidebar from './DoctorSidebar'
import DoctorNav from './DoctorNav'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Loader from '../Loader'
import CryptoJS from "crypto-js";
import Swal from 'sweetalert2'
import DataTable from 'react-data-table-component'
import { MdClose, MdDone, MdOutlineAutorenew, MdOutlineRemoveRedEye } from 'react-icons/md'
import DatePicker from 'react-datepicker'
import { format } from 'date-fns'
const D_SurgeryAppointment = () => {
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
                title: "Appointment Accept...",
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
        // console.log(datasingle)
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

    // table data
    const columns = [{
        name: 'No',
        selector: (row, index) => index + 1,
        sortable: true,
        width: '80px'
    }, {
        name: 'Patient Name',
        cell: row => row.patientname
    },
    {
        name: 'Deases',
        cell: row => row.surgerydetails?.name
    },
    {
        name: 'Date & Time',
        cell: row => `${row.date} ${row.time}`
    },
    {
        name: 'Status',
        cell: row => {
            let badgeClass = 'badge bg-secondary'; // default

            if (row.status === 'Accept') {
                badgeClass = 'badge bg-success';
            } else if (row.status === 'Cancel') {
                badgeClass = 'badge bg-danger';
            } else if (row.status === 'Pending') {
                badgeClass = 'badge bg-secondary';
            }

            return <span className={badgeClass}>{row.status}</span>;
        },
        sortable: true
    },
    {
        name: 'View',
        cell: row => <MdOutlineRemoveRedEye onClick={() => btnview(row._id)} className='text-primary fs-5' />,
        width: '80px'
    }, {
        name: 'Action',
        cell: row =>
            row.status === "Pending" ?
                <>
                    <div className='d-flex flex-wrap gap-2'>
                        <OverlayTrigger placement="top" delay={{ show: 100, hide: 50 }} overlay={renderTooltip('Accept')}>
                            <Button variant='success' size='sm'><MdDone onClick={() => appointmentbtn(row._id, 'Accept')} className='fs-5' /></Button>
                        </OverlayTrigger>
                        <OverlayTrigger placement="top" delay={{ show: 100, hide: 50 }} overlay={renderTooltip('Cancel')}>
                            <Button variant='danger' size='sm'><MdClose onClick={() => appointmentbtn(row._id, 'Cancel')} className='fs-5' /></Button>
                        </OverlayTrigger>
                        <OverlayTrigger placement="top" delay={{ show: 100, hide: 50 }} overlay={renderTooltip('Reschedule')}>
                            <Button variant='secondary' size='sm'><MdOutlineAutorenew onClick={() => reschedule_modal(row._id)} className='fs-5' /></Button>
                        </OverlayTrigger>
                    </div>
                </>
                : ''
    }]
    return (
        <>
            <Container fluid className='p-0 panel'>
                <Row className='g-0'>
                    <DoctorSidebar />
                    <Col xs={12} sm={9} lg={10} className='p-3'>
                        <DoctorNav doctorname={doctor && doctor.name} />
                        <div className='bg-white rounded p-2'>
                            <h5 className='mb-4'>All Surgery Appointment</h5>
                            <DataTable columns={columns} data={appointment ? appointment : ''} pagination />
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
                                    <div>
                                        <p><b>Patient Name :- </b><span>{v?.patientname}</span></p>
                                        <p><b>Mobile No :- </b><span>{v?.mobile}</span></p>
                                        <p><b>Surgery Name :- </b><span>{v?.surgerydetails?.name}</span></p>
                                        <p><b>Date & Time :- </b><span>{v?.date} , {v?.time}</span></p>
                                        <p><b>Price :- </b><span>{v?.surgerydetails?.price}</span></p>
                                    </div>
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
            </Container>
            {loading ? <Loader /> : ''}
        </>
    )
}

export default D_SurgeryAppointment