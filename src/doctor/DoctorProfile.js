import React, { useEffect, useState } from 'react'
import DoctorSidebar from './DoctorSidebar'
import DoctorNav from './DoctorNav'
import { Button, Col, Container, Form, Row } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import Loader from '../Loader'
import axios from 'axios'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import { AiOutlinePhone, AiOutlineUser } from 'react-icons/ai'
import { FaRegEnvelope } from 'react-icons/fa'
import { CiLocationOn, CiLock } from 'react-icons/ci'
import { Country, State, City } from 'country-state-city';
import { getAllStates } from 'country-state-city/lib/state'

const DoctorProfile = () => {
    var navigate = useNavigate();
    const [loading, setloading] = useState(false)
    const [IsDisable, setdisabled] = useState(true)

    // country , state , city

    const [countries, setCountries] = useState(Country.getAllCountries());
    // const [country, setCountry] = useState(null);
    const [state, setState] = useState(null);
    const [city, setCity] = useState(null);

    const [doctor, setdoctor] = useState(null)
    const [token, settoken] = useState(null)
    const [profile, setprofile] = useState(null)

    useEffect(() => {
        var data = JSON.parse(localStorage.getItem('doctordata'));
        if (!data) {
            navigate('/doctor')
        }
        else {
            setdoctor(data.data.Data.doctorData);
            settoken(`Bearer ${data.data.Data.accessToken}`)
        }
    }, [navigate])

    useEffect(() => {
        setloading(true)
        axios({
            method: 'get',
            url: 'https://healtheasy-o25g.onrender.com/doctor/profile',
            headers: {
                Authorization: token
            }
        }).then((res) => {
            setprofile(res.data.Data)
            console.log('profile', res.data.Data)
        }).catch(function (error) {
            console.log(error);
        }).finally(() => {
            setloading(false)
        });
    }, [doctor])

    // useEffect(() => {
    //     const c_data = countries.find(c => c.name === profile.country);
    //     if (c_data) {
    //         const s_all_data = State.getStatesOfCountry(c_data.isoCode);
    //         setState(s_all_data);
    //     }
    // }, [profile])

    function staterecord() {
        // var c_data = countries.find(c => c.name == profile.country);
        // console.log(c_data)
        // var s_all_data = State.getStatesOfCountry(c_data.isoCode);
        // console.log(s_all_data)

        // setState(s_all_data)
        // var s_data = s_all_data.filter(s=>s.name == profile.state);
        // console.log(s_data)
        // var city_all_data = City.getCitiesOfState(s_data.countryCode,s_data.stateCode);
        // console.log(city_all_data)
    }

    function deletdoctor() {
        Swal.fire({
            title: "Are you sure?",
            text: "You Want Delete Your Account.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then((result) => {
            if (result.isConfirmed) {
                axios({
                    method: 'get',
                    url: 'https://healtheasy-o25g.onrender.com/doctor/profile/remove',
                    headers: {
                        Authorization: token
                    }
                    // data: profile
                }).then((res) => {
                    // toast('Doctor Account Delete successfully...', { className: 'custom-toast-success' })
                    // console.log(res)
                    localStorage.removeItem('doctordata')
                }).catch(function (error) {
                    // console.log(error);
                    toast(error.response.data.Message, { className: 'custom-toast-error' })
                }).finally(() => {
                    // setloading(false)
                    navigate('/doctor')
                });
                Swal.fire({
                    title: "Deleted!",
                    text: "Your Account has been deleted.",
                    icon: "success"
                });
            }
        });
        // setloading(true)
        // axios({
        //     method: 'get',
        //     url: 'https://healtheasy-o25g.onrender.com/doctor/profile/remove',
        //     headers: {
        //         Authorization: token
        //     }
        //     // data: profile
        // }).then((res) => {
        //     toast('Doctor Account Delete successfully...', { className: 'custom-toast-success' })
        //     // console.log(res)
        //     localStorage.removeItem('doctordata')
        //     navigate('/doctor')
        // }).catch(function (error) {
        //     // console.log(error);
        //     toast(error.response.data.Message, { className: 'custom-toast-error' })
        // }).finally(() => {
        //     setloading(false)
        // });
    }
    return (
        <>
            {state && state}
            <Container fluid className='p-0'>
                <Row className='g-0'>
                    <DoctorSidebar />
                    <Col xs={12} sm={9} lg={10} className='p-3'>
                        <DoctorNav doctorname={doctor && doctor.name} />
                        <div className='bg-white rounded p-2'>
                            <h6>Doctor Profile</h6>

                            <Form className='register_doctor row g-4'>
                                <Form.Group as={Col} controlId="fullname" className='col-6 col-md-4 col-lg-3'>
                                    <div className='position-relative'>
                                        <Form.Label>Full Name</Form.Label>
                                        <Form.Control type="text" placeholder="Full Name" className='frm_input' name="name" value={profile && profile.name} disabled={IsDisable} />
                                        <AiOutlineUser className='icon_input' />
                                    </div>
                                </Form.Group>

                                <Form.Group as={Col} controlId="email" className='col-6 col-md-4 col-lg-3'>
                                    <div className="position-relative">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control type="email" placeholder="Email" className='frm_input' name="email" value={profile && profile.email} disabled={IsDisable} />
                                        <FaRegEnvelope className='icon_input' />
                                    </div>
                                </Form.Group>

                                <Form.Group controlId="mobile" className='col-6 col-md-4 col-lg-3'>
                                    <div className="position-relative">
                                        <Form.Label>Mobile No.</Form.Label>
                                        <Form.Control placeholder="Mobile No." className='frm_input' name='mobile' value={profile && profile.mobile} disabled={IsDisable} />
                                        <AiOutlinePhone className='icon_input' />
                                    </div>
                                </Form.Group>

                                <Form.Group controlId="gender" className='col-6 col-md-4 col-lg-3'>
                                    <Form.Label>Gender </Form.Label>
                                    <div className='d-flex gap-3'>
                                        <label><Form.Check type='radio' name='gender' value={'Male'} className='d-inline-block me-2' /> Male</label>
                                        <label><Form.Check type='radio' name='gender' value={'Female'} className='d-inline-block me-2' /> Female</label>
                                    </div>
                                </Form.Group>

                                <Form.Group controlId="mobile" className='col-6 col-md-4 col-lg-3'>
                                    <div className="position-relative">
                                        <Form.Label>Pincode</Form.Label>
                                        <Form.Control placeholder="Pincode" className='frm_input' name='pincode' value={profile && profile.pincode} disabled={IsDisable} />
                                        <CiLocationOn className='icon_input' />
                                    </div>
                                </Form.Group>

                                <Form.Group as={Col} controlId="Speciality" className='col-6 col-md-4 col-lg-3'>
                                    <div className='position-relative'>
                                        <Form.Label>Speciality</Form.Label>
                                        <Form.Control type="text" placeholder="Ex:- Cardiology" className='frm_input' name="specialty" value={profile && profile.specialty} disabled={IsDisable} />
                                        <AiOutlineUser className='icon_input' />
                                    </div>
                                </Form.Group>

                                <Form.Group as={Col} controlId="SubSpeciality" className='col-6 col-md-4 col-lg-3'>
                                    <div className='position-relative'>
                                        <Form.Label>Sub Speciality</Form.Label>
                                        <Form.Control type="email" placeholder="Ex:- Echocardiography" className='frm_input' name="sub_specialty" value={profile && profile.sub_specialty} disabled={IsDisable} />
                                        <FaRegEnvelope className='icon_input' />
                                    </div>
                                </Form.Group>

                                <Form.Group controlId="Degree" className='col-6 col-md-4 col-lg-3'>
                                    <div className='position-relative'>
                                        <Form.Label>Degree Registration No.</Form.Label>
                                        <Form.Control placeholder="Ex:- Dk4567" className='frm_input' name="degree_registration_no" value={profile && profile.degree_registration_no} disabled={IsDisable} />
                                        <AiOutlinePhone className='icon_input' />
                                    </div>
                                </Form.Group>

                                <Form.Group controlId="Qualification" className='col-6 col-md-4 col-lg-3'>
                                    <div className='position-relative'>
                                        <Form.Label>Qualification</Form.Label>
                                        <Form.Control placeholder="Ex:- D.H.M.S, MD" className='frm_input' name="qualification" value={profile && profile.qualification} disabled={IsDisable} />
                                        <CiLock className='icon_input' />
                                    </div>
                                </Form.Group>

                                <Form.Group controlId="Experience" className='col-6 col-md-4 col-lg-3'>
                                    <div className='position-relative'>
                                        <Form.Label>Experience</Form.Label>
                                        <Form.Control placeholder="Ex:- 5 Years" className='frm_input' name="experience" value={profile && profile.experience} disabled={IsDisable} />
                                        <CiLock className='icon_input' />
                                    </div>
                                </Form.Group>

                                <Form.Group controlId="Hospitalname" className='col-6 col-md-4 col-lg-3'>
                                    <div className='position-relative'>
                                        <Form.Label>Hospital Name</Form.Label>
                                        <Form.Control placeholder="Enter Hospital Name" className='frm_input' name="hospital_name" value={profile && profile.hospital_name} disabled={IsDisable} />
                                        <CiLock className='icon_input' />
                                    </div>
                                </Form.Group>

                                <Form.Group controlId="Hospitaladdress" className='col-6 col-md-4 col-lg-3'>
                                    <div className='position-relative'>
                                        <Form.Label>Hospital Address</Form.Label>
                                        <Form.Control as="textarea" placeholder="Enter Hospital Address" name="hospital_address" value={profile && profile.hospital_address} disabled={IsDisable} />
                                    </div>
                                </Form.Group>

                                <Form.Group controlId="Hospitaladdress" className='col-6 col-md-4 col-lg-3'>
                                    <div className='position-relative'>
                                        <Form.Label>Doctor Profile</Form.Label>
                                        <Form.Control type="file" placeholder="Experience" className='upload_file_doc' />
                                    </div>
                                </Form.Group>

                                <Form.Group as={Col} controlId="Country" className='col-6 col-md-4 col-lg-3'>
                                    <div className='position-relative'>
                                        <Form.Label>Country</Form.Label>
                                        <Form.Select className='frm-select' name='country' disabled={IsDisable} >
                                            {countries.map((country) => (
                                                <option key={country.isoCode} value={country.isoCode} selected={profile && profile.country == country.name ? true : false}>
                                                    {country.name}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </div>
                                </Form.Group>

                                <Form.Group as={Col} controlId="State" className='col-6 col-md-4 col-lg-3'>
                                    <div className='position-relative'>
                                        <Form.Label>State</Form.Label>
                                        <Form.Select className='frm-select' name='state' disabled={IsDisable}>
                                            {state && state.map((st) => (
                                                <option key={st.isoCode} value={st.isoCode} selected={profile && profile.state == st.name ? true : false}>
                                                    {state.name}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </div>
                                </Form.Group>

                                <Form.Group as={Col} controlId="City" className='mb-3 col-3'>
                                    <div className='position-relative'>
                                        <Form.Label>City</Form.Label>
                                        <Form.Select className='frm-select' name='city' disabled={IsDisable}>
                                            {
                                                city && city.map((city, vi) => {
                                                    return (<option key={vi} value={city.name} selected={profile && profile.city == city.name ? true : false}>{city.name}</option>)
                                                })
                                            }
                                        </Form.Select>
                                    </div>
                                </Form.Group>

                                <Button type="button" className='d-block w-100 theme_btn mt-3'>
                                    Edit
                                </Button>
                            </Form>

                            <Button variant='danger' onClick={deletdoctor}>Delete Doctor</Button>
                        </div>
                    </Col>
                </Row>
            </Container>
            {loading ? <Loader /> : ''}
        </>
    )
}

export default DoctorProfile