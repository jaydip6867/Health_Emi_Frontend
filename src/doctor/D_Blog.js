import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import DoctorNav from './DoctorNav';
import { Button, Col, Container, Form, Modal, OverlayTrigger, Row, ToastContainer, Tooltip } from 'react-bootstrap';
import DoctorSidebar from './DoctorSidebar';
import CryptoJS from "crypto-js";
import DatePicker from 'react-datepicker';
import { enGB } from 'date-fns/locale';
import axios from 'axios';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import Loader from '../Loader';
import { MdDeleteOutline, MdOutlineEditCalendar, MdOutlineRemoveRedEye } from 'react-icons/md';
import SmartDataTable from '../components/SmartDataTable';

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
    const [displist, setdisplist] = useState(null)
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
            setdisplist(res.data.Data)
        }).catch(function (error) {
            // console.log(error);
            toast(error.response.data.Message, { className: 'custom-toast-error' })
        }).finally(() => {
            setloading(false)
        });
    }

    // ADD blog

    const blog_var = { title: '', description: '', showto_doctor: false, showto_patient: true, expirydate: null, image: '' };
    const [blog, setblog] = useState(blog_var)
    const [selectedImage, setSelectedImage] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)

    // Image upload function
    async function uploadImage(imageFile = selectedImage) {
        if (!imageFile) return null;

        const formData = new FormData();
        formData.append('file', imageFile);

        try {
            const response = await axios({
                method: 'post',
                url: 'https://healtheasy-o25g.onrender.com/user/upload',
                data: formData,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data.Data.url;
        } catch (error) {
            // console.error('Image upload failed:', error);
            toast('Image upload failed', { className: 'custom-toast-error' });
            return null;
        }
    }

    async function addblog() {
        setloading(true)

        try {
            // Upload image first if selected
            let imageUrl = '';
            if (selectedImage) {
                imageUrl = await uploadImage();
                if (!imageUrl) {
                    setloading(false)
                    return; // Stop if image upload failed
                }
            }
            // console.log(imageUrl)

            const data = { ...blog, image: imageUrl }
            const date = new Date(data.expirydate);
            const formattedDate = date.toLocaleDateString("en-GB"); // Gives dd/mm/yyyy
            // Replace slashes with dashes
            data.expirydate = formattedDate.replace(/\//g, "-");

            if (data.expirydate === '01-01-1970') {
                data.expirydate = ''
            }

            // console.log(data)

            const response = await axios({
                method: 'post',
                url: 'https://healtheasy-o25g.onrender.com/doctor/blogs/save',
                headers: {
                    Authorization: token,
                },
                data: data
            });

            Swal.fire({
                title: "Blog Added...",
                icon: "success",
            });
            getblog()
            setblog(blog_var);
            setSelectedImage(null);
            setImagePreview(null);
            handleblogClose()

        } catch (error) {
            // console.log(error);
            toast(error.response?.data?.Message || error.message, { className: 'custom-toast-error' })
        } finally {
            setloading(false)
        }
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
        console.log(datasingle);
    }

    // Edit Blog display surgery in model
    const [editshow, seteditShow] = useState(false);
    const [edit_record, seteditrecord] = useState(null);
    const [editSelectedImage, setEditSelectedImage] = useState(null)
    const [editImagePreview, setEditImagePreview] = useState(null)

    const edithandleClose = () => seteditShow(false);
    const edithandleShow = () => seteditShow(true);

    function btnedit(id) {
        var datasingle = bloglist.filter((v, i) => { return v._id === id })
        seteditrecord({ ...datasingle[0], oldImage: datasingle[0].image });
        // Set existing image preview if available
        if (datasingle[0]?.image) {
            setEditImagePreview(datasingle[0].image);
        } else {
            setEditImagePreview(null);
        }
        // Parse existing expiry date (expected dd-mm-yyyy) and set date picker
        if (datasingle[0]?.expirydate) {
            try {
                const parts = String(datasingle[0].expirydate).split('-');
                if (parts.length === 3) {
                    const d = parseInt(parts[0], 10);
                    const m = parseInt(parts[1], 10) - 1;
                    const y = parseInt(parts[2], 10);
                    const parsed = new Date(y, m, d);
                    if (!isNaN(parsed)) setStartDate(parsed);
                }
            } catch (e) {
                setStartDate(null);
            }
        } else {
            setStartDate(null);
        }
        setEditSelectedImage(null);
        edithandleShow()
        // console.log(datasingle[0])
    }
    const [startDate, setStartDate] = useState(null);

    async function editblog() {
        setloading(true)
        console.log(edit_record)
        try {
            // Decide image URL: keep existing unless a new file is selected
            let imageUrl = edit_record?.oldImage || edit_record?.image || '';
            if (editSelectedImage) {
                // Remove old image if exists (best-effort)
                if (edit_record.oldImage) {
                    try {
                        await axios({
                            method: "post",
                            url: "https://healtheasy-o25g.onrender.com/user/upload/removeimage",
                            headers: {
                                Authorization: token,
                                "Content-Type": "application/json"
                            },
                            data: { path: edit_record.oldImage }
                        });
                    } catch (error) { }
                }
                const uploadedUrl = await uploadImage(editSelectedImage);
                if (!uploadedUrl) {
                    setloading(false)
                    return; // Stop if image upload failed
                }
                imageUrl = uploadedUrl;
            }

            // Expiry date handling
            let expiryOut = edit_record?.expirydate || '';
            if (startDate) {
                const date = new Date(startDate);
                const formattedDate = date.toLocaleDateString("en-GB").replace(/\//g, "-");
                expiryOut = (formattedDate === '01-01-1970') ? '' : formattedDate;
            }

            const response = await axios({
                method: 'post',
                url: 'https://healtheasy-o25g.onrender.com/doctor/blogs/save',
                headers: {
                    Authorization: token,
                },
                data: {
                    blogid: edit_record?._id,
                    title: edit_record?.title,
                    description: edit_record?.description,
                    showto_doctor: edit_record?.showto_doctor,
                    showto_patient: edit_record?.showto_patient,
                    expirydate: expiryOut,
                    image: imageUrl
                }
            });

            Swal.fire({
                title: "Blog Updated...",
                icon: "success",
            });
            getblog()
            seteditrecord(null)
            setEditSelectedImage(null)
            setEditImagePreview(null)
            edithandleClose()

        } catch (error) {
            toast(error.response?.data?.Message || error.message, { className: 'custom-toast-error' })
        } finally {
            setloading(false)
        }
    }

    // show add blog model 
    const [show_ad_blog, setadblog] = useState(false);
    const handleblogClose = () => setadblog(false);
    const handleblogShow = () => setadblog(true);


    const renderTooltip = (label) => (props) => (
        <Tooltip id="button-tooltip" {...props}>
            {label} Blog
        </Tooltip>
    );
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

    // table data
    const columns = [{
        name: 'No',
        selector: (row, index) => index + 1,
        width: '80px',
    }, {
        name: 'Title',
        selector: (row) => row.title || '',
        cell: row => <span className="fw-medium">{row.title}</span>,
    },
    {
        name: 'Description',
        selector: (row) => row.description || '',
        cell: row => <span style={{ color: '#6B7280', fontSize: '14px' }}>{row.description}</span>,
    },
    {
        name: 'Expiry Date',
        selector: row => row.expirydate || 'Not Defined',
        cell: row => <>{row.expirydate === '' ? 'Not Defined' : row.expirydate}</>,
    },
    {
        name: 'Action',
        cell: row => (
            <div className="d-flex align-items-center gap-1">
                <OverlayTrigger placement="top" overlay={renderTooltip('Edit')}>
                    <button
                        className="btn btn-sm p-1"
                        style={{
                            border: 'none',
                            backgroundColor: 'transparent',
                            color: '#10B981',
                            borderRadius: '6px'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#F0FDF4'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        onClick={() => btnedit(row._id)}
                    >
                        <MdOutlineEditCalendar size={18} />
                    </button>
                </OverlayTrigger>

                <OverlayTrigger placement="top" overlay={renderTooltip('Delete')}>
                    <button
                        className="btn btn-sm p-1"
                        style={{
                            border: 'none',
                            backgroundColor: 'transparent',
                            color: '#EF4444',
                            borderRadius: '6px'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#FEF2F2'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        onClick={() => deleteblog(row._id)}
                    >
                        <MdDeleteOutline size={18} />
                    </button>
                </OverlayTrigger>

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
            </div>
        )
        ,
        width: '150px'
    }]

    const [search, setSearch] = useState('');
    const searchbox = (e) => {
        setSearch(e.target.value)
        var data = bloglist.filter(items => items.title.includes(e.target.value))
        setdisplist(data)
        // console.log(data)
    }


    return (
        <>

            <Container fluid className='p-0 panel'>
                <Row className='g-0'>
                    <DoctorSidebar />
                    <Col xs={12} md={9} lg={10} className='p-3'>
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
                            <SmartDataTable columns={columns} data={displist ? displist : []} pagination customStyles={customTableStyles} />
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
                                    <Form.Group controlId="expirydate" className='col-4'>
                                        <Form.Label>Expiry Date</Form.Label>
                                        <div>
                                            <DatePicker selected={blog.expirydate}
                                                onChange={(date) => setblog({ ...blog, expirydate: date })}
                                                dateFormat="dd-MM-y"
                                                placeholderText="Select date"
                                                locale={enGB}
                                                value={blog.expirydate}
                                                minDate={new Date()} />
                                        </div>
                                        <div className='mb-3 mt-4'>
                                            <Form.Check type="switch" name="showto_doctor" label="Display Blog to doctor" id="docshow" checked={blog.showto_doctor} onChange={(e) => setblog({ ...blog, showto_doctor: e.target.checked })} />
                                            <Form.Check type="switch" name="showto_patient" label="Display Blog to patient" id="patshow" checked={blog.showto_patient} onChange={(e) => setblog({ ...blog, showto_patient: e.target.checked })} />
                                        </div>
                                    </Form.Group>
                                    <Form.Group className='col-8'>
                                        <Form.Label>Blog Image</Form.Label>
                                        <Form.Control
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setSelectedImage(file);
                                                    const reader = new FileReader();
                                                    reader.onload = (e) => {
                                                        setImagePreview(e.target.result);
                                                    };
                                                    reader.readAsDataURL(file);
                                                } else {
                                                    setSelectedImage(null);
                                                    setImagePreview(null);
                                                }
                                            }}
                                        />
                                        {imagePreview && (
                                            <div className="mt-3">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    style={{
                                                        maxWidth: '200px',
                                                        maxHeight: '200px',
                                                        objectFit: 'cover',
                                                        border: '1px solid #ddd',
                                                        borderRadius: '4px'
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </Form.Group>


                                </Form>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Form.Group >
                            <Form.Control type='button' value={'Add Blog'} onClick={addblog} className='theme_btn' />
                        </Form.Group>
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
                                    <Row>
                                        <Col xs={12}>
                                            <div className='label_box'>
                                                <span className="label_title">Title:</span>
                                                <p>{v?.title}</p>
                                            </div>
                                        </Col>
                                        <Col xs={12}>
                                            <div className='label_box'>
                                                <span className="label_title">Description:</span>
                                                <p>{v?.description}</p>
                                            </div>
                                        </Col>
                                        <Col xs={12}>
                                            <div className="label_box">
                                                <span className="label_title">Image:</span>
                                                {!v?.image || v?.image === '' ? <p>No Image Specified.</p> : <img src={v?.image} alt={`${v?.title} blog...`} className="w-50 img-thumbnail" style={{ objectFit: 'cover', borderRadius: '10px', maxHeight: '200px', maxWidth: '200px' }} />}
                                            </div>
                                        </Col>
                                    </Row>
                                </Modal.Body>
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
                                            <Form.Control placeholder="Ex:- What is Tomato Flu: Symptoms, Causes, Treatment & Preventive Tips" name="title" value={edit_record.title} onChange={(e) => seteditrecord({ ...edit_record, title: e.target.value })} />
                                        </div>
                                    </Form.Group>
                                    <Form.Group controlId="description" className='mb-3'>
                                        <div>
                                            <Form.Label>Description</Form.Label>
                                            <Form.Control as="textarea" placeholder="The ‘new’ virus, tomato flu, is a variant of already existing hand, " name="description" value={edit_record.description} onChange={(e) => seteditrecord({ ...edit_record, description: e.target.value })} />
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
                                    <Form.Group controlId="editImage" className='mb-3'>
                                        <Form.Label>Blog Image</Form.Label>
                                        <Form.Control
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setEditSelectedImage(file);
                                                    const reader = new FileReader();
                                                    reader.onload = (e) => {
                                                        setEditImagePreview(e.target.result);
                                                    };
                                                    reader.readAsDataURL(file);
                                                } else {
                                                    setEditSelectedImage(null);
                                                    setEditImagePreview(edit_record?.image || null);
                                                }
                                            }}
                                        />
                                        {editImagePreview && (
                                            <div className="mt-3">
                                                <img
                                                    src={editImagePreview}
                                                    alt="Preview"
                                                    style={{
                                                        maxWidth: '200px',
                                                        maxHeight: '200px',
                                                        objectFit: 'cover',
                                                        border: '1px solid #ddd',
                                                        borderRadius: '4px'
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </Form.Group>
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
