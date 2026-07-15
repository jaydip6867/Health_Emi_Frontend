import React, { useEffect, useState } from 'react';
import CryptoJS from 'crypto-js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Col, Container, Form, Row, Tab, Tabs } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { FaRegTrashCan } from 'react-icons/fa6';
import { API_BASE_URL, SECRET_KEY, STORAGE_KEYS } from '../config';
import HospitalSidebar from './HospitalSidebar';
import Loader from '../Loader';
import '../doctor/css/doctor.css';
import '../Visitor/css/visitor.css';

const normalizeDownPayment = (value) => {
  if (value === true || value === 1 || value === '1') return 'Yes';
  if (value === false || value === 0 || value === '0') return 'No';
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (/^yes$/i.test(trimmed)) return 'Yes';
    if (/^no$/i.test(trimmed)) return 'No';
    return trimmed;
  }
  return '';
};

const TREATMENT_CHIP_COLORS = [
  { bg: '#E8F5E9', color: '#2E7D32' },
  { bg: '#FFF3E0', color: '#E65100' },
  { bg: '#E3F2FD', color: '#1565C0' },
  { bg: '#F5F5F5', color: '#424242' },
  { bg: '#F3E5F5', color: '#7B1FA2' },
  { bg: '#FCE4EC', color: '#C2185B' },
];

const FILE_FIELDS = [
  'logo',
  'hospitalregistrationcertificate',
  'gstcertificate',
  'pancopy',
  'nabhcertificate',
  'cancelledchequenupload',
  'authorizedsignatoryidproof',
];

const normalizeTreatment = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') return item.trim();
        if (item && typeof item === 'object') return item._id || item.id || '';
        return '';
      })
      .filter(Boolean);
  }
  if (typeof value === 'string' && value.trim()) {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }
  return [];
};

const normalizeInterestType = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean);
  }
  if (typeof value === 'string' && value.trim()) {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }
  return [];
};

const HospitalProfile = () => {
  const navigate = useNavigate();
  const [hospital, sethospital] = useState(null);
  const [token, settoken] = useState(null);
  const [profile, setprofile] = useState(null);
  const [loading, setloading] = useState(false);
  const [IsDisable, setdisabled] = useState(true);
  const [surgerytypes, setsurgerytypes] = useState([]);
  const [selectedSurgeryType, setSelectedSurgeryType] = useState('');
  const [pendingFiles, setPendingFiles] = useState({});
  const [filePreviews, setFilePreviews] = useState({});
  const [originalFileUrls, setOriginalFileUrls] = useState({});

  useEffect(() => {
    let data = null;
    const getlocaldata = localStorage.getItem(STORAGE_KEYS.HOSPITAL);
    if (getlocaldata != null) {
      try {
        const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        data = JSON.parse(decrypted);
      } catch (err) {
        console.error('Unable to decrypt hospital session', err);
      }
    }
    if (!data) {
      navigate('/hospital');
    } else {
      sethospital(data.hospitalData);
      settoken(`Bearer ${data.accessToken}`);
    }
  }, [navigate]);

  useEffect(() => {
    if (token) {
      getprofiledata();
      getsurgerytype();
    }
  }, [token]);

  const getsurgerytype = () => {
    axios
      .post(`${API_BASE_URL}/doctor/surgerytypes/list`)
      .then((response) => {
        setsurgerytypes(response?.data?.Data || []);
      })
      .catch((error) => {
        console.error('Error fetching surgery types:', error);
      });
  };

  const getprofiledata = () => {
    setloading(true);
    axios
      .get(`${API_BASE_URL}/hospital/profile`, {
        headers: { Authorization: token },
      })
      .then((response) => {
        const data = response?.data?.Data || response?.data || {};
        const savedFileUrls = {};
        FILE_FIELDS.forEach((field) => {
          if (typeof data[field] === 'string' && data[field]) {
            savedFileUrls[field] = data[field];
          }
        });
        setOriginalFileUrls(savedFileUrls);
        setprofile({
          ...data,
          establishmentyear:
            data.establishmentyear != null && data.establishmentyear !== ''
              ? String(data.establishmentyear).replace(/\D/g, '')
              : '',
          downpaymentrequired: normalizeDownPayment(data.downpaymentrequired),
          treatment: normalizeTreatment(data.treatment),
          interesttype: normalizeInterestType(data.interesttype),
        });
        if (data.hospitalname || data.logo) {
          sethospital((prev) => ({
            ...prev,
            hospitalname: data.hospitalname || prev?.hospitalname,
            logo: data.logo || prev?.logo,
          }));
        }
      })
      .catch((error) => {
        console.error('Error fetching hospital profile:', error);
        Swal.fire({
          title: 'Unable to load profile',
          text: error?.response?.data?.Message || 'Please try again.',
          icon: 'error',
        });
      })
      .finally(() => {
        setloading(false);
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setprofile((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumericChange = (e) => {
    const { name, value } = e.target;
    setprofile((prev) => ({ ...prev, [name]: value.replace(/\D/g, '') }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (!files?.[0]) return;
    const file = files[0];
    setPendingFiles((prev) => ({ ...prev, [name]: file }));
    setFilePreviews((prev) => {
      if (prev[name]) URL.revokeObjectURL(prev[name]);
      return { ...prev, [name]: URL.createObjectURL(file) };
    });
  };

  const getSurgeryTypeName = (id) => {
    const found = surgerytypes.find((item) => item._id === id);
    return found?.surgerytypename || id;
  };

  const handleSurgeryTypeSelect = (e) => {
    const selectedId = e.target.value;
    setSelectedSurgeryType('');
    if (!selectedId || !profile) return;
    if ((profile.treatment || []).includes(selectedId)) return;
    setprofile((prev) => ({
      ...prev,
      treatment: [...(prev.treatment || []), selectedId],
    }));
  };

  const removeSurgeryType = (id) => {
    setprofile((prev) => ({
      ...prev,
      treatment: (prev.treatment || []).filter((item) => item !== id),
    }));
  };

  const updateInterestType = (index, value) => {
    setprofile((prev) => ({
      ...prev,
      interesttype: (prev.interesttype || []).map((item, idx) => (idx === index ? value : item)),
    }));
  };

  const addInterestType = () => {
    setprofile((prev) => ({
      ...prev,
      interesttype: [...(prev.interesttype || []), ''],
    }));
  };

  const removeInterestType = (index) => {
    setprofile((prev) => ({
      ...prev,
      interesttype: (prev.interesttype || []).filter((_, idx) => idx !== index),
    }));
  };

  const removeOldImage = async (oldPath) => {
    if (!oldPath || typeof oldPath !== 'string') return;
    if (oldPath.startsWith('blob:') || oldPath.startsWith('data:')) return;

    try {
      await axios({
        method: 'post',
        url: `${API_BASE_URL}/user/upload/removeimage`,
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
        data: { path: oldPath },
      });
    } catch (error) {
      // Continue with new upload even if old image removal fails
      console.error('Error removing old image:', error);
    }
  };

  const uploadFile = async (file) => {
    if (!file) return '';
    if (typeof file === 'string') return file;

    const uploadPayload = new FormData();
    uploadPayload.append('file', file);
    const response = await axios.post(`${API_BASE_URL}/user/upload`, uploadPayload, {
      headers: {
        Authorization: token,
        'Content-Type': 'multipart/form-data',
      },
    });
    if (response?.data?.Status === 200 && response?.data?.Data?.url) {
      return response.data.Data.url;
    }
    throw new Error(response?.data?.Message || 'File upload failed');
  };

  const isPdf = (url = '', file) => {
    if (file?.type === 'application/pdf') return true;
    if (file?.name && file.name.toLowerCase().endsWith('.pdf')) return true;
    if (!url || typeof url !== 'string') return false;
    const lower = url.toLowerCase();
    return (
      lower.endsWith('.pdf') ||
      lower.includes('.pdf?') ||
      lower.includes('/raw/upload/') ||
      lower.includes('application/pdf')
    );
  };

  const getPdfViewerSrc = (url) => {
    if (!url) return '';
    if (url.startsWith('blob:') || url.startsWith('data:')) return url;
    return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`;
  };

  const renderFilePreview = (fieldName, label) => {
    const previewUrl = filePreviews[fieldName] || profile?.[fieldName];
    const pendingFile = pendingFiles[fieldName];
    const pdfDoc = isPdf(previewUrl, pendingFile);

    return (
      <Form.Group>
        <Form.Label className="fw-semibold">{label}</Form.Label>
        {!IsDisable && (
          <Form.Control
            type="file"
            name={fieldName}
            accept="image/*,.pdf"
            disabled={IsDisable}
            onChange={handleFileChange}
            className="form-control mb-2"
          />
        )}
        {previewUrl ? (
          <div className="border rounded p-3 bg-light">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <span className="fw-medium">
                {pendingFile ? pendingFile.name : pdfDoc ? 'PDF Document' : 'Image Document'}
              </span>
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline-primary"
              >
                Open
              </a>
            </div>
            <div className="text-center">
              {pdfDoc ? (
                <div style={{ width: '100%', maxWidth: '120px', height: '100px', margin: '0 auto' }}>
                  <iframe
                    src={getPdfViewerSrc(previewUrl)}
                    style={{ width: '100%', height: '100px' }}
                    className="border-0 rounded"
                    title={label}
                  />
                </div>
              ) : (
                <img
                  src={previewUrl}
                  alt={label}
                  className="rounded border"
                  style={{
                    width: '100px',
                    height: '100px',
                    objectFit: 'cover',
                  }}
                />
              )}
            </div>
          </div>
        ) : (
          <Form.Text className="text-muted">No file uploaded</Form.Text>
        )}
      </Form.Group>
    );
  };

  const updateprofiledata = async () => {
    if (!profile) return;
    setloading(true);
    try {
      const uploadedValues = { ...profile };

      for (const field of FILE_FIELDS) {
        if (pendingFiles[field]) {
          // DoctorProfile pattern: remove previous server image before uploading replacement
          if (originalFileUrls[field]) {
            await removeOldImage(originalFileUrls[field]);
          }
          uploadedValues[field] = await uploadFile(pendingFiles[field]);
        }
      }

      const payload = {
        hospitalname: uploadedValues.hospitalname || '',
        legalentityname: uploadedValues.legalentityname || '',
        hospitaltype: uploadedValues.hospitaltype || '',
        registrationnumber: uploadedValues.registrationnumber || '',
        gstnumber: uploadedValues.gstnumber || '',
        pannumber: uploadedValues.pannumber || '',
        establishmentyear: Number(uploadedValues.establishmentyear) || 0,
        websiteurl: uploadedValues.websiteurl || '',
        logo: uploadedValues.logo || '',
        summary: uploadedValues.summary || '',
        registeredaddress: uploadedValues.registeredaddress || '',
        branchdetails: Array.isArray(uploadedValues.branchdetails) ? uploadedValues.branchdetails : [],
        email: uploadedValues.email || '',
        contactpersonname: uploadedValues.contactpersonname || '',
        designation: uploadedValues.designation || '',
        contactpersonmobile: uploadedValues.contactpersonmobile || '',
        contactpersonemail: uploadedValues.contactpersonemail || '',
        alternatecontactperson: uploadedValues.alternatecontactperson || '',
        alternatemobile: uploadedValues.alternatemobile || '',
        bankname: uploadedValues.bankname || '',
        accountholdername: uploadedValues.accountholdername || '',
        accountnumber: uploadedValues.accountnumber || '',
        ifsccode: uploadedValues.ifsccode || '',
        bankbranchname: uploadedValues.bankbranchname || '',
        cancelledchequenupload: uploadedValues.cancelledchequenupload || '',
        availabletenures: uploadedValues.availabletenures || '',
        interesttype: Array.isArray(uploadedValues.interesttype)
          ? uploadedValues.interesttype.map((type) => type.trim()).filter(Boolean)
          : [],
        downpaymentrequired: uploadedValues.downpaymentrequired || '',
        treatment: Array.isArray(uploadedValues.treatment) ? uploadedValues.treatment.filter(Boolean) : [],
        hospitalregistrationcertificate: uploadedValues.hospitalregistrationcertificate || '',
        nabhaccreditation: uploadedValues.nabhaccreditation || '',
        nabhnumber: uploadedValues.nabhnumber || '',
        nabhcertificate: uploadedValues.nabhcertificate || '',
        gstcertificate: uploadedValues.gstcertificate || '',
        pancopy: uploadedValues.pancopy || '',
        authorizedsignatoryidproof: uploadedValues.authorizedsignatoryidproof || '',
      };

      if (uploadedValues.password) {
        payload.password = uploadedValues.password;
      }

      const response = await axios.post(`${API_BASE_URL}/hospital/profile/edit`, payload, {
        headers: { Authorization: token },
      });

      if (response?.data?.Status === 200 || response?.status === 200) {
        Object.values(filePreviews).forEach((url) => {
          if (url) URL.revokeObjectURL(url);
        });
        setFilePreviews({});
        setPendingFiles({});
        setdisabled(true);
        getprofiledata();
        Swal.fire({
          title: 'Profile updated successfully.',
          icon: 'success',
        });
      } else {
        throw new Error(response?.data?.Message || 'Profile update failed');
      }
    } catch (error) {
      Swal.fire({
        title: 'Profile Not Updated.',
        text: error?.response?.data?.Message || error.message || 'Something went wrong. Please try again.',
        icon: 'error',
      });
    } finally {
      setloading(false);
    }
  };

  const handleCancel = () => {
    Object.values(filePreviews).forEach((url) => {
      if (url) URL.revokeObjectURL(url);
    });
    setFilePreviews({});
    setPendingFiles({});
    setSelectedSurgeryType('');
    setdisabled(true);
    getprofiledata();
  };

  return (
    <>
      <Container fluid className="p-0">
        <Row className="g-0">
          <HospitalSidebar hospital={hospital} />
          <Col xs={12} sm={9} className="p-3 mt-3">
            <div className="appointments-card mb-3">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 border-bottom pb-3">
                <h4 className="mb-0">Hospital Profile</h4>
              </div>
            </div>

            {profile !== null ? (
              <Form className="register_doctor">
                <Tabs
                  defaultActiveKey="basic"
                  id="hospital-profile-tabs"
                  className="mb-3 border-0 setting_tab gap-3 flex-wrap"
                >
                  <Tab eventKey="basic" title="Basic Information">
                    <h5 className="fw-bold mb-3">Basic Details</h5>
                    <Row className="g-3 mb-4">
                      <Col md={6} lg={4}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">Hospital Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="hospitalname"
                            value={profile.hospitalname || ''}
                            disabled={IsDisable}
                            onChange={handleChange}
                            placeholder="Enter hospital name"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6} lg={4}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">Legal Entity Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="legalentityname"
                            value={profile.legalentityname || ''}
                            disabled={IsDisable}
                            onChange={handleChange}
                            placeholder="Enter legal entity name"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6} lg={4}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">Hospital Type</Form.Label>
                          <Form.Select
                            name="hospitaltype"
                            value={profile.hospitaltype || ''}
                            disabled={IsDisable}
                            onChange={handleChange}
                          >
                            <option value="">Select Type</option>
                            <option value="Hospital">Hospital</option>
                            <option value="Clinic">Clinic</option>
                            <option value="Diagnostic Center">Diagnostic Center</option>
                            <option value="Multi-Specialty">Multi-Specialty</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6} lg={4}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">Registration Number</Form.Label>
                          <Form.Control
                            type="text"
                            name="registrationnumber"
                            value={profile.registrationnumber || ''}
                            disabled={IsDisable}
                            onChange={handleChange}
                            placeholder="Enter registration number"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6} lg={4}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">Establishment Year</Form.Label>
                          <Form.Control
                            type="text"
                            inputMode="numeric"
                            name="establishmentyear"
                            value={profile.establishmentyear || ''}
                            disabled={IsDisable}
                            onChange={handleNumericChange}
                            placeholder="Enter year"
                            maxLength={4}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6} lg={4}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">Website URL</Form.Label>
                          <Form.Control
                            type="text"
                            name="websiteurl"
                            value={profile.websiteurl || ''}
                            disabled={IsDisable}
                            onChange={handleChange}
                            placeholder="Enter website URL"
                          />
                        </Form.Group>
                      </Col>
                      {/* <Col md={6} lg={4}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">Email</Form.Label>
                          <Form.Control type="email" name="email" value={profile.email || ''} disabled />
                        </Form.Group>
                      </Col>
                      <Col md={6} lg={4}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">Mobile</Form.Label>
                          <Form.Control type="text" name="mobile" value={profile.mobile || ''} disabled />
                        </Form.Group>
                      </Col>
                      <Col md={6} lg={4}>
                        {renderFilePreview('logo', 'Hospital Logo')}
                      </Col> 
                      <Col xs={12}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">Summary</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            name="summary"
                            value={profile.summary || ''}
                            disabled={IsDisable}
                            onChange={handleChange}
                            placeholder="Enter hospital summary"
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={12}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">Registered Address</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            name="registeredaddress"
                            value={profile.registeredaddress || ''}
                            disabled={IsDisable}
                            onChange={handleChange}
                            placeholder="Enter registered address"
                          />
                        </Form.Group>
                      </Col>*/}
                    </Row>

                    <h5 className="fw-bold mb-3">Registration Details</h5>
                    <Row className="g-3 mb-4">
                      <Col md={6} lg={4}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">Registration Number</Form.Label>
                          <Form.Control
                            type="text"
                            name="registrationnumber"
                            value={profile.registrationnumber || ''}
                            disabled={IsDisable}
                            onChange={handleChange}
                            placeholder="Enter registration number"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6} lg={4}>
                        {renderFilePreview('hospitalregistrationcertificate', 'Registration Certificate')}
                      </Col>
                    </Row>

                    <h5 className="fw-bold mb-3">GST Details</h5>
                    <Row className="g-3 mb-4">
                      <Col md={6} lg={4}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">GST Number</Form.Label>
                          <Form.Control
                            type="text"
                            name="gstnumber"
                            value={profile.gstnumber || ''}
                            disabled={IsDisable}
                            onChange={handleChange}
                            placeholder="Enter GST number"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6} lg={4}>
                        {renderFilePreview('gstcertificate', 'GST Certificate')}
                      </Col>
                    </Row>

                    <h5 className="fw-bold mb-3">PAN Details</h5>
                    <Row className="g-3 mb-4">
                      <Col md={6} lg={4}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">PAN Number</Form.Label>
                          <Form.Control
                            type="text"
                            name="pannumber"
                            value={profile.pannumber || ''}
                            disabled={IsDisable}
                            onChange={handleChange}
                            placeholder="Enter PAN number"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6} lg={4}>
                        {renderFilePreview('pancopy', 'PAN Certificate')}
                      </Col>
                    </Row>

                    <h5 className="fw-bold mb-3">NABH Details</h5>
                    <Row className="g-3">
                      <Col md={6} lg={2}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">NABH Accreditation</Form.Label>
                          <Form.Select
                            name="nabhaccreditation"
                            value={profile.nabhaccreditation || ''}
                            disabled={IsDisable}
                            onChange={handleChange}
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6} lg={3}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">NABH Number</Form.Label>
                          <Form.Control
                            type="text"
                            name="nabhnumber"
                            value={profile.nabhnumber || ''}
                            disabled={IsDisable}
                            onChange={handleChange}
                            placeholder="Enter NABH number"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6} lg={4}>
                        {renderFilePreview('nabhcertificate', 'NABH Certificate')}
                      </Col>
                      {/* <Col md={6} lg={4}>
                        {renderFilePreview('authorizedsignatoryidproof', 'Authorized Signatory ID Proof')}
                      </Col> */}
                    </Row>
                  </Tab>

                  <Tab eventKey="contact" title="Primary Contact">
                    <h5 className="fw-bold mb-3">Primary Contact Details</h5>
                    <Row className="g-3 mb-4">
                      <Col md={6} lg={4}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">Contact Person Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="contactpersonname"
                            value={profile.contactpersonname || ''}
                            disabled={IsDisable}
                            onChange={handleChange}
                            placeholder="Enter contact person name"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6} lg={4}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">Mobile Number</Form.Label>
                          <Form.Control
                            type="text"
                            name="contactpersonmobile"
                            value={profile.contactpersonmobile || ''}
                            disabled={IsDisable}
                            onChange={handleNumericChange}
                            placeholder="Enter mobile number"
                            maxLength={10}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6} lg={4}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">Designation</Form.Label>
                          <Form.Control
                            type="text"
                            name="designation"
                            value={profile.designation || ''}
                            disabled={IsDisable}
                            onChange={handleChange}
                            placeholder="Enter designation"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6} lg={4}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">Email Address</Form.Label>
                          <Form.Control
                            type="email"
                            name="contactpersonemail"
                            value={profile.contactpersonemail || ''}
                            disabled={IsDisable}
                            onChange={handleChange}
                            placeholder="Enter email address"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <h5 className="fw-bold mb-3">Alternate Details</h5>
                    <Row className="g-3">
                      <Col md={6} lg={4}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">Alternate Contact Person</Form.Label>
                          <Form.Control
                            type="text"
                            name="alternatecontactperson"
                            value={profile.alternatecontactperson || ''}
                            disabled={IsDisable}
                            onChange={handleChange}
                            placeholder="Enter alternate contact person"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6} lg={4}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">Alternate Mobile Number</Form.Label>
                          <Form.Control
                            type="text"
                            name="alternatemobile"
                            value={profile.alternatemobile || ''}
                            disabled={IsDisable}
                            onChange={handleNumericChange}
                            placeholder="Enter alternate mobile number"
                            maxLength={10}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Tab>

                  <Tab eventKey="banking" title="Banking & Settlement">
                    <h5 className="fw-bold mb-3">Banking & Settlement Details</h5>
                    <Row className="g-3">
                      <Col md={6} lg={4}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">Bank Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="bankname"
                            value={profile.bankname || ''}
                            disabled={IsDisable}
                            onChange={handleChange}
                            placeholder="Enter bank name"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6} lg={4}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">Account Holder Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="accountholdername"
                            value={profile.accountholdername || ''}
                            disabled={IsDisable}
                            onChange={handleChange}
                            placeholder="Enter account holder name"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6} lg={4}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">Account Number</Form.Label>
                          <Form.Control
                            type="text"
                            name="accountnumber"
                            value={profile.accountnumber || ''}
                            disabled={IsDisable}
                            onChange={handleChange}
                            placeholder="Enter account number"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6} lg={4}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">IFSC Code</Form.Label>
                          <Form.Control
                            type="text"
                            name="ifsccode"
                            value={profile.ifsccode || ''}
                            disabled={IsDisable}
                            onChange={handleChange}
                            placeholder="Enter IFSC code"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6} lg={4}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">Branch Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="bankbranchname"
                            value={profile.bankbranchname || ''}
                            disabled={IsDisable}
                            onChange={handleChange}
                            placeholder="Enter branch name"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6} lg={4}>
                        {renderFilePreview('cancelledchequenupload', 'Cancelled Cheque Upload')}
                      </Col>
                    </Row>
                  </Tab>

                  <Tab eventKey="emi" title="EMI Program Configuration">
                    <h5 className="fw-bold mb-3">EMI Program Configuration</h5>
                    <Row className="g-3">
                      <Col md={6} lg={4}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">Available Tenures</Form.Label>
                          <Form.Control
                            type="text"
                            name="availabletenures"
                            value={profile.availabletenures || ''}
                            disabled={IsDisable}
                            onChange={handleChange}
                            placeholder="e.g. 3, 6, 12 Month"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6} lg={4}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">Down Payment Required</Form.Label>
                          <Form.Select
                            name="downpaymentrequired"
                            value={profile.downpaymentrequired || ''}
                            disabled={IsDisable}
                            onChange={handleChange}
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col xs={12}>
                        <Form.Label className="fw-semibold">Interest Type</Form.Label>
                        <div className="d-flex gap-2">
                          {(profile.interesttype || []).length === 0 && IsDisable ? (
                            <Form.Text className="text-muted">No interest type added</Form.Text>
                          ) : (
                            (profile.interesttype || []).map((interest, index) => (
                              <div key={`interest-${index}`} className="d-flex gap-2 align-items-center">
                                <Form.Control
                                  type="text"
                                  value={interest}
                                  disabled={IsDisable}
                                  onChange={(e) => updateInterestType(index, e.target.value)}
                                  placeholder="Enter interest type"
                                />
                                {!IsDisable && (
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    type="button"
                                    onClick={() => removeInterestType(index)}
                                  >
                                    <FaRegTrashCan />
                                  </Button>
                                )}
                              </div>
                            ))
                          )}
                          {!IsDisable && (
                            <div>
                              <Button variant="primary" size="sm" type="button" onClick={addInterestType}>
                                Add Interest Type
                              </Button>
                            </div>
                          )}
                        </div>
                      </Col>
                    </Row>
                  </Tab>

                  <Tab eventKey="treatment" title="Treatment & Department">
                    <h5 className="fw-bold mb-3">Treatment & Department</h5>
                    <Row className="g-3">
                      {IsDisable ? '' : 
                      <Col xs={12} md={6} lg={4}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">Select Surgery Type</Form.Label>
                          <Form.Select
                            value={selectedSurgeryType}
                            disabled={IsDisable}
                            onChange={handleSurgeryTypeSelect}
                          >
                            <option value="">Select surgery type</option>
                            {surgerytypes
                              .filter((type) => !(profile.treatment || []).includes(type._id))
                              .map((type) => (
                                <option key={type._id} value={type._id}>
                                  {type.surgerytypename}
                                </option>
                              ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>}
                      <Col xs={12}>
                        <div className="d-flex flex-wrap gap-2 mt-2">
                          {(profile.treatment || []).length === 0 ? (
                            <Form.Text className="text-muted">No surgery types selected</Form.Text>
                          ) : (
                            (profile.treatment || []).map((typeId, index) => {
                              const colors = TREATMENT_CHIP_COLORS[index % TREATMENT_CHIP_COLORS.length];
                              return (
                                <span
                                  key={typeId}
                                  className="d-inline-flex align-items-center gap-2"
                                  style={{
                                    background: colors.bg,
                                    color: colors.color,
                                    borderRadius: '999px',
                                    padding: '8px 14px',
                                    fontWeight: 600,
                                    fontSize: '14px',
                                  }}
                                >
                                  {getSurgeryTypeName(typeId)}
                                  {!IsDisable && (
                                    <button
                                      type="button"
                                      onClick={() => removeSurgeryType(typeId)}
                                      style={{
                                        border: 'none',
                                        background: 'transparent',
                                        color: colors.color,
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        lineHeight: 1,
                                        padding: 0,
                                      }}
                                      aria-label={`Remove ${getSurgeryTypeName(typeId)}`}
                                    >
                                      ×
                                    </button>
                                  )}
                                </span>
                              );
                            })
                          )}
                        </div>
                      </Col>
                    </Row>
                  </Tab>
                </Tabs>

                <hr />
                <Card className="border-0 shadow-sm">
                  <Card.Body className="text-center">
                    {IsDisable ? (
                      <Button variant="primary" className="px-5 me-3" onClick={() => setdisabled(false)}>
                        Edit Profile
                      </Button>
                    ) : (
                      <>
                        <Button variant="success" className="px-5 me-3" onClick={updateprofiledata}>
                          Update Profile
                        </Button>
                        <Button variant="secondary" className="px-4" onClick={handleCancel}>
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
          </Col>
        </Row>
      </Container>
      {loading && <Loader />}
    </>
  );
};

export default HospitalProfile;
