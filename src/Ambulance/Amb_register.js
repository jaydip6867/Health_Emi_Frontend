import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Alert, Modal } from "react-bootstrap";
import {  State, City } from "country-state-city";
import axios from "axios";
import "../Visitor/css/visitor.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";

const Amb_register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    mobile: "",
    password: "",
    gender: "",
    state: "",
    city: "",
    address: "",
    ambulance_type: "",
    rc_no: "",
    rc_pic: null,
    blood_group: "",
    dob: "",
    insurance_expiry: "",
    insurance_pic: null,
    insurance_holder: "",
    polution_expiry: "",
    polution_pic: null,
    vehicle_no: "",
    driver_pic: null,
    experience: "",
    driving_licence_pic: null,
    ambulance_front_pic: null,
    ambulance_back_pic: null,
    ambulance_fitness_pic: null,
    ambulance_fitness_expiry: ""
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAlert, setShowAlert] = useState({ show: false, message: "", type: "" });
  const [showTcModal, setShowTcModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsContent, setTermsContent] = useState('');
  const [shortTerms, setShortTerms] = useState('');
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedStateCode, setSelectedStateCode] = useState("");
  const [filePreviews, setFilePreviews] = useState({
    rc_pic: null,
    insurance_pic: null,
    polution_pic: null,
    driver_pic: null,
    driving_licence_pic: null,
    ambulance_front_pic: null,
    ambulance_back_pic: null,
    ambulance_fitness_pic: null
  });

  // OTP verification states
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpErrors, setOtpErrors] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [canResendOtp, setCanResendOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  // Blood group options
  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  // Experience options
  const experienceOptions = [
    "Less than 1 year",
    "1-2 years",
    "2-5 years",
    "5-10 years",
    "More than 10 years"
  ];

  // Load Indian states on component mount
  useEffect(() => {
    const indianStates = State.getStatesOfCountry("IN");
    setStates(indianStates);
    fetchTermsAndConditions();
  }, []);

  // Load cities when state changes
  useEffect(() => {
    if (selectedStateCode) {
      const stateCities = City.getCitiesOfState("IN", selectedStateCode);
      setCities(stateCities);
    } else {
      setCities([]);
    }
  }, [selectedStateCode]);

  // OTP resend timer
  useEffect(() => {
    let interval;
    if (showOtpForm && !canResendOtp && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            setCanResendOtp(true);
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showOtpForm, canResendOtp, resendTimer]);

  const fetchTermsAndConditions = async () => {
    try {
      const response = await axios.get('https://healtheasy-o25g.onrender.com/ambulance/gettc');
      const fullText = response.data.Data.ambulance_tc || 'No terms and conditions available.';
      setTermsContent(fullText);
      // Get first 150 characters for preview
      setShortTerms(fullText.length > 150 ? `${fullText.substring(0, 150)}...` : fullText);
    } catch (error) {
      console.error('Error fetching terms and conditions:', error);
      setTermsContent('Failed to load terms and conditions.');
      setShortTerms('Failed to load terms and conditions.');
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);

    // Update file previews with file objects
    setFilePreviews(prev => ({
      ...prev,
      [name]: fileList
    }));

    // Update form data with the first file
    setFormData(prev => ({
      ...prev,
      [name]: fileList[0]
    }));
  };

  const handleRemoveFile = (fieldName, index) => {
    setFilePreviews(prev => {
      const updatedFiles = [...(prev[fieldName] || [])];
      updatedFiles.splice(index, 1);
      return {
        ...prev,
        [fieldName]: updatedFiles
      };
    });

    setFormData(prev => ({
      ...prev,
      [fieldName]: null
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Handle state selection
    if (name === "state") {
      const selectedState = states.find(state => state.name === value);
      setSelectedStateCode(selectedState ? selectedState.isoCode : "");
      setFormData(prev => ({
        ...prev,
        [name]: value,
        city: "" // Reset city when state changes
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // OTP input handler
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.querySelector(`input[name="otp-${index + 1}"]`);
      if (nextInput) nextInput.focus();
    }

    // Clear error when user types
    if (otpErrors) setOtpErrors('');
  };

  // Handle backspace in OTP
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.querySelector(`input[name="otp-${index - 1}"]`);
      if (prevInput) prevInput.focus();
    }
  };

  // File upload function
  const uploadFile = async (file, fieldName) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('https://healtheasy-o25g.onrender.com/user/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Extract URL from response data
      return response.data?.Data?.url || null;
    } catch (error) {
      console.error(`Upload failed for ${fieldName}:`, error);
      throw new Error(`Failed to upload ${fieldName}: ${error.message}`);
    }
  };

  // Upload all files
  const uploadAllFiles = async () => {
    const fileFields = [
      'rc_pic', 'insurance_pic', 'polution_pic', 'driver_pic',
      'driving_licence_pic', 'ambulance_front_pic', 'ambulance_back_pic', 'ambulance_fitness_pic'
    ];

    const uploadPromises = fileFields.map(async (fieldName) => {
      const file = formData[fieldName];
      if (file) {
        try {
          const url = await uploadFile(file, fieldName);
          return { fieldName, url };
        } catch (error) {
          throw error;
        }
      }
      return { fieldName, url: null };
    });

    const results = await Promise.all(uploadPromises);

    // Store uploaded file URLs
    const uploadedData = {};
    results.forEach(({ fieldName, url }) => {
      if (url) {
        uploadedData[fieldName] = url;
      }
    });

    return uploadedData;
  };

  // Registration API call
  const registerAmbulance = async (registrationData) => {
    try {
      const response = await axios.post('https://healtheasy-o25g.onrender.com/ambulance/signup', registrationData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
      throw new Error(`Registration failed: ${error.response?.data?.message || error.message}`);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      'fullname', 'email', 'mobile', 'password', 'gender', 'state', 'city',
      'address', 'ambulance_type', 'rc_no', 'blood_group', 'dob',
      'insurance_expiry', 'insurance_holder', 'polution_expiry', 'vehicle_no',
      'experience', 'ambulance_fitness_expiry'
    ];

    // Check required fields
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = `${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} is required`;
      }
    });

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Mobile validation (10 digits)
    if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number';
    }

    // Password validation (at least 6 characters)
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    // Date validations
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (formData.dob) {
      const dob = new Date(formData.dob);
      if (dob >= today) {
        newErrors.dob = 'Date of birth must be in the past';
      }
    }

    if (formData.insurance_expiry) {
      const expiry = new Date(formData.insurance_expiry);
      if (expiry <= today) {
        newErrors.insurance_expiry = 'Insurance must be valid (future date)';
      }
    }

    if (formData.polution_expiry) {
      const expiry = new Date(formData.polution_expiry);
      if (expiry <= today) {
        newErrors.polution_expiry = 'Pollution certificate must be valid (future date)';
      }
    }

    if (formData.ambulance_fitness_expiry) {
      const expiry = new Date(formData.ambulance_fitness_expiry);
      if (expiry <= today) {
        newErrors.ambulance_fitness_expiry = 'Fitness certificate must be valid (future date)';
      }
    }

    // File validations
    const requiredFiles = [
      'rc_pic', 'insurance_pic', 'polution_pic', 'driver_pic',
      'driving_licence_pic', 'ambulance_front_pic', 'ambulance_back_pic',
      'ambulance_fitness_pic'
    ];

    requiredFiles.forEach(fileField => {
      if (!formData[fileField]) {
        newErrors[fileField] = `${fileField.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} is required`;
      }
    });

    setErrors(newErrors);

    // Show toast for each error
    if (Object.keys(newErrors).length > 0) {
      Object.values(newErrors).forEach(error => {
        toast.error(error, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if terms are accepted
    if (!termsAccepted) {
      toast.error('Please accept the terms and conditions to continue', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
      return;
    }

    if (!validateForm()) {
      setShowAlert({
        show: true,
        message: "Please correct the errors in the form",
        type: "danger"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Upload all files first
      setShowAlert({
        show: true,
        message: "Uploading files... Please wait.",
        type: "info"
      });

      const uploadedData = await uploadAllFiles();

      // Step 2: Prepare registration data with uploaded file responses
      const registrationData = { ...formData };
      Object.keys(uploadedData).forEach(fieldName => {
        if (uploadedData[fieldName]) {
          registrationData[fieldName] = uploadedData[fieldName];
        }
      });

      // Step 3: Call registration API
      setShowAlert({
        show: true,
        message: "Processing registration... Please wait.",
        type: "info"
      });

      const registrationResponse = await registerAmbulance(registrationData);

      // Step 4: Store response in localStorage
      localStorage.setItem('ambulanceRegistration', JSON.stringify(registrationResponse));

      // Step 5: Show OTP form
      setShowOtpForm(true);
      setShowAlert({
        show: true,
        message: `Registration successful! OTP sent to ${formData.mobile}. Please verify to complete registration.`,
        type: "success"
      });
      setCanResendOtp(false);
      setResendTimer(30);

    } catch (error) {
      setShowAlert({
        show: true,
        message: error.message || "Registration failed. Please try again.",
        type: "danger"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // OTP verification handler
  const handleOtpVerification = async (e) => {
    e.preventDefault();

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setOtpErrors('Please enter complete 6-digit OTP');
      return;
    }

    setIsVerifyingOtp(true);

    try {
      // Simulate OTP verification API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      await axios.post(`https://healtheasy-o25g.onrender.com/ambulance/signup/otpverification`, {
        email: formData.email,
        otp: otpString
      }).then(response => {
        setShowAlert({
          show: true,
          message: "Registration successful! Welcome to Health Easy EMI Ambulance Services.",
          type: "success"
        });
        navigate('/ambulance');
      }).catch(error => {
        setShowAlert({
          show: true,
          message: error.message || "OTP verification failed. Please try again.",
          type: "danger"
        });
      });

      // Reset all forms
      setShowOtpForm(false);
      setFormData({
        fullname: "",
        email: "",
        mobile: "",
        password: "",
        gender: "",
        state: "",
        city: "",
        address: "",
        ambulance_type: "",
        rc_no: "",
        rc_pic: null,
        blood_group: "",
        dob: "",
        insurance_expiry: "",
        insurance_pic: null,
        insurance_holder: "",
        polution_expiry: "",
        polution_pic: null,
        vehicle_no: "",
        driver_pic: null,
        experience: "",
        driving_licence_pic: null,
        ambulance_front_pic: null,
        ambulance_back_pic: null,
        ambulance_fitness_pic: null,
        ambulance_fitness_expiry: ""
      });
      setFilePreviews({
        rc_pic: null,
        insurance_pic: null,
        polution_pic: null,
        driver_pic: null,
        driving_licence_pic: null,
        ambulance_front_pic: null,
        ambulance_back_pic: null,
        ambulance_fitness_pic: null
      });
      setSelectedStateCode("");
      setOtp(['', '', '', '', '', '']);

    } catch (error) {
      setOtpErrors('Invalid OTP. Please try again.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    try {
      // Simulate resend OTP API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setShowAlert({
        show: true,
        message: `New OTP sent to ${formData.mobile}`,
        type: "info"
      });
      setCanResendOtp(false);
      setResendTimer(30);
      setOtp(['', '', '', '', '', '']);

    } catch (error) {
      setShowAlert({
        show: true,
        message: "Failed to resend OTP. Please try again.",
        type: "danger"
      });
    }
  };

  const renderFileInput = (name, label, accept = '*', showPreview = false) => {
    const files = filePreviews[name] || [];

    return (
      <Form.Group className="mb-3">
        <Form.Label>{label}</Form.Label>
        <div className="input-group">
          <input
            type="file"
            className="form-control"
            id={name}
            name={name}
            accept={accept}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <label
            className="form-control d-flex justify-content-between align-items-center"
            htmlFor={name}
            style={{ cursor: 'pointer' }}
          >
            <span>
              {files.length > 0
                ? `${files.length} file${files.length > 1 ? 's' : ''} selected`
                : 'Choose file...'}
            </span>
            <i className="bi bi-upload"></i>
          </label>
        </div>

        {files.length > 0 && (
          <div className="mt-2">
            {files.map((file, index) => (
              <div key={index}>
                {showPreview && file.type?.startsWith('image/') ? (
                  <div className="position-relative mb-2">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="img-thumbnail"
                      style={{ maxWidth: '200px', maxHeight: '150px' }}
                    />
                    <button
                      type="button"
                      className="btn-close position-absolute top-0 end-0 bg-white rounded-circle p-1 m-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(name, index);
                      }}
                      aria-label="Remove"
                    />
                  </div>
                ) : (
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      {file.name} ({(file.size / 1024).toFixed(2)} KB)
                    </small>
                    <button
                      type="button"
                      className="btn-close btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(name, index);
                      }}
                      aria-label="Remove"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {errors[name] && (
          <div className="invalid-feedback d-block">
            {errors[name]}
          </div>
        )}
      </Form.Group>
    );
  };

  const TermsAndConditionsModal = () => (
    <Modal show={showTcModal} onHide={() => setShowTcModal(false)} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Terms and Conditions</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{
        maxHeight: '60vh',
        overflow: 'auto',
        whiteSpace: 'pre-line',
        wordWrap: 'break-word',
        padding: '1rem'
      }}>
        {termsContent || 'Loading terms and conditions...'}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowTcModal(false)}>
          Close
        </Button>
        <Button variant="primary" onClick={() => {
          setTermsAccepted(true);
          setShowTcModal(false);
        }}>
          I Accept
        </Button>
      </Modal.Footer>
    </Modal>
  );

  return (
    <>
      <div className="min-vh-100 d-flex align-items-center" style={{ backgroundColor: "#F5FDFF", paddingTop: "2rem", paddingBottom: "2rem" }}>
        <Container className="py-4">
          <Row className="justify-content-center">
            <Col lg={12} xl={10}>
              <Card className="shadow-lg border-0 radius-20">
                <Card.Header className="text-center py-4" style={{ backgroundColor: "var(--primary-color-600)", borderRadius: "20px 20px 0 0" }}>
                  <div className="d-flex align-items-center justify-content-center mb-3">
                    <h2 className="text-white mb-0 fw-bold">Ambulance Registration</h2>
                  </div>
                  <p className="text-white mb-0 opacity-75">Join our emergency medical services network</p>
                </Card.Header>

                <Card.Body className="p-4 p-md-5">
                  {showAlert.show && (
                    <Alert
                      variant={showAlert.type}
                      dismissible
                      onClose={() => setShowAlert({ show: false, message: "", type: "" })}
                      className="mb-4"
                    >
                      {showAlert.message}
                    </Alert>
                  )}

                  {!showOtpForm ? (
                    <Form onSubmit={handleSubmit}>
                      <Row>
                        {/* Full Name */}
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="fw-semibold text-dark">
                              Full Name *
                            </Form.Label>
                            <Form.Control
                              type="text"
                              name="fullname"
                              value={formData.fullname}
                              onChange={handleInputChange}
                              placeholder="Enter your full name"
                              isInvalid={!!errors.fullname}
                              className="py-2"
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.fullname}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>

                        {/* Email */}
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="fw-semibold text-dark">
                              Email Address *
                            </Form.Label>
                            <Form.Control
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              placeholder="Enter your email"
                              isInvalid={!!errors.email}
                              className="py-2"
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.email}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>

                        {/* Mobile */}
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="fw-semibold text-dark">
                              Mobile Number *
                            </Form.Label>
                            <Form.Control
                              type="tel"
                              name="mobile"
                              value={formData.mobile}
                              onChange={handleInputChange}
                              placeholder="Enter 10-digit mobile number"
                              isInvalid={!!errors.mobile}
                              className="py-2"
                              maxLength="10"
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.mobile}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>

                        {/* Password */}
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="fw-semibold text-dark">
                              Password *
                            </Form.Label>
                            <Form.Control
                              type="password"
                              name="password"
                              value={formData.password}
                              onChange={handleInputChange}
                              placeholder="Create a strong password"
                              isInvalid={!!errors.password}
                              className="py-2"
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.password}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>

                        {/* Gender */}
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="fw-semibold text-dark">Gender *</Form.Label>
                            <div className="d-flex gap-4 mt-2">
                              <Form.Check
                                type="radio"
                                id="Male"
                                name="gender"
                                value="Male"
                                label="Male"
                                checked={formData.gender === "Male"}
                                onChange={handleInputChange}
                                isInvalid={!!errors.gender}
                              />
                              <Form.Check
                                type="radio"
                                id="Female"
                                name="gender"
                                value="Female"
                                label="Female"
                                checked={formData.gender === "Female"}
                                onChange={handleInputChange}
                                isInvalid={!!errors.gender}
                              />
                            </div>
                            {errors.gender && (
                              <div className="invalid-feedback d-block">
                                {errors.gender}
                              </div>
                            )}
                          </Form.Group>
                        </Col>

                        {/* Date of Birth */}
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="fw-semibold text-dark">Date of Birth *</Form.Label>
                            <Form.Control
                              type="date"
                              name="dob"
                              value={formData.dob}
                              onChange={handleInputChange}
                              isInvalid={!!errors.dob}
                              className="py-2"
                              max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.dob}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>

                        {/* Blood Group */}
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="fw-semibold text-dark">Blood Group *</Form.Label>
                            <Form.Select
                              name="blood_group"
                              value={formData.blood_group}
                              onChange={handleInputChange}
                              isInvalid={!!errors.blood_group}
                              className="py-2"
                            >
                              <option value="">Select your blood group</option>
                              {bloodGroups.map((group) => (
                                <option key={group} value={group}>
                                  {group}
                                </option>
                              ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                              {errors.blood_group}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>

                        {/* Ambulance Type */}
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="fw-semibold text-dark">Ambulance Type *</Form.Label>
                            <div className="d-flex gap-4 mt-2">
                              <Form.Check
                                type="radio"
                                id="advance"
                                name="ambulance_type"
                                value="Advance"
                                label="Advance"
                                checked={formData.ambulance_type === "Advance"}
                                onChange={handleInputChange}
                                isInvalid={!!errors.ambulance_type}
                              />
                              <Form.Check
                                type="radio"
                                id="basic"
                                name="ambulance_type"
                                value="Basic"
                                label="Basic"
                                checked={formData.ambulance_type === "Basic"}
                                onChange={handleInputChange}
                                isInvalid={!!errors.ambulance_type}
                              />
                            </div>
                            {errors.ambulance_type && (
                              <div className="invalid-feedback d-block">
                                {errors.ambulance_type}
                              </div>
                            )}
                          </Form.Group>
                        </Col>

                        {/* State */}
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="fw-semibold text-dark">
                              State *
                            </Form.Label>
                            <Form.Select
                              name="state"
                              value={formData.state}
                              onChange={handleInputChange}
                              isInvalid={!!errors.state}
                              className="py-2"
                            >
                              <option value="">Select your state</option>
                              {states.map((state) => (
                                <option key={state.isoCode} value={state.name}>
                                  {state.name}
                                </option>
                              ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                              {errors.state}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>

                        {/* City */}
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="fw-semibold text-dark">
                              City *
                            </Form.Label>
                            <Form.Select
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                              isInvalid={!!errors.city}
                              className="py-2"
                              disabled={!selectedStateCode}
                            >
                              <option value="">
                                {selectedStateCode ? "Select your city" : "Please select a state first"}
                              </option>
                              {cities.map((city) => (
                                <option key={city.name} value={city.name}>
                                  {city.name}
                                </option>
                              ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                              {errors.city}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>

                        {/* Address */}
                        <Col md={12} className="mb-3">
                          <Form.Group>
                            <Form.Label className="fw-semibold text-dark">
                              Complete Address *
                            </Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={3}
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                              placeholder="Enter your complete address"
                              isInvalid={!!errors.address}
                              className="py-2"
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.address}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>

                        {/* Ambulance Details Section */}
                        <Col md={12} className="mb-4">
                          <h4 className="text-center mb-4 bg-primary-subtle py-2 rounded" style={{ color: "var(--primary-color-600)", fontWeight: "bold" }}>
                            Vehicle & Driver Details
                          </h4>
                        </Col>

                        {/* RC Number */}
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="fw-semibold text-dark">RC Number *</Form.Label>
                            <Form.Control
                              type="text"
                              name="rc_no"
                              value={formData.rc_no}
                              onChange={handleInputChange}
                              placeholder="Enter RC number"
                              isInvalid={!!errors.rc_no}
                              className="py-2"
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.rc_no}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>

                        {/* RC Picture Upload */}
                        <Col md={6} className="mb-3">
                          {renderFileInput('rc_pic', 'RC Document', 'image/*,.pdf')}
                        </Col>

                        {/* Vehicle Number */}
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="fw-semibold text-dark">Vehicle Number *</Form.Label>
                            <Form.Control
                              type="text"
                              name="vehicle_no"
                              value={formData.vehicle_no}
                              onChange={handleInputChange}
                              placeholder="Enter vehicle number (e.g., MH12AB1234)"
                              isInvalid={!!errors.vehicle_no}
                              className="py-2"
                              style={{ textTransform: 'uppercase' }}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.vehicle_no}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>

                        {/* Experience */}
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="fw-semibold text-dark">Driving Experience *</Form.Label>
                            <Form.Select
                              name="experience"
                              value={formData.experience}
                              onChange={handleInputChange}
                              isInvalid={!!errors.experience}
                              className="py-2"
                            >
                              <option value="">Select your experience</option>
                              {experienceOptions.map((exp) => (
                                <option key={exp} value={exp}>
                                  {exp}
                                </option>
                              ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                              {errors.experience}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>

                        {/* Insurance Holder */}
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="fw-semibold text-dark">Insurance Holder Name *</Form.Label>
                            <Form.Control
                              type="text"
                              name="insurance_holder"
                              value={formData.insurance_holder}
                              onChange={handleInputChange}
                              placeholder="Enter insurance holder name"
                              isInvalid={!!errors.insurance_holder}
                              className="py-2"
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.insurance_holder}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>

                        {/* Insurance Expiry */}
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="fw-semibold text-dark">Insurance Expiry Date *</Form.Label>
                            <Form.Control
                              type="date"
                              name="insurance_expiry"
                              value={formData.insurance_expiry}
                              onChange={handleInputChange}
                              isInvalid={!!errors.insurance_expiry}
                              className="py-2"
                              min={new Date().toISOString().split('T')[0]}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.insurance_expiry}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>

                        {/* Insurance Picture */}
                        <Col md={6} className="mb-3">
                          {renderFileInput('insurance_pic', 'Insurance Document', 'image/*,.pdf')}
                        </Col>

                        {/* polution Expiry */}
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="fw-semibold text-dark">polution Certificate Expiry *</Form.Label>
                            <Form.Control
                              type="date"
                              name="polution_expiry"
                              value={formData.polution_expiry}
                              onChange={handleInputChange}
                              isInvalid={!!errors.polution_expiry}
                              className="py-2"
                              min={new Date().toISOString().split('T')[0]}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.polution_expiry}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>

                        {/* polution Picture */}
                        <Col md={6} className="mb-3">
                          {renderFileInput('polution_pic', 'polution Certificate', 'image/*,.pdf')}
                        </Col>

                        {/* Driver Picture */}
                        <Col md={6} className="mb-3">
                          {renderFileInput('driver_pic', 'Driver Photo', 'image/*', true)}
                        </Col>

                        {/* Driving License Picture */}
                        <Col md={6} className="mb-3">
                          {renderFileInput('driving_licence_pic', 'Driving License', 'image/*,.pdf')}
                        </Col>

                        {/* Ambulance Front Picture */}
                        <Col md={6} className="mb-3">
                          {renderFileInput('ambulance_front_pic', 'Ambulance Front Photo', 'image/*', true)}
                        </Col>

                        {/* Ambulance Back Picture */}
                        <Col md={6} className="mb-3">
                          {renderFileInput('ambulance_back_pic', 'Ambulance Back Photo', 'image/*', true)}
                        </Col>

                        {/* Ambulance Fitness Expiry */}
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label className="fw-semibold text-dark">Fitness Certificate Expiry *</Form.Label>
                            <Form.Control
                              type="date"
                              name="ambulance_fitness_expiry"
                              value={formData.ambulance_fitness_expiry}
                              onChange={handleInputChange}
                              isInvalid={!!errors.ambulance_fitness_expiry}
                              className="py-2"
                              min={new Date().toISOString().split('T')[0]}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.ambulance_fitness_expiry}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>

                        {/* Ambulance Fitness Picture */}
                        <Col md={6} className="mb-3">
                          {renderFileInput('ambulance_fitness_pic', 'Fitness Certificate', 'image/*,.pdf')}
                        </Col>

                        <Form.Group className="mb-3">
                          <Form.Check
                            type="checkbox"
                            id="termsCheckbox"
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            label={
                              <span>
                                I agree to the{' '}
                                <a
                                  href="#"
                                  className="text-primary"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setShowTcModal(true);
                                  }}
                                >
                                  Terms and Conditions
                                </a>
                              </span>
                            }
                          />
                          {shortTerms && (
                            <div className="form-text text-muted" style={{ maxHeight: '60px', overflow: 'hidden' }}>
                              {shortTerms}
                            </div>
                          )}
                        </Form.Group>

                      </Row>

                      <div className="d-grid gap-2 mt-4">
                        <Button
                          type="submit"
                          size="lg"
                          disabled={isSubmitting}
                          className="py-3 fw-semibold"
                          style={{
                            backgroundColor: "var(--primary-color-600)",
                            border: "none",
                            borderRadius: "12px"
                          }}
                        >
                          {isSubmitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Registering...
                            </>
                          ) : (
                            <>
                              Register Ambulance
                            </>
                          )}
                        </Button>
                      </div>

                      <div className="text-center mt-4">
                        <p className="text-muted mb-0">
                          Already have an account?{" "}
                          <a href="/ambulance" className="text-decoration-none fw-semibold" style={{ color: "var(--primary-color-600)" }}>
                            Sign in here
                          </a>
                        </p>
                      </div>
                    </Form>
                  ) : (
                    /* OTP Verification Form */
                    <div className="text-center">
                      <div className="mb-4">
                        <div className="mx-auto mb-3" style={{ width: "80px", height: "80px", backgroundColor: "var(--primary-color-100)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: "2rem", color: "var(--primary-color-600)" }}>📱</span>
                        </div>
                        <h4 className="mb-2" style={{ color: "var(--primary-color-600)" }}>Verify Your Mobile Number</h4>
                        <p className="text-muted mb-4">
                          We've sent a 6-digit verification code to<br />
                          <strong>{formData.mobile}</strong>
                        </p>
                      </div>

                      <Form onSubmit={handleOtpVerification}>
                        <div className="d-flex justify-content-center gap-2 mb-4">
                          {otp.map((digit, index) => (
                            <Form.Control
                              key={index}
                              type="text"
                              name={`otp-${index}`}
                              value={digit}
                              onChange={(e) => handleOtpChange(index, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(index, e)}
                              className="text-center fw-bold"
                              style={{
                                width: "50px",
                                height: "50px",
                                fontSize: "1.2rem",
                                border: "2px solid var(--primary-color-300)",
                                borderRadius: "8px"
                              }}
                              maxLength="1"
                              inputMode="numeric"
                              pattern="[0-9]*"
                            />
                          ))}
                        </div>

                        {otpErrors && (
                          <Alert variant="danger" className="mb-3">
                            {otpErrors}
                          </Alert>
                        )}

                        <div className="d-grid gap-2 mb-4">
                          <Button
                            type="submit"
                            size="lg"
                            disabled={isVerifyingOtp}
                            className="py-3 fw-semibold"
                            style={{
                              backgroundColor: "var(--primary-color-600)",
                              border: "none",
                              borderRadius: "12px"
                            }}
                          >
                            {isVerifyingOtp ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Verifying...
                              </>
                            ) : (
                              "Verify OTP"
                            )}
                          </Button>
                        </div>

                        <div className="text-center">
                          <p className="text-muted mb-2">Didn't receive the code?</p>
                          {canResendOtp ? (
                            <Button
                              variant="link"
                              onClick={handleResendOtp}
                              className="p-0 fw-semibold"
                              style={{ color: "var(--primary-color-600)" }}
                            >
                              Resend OTP
                            </Button>
                          ) : (
                            <span className="text-muted">
                              Resend OTP in {resendTimer}s
                            </span>
                          )}
                        </div>

                        <div className="text-center mt-4">
                          <Button
                            variant="outline-secondary"
                            onClick={() => {
                              setShowOtpForm(false);
                              setOtp(['', '', '', '', '', '']);
                              setOtpErrors('');
                            }}
                          >
                            ← Back to Registration
                          </Button>
                        </div>
                      </Form>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
      <TermsAndConditionsModal />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};

export default Amb_register;