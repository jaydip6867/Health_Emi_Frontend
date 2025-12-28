import React, { useEffect, useState } from "react";
import DoctorSidebar from "./DoctorSidebar";
import { Button, Col, Container, Form, Row, Card, Modal, Tabs, Tab } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Loader from "../Loader";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { Country, State, City } from "country-state-city";
import CryptoJS from "crypto-js";
import { FaRegPenToSquare, FaRegTrashCan } from "react-icons/fa6";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { API_BASE_URL, SECRET_KEY, STORAGE_KEYS } from '../config';
import NavBar from "../Visitor/Component/NavBar";
import FooterBar from "../Visitor/Component/FooterBar";

const DoctorProfile = () => {

  var navigate = useNavigate();
  const [loading, setloading] = useState(false);
  const [IsDisable, setdisabled] = useState(true);

  const [profile, setprofile] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [identityProof, setIdentityProof] = useState(null);
  const [identityProofFile, setIdentityProofFile] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // country , state , city
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const [selectedStateCode, setSelectedStateCode] = useState("");

  // Hospital edit modal state
  const [showEditHospitalModal, setShowEditHospitalModal] = useState(false);
  const [editingHospitalIndex, setEditingHospitalIndex] = useState(null);
  const [editHospital, setEditHospital] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: ""
  });

  // Add hospital modal state
  const [showAddHospitalModal, setShowAddHospitalModal] = useState(false);
  const [newHospital, setNewHospital] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: ""
  });

  // Add hospital dropdowns state
  const [addHospitalCountries, setAddHospitalCountries] = useState([]);
  const [addHospitalStates, setAddHospitalStates] = useState([]);
  const [addHospitalCities, setAddHospitalCities] = useState([]);
  const [selectedAddHospitalCountryCode, setSelectedAddHospitalCountryCode] = useState("");
  const [selectedAddHospitalStateCode, setSelectedAddHospitalStateCode] = useState("");

  // Hospital edit dropdowns state
  const [hospitalCountries, setHospitalCountries] = useState([]);
  const [hospitalStates, setHospitalStates] = useState([]);
  const [hospitalCities, setHospitalCities] = useState([]);
  const [selectedHospitalCountryCode, setSelectedHospitalCountryCode] = useState("");
  const [selectedHospitalStateCode, setSelectedHospitalStateCode] = useState("");

  // Fetch all countries when component mounts
  useEffect(() => {
    setCountries(Country.getAllCountries());
    setHospitalCountries(Country.getAllCountries());
    setAddHospitalCountries(Country.getAllCountries());
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
    // console.log("All states:", allStates); 
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

  // Hospital edit handlers
  const handleEditHospital = (index) => {
    const hospital = profile.hospitals[index];
    setEditingHospitalIndex(index);
    setEditHospital({
      name: hospital.name || "",
      address: hospital.address || "",
      city: hospital.city || "",
      state: hospital.state || "",
      country: hospital.country || "",
      pincode: hospital.pincode || ""
    });

    // Find and set country code
    const country = hospitalCountries.find(c => c.name === hospital.country);
    if (country) {
      setSelectedHospitalCountryCode(country.isoCode);
      const filteredStates = State.getStatesOfCountry(country.isoCode);
      setHospitalStates(filteredStates);

      // Find and set state code
      const state = filteredStates.find(s => s.name === hospital.state);
      if (state) {
        setSelectedHospitalStateCode(state.isoCode);
        const filteredCities = City.getCitiesOfState(country.isoCode, state.isoCode);
        setHospitalCities(filteredCities);
      }
    }

    setShowEditHospitalModal(true);
  };

  const handleHospitalCountryChange = (e) => {
    const countryCode = e.target.value;
    setSelectedHospitalCountryCode(countryCode);

    if (countryCode) {
      const sel_country = hospitalCountries.find(country => country.isoCode === countryCode);
      const filteredStates = State.getStatesOfCountry(countryCode);

      setHospitalStates(filteredStates);
      setHospitalCities([]);
      setSelectedHospitalStateCode("");

      setEditHospital({
        ...editHospital,
        country: sel_country.name,
        state: "",
        city: ""
      });
    } else {
      setHospitalStates([]);
      setHospitalCities([]);
      setSelectedHospitalStateCode("");
      setEditHospital({
        ...editHospital,
        country: "",
        state: "",
        city: ""
      });
    }
  };

  const handleHospitalStateChange = (e) => {
    const stateCode = e.target.value;
    setSelectedHospitalStateCode(stateCode);

    if (stateCode) {
      const sel_state = hospitalStates.find(state => state.isoCode === stateCode);
      const filteredCities = City.getCitiesOfState(selectedHospitalCountryCode, stateCode);

      setHospitalCities(filteredCities);

      setEditHospital({
        ...editHospital,
        state: sel_state.name,
        city: ""
      });
    } else {
      setHospitalCities([]);
      setEditHospital({
        ...editHospital,
        state: "",
        city: ""
      });
    }
  };

  const handleHospitalCityChange = (e) => {
    const { name, value } = e.target;
    setEditHospital({
      ...editHospital,
      [name]: value,
    });
  };

  const handleEditHospitalChange = (e) => {
    const { name, value } = e.target;
    setEditHospital({
      ...editHospital,
      [name]: value,
    });
  };

  const saveHospitalEdit = () => {
    if (!editHospital.name || !editHospital.address || !editHospital.city || !editHospital.state || !editHospital.country || !editHospital.pincode) {
      toast.error("Please fill all hospital fields");
      return;
    }

    const updatedHospitals = [...profile.hospitals];
    updatedHospitals[editingHospitalIndex] = editHospital;

    setprofile({
      ...profile,
      hospitals: updatedHospitals
    });

    // Reset modal state
    setShowEditHospitalModal(false);
    setEditingHospitalIndex(null);
    setEditHospital({
      name: "",
      address: "",
      city: "",
      state: "",
      country: "",
      pincode: ""
    });
    setSelectedHospitalCountryCode("");
    setSelectedHospitalStateCode("");
    setHospitalStates([]);
    setHospitalCities([]);

    toast.success("Hospital information updated successfully!");
  };

  const closeEditModal = () => {
    setShowEditHospitalModal(false);
    setEditingHospitalIndex(null);
    setEditHospital({
      name: "",
      address: "",
      city: "",
      state: "",
      country: "",
      pincode: ""
    });
    setSelectedHospitalCountryCode("");
    setSelectedHospitalStateCode("");
    setHospitalStates([]);
    setHospitalCities([]);
  };

  // Add hospital handlers
  const handleAddHospital = () => {
    setShowAddHospitalModal(true);
  };

  const handleAddHospitalCountryChange = (e) => {
    const countryCode = e.target.value;
    setSelectedAddHospitalCountryCode(countryCode);

    if (countryCode) {
      const sel_country = addHospitalCountries.find(country => country.isoCode === countryCode);
      const filteredStates = State.getStatesOfCountry(countryCode);

      setAddHospitalStates(filteredStates);
      setAddHospitalCities([]);
      setSelectedAddHospitalStateCode("");

      setNewHospital({
        ...newHospital,
        country: sel_country.name,
        state: "",
        city: ""
      });
    } else {
      setAddHospitalStates([]);
      setAddHospitalCities([]);
      setSelectedAddHospitalStateCode("");
      setNewHospital({
        ...newHospital,
        country: "",
        state: "",
        city: ""
      });
    }
  };

  const handleAddHospitalStateChange = (e) => {
    const stateCode = e.target.value;
    setSelectedAddHospitalStateCode(stateCode);

    if (stateCode) {
      const sel_state = addHospitalStates.find(state => state.isoCode === stateCode);
      const filteredCities = City.getCitiesOfState(selectedAddHospitalCountryCode, stateCode);

      setAddHospitalCities(filteredCities);

      setNewHospital({
        ...newHospital,
        state: sel_state.name,
        city: ""
      });
    } else {
      setAddHospitalCities([]);
      setNewHospital({
        ...newHospital,
        state: "",
        city: ""
      });
    }
  };

  const handleAddHospitalCityChange = (e) => {
    const { name, value } = e.target;
    setNewHospital({
      ...newHospital,
      [name]: value,
    });
  };

  const handleNewHospitalChange = (e) => {
    const { name, value } = e.target;
    setNewHospital({
      ...newHospital,
      [name]: value,
    });
  };

  const saveNewHospital = () => {
    if (!newHospital.name || !newHospital.address || !newHospital.city || !newHospital.state || !newHospital.country || !newHospital.pincode) {
      toast.error("Please fill all hospital fields");
      return;
    }

    const updatedHospitals = profile.hospitals ? [...profile.hospitals, newHospital] : [newHospital];

    setprofile({
      ...profile,
      hospitals: updatedHospitals
    });

    // Reset modal state
    closeAddModal();
    toast.success("Hospital added successfully!");
  };

  const closeAddModal = () => {
    setShowAddHospitalModal(false);
    setNewHospital({
      name: "",
      address: "",
      city: "",
      state: "",
      country: "",
      pincode: ""
    });
    setSelectedAddHospitalCountryCode("");
    setSelectedAddHospitalStateCode("");
    setAddHospitalStates([]);
    setAddHospitalCities([]);
  };

  // Remove hospital handler
  const handleRemoveHospital = (index) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to remove this hospital affiliation?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove it!'
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedHospitals = profile.hospitals.filter((_, i) => i !== index);
        setprofile({
          ...profile,
          hospitals: updatedHospitals
        });
        toast.success('Hospital removed successfully!');
      }
    });
  };

  const [doctor, setdoctor] = useState(null);
  const [token, settoken] = useState(null);

  useEffect(() => {
    var getlocaldata = localStorage.getItem(STORAGE_KEYS.DOCTOR);
    if (getlocaldata != null) {
      const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      var data = JSON.parse(decrypted);
      // console.log(data)
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
      url: `${API_BASE_URL}/doctor/profile`,
      headers: {
        Authorization: token,
      },
    })
      .then((res) => {
        setprofile({
          ...res.data.Data,
          oldProfilePic: res.data.Data.profile_pic,
        });
        // console.log(res.data.Data)
      })
      .catch(function (error) {
        // console.log(error);
      })
      .finally(() => {
        setloading(false);
      });
  }
  // console.log("profile", profile);
  // console.log(token)
  // function deletdoctor() {
  //   Swal.fire({
  //     title: "Are you sure?",
  //     text: "You Want Delete Your Account.",
  //     icon: "warning",
  //     showCancelButton: true,
  //     confirmButtonColor: "#3085d6",
  //     cancelButtonColor: "#d33",
  //     confirmButtonText: "Yes, delete it!",
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       axios({
  //         method: "get",
  //         url: `${API_BASE_URL}/doctor/profile/remove`,
  //         headers: {
  //           Authorization: token,
  //         },
  //         // data: profile
  //       })
  //         .then((res) => {
  //           // toast('Doctor Account Delete successfully', { className: 'custom-toast-success' })
  //           // console.log(res)
  //           localStorage.removeItem("healthdoctor");
  //         })
  //         .catch(function (error) {
  //           // console.log(error);
  //           toast(error.response.data.Message, {
  //             className: "custom-toast-error",
  //           });
  //         })
  //         .finally(() => {
  //           // setloading(false)
  //           navigate("/");
  //         });
  //       Swal.fire({
  //         title: "Deleted!",
  //         text: "Your Account has been deleted.",
  //         icon: "success",
  //       });
  //     }
  //   });
  // }

  const handleChange = (e) => {
    const { name, value, type, files, checked } = e.target;

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
    } else if (type === "checkbox") {
      setprofile((profile) => ({
        ...profile,
        [name]: checked,
      }));
    } else {
      if(name === "newpassword") {
        setnewpassword(value);
        setprofile((profile) => ({
          ...profile,
          password: value,
        }));
      }
      // Handle regular form inputs
      setprofile((profile) => ({
        ...profile,
        [name]: value,
      }));
    }

    // Log updated profile for debugging
    // console.log("Updated profile state:", profile);
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
    // console.log("update profile data = ", id, profile);
    setloading(true);

    try {
      const confirm = confirmPassword || "";
      // Only validate when either field has a value
      if (newPassword || confirm) {
        if (newPassword !== confirm) {
          toast.error("Passwords do not match");
          setloading(false);
        }
      }
      let updatedProfile = { ...profile, };

      // Check if there's a new file to upload
      if (
        profile.profile_pic &&
        typeof profile.profile_pic === "object" &&
        profile.profile_pic.name
      ) {
        // console.log("Removing old image and uploading new one...");

        // If there's an existing profile picture, remove it first
        if (profile.oldProfilePic) {
          try {
            await axios({
              method: "post",
              url: `${API_BASE_URL}/user/upload/removeimage`,
              headers: {
                Authorization: token,
                "Content-Type": "application/json"
              },
              data: { path: profile.oldProfilePic }
            });
            // console.log("Old image removed successfully");
          } catch (error) {
            // console.error("Error removing old image:", error);
            // Continue with the upload even if removal fails
          }
        }

        // Upload the new image
        const formData = new FormData();
        formData.append("file", profile.profile_pic);

        const uploadResponse = await axios({
          method: "post",
          url: `${API_BASE_URL}/user/upload`,
          headers: {
            Authorization: token,
            "Content-Type": "multipart/form-data",
          },
          data: formData,
        });

        // console.log("New image upload response:", uploadResponse.data.Data.url);
        updatedProfile.profile_pic = uploadResponse.data.Data.url;
        // Clear the oldProfilePic since we've successfully uploaded a new one
        updatedProfile.oldProfilePic = '';
      }

      // Handle identity proof upload
      if (identityProofFile) {
        const formData = new FormData();
        formData.append("file", identityProofFile);

        const uploadResponse = await axios({
          method: "post",
          url: `${API_BASE_URL}/user/upload`,
          headers: {
            Authorization: token,
            "Content-Type": "multipart/form-data",
          },
          data: formData,
        });

        updatedProfile.identityproof = uploadResponse.data.Data.url;
      }

      // Prepare payload; do not send empty password and map availability
      const dataToSend = {
        ...updatedProfile,
        identityproof: updatedProfile.identityproof || profile?.identityproof,
      };
      if (!dataToSend.password) {
        delete dataToSend.password;
      }
      // Normalize availability to boolean (true if checked, else false)
      if (typeof dataToSend.is_available !== 'undefined') {
        const v = dataToSend.is_available;
        if (typeof v === 'boolean') {
          dataToSend.is_available = v;
        } else if (typeof v === 'string') {
          const s = v.toLowerCase();
          if (s === 'available' || s === 'true' || s === '1' || s === 'yes') {
            dataToSend.is_available = true;
          } else if (s === 'unavailable' || s === 'false' || s === '0' || s === 'no') {
            dataToSend.is_available = false;
          } else {
            dataToSend.is_available = Boolean(v);
          }
        } else if (typeof v === 'number') {
          dataToSend.is_available = v === 1;
        } else {
          dataToSend.is_available = Boolean(v);
        }
      }
      // Remove any stray 'available' prop if present
      if ('available' in dataToSend) delete dataToSend.available;

      // Now update the profile with all data including image URL
      const profileResponse = await axios({
        method: "post",
        url: `${API_BASE_URL}/doctor/profile/edit`,
        headers: { Authorization: token },
        data: dataToSend,
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
        title: "Profile updated successfully.",
        icon: "success",
      });
      setnewpassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setShowConfirmPassword(false);
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.DOCTOR);
        if (stored) {
          const bytes = CryptoJS.AES.decrypt(stored, SECRET_KEY);
          const decrypted = bytes.toString(CryptoJS.enc.Utf8);
          if (decrypted) {
            const obj = JSON.parse(decrypted);
            if (obj && obj.doctorData) {
              const newAvail = typeof dataToSend?.is_available !== 'undefined' ? dataToSend.is_available : obj.doctorData.is_available;
              const newPic = typeof dataToSend?.profile_pic !== 'undefined' && dataToSend.profile_pic
                ? dataToSend.profile_pic
                : obj.doctorData.profile_pic;
              obj.doctorData.is_available = newAvail;
              if (newPic) {
                obj.doctorData.profile_pic = newPic;
              }
              const cipher = CryptoJS.AES.encrypt(JSON.stringify(obj), SECRET_KEY).toString();
              localStorage.setItem(STORAGE_KEYS.DOCTOR, cipher);
              // Update in-memory doctor state so UI reflects immediately
              setdoctor((prev) => (prev ? { ...prev, is_available: newAvail, profile_pic: newPic || prev.profile_pic } : prev));
            }
          }
        }
      } catch (e) {}
    } catch (error) {
      // console.error("Error updating profile:", error);
      Swal.fire({
        title: "Profile Not Update.",
        text: "Something went wrong. Please check details and try again.",
        icon: "error",
      });
    } finally {
      setloading(false);
    }
  }

  const isPdf = (url = "") => {
    if (!url || typeof url !== 'string') return false;
    // Check for PDF extension or Cloudinary raw upload path
    return url.toLowerCase().endsWith('.pdf') ||
      url.includes('/raw/upload/');
  };
  const passwordMismatch = profile?.password && confirmPassword && profile.password !== confirmPassword;

  const [newPassword, setnewpassword] = useState("");
  return (
    <>
      <NavBar logindata={doctor}/>
      <Container className="my-4">
        <Row className="align-items-start">
          <DoctorSidebar doctor={doctor}/>
          <Col xs={12} lg={9}>
            <div>
              <div className='appointments-card mb-3'>
                <div className='d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 border-bottom pb-3'>
                  <h4 className='mb-0'>Doctor Profile</h4>
                </div>
              </div>

              {profile !== null ? (
                <Form className='register_doctor'>
                  <Tabs
                    defaultActiveKey="home"
                    id="uncontrolled-tab-example"
                    className="mb-3 border-0 setting_tab gap-3"
                  >
                    <Tab eventKey="home" title="Personal">
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
                              value={profile?.mobile.replace(/\s+/g, '') || ""}
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
                        <Col md={6} lg={4}>
                          <Form.Label className="fw-semibold">
                            Available
                          </Form.Label>
                          <Form.Check
                            type="switch"
                            id="is_available"
                            name="is_available"
                            checked={profile?.is_available === 'available' || profile?.is_available === true}
                            disabled={IsDisable}
                            onChange={handleChange}
                            size="lg"
                            label={profile?.is_available === 'available' || profile?.is_available === true ? 'Yes' : 'No'}
                          />
                        </Col>
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
                        <Col xs={12}>
                          <Form.Label className="fw-semibold">
                            About me
                          </Form.Label>
                          <Form.Control
                            as="textarea"
                            placeholder="Enter about"
                            name="aboutme"
                            value={profile?.aboutme || ""}
                            disabled={IsDisable}
                            onChange={handleChange}
                            className="form-control"
                            rows={4}
                          />
                        </Col>

                      </Row>
                    </Tab>
                    <Tab eventKey="profile" title="Professional">
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
                    </Tab>
                    <Tab eventKey="contact" title="Hospital">
                      <Row className="g-4">
                        {profile?.hospitals?.length > 0 ? (
                          profile.hospitals.map((hospital, index) => (
                            <Col md={6} key={index}>
                              <Card className="h-100 border-0 shadow-sm">
                                <Card.Body>
                                  <div className="d-flex align-items-start">
                                    <div className="me-3 text-primary">
                                      <i className="fas fa-hospital-alt fa-2x"></i>
                                    </div>
                                    <div className="flex-grow-1">
                                      <div className="d-flex justify-content-between align-items-start">
                                        <h6 className="mb-1 fw-bold text-primary">
                                          {hospital.name}
                                        </h6>
                                        <div className="d-flex gap-1">
                                          <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            disabled={IsDisable}
                                            onClick={() => handleEditHospital(index)}
                                            title="Edit Hospital"
                                          >
                                            <FaRegPenToSquare />
                                          </Button>
                                          <Button
                                            variant="outline-danger"
                                            size="sm"
                                            disabled={IsDisable}
                                            onClick={() => handleRemoveHospital(index)}
                                            title="Remove Hospital"
                                          >
                                            <FaRegTrashCan />
                                          </Button>
                                        </div>
                                      </div>
                                      <div className="text-muted small">
                                        <div className="mb-1">
                                          <i className="fas fa-map-marker-alt me-1"></i>
                                          {hospital.address} , {hospital.city} , {hospital.state} , {hospital.country}, {hospital.pincode}.
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </Card.Body>
                              </Card>
                            </Col>

                          ))
                        ) : (
                          <Col xs={12} className="text-center py-4">
                            <i className="fas fa-hospital text-muted fa-3x mb-3"></i>
                            <p className="text-muted mb-0">
                              No hospital information available
                            </p>
                          </Col>
                        )}
                      </Row>
                      <div className="text-center mt-3">
                        <Button
                          variant="success"
                          size="sm"
                          onClick={handleAddHospital}
                          disabled={IsDisable}
                          className="d-flex align-items-center"
                        >
                          Add Hospital
                        </Button>
                      </div>
                    </Tab>
                    <Tab eventKey="identity" title="Identity">
                      <Row className="g-3">
                        <Col sm={12} md={4}>
                          <Form.Group>
                            <Form.Label className="fw-semibold">
                              Profile Picture
                            </Form.Label>
                            

                            {(profile?.profile_pic || profilePicPreview) && (
                              <div className="border rounded p-3 pb-2 bg-light">
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
                                        width: "150px",
                                        height: "150px",
                                        objectFit: "cover",
                                        border: "3px solid #fff",
                                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                                      }}
                                    />
                                  </div>

                                  {/* <div className="mt-3">
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
                                  </div> */}
                                </div>
                              </div>
                            )}
                            <div className="mt-2">
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
                            </div>
                          </Form.Group>
                        </Col>
                        <Col sm={12} md={4}>
                          <Form.Group>
                            <Form.Label className="fw-semibold">
                              Certificate Proof
                            </Form.Label>
                            {profile?.certificateproof?.length > 0 ? (
                              <div className="row g-3">
                                {profile.certificateproof.map((doc, index) => (
                                  <div key={index} className="col">
                                    <div className="border rounded p-3 bg-light">
                                      <div className="d-flex align-items-center justify-content-between mb-3">
                                        <div className="d-flex align-items-center">
                                          <i className="fas fa-file-alt text-primary me-2 fs-5"></i>
                                          <span className="fw-medium">
                                            Document {index + 1}
                                          </span>
                                        </div>
                                        <a
                                          href={doc}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="btn btn-sm btn-outline-primary"
                                        >
                                          <i className="fas fa-external-link-alt me-1"></i> Open
                                        </a>
                                      </div>

                                      <div className="text-center">
                                        {isPdf(doc) ? (
                                          <div style={{ width: '200px', height: '200px', margin: '0 auto' }}>
                                            <iframe
                                              src={`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(doc)}`}
                                              style={{ width: '200px', height: '200px' }}
                                              className="border-0"
                                              frameBorder="0"
                                              title={`Document ${index + 1}`}
                                            />
                                          </div>
                                        ) : (
                                          <div className="text-center">
                                            <img
                                              src={doc}
                                              alt={`Document ${index + 1}`}
                                              className="rounded border"
                                              style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                                            />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-muted p-3 border rounded bg-light">
                                No Certificate Proof documents uploaded
                              </div>
                            )}
                          </Form.Group>
                        </Col>
                        <Col sm={12} md={4}>
                          <Form.Group>
                            <Form.Label className="fw-semibold">
                              Identity Proof (Aadhar)
                            </Form.Label>
                            {profile?.identityproof?.length > 0 ? (
                              <div className="row g-3">
                                {profile.identityproof.map((doc, index) => (
                                  <div key={index}>
                                    <div className="border rounded p-3 bg-light">
                                      <div className="d-flex align-items-center justify-content-between mb-3">
                                        <div className="d-flex align-items-center">
                                          <i className="fas fa-file-alt text-primary me-2 fs-5"></i>
                                          <span className="fw-medium">
                                            Document {index + 1}
                                          </span>
                                        </div>
                                        <a
                                          href={doc}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="btn btn-sm btn-outline-primary"
                                        >
                                          <i className="fas fa-external-link-alt me-1"></i> Open
                                        </a>
                                      </div>

                                      <div className="text-center">
                                        {isPdf(doc) ? (
                                          <div style={{ width: '200px', height: '200px', margin: '0 auto' }}>
                                            <iframe
                                              src={`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(doc)}`}
                                              style={{ width: '200px', height: '200px' }}
                                              className="border-0"
                                              frameBorder="0"
                                              title={`Document ${index + 1}`}
                                            />
                                          </div>
                                        ) : (
                                          <div className="text-center">
                                            <img
                                              src={doc}
                                              alt={`Document ${index + 1}`}
                                              className="rounded border"
                                              style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                                            />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-muted p-3 border rounded bg-light">
                                No identity proof documents uploaded
                              </div>
                            )}
                          </Form.Group>
                        </Col>

                      </Row>
                    </Tab>
                    <Tab eventKey="password" title="Password">
                      <Row className="g-3">
                        <Col md={4}>
                          <Form.Group>
                            <Form.Label className="fw-semibold">
                              New Password
                            </Form.Label>
                            <div className="position-relative">
                              <Form.Control
                                type={showPassword ? 'text' : 'password'}
                                placeholder="***"
                                name="newpassword"
                                value={newPassword}
                                disabled={IsDisable}
                                onChange={handleChange}
                                className="form-control frm_input"
                              />
                              <button
                                type="button"
                                className="eye_btn position-absolute end-0 top-50 translate-middle-y"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={IsDisable}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                              >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                              </button>
                            </div>
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group>
                            <Form.Label className="fw-semibold">
                              Confirm Password
                            </Form.Label>
                            <div className="position-relative">
                              <Form.Control
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="***"
                                name="confirmPassword"
                                value={confirmPassword}
                                disabled={IsDisable}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="form-control frm_input"
                              />
                              <button
                                type="button"
                                className="eye_btn position-absolute end-0 top-50 translate-middle-y"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                disabled={IsDisable}
                                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                              >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                              </button>
                            </div>
                            {passwordMismatch && (
                              <Form.Text className="text-danger">Passwords do not match</Form.Text>
                            )}
                          </Form.Group>
                        </Col>
                      </Row>
                    </Tab>
                  </Tabs>
                  
                  <hr/>
                  {/* Action Buttons */}
                  <Card className="border-0 shadow-sm">
                    <Card.Body className="text-center">
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
                            disabled={passwordMismatch}
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
                              setConfirmPassword("");
                              setShowPassword(false);
                              setShowConfirmPassword(false);
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

            </div>
          </Col>
        </Row>
      </Container>
      {loading && <Loader />}


      {/* Edit Hospital Modal */}
      <Modal show={showEditHospitalModal} onHide={closeEditModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Hospital Information</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Hospital Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={editHospital.name}
                    onChange={handleEditHospitalChange}
                    placeholder="Enter hospital name"
                    size="sm"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={editHospital.address}
                    onChange={handleEditHospitalChange}
                    placeholder="Enter hospital address"
                    size="sm"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Country</Form.Label>
                  <Form.Select
                    name="country"
                    value={selectedHospitalCountryCode}
                    onChange={handleHospitalCountryChange}
                    size="sm"
                  >
                    <option value="">Select Country</option>
                    {hospitalCountries.map((country) => (
                      <option key={country.isoCode} value={country.isoCode}>
                        {country.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">State</Form.Label>
                  <Form.Select
                    name="state"
                    value={selectedHospitalStateCode}
                    onChange={handleHospitalStateChange}
                    disabled={!selectedHospitalCountryCode}
                    size="sm"
                  >
                    <option value="">Select State</option>
                    {hospitalStates.map((state) => (
                      <option key={state.isoCode} value={state.isoCode}>
                        {state.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">City</Form.Label>
                  <Form.Select
                    name="city"
                    value={editHospital.city}
                    onChange={handleHospitalCityChange}
                    disabled={!selectedHospitalStateCode}
                    size="sm"
                  >
                    <option value="">Select City</option>
                    {hospitalCities.map((city) => (
                      <option key={city.name} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Pincode</Form.Label>
                  <Form.Control
                    type="text"
                    name="pincode"
                    value={editHospital.pincode}
                    onChange={handleEditHospitalChange}
                    placeholder="Enter pincode"
                    size="sm"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeEditModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={saveHospitalEdit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Hospital Modal */}
      <Modal show={showAddHospitalModal} onHide={closeAddModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Hospital</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Hospital Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={newHospital.name}
                    onChange={handleNewHospitalChange}
                    placeholder="Enter hospital name"
                    size="sm"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={newHospital.address}
                    onChange={handleNewHospitalChange}
                    placeholder="Enter hospital address"
                    size="sm"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Country</Form.Label>
                  <Form.Select
                    name="country"
                    value={selectedAddHospitalCountryCode}
                    onChange={handleAddHospitalCountryChange}
                    size="sm"
                  >
                    <option value="">Select Country</option>
                    {addHospitalCountries.map((country) => (
                      <option key={country.isoCode} value={country.isoCode}>
                        {country.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">State</Form.Label>
                  <Form.Select
                    name="state"
                    value={selectedAddHospitalStateCode}
                    onChange={handleAddHospitalStateChange}
                    disabled={!selectedAddHospitalCountryCode}
                    size="sm"
                  >
                    <option value="">Select State</option>
                    {addHospitalStates.map((state) => (
                      <option key={state.isoCode} value={state.isoCode}>
                        {state.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">City</Form.Label>
                  <Form.Select
                    name="city"
                    value={newHospital.city}
                    onChange={handleAddHospitalCityChange}
                    disabled={!selectedAddHospitalStateCode}
                    size="sm"
                  >
                    <option value="">Select City</option>
                    {addHospitalCities.map((city) => (
                      <option key={city.name} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Pincode</Form.Label>
                  <Form.Control
                    type="text"
                    name="pincode"
                    value={newHospital.pincode}
                    onChange={handleNewHospitalChange}
                    placeholder="Enter pincode"
                    size="sm"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeAddModal}>
            Cancel
          </Button>
          <Button variant="success" onClick={saveNewHospital}>
            Add Hospital
          </Button>
        </Modal.Footer>
      </Modal>
      <FooterBar />
    </>
  );
};

export default DoctorProfile;
