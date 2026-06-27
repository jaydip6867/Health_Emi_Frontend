import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CryptoJS from "crypto-js";
import { Container } from 'react-bootstrap';
import NavBar from './Component/NavBar';
import FooterBar from './Component/FooterBar';
import './MedicalLoanForm.css';
import { API_BASE_URL, SECRET_KEY, STORAGE_KEYS } from '../config';

const MedicalLoanForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showRestrictedModal, setShowRestrictedModal] = useState(false);
  const [restrictedMessage, setRestrictedMessage] = useState('');
  const [logdata, setlogdata] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [validationError, setValidationError] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    marital_status: '',
    dob: '',
    pan_no: '',
    aadhar_no: '',
    pincode: '',
    employment_type: '',
    monthly_income: '',
    hospital_name: '',
    nabh_status: '',
    patient_name: '',
    treatment_type: '',
    estimated_amount: '',
    itr_status: '',
    patient_age: '',
    alternate_no: '',
    // Files
    relationship_proof: null,
    hospital_quotation: null,
    prescription: null,
    insurance_card: null,
    aadhaar_card_img: null,
    pan_card_img: null,
    itr_file: null,
  });

  const stepsList = [
    { number: 1, title: 'Personal Details' },
    { number: 2, title: 'Employment & Income' },
    { number: 3, title: 'Patient & Treatment' },
    { number: 4, title: 'Document Uploads' },
    { number: 5, title: 'Review & Submit' }
  ];

  const getUserToken = () => {
    try {
      // 1. Check Patient Storage
      let localData = localStorage.getItem(STORAGE_KEYS.PATIENT) || localStorage.getItem('PatientLogin');
      if (localData) {
        try {
          const bytes = CryptoJS.AES.decrypt(localData, SECRET_KEY);
          const decrypted = bytes.toString(CryptoJS.enc.Utf8);
          if (decrypted) {
            const parsed = JSON.parse(decrypted);
            if (parsed.accessToken) return `Bearer ${parsed.accessToken}`;
            if (parsed.token) return `Bearer ${parsed.token}`;
          }
        } catch (err) {
          // Fallback if it was stored unencrypted
          try {
            const parsed = JSON.parse(localData);
            if (parsed.accessToken) return `Bearer ${parsed.accessToken}`;
            if (parsed.token) return `Bearer ${parsed.token}`;
          } catch (e2) {}
        }
      }

      return null;
    } catch (e) {
      console.error('getUserToken error:', e);
      return null;
    }
  };

  useEffect(() => {
    try {
      var pgetlocaldata = localStorage.getItem(STORAGE_KEYS.PATIENT) || localStorage.getItem('PatientLogin');
      var dgetlocaldata = localStorage.getItem(STORAGE_KEYS.DOCTOR) || localStorage.getItem('healthdoctor');
      if (pgetlocaldata != null) {
        const bytes = CryptoJS.AES.decrypt(pgetlocaldata, SECRET_KEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        if (decrypted) {
          var data = JSON.parse(decrypted);
          setlogdata(data.userData || data.patientData || data);
        }
      }
      else if (dgetlocaldata != null) {
        const bytes = CryptoJS.AES.decrypt(dgetlocaldata, SECRET_KEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        if (decrypted) {
          var data = JSON.parse(decrypted);
          setlogdata(data.doctorData || data);
        }
      }
    } catch(err) {
      console.error('Error decrypting login data in loan form:', err);
    }
  }, []);

  useEffect(() => {
    document.title = "Apply for Medical Loan | Health Easy EMI";
  }, []);

  useEffect(() => {
    // 1. Check if Patient is actively logged in first
    const token = getUserToken();
    if (token) {
      setShowRestrictedModal(false);
      return;
    }

    // 2. If not logged in as patient, check if they are logged in as Doctor or Ambulance
    const isDoctor = !!(localStorage.getItem(STORAGE_KEYS.DOCTOR) || localStorage.getItem('healthdoctor'));
    const isAmbulance = !!(localStorage.getItem(STORAGE_KEYS.AMBULANCE) || localStorage.getItem('healthambulance'));

    if (isDoctor || isAmbulance) {
      setRestrictedMessage("We appreciate your interest! However, the Medical Loan application is exclusively available for patient accounts. Please log in using a Patient account to apply.");
      setShowRestrictedModal(true);
      return;
    }

    // 3. Otherwise, they are completely logged out
    alert("Please login or create an account to apply for a medical loan.");
    navigate('/patient'); // Redirect to patient login
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let val = value;
    if (name === 'pan_no') {
      val = value.toUpperCase().replace(/\s/g, '');
    }
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  const validateStep = (step) => {
    // Official Indian PAN validation checks entity holder category (C,P,H,F,A,T,B,L,J,G)
    const panRegex = /^[A-Z]{3}[CPHFATBLJG]{1}[A-Z]{1}[0-9]{4}[A-Z]{1}$/;
    const aadharRegex = /^\d{12}$/;
    
    if (step === 1) {
      if (!formData.full_name.trim()) return "Applicant's Full Name is required";
      if (!formData.dob) return "Date of Birth is required";
      if (!formData.marital_status) return "Marital Status is required";
      if (!formData.pan_no.trim()) return "PAN Card Number is required";
      if (!panRegex.test(formData.pan_no.toUpperCase().replace(/\s/g, ''))) {
        return "Please enter a valid 10-character Indian PAN Card number (e.g. ABCDE1234F).";
      }
      if (!formData.aadhar_no.trim()) return "Aadhaar Card Number is required";
      if (!aadharRegex.test(formData.aadhar_no.replace(/\s/g, ''))) return "Please enter a valid 12-digit Aadhaar Card number";
      if (!formData.pincode.trim()) return "Pincode is required";
      if (!/^\d{6}$/.test(formData.pincode.replace(/\s/g, ''))) return "Please enter a valid 6-digit Pincode";
    }
    if (step === 2) {
      if (!formData.employment_type) return "Employment Type is required";
      if (!formData.monthly_income) return "Monthly Income is required";
      if (Number(formData.monthly_income) < 15000) return "Minimum monthly income must be ₹15,000";
      if (!formData.itr_status) return "ITR status selection is required";
    }
    if (step === 3) {
      if (!formData.patient_name.trim()) return "Patient's Full Name is required";
      if (!formData.patient_age) return "Patient's Age is required";
      if (Number(formData.patient_age) <= 0) return "Please enter a valid age";
      if (!formData.hospital_name.trim()) return "Hospital Name is required";
      if (!formData.nabh_status) return "NABH Accredited status selection is required";
      if (!formData.treatment_type) return "Treatment Type is required";
      if (!formData.estimated_amount) return "Estimated Amount is required";
      if (Number(formData.estimated_amount) <= 0) return "Please enter a valid estimated amount";
    }
    if (step === 4) {
      if (!formData.aadhaar_card_img) return "Aadhaar Card document upload is required";
      if (!formData.pan_card_img) return "PAN Card document upload is required";
      if (formData.itr_status === 'yes' && !formData.itr_file) return "ITR Document upload is required";
    }
    return null;
  };

  const handleNextStep = () => {
    const error = validateStep(currentStep);
    if (error) {
      setValidationError(error);
      const formEl = document.querySelector('.medical-loan-container');
      if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    setValidationError('');
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setValidationError('');
    setCurrentStep(prev => prev - 1);
  };

  const uploadFile = async (file) => {
    if (!file) return 'https://placehold.co/600x400/eeeeee/999999?text=Not+Available';
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE_URL}/user/upload`, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) throw new Error('Failed to upload file');
    const data = await response.json();
    if (data.Status === 200 && data.Data?.url) {
      return data.Data.url;
    }
    throw new Error(data.Message || 'Upload failed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Intercept Enter key or premature submission if not on the final step
    if (currentStep < 5) {
      handleNextStep();
      return;
    }

    // Double check that all steps are valid before starting the submission
    for (let stepNum = 1; stepNum <= 4; stepNum++) {
      const stepError = validateStep(stepNum);
      if (stepError) {
        setValidationError(`[Step ${stepNum}] ${stepError}`);
        setCurrentStep(stepNum);
        const formEl = document.querySelector('.medical-loan-container');
        if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    
    const token = getUserToken();
    if (!token) {
      alert("You must be logged in to submit an EMI application.");
      return;
    }

    setLoading(true);

    try {
      // 1. Upload all files
      const [
        relationshipUrl,
        hospitalQuotationUrl,
        prescriptionUrl,
        insuranceUrl,
        aadhaarUrl,
        panUrl,
        itrUrl
      ] = await Promise.all([
        uploadFile(formData.relationship_proof),
        uploadFile(formData.hospital_quotation),
        uploadFile(formData.prescription),
        uploadFile(formData.insurance_card),
        uploadFile(formData.aadhaar_card_img),
        uploadFile(formData.pan_card_img),
        formData.itr_status === 'yes' ? uploadFile(formData.itr_file) : Promise.resolve('N/A')
      ]);

      // 2. Submit payload
      const payload = {
        full_name: formData.full_name,
        marital_status: formData.marital_status,
        dob: formData.dob,
        pan_no: formData.pan_no.toUpperCase(),
        aadhar_no: formData.aadhar_no,
        pincode: formData.pincode,
        employment_type: formData.employment_type,
        monthly_income: formData.monthly_income,
        hospital_name: formData.hospital_name,
        nabh_status: formData.nabh_status,
        patient_name: formData.patient_name,
        treatment_type: formData.treatment_type,
        estimated_amount: formData.estimated_amount,
        itr_status: formData.itr_status,
        patient_age: formData.patient_age,
        alternate_no: formData.alternate_no,
        relationship_proof: relationshipUrl,
        hospital_quotation: hospitalQuotationUrl,
        medical_estimate: hospitalQuotationUrl,
        insurance: insuranceUrl || hospitalQuotationUrl,
        reports: hospitalQuotationUrl,
        prescription: prescriptionUrl,
        aadhaar_card: aadhaarUrl,
        pan_card: panUrl,
        itr_file: itrUrl
      };

      const response = await fetch(`${API_BASE_URL}/user/emidocuments/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.Status === 200) {
        alert("Application Submitted Successfully!");
        setFormData({
          full_name: '', marital_status: '', dob: '', pan_no: '', aadhar_no: '',
          pincode: '', employment_type: '', monthly_income: '', hospital_name: '',
          nabh_status: '', patient_name: '', treatment_type: '', estimated_amount: '',
          itr_status: '', patient_age: '', alternate_no: '',
          relationship_proof: null, hospital_quotation: null, prescription: null,
          insurance_card: null, aadhaar_card_img: null, pan_card_img: null, itr_file: null
        });
        setCurrentStep(1);
      } else {
        alert(data.Message || "Failed to submit application.");
      }

    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar logindata={logdata} />

      {/* breadcrumb section */}
      <section className='breadcrumb_Sec'>
        <Container className='text-center '>
          <h2>Apply for Medical Loan</h2>
        </Container>
      </section>

      <div className="medical-loan-page">
        {showRestrictedModal && (
          <div className="restriction-overlay">
            <div className="restriction-card">
              <div className="restriction-image-wrapper">
                <img src="/undraw_warnings_agxg.svg" alt="Access Restricted" className="restriction-svg" />
              </div>
              <h2 className="restriction-title">Access Denied</h2>
              <p className="restriction-msg">{restrictedMessage}</p>
              <button type="button" className="restriction-btn" onClick={() => navigate('/')}>
                Go to Home Page
              </button>
            </div>
          </div>
        )}

        <div className="medical-loan-container">
          {/* Stepper progress indicator */}
          <div className="loan-steps-indicator">
            <div 
              className="loan-progress-line" 
              style={{ width: `calc(90% * ${(currentStep - 1) / (stepsList.length - 1)})` }}
            />
            {stepsList.map((s) => (
              <div 
                key={s.number}
                className={`loan-step ${currentStep === s.number ? 'active' : ''} ${currentStep > s.number ? 'completed' : ''}`}
                onClick={() => {
                  if (s.number < currentStep) {
                    setValidationError('');
                    setCurrentStep(s.number);
                  }
                }}
                style={{ cursor: s.number < currentStep ? 'pointer' : 'default' }}
              >
                <div className="loan-step-number">
                  {currentStep > s.number ? '✓' : s.number}
                </div>
                <div className="loan-step-title">{s.title}</div>
              </div>
            ))}
          </div>

          {/* Validation error display */}
          {validationError && (
            <div className="validation-error-box">
              <span className="error-text">{validationError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="medical-loan-form">
            
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <section className="form-section">
                <h2>1. Personal Information</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Applicant's Full Name <span className="required-star">*</span></label>
                    <input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} required placeholder="Enter full name as in PAN card" />
                  </div>
                  <div className="form-group">
                    <label>Date of Birth <span className="required-star">*</span></label>
                    <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label>Marital Status <span className="required-star">*</span></label>
                    <div className="radio-group-container">
                      <label className="radio-label-item">
                        <input
                          type="radio"
                          name="marital_status"
                          value="married"
                          checked={formData.marital_status === 'married'}
                          onChange={handleInputChange}
                          required
                        />
                        <span>Married</span>
                      </label>
                      <label className="radio-label-item">
                        <input
                          type="radio"
                          name="marital_status"
                          value="unmarried"
                          checked={formData.marital_status === 'unmarried'}
                          onChange={handleInputChange}
                          required
                        />
                        <span>Unmarried</span>
                      </label>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>PAN Card Number <span className="required-star">*</span></label>
                    <input type="text" name="pan_no" value={formData.pan_no} onChange={handleInputChange} required placeholder="ABCDE1234F" style={{ textTransform: 'uppercase' }} maxLength="10" />
                  </div>
                  <div className="form-group">
                    <label>Aadhaar Card Number <span className="required-star">*</span></label>
                    <input type="text" name="aadhar_no" value={formData.aadhar_no} onChange={handleInputChange} required placeholder="12-digit Aadhaar Number" maxLength="12" />
                  </div>
                  <div className="form-group">
                    <label>Pincode <span className="required-star">*</span></label>
                    <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} required placeholder="6-digit Area Pincode" maxLength="6" />
                  </div>
                  <div className="form-group">
                    <label>Alternate Mobile Number</label>
                    <input type="text" name="alternate_no" value={formData.alternate_no} onChange={handleInputChange} placeholder="Optional contact number" maxLength="10" />
                  </div>
                </div>
              </section>
            )}

            {/* Step 2: Employment & Income */}
            {currentStep === 2 && (
              <section className="form-section">
                <h2>2. Employment & Income</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Employment Type <span className="required-star">*</span></label>
                    <select name="employment_type" value={formData.employment_type} onChange={handleInputChange} required>
                      <option value="">Select Type</option>
                      <option value="Salaried">Salaried</option>
                      <option value="Business">Business</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Monthly Income (₹) <span className="required-star">*</span></label>
                    <input type="number" name="monthly_income" value={formData.monthly_income} onChange={handleInputChange} required min="15000" placeholder="Minimum ₹15,000" />
                  </div>
                  <div className="form-group">
                    <label>ITR Filed? <span className="required-star">*</span></label>
                    <select name="itr_status" value={formData.itr_status} onChange={handleInputChange} required>
                      <option value="">Select Option</option>
                      <option value="yes">Yes, I have filed ITR</option>
                      <option value="no">No, I have not filed ITR</option>
                    </select>
                  </div>
                </div>
              </section>
            )}

            {/* Step 3: Patient & Treatment Details */}
            {currentStep === 3 && (
              <section className="form-section">
                <h2>3. Patient & Treatment Details</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Patient's Full Name <span className="required-star">*</span></label>
                    <input type="text" name="patient_name" value={formData.patient_name} onChange={handleInputChange} required placeholder="Enter patient name" />
                  </div>
                  <div className="form-group">
                    <label>Patient's Age <span className="required-star">*</span></label>
                    <input type="number" name="patient_age" value={formData.patient_age} onChange={handleInputChange} required placeholder="Enter age" min="1" max="120" />
                  </div>
                  <div className="form-group">
                    <label>Hospital Name <span className="required-star">*</span></label>
                    <input type="text" name="hospital_name" value={formData.hospital_name} onChange={handleInputChange} required placeholder="Name of hospital" />
                  </div>
                  <div className="form-group">
                    <label>NABH Accredited <span className="required-star">*</span></label>
                    <select name="nabh_status" value={formData.nabh_status} onChange={handleInputChange} required>
                      <option value="">Select Option</option>
                      <option value="yes">Yes</option>
                      <option value="no">No / Don't Know</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Treatment Type <span className="required-star">*</span></label>
                    <select name="treatment_type" value={formData.treatment_type} onChange={handleInputChange} required>
                      <option value="">Select Treatment</option>
                      <option value="Surgery">Surgery</option>
                      <option value="Medicine">Medicine</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Estimated Amount (₹) <span className="required-star">*</span></label>
                    <input type="number" name="estimated_amount" value={formData.estimated_amount} onChange={handleInputChange} required placeholder="Estimated treatment amount" />
                  </div>
                </div>
              </section>
            )}

            {/* Step 4: Document Uploads */}
            {currentStep === 4 && (
              <section className="form-section">
                <h2>4. Document Uploads (Images/PDFs)</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Aadhaar Card <span className="required-star">*</span></label>
                    <input type="file" name="aadhaar_card_img" onChange={handleFileChange} required />
                    {formData.aadhaar_card_img && <span className="selected-filename">Selected: {formData.aadhaar_card_img.name}</span>}
                  </div>
                  <div className="form-group">
                    <label>PAN Card <span className="required-star">*</span></label>
                    <input type="file" name="pan_card_img" onChange={handleFileChange} required />
                    {formData.pan_card_img && <span className="selected-filename">Selected: {formData.pan_card_img.name}</span>}
                  </div>
                  <div className="form-group">
                    <label>Relationship Proof (with patient)</label>
                    <input type="file" name="relationship_proof" onChange={handleFileChange} />
                    {formData.relationship_proof && <span className="selected-filename">Selected: {formData.relationship_proof.name}</span>}
                  </div>
                  <div className="form-group">
                    <label>Hospital Quotation / Estimate</label>
                    <input type="file" name="hospital_quotation" onChange={handleFileChange} />
                    {formData.hospital_quotation && <span className="selected-filename">Selected: {formData.hospital_quotation.name}</span>}
                  </div>
                  <div className="form-group">
                    <label>Medical Prescription</label>
                    <input type="file" name="prescription" onChange={handleFileChange} />
                    {formData.prescription && <span className="selected-filename">Selected: {formData.prescription.name}</span>}
                  </div>
                  <div className="form-group">
                    <label>Insurance Card</label>
                    <input type="file" name="insurance_card" onChange={handleFileChange} />
                    {formData.insurance_card && <span className="selected-filename">Selected: {formData.insurance_card.name}</span>}
                  </div>
                  {formData.itr_status === 'yes' && (
                    <div className="form-group">
                      <label>ITR Document <span className="required-star">*</span></label>
                      <input type="file" name="itr_file" onChange={handleFileChange} required />
                      {formData.itr_file && <span className="selected-filename">Selected: {formData.itr_file.name}</span>}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Step 5: Review & Submit */}
            {currentStep === 5 && (
              <section className="form-section">
                <h2>5. Review & Submit</h2>
                <p className="review-intro">Please check all entered details carefully before submitting your loan application.</p>
                
                <div className="review-container">
                  <div className="review-card-section">
                    <h3>Personal Information</h3>
                    <div className="review-grid-data">
                      <div><strong>Full Name:</strong> {formData.full_name}</div>
                      <div><strong>Date of Birth:</strong> {formData.dob}</div>
                      <div><strong>Marital Status:</strong> {formData.marital_status}</div>
                      <div><strong>PAN Number:</strong> {formData.pan_no.toUpperCase()}</div>
                      <div><strong>Aadhaar Number:</strong> {formData.aadhar_no}</div>
                      <div><strong>Pincode:</strong> {formData.pincode}</div>
                      {formData.alternate_no && <div><strong>Alternate Mobile:</strong> {formData.alternate_no}</div>}
                    </div>
                  </div>

                  <div className="review-card-section">
                    <h3>Employment & Income</h3>
                    <div className="review-grid-data">
                      <div><strong>Employment Type:</strong> {formData.employment_type}</div>
                      <div><strong>Monthly Income:</strong> ₹{Number(formData.monthly_income).toLocaleString('en-IN')}</div>
                      <div><strong>ITR Filed:</strong> {formData.itr_status === 'yes' ? 'Yes' : 'No'}</div>
                    </div>
                  </div>

                  <div className="review-card-section">
                    <h3>Patient & Treatment Details</h3>
                    <div className="review-grid-data">
                      <div><strong>Patient's Name:</strong> {formData.patient_name}</div>
                      <div><strong>Patient's Age:</strong> {formData.patient_age}</div>
                      <div><strong>Hospital Name:</strong> {formData.hospital_name}</div>
                      <div><strong>NABH Accredited:</strong> {formData.nabh_status === 'yes' ? 'Yes' : 'No'}</div>
                      <div><strong>Treatment Type:</strong> {formData.treatment_type}</div>
                      <div><strong>Estimated Amount:</strong> ₹{Number(formData.estimated_amount).toLocaleString('en-IN')}</div>
                    </div>
                  </div>

                  <div className="review-card-section">
                    <h3>Uploaded Documents</h3>
                    <div className="review-grid-data">
                      <div><strong>Aadhaar Card:</strong> {formData.aadhaar_card_img?.name}</div>
                      <div><strong>PAN Card:</strong> {formData.pan_card_img?.name}</div>
                      {formData.relationship_proof && <div><strong>Relationship Proof:</strong> {formData.relationship_proof.name}</div>}
                      {formData.hospital_quotation && <div><strong>Hospital Quotation:</strong> {formData.hospital_quotation.name}</div>}
                      {formData.prescription && <div><strong>Prescription:</strong> {formData.prescription.name}</div>}
                      {formData.insurance_card && <div><strong>Insurance Card:</strong> {formData.insurance_card.name}</div>}
                      {formData.itr_status === 'yes' && <div><strong>ITR Document:</strong> {formData.itr_file?.name}</div>}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Stepper Navigation Buttons */}
            <div className="step-navigation">
              {currentStep > 1 && (
                <button type="button" className="prev-btn" onClick={handlePrevStep} disabled={loading}>
                  Back
                </button>
              )}
              {currentStep < 5 ? (
                <button type="button" className="next-btn" onClick={handleNextStep}>
                  Next Step
                </button>
              ) : (
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <FooterBar />
    </>
  );
};

export default MedicalLoanForm;
