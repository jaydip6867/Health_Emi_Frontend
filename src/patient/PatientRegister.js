import React, { useEffect, useState } from 'react'
import { Button, Col, Container, Form, Row, Modal } from 'react-bootstrap'
import NavBar from '../Visitor/Component/NavBar'
import FooterBar from '../Visitor/Component/FooterBar'
import { Link, useNavigate } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify'
import Loader from '../Loader'
import axios from 'axios'
import Swal from 'sweetalert2'

const PatientRegister = () => {

  var navigate = useNavigate();
  const [loading, setloading] = useState(false)

  const [pat_reg, setpatreg] = useState(true);
  const [pat_otp, setpatotp] = useState(false);

  
  const [patient, setpatient] = useState({ name: '', email: '', gender: '', mobile: '', pincode: '', blood_group: '', password: '' })
  const [otp, setotp] = useState('');

  const [showTcModal, setShowTcModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsContent, setTermsContent] = useState('');
  // const [shortTerms, setShortTerms] = useState('');

  const blood_g = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  
  const patientch = (e) => {
    const { name, value } = e.target;
    setpatient(patient => ({
      ...patient,
      [name]: value
    }))
  };

  const fetchTermsAndConditions = async () => {
    try {
      const response = await axios.get('https://healtheasy-o25g.onrender.com/user/gettc');
      const fullText = response.data.Data.patient_tc || 'No terms and conditions available.';
      setTermsContent(fullText);
      // Get first 150 characters for preview
      // setShortTerms(fullText.length > 150 ? `${fullText.substring(0, 150)}...` : fullText);
    } catch (error) {
      console.error('Error fetching terms and conditions:', error);
      setTermsContent('Failed to load terms and conditions.');
      // setShortTerms('Failed to load terms and conditions.');
    }
  };

  useEffect(() => {
    fetchTermsAndConditions();
    var getlocaldata = localStorage.getItem('PatientLogin');
    if (getlocaldata) {
      navigate('/patient')
    }
  }, [navigate])

  function patientsignup() {
    if (!termsAccepted) {
      toast('Please accept the terms and conditions to continue', { className: 'custom-toast-error' });
      return;
    }
    console.log(patient)
    setloading(true)
    axios({
      method: 'post',
      url: 'https://healtheasy-o25g.onrender.com/user/signup',
      data: patient
    }).then((res) => {
      toast(res.data.Message, { className: 'custom-toast-success' });
      setpatreg(false);
      setpatotp(true);
    }).catch(function (error) {
      console.log(error);
      toast(error.response.data.Message, { className: 'custom-toast-error' })
    }).finally(() => {
      setloading(false)
    });
  }

  function otpverifydone() {
    setloading(true)
    axios({
      method: 'post',
      url: 'https://healtheasy-o25g.onrender.com/user/signup/otpverification',
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

      <div className='spacer-y d-flex align-items-center panel'>
        <Container className='py-3'>
          <Row className='justify-content-center'>
            {
              pat_reg === true ? <Col xs={5}>
                <div className='register_doctor bg-white p-3 py-3 px-4 rounded-4 shadow'>
                  <div className='text-center'>
                    <h3>Patient - Sign Up</h3>
                    <p className='w-75 mx-auto'>Lorem Ipsum is simply dummy text of the printing and typesetting industry</p>
                  </div>
                  <Form>

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
              pat_otp === true ? <Col md={5}>
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