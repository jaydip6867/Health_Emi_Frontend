import React, { useEffect, useState } from 'react'
import Loader from '../Loader'
import { Col, Container, Modal, OverlayTrigger, Row, Table, Tooltip } from 'react-bootstrap'
import P_Sidebar from './P_Sidebar'
import P_nav from './P_nav'
import NavBar from '../Visitor/Component/NavBar'
import FooterBar from '../Visitor/Component/FooterBar'
import CryptoJS from "crypto-js";
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import DataTable from 'react-data-table-component'
import { MdOutlineRemoveRedEye } from 'react-icons/md'

const P_Blog = () => {
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
                getblogs()
            }, 200);
        }
    }, [patient])

    const [bloglist, setbloglist] = useState(null)

    function getblogs() {
        axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/user/blogs/list',
            headers: {
                Authorization: token
            }
        }).then((res) => {
            console.log('blogs = ', res.data.Data);
            setbloglist(res.data.Data)
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
        var datasingle = bloglist.filter((v, i) => { return v._id === id })
        setsingleview(datasingle);
        handleShow()
        // console.log(datasingle)
    }

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
        sortable: true,
        maxWidth: '80px',
        minWidth: '80px',
        width: '80px'
    }, {
        name: 'Title',
        cell: row => row.title
    },
    {
        name: 'Description',
        cell: row => row.description
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
        width: '80px',
        center: true
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
                            <h5 className='mb-3'>All Blogs</h5>
                            <DataTable columns={columns} data={bloglist ? bloglist : ''} pagination customStyles={customTableStyles} />
                        </div>
                    </Col>
                </Row>
                {/* view single surgery */}
                {
                    single_view && single_view.map((v, i) => {
                        return (
                            <Modal show={show} onHide={handleClose} centered size="lg" key={i}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Blog Detail</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <div>
                                        <h3>{v.title}</h3>
                                        <p>{v.description}</p>
                                        {v?.image && <img src={v?.image} alt={`${v?.title} blog...`} className="w-50 mx-auto" />}
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

export default P_Blog