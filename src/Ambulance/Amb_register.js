import React, { useEffect, useState } from 'react'
import { Button, Col, Container, Form, Row } from 'react-bootstrap'
import { toast, ToastContainer } from 'react-toastify'
import Loader from '../Loader'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { City, State } from 'country-state-city'
import axios from 'axios'

const Amb_register = () => {
    var navigate = useNavigate();
    const [loading, setloading] = useState(false)

    const [states, setStates] = useState([]);
    const [selectedState, setSelectedState] = useState("");
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState("");

    useEffect(() => {

        var ambdata = JSON.parse(localStorage.getItem('ambulancedetail'));
        if (ambdata) {
            setambreg(false)
            setambotp(true)
        }
        // Load all states of India
        const indianStates = State.getStatesOfCountry("IN");
        setStates(indianStates);
    }, [])

    useEffect(() => {
        // When state changes, fetch cities
        if (selectedState) {
            const citiesList = City.getCitiesOfState("IN", selectedState);
            setCities(citiesList);
            setSelectedCity(""); // Reset city selection
            var sel_state = states.filter((v, i) => { return v.isoCode === selectedState })
            setFormData(formData => ({
                ...formData,
                state: sel_state[0].name
            }))
        } else {
            setCities([]);
            setSelectedCity("");
        }
    }, [selectedState]);

    // Form fields state
    const [formData, setFormData] = useState({
        fullname: "",
        email: "",
        mobile: "",
        password: "",
        state: "",
        city: "",
        profilepic: null,
        rc_no: "",
        rc_pic: null,
        aadhar_no: "",
        aadhar_pic: null,
        address: "",
    });

    const [amb_reg, setambreg] = useState(true);
    const [amb_otp, setambotp] = useState(false);


    // handle change
    const handleChange = (e) => {
        const { name, value, files } = e.target;
        // if (files) {
        //     setFormData((prev) => ({ ...prev, [name]: files[0] }));
        // } else {
        //     setFormData((prev) => ({ ...prev, [name]: value }));
        // }
        if (e.target.type === 'file') {
            const file = files[0];
            if (file) {
                // Store the File object and optionally the file name
                setFormData((prev) => ({
                    ...prev,
                    [name]: e.target.value,               // Actual File object
                }));
            }
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const ambulance_reg = () => {
        console.log(formData)
        setloading(true)
        // console.log(frmdoctor)
        axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/ambulance/signup',
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            data: formData
        }).then((res) => {
            toast('OTP send to your Email...', { className: 'custom-toast-success' })
            setambreg(false);
            setambotp(true);
            console.log(res)
            localStorage.setItem('ambulancedetail', JSON.stringify(res));
        }).catch(function (error) {
            console.log(error);
            // toast(error.response.data.Message, { className: 'custom-toast-error' })
        }).finally(() => {
            setloading(false)
        });
    }

    const [otp, setotp] = useState('');

    function otpverifydone() {
        console.log(formData)
        setloading(true)
        axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/ambulance/signup/otpverification',
            data: {
                "email": 'jeelahir005@gmail.com',
                "otp": otp
            }
        }).then((res) => {
            toast('OTP verify successfully...', { className: 'custom-toast-success' })
            console.log(res);
            localStorage.removeItem('ambulancedetail');
            Navigate('/ambulance')
        }).catch(function (error) {
            console.log(error);
            toast(error, { className: 'custom-toast-error' })
        }).finally(() => {
            setloading(false)
        });
    }

    return (
        <>
            <div className='min-vh-100 d-flex align-items-center panel'>
                <Container className='py-3'>
                    <Row className='justify-content-center'>
                        {
                            amb_reg === true ? <Col xs={5}>
                                <div className='register_doctor bg-white p-3 py-3 px-4 rounded-4 shadow'>
                                    <div className='text-center'>
                                        <h3>Ambulance - Register</h3>
                                        <p className='w-75 mx-auto'>Lorem Ipsum is simply dummy text of the printing and typesetting industry</p>
                                    </div>
                                    <Form as={Row} autoComplete='off' encType='multipart/form-data'>
                                        <Form.Group controlId="fullname" className='position-relative mb-3'>
                                            <Form.Label>Fullname</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="fullname"
                                                value={formData.fullname}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>

                                        <Form.Group controlId="email" className='position-relative mb-3'>
                                            <Form.Label>Email</Form.Label>
                                            <Form.Control placeholder="Enter Email" name='email' value={formData.email} onChange={handleChange} />
                                        </Form.Group>

                                        <Form.Group controlId="password" className='position-relative mb-3'>
                                            <Form.Label>Password</Form.Label>
                                            <Form.Control type='password' placeholder="Enter Password" name='password' value={formData.password} onChange={handleChange} />
                                        </Form.Group>

                                        <Form.Group controlId="mobile" className='position-relative mb-3 col-6'>
                                            <Form.Label>Mobile</Form.Label>
                                            <Form.Control type='tel' placeholder="Enter Mobile" name='mobile' value={formData.mobile} onChange={handleChange} />
                                        </Form.Group>

                                        <Form.Group controlId="profilepic" className='position-relative mb-3 col-6'>
                                            <Form.Label>Profile Photo:</Form.Label>
                                            <Form.Control
                                                type="file"
                                                name="profilepic"
                                                accept=".jpg,.png"
                                                onChange={handleChange}
                                            />
                                        </Form.Group>

                                        <Form.Group controlId="state" className='position-relative mb-3 col-6'>
                                            <Form.Label>State</Form.Label>
                                            <Form.Select
                                                name="state"
                                                value={selectedState}
                                                onChange={(e) => setSelectedState(e.target.value)}
                                            >
                                                <option value="">--Select State--</option>
                                                {states.map((state) => (
                                                    <option key={state.isoCode} value={state.isoCode}>
                                                        {state.name}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>

                                        <Form.Group controlId="city" className='position-relative mb-3 col-6'>
                                            <Form.Label>City</Form.Label>
                                            <Form.Select
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                disabled={cities.length === 0}
                                            >
                                                <option value="">--Select City--</option>
                                                {cities.map((city) => (
                                                    <option key={city.name} value={city.name}>
                                                        {city.name}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>

                                        <Form.Group controlId="rc_no" className='position-relative mb-3 col-6'>
                                            <Form.Label>RC Book No:</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="rc_no"
                                                value={formData.rc_no}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>

                                        <Form.Group controlId="rc_pic" className='position-relative mb-3 col-6'>
                                            <Form.Label>RC Book Photo:</Form.Label>
                                            <Form.Control
                                                type="file"
                                                name="rc_pic"
                                                accept=".jpg,.png"
                                                onChange={handleChange}
                                            />
                                        </Form.Group>

                                        <Form.Group controlId="aadhar_no" className='position-relative mb-3 col-6'>
                                            <Form.Label>Aadhar No:</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="aadhar_no"
                                                value={formData.aadhar_no}
                                                onChange={handleChange}
                                            />
                                        </Form.Group>

                                        <Form.Group controlId="aadhar_pic" className='position-relative mb-3 col-6'>
                                            <Form.Label>Aadhar Photo:</Form.Label>
                                            <Form.Control
                                                type="file"
                                                name="aadhar_pic"
                                                accept=".jpg,.png"
                                                onChange={handleChange}
                                            />
                                        </Form.Group>

                                        <Form.Group controlId="password" className='position-relative mb-3'>
                                            <Form.Label>Address</Form.Label>
                                            <Form.Control as={'textarea'}
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                rows={3}
                                            />
                                        </Form.Group>

                                        <Button type="button" onClick={ambulance_reg} className='btn btn-primary d-block w-100 theme_btn mt-4'>
                                            Register
                                        </Button>
                                    </Form>

                                    <div style={{ marginTop: 20 }}>
                                        Already have an account?{" "}
                                        <button
                                            onClick={() => {
                                                navigate("/ambulance");
                                            }}
                                            style={{ color: "blue", background: "none", border: "none", cursor: "pointer" }}
                                        >
                                            Login here
                                        </button>
                                    </div>
                                </div>
                            </Col> : ''
                        }
                        {
                            amb_otp === true ? <Col md={5}>
                                <div className='register_doctor bg-white p-3 py-3 px-4 rounded d-flex flex-column justify-content-between h-100'>
                                    <div className='text-center'>
                                        <h3>OTP Verification</h3>
                                        <p className='w-75 mx-auto'>Lorem Ipsum is simply dummy text of the printing and typesetting industry</p>
                                        <Form>
                                            <Form.Group as={Col} controlId="otp" className='position-relative my-3'>
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
                    </Row>
                </Container>
                <ToastContainer />
                {loading ? <Loader /> : ''}
            </div>
        </>
    )
}

export default Amb_register
