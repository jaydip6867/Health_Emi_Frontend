import React, { useEffect, useState } from 'react'
import { Button, Col, Container, Form, Row } from 'react-bootstrap'
import { ToastContainer } from 'react-toastify'
import Loader from '../Loader'
import { useNavigate } from 'react-router-dom'

const Amb_register = () => {
    var navigate = useNavigate();
    const [loading, setloading] = useState(false)

    const statesWithCities = {
        Maharashtra: ["Mumbai", "Pune", "Nagpur"],
        Karnataka: ["Bangalore", "Mysore", "Mangalore"],
        Delhi: ["New Delhi", "Dwarka", "Rohini"],
        // Add more states and cities as needed
    };

    useEffect(() => {

    }, [])

    // Form fields state
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        state: "",
        city: "",
        rcBookNo: "",
        rcBookPhoto: null,
        aadharNo: "",
        aadharPhoto: null,
        address: "",
    });

    const [cities, setCities] = useState([]);

    // For error handling
    const [errors, setErrors] = useState({});

    // handle change
    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            setFormData((prev) => ({ ...prev, [name]: files[0] }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    // When state changes, update cities
    useEffect(() => {
        if (formData.state) {
            setCities(statesWithCities[formData.state] || []);
            setFormData((prev) => ({ ...prev, city: "" })); // reset city selection
        }
    }, [formData.state]);

    // Basic validation function
    const validate = () => {
        let tempErrors = {};
        if (!formData.fullName.trim()) tempErrors.fullName = "Full name is required";
        if (!formData.email.trim()) {
            tempErrors.email = "Email is required";
        } else if (
            !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
        ) {
            tempErrors.email = "Invalid email address";
        }
        if (!formData.password) {
            tempErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            tempErrors.password = "Password must be at least 6 characters";
        }
        if (!formData.state) tempErrors.state = "State is required";
        if (!formData.city) tempErrors.city = "City is required";
        if (!formData.rcBookNo.trim())
            tempErrors.rcBookNo = "RC Book Number is required";
        if (!formData.rcBookPhoto)
            tempErrors.rcBookPhoto = "RC Book Photo is required";
        if (!formData.aadharNo.trim())
            tempErrors.aadharNo = "Aadhar Number is required";
        if (!formData.aadharPhoto)
            tempErrors.aadharPhoto = "Aadhar Photo is required";
        if (!formData.address.trim())
            tempErrors.address = "Address is required";

        setErrors(tempErrors);

        return Object.keys(tempErrors).length === 0;
    };

    // Mock API for sending OTP
    const sendOtp = (email) => {
        return new Promise((resolve) => {
            console.log("Sending OTP to:", email);
            setTimeout(() => {
                resolve(true);
            }, 1500);
        });
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        // Here you would upload files and send form data to backend
        // For simulation, we'll just send OTP and navigate to OTP page with email stored

        try {
            await sendOtp(formData.email);

            // Save registration data temporarily in localStorage for OTP verification
            // (In real app, do this in backend and use JWT or session)
            localStorage.setItem(
                "pendingRegistration",
                JSON.stringify(formData)
            );
            navigate("/otp-verify");
        } catch (err) {
            alert("Failed to send OTP. Please try again.");
        }
    };
    return (
        <>
            <div className='min-vh-100 d-flex align-items-center panel'>
                <Container className='py-3'>
                    <Row className='justify-content-center'>
                        <Col xs={5}>
                            <div className='register_doctor bg-white p-3 py-3 px-4 rounded-4 shadow'>
                                <div className='text-center'>
                                    <h3>Ambulance - Register</h3>
                                    <p className='w-75 mx-auto'>Lorem Ipsum is simply dummy text of the printing and typesetting industry</p>
                                </div>
                                <Form onSubmit={handleSubmit} noValidate as={Row}>
                                    <Form.Group controlId="email" className='position-relative mb-3'>
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            style={{ width: "100%", padding: 6, marginTop: 4 }}
                                        />
                                        {errors.fullName && <div style={{ color: "red" }}>{errors.fullName}</div>}
                                    </Form.Group>

                                    <Form.Group controlId="email" className='position-relative mb-3'>
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control placeholder="Enter Email" name='email' value={formData.email} onChange={handleChange} />
                                        {errors.email && <div style={{ color: "red" }}>{errors.email}</div>}
                                    </Form.Group>

                                    <Form.Group controlId="password" className='position-relative mb-3'>
                                        <Form.Label>Password</Form.Label>
                                        <Form.Control type='password' placeholder="Enter Password" name='password' value={formData.password} onChange={handleChange} />
                                        {errors.password && <div style={{ color: "red" }}>{errors.password}</div>}
                                    </Form.Group>

                                    <Form.Group controlId="state" className='position-relative mb-3 col-6'>
                                        <Form.Label>State</Form.Label>
                                        <Form.Select
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                        >
                                            <option value="">--Select State--</option>
                                            {Object.keys(statesWithCities).map((stateName) => (
                                                <option key={stateName} value={stateName}>
                                                    {stateName}
                                                </option>
                                            ))}
                                        </Form.Select>
                                        {errors.state && <div style={{ color: "red" }}>{errors.state}</div>}
                                    </Form.Group>

                                    <Form.Group controlId="city" className='position-relative mb-3 col-6'>
                                        <Form.Label>City</Form.Label>
                                        <Form.Select
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            style={{ width: "100%", padding: 6, marginTop: 4 }}
                                            disabled={!formData.state}
                                        >
                                            <option value="">--Select City--</option>
                                            {cities.map((cityName) => (
                                                <option key={cityName} value={cityName}>
                                                    {cityName}
                                                </option>
                                            ))}
                                        </Form.Select>
                                        {errors.city && <div style={{ color: "red" }}>{errors.city}</div>}
                                    </Form.Group>

                                    <Form.Group controlId="rcno" className='position-relative mb-3 col-6'>
                                        <Form.Label>RC Book No:</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="rcBookNo"
                                                value={formData.rcBookNo}
                                                onChange={handleChange}
                                                style={{ width: "100%", padding: 6, marginTop: 4 }}
                                            />
                                        {errors.rcBookNo && <div style={{ color: "red" }}>{errors.rcBookNo}</div>}
                                    </Form.Group>

                                    <Form.Group controlId="rcphoto" className='position-relative mb-3 col-6'>
                                        <Form.Label>RC Book Photo:</Form.Label>
                                            <Form.Control
                                                type="file"
                                                name="rcBookPhoto"
                                                accept="image/*"
                                                onChange={handleChange}
                                                style={{ width: "100%", marginTop: 4 }}
                                            />
                                        {errors.rcBookPhoto && <div style={{ color: "red" }}>{errors.rcBookPhoto}</div>}
                                    </Form.Group>

                                    <Form.Group controlId="aadharno" className='position-relative mb-3 col-6'>
                                        <Form.Label>Aadhar No:</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="aadharNo"
                                                value={formData.aadharNo}
                                                onChange={handleChange}
                                                style={{ width: "100%", padding: 6, marginTop: 4 }}
                                            />
                                        {errors.aadharNo && <div style={{ color: "red" }}>{errors.aadharNo}</div>}
                                    </Form.Group>

                                    <Form.Group controlId="aadharphoto" className='position-relative mb-3 col-6'>
                                        <Form.Label>Aadhar Photo:</Form.Label>
                                            <Form.Control
                                                type="file"
                                                name="aadharPhoto"
                                                accept="image/*"
                                                onChange={handleChange}
                                                style={{ width: "100%", marginTop: 4 }}
                                            />
                                        {errors.aadharPhoto && <div style={{ color: "red" }}>{errors.aadharPhoto}</div>}
                                    </Form.Group>

                                    <Form.Group controlId="password" className='position-relative mb-3'>
                                        <Form.Label>Address</Form.Label>
                                            <Form.Control as={'textarea'}
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                rows={3}
                                                style={{ width: "100%", padding: 6, marginTop: 4 }}
                                            />
                                        {errors.address && <div style={{ color: "red" }}>{errors.address}</div>}
                                    </Form.Group>

                                    <Button type="submit" className='btn btn-primary d-block w-100 theme_btn mt-4'>
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
                        </Col>
                    </Row>
                </Container>
                <ToastContainer />
                {loading ? <Loader /> : ''}
            </div>
        </>
    )
}

export default Amb_register
