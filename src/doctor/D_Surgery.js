import React, { useEffect, useState } from 'react'
import Loader from '../Loader';
import DoctorSidebar from './DoctorSidebar';
import DoctorNav from './DoctorNav';
import { Button, Col, Container, Form, Modal, Row, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './css/doctor.css';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import Swal from 'sweetalert2';
import { MdDelete, MdEditDocument, MdOutlineRemoveRedEye } from 'react-icons/md';


const D_Surgery = () => {
    var navigate = useNavigate();
    const [loading, setloading] = useState(false)

    const [doctor, setdoctor] = useState(null)
    const [token, settoken] = useState(null)
    const [s_type, sets_type] = useState([
        "Appendectomy",
        "Cataract Surgery",
        "Cesarean Section (C-Section)",
        "Cholecystectomy (Gallbladder Removal)",
        "Coronary Artery Bypass Graft (CABG)",
        "Craniotomy",
        "Debridement",
        "Gastric Bypass Surgery",
        "Hernia Repair",
        "Hysterectomy",
        "Joint Replacement (Hip, Knee, Shoulder)",
        "Laminectomy (Spinal Decompression)",
        "Laparoscopy",
        "Mastectomy",
        "Nephrectomy (Kidney Removal)",
        "Prostatectomy",
        "Rhinoplasty",
        "Scoliosis Surgery",
        "Spinal Fusion",
        "Tonsillectomy",
        "Transplant Surgery (Kidney, Liver, Heart, etc.)",
        "Trauma Surgery",
        "Tubal Ligation",
        "Vasectomy",
        "Whipple Procedure (Pancreaticoduodenectomy)"
    ])
    var surgeryobj = { name: '', price: '', days: '', additional_features: '', description: '',surgery_type: '', yearsof_experience: '',completed_surgery:'',features:'' }
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
            // console.log(res.data.Data)
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
            var surg = { name: '', price: '', days: '', additional_features: '', description: '', surgery_type: '', yearsof_experience: '',completed_surgery:'',features:'' }
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

    // display surgery in model
    const [show, setShow] = useState(false);
    const [single_view, setsingleview] = useState(null);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    function btnview(id) {
        var datasingle = surgerylist.filter((v, i) => { return v._id === id })
        setsingleview(datasingle);
        handleShow()
        // console.log(datasingle)
    }

    // display surgery in model
    const [editshow, seteditShow] = useState(false);
    const [edit_record, seteditrecord] = useState(null);

    const edithandleClose = () => seteditShow(false);
    const edithandleShow = () => seteditShow(true);

    function btnedit(id) {
        var datasingle = surgerylist.filter((v, i) => { return v._id === id })
        seteditrecord(datasingle[0]);
        edithandleShow()
        // console.log(datasingle[0])
    }

    const seleditsurgery = (e) => {
        const { name, value } = e.target;
        seteditrecord(surgery => ({
            ...surgery,
            [name]: value
        }))
        // console.log(edit_record)
    };

    function editsurgery() {
        setloading(true)
        axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/doctor/surgeries/save',
            headers: {
                Authorization: token,
            },
            data: {
                surgeryid: edit_record._id,
                name: edit_record.name,
                price: edit_record.price,
                days: edit_record.days,
                additional_features: edit_record.additional_features,
                description: edit_record.description,
                surgery_type: edit_record.surgery_type,
                completed_surgery: edit_record.completed_surgery,
                features: edit_record.features,
                yearsof_experience: edit_record.yearsof_experience
            }
        }).then((res) => {
            // toast('Surgery added...', { className: 'custom-toast-success' })
            Swal.fire({
                title: "Surgery Updated...",
                icon: "success",
            });
            getsurgery()
            seteditrecord(null)
            edithandleClose()
        }).catch(function (error) {
            console.log(error);
            toast(error.response.data.Message, { className: 'custom-toast-error' })
        }).finally(() => {
            setloading(false)
        });
    }

    return (
        <>
            <Container fluid className='p-0 panel'>
                <Row className='g-0'>
                    <DoctorSidebar />
                    <Col xs={12} sm={9} lg={10} className='p-3'>
                        <DoctorNav doctorname={doctor && doctor.name} />
                        <Row className='g-4'>
                            <Col xs={12} md={12}>
                                <div className='bg-white rounded p-3 shadow'>
                                    <Form className='row register_doctor'>
                                        <Form.Group controlId="type" className='mb-3 col-md-3'>
                                            <div className='position-relative'>
                                                <Form.Label>Surgery Type</Form.Label>
                                                <Form.Select placeholder="Ex:- 18000" name="surgery_type" value={surgery.surgery_type} onChange={selsurgery}>
                                                    <option value={''}>Select Surgery Type</option>
                                                    {s_type.map((v, i) => {
                                                        return (<option key={i} value={v}>{v}</option>)
                                                    })}
                                                </Form.Select>
                                            </div>
                                        </Form.Group>
                                        <Form.Group controlId="name" className='mb-3 col-md-6'>
                                            <div className='position-relative'>
                                                <Form.Label>Surgery Name</Form.Label>
                                                <Form.Control placeholder="Ex:- Cataract Surgery" name="name" value={surgery.name} onChange={selsurgery} />
                                                {/* <AiOutlinePhone className='icon_input' /> */}
                                            </div>
                                        </Form.Group>

                                        <Form.Group controlId="price" className='mb-3 col-6 col-md-3'>
                                            <div className='position-relative'>
                                                <Form.Label>Price</Form.Label>
                                                <Form.Control placeholder="Ex:- 18000" name="price" value={surgery.price} onChange={selsurgery} />
                                                {/* <CiLock className='icon_input' /> */}
                                            </div>
                                        </Form.Group>


                                        <Form.Group controlId="days" className='mb-3 col-6 col-md-3'>
                                            <div className='position-relative'>
                                                <Form.Label>Days</Form.Label>
                                                <Form.Control placeholder="Ex:- 1" name="days" value={surgery.days} onChange={selsurgery} />
                                                {/* <CiLock className='icon_input' /> */}
                                            </div>
                                        </Form.Group>
                                        <Form.Group controlId="days" className='mb-3 col-6 col-md-3'>
                                            <div className='position-relative'>
                                                <Form.Label>Experiance</Form.Label>
                                                <Form.Select placeholder="Ex:- 18000" name="yearsof_experience" value={surgery.yearsof_experience} onChange={selsurgery}>
                                                    <option value={''} selected disabled>Select Experiance</option>
                                                    {['0+','1+', '2+', '3+', '4+', '5+', '10+', '20+'].map((level) => (
                                                        <option key={level} value={level}>
                                                            {level} years
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </div>
                                        </Form.Group>
                                        <Form.Group controlId="days" className='mb-3 col-6 col-md-3'>
                                            <div className='position-relative'>
                                                <Form.Label>completed Surgery</Form.Label>
                                                <Form.Select placeholder="Ex:- 18000" name="completed_surgery" value={surgery.completed_surgery} onChange={selsurgery}>
                                                    <option value={''} selected disabled>Select Completed Surgery</option>
                                                    {['10+', '20+', '30+', '40+', '50+', '100+', '200+','300+','500+','1000+','2000+','5000+'].map((level) => (
                                                        <option key={level} value={level}>
                                                            {level}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </div>
                                        </Form.Group>

                                        <Form.Group controlId="additional_features" className='mb-3 col-12 col-md-3'>
                                            <div className='position-relative'>
                                                <Form.Label>Features</Form.Label>
                                                <Form.Control placeholder="Ex:- Blade-free laser option" name="features" value={surgery.features} onChange={selsurgery} />
                                                {/* <CiLock className='icon_input' /> */}
                                            </div>
                                        </Form.Group>
                                        <Form.Group controlId="additional_features" className='mb-3 col-12 col-md-6'>
                                            <div className='position-relative'>
                                                <Form.Label>additional_features</Form.Label>
                                                <Form.Control placeholder="Ex:- Blade-free laser option, intraocular lens implant" name="additional_features" value={surgery.additional_features} onChange={selsurgery} />
                                                {/* <CiLock className='icon_input' /> */}
                                            </div>
                                        </Form.Group>

                                        <Form.Group controlId="description" className='mb-3 col-12 col-md-6'>
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
                            <Table bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>No</th>
                                        <th className='text-nowrap'>Surgery Name</th>
                                        <th>Price</th>
                                        <th>Days</th>
                                        <th>Experiance</th>
                                        <th>Features</th>
                                        <th>Description</th>
                                        <th>Action</th>
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
                                                <td>{!v.yearsof_experience? '0':v.yearsof_experience} Years of Experiance
                                                    <hr/>
                                                    {!v.completed_surgery? '0':v.completed_surgery} Surgeries Done
                                                </td>
                                                <td>{v.features}</td>
                                                <td>{v.additional_features}</td>
                                                <td className='desc_3line'>{v.description}</td>
                                                <td>
                                                    {/* <Button variant="primary" className='btn btn-primary btn-sm' onClick={() => btnview(v._id)}>
                                                        View
                                                    </Button> */}
                                                    <div className='p-2 d-flex gap-3'>
                                                        <MdEditDocument className='fs-4' onClick={() => btnedit(v._id)} />
                                                        <MdOutlineRemoveRedEye onClick={() => btnview(v._id)} className='text-primary fs-4' />
                                                        <MdDelete onClick={() => deletesurgery(v._id)} className='text-danger fs-4' />
                                                    </div>
                                                    {/* <button className='btn btn-danger btn-sm' onClick={() => deletesurgery(v._id)}>Delete</button> */}

                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </Table>
                        </div>
                    </Col>
                </Row>
                {
                    single_view && single_view.map((v, i) => {
                        return (
                            <Modal show={show} onHide={handleClose} centered size="lg" key={i}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Surgery Detail</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <div>
                                        <p><b>Surgery Name :- </b><span>{v.name}</span></p>
                                        <p><b>Surgery Price :- </b><span>{v.price}</span></p>
                                        <p><b>Experiance :- </b><span>{v.yearsof_experience} Years of experiance & {v.completed_surgery} Completed Surgeries</span></p>
                                        <p><b>Surgery Features :- </b><span>{v.additional_features}</span></p>
                                        <p><b>Surgery Description :- </b><span>{v.description}</span></p>
                                    </div>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button variant="secondary" onClick={handleClose}>
                                        Close
                                    </Button>
                                </Modal.Footer>
                            </Modal>
                        )
                    })
                }
                {
                    !edit_record ? '' :
                        <Modal show={editshow} onHide={edithandleClose} centered size="xl">
                            <Modal.Header closeButton>
                                <Modal.Title>Update Surgery</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Form className='row register_doctor'>
                                    <Form.Group controlId="type" className='mb-3 col-md-3'>
                                            <div className='position-relative'>
                                                <Form.Label>Surgery Type</Form.Label>
                                                <Form.Select placeholder="Ex:- 18000" name="surgery_type" value={edit_record.surgery_type} onChange={seleditsurgery}>
                                                    <option value={''}>Select Surgery Type</option>
                                                    {s_type.map((v, i) => {
                                                        return (<option key={i} value={v} selected={edit_record.surgery_type === v ? true : false}>{v}</option>)
                                                    })}
                                                </Form.Select>
                                            </div>
                                        </Form.Group>
                                    <Form.Group controlId="name" className='mb-3 col-6'>
                                        <div className='position-relative'>
                                            <Form.Label>Surgery Name</Form.Label>
                                            <Form.Control placeholder="Ex:- Cataract Surgery" name="name" value={edit_record.name} onChange={seleditsurgery} />
                                            
                                        </div>
                                    </Form.Group>

                                    <Form.Group controlId="price" className='mb-3 col-3'>
                                        <div className='position-relative'>
                                            <Form.Label>Price</Form.Label>
                                            <Form.Control placeholder="Ex:- 18000" name="price" value={edit_record.price} onChange={seleditsurgery} />
                                            
                                        </div>
                                    </Form.Group>

                                    <Form.Group controlId="days" className='mb-3 col-3'>
                                        <div className='position-relative'>
                                            <Form.Label>Days</Form.Label>
                                            <Form.Control placeholder="Ex:- 1" name="days" value={edit_record.days} onChange={seleditsurgery} />
                                            
                                        </div>
                                    </Form.Group>
                                    <Form.Group controlId="days" className='mb-3 col-6 col-md-3'>
                                            <div className='position-relative'>
                                                <Form.Label>Experiance</Form.Label>
                                                <Form.Select placeholder="Ex:- 18000" name="yearsof_experience" value={edit_record.yearsof_experience} onChange={seleditsurgery}>
                                                    <option value={''} selected disabled>Select Experiance</option>
                                                    {['0+','1+', '2+', '3+', '4+', '5+', '10+', '20+'].map((level) => (
                                                        <option key={level} value={level} selected={edit_record.yearsof_experience === level ? true : false}>
                                                            {level} years
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </div>
                                        </Form.Group>
                                        <Form.Group controlId="days" className='mb-3 col-6 col-md-3'>
                                            <div className='position-relative'>
                                                <Form.Label>completed Surgery</Form.Label>
                                                <Form.Select placeholder="Ex:- 18000" name="completed_surgery" value={edit_record.completed_surgery} onChange={seleditsurgery}>
                                                    <option value={''} selected disabled>Select Completed Surgery</option>
                                                    {['10+', '20+', '30+', '40+', '50+', '100+', '200+','300+','500+','1000+','2000+','5000+'].map((level) => (
                                                        <option key={level} value={level} selected={edit_record.completed_surgery === level ? true : false}>
                                                            {level}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </div>
                                        </Form.Group>

                                        <Form.Group controlId="additional_features" className='mb-3 col-12 col-md-3'>
                                            <div className='position-relative'>
                                                <Form.Label>Features</Form.Label>
                                                <Form.Control placeholder="Ex:- Blade-free laser option" name="features" value={edit_record.features} onChange={seleditsurgery} />
                                                
                                            </div>
                                        </Form.Group>

                                    <Form.Group controlId="additional_features" className='mb-3 col-6'>
                                        <div className='position-relative'>
                                            <Form.Label>additional_features</Form.Label>
                                            <Form.Control placeholder="Ex:- Blade-free laser option, intraocular lens implant" name="additional_features" value={edit_record.additional_features} onChange={seleditsurgery} />
                                            
                                        </div>
                                    </Form.Group>

                                    <Form.Group controlId="description" className='mb-3 col-6'>
                                        <div className='position-relative'>
                                            <Form.Label>Description</Form.Label>
                                            <Form.Control as="textarea" placeholder="Ex:- Cataract surgery involves removing ...." name="description" value={edit_record.description} onChange={seleditsurgery} />
                                        </div>
                                    </Form.Group>

                                </Form>
                            </Modal.Body>
                            <Modal.Footer>
                                <Form.Group >
                                    <Form.Control type='button' value={'Update Surgery'} onClick={editsurgery} className='theme_btn' />
                                </Form.Group>
                                <Button variant="secondary" onClick={edithandleClose}>
                                    Close
                                </Button>
                            </Modal.Footer>
                        </Modal>

                }
            </Container>
            <ToastContainer />
            {loading ? <Loader /> : ''}
        </>
    )
}

export default D_Surgery