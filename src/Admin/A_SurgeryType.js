import React, { useEffect, useState } from 'react'
import { Button, Col, Container, Form, Modal, Row, Table } from 'react-bootstrap'
import A_Sidebar from './A_Sidebar'
import A_Nav from './A_Nav'
import { useNavigate } from 'react-router-dom';
import CryptoJS from "crypto-js";
import axios from 'axios';
import Loader from '../Loader';
import { toast, ToastContainer } from 'react-toastify';
import Swal from 'sweetalert2';
import { MdDelete, MdEditDocument } from 'react-icons/md';
import DataTable from 'react-data-table-component';

const A_SurgeryType = () => {
    const SECRET_KEY = "health-emi";
    var navigate = useNavigate();
    const [loading, setloading] = useState(false)

    const [admindata, setadmin] = useState(null)
    const [token, settoken] = useState(null)

    useEffect(() => {
        var getlocaldata = localStorage.getItem('healthadmincredit');
        if (getlocaldata != null) {
            const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            var data = JSON.parse(decrypted);
        }
        if (!data) {
            navigate('/healthadmin')
        }
        else {
            setadmin(data.userData);
            settoken(`Bearer ${data.accessToken}`)
        }
    }, [navigate])

    // all category data
    const [s_typelist, sets_typelist] = useState(null)

    useEffect(() => {
        if (token) {
            gets_type()
        }
    }, [token])

    const gets_type = async () => {
        setloading(true)
        await axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/admin/surgerytypes/list',
            headers: {
                Authorization: token,
            },
            data: {
                "search": "",
            }
        }).then((res) => {
            console.log(res.data.Data)
            sets_typelist(res.data.Data)
        }).catch(function (error) {
            // console.log(error);
            toast(error.response.data.Message, { className: 'custom-toast-error' })
        }).finally(() => {
            setloading(false)
        });
    }


    // show add doctor category model 
    const [show_DC, setDC] = useState(false);
    const handleDCclose = () => setDC(false);
    const handleDCshow = () => setDC(true);

    const [stype, setstype] = useState('')

    const addSType = async () => {
        setloading(true)
        await axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/admin/surgerytypes/save',
            headers: {
                Authorization: token,
            },
            data: {
                surgerytypename: stype
            }
        }).then((res) => {
            // toast('Surgery added...', { className: 'custom-toast-success' })
            Swal.fire({
                title: "Dr. Category Added...",
                icon: "success",
            });
            gets_type()
            handleDCclose()
        }).catch(function (error) {
            // console.log(error);
            toast(error.response.data.Message, { className: 'custom-toast-error' })
        }).finally(() => {
            setloading(false)
        });
    }

    // delete category
    function deletestype(sid) {
        Swal.fire({
            title: "Are you sure?",
            text: "You Want Delete This Surgery Type.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then((result) => {
            if (result.isConfirmed) {
                axios({
                    method: 'post',
                    url: 'https://healtheasy-o25g.onrender.com/admin/doctorcategories/remove',
                    headers: {
                        Authorization: token
                    },
                    data: {
                        surgerytypeid: sid
                    }
                }).then((res) => {
                    Swal.fire({
                        title: "Deleted!",
                        text: "Surgery Type has been deleted.",
                        icon: "success"
                    });
                    gets_type();
                }).catch(function (error) {
                    // console.log(error);
                    toast(error.response.data.Message, { className: 'custom-toast-error' })
                }).finally(() => {
                });

            }
        });
    }

    // show update category modal
    const [up_show_DC, setupDC] = useState(false);
    const handleupDCclose = () => setupDC(false);
    const handleupDCshow = () => setupDC(true);

    const [edit_record, seteditrecord] = useState(null);

    function editDC(id) {
        var datasingle = s_typelist.filter((v, i) => { return v._id === id })
        seteditrecord(datasingle[0]);
        handleupDCshow()
    }

    const updatestype = async () => {
        console.log(edit_record)
        setloading(true)
        await axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/admin/surgerytypes/save',
            headers: {
                Authorization: token,
            },
            data: {
                surgerytypeid: edit_record._id,
                surgerytypename: edit_record.surgerytypename
            }
        }).then((res) => {
            // toast('Surgery added...', { className: 'custom-toast-success' })
            Swal.fire({
                title: "Dr. Category Updated...",
                icon: "success",
            });
            gets_type()
            handleupDCclose()
        }).catch(function (error) {
            // console.log(error);
            toast(error.response.data.Message, { className: 'custom-toast-error' })
        }).finally(() => {
            setloading(false)
        });
    }

    // columns data
    const columns = [{
        name: 'No',
        selector: (row,index) => index+1,
        sortable: true,
    }, {
        name: 'Surgery Type Name',
        cell: row => row.surgerytypename
    }, {
        name: 'Action',
        cell: row => <>
            <MdEditDocument className='fs-5' onClick={() => editDC(row._id)} />
            <MdDelete onClick={() => deletestype(row._id)} className='text-danger fs-5 ms-2' />
        </>
    }]

    return (
        <>
            <Container fluid className='p-0 panel'>
                <Row className='g-0'>
                    <A_Sidebar />
                    <Col xs={12} sm={9} lg={10} className='p-3'>
                        <A_Nav patientname={admindata?.name} />
                        <div className='bg-white rounded p-3 shadow '>
                            <Row className='mt-2 mb-3 justify-content-between'>
                                <Col xs={'auto'}>
                                    <h4>Surgery Types</h4>
                                </Col>
                                <Col xs={'auto'}>
                                    <Button variant='primary' onClick={handleDCshow}>Add Surgery Type</Button>
                                </Col>
                            </Row>
                            {/* display table data */}
                            <DataTable columns={columns} data={s_typelist? s_typelist : ''} pagination />
                        </div>
                    </Col>
                </Row>
                {/* add Doctor Category */}
                <Modal show={show_DC} onHide={handleDCclose} centered size="sm">
                    <Modal.Header closeButton>
                        <Modal.Title>Add Surgery Type</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row className='g-4'>
                            <Col xs={12} md={12}>
                                <div className='bg-white rounded p-3 shadow'>
                                    <Form className='row register_doctor'>
                                        <Form.Group controlId="name" className='mb-3 col-12'>
                                            <div className='position-relative'>
                                                <Form.Label>Surgery Type Name</Form.Label>
                                                <Form.Control placeholder="Enter Category Name" name="surgerytypename" value={stype} onChange={(e) => setstype(e.target.value)} />
                                            </div>
                                        </Form.Group>

                                        <Form.Group className='col-12'>
                                            <Form.Control type='button' value={'Add Surgery Type'} onClick={addSType} className='theme_btn' />
                                        </Form.Group>
                                    </Form>
                                </div>
                            </Col>
                        </Row>
                    </Modal.Body>
                </Modal>
                {/* Update Doctor Category */}
                <Modal show={up_show_DC} onHide={handleupDCclose} centered size="sm">
                    <Modal.Header closeButton>
                        <Modal.Title>Update Surgery Type</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row className='g-4'>
                            <Col xs={12} md={12}>
                                <div className='bg-white rounded p-3 shadow'>
                                    <Form className='row register_doctor'>
                                        <Form.Group controlId="name" className='mb-3 col-12'>
                                            <div className='position-relative'>
                                                <Form.Label>Surgery Type</Form.Label>
                                                <Form.Control placeholder="Enter Category Name" name="surgerytypename" value={edit_record?.surgerytypename} onChange={(e) => seteditrecord({...edit_record,surgerytypename:e.target.value})} />
                                            </div>
                                        </Form.Group>

                                        <Form.Group className='col-12'>
                                            <Form.Control type='button' value={'Update Surgery Type'} onClick={updatestype} className='theme_btn' />
                                        </Form.Group>
                                    </Form>
                                </div>
                            </Col>
                        </Row>
                    </Modal.Body>
                </Modal>
            </Container>
            <ToastContainer />
            {loading ? <Loader /> : ''}
        </>
    )
}

export default A_SurgeryType