import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import P_Sidebar from './P_Sidebar';
import NavBar from '../Visitor/Component/NavBar'
import FooterBar from '../Visitor/Component/FooterBar'
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import Loader from '../Loader';
import CryptoJS from "crypto-js";
import { API_BASE_URL, SECRET_KEY, STORAGE_KEYS } from '../config';

const PatientProfile = () => {
    
    var navigate = useNavigate();
    const [loading, setloading] = useState(false)
    const [IsDisable, setdisabled] = useState(true)

    const [blood_g, setbloog_g] = useState(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']);
    const [profile, setprofile] = useState(null)

    const [patient, setpatient] = useState(null)
    const [token, settoken] = useState(null)

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
            setprofile(res.data.Data)
        }).catch(function (error) {
            console.log(error);
        }).finally(() => {
            setloading(false)
        });
    }

    function profiledata(e) {
        const { name, value } = e.target;
        setprofile(profile => ({
            ...profile,
            [name]: value
        }))
    }

    function updateprofiledata(id) {

        console.log('update profile data = ', id, profile)
        const payload = {
            "name": profile.name,
            "email": profile.email,
            "gender": profile.gender,
            "mobile": profile.mobile,
            "pincode": profile.pincode,
            "blood_group": profile.blood_group,
            "password": profile?.password || ''
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
                        <div className='bg-white rounded p-3 pt-4'>
                            <h4>Patient Profile</h4>

                            {
                                profile !== null ? <div className='p-3 shadow'>
                                    <Form className='register_doctor row g-4'>
                                        <Form.Group as={Col} controlId="name" className='col-12 col-sm-6 col-md-4 col-lg-3'>
                                            <div className='position-relative'>
                                                <Form.Label>Name</Form.Label>
                                                <Form.Control type="text" placeholder="Full Name" className='frm_input' name="name" value={profile && profile.name} disabled={IsDisable} onChange={profiledata} />
                                            </div>
                                        </Form.Group>

                                        <Form.Group as={Col} controlId="email" className='col-12 col-sm-6 col-md-4 col-lg-3'>
                                            <div className="position-relative">
                                                <Form.Label>Email</Form.Label>
                                                <Form.Control type="email" placeholder="Email" className='frm_input' name="email" value={profile && profile.email} disabled={IsDisable} onChange={profiledata} />
                                            </div>
                                        </Form.Group>

                                        <Form.Group controlId="mobile" className='col-12 col-sm-6 col-md-4 col-lg-3'>
                                            <div className="position-relative">
                                                <Form.Label>Mobile No.</Form.Label>
                                                <Form.Control placeholder="Mobile No." className='frm_input' name='mobile' value={profile && profile.mobile} disabled={IsDisable} onChange={profiledata} />
                                            </div>
                                        </Form.Group>

                                        <Form.Group controlId="gender" className='col-12 col-sm-6 col-md-4 col-lg-3'>
                                            <Form.Label>Gender </Form.Label>
                                            <div className='d-flex gap-3'>
                                                <label><Form.Check type='radio' name='gender' value={'Male'} className='d-inline-block me-2' checked={profile && profile.gender === "Male" ? true : false} onChange={profiledata} disabled={IsDisable} /> Male</label>
                                                <label><Form.Check type='radio' name='gender' value={'Female'} className='d-inline-block me-2' checked={profile && profile.gender === "Female" ? true : false} onChange={profiledata} disabled={IsDisable} /> Female</label>
                                            </div>
                                        </Form.Group>

                                        <Form.Group controlId="mobile" className='col-6 col-md-4 col-lg-3'>
                                            <div className="position-relative">
                                                <Form.Label>Pincode</Form.Label>
                                                <Form.Control placeholder="Pincode" className='frm_input' name='pincode' value={profile && profile.pincode} disabled={IsDisable} onChange={profiledata} />
                                            </div>
                                        </Form.Group>

                                        <Form.Group controlId="blood_group" className='col-6 col-md-4 col-lg-3'>
                                            <div className="position-relative">
                                                <Form.Label>Blood Group</Form.Label>
                                                <Form.Select name='blood_group' value={profile.blood_group} className='frm_input' onChange={profiledata} disabled={IsDisable}>
                                                    {
                                                        blood_g.map((v, i) => {
                                                            return (<option key={i} value={v} selected={profile && profile.blood_group === v ? true : false}>{v}</option>)
                                                        })
                                                    }
                                                </Form.Select>
                                            </div>
                                        </Form.Group>

                                        <Form.Group controlId="password" className='col-12 col-sm-6 col-md-4 col-lg-3'>
                                            <div className="position-relative">
                                                <Form.Label>Password</Form.Label>
                                                <Form.Control type="password" placeholder="Enter new password" className='frm_input' name='password' value={profile?.password || ''} disabled={IsDisable} onChange={profiledata} />
                                            </div>
                                        </Form.Group>

                                        <div className='text-center border-top'>

                                            {IsDisable ? <Button type="button" className='theme_btn col-3 mt-3' onClick={() => setdisabled(false)}>
                                                Edit Profile
                                            </Button> : <><Button type="button" className='theme_btn col-3 mt-3' onClick={() => updateprofiledata(profile._id)}>
                                                Update </Button> <Button className='theme_btn bg-danger border-danger col-3 mt-3 ms-2' onClick={() => setdisabled(true)}>Cancel</Button> </>}
                                        </div>
                                    </Form>
                                </div> : ''
                            }
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