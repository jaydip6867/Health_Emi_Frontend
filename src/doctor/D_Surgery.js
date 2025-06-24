import React, { useEffect, useState } from 'react'
import Loader from '../Loader';
import DoctorSidebar from './DoctorSidebar';
import DoctorNav from './DoctorNav';
import { Button, Col, Container, Form, Row, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AiOutlinePhone } from 'react-icons/ai';
import { CiLock } from 'react-icons/ci';
import './css/doctor.css';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import Swal from 'sweetalert2';


const D_Surgery = () => {
    var navigate = useNavigate();
    const [loading, setloading] = useState(false)

    const [doctor, setdoctor] = useState(null)
    const [token, settoken] = useState(null)
    var surgeryobj = { name: '', price: '', days: '', additional_features: '', description: '' }
    const [surgery, setsurgery] = useState(surgeryobj)
    const [surgerylist, setsurgerylist] = useState(null)

    const selsurgery = (e) => {
        const { name, value } = e.target;
        setsurgery(surgery => ({
            ...surgery,
            [name]: value
        }))
    };

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
        if (token) {
            getsurgery()
        }
    }, [token])

    function getsurgery() {
        setloading(true)
        axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/doctor/surgeries/list',
            headers: {
                Authorization: token,
            },
            data: {
                "search": "",
            }
        }).then((res) => {
            console.log(res.data.Data)
            setsurgerylist(res.data.Data)
        }).catch(function (error) {
            // console.log(error);
            toast(error.response.data.Message, { className: 'custom-toast-error' })
        }).finally(() => {
            setloading(false)
        });
    }

    function addsurgery() {
        setloading(true)
        axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/doctor/surgeries/save',
            headers: {
                Authorization: token,
            },
            data: surgery
        }).then((res) => {
            // toast('Surgery added...', { className: 'custom-toast-success' })
            Swal.fire({
                title: "Surgery Added...",
                icon: "success",
            });
            getsurgery()
            var surg = { name: '', price: '', days: '', additional_features: '', description: '' }
            setsurgery(surg);
        }).catch(function (error) {
            // console.log(error);
            toast(error.response.data.Message, { className: 'custom-toast-error' })
        }).finally(() => {
            setloading(false)
        });
    }

    function deletesurgery(sid) {
        Swal.fire({
            title: "Are you sure?",
            text: "You Want Delete This Surgery.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then((result) => {
            if (result.isConfirmed) {
                axios({
                    method: 'post',
                    url: 'https://healtheasy-o25g.onrender.com/doctor/surgeries/remove',
                    headers: {
                        Authorization: token
                    },
                    data: {
                        surgeryid: sid
                    }
                }).then((res) => {
                    Swal.fire({
                        title: "Deleted!",
                        text: "Your Account has been deleted.",
                        icon: "success"
                    });
                    getsurgery();
                }).catch(function (error) {
                    // console.log(error);
                    toast(error.response.data.Message, { className: 'custom-toast-error' })
                }).finally(() => {
                });

            }
        });
    }
    return (
        <>
            <Container fluid className='p-0'>
                <Row className='g-0'>
                    <DoctorSidebar />
                    <Col xs={12} sm={9} lg={10} className='p-3'>
                        <DoctorNav doctorname={doctor && doctor.name} />
                        <Row className='g-4'>
                            <Col xs={12} md={12}>
                                <div className='bg-white rounded p-3 shadow'>
                                    <Form className='row register_doctor'>
                                        <Form.Group controlId="name" className='mb-3 col-6'>
                                            <div className='position-relative'>
                                                <Form.Label>Surgery Name</Form.Label>
                                                <Form.Control placeholder="Ex:- Cataract Surgery" name="name" value={surgery.name} onChange={selsurgery} />
                                                {/* <AiOutlinePhone className='icon_input' /> */}
                                            </div>
                                        </Form.Group>

                                        <Form.Group controlId="price" className='mb-3 col-6'>
                                            <div className='position-relative'>
                                                <Form.Label>Price</Form.Label>
                                                <Form.Control placeholder="Ex:- 18000" name="price" value={surgery.price} onChange={selsurgery} />
                                                {/* <CiLock className='icon_input' /> */}
                                            </div>
                                        </Form.Group>

                                        <Form.Group controlId="days" className='mb-3 col-6'>
                                            <div className='position-relative'>
                                                <Form.Label>Days</Form.Label>
                                                <Form.Control placeholder="Ex:- 1" name="days" value={surgery.days} onChange={selsurgery} />
                                                {/* <CiLock className='icon_input' /> */}
                                            </div>
                                        </Form.Group>

                                        <Form.Group controlId="additional_features" className='mb-3 col-6'>
                                            <div className='position-relative'>
                                                <Form.Label>additional_features</Form.Label>
                                                <Form.Control placeholder="Ex:- Blade-free laser option, intraocular lens implant" name="additional_features" value={surgery.additional_features} onChange={selsurgery} />
                                                {/* <CiLock className='icon_input' /> */}
                                            </div>
                                        </Form.Group>

                                        <Form.Group controlId="description" className='mb-3 col-12'>
                                            <div className='position-relative'>
                                                <Form.Label>Description</Form.Label>
                                                <Form.Control as="textarea" placeholder="Ex:- Cataract surgery involves removing ...." name="description" value={surgery.description} onChange={selsurgery} />
                                            </div>
                                        </Form.Group>

                                        <Form.Group className='col-12'>
                                            <Form.Control type='button' value={'Add Surgery Deatil'} onClick={addsurgery} className='theme_btn' />
                                        </Form.Group>
                                    </Form>
                                </div>
                            </Col>
                            <Col sm={6}>
                                <div></div>
                            </Col>
                        </Row>
                        <div className='bg-white rounded p-2 shadow'>
                            <Table bordered hover>
                                <thead>
                                    <tr>
                                        <th>No</th>
                                        <th>Surgery Name</th>
                                        <th>Price</th>
                                        <th>Days</th>
                                        <th>Features</th>
                                        <th>Description</th>
                                        {/* <th>Edit</th> */}
                                        <th>Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {surgerylist && surgerylist.map((v, i) => {
                                        return (
                                            <tr key={i}>
                                                <th>{i + 1}</th>
                                                <td>{v.name}</td>
                                                <td>{v.price}</td>
                                                <td>{v.days}</td>
                                                <td>{v.additional_features}</td>
                                                <td className='desc_3line'>{v.description}</td>
                                                {/* <td><button className='btn btn-info btn-sm'>Edit</button></td> */}
                                                <td><button className='btn btn-danger btn-sm' onClick={() => deletesurgery(v._id)}>Delete</button></td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </Table>
                        </div>
                    </Col>
                </Row>
            </Container>
            <ToastContainer />
            {loading ? <Loader /> : ''}
        </>
    )
}

export default D_Surgery