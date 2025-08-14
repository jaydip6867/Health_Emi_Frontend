import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import DoctorNav from './DoctorNav';
import { Button, Col, Container, Form, Modal, Row, Table, ToastContainer } from 'react-bootstrap';
import DoctorSidebar from './DoctorSidebar';
import CryptoJS from "crypto-js";
import DatePicker from 'react-datepicker';
import { enGB } from 'date-fns/locale';
import axios from 'axios';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import Loader from '../Loader';
import { MdDelete, MdEditDocument, MdOutlineRemoveRedEye } from 'react-icons/md';
import { formatDate } from 'date-fns';
import DataTable from 'react-data-table-component';

const D_Blog = () => {
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

    // Get Blog

    useEffect(() => {
        if (token) {
            getblog()
        }
    }, [token])

    const [bloglist, setbloglist] = useState(null)
    function getblog() {
        setloading(true)
        axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/doctor/blogs/list',
            headers: {
                Authorization: token,
            },
            data: {
                "search": "",
            }
        }).then((res) => {
            // console.log(res.data.Data)
            setbloglist(res.data.Data)
        }).catch(function (error) {
            // console.log(error);
            toast(error.response.data.Message, { className: 'custom-toast-error' })
        }).finally(() => {
            setloading(false)
        });
    }

    // ADD blog

    const blog_var = { title: '', description: '', showto_doctor: false, showto_patient: true, expirydate: null };
    const [blog, setblog] = useState(blog_var)

    function addblog() {
        const data = { ...blog }
        const date = new Date(data.expirydate);
        const formattedDate = date.toLocaleDateString("en-GB"); // Gives dd/mm/yyyy
        // Replace slashes with dashes
        data.expirydate = formattedDate.replace(/\//g, "-");
        // setblog(data)

        setloading(true)
        axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/doctor/blogs/save',
            headers: {
                Authorization: token,
            },
            data: data
        }).then((res) => {
            // toast('Surgery added...', { className: 'custom-toast-success' })
            Swal.fire({
                title: "Blog Added...",
                icon: "success",
            });
            getblog()
            setblog({ title: '', description: '', showto_doctor: false, showto_patient: true, expirydate: null });
            handleblogClose()
        }).catch(function (error) {
            console.log(error);
            toast(error.message, { className: 'custom-toast-error' })
        }).finally(() => {
            setloading(false)
        });
    }

    // delete blog
    function deleteblog(id) {
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
                    url: 'https://healtheasy-o25g.onrender.com/doctor/blogs/remove',
                    headers: {
                        Authorization: token
                    },
                    data: {
                        blogid: id
                    }
                }).then((res) => {
                    Swal.fire({
                        title: "Deleted!",
                        text: "Your Blog has been deleted.",
                        icon: "success"
                    });
                    getblog();
                }).catch(function (error) {
                    // console.log(error);
                    toast(error.message, { className: 'custom-toast-error' })
                }).finally(() => {
                });
            }
        });
    }

    // display single blog
    // display blog in model
    const [show, setShow] = useState(false);
    const [single_view, setsingleview] = useState(null);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    function btnview(id) {
        var datasingle = bloglist.filter((v, i) => { return v._id === id })
        setsingleview(datasingle);
        handleShow()
    }

    // Edit Blog display surgery in model
    const [editshow, seteditShow] = useState(false);
    const [edit_record, seteditrecord] = useState(null);

    const edithandleClose = () => seteditShow(false);
    const edithandleShow = () => seteditShow(true);

    function btnedit(id) {
        var datasingle = bloglist.filter((v, i) => { return v._id === id })
        seteditrecord(datasingle[0]);
        edithandleShow()
        // console.log(datasingle[0])
    }
    const [startDate, setStartDate] = useState(new Date());

    function editblog() {
        const data = { ...edit_record, expirydate: startDate }
        const date = new Date(data.expirydate);
        const formattedDate = date.toLocaleDateString("en-GB"); // Gives dd/mm/yyyy
        // Replace slashes with dashes
        data.expirydate = formattedDate.replace(/\//g, "-");

        // console.log(data)
        setloading(true)
        axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/doctor/blogs/save',
            headers: {
                Authorization: token,
            },
            data: {
                blogid: data._id,
                title: data.title,
                description: data.description,
                showto_doctor: data.showto_doctor,
                showto_patient: data.showto_patient,
                expirydate: data.expirydate
            }
        }).then((res) => {
            // toast('Surgery added...', { className: 'custom-toast-success' })
            Swal.fire({
                title: "Surgery Updated...",
                icon: "success",
            });
            getblog()
            seteditrecord(null)
            edithandleClose()
        }).catch(function (error) {
            console.log(error);
            toast(error.message, { className: 'custom-toast-error' })
        }).finally(() => {
            setloading(false)
        });
    }

    // show add blog model 
    const [show_ad_blog, setadblog] = useState(false);
    const handleblogClose = () => setadblog(false);
    const handleblogShow = () => setadblog(true);

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
        name: 'Expiry Date',
        cell: row => row.expirydate
    },
    {
        name: 'Action',
        cell: row => <div className='d-flex gap-3'>
            <MdEditDocument className='fs-5' onClick={() => btnedit(row._id)} />
            <MdOutlineRemoveRedEye onClick={() => btnview(row._id)} className='text-primary fs-5' />
            <MdDelete onClick={() => deleteblog(row._id)} className='text-danger fs-5' />
        </div>,
        maxWidth: '150px',
        minWidth: '150px',
        width: '150px'
    }]

    return (
        <>

            <Container fluid className='p-0 panel'>
                <Row className='g-0'>
                    <DoctorSidebar />
                    <Col xs={12} sm={9} lg={10} className='p-3'>
                        <DoctorNav doctorname={doctor && doctor.name} />

                        <div className='bg-white rounded p-3 mt-3 shadow'>
                            <Row className='mt-2 mb-3 justify-content-between'>
                                <Col xs={'auto'}>
                                    <h4>My Blogs</h4>
                                </Col>
                                <Col xs={'auto'}>
                                    <Button variant='primary' onClick={handleblogShow}>Add Blog</Button>
                                </Col>
                            </Row>
                            <DataTable columns={columns} data={bloglist ? bloglist : ''} pagination />
                        </div>
                    </Col>
                </Row>
                {/* add blog modal */}
                <Modal show={show_ad_blog} onHide={handleblogClose} centered size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>Add Surgery Detail</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row className='g-4'>
                            <Col xs={12}>
                                <Form className='row register_doctor px-2 gy-3'>
                                    <Form.Group controlId="title">
                                        <div>
                                            <Form.Label>Title</Form.Label>
                                            <Form.Control placeholder="Ex:- What is Tomato Flu: Symptoms, Causes, Treatment & Preventive Tips" name="title" value={blog.title} onChange={(e) => setblog({ ...blog, title: e.target.value })} />
                                        </div>
                                    </Form.Group>
                                    <Form.Group controlId="description">
                                        <div>
                                            <Form.Label>Description</Form.Label>
                                            <Form.Control as="textarea" placeholder="The ‘new’ virus, tomato flu, is a variant of already existing hand, " name="description" value={blog.description} onChange={(e) => setblog({ ...blog, description: e.target.value })} />
                                        </div>
                                    </Form.Group>
                                    <Form.Group controlId="expirydate">
                                        <Form.Label>Expiry Date</Form.Label>
                                        <div>
                                            <DatePicker selected={blog.expirydate}
                                                onChange={(date) => setblog({ ...blog, expirydate: date })}
                                                dateFormat="dd-MM-y"
                                                placeholderText="Select date"
                                                locale={enGB}
                                                minDate={new Date()} />
                                        </div>
                                    </Form.Group>
                                    <div className='mb-3'>
                                        <Form.Check type="switch" name="showto_doctor" label="Display Blog to doctor" id="docshow" checked={blog.showto_doctor} onChange={(e) => setblog({ ...blog, showto_doctor: e.target.checked })} />
                                        <Form.Check type="switch" name="showto_patient" label="Display Blog to patient" id="patshow" checked={blog.showto_patient} onChange={(e) => setblog({ ...blog, showto_patient: e.target.checked })} />
                                    </div>


                                </Form>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Form.Group >
                            <Form.Control type='button' value={'Add Blog'} onClick={addblog} className='theme_btn' />
                        </Form.Group>
                        <Button variant="secondary" onClick={handleblogClose}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
                {/* view blog modal */}
                {
                    single_view && single_view.map((v, i) => {
                        return (
                            <Modal show={show} onHide={handleClose} centered size="lg" key={i}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Blog Detail</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <div>
                                        <h3 className='text-center'>{v.title}</h3>
                                        <p>{v.description}</p>
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
                {/* update log modal */}
                {
                    !edit_record ? '' :
                        <Modal show={editshow} onHide={edithandleClose} centered size="lg">
                            <Modal.Header closeButton>
                                <Modal.Title>Update Blog</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Form className='row register_doctor'>
                                    <Form.Group controlId="title" className='mb-3'>
                                        <div>
                                            <Form.Label>Title</Form.Label>
                                            <Form.Control placeholder="Ex:- What is Tomato Flu: Symptoms, Causes, Treatment & Preventive Tips" name="title" value={edit_record.title} onChange={(e) => setblog({ ...edit_record, title: e.target.value })} />
                                        </div>
                                    </Form.Group>
                                    <Form.Group controlId="description" className='mb-3'>
                                        <div>
                                            <Form.Label>Description</Form.Label>
                                            <Form.Control as="textarea" placeholder="The ‘new’ virus, tomato flu, is a variant of already existing hand, " name="description" value={edit_record.description} onChange={(e) => setblog({ ...edit_record, description: e.target.value })} />
                                        </div>
                                    </Form.Group>
                                    <Form.Group controlId="expirydate" className='mb-3'>
                                        <Form.Label>Expiry Date</Form.Label>
                                        <div>
                                            <DatePicker selected={startDate}
                                                onChange={(date) => setStartDate(date)}
                                                dateFormat="dd-MM-y"
                                                placeholderText="Select date"
                                                locale={enGB}
                                                minDate={new Date()} />
                                        </div>
                                    </Form.Group>
                                    <div className='mb-3'>
                                        <Form.Check type="switch" name="showto_doctor" label="Display Blog to doctor" id="docshow" checked={edit_record.showto_doctor} onChange={(e) => seteditrecord({ ...edit_record, showto_doctor: e.target.checked })} />
                                        <Form.Check type="switch" name="showto_patient" label="Display Blog to patient" id="patshow" checked={edit_record.showto_patient} onChange={(e) => seteditrecord({ ...edit_record, showto_patient: e.target.checked })} />
                                    </div>
                                </Form>
                            </Modal.Body>
                            <Modal.Footer>
                                <Form.Group >
                                    <Form.Control type='button' value={'Update Blog'} onClick={editblog} className='theme_btn' />
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

export default D_Blog
