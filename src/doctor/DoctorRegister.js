import React, { useEffect, useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Col, Container, Row, Button, Form } from 'react-bootstrap';
import './css/doctor.css';
import { AiOutlinePhone, AiOutlineUser } from 'react-icons/ai';
import { FaRegEnvelope } from 'react-icons/fa';
import { CiLock, CiLocationOn } from 'react-icons/ci';
import { Link, useNavigate } from 'react-router-dom';
import DoctorTestimonial from './DoctorTestimonial';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import Loader from '../Loader';
import { Country, State, City } from 'country-state-city';

const DoctorRegister = () => {

    var navigate = useNavigate();

    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    const [selectedCountryCode, setSelectedCountryCode] = useState("");
    const [selectedStateCode, setSelectedStateCode] = useState("");

    // Fetch all countries when component mounts
    useEffect(() => {
        setCountries(Country.getAllCountries());
    }, []);

    // Function to handle all initial data
    function getalldataofcsc() {
        setCountries(Country.getAllCountries());
        // This would get all states, not filtered:
        const allStates = State.getAllStates();
        console.log("All states:", allStates);
    }

    // When user selects a country
    const handleCountryChange = (e) => {
        const countryCode = e.target.value;
        setSelectedCountryCode(countryCode);
        const { name, value } = e.target;
        var sel_contry = countries.filter((v,i)=>{return value === v.isoCode})
        setdocprofile(frmdocprofile => ({
            ...frmdocprofile,
            [name]: sel_contry[0].name
        }))

        const filteredStates = State.getStatesOfCountry(countryCode);
        setStates(filteredStates);
        setCities([]);
        setSelectedStateCode("");
    };

    // When user selects a state
    const handleStateChange = (e) => {
        const stateCode = e.target.value;
        setSelectedStateCode(stateCode);
        const { name, value } = e.target;
        var sel_state = states.filter((v,i)=>{return value === v.isoCode})
        setdocprofile(frmdocprofile => ({
            ...frmdocprofile,
            [name]: sel_state[0].name
        }))

        const filteredCities = City.getCitiesOfState(selectedCountryCode, stateCode);
        setCities(filteredCities);
    };


    const [loading, setloading] = useState(false);

    const [doc_reg, setdocreg] = useState(true);
    const [doc_otp, setdocotp] = useState(false);
    const [doc_reg2, setdocreg2] = useState(false);
    const [doc_next1, setdocnext1] = useState(false);

    var frmdata = {
        name: '',
        email: '',
        gender: '',
        mobile: '',
        pincode: '',
        password: '',
    }

    var profile_data= {
        specialty:'',
        sub_specialty:'',
        degree_registration_no:'',
        qualification:'',
        experience:'',
        hospital_name:'',
        hospital_address:'',
        country:'',
        state:'',
        city:'',
        identityproof:''
    }
    const [frmdoctor, setfrmdoctor] = useState(frmdata);
    const [frmdocprofile, setdocprofile] = useState(profile_data);

    const selfrmdata = (e) => {
        const { name, value } = e.target;
        doc_reg ?
        setfrmdoctor(frmdoctor => ({
            ...frmdoctor,
            [name]: value
        })) : setdocprofile(frmdocprofile => ({
            ...frmdocprofile,
            [name]: value
        }))
    };

    function send_doctor_otp() {
        setloading(true)
        // console.log(frmdoctor)
        axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/doctor/signup',
            data: frmdoctor
        }).then((res) => {
            toast('OTP send to your Email...', { className: 'custom-toast-success' })
            setdocreg(false);
            setdocotp(true);
        }).catch(function (error) {
            // console.log(error.response.data);
            toast(error.response.data.Message, { className: 'custom-toast-error' })
        }).finally(() => {
            setloading(false)
        });
    }

    const [otp, setotp] = useState('');

    function otpverifydone() {
        console.log(frmdoctor)
        setloading(true)
        axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/doctor/signup/otpverification',
            data: {
                "email": frmdoctor.email,
                "otp": otp
            }
        }).then((res) => {
            toast('OTP verify successfully...', { className: 'custom-toast-success' })
            setdocotp(false);
            setdocreg2(true);
            console.log(res);
            localStorage.setItem('doctordetail',JSON.stringify(res));
            // Navigate('/doctor')
        }).catch(function (error) {
            console.log(error);
            toast(error, { className: 'custom-toast-error' })
        }).finally(() => {
            setloading(false)
        });
    }

    function profileadd() {
        console.log(frmdocprofile)
        var doctordata = JSON.parse(localStorage.getItem('doctordetail'));
        var token = doctordata.data.Data.accessToken
        // console.log('token= ',doctordata.data.Data.accessToken)
        setloading(true)
        axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/doctor/profile/savebasicdetails',
            headers:{
                Authorization: `Bearer ${token}`,
            },
            data: frmdocprofile
        }).then((res) => {
            toast('Profile create successfully...', { className: 'custom-toast-success' })
            navigate('/doctor')
            localStorage.removeItem('doctordetail')
        }).catch(function (error) {
            console.log(error);
            toast(error.response.data.Message, { className: 'custom-toast-error' })
        }).finally(() => {
            setloading(false)
        });
        // setdocreg2(false);
        // setdocnext1(true);
    }


    return (
        <div className='min-vh-100 d-flex align-items-center'>
            <Container className='py-3'>
                <Row>
                    <DoctorTestimonial />
                    {
                        doc_reg === true ? <Col md={5}>
                            <div className='register_doctor bg-white p-3 py-3 px-4 rounded'>
                                <div className='text-center'>
                                    <h3>Doctor - Sign up</h3>
                                    <p className='w-75 mx-auto'>Lorem Ipsum is simply dummy text of the printing and typesetting industry</p>
                                </div>
                                <Form>
                                    <Form.Group as={Col} controlId="fullname" className='position-relative mb-3'>
                                        <Form.Label>Full Name</Form.Label>
                                        <Form.Control type="text" placeholder="Full Name" className='frm_input' name="name" value={frmdoctor.name} onChange={selfrmdata} />
                                        <AiOutlineUser className='icon_input' />
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="email" className='position-relative mb-3'>
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control type="email" placeholder="Email" className='frm_input' name="email" value={frmdoctor.email} onChange={selfrmdata} />
                                        <FaRegEnvelope className='icon_input' />
                                    </Form.Group>

                                    <Form.Group controlId="mobile" className='position-relative mb-3'>
                                        <Form.Label>Mobile No.</Form.Label>
                                        <Form.Control placeholder="Mobile No." className='frm_input' name='mobile' value={frmdoctor.mobile} onChange={selfrmdata} />
                                        <AiOutlinePhone className='icon_input' />
                                    </Form.Group>

                                    <Form.Group controlId="gender" className='position-relative mb-3'>
                                        <Form.Label>Gender </Form.Label>
                                        <div className='d-flex gap-3'>
                                            <label><Form.Check type='radio' name='gender' value={'Male'} className='d-inline-block me-2' onChange={selfrmdata} /> Male</label>
                                            <label><Form.Check type='radio' name='gender' value={'Female'} className='d-inline-block me-2' onChange={selfrmdata} /> Female</label>
                                        </div>
                                    </Form.Group>

                                    <Form.Group controlId="mobile" className='position-relative mb-3'>
                                        <Form.Label>Pincode</Form.Label>
                                        <Form.Control placeholder="Pincode" className='frm_input' name='pincode' value={frmdoctor.pincode} onChange={selfrmdata} />
                                        <CiLocationOn className='icon_input' />
                                    </Form.Group>

                                    <Form.Group controlId="password" className='position-relative mb-3'>
                                        <Form.Label>Password</Form.Label>
                                        <Form.Control type='password' placeholder="Password" className='frm_input' name='password' value={frmdoctor.password} onChange={selfrmdata} />
                                        <CiLock className='icon_input' />
                                    </Form.Group>

                                    {/* <Form.Group controlId="password" className='position-relative mb-3'>
                                        <Form.Label>Confirm Password</Form.Label>
                                        <Form.Control placeholder="Confirm Password" />
                                        <CiLock className='icon_input' />
                                    </Form.Group> */}

                                    <Button type="button" onClick={send_doctor_otp} className='d-block w-100 theme_btn mt-3'>
                                        Get OTP
                                    </Button>
                                </Form>
                                <div className='form_bottom_div text-center mt-3'>
                                    <p>Already have an Account? <Link to={'/doctor'} className='form-link'>Login</Link> </p>
                                </div>
                            </div>
                        </Col> : ''
                    }
                    {
                        doc_otp === true ? <Col md={5}>
                            <div className='register_doctor bg-white p-3 py-3 px-4 rounded d-flex flex-column justify-content-between h-100'>
                                <div className='text-center'>
                                    <h3>OTP Verification</h3>
                                    <p className='w-75 mx-auto'>Lorem Ipsum is simply dummy text of the printing and typesetting industry</p>
                                    <Form>
                                        <Form.Group as={Col} controlId="fullname" className='position-relative my-3'>
                                            <Form.Control type="text" name='otp' value={otp} onChange={(e) => setotp(e.target.value)} placeholder="Ex:- 1234" className='otpfield' pattern='[0-9]{4}' />
                                        </Form.Group>
                                    </Form>
                                    <div className='form_bottom_div text-end mt-3'>
                                        <p><Link className='form-link'>Resend OTP ?</Link> </p>
                                    </div>
                                </div>

                                <Button type="button" onClick={otpverifydone} className='d-block w-100 theme_btn my-3'>
                                    Verify OTP
                                </Button>
                            </div>
                        </Col> : ''
                    }
                    {
                        doc_reg2 === true ? <Col md={5}>
                            <div className='register_doctor bg-white p-3 py-3 px-4 rounded'>
                                <div className='text-center'>
                                    <h3>Doctor Profile Details</h3>
                                    <p className='w-75 mx-auto'>Lorem Ipsum is simply dummy text of the printing and typesetting industry</p>
                                </div>
                                <Form as={Row}>
                                    <Form.Group as={Col} controlId="Speciality" className='mb-3 col-6'>
                                        <div className='position-relative'>
                                            <Form.Label>Speciality</Form.Label>
                                            <Form.Control type="text" placeholder="Ex:- Cardiology" className='frm_input' name="specialty" value={frmdocprofile.specialty} onChange={selfrmdata} />
                                            <AiOutlineUser className='icon_input' />
                                        </div>
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="SubSpeciality" className='mb-3 col-6'>
                                        <div className='position-relative'>
                                            <Form.Label>Sub Speciality</Form.Label>
                                            <Form.Control type="email" placeholder="Ex:- Echocardiography" className='frm_input' name="sub_specialty" value={frmdocprofile.sub_specialty} onChange={selfrmdata} />
                                            <FaRegEnvelope className='icon_input' />
                                        </div>
                                    </Form.Group>

                                    <Form.Group controlId="Degree" className='mb-3 col-6'>
                                        <div className='position-relative'>
                                            <Form.Label>Degree Registration No.</Form.Label>
                                            <Form.Control placeholder="Ex:- Dk4567" className='frm_input' name="degree_registration_no" value={frmdocprofile.degree_registration_no} onChange={selfrmdata} />
                                            <AiOutlinePhone className='icon_input' />
                                        </div>
                                    </Form.Group>

                                    <Form.Group controlId="Qualification" className='mb-3 col-6'>
                                        <div className='position-relative'>
                                            <Form.Label>Qualification</Form.Label>
                                            <Form.Control placeholder="Ex:- D.H.M.S, MD" className='frm_input' name="qualification" value={frmdocprofile.qualification} onChange={selfrmdata} />
                                            <CiLock className='icon_input' />
                                        </div>
                                    </Form.Group>

                                    <Form.Group controlId="Experience" className='mb-3 col-6'>
                                        <div className='position-relative'>
                                            <Form.Label>Experience</Form.Label>
                                            <Form.Control placeholder="Ex:- 5 Years" className='frm_input' name="experience" value={frmdocprofile.experience} onChange={selfrmdata} />
                                            <CiLock className='icon_input' />
                                        </div>
                                    </Form.Group>

                                    <Form.Group controlId="Hospitalname" className='mb-3 col-6'>
                                        <div className='position-relative'>
                                            <Form.Label>Hospital Name</Form.Label>
                                            <Form.Control placeholder="Enter Hospital Name" className='frm_input' name="hospital_name" value={frmdocprofile.hospital_name} onChange={selfrmdata} />
                                            <CiLock className='icon_input' />
                                        </div>
                                    </Form.Group>

                                    <Form.Group controlId="Hospitaladdress" className='mb-3 col-12'>
                                        <div className='position-relative'>
                                            <Form.Label>Hospital Address</Form.Label>
                                            <Form.Control as="textarea" placeholder="Enter Hospital Address" name="hospital_address" value={frmdocprofile.hospital_address} onChange={selfrmdata} />
                                        </div>
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="Country" className='mb-3 col-6'>
                                        <div className='position-relative'>
                                            <Form.Label>Country</Form.Label>
                                            <Form.Select className='frm-select' name='country' onChange={handleCountryChange} value={selectedCountryCode}>
                                               {countries.map((country) => (
                                                    <option key={country.isoCode} value={country.isoCode}>
                                                        {country.name}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </div>
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="State" className='mb-3 col-6'>
                                        <div className='position-relative'>
                                            <Form.Label>State</Form.Label>
                                            <Form.Select className='frm-select' name='state' onChange={handleStateChange} value={selectedStateCode} disabled={!selectedCountryCode}>
                                                {states.map((state) => (
                                                    <option key={state.isoCode} value={state.isoCode}>
                                                        {state.name}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </div>
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="City" className='mb-3 col-6'>
                                        <div className='position-relative'>
                                            <Form.Label>City</Form.Label>
                                            <Form.Select className='frm-select' name='city' onChange={selfrmdata} disabled={!selectedStateCode}>
                                                {
                                                    cities.map((vc, vi) => {
                                                        return (<option key={vi} value={vc.name}>{vc.name}</option>)
                                                    })
                                                }
                                            </Form.Select>
                                        </div>
                                    </Form.Group>

                                    <Form.Group controlId="password" className='mb-3 col-6'>
                                        <div className='position-relative'>
                                            <Form.Label>Upload Identify Document</Form.Label>
                                            <Form.Control type="file" placeholder="Experience" className='upload_file_doc' />
                                        </div>
                                    </Form.Group>

                                    <Button type="button" onClick={profileadd} className='d-block w-100 theme_btn my-3'>
                                        Submit Profile
                                    </Button>
                                </Form>
                            </div>
                        </Col> : ''
                    }
                    {/* {
                        doc_next1 === true ? <Col md={5}>
                            <div className='register_doctor bg-white p-3 py-3 px-4 rounded'>
                                <div className='text-center'>
                                    <h3>Signup</h3>
                                    <p className='w-75 mx-auto'>Lorem Ipsum is simply dummy text of the printing and typesetting industry</p>
                                </div>
                                <Form>
                                    <Form.Group as={Col} controlId="fullname" className='position-relative mb-3'>
                                        <Form.Label>Country</Form.Label>
                                        <Form.Control type="text" placeholder="Country" />
                                        <AiOutlineUser className='icon_input' />
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="email" className='position-relative mb-3'>
                                        <Form.Label>State</Form.Label>
                                        <Form.Control type="text" placeholder="State" />
                                        <FaRegEnvelope className='icon_input' />
                                    </Form.Group>

                                    <Form.Group controlId="mobile" className='position-relative mb-3'>
                                        <Form.Label>Country</Form.Label>
                                        <Form.Control placeholder="Country" />
                                        <AiOutlinePhone className='icon_input' />
                                    </Form.Group>

                                    <Form.Group controlId="password" className='position-relative mb-3'>
                                        <Form.Label>Pincode</Form.Label>
                                        <Form.Control placeholder="Pincode" />
                                        <CiLock className='icon_input' />
                                    </Form.Group>

                                    <Form.Group controlId="password" className='position-relative mb-3'>
                                        <Form.Label>Upload Identify Document</Form.Label>
                                        <Form.Control type="file" placeholder="Experience" className='upload_file_doc' />
                                    </Form.Group>

                                    <Link type="button" to={'/doctor'} className='btn btn-primary d-block w-100 theme_btn my-3'>
                                        Next
                                    </Link>
                                </Form>
                            </div>
                        </Col> : ''
                    } */}
                </Row>
            </Container>
            <ToastContainer />
            {loading ? <Loader />:''}
        </div>
    )
}

export default DoctorRegister
