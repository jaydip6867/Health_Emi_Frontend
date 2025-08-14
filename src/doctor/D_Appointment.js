import React, { useEffect, useState } from 'react'
import { Col, Container, Dropdown, Modal, Row, Table } from 'react-bootstrap'
import DoctorSidebar from './DoctorSidebar'
import DoctorNav from './DoctorNav'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Loader from '../Loader'
import CryptoJS from "crypto-js";
import Swal from 'sweetalert2'
import DataTable from 'react-data-table-component'
import { MdOutlineRemoveRedEye } from 'react-icons/md'

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

    // table data
    const columns = [{
        name: 'No',
        selector: (row, index) => index + 1,
        sortable: true,
        maxWidth: '80px',
        minWidth: '80px',
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
        maxWidth: '80px',
        minWidth: '80px',
        width: '80px'
    }, {
        name: 'Action',
        cell: row =>
            row.status === "Pending" ?
                <Dropdown>
                    <Dropdown.Toggle variant="secondary" size='sm' id="dropdown-basic">
                        Edit
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        <Dropdown.Item href="#/action-1" onClick={() => appointmentbtn(row._id, 'Accept')}>Accept</Dropdown.Item>
                        <Dropdown.Item href="#/action-2" onClick={() => appointmentbtn(row._id, 'Cancel')}>Cancel</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown> : ''
    }]


    return (
        <>
            <Container fluid className='p-0 panel'>
                <Row className='g-0'>
                    <DoctorSidebar />
                    <Col xs={12} sm={9} lg={10} className='p-3'>
                        <DoctorNav doctorname={doctor && doctor.name} />
                        <div className='bg-white rounded p-2'>
                            <h5 className='mb-4'>All Appointment</h5>
                            <DataTable columns={columns} data={appointment ? appointment : ''} pagination />
                            {/* <Table bordered hover>
                                <thead>
                                    <tr>
                                        <th>No</th>
                                        <th>Patient Name</th>
                                        <th>Deases</th>
                                        <th>Date & Time</th>
                                        <th>Price</th>
                                        <th>Status</th>
                                        <th>Modify</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        appointment && appointment.map((v, i) => {
                                            return (
                                                <tr key={i}>
                                                    <th>{i + 1}</th>
                                                    <td>{v.patientname}</td>
                                                    <td>{v.surgerydetails.name}</td>
                                                    <td>{v.date} , {v.time}</td>
                                                    <td>{v.surgerydetails.price}</td>
                                                    <td>{v.status} </td>
                                                    <td>
                                                        <Dropdown>
                                                            <Dropdown.Toggle variant="secondary" size='sm' id="dropdown-basic">
                                                                Edit
                                                            </Dropdown.Toggle>

                                                            <Dropdown.Menu>
                                                                <Dropdown.Item href="#/action-1" onClick={() => appointmentbtn(v._id, 'Accept')}>Accept</Dropdown.Item>
                                                                <Dropdown.Item href="#/action-2" onClick={() => appointmentbtn(v._id, 'Cancel')}>Cancel</Dropdown.Item>
                                                            </Dropdown.Menu>
                                                        </Dropdown>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </Table> */}
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
                                        <p><b>Patient Name :- </b><span>{v.patientname}</span></p>
                                        <p><b>Mobile No :- </b><span>{v.mobile}</span></p>
                                        <p><b>Surgery Name :- </b><span>{v.surgerydetails.name}</span></p>
                                        <p><b>Date & Time :- </b><span>{v.date} , {v.time}</span></p>
                                        <p><b>Price :- </b><span>{v.price}</span></p>
                                    </div>
                                </Modal.Body>
                            </Modal>
                        )
                    })
                }
            </Container>
            {loading ? <Loader /> : ''}
        </>
    )
}

export default D_Appointment