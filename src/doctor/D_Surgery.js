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
import CryptoJS from "crypto-js";
import DataTable from 'react-data-table-component';

const D_Surgery = () => {
    const SECRET_KEY = "health-emi";
    var navigate = useNavigate();
    const [loading, setloading] = useState(false)

    const [doctor, setdoctor] = useState(null)
    const [token, settoken] = useState(null)

    var incl = 'Most surgery packages typically include an initial consultation and a basic pre-surgery evaluation to assess the patient’s readiness. They also cover essential diagnostic tests such as blood reports, ECGs, X-rays, along with the complete surgical procedure cost. Charges for the operation theatre, surgeon, and anesthesia are included, as well as the standard hospital stay for a specified number of days with routine nursing care. Standard room charges (general or semi-private), basic in-hospital medications, and one post-operative follow-up visit are also generally part of the inclusive offerings.';
    var excl = 'Exclusions usually apply to any medical needs that go beyond the standard procedure. This includes extended hospital stays beyond the package limit, ICU or emergency care, and the use of premium or imported surgical materials such as specialized implants or lenses. Additional physiotherapy sessions, specialist consultations, extra follow-up visits, or any treatment related to post-surgery complications are also not included. Upgrading to deluxe or private rooms, personal or attendant meals, discharge medications, and ambulance or transport charges are typically billed separately.';
    const incl_items = incl.split(',').map(item => item.trim());
    const excl_items = excl.split(',').map(item => item.trim());
    // State to store selected items
    const [selectedinclItems, setSelectedinclItems] = useState(incl_items);
    const [selectedexclItems, setSelectedexclItems] = useState(excl_items);
    // Handle checkbox change
    const handleinclChange = (item) => {
        if (!editshow) {
            setSelectedinclItems(prev =>
                prev.includes(item)
                    ? prev.filter(i => i !== item) // Remove if already selected
                    : [...prev, item]              // Add if not selected
            );
        }
        else {
            setSelectededitinclItems(prev =>
                prev.includes(item)
                    ? prev.filter(i => i !== item) // Remove if already selected
                    : [...prev, item]              // Add if not selected
            );
        }
    };
    const handleexclChange = (item) => {
        if (!editshow) {
            setSelectedexclItems(prev =>
                prev.includes(item)
                    ? prev.filter(i => i !== item) // Remove if already selected
                    : [...prev, item]              // Add if not selected
            );
        }
        else {
            setSelectededitexclItems(prev =>
                prev.includes(item)
                    ? prev.filter(i => i !== item) // Remove if already selected
                    : [...prev, item]              // Add if not selected
            );
        }
    };


    var surgeryobj = { name: '', price: '', days: '', additional_features: '', description: '', surgerytypeid: '', doctorcategory: '', specialty: '', inclusive: incl, exclusive: excl, yearsof_experience: '', completed_surgery: '', features: 'Blade-free laser', home_visit_price: '', clinic_visit_price: '', eopd_price: '' }
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

    useEffect(() => {
        if (token) {
            getsurgery()
            getspeciality()
            getdoctorcategory()
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
        var surgerydata = { ...surgery };
        surgerydata.inclusive = selectedinclItems.join(', ')
        surgerydata.exclusive = selectedexclItems.join(', ')
        setsurgery(surgerydata)
        // console.log(surgerydata)

        setloading(true)
        axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/doctor/surgeries/save',
            headers: {
                Authorization: token,
            },
            // data: surgery
            data: surgerydata
        }).then((res) => {
            // toast('Surgery added...', { className: 'custom-toast-success' })
            Swal.fire({
                title: "Surgery Added...",
                icon: "success",
            });
            getsurgery()
            setsurgery(surgeryobj);
            handlesurClose()
        }).catch(function (error) {
            // console.log(error);
            toast(error.response.data.Message, { className: 'custom-toast-error' })
        }).finally(() => {
            setloading(false)
        });
        // console.log(surgery)
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

    // display edit surgery in model
    const [editshow, seteditShow] = useState(false);
    const [edit_record, seteditrecord] = useState(null);

    const edithandleClose = () => seteditShow(false);
    const edithandleShow = () => seteditShow(true);

    function btnedit(id) {
        var datasingle = surgerylist.filter((v, i) => { return v._id === id })
        const surgeryobj = {
            surgeryid: datasingle[0]._id,
            name: datasingle[0].name,
            price: datasingle[0].price,
            days: datasingle[0].days,
            additional_features: datasingle[0].additional_features,
            description: datasingle[0].description,
            surgerytypeid: datasingle[0].surgerytypeid._id,
            doctorcategory: datasingle[0].doctorcategory._id,
            specialty: datasingle[0].specialty,
            inclusive: datasingle[0].inclusive,
            exclusive: datasingle[0].exclusive,
            yearsof_experience: datasingle[0].yearsof_experience,
            completed_surgery: datasingle[0].completed_surgery,
            features: datasingle[0].features,
            home_visit_price: datasingle[0].home_visit_price,
            clinic_visit_price: datasingle[0].clinic_visit_price,
            eopd_price: datasingle[0].eopd_price,
        };
        const ed_incl_items = surgeryobj.inclusive.split(',').map(item => item.trim());
        const ed_excl_items = surgeryobj.exclusive.split(',').map(item => item.trim());
        setSelectededitinclItems(ed_incl_items)
        setSelectededitexclItems(ed_excl_items)
        seteditrecord(surgeryobj);
        edithandleShow()
        // console.log('edit record list', datasingle[0])
        selUpsugdoc(surgeryobj.surgerytypeid)

        // console.log(ed_incl_items, ed_excl_items)
        // console.log(incl_items, excl_items)
    }
    // state tos store edit selected items
    const [selectededitinclItems, setSelectededitinclItems] = useState([]);
    const [selectededitexclItems, setSelectededitexclItems] = useState([]);

    const seleditsurgery = (e) => {
        const { name, value } = e.target;
        seteditrecord(surgery => ({
            ...surgery,
            [name]: value
        }))
        // console.log(edit_record)
    };

    function editsurgery() {
        var editsurgerydata = { ...edit_record };
        editsurgerydata.inclusive = selectededitinclItems.join(', ')
        editsurgerydata.exclusive = selectededitexclItems.join(', ')
        seteditrecord(editsurgerydata)
        // console.log(edit_record)
        setloading(true)
        axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/doctor/surgeries/save',
            headers: {
                Authorization: token,
            },
            // data: edit_record
            data: editsurgerydata
            // {
            //     surgeryid: edit_record._id,
            //     name: edit_record.name,
            //     price: edit_record.price,
            //     days: edit_record.days,
            //     additional_features: edit_record.additional_features,
            //     description: edit_record.description,
            //     surgery_type: edit_record.surgery_type,
            //     completed_surgery: edit_record.completed_surgery,
            //     features: edit_record.features,
            //     yearsof_experience: edit_record.yearsof_experience
            // }
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

    // show add surgery model 
    const [show_ad_sur, setadsur] = useState(false);
    const handlesurClose = () => setadsur(false);
    const handlesurShow = () => setadsur(true);

    const [s_type, setstype] = useState(null)
    // get all speciality 
    const getspeciality = () => {
        setloading(true)
        axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/doctor/surgerytypes/list',
            data: {
                "search": "",
            }
        }).then((res) => {
            // console.log('speciality = ',res.data.Data)
            setstype(res.data.Data)
        }).catch(function (error) {
            // console.log(error);
            toast(error.response.data.Message, { className: 'custom-toast-error' })
        }).finally(() => {
            setloading(false)
        });
    }

    const [d_category, setdcategory] = useState(null)
    // get all doctor category 
    const getdoctorcategory = () => {
        setloading(true)
        axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/doctor/doctorcategories/list',
            data: {
                "search": "",
            }
        }).then((res) => {
            // console.log('d_category = ',res.data.Data)
            setdcategory(res.data.Data)
        }).catch(function (error) {
            // console.log(error);
            toast(error.response.data.Message, { className: 'custom-toast-error' })
        }).finally(() => {
            setloading(false)
        });
    }
    const [d_sel_cat, setdselcat] = useState([])
    const [s_type_name, setsname] = useState('')
    const schange = (e) => {
        var s_name = s_type.filter((v) => {
            return v._id === e.target.value
        })
        setsurgery({ ...surgery, surgerytypeid: e.target.value })
        setsname(s_name.surgerytypename)
        var d_data = d_category.filter((v, i) => {
            return v.surgerytypeid?._id === e.target.value
        })
        setdselcat(d_data);
        // console.log(e.target.value , d_data)
    }

    // select surgery type and doctor category when update model open
    const selUpsugdoc = (e) => {
        var s_name = s_type.filter((v) => {
            return v._id === e
        })
        setsname(s_name.surgerytypename)
        setsname(s_name.surgerytypename)
        var d_data = d_category.filter((v, i) => {
            return v.surgerytypeid?._id === e
        })
        setdselcat(d_data);
    }
    const seditchange = (e) => {
        var id = e.target.value
        // console.log(e.target.value)
        var s_name = s_type.filter((v) => {
            return v._id === id
        })
        seteditrecord({ ...edit_record, surgerytypeid: id })
        setsname(s_name.surgerytypename)
        var d_data = d_category.filter((v, i) => {
            return v.surgerytypeid?._id === id
        })
        setdselcat(d_data);
        // console.log('edit change', s_name)
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
        name: 'Surgery Name',
        cell: row => row.name
    },
    {
        name: 'Price',
        cell: row => row.price
    },
    {
        name: 'Category',
        cell: row => row.doctorcategory.categoryname
    },
    {
        name: 'Action',
        cell: row => <div className='d-flex gap-3'>
            <MdEditDocument className='fs-5' onClick={() => btnedit(row._id)} />
            <MdOutlineRemoveRedEye onClick={() => btnview(row._id)} className='text-primary fs-5' />
            <MdDelete onClick={() => deletesurgery(row._id)} className='text-danger fs-5' />
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

                        <div className='bg-white rounded p-3 shadow '>
                            <Row className='mt-2 mb-3 justify-content-between'>
                                <Col xs={'auto'}>
                                    <h4>My Surgeries</h4>
                                </Col>
                                <Col xs={'auto'}>
                                    <Button variant='primary' onClick={handlesurShow}>Add Surgery</Button>
                                </Col>
                            </Row>
                            <DataTable columns={columns} data={surgerylist ? surgerylist : ''} pagination />

                        </div>
                    </Col>
                </Row>
                {/* add surgery */}
                <Modal show={show_ad_sur} onHide={handlesurClose} centered size="xl">
                    <Modal.Header closeButton>
                        <Modal.Title>Add Surgery Detail</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row className='g-4'>
                            <Col xs={12} md={12}>
                                <div className='bg-white rounded p-3 shadow'>
                                    <Form className='row register_doctor'>
                                        <Form.Group controlId="type" className='mb-3 col-md-3'>
                                            <div className='position-relative'>
                                                <Form.Label>Surgery Type</Form.Label>
                                                <Form.Select name="surgerytypeid" value={s_type_name} onChange={schange}>
                                                    <option value={''}>Select Surgery Type</option>
                                                    {s_type?.map((v, i) => {
                                                        return (<option key={i} value={v._id}>{v.surgerytypename}</option>)
                                                    })}
                                                </Form.Select>
                                            </div>
                                        </Form.Group>
                                        <Form.Group controlId="type" className='mb-3 col-md-3'>
                                            <div className='position-relative'>
                                                <Form.Label>Doctor Category</Form.Label>
                                                <Form.Select name="doctorcategory" value={surgery.doctorcategory} onChange={selsurgery}>
                                                    <option value={''} selected disabled>Doctor Category</option>
                                                    {d_sel_cat?.map((v, i) => {
                                                        return (<option key={i} value={v._id}>{v.categoryname}</option>)
                                                    })}
                                                </Form.Select>
                                            </div>
                                        </Form.Group>
                                        <Form.Group controlId="name" className='mb-3 col-md-6'>
                                            <div className='position-relative'>
                                                <Form.Label>Surgery Name</Form.Label>
                                                <Form.Control placeholder="Ex:- Cataract Surgery" name="name" value={surgery.name} onChange={selsurgery} />
                                            </div>
                                        </Form.Group>

                                        <Form.Group controlId="price" className='mb-3 col-6 col-md-3'>
                                            <div className='position-relative'>
                                                <Form.Label>Price</Form.Label>
                                                <Form.Control placeholder="Ex:- 18000" name="price" value={surgery.price} onChange={selsurgery} />
                                            </div>
                                        </Form.Group>
                                        <Form.Group controlId="Home Visit price" className='mb-3 col-6 col-md-3'>
                                            <div className='position-relative'>
                                                <Form.Label>Home Visit Price</Form.Label>
                                                <Form.Control placeholder="Ex:- 18000" name="home_visit_price" value={surgery.home_visit_price} onChange={selsurgery} />
                                            </div>
                                        </Form.Group>
                                        <Form.Group controlId="Clinic Visit price" className='mb-3 col-6 col-md-3'>
                                            <div className='position-relative'>
                                                <Form.Label>Clinic Visit price</Form.Label>
                                                <Form.Control placeholder="Ex:- 18000" name="clinic_visit_price" value={surgery.clinic_visit_price} onChange={selsurgery} />
                                            </div>
                                        </Form.Group>
                                        <Form.Group controlId="EOPD price" className='mb-3 col-6 col-md-3'>
                                            <div className='position-relative'>
                                                <Form.Label>EOPD price</Form.Label>
                                                <Form.Control placeholder="Ex:- 18000" name="eopd_price" value={surgery.eopd_price} onChange={selsurgery} />
                                            </div>
                                        </Form.Group>


                                        <Form.Group controlId="days" className='mb-3 col-6 col-md-3'>
                                            <div className='position-relative'>
                                                <Form.Label>Days</Form.Label>
                                                {/* <Form.Control placeholder="Ex:- 1" name="days" value={surgery.days} onChange={selsurgery} /> */}
                                                <Form.Select name="days" value={surgery.days} onChange={selsurgery}>
                                                    <option value={''} selected disabled>Select Days</option>
                                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, '10+', '15+', '20+', '25+', '30+', '45+'].map((level) => (
                                                        <option key={level} value={level}>
                                                            {level} Day
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </div>
                                        </Form.Group>
                                        <Form.Group controlId="days" className='mb-3 col-6 col-md-3'>
                                            <div className='position-relative'>
                                                <Form.Label>Experiance</Form.Label>
                                                <Form.Select name="yearsof_experience" value={surgery.yearsof_experience} onChange={selsurgery}>
                                                    <option value={''} selected disabled>Select Experiance</option>
                                                    {['0+', '1+', '2+', '3+', '4+', '5+', '10+', '20+'].map((level) => (
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
                                                    {['10+', '20+', '30+', '40+', '50+', '100+', '200+', '300+', '500+', '1000+', '2000+', '5000+'].map((level) => (
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
                                                <Form.Select placeholder="Ex:- 18000" name="specialty" value={surgery.specialty} onChange={selsurgery}>
                                                    <option value={''} selected disabled>Select Feature</option>
                                                    {['General', 'Semi Private', 'Private', 'Delux'].map((v) => (
                                                        <option key={v} value={v}>
                                                            {v}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </div>
                                        </Form.Group>
                                        <Form.Group controlId="description" className='mb-3 col-12 col-md-6'>
                                            <div className='position-relative'>
                                                <Form.Label>Inclusive</Form.Label>
                                                {/* <Form.Control as="textarea" placeholder="Enter inclusive deatils" name="inclusive" value={surgery.inclusive} onChange={selsurgery} rows={5} /> */}
                                                {incl_items.map((item, incl_index) => (
                                                    <Form.Check
                                                        key={incl_index}
                                                        type="checkbox"
                                                        value={item}
                                                        id={incl_index + 'i'}
                                                        checked={selectedinclItems?.includes(item)}
                                                        onChange={() => handleinclChange(item)}
                                                        label={item}
                                                    />
                                                ))}
                                            </div>
                                        </Form.Group>
                                        <Form.Group controlId="description" className='mb-3 col-12 col-md-6'>
                                            <div className='position-relative'>
                                                <Form.Label>Exclusive</Form.Label>
                                                {/* <Form.Control as="textarea" placeholder="Enter exclusive deatils" name="exclusive" value={surgery.exclusive} onChange={selsurgery} rows={5} /> */}
                                                {excl_items.map((item, excl_index) => (
                                                    <Form.Check
                                                        key={excl_index}
                                                        type="checkbox"
                                                        value={item}
                                                        id={excl_index + 'e'}
                                                        checked={selectedexclItems?.includes(item)}
                                                        onChange={() => handleexclChange(item)}
                                                        label={item}
                                                    />
                                                ))}
                                            </div>
                                        </Form.Group>
                                        <Form.Group controlId="additional_features" className='mb-3 col-12 col-md-6'>
                                            <div className='position-relative'>
                                                <Form.Label>additional_features</Form.Label>
                                                <Form.Control placeholder="Ex:- Blade-free laser option, intraocular lens implant" name="additional_features" value={surgery.additional_features} onChange={selsurgery} />
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
                        </Row>
                    </Modal.Body>
                    {/* <Modal.Footer>
                        <Button variant="secondary" onClick={handlesurClose}>
                            Close
                        </Button>
                    </Modal.Footer> */}
                </Modal>

                {/* view single surgery */}
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
                                        <p><b>Home Visit Charge :- </b><span>&#8377;{v.home_visit_price}/-</span></p>
                                        <p><b>Clinic Visit Charge :- </b><span>&#8377;{v.clinic_visit_price}/-</span></p>
                                        <p><b>EOPD Charge :- </b><span>&#8377;{v.eopd_price}/-</span></p>
                                        <p><b>Inclusive :- </b><span>{v.inclusive}</span></p>
                                        <p><b>Exclusive :- </b><span>{v.exclusive}</span></p>
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
                {/* update surgery */}
                {!edit_record ? '' :
                    <Modal show={editshow} onHide={edithandleClose} centered size="xl">
                        <Modal.Header closeButton>
                            <Modal.Title>Update Surgery</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form className='row register_doctor'>
                                <Form.Group controlId="surgerytypeid" className='mb-3 col-md-3'>
                                    <div className='position-relative'>
                                        <Form.Label>Surgery Type</Form.Label>
                                        <Form.Select name="surgerytypeid" value={s_type_name} onChange={seditchange}>
                                            <option selected disabled value={''}>Select Surgery Type</option>
                                            {s_type?.map((v, i) => {
                                                return (<option key={i} value={v._id} selected={edit_record.surgerytypeid === v._id ? true : false}>{v.surgerytypename}</option>)
                                            })}
                                        </Form.Select>
                                    </div>
                                </Form.Group>
                                <Form.Group controlId="doctorcategory" className='mb-3 col-md-3'>
                                    <div className='position-relative'>
                                        <Form.Label>Doctor Category</Form.Label>
                                        <Form.Select name="doctorcategory" value={edit_record.doctorcategory} onChange={seleditsurgery}>
                                            <option value={''} selected disabled>Doctor Category</option>
                                            {d_sel_cat?.map((v, i) => {
                                                return (<option key={i} value={v._id} selected={edit_record.doctorcategory === v._id ? true : false}>{v.categoryname}</option>)
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

                                <Form.Group controlId="Home Visit price" className='mb-3 col-6 col-md-3'>
                                    <div className='position-relative'>
                                        <Form.Label>Home Visit Price</Form.Label>
                                        <Form.Control placeholder="Ex:- 18000" name="home_visit_price" value={edit_record.home_visit_price} onChange={seleditsurgery} />
                                    </div>
                                </Form.Group>
                                <Form.Group controlId="Clinic Visit price" className='mb-3 col-6 col-md-3'>
                                    <div className='position-relative'>
                                        <Form.Label>Clinic Visit price</Form.Label>
                                        <Form.Control placeholder="Ex:- 18000" name="clinic_visit_price" value={edit_record.clinic_visit_price} onChange={seleditsurgery} />
                                    </div>
                                </Form.Group>
                                <Form.Group controlId="EOPD price" className='mb-3 col-6 col-md-3'>
                                    <div className='position-relative'>
                                        <Form.Label>EOPD price</Form.Label>
                                        <Form.Control placeholder="Ex:- 18000" name="eopd_price" value={edit_record.eopd_price} onChange={seleditsurgery} />
                                    </div>
                                </Form.Group>

                                <Form.Group controlId="days" className='mb-3 col-3'>
                                    <div className='position-relative'>
                                        <Form.Label>Days</Form.Label>
                                        {/* <Form.Control placeholder="Ex:- 1" name="days" value={edit_record.days} onChange={seleditsurgery} /> */}
                                        <Form.Select name="days" value={edit_record.days} onChange={seleditsurgery}>
                                            <option value={''} selected disabled>Select Experiance</option>
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, '10+', '15+', '20+', '25+', '30+', '45+'].map((level) => (
                                                <option key={level} value={level} selected={edit_record.days === level ? true : false}>
                                                    {level} Days
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </div>
                                </Form.Group>
                                <Form.Group controlId="yearsof_experience" className='mb-3 col-6 col-md-3'>
                                    <div className='position-relative'>
                                        <Form.Label>Experiance</Form.Label>
                                        <Form.Select name="yearsof_experience" value={edit_record.yearsof_experience} onChange={seleditsurgery}>
                                            <option value={''} selected disabled>Select Experiance</option>
                                            {['0+', '1+', '2+', '3+', '4+', '5+', '10+', '20+'].map((level) => (
                                                <option key={level} value={level} selected={edit_record.yearsof_experience === level ? true : false}>
                                                    {level} years
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </div>
                                </Form.Group>
                                <Form.Group controlId="completed_surgery" className='mb-3 col-6 col-md-3'>
                                    <div className='position-relative'>
                                        <Form.Label>completed Surgery</Form.Label>
                                        <Form.Select name="completed_surgery" value={edit_record.completed_surgery} onChange={seleditsurgery}>
                                            <option value={''} selected disabled>Select Completed Surgery</option>
                                            {['10+', '20+', '30+', '40+', '50+', '100+', '200+', '300+', '500+', '1000+', '2000+', '5000+'].map((level) => (
                                                <option key={level} value={level} selected={edit_record.completed_surgery === level ? true : false}>
                                                    {level}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </div>
                                </Form.Group>

                                <Form.Group controlId="specialty" className='mb-3 col-12 col-md-3'>
                                    <div className='position-relative'>
                                        <Form.Label>Features</Form.Label>
                                        <Form.Select name="specialty" value={edit_record.specialty} onChange={seleditsurgery}>
                                            <option value={''} selected disabled>Select Feature</option>
                                            {['General', 'Semi Private', 'Private', 'Delux'].map((v) => (
                                                <option key={v} value={v}>
                                                    {v}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </div>
                                </Form.Group>
                                <Form.Group controlId="inclusive" className='mb-3 col-12 col-md-6'>
                                    <div className='position-relative'>
                                        <Form.Label>Inclusive</Form.Label>
                                        {incl_items.map((item, incl_index) => (
                                            <Form.Check
                                                key={incl_index}
                                                type="checkbox"
                                                value={item}
                                                id={incl_index + 'iedit'}
                                                checked={selectededitinclItems?.includes(item)}
                                                onChange={() => handleinclChange(item)}
                                                label={item}
                                            />
                                        ))}
                                    </div>
                                </Form.Group>
                                <Form.Group controlId="exclusive" className='mb-3 col-12 col-md-6'>
                                    <div className='position-relative'>
                                        <Form.Label>Exclusive</Form.Label>
                                        {excl_items.map((item, excl_index) => (
                                            <Form.Check
                                                key={excl_index}
                                                type="checkbox"
                                                value={item}
                                                id={excl_index + 'eedit'}
                                                checked={selectededitexclItems?.includes(item)}
                                                onChange={() => handleexclChange(item)}
                                                label={item}
                                            />
                                        ))}
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
                                <Form.Group className='mb-3 col-12'>
                                    <Form.Control type='button' value={'Update Surgery'} onClick={editsurgery} className='theme_btn' />
                                </Form.Group>
                            </Form>
                        </Modal.Body>
                    </Modal>
                }
            </Container>
            <ToastContainer />
            {loading ? <Loader /> : ''}
        </>
    )
}

export default D_Surgery