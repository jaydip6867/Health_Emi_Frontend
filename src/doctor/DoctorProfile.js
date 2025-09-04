import React, { useEffect, useState } from 'react'
import DoctorSidebar from './DoctorSidebar'
import DoctorNav from './DoctorNav'
import { Button, Col, Container, Form, Row, Card } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import Loader from '../Loader'
import axios from 'axios'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import { Country, State, City } from 'country-state-city';
import CryptoJS from "crypto-js";

const DoctorProfile = () => {
    const SECRET_KEY = "health-emi";
    var navigate = useNavigate();
    const [loading, setloading] = useState(false)
    const [IsDisable, setdisabled] = useState(true)

    const [profile, setprofile] = useState(null)
    const [profilePicPreview, setProfilePicPreview] = useState(null)

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

    // Cleanup preview URL on component unmount
    useEffect(() => {
        return () => {
            if (profilePicPreview) {
                URL.revokeObjectURL(profilePicPreview);
            }
        };
    }, [profilePicPreview]);

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
        // console.log(sel_contry[0].name)
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
        // console.log(sel_state[0].name)
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
            console.log('profile', res.data.Data)
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
                    localStorage.removeItem('healthdoctor')
                }).catch(function (error) {
                    // console.log(error);
                    toast(error.response.data.Message, { className: 'custom-toast-error' })
                }).finally(() => {
                    // setloading(false)
                    navigate('/')
                });
                Swal.fire({
                    title: "Deleted!",
                    text: "Your Account has been deleted.",
                    icon: "success"
                });
            }
        });
    }

    function profiledata(e) {
        const { name, value, type, files } = e.target;

        if (type === 'file' && files && files[0]) {
            // Handle file upload
            const file = files[0];

            // Clean up previous preview URL to prevent memory leaks
            if (profilePicPreview) {
                URL.revokeObjectURL(profilePicPreview);
            }

            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setProfilePicPreview(previewUrl);

            // Update profile with file
            setprofile(profile => ({
                ...profile,
                [name]: file
            }))

            // Log file details for debugging
            console.log(`File selected for ${name}:`, {
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                fileObject: file
            });
        } else {
            // Handle regular form inputs
            setprofile(profile => ({
                ...profile,
                [name]: value
            }))
        }

        // Log updated profile for debugging
        console.log('Updated profile state:', profile);
    }

    async function updateprofiledata(id) {
        console.log('update profile data = ', id, profile)
        setloading(true)

        try {
            let updatedProfile = { ...profile };

            // Check if there's a file to upload
            if (profile.profile_pic && typeof profile.profile_pic === 'object' && profile.profile_pic.name) {
                console.log('Uploading image first...');

                // Create FormData for file upload
                const formData = new FormData();
                formData.append('file', profile.profile_pic);

                // Upload image first
                const uploadResponse = await axios({
                    method: 'post',
                    url: 'https://healtheasy-o25g.onrender.com/user/upload',
                    headers: {
                        Authorization: token,
                        'Content-Type': 'multipart/form-data'
                    },
                    data: formData
                });

                console.log('Image upload response:', uploadResponse.data.Data.url);

                // Update profile with the returned image URL
                updatedProfile.profile_pic = uploadResponse.data.Data.url;
                console.log('Updated profile with image URL:', updatedProfile.profile_pic);
            }

            // Now update the profile with all data including image URL
            const profileResponse = await axios({
                method: 'post',
                url: 'https://healtheasy-o25g.onrender.com/doctor/profile/edit',
                headers: {
                    Authorization: token
                },
                data: {
                    "name": updatedProfile.name,
                    "email": updatedProfile.email,
                    "gender": updatedProfile.gender,
                    "mobile": updatedProfile.mobile,
                    "pincode": updatedProfile.pincode,
                    "specialty": updatedProfile.specialty,
                    "sub_specialty": updatedProfile.sub_specialty,
                    "qualification": updatedProfile.qualification,
                    "experience": updatedProfile.experience,
                    "hospital_name": updatedProfile.hospital_name,
                    "hospital_address": updatedProfile.hospital_address,
                    "country": updatedProfile.country,
                    "state": updatedProfile.state,
                    "city": updatedProfile.city,
                    "profile_pic": updatedProfile.profile_pic
                }
            });

            // console.log('Profile update response:', profileResponse.data);

            // Success - refresh profile data and reset form
            getprofiledata()
            setdisabled(true)
            setSelectedCountryCode('')
            setSelectedStateCode('')

            // Clear profile picture preview
            if (profilePicPreview) {
                URL.revokeObjectURL(profilePicPreview);
                setProfilePicPreview(null);
            }

            Swal.fire({
                title: "Profile Update Successfully...",
                icon: "success",
            });

        } catch (error) {
            console.error('Error updating profile:', error);
            Swal.fire({
                title: "Profile Not Update.",
                text: "Something went wrong. Please check details and try again.",
                icon: "error",
            });
        } finally {
            setloading(false)
        }
    }


    return (
        <>
            <Container fluid className='p-0 panel'>
                <Row className='g-0'>
                    <DoctorSidebar />
                    <Col xs={12} sm={9} lg={10} className='p-3'>
                        <DoctorNav doctorname={doctor && doctor.name} />
                        <div className='bg-light p-4'>
                            {/* Header */}
                            <Card className='mb-4 border-0 shadow-sm'>
                                <Card.Header className='bg-primary text-white py-3'>
                                    <h4 className='mb-0 text-white'>Update your Doctor Profile</h4>
                                </Card.Header>
                            </Card>

                            {profile !== null ? (
                                <Form>
                                    {/* Personal Information Section */}
                                    <Card className='mb-4 border-0 shadow-sm'>
                                        <Card.Header className='bg-light border-bottom'>
                                            <h5 className='mb-0 text-primary'>Personal Information</h5>
                                        </Card.Header>
                                        <Card.Body className='p-4'>
                                            <Row className='g-3'>
                                                <Col md={6} lg={4}>
                                                    <Form.Group>
                                                        <Form.Label className='fw-semibold'>Full Name</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="Enter your full name"
                                                            name="name"
                                                            value={profile?.name || ''}
                                                            disabled={IsDisable}
                                                            onChange={profiledata}
                                                            className='form-control'
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6} lg={4}>
                                                    <Form.Group>
                                                        <Form.Label className='fw-semibold'>Email Address</Form.Label>
                                                        <Form.Control
                                                            type="email"
                                                            placeholder="Enter email address"
                                                            name="email"
                                                            value={profile?.email || ''}
                                                            disabled
                                                            onChange={profiledata}
                                                            className='form-control'
                                                        />
                                                        <Form.Text className='text-muted'>
                                                            Email cannot be changed for security reasons
                                                        </Form.Text>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6} lg={4}>
                                                    <Form.Group>
                                                        <Form.Label className='fw-semibold'>Mobile Number</Form.Label>
                                                        <Form.Control
                                                            type="tel"
                                                            placeholder="Enter mobile number"
                                                            name='mobile'
                                                            value={profile?.mobile || ''}
                                                            disabled
                                                            onChange={profiledata}
                                                            className='form-control'
                                                        />
                                                        <Form.Text className='text-muted'>
                                                            Mobile cannot be changed for security reasons
                                                        </Form.Text>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6} lg={4}>
                                                    <Form.Group>
                                                        <Form.Label className='fw-semibold'>Gender</Form.Label>
                                                        <div className='d-flex gap-4 mt-2'>
                                                            <Form.Check
                                                                type='radio'
                                                                name='gender'
                                                                value='Male'
                                                                id='male'
                                                                label='Male'
                                                                checked={profile?.gender === "Male"}
                                                                onChange={profiledata}
                                                                disabled={IsDisable}
                                                            />
                                                            <Form.Check
                                                                type='radio'
                                                                name='gender'
                                                                value='Female'
                                                                id='female'
                                                                label='Female'
                                                                checked={profile?.gender === "Female"}
                                                                onChange={profiledata}
                                                                disabled={IsDisable}
                                                            />
                                                        </div>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6} lg={4}>
                                                    <Form.Group>
                                                        <Form.Label className='fw-semibold'>Pincode</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="Enter pincode"
                                                            name='pincode'
                                                            value={profile?.pincode || ''}
                                                            disabled={IsDisable}
                                                            onChange={profiledata}
                                                            className='form-control'
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>

                                    {/* Professional Information Section */}
                                    <Card className='mb-4 border-0 shadow-sm'>
                                        <Card.Header className='bg-light border-bottom'>
                                            <h5 className='mb-0 text-success'>Professional Information</h5>
                                        </Card.Header>
                                        <Card.Body className='p-4'>
                                            <Row className='g-3'>
                                                <Col md={6} lg={4}>
                                                    <Form.Group>
                                                        <Form.Label className='fw-semibold'>Specialty</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="e.g., Cardiology, Neurology"
                                                            name="specialty"
                                                            value={profile?.specialty || ''}
                                                            disabled
                                                            onChange={profiledata}
                                                            className='form-control'
                                                        />
                                                        <Form.Text className='text-muted'>
                                                            Specialty cannot be changed after verification
                                                        </Form.Text>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6} lg={4}>
                                                    <Form.Group>
                                                        <Form.Label className='fw-semibold'>Sub Specialty</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="e.g., Echocardiography"
                                                            name="sub_specialty"
                                                            value={profile?.sub_specialty || ''}
                                                            disabled
                                                            onChange={profiledata}
                                                            className='form-control'
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6} lg={4}>
                                                    <Form.Group>
                                                        <Form.Label className='fw-semibold'>Registration Number</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="e.g., DK4567"
                                                            name="degree_registration_no"
                                                            value={profile?.degree_registration_no || ''}
                                                            disabled={IsDisable}
                                                            onChange={profiledata}
                                                            className='form-control'
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6} lg={4}>
                                                    <Form.Group>
                                                        <Form.Label className='fw-semibold'>Qualification</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="e.g., MBBS, MD, MS"
                                                            name="qualification"
                                                            value={profile?.qualification || ''}
                                                            disabled={IsDisable}
                                                            onChange={profiledata}
                                                            className='form-control'
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6} lg={4}>
                                                    <Form.Group>
                                                        <Form.Label className='fw-semibold'>Experience</Form.Label>
                                                        <Form.Select
                                                            name="experience"
                                                            value={profile?.experience || ''}
                                                            disabled={IsDisable}
                                                            onChange={profiledata}
                                                            className='form-select'
                                                        >
                                                            <option value="">Select Experience</option>
                                                            {['0+', '1+', '2+', '3+', '4+', '5+', '10+', '20+'].map((level) => (
                                                                <option key={level} value={level + ' years'}>
                                                                    {level} years
                                                                </option>
                                                            ))}
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>

                                    {/* Hospital Information Section */}
                                    <Card className='mb-4 border-0 shadow-sm'>
                                        <Card.Header className='bg-light border-bottom'>
                                            <h5 className='mb-0 text-info'>Hospital & Practice Information</h5>
                                        </Card.Header>
                                        <Card.Body className='p-4'>
                                            <Row className='g-3'>
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label className='fw-semibold'>Hospital/Clinic Name</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="Enter hospital or clinic name"
                                                            name="hospital_name"
                                                            value={profile?.hospital_name || ''}
                                                            disabled={IsDisable}
                                                            onChange={profiledata}
                                                            className='form-control'
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label className='fw-semibold'>Hospital Address</Form.Label>
                                                        <Form.Control
                                                            as="textarea"
                                                            rows={3}
                                                            placeholder="Enter complete hospital address"
                                                            name="hospital_address"
                                                            value={profile?.hospital_address || ''}
                                                            disabled={IsDisable}
                                                            onChange={profiledata}
                                                            style={{ resize: 'vertical' }}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label className='fw-semibold'>Profile Picture</Form.Label>
                                                        <Form.Control
                                                            type="file"
                                                            accept="image/*"
                                                            name='profile_pic'
                                                            disabled={IsDisable}
                                                            onChange={profiledata}
                                                            className='form-control'
                                                        />
                                                        <Form.Text className='text-muted'>
                                                            Upload a professional profile picture (JPG, PNG)
                                                        </Form.Text>
                                                        
                                                        {/* Existing Profile Picture Display */}
                                                        {profile?.profile_pic && !profilePicPreview && typeof profile.profile_pic === 'string' && (
                                                            <div className='mt-3'>
                                                                <div className='d-flex align-items-center gap-3'>
                                                                    <div>
                                                                        <img
                                                                            src={profile.profile_pic}
                                                                            alt="Current Profile Picture"
                                                                            style={{
                                                                                width: '100px',
                                                                                height: '100px',
                                                                                objectFit: 'cover',
                                                                                borderRadius: '8px',
                                                                                border: '2px solid #28a745'
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <small className='text-success fw-semibold'>✓ Current profile picture</small>
                                                                        <br />
                                                                        <small className='text-muted'>Your existing profile image</small>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Profile Picture Preview */}
                                                        {profilePicPreview && (
                                                            <div className='mt-3'>
                                                                <div className='d-flex align-items-center gap-3'>
                                                                    <div>
                                                                        <img
                                                                            src={profilePicPreview}
                                                                            alt="Profile Preview"
                                                                            style={{
                                                                                width: '100px',
                                                                                height: '100px',
                                                                                objectFit: 'cover',
                                                                                borderRadius: '8px',
                                                                                border: '2px solid #dee2e6'
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <small className='text-success fw-semibold'>✓ Image selected</small>
                                                                        <br />
                                                                        <small className='text-muted'>Preview of your profile picture</small>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>

                                    {/* Location Information Section */}
                                    <Card className='mb-4 border-0 shadow-sm'>
                                        <Card.Header className='bg-light border-bottom'>
                                            <h5 className='mb-0 text-warning'>Location Information</h5>
                                        </Card.Header>
                                        <Card.Body className='p-4'>
                                            <Row className='g-3'>
                                                <Col md={4}>
                                                    <Form.Group>
                                                        <Form.Label className='fw-semibold'>Country</Form.Label>
                                                        <Form.Select
                                                            name='country'
                                                            disabled={IsDisable}
                                                            onChange={handleCountryChange}
                                                            className='form-select'
                                                        >
                                                            <option value="">Select Country</option>
                                                            {countries.map((country) => (
                                                                <option
                                                                    key={country.isoCode}
                                                                    value={country.isoCode}
                                                                    selected={profile?.country === country.name}
                                                                >
                                                                    {country.name}
                                                                </option>
                                                            ))}
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={4}>
                                                    <Form.Group>
                                                        <Form.Label className='fw-semibold'>State</Form.Label>
                                                        <Form.Select
                                                            name='state'
                                                            onChange={handleStateChange}
                                                            value={selectedStateCode}
                                                            disabled={!selectedCountryCode || IsDisable}
                                                            className='form-select'
                                                        >
                                                            {!selectedCountryCode ? (
                                                                <option>{profile?.state || 'Select State'}</option>
                                                            ) : (
                                                                <option value="">Select State</option>
                                                            )}
                                                            {states.map((state) => (
                                                                <option
                                                                    key={state.isoCode}
                                                                    value={state.isoCode}
                                                                    selected={profile?.state === state.name}
                                                                >
                                                                    {state.name}
                                                                </option>
                                                            ))}
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={4}>
                                                    <Form.Group>
                                                        <Form.Label className='fw-semibold'>City</Form.Label>
                                                        <Form.Select
                                                            name='city'
                                                            onChange={profiledata}
                                                            disabled={!selectedStateCode || IsDisable}
                                                            className='form-select'
                                                        >
                                                            {!selectedStateCode ? (
                                                                <option>{profile?.city || 'Select City'}</option>
                                                            ) : (
                                                                <option value="">Select City</option>
                                                            )}
                                                            {cities?.map((city, vi) => (
                                                                <option
                                                                    key={vi}
                                                                    value={city.name}
                                                                    selected={profile?.city === city.name}
                                                                >
                                                                    {city.name}
                                                                </option>
                                                            ))}
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>

                                    {/* Action Buttons */}
                                    <Card className='border-0 shadow-sm'>
                                        <Card.Body className='p-4 text-center'>
                                            {IsDisable ? (
                                                <Button
                                                    variant="primary"

                                                    className='px-5 me-3'
                                                    onClick={() => setdisabled(false)}
                                                >
                                                    Edit Profile
                                                </Button>
                                            ) : (
                                                <>
                                                    <Button
                                                        variant="success"
                                                        className='px-5 me-3'
                                                        onClick={() => updateprofiledata(profile._id)}
                                                    >
                                                        Update Profile
                                                    </Button>
                                                    <Button
                                                        variant="secondary"
                                                        className='px-4'
                                                        onClick={() => {
                                                            setdisabled(true);
                                                            // Clear profile picture preview on cancel
                                                            if (profilePicPreview) {
                                                                URL.revokeObjectURL(profilePicPreview);
                                                                setProfilePicPreview(null);
                                                            }
                                                        }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </>
                                            )}
                                        </Card.Body>
                                    </Card>
                                </Form>
                            ) : (
                                <Card className='text-center py-5'>
                                    <Card.Body>
                                        <h5>Loading profile information...</h5>
                                    </Card.Body>
                                </Card>
                            )}

                            {/* Delete Account Section */}
                            <Card className='mt-4 border-danger'>
                                <Card.Header className='text-bg-danger'>
                                    <h6 className='mb-0 text-white'>Delete Doctor</h6>
                                </Card.Header>
                                <Card.Body className='p-4 text-center'>
                                    <p className='text-muted mb-3'>
                                        Once you delete your account, there is no going back. Please be certain.
                                    </p>
                                    <Button
                                        variant='outline-danger'

                                        onClick={deletdoctor}
                                    >
                                        Delete Doctor Account
                                    </Button>
                                </Card.Body>
                            </Card>
                        </div>
                    </Col>
                </Row>
            </Container>
            {loading && <Loader />}
        </>
    )
}

export default DoctorProfile