import React, { useEffect, useState } from 'react'
import { Button, Col, Container, Form, Row } from 'react-bootstrap'
import NavBar from '../Visitor/Component/NavBar'
import FooterBar from '../Visitor/Component/FooterBar'
import { CiLock } from 'react-icons/ci'
import { FaRegEnvelope } from 'react-icons/fa'
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

  const [blood_g, setbloog_g] = useState(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']);
  const [patient, setpatient] = useState({ name: '', email: '', gender: '', mobile: '', pincode: '', blood_group: '', password: '' })
  const [otp, setotp] = useState('');

  const patientch = (e) => {
    const { name, value } = e.target;
    setpatient(patient => ({
      ...patient,
      [name]: value
    }))
  };

  useEffect(() => {
    var getlocaldata = localStorage.getItem('PatientLogin');
    if (getlocaldata) {
      navigate('/patient')
    }
  }, [navigate])

  function patientsignup() {
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
                      <FaRegEnvelope className='icon_input' />
                    </Form.Group>

                    <Form.Group controlId="email" className='position-relative mb-3'>
                      <Form.Label>Email</Form.Label>
                      <Form.Control placeholder="Enter Email" name='email' value={patient.email} className='frm_input' onChange={patientch} />
                      <FaRegEnvelope className='icon_input' />
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
                      <FaRegEnvelope className='icon_input' />
                    </Form.Group>

                    <Form.Group controlId="pincode" className='position-relative mb-3'>
                      <Form.Label>Pincode</Form.Label>
                      <Form.Control placeholder="Enter Pincode" name='pincode' value={patient.pincode} className='frm_input' onChange={patientch} />
                      <FaRegEnvelope className='icon_input' />
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
                      <CiLock className='icon_input' />
                    </Form.Group>

                    <Button onClick={patientsignup} type="button" className='btn btn-primary d-block w-100 theme_btn mt-4'>
                      Sign Up
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