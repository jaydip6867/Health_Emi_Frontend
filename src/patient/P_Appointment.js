import React, { useEffect, useState } from 'react'
import Loader from '../Loader'
import { Col, Container, Modal, Row, Table } from 'react-bootstrap'
import P_Sidebar from './P_Sidebar'
import P_nav from './P_nav'
import NavBar from '../Visitor/Component/NavBar'
import FooterBar from '../Visitor/Component/FooterBar'
import CryptoJS from "crypto-js";
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import DataTable from 'react-data-table-component'
import { MdOutlineRemoveRedEye } from 'react-icons/md'

const P_Appointment = () => {
    const SECRET_KEY = "health-emi";

    var navigate = useNavigate();
    const [loading, setloading] = useState(false)

    const [patient, setpatient] = useState(null)
    const [token, settoken] = useState(null)

    useEffect(() => {
        var getlocaldata = localStorage.getItem('PatientLogin');
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

    function getappointments(d) {
        axios({
            method: 'get',
            url: 'https://healtheasy-o25g.onrender.com/user/appointments',
            headers: {
                Authorization: token
            }
        }).then((res) => {
            // console.log('appointment = ', res.data.Data.docs);
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
        name: 'Doctor Name',
        cell: row => row.doctorid.name
    },
    {
        name: 'Surgery',
        cell: row => row.surgerydetails?.name
    },
    {
        name: 'Price',
        cell: row => row.surgerydetails?.price
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
    }]
    return (
        <>
            <NavBar logindata={patient} />
            <Container fluid className='p-0 panel'>
                <Row className='g-0'>
                    <P_Sidebar />
                    <Col xs={12} sm={9} lg={10} className='p-3'>
                        {/* <P_nav patientname={patient && patient.name} /> */}
                        <div className='bg-white rounded p-3 mb-3'>
                            <h5 className='mb-3'>All Appointments</h5>
                            <DataTable columns={columns} data={appoint_data ? appoint_data : ''} pagination />
                            {/* <Table hover bordered responsive>
                                <thead>
                                    <tr>
                                        <th>No</th>
                                        <th>Doctor Name</th>
                                        <th>Surgery</th>
                                        <th>Price</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        appoint_data && appoint_data.map((v, i) => {
                                            return (
                                                <tr key={i}>
                                                    <th>{i + 1}</th>
                                                    <td>{v.doctorid.name}</td>
                                                    <td>{v.surgerydetails.name}</td>
                                                    <td>{v.surgerydetails.price}</td>
                                                    <td>{v.date} {v.time}</td>
                                                    <td>{v.status}</td>
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
                                        <p><b>Price :- </b><span>{v.surgerydetails.price}</span></p>
                                    </div>
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

export default P_Appointment