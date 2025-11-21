import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Button, Col, Container, Form, Row, Tab, Tabs } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import P_Sidebar from './P_Sidebar';
import NavBar from '../Visitor/Component/NavBar'
import FooterBar from '../Visitor/Component/FooterBar'
import Swal from 'sweetalert2';
import Loader from '../Loader';
import CryptoJS from "crypto-js";
import { API_BASE_URL, SECRET_KEY, STORAGE_KEYS } from '../config';
import { FiEyeOff, FiEye } from "react-icons/fi";

const PatientProfile = () => {

    var navigate = useNavigate();
    const [loading, setloading] = useState(false)
    const [IsDisable, setdisabled] = useState(true)

    const [blood_g, setbloog_g] = useState(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']);
    const [profile, setprofile] = useState(null)

    const [patient, setpatient] = useState(null)
    const [token, settoken] = useState(null)
    const [showNewPwd, setShowNewPwd] = useState(false)
    const [showConfirmPwd, setShowConfirmPwd] = useState(false)
    const [errors, setErrors] = useState({ newPassword: '', confirmPassword: '' })

    useEffect(() => {
        var getlocaldata = localStorage.getItem(STORAGE_KEYS.PATIENT);
        const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        var data = JSON.parse(decrypted);
        if (!data) {
            navigate('/patient')
        }
        else {
            setpatient(data.userData);
            settoken(`Bearer ${data.accessToken}`)
        }
    }, [navigate])

    useEffect(() => {
        setloading(true)
        if (patient) {
            setTimeout(() => {
                getprofiledata()
            }, 200);
        }
    }, [patient])

    function getprofiledata() {
        axios({
            method: 'get',
            url: `${API_BASE_URL}/user/profile`,
            headers: {
                Authorization: token
            }
        }).then((res) => {
            const data = res.data.Data || {};
            setprofile({
                ...data,
                newPassword: '',
                confirmPassword: ''
            })
            setErrors({ newPassword: '', confirmPassword: '' })
        }).catch(function (error) {
            console.log(error);
        }).finally(() => {
            setloading(false)
        });
    }

    function validatePasswords(nextProfile) {
        const np = (nextProfile?.newPassword || '').trim();
        const cp = (nextProfile?.confirmPassword || '').trim();
        const nextErrors = { newPassword: '', confirmPassword: '' };
        if (np.length > 0) {
            if (np.length < 2) {
                nextErrors.newPassword = 'Password must be at least 6 characters.';
            }
            // Optional strength rule: at least 1 letter and 1 number
            if (np !== cp) {
                nextErrors.confirmPassword = 'Passwords do not match.';
            }
        } else {
            // If no new password entered but confirm has value, indicate mismatch
            if (cp) {
                nextErrors.newPassword = 'Enter a new password.';
                nextErrors.confirmPassword = 'Passwords do not match.';
            }
        }
        return nextErrors;
    }

    function profiledata(e) {
        const { name, value } = e.target;
        setprofile(prev => {
            const updated = { ...prev, [name]: value };
            if (name === 'newPassword' || name === 'confirmPassword') {
                const v = validatePasswords(updated);
                setErrors(v);
            }
            return updated;
        })
    }

    function updateprofiledata(id) {

        console.log('update profile data = ', id, profile)
        const hasNew = (profile?.newPassword || '').trim().length > 0;
        const currentErrors = validatePasswords(profile);
        setErrors(currentErrors);
        if (hasNew && (currentErrors.newPassword || currentErrors.confirmPassword)) {
            Swal.fire({
                title: "Fix the errors",
                text: "Please resolve the password validation messages shown below the fields.",
                icon: "error",
            });
            return;
        }

        const passwordToSend = hasNew ? (profile?.newPassword || '') : '';

        const payload = {
            "name": profile.name,
            "email": profile.email,
            "gender": profile.gender,
            "mobile": profile.mobile,
            "pincode": profile.pincode,
            "blood_group": profile.blood_group,
            "password": passwordToSend || ''
        };
        if (!payload.password) {
            delete payload.password;
        }

        axios({
            method: 'post',
            url: `${API_BASE_URL}/user/profile/edit`,
            headers: {
                Authorization: token
            },
            data: payload
        }).then((res) => {
            getprofiledata()
            setdisabled(true)
            Swal.fire({
                title: "Profile Update Successfully...",
                icon: "success",
            });
        }).catch(function (error) {
            Swal.fire({
                title: "Profile Not Update.",
                text: "Something Is Missing. Please Check Details...",
                icon: "error",
            });
        }).finally(() => {
            setloading(false)
        });
    }

    return (
        <>
            <NavBar logindata={patient} />
            <Container>
                <Row>
                    <P_Sidebar />
                    <Col xs={12} md={9} className='p-3'>
                        {/* <P_nav patientname={patient && patient.name} /> */}
                        <div className='p-3 py-4 mb-3'>
                            <h4>Settings</h4>

                            <div className='py-3'>
                                {
                                    profile !== null ? <div>
                                        <Tabs
                                            defaultActiveKey="profile"
                                            transition={false}
                                            id="noanim-tab-example"
                                            className="mb-3 border-0 setting_tab gap-3"
                                        >
                                            <Tab eventKey="profile" title="Profile">
                                                <Form className='register_doctor row g-4'>
                                                    <Form.Group as={Col} controlId="name" className='col-12 col-sm-6 col-md-4 col-lg-3'>
                                                        <div className='position-relative'>
                                                            <Form.Label>Name</Form.Label>
                                                            <Form.Control type="text" placeholder="Full Name" className='frm_input' name="name" value={profile && profile.name} disabled onChange={profiledata} />
                                                        </div>
                                                    </Form.Group>

                                                    <Form.Group as={Col} controlId="email" className='col-12 col-sm-6 col-md-4 col-lg-3'>
                                                        <div className="position-relative">
                                                            <Form.Label>Email</Form.Label>
                                                            <Form.Control type="email" placeholder="Email" className='frm_input' name="email" value={profile && profile.email} disabled onChange={profiledata} />
                                                        </div>
                                                    </Form.Group>

                                                    <Form.Group controlId="mobile" className='col-12 col-sm-6 col-md-4 col-lg-3'>
                                                        <div className="position-relative">
                                                            <Form.Label>Mobile No.</Form.Label>
                                                            <Form.Control placeholder="Mobile No." className='frm_input' name='mobile' value={profile && profile.mobile} disabled onChange={profiledata} />
                                                        </div>
                                                    </Form.Group>

                                                    <Form.Group controlId="gender" className='col-12 col-sm-6 col-md-4 col-lg-3'>
                                                        <Form.Label>Gender </Form.Label>
                                                        <div className='d-flex gap-3'>
                                                            <label><Form.Check type='radio' name='gender' value={'Male'} className='d-inline-block me-2' checked={profile && profile.gender === "Male" ? true : false} onChange={profiledata} /> Male</label>
                                                            <label><Form.Check type='radio' name='gender' value={'Female'} className='d-inline-block me-2' checked={profile && profile.gender === "Female" ? true : false} onChange={profiledata} /> Female</label>
                                                        </div>
                                                    </Form.Group>

                                                    <Form.Group controlId="mobile" className='col-6 col-md-4 col-lg-3'>
                                                        <div className="position-relative">
                                                            <Form.Label>Pincode</Form.Label>
                                                            <Form.Control placeholder="Pincode" className='frm_input' name='pincode' value={profile && profile.pincode} onChange={profiledata} />
                                                        </div>
                                                    </Form.Group>

                                                    <Form.Group controlId="blood_group" className='col-6 col-md-4 col-lg-3'>
                                                        <div className="position-relative">
                                                            <Form.Label>Blood Group</Form.Label>
                                                            <Form.Select name='blood_group' value={profile.blood_group} className='frm_input' onChange={profiledata}>
                                                                {
                                                                    blood_g.map((v, i) => {
                                                                        return (<option key={i} value={v} selected={profile && profile.blood_group === v ? true : false}>{v}</option>)
                                                                    })
                                                                }
                                                            </Form.Select>
                                                        </div>
                                                    </Form.Group>
                                                </Form>
                                            </Tab>
                                            <Tab eventKey="password" title="Change Password">
                                                <Row className='register_doctor'>
                                                    <Form.Group controlId="new_password" className='col-12 col-sm-6 col-md-4'>
                                                        <Form.Label>New Password</Form.Label>
                                                        <div className="position-relative">
                                                            <Form.Control type={showNewPwd ? 'text' : 'password'} placeholder="Enter new password" className='frm_input' name='newPassword' value={profile?.newPassword || ''} onChange={profiledata} />
                                                            <Button type="button" variant="light" size="sm" className='position-absolute end-0 top-50 translate-middle-y me-2 eye_btn' onClick={() => setShowNewPwd(v => !v)}>
                                                                {showNewPwd ? <FiEyeOff /> : <FiEye />}
                                                            </Button>
                                                        </div>
                                                        {errors.newPassword ? <Form.Text className='text-danger'>{errors.newPassword}</Form.Text> : null}
                                                    </Form.Group>
                                                    <Form.Group controlId="confirm_password" className='col-12 col-sm-6 col-md-4'>
                                                        <Form.Label>Confirm Password</Form.Label>
                                                        <div className="position-relative">
                                                            <Form.Control type={showConfirmPwd ? 'text' : 'password'} placeholder="Enter confirm password" className='frm_input' name='confirmPassword' value={profile?.confirmPassword || ''} onChange={profiledata} />
                                                            <Button type="button" variant="light" size="sm" className='position-absolute end-0 top-50 translate-middle-y me-2 eye_btn' onClick={() => setShowConfirmPwd(v => !v)}>
                                                                {showConfirmPwd ? <FiEyeOff /> : <FiEye />}
                                                            </Button>
                                                        </div>
                                                        {errors.confirmPassword ? <Form.Text className='text-danger'>{errors.confirmPassword}</Form.Text> : null}
                                                    </Form.Group>
                                                </Row>
                                            </Tab>
                                        </Tabs>

                                        <div className='text-center border-top mt-3'>

                                            <Button type="button" className='theme_btn col-3 mt-3' onClick={() => updateprofiledata(profile._id)}>Update Profile</Button>
                                        </div>
                                    </div> : ''
                                }
                            </div>
                            {/* <Button variant='danger' className='mt-4' onClick={deletepatient}>Delete Patient</Button> */}
                        </div>
                    </Col>
                </Row>
            </Container>
            {loading ? <Loader /> : ''}

            <FooterBar />
        </>
    )
}

export default PatientProfile