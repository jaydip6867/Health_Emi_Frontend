import React, { useEffect, useState } from 'react'
import { Button, Col, Container, Form, Row, Modal } from 'react-bootstrap'

import NavBar from '../Visitor/Component/NavBar'
import FooterBar from '../Visitor/Component/FooterBar'
import { Link, useNavigate } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify'
import Loader from '../Loader'
import axios from 'axios'
import Swal from 'sweetalert2'
import { API_BASE_URL, STORAGE_KEYS } from '../config'
import { FiEdit2 } from 'react-icons/fi'

const PatientRegister = () => {

  var navigate = useNavigate();
  const [loading, setloading] = useState(false)

  const [pat_reg, setpatreg] = useState(true);
  const [pat_otp, setpatotp] = useState(false);

  const [blood_g, setbloog_g] = useState(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']);
  const [patient, setpatient] = useState({ name: '', email: '', gender: '', mobile: '', pincode: '', blood_group: '', password: '' })
  const [profilePicPreview, setProfilePicPreview] = useState('')
  const [profilePicFile, setProfilePicFile] = useState(null)

  const [otp, setotp] = useState('');

  const [showTcModal, setShowTcModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsContent, setTermsContent] = useState('');
  const [shortTerms, setShortTerms] = useState('');

  const patientch = (e) => {

    const { name, value } = e.target;
    setpatient(patient => ({
      ...patient,
      [name]: value
    }))
  };

  const onSelectProfilePic = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post(`${API_BASE_URL}/user/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res?.data?.Data?.url || '';
  }

  const fetchTermsAndConditions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user/gettc`);
      const fullText = response.data.Data.patient_tc || 'No terms and conditions available.';
      setTermsContent(fullText);
      // Get first 150 characters for preview
      setShortTerms(fullText.length > 150 ? `${fullText.substring(0, 150)}...` : fullText);
    } catch (error) {
      console.error('Error fetching terms and conditions:', error);
      setTermsContent('Failed to load terms and conditions.');
      setShortTerms('Failed to load terms and conditions.');
    }
  };

  useEffect(() => {
    fetchTermsAndConditions();
    var getlocaldata = localStorage.getItem(STORAGE_KEYS.PATIENT);
    if (getlocaldata) {
      navigate('/patient')
    }
  }, [navigate])

  async function patientsignup() {
    if (!termsAccepted) {
      toast('Please accept the terms and conditions to continue', { className: 'custom-toast-error' });
      return;
    }
    console.log(patient)
    setloading(true)
    try {
      let payload = { ...patient };
      if (profilePicFile) {
        const url = await uploadFile(profilePicFile);
        if (url) payload.profile_pic = url;
      }
      const res = await axios({
        method: 'post',
        url: `${API_BASE_URL}/user/signup`,
        data: payload
      });
      toast(res.data.Message, { className: 'custom-toast-success' });
      setpatreg(false);
      setpatotp(true);
    } catch (error) {
      console.log(error);
      toast(error?.response?.data?.Message || 'Signup failed', { className: 'custom-toast-error' })
    } finally {
      setloading(false)
    }
  }

  function otpverifydone() {
    setloading(true)
    axios({
      method: 'post',
      url: `${API_BASE_URL}/user/signup/otpverification`,
      data: {
        "email": patient.email,
        "otp": otp
      }
    }).then((res) => {
      // toast('Patient Register successfully...', { className: 'custom-toast-success' })
      // console.log(res);
      Swal.fire({
        title: 'Patient Register successfully.',
        icon: 'success',
        confirmButtonText: 'OK',
      }).then((result) => {
        if (result.isConfirmed || result.isDismissed) {
          navigate('/patient'); // Navigate to home page
        }
      });
    }).catch(function (error) {
      console.log(error);
      toast(error, { className: 'custom-toast-error' })
    }).finally(() => {
      setloading(false)
    });
  }

  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    // Only allow single digit
    if (value.length > 1) return;

    // Only allow numbers
    if (value && !/^[0-9]$/.test(value)) return;

    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = value;
    setOtpDigits(newOtpDigits);

    // Update the main otp variable
    const otpString = newOtpDigits.join("");
    setotp(otpString);

    // Auto focus to next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Handle backspace
  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
        const newOtpDigits = [...otpDigits];
        newOtpDigits[index - 1] = "";
        setOtpDigits(newOtpDigits);
        setotp(newOtpDigits.join(""));
      }
    }
  };

  return (
    <>
      <NavBar />
      <Modal
        show={showTcModal}
        onHide={() => setShowTcModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Terms and Conditions</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{
          maxHeight: '60vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          wordWrap: 'break-word',
          whiteSpace: 'pre-line',
          padding: '1rem'
        }}>
          <div style={{
            maxWidth: '100%',
            overflowWrap: 'break-word',
            wordWrap: 'break-word',
            hyphens: 'auto'
          }}>
            {termsContent || 'Loading terms and conditions...'}
          </div>
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

      <div className='py-5 d-flex align-items-center panel'>
        <Container className='py-3'>
          <Row className='justify-content-center'>
            {
              pat_reg === true ? <Col xs={12} md={8} lg={5} >
                <div className='register_doctor bg-white p-3 py-3 px-4 rounded-4 shadow'>
                  <div className='text-center'>
                    <h3>Patient - Sign Up</h3>
                    <p className='w-75 mx-auto'>Lorem Ipsum is simply dummy text of the printing and typesetting industry</p>
                  </div>
                  <Form>

                    <div className='d-flex flex-column align-items-center mb-3'>
                      <div className='position-relative' style={{ width: 120, height: 120 }}>
                        <img
                          src={profilePicPreview || require('../Visitor/assets/profile_icon_img.png')}
                          alt="profile"
                          style={{ width: '120px', height: '120px', borderRadius: '16px', objectFit: 'cover' }}
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="light"
                          style={{ width: '32px', height: '32px' }}
                          className='p-1 position-absolute end-0 bottom-0 rounded-circle border'
                          onClick={() => document.getElementById('patient_profile_pic_input').click()}
                        >
                          <FiEdit2 />
                        </Button>
                        <input id='patient_profile_pic_input' type='file' accept='image/*' className='d-none' onChange={onSelectProfilePic} />
                      </div>
                    </div>

                    <Form.Group controlId="name" className='position-relative mb-3'>
                      <Form.Label>Name</Form.Label>
                      <Form.Control placeholder="Enter Name" name='name' value={patient.name} className='frm_input' onChange={patientch} />
                    </Form.Group>

                    <Form.Group controlId="email" className='position-relative mb-3'>
                      <Form.Label>Email</Form.Label>
                      <Form.Control placeholder="Enter Email" name='email' value={patient.email} className='frm_input' onChange={patientch} />
                    </Form.Group>

                    <Form.Group controlId="gender" className='position-relative mb-3'>
                      <Form.Label>Gender </Form.Label>
                      <div className='d-flex gap-3'>
                        <label><Form.Check type='radio' name='gender' value={'Male'} className='d-inline-block me-2' onChange={patientch} /> Male</label>
                        <label><Form.Check type='radio' name='gender' value={'Female'} className='d-inline-block me-2' onChange={patientch} /> Female</label>
                      </div>
                    </Form.Group>

                    <Form.Group controlId="mobile" className='position-relative mb-3'>
                      <Form.Label>Mobile</Form.Label>
                      <Form.Control placeholder="Enter Mobile" name='mobile' value={patient.mobile} className='frm_input' onChange={patientch} pattern='[0-9]{10}' />
                    </Form.Group>

                    <Form.Group controlId="pincode" className='position-relative mb-3'>
                      <Form.Label>Pincode</Form.Label>
                      <Form.Control placeholder="Enter Pincode" name='pincode' value={patient.pincode} className='frm_input' onChange={patientch} />
                    </Form.Group>

                    <Form.Group controlId="blood_group" className='position-relative mb-3'>
                      <Form.Label>Blood Group</Form.Label>
                      <Form.Select name='blood_group' value={patient.blood_group} className='frm_input' onChange={patientch}>
                        {
                          blood_g.map((v, i) => {
                            return (<option key={i} value={v}>{v}</option>)
                          })
                        }
                      </Form.Select>
                    </Form.Group>

                    <Form.Group controlId="password" className='position-relative mb-1'>
                      <Form.Label>Password</Form.Label>
                      <Form.Control type='password' placeholder="Enter Password" name='password' value={patient.password} className='frm_input' onChange={patientch} />
                    </Form.Group>

                    <div className="my-3 form-check ps-0">
                      <Form.Check
                        type="checkbox"
                        id="termsCheckbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        label={
                          <span>
                            I agree to the
                            <a
                              href="#"
                              className="text-primary ms-1"
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
                      {/* {shortTerms && (
                        <div className="form-text text-muted" style={{ maxHeight: '60px', overflow: 'hidden' }}>
                          {shortTerms}
                        </div>
                      )} */}
                    </div>

                    <Button
                      variant="primary"
                      className='w-100 py-2 mt-3'
                      onClick={patientsignup}
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 'Sign Up'}
                    </Button>
                  </Form>
                  <div className='form_bottom_div text-center mt-3'>
                    <p>Already have an Account? <Link to={'/patient'} className='form-link'>Sign In</Link> </p>
                  </div>
                </div>
              </Col> : ''
            }
            {
              pat_otp === true ? (
                <Col md={8} lg={5}>
                  <div className="register_doctor bg-white p-3 py-3 px-4 rounded d-flex flex-column justify-content-between h-100">
                    <div className="text-center">
                      <h3>OTP Verification</h3>
                      <p className="w-75 mx-auto">
                        Lorem Ipsum is simply dummy text of the printing and
                        typesetting industry
                      </p>
                      <Form>
                        <div className="my-4">
                          <Form.Label className="d-block text-center mb-3 fw-bold">
                            Enter 6-Digit OTP
                          </Form.Label>
                          <div className="d-flex justify-content-center gap-2">
                            {otpDigits.map((digit, index) => (
                              <Form.Control
                                key={index}
                                id={`otp-${index}`}
                                type="text"
                                value={digit}
                                onChange={(e) =>
                                  handleOtpChange(index, e.target.value)
                                }
                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                className="text-center fw-bold border-2"
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  fontSize: "20px",
                                  borderRadius: "8px",
                                }}
                                maxLength="1"
                              />
                            ))}
                          </div>
                          <small className="d-block text-center text-muted mt-2">
                            Enter the 6-digit code sent to your email
                          </small>
                        </div>
                      </Form>
                      <div className="form_bottom_div text-end mt-3">
                        <p>
                          <Link className="form-link">Resend OTP ?</Link>{" "}
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={otpverifydone}
                      className="d-block w-100 theme_btn my-3"
                      disabled={otp.length !== 6}
                    >
                      {otp.length === 6
                        ? "Verify OTP"
                        : `Enter ${6 - otp.length} more digit${6 - otp.length > 1 ? "s" : ""
                        }`}
                    </Button>
                  </div>
                </Col>
              ) : ''
            }
          </Row>
        </Container>
        <ToastContainer />
        {loading ? <Loader /> : ''}
      </div>
      <FooterBar />
    </>
  )
}

export default PatientRegister