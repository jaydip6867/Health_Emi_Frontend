import React, { useEffect, useState } from "react";
import DoctorSidebar from "./DoctorSidebar";
import DoctorNav from "./DoctorNav";
import { Button, Col, Container, Form, Row, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Loader from "../Loader";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { Country, State, City } from "country-state-city";
import CryptoJS from "crypto-js";

const DoctorProfile = () => {
  const SECRET_KEY = "health-emi";
  var navigate = useNavigate();
  const [loading, setloading] = useState(false);
  const [IsDisable, setdisabled] = useState(true);

  const [profile, setprofile] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [identityProof, setIdentityProof] = useState(null);
  const [identityProofFile, setIdentityProofFile] = useState(null);

  // country , state , city
  const [countries, setCountries] = useState([]);
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
      if (identityProof) {
        URL.revokeObjectURL(identityProof);
      }
    };
  }, [profilePicPreview, identityProof]);

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
    var sel_contry = countries.filter((v, i) => {
      return value === v.isoCode;
    });
    setprofile((profile) => ({
      ...profile,
      [name]: sel_contry[0].name,
    }));

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
    var sel_state = states.filter((v, i) => {
      return value === v.isoCode;
    });
    setprofile((profile) => ({
      ...profile,
      [name]: sel_state[0].name,
    }));

    const filteredCities = City.getCitiesOfState(
      selectedCountryCode,
      stateCode
    );
    setCities(filteredCities);
    // console.log(sel_state[0].name)
  };

  const [doctor, setdoctor] = useState(null);
  const [token, settoken] = useState(null);

  useEffect(() => {
    var getlocaldata = localStorage.getItem("healthdoctor");
    if (getlocaldata != null) {
      const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      var data = JSON.parse(decrypted);
    }
    if (!data) {
      navigate("/doctor");
    } else {
      setdoctor(data.doctorData);
      settoken(`Bearer ${data.accessToken}`);
    }
  }, [navigate]);

  useEffect(() => {
    setloading(true);
    if (doctor) {
      setTimeout(() => {
        getprofiledata();
      }, 200);
    }
  }, [doctor]);

  function getprofiledata() {
    axios({
      method: "get",
      url: "https://healtheasy-o25g.onrender.com/doctor/profile",
      headers: {
        Authorization: token,
      },
    })
      .then((res) => {
        setprofile(res.data.Data);
        console.log("profile", res.data.Data);
      })
      .catch(function (error) {
        console.log(error);
      })
      .finally(() => {
        setloading(false);
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
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios({
          method: "get",
          url: "https://healtheasy-o25g.onrender.com/doctor/profile/remove",
          headers: {
            Authorization: token,
          },
          // data: profile
        })
          .then((res) => {
            // toast('Doctor Account Delete successfully...', { className: 'custom-toast-success' })
            // console.log(res)
            localStorage.removeItem("healthdoctor");
          })
          .catch(function (error) {
            // console.log(error);
            toast(error.response.data.Message, {
              className: "custom-toast-error",
            });
          })
          .finally(() => {
            // setloading(false)
            navigate("/");
          });
        Swal.fire({
          title: "Deleted!",
          text: "Your Account has been deleted.",
          icon: "success",
        });
      }
    });
  }

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      if (name === "profile_pic") {
        const file = files[0];
        if (file) {
          setprofile((profile) => ({
            ...profile,
            [name]: file,
          }));
          setProfilePicPreview(URL.createObjectURL(file));
        }
      } else if (name === "identityproof") {
        const file = files[0];
        if (file) {
          setIdentityProofFile(file);
          if (file.type.startsWith("image/")) {
            setIdentityProof(URL.createObjectURL(file));
          } else {
            // For non-image files like PDF, we'll just store the file
            setIdentityProof(null);
          }
        }
      }
    } else {
      // Handle regular form inputs
      setprofile((profile) => ({
        ...profile,
        [name]: value,
      }));
    }

    // Log updated profile for debugging
    console.log("Updated profile state:", profile);
  };

  const handleRemoveIdentityProof = (e) => {
    e.preventDefault();
    setIdentityProof(null);
    setIdentityProofFile(null);
    setprofile((profile) => ({
      ...profile,
      identityproof: "",
    }));
  };

  async function updateprofiledata(id) {
    console.log("update profile data = ", id, profile);
    setloading(true);

    try {
      let updatedProfile = { ...profile };

      // Check if there's a file to upload
      if (
        profile.profile_pic &&
        typeof profile.profile_pic === "object" &&
        profile.profile_pic.name
      ) {
        console.log("Uploading image first...");

        // Create FormData for file upload
        const formData = new FormData();
        formData.append("file", profile.profile_pic);

        // Upload image first
        const uploadResponse = await axios({
          method: "post",
          url: "https://healtheasy-o25g.onrender.com/user/upload",
          headers: {
            Authorization: token,
            "Content-Type": "multipart/form-data",
          },
          data: formData,
        });

        console.log("Image upload response:", uploadResponse.data.Data.url);

        // Update profile with the returned image URL
        updatedProfile.profile_pic = uploadResponse.data.Data.url;
        console.log(
          "Updated profile with image URL:",
          updatedProfile.profile_pic
        );
      }

      // Handle identity proof upload
      if (identityProofFile) {
        const formData = new FormData();
        formData.append("file", identityProofFile);

        const uploadResponse = await axios({
          method: "post",
          url: "https://healtheasy-o25g.onrender.com/user/upload",
          headers: {
            Authorization: token,
            "Content-Type": "multipart/form-data",
          },
          data: formData,
        });

        updatedProfile.identityproof = uploadResponse.data.Data.url;
      }

      // Now update the profile with all data including image URL
      const profileResponse = await axios({
        method: "post",
        url: "https://healtheasy-o25g.onrender.com/doctor/profile/edit",
        headers: { Authorization: token },
        data: {
          ...updatedProfile,
          identityproof: updatedProfile.identityproof || profile?.identityproof,
        },
      });

      // console.log('Profile update response:', profileResponse.data);

      // Success - refresh profile data and reset form
      getprofiledata();
      setdisabled(true);
      setSelectedCountryCode("");
      setSelectedStateCode("");

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
      console.error("Error updating profile:", error);
      Swal.fire({
        title: "Profile Not Update.",
        text: "Something went wrong. Please check details and try again.",
        icon: "error",
      });
    } finally {
      setloading(false);
    }
  }

  return (
    <>
      <Container fluid className="p-0 panel">
        <Row className="g-0">
          <DoctorSidebar />
          <Col xs={12} sm={9} lg={10} className="p-3">
            <DoctorNav doctorname={doctor && doctor.name} />
            <div className="bg-light p-4">
              {/* Header */}
              <Card className="mb-4 border-0 shadow-sm">
                <Card.Header className="bg-primary text-white py-3">
                  <h4 className="mb-0 text-white">
                    Update your Doctor Profile
                  </h4>
                </Card.Header>
              </Card>

              {profile !== null ? (
                <Form>
                  {/* Personal Information Section */}
                  <Card className="mb-4 border-0 shadow-sm">
                    <Card.Header className="bg-light border-bottom">
                      <h5 className="mb-0 text-primary">
                        Personal Information
                      </h5>
                    </Card.Header>
                    <Card.Body className="p-4">
                      <Row className="g-3">
                        <Col md={6} lg={4}>
                          <Form.Group>
                            <Form.Label className="fw-semibold">
                              Full Name
                            </Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Enter your full name"
                              name="name"
                              value={profile?.name || ""}
                              disabled={IsDisable}
                              onChange={handleChange}
                              className="form-control"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6} lg={4}>
                          <Form.Group>
                            <Form.Label className="fw-semibold">
                              Email Address
                            </Form.Label>
                            <Form.Control
                              type="email"
                              placeholder="Enter email address"
                              name="email"
                              value={profile?.email || ""}
                              disabled
                              onChange={handleChange}
                              className="form-control"
                            />
                            <Form.Text className="text-muted">
                              Email cannot be changed for security reasons
                            </Form.Text>
                          </Form.Group>
                        </Col>
                        <Col md={6} lg={4}>
                          <Form.Group>
                            <Form.Label className="fw-semibold">
                              Mobile Number
                            </Form.Label>
                            <Form.Control
                              type="tel"
                              placeholder="Enter mobile number"
                              name="mobile"
                              value={profile?.mobile || ""}
                              disabled
                              onChange={handleChange}
                              className="form-control"
                            />
                            <Form.Text className="text-muted">
                              Mobile cannot be changed for security reasons
                            </Form.Text>
                          </Form.Group>
                        </Col>
                        <Col md={6} lg={4}>
                          <Form.Group>
                            <Form.Label className="fw-semibold">
                              Gender
                            </Form.Label>
                            <div className="d-flex gap-4 mt-2">
                              <Form.Check
                                type="radio"
                                name="gender"
                                value="Male"
                                id="male"
                                label="Male"
                                checked={profile?.gender === "Male"}
                                onChange={handleChange}
                                disabled={IsDisable}
                              />
                              <Form.Check
                                type="radio"
                                name="gender"
                                value="Female"
                                id="female"
                                label="Female"
                                checked={profile?.gender === "Female"}
                                onChange={handleChange}
                                disabled={IsDisable}
                              />
                            </div>
                          </Form.Group>
                        </Col>
                        <Col md={6} lg={4}>
                          <Form.Group>
                            <Form.Label className="fw-semibold">
                              Pincode
                            </Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Enter pincode"
                              name="pincode"
                              value={profile?.pincode || ""}
                              disabled={IsDisable}
                              onChange={handleChange}
                              className="form-control"
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>

                  {/* Professional Information Section */}
                  <Card className="mb-4 border-0 shadow-sm">
                    <Card.Header className="bg-light border-bottom">
                      <h5 className="mb-0 text-success">
                        Professional Information
                      </h5>
                    </Card.Header>
                    <Card.Body className="p-4">
                      <Row className="g-3">
                        <Col md={6} lg={4}>
                          <Form.Group>
                            <Form.Label className="fw-semibold">
                              Specialty
                            </Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="e.g., Cardiology, Neurology"
                              name="specialty"
                              value={profile?.specialty || ""}
                              disabled
                              onChange={handleChange}
                              className="form-control"
                            />
                            <Form.Text className="text-muted">
                              Specialty cannot be changed after verification
                            </Form.Text>
                          </Form.Group>
                        </Col>
                        <Col md={6} lg={4}>
                          <Form.Group>
                            <Form.Label className="fw-semibold">
                              Sub Specialty
                            </Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="e.g., Echocardiography"
                              name="sub_specialty"
                              value={profile?.sub_specialty || ""}
                              disabled
                              onChange={handleChange}
                              className="form-control"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6} lg={4}>
                          <Form.Group>
                            <Form.Label className="fw-semibold">
                              Registration Number
                            </Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="e.g., DK4567"
                              name="degree_registration_no"
                              value={profile?.degree_registration_no || ""}
                              disabled={IsDisable}
                              onChange={handleChange}
                              className="form-control"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6} lg={4}>
                          <Form.Group>
                            <Form.Label className="fw-semibold">
                              Qualification
                            </Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="e.g., MBBS, MD, MS"
                              name="qualification"
                              value={profile?.qualification || ""}
                              disabled={IsDisable}
                              onChange={handleChange}
                              className="form-control"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6} lg={4}>
                          <Form.Group>
                            <Form.Label className="fw-semibold">
                              Experience
                            </Form.Label>
                            <Form.Select
                              name="experience"
                              value={profile?.experience || ""}
                              disabled={IsDisable}
                              onChange={handleChange}
                              className="form-select"
                            >
                              <option value="">Select Experience</option>
                              {[
                                "0+",
                                "1+",
                                "2+",
                                "3+",
                                "4+",
                                "5+",
                                "10+",
                                "20+",
                              ].map((level) => (
                                <option key={level} value={level + " years"}>
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
                  <Card className="mb-4 border-0 shadow-sm">
                    <Card.Header className="bg-light border-bottom">
                      <h5 className="mb-0 text-info">
                        Hospital & Practice Information
                      </h5>
                    </Card.Header>
                    <Card.Body className="p-4">
                      <Row className="g-3">
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-semibold">
                              Hospital/Clinic Name
                            </Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Enter hospital or clinic name"
                              name="hospital_name"
                              value={profile?.hospital_name || ""}
                              disabled={IsDisable}
                              onChange={handleChange}
                              className="form-control"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-semibold">
                              Hospital Address
                            </Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={3}
                              placeholder="Enter complete hospital address"
                              name="hospital_address"
                              value={profile?.hospital_address || ""}
                              disabled={IsDisable}
                              onChange={handleChange}
                              style={{ resize: "vertical" }}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-semibold">
                              Profile Picture
                            </Form.Label>
                            <input
                              type="file"
                              accept="image/*"
                              name="profile_pic"
                              disabled={IsDisable}
                              onChange={handleChange}
                              style={{ display: "none" }}
                              id="profile-pic-upload"
                            />
                            <label
                              htmlFor="profile-pic-upload"
                              className="btn btn-outline-secondary w-100 mb-3"
                              style={{
                                cursor: "pointer",
                                padding: "0.375rem 0.75rem",
                              }}
                            >
                              {profile?.profile_pic || profilePicPreview
                                ? "Change Profile Picture"
                                : "Upload Profile Picture"}
                            </label>

                            {(profile?.profile_pic || profilePicPreview) && (
                              <div className="border rounded p-3 bg-light">
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                  <div className="d-flex align-items-center">
                                    <i className="fas fa-user-circle text-primary me-2 fs-5"></i>
                                    <span className="fw-medium">
                                      Profile Photo
                                    </span>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setProfilePicPreview(null);
                                      setprofile((prev) => ({
                                        ...prev,
                                        profile_pic: "",
                                      }));
                                    }}
                                    className="btn btn-sm btn-outline-danger"
                                    disabled={IsDisable}
                                    title="Remove profile picture"
                                  >
                                    <i className="fas fa-trash-alt me-1"></i>{" "}
                                    Remove
                                  </button>
                                </div>

                                <div className="text-center">
                                  <div className="position-relative d-inline-block">
                                    <img
                                      src={
                                        profilePicPreview ||
                                        profile?.profile_pic
                                      }
                                      alt="Profile Preview"
                                      className="img-thumbnail rounded-circle"
                                      style={{
                                        width: "200px",
                                        height: "200px",
                                        objectFit: "cover",
                                        border: "3px solid #fff",
                                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                                      }}
                                    />
                                  </div>

                                  <div className="mt-3">
                                    <a
                                      href={
                                        profilePicPreview ||
                                        profile?.profile_pic
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="btn btn-outline-primary"
                                    >
                                      <i className="fas fa-expand me-2"></i>View
                                      Full Size
                                    </a>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-semibold">
                              Identity Proof (Aadhar)
                            </Form.Label>
                            <div className="position-relative">
                              <input
                                type="file"
                                className="form-control"
                                name="identityproof"
                                accept="image/*,.pdf"
                                onChange={handleChange}
                                disabled={IsDisable}
                                style={{ display: "none" }}
                                id="identity-proof-upload"
                              />
                              <label
                                htmlFor="identity-proof-upload"
                                className="btn btn-outline-secondary w-100"
                                style={{
                                  cursor: "pointer",
                                  padding: "0.375rem 0.75rem",
                                }}
                              >
                                {profile?.identityproof || identityProofFile
                                  ? "Change Identity Proof"
                                  : "Upload Identity Proof"}
                              </label>
                            </div>
                            {(profile?.identityproof || identityProofFile) && (
                              <div className="mt-3">
                                <div className="border rounded p-3 bg-light">
                                  <div className="d-flex align-items-center justify-content-between mb-3">
                                    <div className="d-flex align-items-center">
                                      <i className="fas fa-file-alt text-primary me-2 fs-5"></i>
                                      <span className="fw-medium">
                                        Identity Proof Document
                                      </span>
                                    </div>
                                    <button
                                      onClick={handleRemoveIdentityProof}
                                      className="btn btn-sm btn-outline-danger"
                                      disabled={IsDisable}
                                      title="Remove document"
                                    >
                                      <i className="fas fa-trash-alt me-1"></i>{" "}
                                      Remove
                                    </button>
                                  </div>

                                  <div className="text-center">
                                    <div className="position-relative d-inline-block">
                                      <img
                                        src={
                                          profile?.identityproof ||
                                          URL.createObjectURL(identityProofFile)
                                        }
                                        alt="Identity Proof Preview"
                                        className="img-thumbnail"
                                        style={{
                                          maxHeight: "200px",
                                          width: "auto",
                                          objectFit: "contain",
                                          border: "1px solid #dee2e6",
                                          boxShadow:
                                            "0 2px 4px rgba(0,0,0,0.05)",
                                        }}
                                      />
                                    </div>

                                    <div className="mt-3">
                                      <a
                                        href={
                                          profile?.identityproof ||
                                          URL.createObjectURL(identityProofFile)
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-primary"
                                      >
                                        <i className="fas fa-eye me-2"></i>View
                                        Full Document
                                      </a>
                                    </div>
                                  </div>

                                  <div className="text-muted text-center mt-2 small">
                                    {identityProofFile?.name ||
                                      "Document uploaded"}
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
                  <Card className="mb-4 border-0 shadow-sm">
                    <Card.Header className="bg-light border-bottom">
                      <h5 className="mb-0 text-warning">
                        Location Information
                      </h5>
                    </Card.Header>
                    <Card.Body className="p-4">
                      <Row className="g-3">
                        <Col md={4}>
                          <Form.Group>
                            <Form.Label className="fw-semibold">
                              Country
                            </Form.Label>
                            <Form.Select
                              name="country"
                              disabled={IsDisable}
                              onChange={handleCountryChange}
                              className="form-select"
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
                            <Form.Label className="fw-semibold">
                              State
                            </Form.Label>
                            <Form.Select
                              name="state"
                              onChange={handleStateChange}
                              value={selectedStateCode}
                              disabled={!selectedCountryCode || IsDisable}
                              className="form-select"
                            >
                              {!selectedCountryCode ? (
                                <option>
                                  {profile?.state || "Select State"}
                                </option>
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
                            <Form.Label className="fw-semibold">
                              City
                            </Form.Label>
                            <Form.Select
                              name="city"
                              onChange={handleChange}
                              disabled={!selectedStateCode || IsDisable}
                              className="form-select"
                            >
                              {!selectedStateCode ? (
                                <option>
                                  {profile?.city || "Select City"}
                                </option>
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
                  <Card className="border-0 shadow-sm">
                    <Card.Body className="p-4 text-center">
                      {IsDisable ? (
                        <Button
                          variant="primary"
                          className="px-5 me-3"
                          onClick={() => setdisabled(false)}
                        >
                          Edit Profile
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="success"
                            className="px-5 me-3"
                            onClick={() => updateprofiledata(profile._id)}
                          >
                            Update Profile
                          </Button>
                          <Button
                            variant="secondary"
                            className="px-4"
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
                <Card className="text-center py-5">
                  <Card.Body>
                    <h5>Loading profile information...</h5>
                  </Card.Body>
                </Card>
              )}

              {/* Delete Account Section */}
              <Card className="mt-4 border-danger">
                <Card.Header className="text-bg-danger">
                  <h6 className="mb-0 text-white">Delete Doctor</h6>
                </Card.Header>
                <Card.Body className="p-4 text-center">
                  <p className="text-muted mb-3">
                    Once you delete your account, there is no going back. Please
                    be certain.
                  </p>
                  <Button variant="outline-danger" onClick={deletdoctor}>
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
  );
};

export default DoctorProfile;
