import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Col, Container, Row, Button, Form, Modal } from "react-bootstrap";
import "./css/doctor.css";
import { Link, useNavigate } from "react-router-dom";
import DoctorTestimonial from "./DoctorTestimonial";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import Loader from "../Loader";
import { Country, State, City } from "country-state-city";
import NavBar from "../Visitor/Component/NavBar";
import FooterBar from "../Visitor/Component/FooterBar";

const DoctorRegister = () => {
  var navigate = useNavigate();

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const [selectedStateCode, setSelectedStateCode] = useState("");

  const [showTcModal, setShowTcModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsContent, setTermsContent] = useState("");
  const [shortTerms, setShortTerms] = useState("");

  // Fetch all countries when component mounts
  useEffect(() => {
    setCountries(Country.getAllCountries());
    setHospitalCountries(Country.getAllCountries());

    // if doctor verify but not profile done
    docprofilenotdone();

    // get specialty & category
    getspeciality();
    getdoctorcategory();
    fetchTermsAndConditions();
  }, []);

  // Function to handle all initial data
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
    setdocprofile((frmdocprofile) => ({
      ...frmdocprofile,
      [name]: sel_contry[0].name,
    }));

    const filteredStates = State.getStatesOfCountry(countryCode);
    setStates(filteredStates);
    setCities([]);
    setSelectedStateCode("");

    // Clear validation error for country
    if (profileValidationErrors.country) {
      setProfileValidationErrors((prev) => ({
        ...prev,
        country: "",
      }));
    }
  };

  // When user selects a state
  const handleStateChange = (e) => {
    const stateCode = e.target.value;
    setSelectedStateCode(stateCode);
    const { name, value } = e.target;
    var sel_state = states.filter((v, i) => {
      return value === v.isoCode;
    });
    setdocprofile((frmdocprofile) => ({
      ...frmdocprofile,
      [name]: sel_state[0].name,
    }));

    const filteredCities = City.getCitiesOfState(
      selectedCountryCode,
      stateCode
    );
    setCities(filteredCities);

    // Clear validation error for state
    if (profileValidationErrors.state) {
      setProfileValidationErrors((prev) => ({
        ...prev,
        state: "",
      }));
    }
  };

  const [loading, setloading] = useState(false);

  const [doc_reg, setdocreg] = useState(true);
  const [doc_otp, setdocotp] = useState(false);
  const [doc_reg2, setdocreg2] = useState(false);

  var frmdata = {
    name: "",
    email: "",
    gender: "",
    mobile: "",
    pincode: "",
    password: "",
  };

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState({
    name: "",
    email: "",
    mobile: "",
    pincode: "",
    gender: "",
  });

  // Profile validation errors state
  const [profileValidationErrors, setProfileValidationErrors] = useState({
    specialty: "",
    sub_specialty: "",
    degree_registration_no: "",
    qualification: "",
    experience: "",
    country: "",
    state: "",
    city: "",
  });

  // Validation functions
  const validateName = (name) => {
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!name.trim()) {
      return "Name is required";
    }
    if (!nameRegex.test(name)) {
      return "Name should contain only letters and spaces";
    }
    return "";
  };

  const validateMobile = (mobile) => {
    const mobileRegex = /^[0-9]+$/;
    if (!mobile.trim()) {
      return "Mobile number is required";
    }
    if (!mobileRegex.test(mobile)) {
      return "Mobile number should contain only numeric digits";
    }
    if (mobile.length !== 10) {
      return "Mobile number should be exactly 10 digits";
    }
    return "";
  };

  const validatePincode = (pincode) => {
    const pincodeRegex = /^[0-9]{6}$/;
    if (!pincode.trim()) {
      return "Pincode is required";
    }
    if (!pincodeRegex.test(pincode)) {
      return "Pincode should be exactly 6 numeric digits";
    }
    return "";
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      return "Email is required";
    }
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validateGender = (gender) => {
    if (!gender) {
      return "Please select a gender";
    }
    return "";
  };

  const validateQualification = (qualification) => {
    const qualificationRegex = /^[A-Za-z\s.,]+$/;
    if (!qualification.trim()) {
      return "Qualification is required";
    }
    if (!qualificationRegex.test(qualification)) {
      return "Qualification should contain only letters, spaces, commas and periods";
    }
    return "";
  };

  const validateSpecialty = (specialty) => {
    if (!specialty || !specialty.trim()) {
      return "Specialty is required";
    }
    return "";
  };

  const validateSubSpecialty = (sub_specialty) => {
    if (!sub_specialty || !sub_specialty.trim()) {
      return "Sub specialty is required";
    }
    return "";
  };

  const validateDegreeRegistrationNo = (degree_registration_no) => {
    if (!degree_registration_no || !degree_registration_no.trim()) {
      return "Degree registration number is required";
    }
    return "";
  };

  const validateExperience = (experience) => {
    if (!experience || !experience.trim()) {
      return "Experience is required";
    }
    return "";
  };

  const validateCountry = (country) => {
    if (!country || !country.trim()) {
      return "Country is required";
    }
    return "";
  };

  const validateState = (state) => {
    if (!state || !state.trim()) {
      return "State is required";
    }
    return "";
  };

  const validateCity = (city) => {
    if (!city || !city.trim()) {
      return "City is required";
    }
    return "";
  };

  const validateForm = () => {
    const errors = {
      name: validateName(frmdoctor.name),
      email: validateEmail(frmdoctor.email),
      mobile: validateMobile(frmdoctor.mobile),
      pincode: validatePincode(frmdoctor.pincode),
      gender: validateGender(frmdoctor.gender),
    };

    setValidationErrors(errors);

    // Check if there are any errors
    return !Object.values(errors).some((error) => error !== "");
  };

  const validateProfileForm = () => {
    const errors = {
      specialty: validateSpecialty(frmdocprofile.specialty),
      sub_specialty: validateSubSpecialty(frmdocprofile.sub_specialty),
      degree_registration_no: validateDegreeRegistrationNo(
        frmdocprofile.degree_registration_no
      ),
      qualification: validateQualification(frmdocprofile.qualification),
      experience: validateExperience(frmdocprofile.experience),
      // hospital_name: validateHospitalName(frmdocprofile.hospital_name),
      // hospital_address: validateHospitalAddress(frmdocprofile.hospital_address),
      country: validateCountry(frmdocprofile.country),
      state: validateState(frmdocprofile.state),
      city: validateCity(frmdocprofile.city),
    };

    setProfileValidationErrors(errors);

    // Check if there are any errors
    return !Object.values(errors).some((error) => error !== "");
  };

  var profile_data = {
    specialty: "",
    sub_specialty: "",
    degree_registration_no: "",
    qualification: "",
    experience: "",
    hospitals: [],
    country: "",
    state: "",
    city: "",
    identityproof: [],
    certificateproof: [],
    profile_pic: "",
  };
  const [frmdoctor, setfrmdoctor] = useState(frmdata);
  const [frmdocprofile, setdocprofile] = useState(profile_data);

  const [profilePic, setProfilePic] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [identityProofs, setIdentityProofs] = useState([]);
  const [identityProofFiles, setIdentityProofFiles] = useState([]);
  const [certificateProofs, setCertificateProofs] = useState([]);
  const [certificateProofFiles, setCertificateProofFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // Handle file selection (store files in state without uploading)
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      setProfilePic(URL.createObjectURL(file));
    }
  };

  const handleIdentityProofsChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setIdentityProofFiles((prev) => [...prev, ...files]);
      // Create previews
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setIdentityProofs((prev) => [...prev, e.target.result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleCertificateProofsChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setCertificateProofFiles((prev) => [...prev, ...files]);
      // Create previews
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setCertificateProofs((prev) => [...prev, e.target.result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Upload files and return URLs
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(
      "https://healtheasy-o25g.onrender.com/user/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data.Status === 200 && response.data.Data) {
      return response.data.Data.url;
    }
    return null;
  };

  // Upload multiple files
  const uploadMultipleFiles = async (files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await axios.post(
      "https://healtheasy-o25g.onrender.com/user/upload/multiple",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data.Status === 200 && response.data.Data) {
      return response.data.Data.map((item) => item.path);
    }
    return [];
  };

  // Handle form submission
  const profileadd = async () => {
    // First validate if terms are accepted
    if (!termsAccepted) {
      toast("Please accept the Terms and Conditions to continue", {
        className: "custom-toast-error",
      });
      return;
    }

    // Then validate the form fields
    if (!validateProfileForm()) {
      toast("Please fix the validation errors before proceeding", {
        className: "custom-toast-error",
      });
      return;
    }

    setloading(true);

    try {
      // 1. Upload profile picture if selected
      let profilePicUrl = frmdocprofile.profile_pic || "";
      if (profilePicFile) {
        const uploadedUrl = await uploadFile(profilePicFile);
        if (uploadedUrl) {
          profilePicUrl = uploadedUrl;
        }
      }

      // 2. Upload identity proofs
      let identityUrls = [];
      if (identityProofFiles.length > 0) {
        const uploadedUrls = await uploadMultipleFiles(identityProofFiles);
        identityUrls = uploadedUrls;
      }

      // 3. Upload certificate proofs
      let certificateUrls = [];
      if (certificateProofFiles.length > 0) {
        const uploadedUrls = await uploadMultipleFiles(certificateProofFiles);
        certificateUrls = uploadedUrls;
      }

      // Prepare the final data
      const data = {
        ...frmdocprofile,
        profile_pic: profilePicUrl,
        identityproof: [
          ...(Array.isArray(frmdocprofile.identityproof)
            ? frmdocprofile.identityproof
            : []),
          ...identityUrls,
        ],
        certificateproof: [
          ...(Array.isArray(frmdocprofile.certificateproof)
            ? frmdocprofile.certificateproof
            : []),
          ...certificateUrls,
        ],
        hospitals: hospitallist,
      };

      // Submit the form
      const doctordata = JSON.parse(localStorage.getItem("doctordetail"));
      const token = doctordata?.data?.Data?.accessToken;

      const response = await axios.post(
        "https://healtheasy-o25g.onrender.com/doctor/profile/savebasicdetails",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.Status === 200) {
        toast.success("Profile created successfully!");
        navigate("/doctor");
        localStorage.removeItem("doctordetail");
      } else {
        throw new Error(response.data.Message || "Failed to update profile");
      }
    } catch (error) {
      // console.error("Error:", error);
      toast.error(
        error.response?.data?.Message ||
        error.message ||
        "An error occurred while saving the profile"
      );
    } finally {
      setloading(false);
    }
  };

  const selfrmdata = (e) => {
    const { name, value } = e.target;

    if (doc_reg) {
      setfrmdoctor((frmdoctor) => ({
        ...frmdoctor,
        [name]: value,
      }));

      // Clear validation error for this field when user starts typing
      if (validationErrors[name]) {
        setValidationErrors((prev) => ({
          ...prev,
          [name]: "",
        }));
      }
    } else {
      setdocprofile((frmdocprofile) => ({
        ...frmdocprofile,
        [name]: value,
      }));

      // Clear profile validation error for this field when user starts typing
      if (profileValidationErrors[name]) {
        setProfileValidationErrors((prev) => ({
          ...prev,
          [name]: "",
        }));
      }
    }
  };

  function send_doctor_otp() {
    // Validate form before sending OTP
    if (!validateForm()) {
      toast("Please fix the validation errors before proceeding", {
        className: "custom-toast-error",
      });
      return;
    }

    // console.log(frmdoctor)
    setloading(true);
    axios({
      method: "post",
      url: "https://healtheasy-o25g.onrender.com/doctor/signup",
      data: frmdoctor,
    })
      .then((res) => {
        toast("OTP send to your Email...", {
          className: "custom-toast-success",
        });
        setdocreg(false);
        setdocotp(true);
      })
      .catch(function (error) {
        // console.log(error.response.data);
        toast(error.response.data.Message, { className: "custom-toast-error" });
      })
      .finally(() => {
        setloading(false);
      });
  }

  const [otp, setotp] = useState("");
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

  function otpverifydone() {
    // console.log(frmdoctor);
    setloading(true);
    axios({
      method: "post",
      url: "https://healtheasy-o25g.onrender.com/doctor/signup/otpverification",
      data: {
        email: frmdoctor.email,
        otp: otp,
      },
    })
      .then((res) => {
        toast("OTP verify successfully...", {
          className: "custom-toast-success",
        });
        setdocotp(false);
        setdocreg2(true);
        // console.log(res);
        localStorage.setItem("doctordetail", JSON.stringify(res));
        // Navigate('/doctor')
      })
      .catch(function (error) {
        // console.log(error);
        toast(error, { className: "custom-toast-error" });
      })
      .finally(() => {
        setloading(false);
      });
  }

  const docprofilenotdone = () => {
    var docregdata = JSON.parse(localStorage.getItem("doctordetail"));
    if (docregdata) {
      setdocreg2(true);
      setdocreg(false);
    }
  };

  // get specialty and category
  const [s_type, setstype] = useState(null);
  // get all speciality
  const getspeciality = () => {
    setloading(true);
    axios({
      method: "post",
      url: "https://healtheasy-o25g.onrender.com/doctor/surgerytypes/list",
      data: {
        search: "",
      },
    })
      .then((res) => {
        // console.log('speciality = ',res.data.Data)
        setstype(res.data.Data);
      })
      .catch(function (error) {
        // console.log(error);
        toast(error.response.data.Message, { className: "custom-toast-error" });
      })
      .finally(() => {
        setloading(false);
      });
  };

  const [d_category, setdcategory] = useState(null);
  // get all doctor category
  const getdoctorcategory = () => {
    setloading(true);
    axios({
      method: "post",
      url: "https://healtheasy-o25g.onrender.com/doctor/doctorcategories/list",
      data: {
        search: "",
      },
    })
      .then((res) => {
        // console.log('d_category = ',res.data.Data)
        setdcategory(res.data.Data);
      })
      .catch(function (error) {
        // console.log(error);
        // toast(error.response.data.Message, { className: 'custom-toast-error' })
      })
      .finally(() => {
        setloading(false);
      });
  };

  const [d_sel_cat, setdselcat] = useState([]);
  const [s_type_name, setsname] = useState("");
  const [sub_type_name, setsubname] = useState("");
  const schange = (e) => {
    var s_name = s_type.filter((v) => {
      return v._id === e.target.value;
    });
    setdocprofile({ ...frmdocprofile, specialty: s_name[0].surgerytypename });
    // var data = {...frmdocprofile};
    // data.specialty = s_name[0].surgerytypename;
    // setdocprofile(data)
    setsname(e.target.value);
    var d_data = d_category.filter((v, i) => {
      return v.surgerytypeid?._id === e.target.value;
    });
    setdselcat(d_data);
    // console.log(e.target.value, d_data, frmdocprofile);

    // Clear validation error for specialty
    if (profileValidationErrors.specialty) {
      setProfileValidationErrors((prev) => ({
        ...prev,
        specialty: "",
      }));
    }
  };

  const subchange = (e) => {
    var sub_name = d_sel_cat.filter((v) => {
      return v._id === e.target.value;
    });
    setsubname(e.target.value);
    // console.log(sub_name[0].categoryname)
    setdocprofile({
      ...frmdocprofile,
      sub_specialty: sub_name[0].categoryname,
    });

    // Clear validation error for sub_specialty
    if (profileValidationErrors.sub_specialty) {
      setProfileValidationErrors((prev) => ({
        ...prev,
        sub_specialty: "",
      }));
    }
  };

  // add multiple hospital in profile form
  const hospital_obj = { name: "", address: "", city: "", state: "", country: "", pincode: "" };
  const [hospital_st, sethospital] = useState(hospital_obj);
  const [hospitallist, sethospitallist] = useState([]);

  // Hospital location state management
  const [hospitalCountries, setHospitalCountries] = useState([]);
  const [hospitalStates, setHospitalStates] = useState([]);
  const [hospitalCities, setHospitalCities] = useState([]);
  const [selectedHospitalCountryCode, setSelectedHospitalCountryCode] = useState("");
  const [selectedHospitalStateCode, setSelectedHospitalStateCode] = useState("");

  // Handle input change
  const handlehospitalChange = (e) => {
    const { name, value } = e.target;
    sethospital({
      ...hospital_st,
      [name]: value,
    });
  };

  // Handle hospital country change
  const handleHospitalCountryChange = (e) => {
    const countryCode = e.target.value;
    setSelectedHospitalCountryCode(countryCode);

    if (countryCode) {
      const sel_country = hospitalCountries.find(country => country.isoCode === countryCode);
      const filteredStates = State.getStatesOfCountry(countryCode);

      setHospitalStates(filteredStates);
      setHospitalCities([]);
      setSelectedHospitalStateCode("");

      sethospital({
        ...hospital_st,
        country: sel_country.name,
        state: "",
        city: ""
      });
    } else {
      setHospitalStates([]);
      setHospitalCities([]);
      setSelectedHospitalStateCode("");
      sethospital({
        ...hospital_st,
        country: "",
        state: "",
        city: ""
      });
    }
  };

  // Handle hospital state change
  const handleHospitalStateChange = (e) => {
    const stateCode = e.target.value;
    setSelectedHospitalStateCode(stateCode);

    if (stateCode) {
      const sel_state = hospitalStates.find(state => state.isoCode === stateCode);
      const filteredCities = City.getCitiesOfState(selectedHospitalCountryCode, stateCode);

      setHospitalCities(filteredCities);

      sethospital({
        ...hospital_st,
        state: sel_state.name,
        city: ""
      });
    } else {
      setHospitalCities([]);
      sethospital({
        ...hospital_st,
        state: "",
        city: ""
      });
    }
  };

  // Handle hospital city change
  const handleHospitalCityChange = (e) => {
    const { name, value } = e.target;
    sethospital({
      ...hospital_st,
      [name]: value,
    });
  };

  // Add hospital to list
  const addHospital = () => {
    if (hospital_st.name.trim() && hospital_st.address.trim() && hospital_st.country.trim() && hospital_st.state.trim() && hospital_st.city.trim() && hospital_st.pincode.trim()) {
      sethospitallist([...hospitallist, hospital_st]);
      sethospital(hospital_obj); // reset input fields
      // Reset dropdown selections
      setSelectedHospitalCountryCode("");
      setSelectedHospitalStateCode("");
      setHospitalStates([]);
      setHospitalCities([]);
    } else {
      alert("Please fill all hospital details: name, address, country, state, city, and pincode");
    }
  };

  // Delete a hospital (optional)
  const deleteHospital = (index) => {
    const newList = hospitallist.filter((_, i) => i !== index);
    sethospitallist(newList);
  };

  const fetchTermsAndConditions = async () => {
    try {
      const response = await axios.get(
        "https://healtheasy-o25g.onrender.com/doctor/gettc"
      );
      const fullText =
        response.data.Data.doctor_tc || "No terms and conditions available.";
      setTermsContent(fullText);
      // Get first 150 characters for preview
      setShortTerms(
        fullText.length > 150 ? `${fullText.substring(0, 150)}...` : fullText
      );
    } catch (error) {
      // console.error("Error fetching terms and conditions:", error);
      setTermsContent("Failed to load terms and conditions.");
      setShortTerms("Failed to load terms and conditions.");
    }
  };

  const handleDoctorRegister = (e) => {
    e.preventDefault();

    if (!termsAccepted) {
      toast("Please accept the terms and conditions to continue", {
        className: "custom-toast-error",
      });
      return;
    }

    // Your existing registration logic here
    setloading(true);
    // ... rest of your registration code
  };

  const TermsAndConditionsModal = () => (
    <Modal show={showTcModal} onHide={() => setShowTcModal(false)} size="lg">
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
        }}>{termsContent}</div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowTcModal(false)}>
          Close
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            setTermsAccepted(true);
            setShowTcModal(false);
          }}
        >
          I Accept
        </Button>
      </Modal.Footer>
    </Modal>
  );

  return (
    <>
    <NavBar />
    <div className="min-vh-100 d-flex align-items-center panel">
      <Container className="py-3">
        <Row className="align-items-center justify-content-center">
          <DoctorTestimonial />
          {doc_reg === true ? (
            <Col md={8} lg={5}>
              <div className="register_doctor bg-white p-3 py-3 px-4 rounded">
                <div className="text-center">
                  <h3>Doctor - Sign up</h3>
                  <p className="w-75 mx-auto">
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry
                  </p>
                </div>
                <Form autoComplete="off">
                  <Form.Group as={Col} controlId="fullname" className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Full Name"
                      className={`frm_input ${validationErrors.name ? "is-invalid" : ""
                        }`}
                      name="name"
                      value={frmdoctor.name}
                      onChange={selfrmdata}
                    />
                    {validationErrors.name && (
                      <div className="invalid-feedback">
                        {validationErrors.name}
                      </div>
                    )}
                  </Form.Group>

                  <Form.Group as={Col} controlId="email" className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Email"
                      autoComplete="off"
                      className={`frm_input ${validationErrors.email ? "is-invalid" : ""
                        }`}
                      name="email"
                      value={frmdoctor.email}
                      onChange={selfrmdata}
                    />
                    {validationErrors.email && (
                      <div className="invalid-feedback">
                        {validationErrors.email}
                      </div>
                    )}
                  </Form.Group>

                  <Form.Group controlId="mobile" className="mb-3">
                    <Form.Label>Mobile No.</Form.Label>
                    <Form.Control
                      placeholder="Mobile No."
                      className={`frm_input ${validationErrors.mobile ? "is-invalid" : ""
                        }`}
                      name="mobile"
                      value={frmdoctor.mobile}
                      onChange={selfrmdata}
                      maxLength="10"
                    />
                    {validationErrors.mobile && (
                      <div className="invalid-feedback">
                        {validationErrors.mobile}
                      </div>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Gender </Form.Label>
                    <div className="d-flex gap-3">
                      <label>
                        <Form.Check
                          type="radio"
                          name="gender"
                          value={"Male"}
                          className="d-inline-block me-2"
                          onChange={selfrmdata}
                          checked={frmdoctor.gender === "Male"}
                        />{" "}
                        Male
                      </label>
                      <label>
                        <Form.Check
                          type="radio"
                          name="gender"
                          value={"Female"}
                          className="d-inline-block me-2"
                          onChange={selfrmdata}
                          checked={frmdoctor.gender === "Female"}
                        />{" "}
                        Female
                      </label>
                      <label>
                        <Form.Check
                          type="radio"
                          name="gender"
                          value={"Other"}
                          className="d-inline-block me-2"
                          onChange={selfrmdata}
                          checked={frmdoctor.gender === "Other"}
                        />{" "}
                        Other
                      </label>
                    </div>
                    {validationErrors.gender && (
                      <div className="text-danger small mt-1">
                        {validationErrors.gender}
                      </div>
                    )}
                  </Form.Group>

                  <Form.Group controlId="pincode" className="mb-3">
                    <Form.Label>Pincode</Form.Label>
                    <Form.Control
                      placeholder="Pincode"
                      className={`frm_input ${validationErrors.pincode ? "is-invalid" : ""
                        }`}
                      name="pincode"
                      value={frmdoctor.pincode}
                      onChange={selfrmdata}
                      maxLength="6"
                    />
                    {validationErrors.pincode && (
                      <div className="invalid-feedback">
                        {validationErrors.pincode}
                      </div>
                    )}
                  </Form.Group>

                  <Form.Group controlId="password" className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Password"
                      autoComplete="off"
                      className="frm_input"
                      name="password"
                      value={frmdoctor.password}
                      onChange={selfrmdata}
                    />
                  </Form.Group>

                  <Button
                    type="button"
                    onClick={send_doctor_otp}
                    className="d-block w-100 theme_btn mt-3"
                  >
                    Get OTP
                  </Button>
                </Form>
                <div className="form_bottom_div text-center mt-3">
                  <p>
                    Already have an Account?{" "}
                    <Link to={"/doctor"} className="form-link">
                      Login
                    </Link>{" "}
                  </p>
                </div>
              </div>
            </Col>
          ) : (
            ""
          )}
          {doc_otp === true ? (
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
          ) : (
            ""
          )}
          {doc_reg2 === true ? (
            <Col md={8} lg={5}>
              <div className="register_doctor bg-white p-3 py-3 px-4 rounded">
                <div className="text-center">
                  <h3>Doctor Profile Details</h3>
                  <p className="w-75 mx-auto">
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry
                  </p>
                </div>
                <Form as={Row}>
                  <Form.Group
                    as={Col}
                    controlId="Speciality"
                    className="mb-3 col-6"
                  >
                    <div className="position-relative">
                      <Form.Label>Speciality</Form.Label>
                      <Form.Select
                        name="specialty"
                        value={s_type_name}
                        onChange={schange}
                        className={`${profileValidationErrors.specialty ? "is-invalid" : ""
                          }`}
                      >
                        {/* <Form.Control type="text" placeholder="Ex:- Cardiology" className='frm_input' name="specialty" value={frmdocprofile.specialty} onChange={selfrmdata} /> */}
                        <option value={""}>Select Surgery Type</option>
                        {s_type?.map((v, i) => {
                          return (
                            <option key={i} value={v._id}>
                              {v.surgerytypename}
                            </option>
                          );
                        })}
                      </Form.Select>
                      {profileValidationErrors.specialty && (
                        <div className="invalid-feedback">
                          {profileValidationErrors.specialty}
                        </div>
                      )}
                    </div>
                  </Form.Group>

                  <Form.Group
                    as={Col}
                    controlId="SubSpeciality"
                    className="mb-3 col-6"
                  >
                    <div className="position-relative">
                      <Form.Label>Sub Speciality</Form.Label>
                      {/* <Form.Control type="email" placeholder="Ex:- Echocardiography" className='frm_input' name="sub_specialty" value={frmdocprofile.sub_specialty} onChange={selfrmdata} /> */}
                      <Form.Select
                        name="sub_specialty"
                        value={sub_type_name}
                        onChange={subchange}
                        className={`${profileValidationErrors.sub_specialty
                            ? "is-invalid"
                            : ""
                          }`}
                      >
                        <option value="" disabled>
                          Doctor Category
                        </option>
                        {d_sel_cat?.map((v, i) => {
                          return (
                            <option key={i} value={v._id}>
                              {v.categoryname}
                            </option>
                          );
                        })}
                      </Form.Select>
                      {profileValidationErrors.sub_specialty && (
                        <div className="invalid-feedback">
                          {profileValidationErrors.sub_specialty}
                        </div>
                      )}
                    </div>
                  </Form.Group>

                  <Form.Group controlId="Degree" className="mb-3 col-6">
                    <div className="position-relative">
                      <Form.Label>Degree Registration No.</Form.Label>
                      <Form.Control
                        placeholder="Ex:- Dk4567"
                        className={`frm_input ${profileValidationErrors.degree_registration_no
                            ? "is-invalid"
                            : ""
                          }`}
                        name="degree_registration_no"
                        value={frmdocprofile.degree_registration_no}
                        onChange={selfrmdata}
                      />
                      {profileValidationErrors.degree_registration_no && (
                        <div className="invalid-feedback">
                          {profileValidationErrors.degree_registration_no}
                        </div>
                      )}
                    </div>
                  </Form.Group>

                  <Form.Group controlId="Qualification" className="mb-3 col-6">
                    <div className="position-relative">
                      <Form.Label>Qualification</Form.Label>
                      <Form.Control
                        placeholder="Ex:- D.H.M.S, MD"
                        className={`frm_input ${profileValidationErrors.qualification
                            ? "is-invalid"
                            : ""
                          }`}
                        name="qualification"
                        value={frmdocprofile.qualification}
                        onChange={selfrmdata}
                      />
                      {profileValidationErrors.qualification && (
                        <div className="invalid-feedback">
                          {profileValidationErrors.qualification}
                        </div>
                      )}
                    </div>
                  </Form.Group>

                  <Form.Group controlId="Experience" className="mb-3 col-6">
                    <div className="position-relative">
                      <Form.Label>Experience</Form.Label>
                      <Form.Select
                        className={`frm_input text-dark ${profileValidationErrors.experience ? "is-invalid" : ""
                          }`}
                        name="experience"
                        value={frmdocprofile.experience}
                        onChange={selfrmdata}
                      >
                        <option value={""} selected disabled>
                          Select Experiance
                        </option>
                        {["0+", "1+", "2+", "3+", "4+", "5+", "10+", "20+"].map(
                          (level) => (
                            <option key={level} value={level + " years"}>
                              {level} years
                            </option>
                          )
                        )}
                      </Form.Select>
                      {profileValidationErrors.experience && (
                        <div className="invalid-feedback">
                          {profileValidationErrors.experience}
                        </div>
                      )}
                    </div>
                  </Form.Group>

                  <Form.Group
                    as={Col}
                    controlId="Country"
                    className="mb-3 col-6"
                  >
                    <div className="position-relative">
                      <Form.Label>Country</Form.Label>
                      <Form.Select
                        className={`frm-select ${profileValidationErrors.country ? "is-invalid" : ""
                          }`}
                        name="country"
                        onChange={handleCountryChange}
                        value={selectedCountryCode}
                      >
                        <option value={""}>Select Country</option>
                        {countries.map((country) => (
                          <option key={country.isoCode} value={country.isoCode}>
                            {country.name}
                          </option>
                        ))}
                      </Form.Select>
                      {profileValidationErrors.country && (
                        <div className="invalid-feedback">
                          {profileValidationErrors.country}
                        </div>
                      )}
                    </div>
                  </Form.Group>

                  <Form.Group as={Col} controlId="State" className="mb-3 col-6">
                    <div className="position-relative">
                      <Form.Label>State</Form.Label>
                      <Form.Select
                        className={`frm-select ${profileValidationErrors.state ? "is-invalid" : ""
                          }`}
                        name="state"
                        onChange={handleStateChange}
                        value={selectedStateCode}
                        disabled={!selectedCountryCode}
                      >
                        <option value={""}>Select State</option>
                        {states.map((state) => (
                          <option key={state.isoCode} value={state.isoCode}>
                            {state.name}
                          </option>
                        ))}
                      </Form.Select>
                      {profileValidationErrors.state && (
                        <div className="invalid-feedback">
                          {profileValidationErrors.state}
                        </div>
                      )}
                    </div>
                  </Form.Group>

                  <Form.Group as={Col} controlId="City" className="mb-3 col-6">
                    <div className="position-relative">
                      <Form.Label>City</Form.Label>
                      <Form.Select
                        className={`frm-select ${profileValidationErrors.city ? "is-invalid" : ""
                          }`}
                        name="city"
                        onChange={selfrmdata}
                        disabled={!selectedStateCode}
                      >
                        <option value={""}>Select City</option>
                        {cities.map((vc, vi) => {
                          return (
                            <option key={vi} value={vc.name}>
                              {vc.name}
                            </option>
                          );
                        })}
                      </Form.Select>
                      {profileValidationErrors.city && (
                        <div className="invalid-feedback">
                          {profileValidationErrors.city}
                        </div>
                      )}
                    </div>
                  </Form.Group>

                  <Form.Group controlId="profilePic" className="mb-3 col-6">
                    <Form.Label>Upload Profile Picture</Form.Label>
                    <div className="position-relative">
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={handleProfilePicChange}
                        style={{ display: "none" }}
                        id="profile-pic-upload"
                      />
                      <label
                        htmlFor="profile-pic-upload"
                        className="btn btn-outline-secondary w-100"
                        style={{
                          cursor: "pointer",
                          padding: "0.375rem 0.75rem",
                        }}
                      >
                        {profilePic
                          ? "Change Profile Picture"
                          : "Choose Profile Picture"}
                      </label>
                    </div>
                    {profilePic && (
                      <div
                        style={{
                          position: "relative",
                          display: "inline-block",
                          marginTop: "10px",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: "-10px",
                            right: "-10px",
                            background: "#ff4444",
                            color: "white",
                            borderRadius: "50%",
                            width: "24px",
                            height: "24px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            border: "2px solid white",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                          }}
                          onClick={() => setProfilePic(null)}
                        >
                          ×
                        </div>
                        <img
                          src={profilePic}
                          alt="Profile Preview"
                          style={{
                            maxWidth: "200px",
                            maxHeight: "200px",
                            borderRadius: "4px",
                            border: "1px solid #ddd",
                            padding: "4px",
                          }}
                        />
                      </div>
                    )}
                  </Form.Group>

                  <Form.Group controlId="identityProof" className="mb-3 col-6">
                    <Form.Label>Upload Identity Document</Form.Label>
                    <div className="position-relative">
                      <input
                        type="file"
                        className="form-control"
                        multiple
                        accept="image/*,.pdf"
                        onChange={handleIdentityProofsChange}
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
                        {identityProofs.length > 0
                          ? `Change Identity Document (${identityProofs.length} files)`
                          : "Choose Identity Document"}
                      </label>
                    </div>
                    {identityProofs.length > 0 && (
                      <div className="mt-2">
                        {identityProofs.map((_, index) => (
                          <div key={index} className="d-flex align-items-center mb-1">
                            <span className="me-2">•</span>
                            <span>Identity Proof {index + 1}</span>
                            <button
                              type="button"
                              className="btn-close btn-sm ms-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIdentityProofs((prev) =>
                                  prev.filter((_, i) => i !== index)
                                );
                                setIdentityProofFiles((prev) =>
                                  prev.filter((_, i) => i !== index)
                                );
                              }}
                              aria-label="Remove"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </Form.Group>

                  <Form.Group
                    controlId="certificateProof"
                    className="mb-3 col-6"
                  >
                    <Form.Label>Upload Certificate Document</Form.Label>
                    <div className="position-relative">
                      <input
                        type="file"
                        className="form-control"
                        multiple
                        accept="image/*,.pdf"
                        onChange={handleCertificateProofsChange}
                        style={{ display: "none" }}
                        id="certificate-proof-upload"
                      />
                      <label
                        htmlFor="certificate-proof-upload"
                        className="btn btn-outline-secondary w-100"
                        style={{
                          cursor: "pointer",
                          padding: "0.375rem 0.75rem",
                        }}
                      >
                        {certificateProofs.length > 0
                          ? `Change Certificate Document (${certificateProofs.length} files)`
                          : "Choose Certificate Document"}
                      </label>
                    </div>
                    {certificateProofs.length > 0 && (
                      <div className="mt-2">
                        {certificateProofs.map((_, index) => (
                          <div key={index} className="d-flex align-items-center mb-1">
                            <span className="me-2">•</span>
                            <span>Certificate {index + 1}</span>
                            <button
                              type="button"
                              className="btn-close btn-sm ms-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCertificateProofs((prev) =>
                                  prev.filter((_, i) => i !== index)
                                );
                                setCertificateProofFiles((prev) =>
                                  prev.filter((_, i) => i !== index)
                                );
                              }}
                              aria-label="Remove"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="mb-2">Add Hospital Details</Form.Label>
                    <div className="border rounded p-2" style={{ backgroundColor: '#f8f9fa' }}>
                      <div className="row g-1 mb-2">
                        <div className="col-6">
                          <Form.Control
                            size="sm"
                            type="text"
                            name="name"
                            placeholder="Hospital Name"
                            value={hospital_st.name}
                            onChange={handlehospitalChange}
                          />
                        </div>
                        <div className="col-6">
                          <Form.Control
                            size="sm"
                            type="text"
                            name="address"
                            placeholder="Address"
                            value={hospital_st.address}
                            onChange={handlehospitalChange}
                          />
                        </div>
                      </div>
                      <div className="row g-1 mb-2">
                        <div className="col-4">
                          <Form.Select
                            size="sm"
                            name="country"
                            value={selectedHospitalCountryCode}
                            onChange={handleHospitalCountryChange}
                          >
                            <option value="">Country</option>
                            {hospitalCountries.map((country) => (
                              <option key={country.isoCode} value={country.isoCode}>
                                {country.name}
                              </option>
                            ))}
                          </Form.Select>
                        </div>
                        <div className="col-4">
                          <Form.Select
                            size="sm"
                            name="state"
                            value={selectedHospitalStateCode}
                            onChange={handleHospitalStateChange}
                            disabled={!selectedHospitalCountryCode}
                          >
                            <option value="">State</option>
                            {hospitalStates.map((state) => (
                              <option key={state.isoCode} value={state.isoCode}>
                                {state.name}
                              </option>
                            ))}
                          </Form.Select>
                        </div>
                        <div className="col-4">
                          <Form.Select
                            size="sm"
                            name="city"
                            value={hospital_st.city}
                            onChange={handleHospitalCityChange}
                            disabled={!selectedHospitalStateCode}
                          >
                            <option value="">City</option>
                            {hospitalCities.map((city, index) => (
                              <option key={index} value={city.name}>
                                {city.name}
                              </option>
                            ))}
                          </Form.Select>
                        </div>
                      </div>
                      <div className="row g-1">
                        <div className="col-4">
                          <Form.Control
                            size="sm"
                            type="text"
                            name="pincode"
                            placeholder="Pincode"
                            value={hospital_st.pincode}
                            onChange={handlehospitalChange}
                            maxLength="6"
                          />
                        </div>
                        <div className="col-8 d-flex align-items-end">
                          <Button
                            size="sm"
                            className="theme_btn ms-auto"
                            onClick={addHospital}
                            style={{ minWidth: '60px' }}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                    {hospitallist.length > 0 && (
                      <div className="mt-2">
                        {hospitallist.map((hospital, index) => (
                          <div key={index} className="d-flex justify-content-between align-items-center p-2 mb-1 bg-light rounded" style={{ fontSize: '0.85rem' }}>
                            <div className="flex-grow-1">
                              <strong className="d-block">{hospital.name}</strong>
                              <small className="text-muted">
                                {hospital.address}, {hospital.city}, {hospital.state}, {hospital.country} - {hospital.pincode}
                              </small>
                            </div>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => deleteHospital(index)}
                              className="ms-2"
                              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </Form.Group>
                  <Form.Group className="mb-3">
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
                  </Form.Group>
                  <Button
                    type="button"
                    onClick={profileadd}
                    className="d-block w-100 theme_btn my-3"
                  >
                    Submit Profile
                  </Button>
                </Form>
              </div>
            </Col>
          ) : (
            ""
          )}
        </Row>
      </Container>
      <ToastContainer />
      {loading ? <Loader /> : ""}
      <TermsAndConditionsModal />
    </div>
    <FooterBar />
    </>
  );
};

export default DoctorRegister;
