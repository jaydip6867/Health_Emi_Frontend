import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CryptoJS from "crypto-js";
import './MedicalLoanForm.css';
import { API_BASE_URL, SECRET_KEY, STORAGE_KEYS } from '../config';

const MedicalLoanForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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

  const getUserToken = () => {
    try {
      // 1. Check direct token (used by Chatbot inline login)
      let rawToken = localStorage.getItem('token');
      if (rawToken) return rawToken.startsWith('Bearer ') ? rawToken : `Bearer ${rawToken}`;

      // 2. Check Patient Storage
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
      
      // 3. Check Doctor Storage
      localData = localStorage.getItem(STORAGE_KEYS.DOCTOR) || localStorage.getItem('healthdoctor');
      if (localData) {
        try {
          const bytes = CryptoJS.AES.decrypt(localData, SECRET_KEY);
          const decrypted = bytes.toString(CryptoJS.enc.Utf8);
          if (decrypted) {
            const parsed = JSON.parse(decrypted);
            if (parsed.accessToken) return `Bearer ${parsed.accessToken}`;
            if (parsed.token) return `Bearer ${parsed.token}`;
          }
        } catch(err) {}
      }

      return null;
    } catch (e) {
      console.error('getUserToken error:', e);
      return null;
    }
  };

  useEffect(() => {
    const token = getUserToken();
    
    if (!token) {
      alert("Please login or create an account to apply for a medical loan.");
      navigate('/patient'); // Redirect to patient login
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  const uploadFile = async (file) => {
    if (!file) return 'https://placehold.co/600x400/eeeeee/999999?text=Not+Available'; // Optional skip placeholder
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
        pan_no: formData.pan_no,
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
    <div className="medical-loan-page">
      <div className="medical-loan-header">
        <h1>Apply for Medical Loan</h1>
        <p>Get instant approval and focus on what matters most — your health.</p>
      </div>
      
      <div className="medical-loan-container">
        <form onSubmit={handleSubmit} className="medical-loan-form">
          
          {/* Personal Information */}
          <section className="form-section">
            <h2>1. Personal Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Applicant's Full Name</label>
                <input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} required placeholder="Enter full name" />
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Marital Status</label>
                <select name="marital_status" value={formData.marital_status} onChange={handleInputChange} required>
                  <option value="">Select</option>
                  <option value="married">Married</option>
                  <option value="unmarried">Unmarried</option>
                </select>
              </div>
              <div className="form-group">
                <label>PAN Card Number</label>
                <input type="text" name="pan_no" value={formData.pan_no} onChange={handleInputChange} required placeholder="ABCDE1234F" />
              </div>
              <div className="form-group">
                <label>Aadhaar Card Number</label>
                <input type="text" name="aadhar_no" value={formData.aadhar_no} onChange={handleInputChange} required placeholder="1234 5678 9012" />
              </div>
              <div className="form-group">
                <label>Pincode</label>
                <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} required placeholder="400001" />
              </div>
              <div className="form-group">
                <label>Alternate Mobile Number</label>
                <input type="text" name="alternate_no" value={formData.alternate_no} onChange={handleInputChange} placeholder="Optional" />
              </div>
            </div>
          </section>

          {/* Employment & Income */}
          <section className="form-section">
            <h2>2. Employment & Income</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Employment Type</label>
                <select name="employment_type" value={formData.employment_type} onChange={handleInputChange} required>
                  <option value="">Select</option>
                  <option value="Salaried">Salaried</option>
                  <option value="Business">Business</option>
                </select>
              </div>
              <div className="form-group">
                <label>Monthly Income (₹)</label>
                <input type="number" name="monthly_income" value={formData.monthly_income} onChange={handleInputChange} required min="15000" placeholder="Min 15,000" />
              </div>
              <div className="form-group">
                <label>ITR Filed?</label>
                <select name="itr_status" value={formData.itr_status} onChange={handleInputChange} required>
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>
          </section>

          {/* Patient & Treatment Details */}
          <section className="form-section">
            <h2>3. Patient & Treatment Details</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Patient's Full Name</label>
                <input type="text" name="patient_name" value={formData.patient_name} onChange={handleInputChange} required placeholder="Enter patient's name" />
              </div>
              <div className="form-group">
                <label>Patient's Age</label>
                <input type="number" name="patient_age" value={formData.patient_age} onChange={handleInputChange} required placeholder="e.g. 45" />
              </div>
              <div className="form-group">
                <label>Hospital Name</label>
                <input type="text" name="hospital_name" value={formData.hospital_name} onChange={handleInputChange} required placeholder="Name of the hospital" />
              </div>
              <div className="form-group">
                <label>NABH Accredited</label>
                <select name="nabh_status" value={formData.nabh_status} onChange={handleInputChange} required>
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div className="form-group">
                <label>Treatment Type</label>
                <select name="treatment_type" value={formData.treatment_type} onChange={handleInputChange} required>
                  <option value="">Select</option>
                  <option value="Surgery">Surgery</option>
                  <option value="Medicine">Medicine</option>
                </select>
              </div>
              <div className="form-group">
                <label>Estimated Amount (₹)</label>
                <input type="number" name="estimated_amount" value={formData.estimated_amount} onChange={handleInputChange} required placeholder="e.g. 50000" />
              </div>
            </div>
          </section>

          {/* Document Uploads */}
          <section className="form-section">
            <h2>4. Document Uploads (Images/PDFs)</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Aadhaar Card (Required)</label>
                <input type="file" name="aadhaar_card_img" onChange={handleFileChange} required />
              </div>
              <div className="form-group">
                <label>PAN Card (Required)</label>
                <input type="file" name="pan_card_img" onChange={handleFileChange} required />
              </div>
              <div className="form-group">
                <label>Relationship Proof</label>
                <input type="file" name="relationship_proof" onChange={handleFileChange} />
              </div>
              <div className="form-group">
                <label>Hospital Quotation / Estimate</label>
                <input type="file" name="hospital_quotation" onChange={handleFileChange} />
              </div>
              <div className="form-group">
                <label>Medical Prescription</label>
                <input type="file" name="prescription" onChange={handleFileChange} />
              </div>
              <div className="form-group">
                <label>Insurance Card</label>
                <input type="file" name="insurance_card" onChange={handleFileChange} />
              </div>
              {formData.itr_status === 'yes' && (
                <div className="form-group">
                  <label>ITR Document</label>
                  <input type="file" name="itr_file" onChange={handleFileChange} required />
                </div>
              )}
            </div>
          </section>

          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MedicalLoanForm;
