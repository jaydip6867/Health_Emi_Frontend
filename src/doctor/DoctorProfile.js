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
import CryptoJS from "crypto-js";

const DoctorProfile = () => {
    const SECRET_KEY = "health-emi";
    var navigate = useNavigate();
    const [loading, setloading] = useState(false)
    const [IsDisable, setdisabled] = useState(true)

    const [profile, setprofile] = useState(null)

    // country , state , city
    const [countries, setCountries] = useState([])
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    const [selectedCountryCode, setSelectedCountryCode] = useState("");
    const [selectedStateCode, setSelectedStateCode] = useState("");

    // Fetch all countries when component mounts
    useEffect(() => {
        setCountries(Country.getAllCountries());
    }, []);

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
        var sel_contry = countries.filter((v, i) => { return value === v.isoCode })
        setprofile(profile => ({
            ...profile,
            [name]: sel_contry[0].name
        }))

        const filteredStates = State.getStatesOfCountry(countryCode);
        setStates(filteredStates);
        setCities([]);
        setSelectedStateCode("");
        console.log(sel_contry[0].name)
    };

    // When user selects a state
    const handleStateChange = (e) => {
        const stateCode = e.target.value;
        setSelectedStateCode(stateCode);
        const { name, value } = e.target;
        var sel_state = states.filter((v, i) => { return value === v.isoCode })
        setprofile(profile => ({
            ...profile,
            [name]: sel_state[0].name
        }))

        const filteredCities = City.getCitiesOfState(selectedCountryCode, stateCode);
        setCities(filteredCities);
        console.log(sel_state[0].name)
    };


    const [doctor, setdoctor] = useState(null)
    const [token, settoken] = useState(null)


    useEffect(() => {
        var getlocaldata = localStorage.getItem('healthdoctor');
        if (getlocaldata != null) {
            const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            var data = JSON.parse(decrypted);
        }
        if (!data) {
            navigate('/doctor')
        }
        else {
            setdoctor(data.doctorData);
            settoken(`Bearer ${data.accessToken}`)
        }
    }, [navigate])

    useEffect(() => {
        setloading(true)
        if (doctor) {
            setTimeout(() => {
                getprofiledata()
            }, 200);
        }
    }, [doctor])

    function getprofiledata() {

        axios({
            method: 'get',
            url: 'https://healtheasy-o25g.onrender.com/doctor/profile',
            headers: {
                Authorization: token
            }
        }).then((res) => {
            setprofile(res.data.Data)
            // console.log('profile', res.data.Data)
        }).catch(function (error) {
            console.log(error);
        }).finally(() => {
            setloading(false)
        });

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

    function profiledata(e) {
        const { name, value } = e.target;
        setprofile(profile => ({
            ...profile,
            [name]: value
        }))
        console.log(profile)
    }

    function updateprofiledata(id) {

        console.log('update profile data = ', id, profile)
        // setloading(true)
        axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/doctor/profile/edit',
            headers: {
                Authorization: token
            },
            data: {
                "name": profile.name,
                "email": profile.email,
                "gender": profile.gender,
                "mobile": profile.mobile,
                "pincode": profile.pincode,
                "specialty": profile.specialty,
                "sub_specialty": profile.sub_specialty,
                "qualification": profile.qualification,
                "experience": profile.experience,
                "hospital_name": profile.hospital_name,
                "hospital_address": profile.hospital_address,
                "country": profile.country,
                "state": profile.state,
                "city": profile.city,
                "identityproof": profile.identityproof
            }
        }).then((res) => {
            // setprofile(res.data.Data)
            getprofiledata()
            setdisabled(true)
            setSelectedCountryCode('')
            setSelectedStateCode('')
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
            <Container fluid className='p-0 panel'>
                <Row className='g-0'>
                    <DoctorSidebar />
                    <Col xs={12} sm={9} lg={10} className='p-3'>
                        <DoctorNav doctorname={doctor && doctor.name} />
                        <div className='bg-white rounded p-3'>
                            <h4>Doctor Profile</h4>

                            {
                                profile !== null ? <div className='p-3 shadow'>
                                    <Form className='register_doctor row g-4'>
                                        <Form.Group as={Col} controlId="name" className='col-6 col-md-4 col-lg-3'>
                                            <div className='position-relative'>
                                                <Form.Label>Name</Form.Label>
                                                <Form.Control type="text" placeholder="Full Name" className='frm_input' name="name" value={profile && profile.name} disabled={IsDisable} onChange={profiledata} />
                                                <AiOutlineUser className='icon_input' />
                                            </div>
                                        </Form.Group>

                                        <Form.Group as={Col} controlId="email" className='col-6 col-md-4 col-lg-3'>
                                            <div className="position-relative">
                                                <Form.Label>Email</Form.Label>
                                                <Form.Control type="email" placeholder="Email" className='frm_input' name="email" value={profile && profile.email} disabled={IsDisable} onChange={profiledata} />
                                                <FaRegEnvelope className='icon_input' />
                                            </div>
                                        </Form.Group>

                                        <Form.Group controlId="mobile" className='col-6 col-md-4 col-lg-3'>
                                            <div className="position-relative">
                                                <Form.Label>Mobile No.</Form.Label>
                                                <Form.Control placeholder="Mobile No." className='frm_input' name='mobile' value={profile && profile.mobile} disabled={IsDisable} onChange={profiledata} />
                                                <AiOutlinePhone className='icon_input' />
                                            </div>
                                        </Form.Group>

                                        <Form.Group controlId="gender" className='col-6 col-md-4 col-lg-3'>
                                            <Form.Label>Gender </Form.Label>
                                            <div className='d-flex gap-3'>
                                                <label><Form.Check type='radio' name='gender' value={'Male'} className='d-inline-block me-2' checked={profile && profile.gender == "Male" ? true : false} onChange={profiledata} disabled={IsDisable} /> Male</label>
                                                <label><Form.Check type='radio' name='gender' value={'Female'} className='d-inline-block me-2' checked={profile && profile.gender == "Female" ? true : false} onChange={profiledata} disabled={IsDisable} /> Female</label>
                                            </div>
                                        </Form.Group>

                                        <Form.Group controlId="mobile" className='col-6 col-md-4 col-lg-3'>
                                            <div className="position-relative">
                                                <Form.Label>Pincode</Form.Label>
                                                <Form.Control placeholder="Pincode" className='frm_input' name='pincode' value={profile && profile.pincode} disabled={IsDisable} onChange={profiledata} />
                                                <CiLocationOn className='icon_input' />
                                            </div>
                                        </Form.Group>

                                        <Form.Group as={Col} controlId="Speciality" className='col-6 col-md-4 col-lg-3'>
                                            <div className='position-relative'>
                                                <Form.Label>Speciality</Form.Label>
                                                <Form.Control type="text" placeholder="Ex:- Cardiology" className='frm_input' name="specialty" value={profile && profile.specialty} disabled={IsDisable} onChange={profiledata} />
                                                <AiOutlineUser className='icon_input' />
                                            </div>
                                        </Form.Group>

                                        <Form.Group as={Col} controlId="SubSpeciality" className='col-6 col-md-4 col-lg-3'>
                                            <div className='position-relative'>
                                                <Form.Label>Sub Speciality</Form.Label>
                                                <Form.Control type="email" placeholder="Ex:- Echocardiography" className='frm_input' name="sub_specialty" value={profile && profile.sub_specialty} disabled={IsDisable} onChange={profiledata} />
                                                <FaRegEnvelope className='icon_input' />
                                            </div>
                                        </Form.Group>

                                        <Form.Group controlId="Degree" className='col-6 col-md-4 col-lg-3'>
                                            <div className='position-relative'>
                                                <Form.Label>Degree Registration No.</Form.Label>
                                                <Form.Control placeholder="Ex:- Dk4567" className='frm_input' name="degree_registration_no" value={profile && profile.degree_registration_no} disabled={IsDisable} onChange={profiledata} />
                                                <AiOutlinePhone className='icon_input' />
                                            </div>
                                        </Form.Group>

                                        <Form.Group controlId="Qualification" className='col-6 col-md-4 col-lg-3'>
                                            <div className='position-relative'>
                                                <Form.Label>Qualification</Form.Label>
                                                <Form.Control placeholder="Ex:- D.H.M.S, MD" className='frm_input' name="qualification" value={profile && profile.qualification} disabled={IsDisable} onChange={profiledata} />
                                                <CiLock className='icon_input' />
                                            </div>
                                        </Form.Group>

                                        <Form.Group controlId="Experience" className='col-6 col-md-4 col-lg-3'>
                                            <div className='position-relative'>
                                                <Form.Label>Experience</Form.Label>
                                                <Form.Control placeholder="Ex:- 5 Years" className='frm_input' name="experience" value={profile && profile.experience} disabled={IsDisable} onChange={profiledata} />
                                                <CiLock className='icon_input' />
                                            </div>
                                        </Form.Group>

                                        <Form.Group controlId="Hospitalname" className='col-6 col-md-4 col-lg-3'>
                                            <div className='position-relative'>
                                                <Form.Label>Hospital Name</Form.Label>
                                                <Form.Control placeholder="Enter Hospital Name" className='frm_input' name="hospital_name" value={profile && profile.hospital_name} disabled={IsDisable} onChange={profiledata} />
                                                <CiLock className='icon_input' />
                                            </div>
                                        </Form.Group>

                                        <Form.Group controlId="Hospitaladdress" className='col-6 col-md-4 col-lg-3'>
                                            <div className='position-relative'>
                                                <Form.Label>Hospital Address</Form.Label>
                                                <Form.Control as="textarea" placeholder="Enter Hospital Address" name="hospital_address" value={profile && profile.hospital_address} disabled={IsDisable} onChange={profiledata} />
                                            </div>
                                        </Form.Group>

                                        <Form.Group controlId="Hospitaladdress" className='col-6 col-md-4 col-lg-3'>
                                            <div className='position-relative'>
                                                <Form.Label>Doctor Profile</Form.Label>
                                                <Form.Control type="file" placeholder="Experience" name='identityproof' className='upload_file_doc' disabled={IsDisable} onChange={profiledata} />
                                            </div>
                                        </Form.Group>

                                        <Form.Group as={Col} controlId="Country" className='col-6 col-md-4 col-lg-3'>
                                            <div className='position-relative'>
                                                <Form.Label>Country</Form.Label>
                                                <Form.Select className='frm-select' name='country' disabled={IsDisable} onChange={handleCountryChange}  >
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
                                                <Form.Select className='frm-select' name='state' onChange={handleStateChange} value={selectedStateCode} disabled={!selectedCountryCode}>
                                                    {!selectedCountryCode ? <option>{profile && profile.state}</option> : ''}
                                                    {states.map((state) => {
                                                        return (
                                                            <option key={state.isoCode} value={state.isoCode} selected={profile && profile.state == state.name ? true : false}>
                                                                {state.name}
                                                            </option>
                                                        )
                                                    })}
                                                </Form.Select>
                                            </div>
                                        </Form.Group>

                                        <Form.Group as={Col} controlId="City" className='mb-3 col-3'>
                                            <div className='position-relative'>
                                                <Form.Label>City</Form.Label>
                                                <Form.Select className='frm-select' name='city' onChange={profiledata} disabled={!selectedStateCode}>
                                                    {!selectedStateCode ? <option>{profile && profile.city}</option> : ''}
                                                    {
                                                        cities && cities.map((city, vi) => {
                                                            return (<option key={vi} value={city.name} selected={profile && profile.city == city.name ? true : false}>{city.name}</option>)
                                                        })
                                                    }
                                                </Form.Select>
                                            </div>
                                        </Form.Group>

                                        <div className='text-center border-top'>
                                            {IsDisable ? <Button type="button" className='theme_btn col-3 mt-3' onClick={() => setdisabled(false)}>
                                                Edit Profile
                                            </Button> : <Button type="button" className='theme_btn col-3 mt-3' onClick={() => updateprofiledata(profile._id)}>
                                                Update
                                            </Button>}
                                        </div>
                                    </Form>
                                </div> : ''
                            }
                            <Button variant='danger' className='mt-4' onClick={deletdoctor}>Delete Doctor</Button>
                        </div>
                    </Col>
                </Row>
            </Container>
            {loading ? <Loader /> : ''}
        </>
    )
}

export default DoctorProfile