import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import axios from 'axios';
import { Container } from 'react-bootstrap';
import NavBar from '../Visitor/Component/NavBar';
import FooterBar from '../Visitor/Component/FooterBar';
import '../Visitor/MedicalLoanForm.css';
import { API_BASE_URL, SECRET_KEY, STORAGE_KEYS } from '../config';
import { FaRegPenToSquare, FaRegTrashCan } from 'react-icons/fa6';

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

const initialFormData = {
    hospitalname: '',
    email: '',
    mobile: '',
    logo: '',
    password: '',
    otp: '',
    legalentityname: '',
    hospitaltype: '',
    registrationnumber: '',
    gstnumber: '',
    pannumber: '',
    establishmentyear: '',
    websiteurl: '',
    summary: '',
    registeredaddress: '',
    branchdetails: [],
    contactpersonname: '',
    designation: '',
    contactpersonmobile: '',
    contactpersonemail: '',
    alternatecontactperson: '',
    alternatemobile: '',
    bankname: '',
    accountholdername: '',
    accountnumber: '',
    ifsccode: '',
    bankbranchname: '',
    cancelledchequenupload: '',
    availabletenures: '',
    interesttype: [],
    downpaymentrequired: '',
    treatment: [],
    hospitalregistrationcertificate: '',
    nabhaccreditation: '',
    nabhnumber: '',
    nabhcertificate: '',
    gstcertificate: '',
    pancopy: '',
    authorizedsignatoryidproof: '',
};

const PENDING_REGISTRATION_KEY = 'hospitalRegistrationPending';

const HospitalRegister = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [logdata, setlogdata] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [validationError, setValidationError] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [formData, setFormData] = useState(initialFormData);
    const emptyBranch = {
        id: '',
        branchname: '',
        summary: '',
        photos: [],
        locationurl: '',
        city: '',
        state: '',
        pincode: '',
        landmark: '',
    };

    const [currentBranch, setCurrentBranch] = useState(emptyBranch);
    const [editingBranchIndex, setEditingBranchIndex] = useState(null);

    const stepsList = [
        { number: 1, title: 'Basic Information' },
        { number: 2, title: 'OTP Verification' },
        { number: 3, title: 'Primary Contact' },
        { number: 4, title: 'Banking & Settlement' },
        { number: 5, title: 'EMI Program' },
        { number: 6, title: 'Treatment & Department' },
    ];

    const getStoredHospitalToken = () => {
        try {
            const localData = localStorage.getItem(STORAGE_KEYS.HOSPITAL) || localStorage.getItem('HospitalLogin');
            if (!localData) return null;

            try {
                const bytes = CryptoJS.AES.decrypt(localData, SECRET_KEY);
                const decrypted = bytes.toString(CryptoJS.enc.Utf8);
                if (!decrypted) return null;

                const parsed = JSON.parse(decrypted);
                if (parsed.accessToken) return parsed.accessToken;
                if (parsed.token) return parsed.token;
                if (parsed?.Data?.accessToken) return parsed.Data.accessToken;
                if (parsed?.Data?.token) return parsed.Data.token;
            } catch (err) {
                try {
                    const parsed = JSON.parse(localData);
                    if (parsed.accessToken) return parsed.accessToken;
                    if (parsed.token) return parsed.token;
                    if (parsed?.Data?.accessToken) return parsed.Data.accessToken;
                    if (parsed?.Data?.token) return parsed.Data.token;
                } catch (e2) {
                    console.error('Unable to parse stored hospital data', e2);
                }
            }

            return null;
        } catch (e) {
            console.error('getStoredHospitalToken error:', e);
            return null;
        }
    };

    const [surgerytypes, setsurgerytypes] = useState([]);
    const [selectedSurgeryType, setSelectedSurgeryType] = useState('');

    const getsurgerytype = () => {
        axios.post(`${API_BASE_URL}/doctor/surgerytypes/list`)
            .then(response => {
                console.log(response.data);
                setsurgerytypes(response.data.Data);
            })
            .catch(error => {
                console.error('Error fetching surgery types:', error);
            });
    };
    useEffect(() => {
        getsurgerytype();
    }, []);

    const getStoredHospitalAuth = () => {
        try {
            const localData = localStorage.getItem(STORAGE_KEYS.HOSPITAL) || localStorage.getItem('HospitalLogin');
            if (!localData) return null;

            try {
                const bytes = CryptoJS.AES.decrypt(localData, SECRET_KEY);
                const decrypted = bytes.toString(CryptoJS.enc.Utf8);
                if (!decrypted) return null;
                return JSON.parse(decrypted);
            } catch (err) {
                try {
                    return JSON.parse(localData);
                } catch (e2) {
                    console.error('Unable to parse stored hospital auth data', e2);
                }
            }
            return null;
        } catch (e) {
            console.error('getStoredHospitalAuth error:', e);
            return null;
        }
    };

    const persistHospitalAuth = (responseData) => {
        const authPayload = responseData?.Data || responseData || {};
        const token = authPayload.accessToken || authPayload.token;
        if (!token) return null;

        const normalizedPayload = {
            ...authPayload,
            accessToken: token,
            token,
        };

        const encrypted = CryptoJS.AES.encrypt(JSON.stringify(normalizedPayload), SECRET_KEY).toString();
        localStorage.setItem(STORAGE_KEYS.HOSPITAL, encrypted);
        localStorage.setItem('HospitalLogin', encrypted);
        return token;
    };

    const loadPendingRegistration = () => {
        try {
            const savedData = localStorage.getItem(PENDING_REGISTRATION_KEY);
            if (!savedData) return null;
            return JSON.parse(savedData);
        } catch (error) {
            console.error('Unable to read saved hospital registration data:', error);
            return null;
        }
    };

    const normalizeBranchDetails = (value) => {
        if (Array.isArray(value)) {
            return value.map((branch) => ({
                id: branch.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                branchname: branch.branchname || branch.name || '',
                summary: branch.summary || '',
                photos: Array.isArray(branch.photos) ? branch.photos : [],
                locationurl: branch.locationurl || '',
                city: branch.city || '',
                state: branch.state || '',
                pincode: branch.pincode || '',
                landmark: branch.landmark || '',
            }));
        }
        if (typeof value === 'string' && value.trim()) {
            return value
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean)
                .map((branchname) => ({
                    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                    branchname,
                    summary: '',
                    photos: [],
                    locationurl: '',
                    city: '',
                    state: '',
                    pincode: '',
                    landmark: '',
                }));
        }
        return [];
    };

    const normalizeInterestType = (value) => {
        if (Array.isArray(value)) {
            return value.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean);
        }
        if (typeof value === 'string' && value.trim()) {
            return value
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean);
        }
        return [];
    };

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
            return value
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean);
        }
        return [];
    };

    const normalizeFormData = (data) => ({
        ...data,
        establishmentyear:
            data.establishmentyear != null && data.establishmentyear !== ''
                ? String(data.establishmentyear).replace(/\D/g, '')
                : '',
        downpaymentrequired:
            data.downpaymentrequired != null && data.downpaymentrequired !== ''
                ? normalizeDownPayment(data.downpaymentrequired)
                : '',
        branchdetails: normalizeBranchDetails(data.branchdetails),
        interesttype: normalizeInterestType(data.interesttype),
        treatment: normalizeTreatment(data.treatment),
    });

    const fetchHospitalProfile = async (token) => {
        if (!token) throw new Error('Missing token for profile fetch');
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/hospital/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const profileData = response?.data?.Data || response?.data || {};
            const normalizedProfile = normalizeFormData({
                ...initialFormData,
                ...profileData,
                branchdetails: profileData.branchdetails || [],
            });
            setFormData((prev) => ({ ...prev, ...normalizedProfile }));
            savePendingRegistration(normalizedProfile, 3);
            setStatusMessage('Loaded hospital profile from saved session.');
            setCurrentStep(3);
            return normalizedProfile;
        } catch (err) {
            console.error('Unable to load hospital profile:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const sanitizeForStorage = (value) => {
        if (value instanceof File) return null;
        if (Array.isArray(value)) return value.map(sanitizeForStorage);
        if (value && typeof value === 'object') {
            return Object.fromEntries(
                Object.entries(value).map(([key, subValue]) => [key, sanitizeForStorage(subValue)])
            );
        }
        return value;
    };

    const savePendingRegistration = (registrationData, stepReached = 3) => {
        try {
            const payload = {
                formData: sanitizeForStorage(registrationData),
                stepReached,
                updatedAt: new Date().toISOString(),
            };
            localStorage.setItem(PENDING_REGISTRATION_KEY, JSON.stringify(payload));
        } catch (error) {
            console.error('Unable to save hospital registration progress:', error);
        }
    };

    const clearPendingRegistration = () => {
        localStorage.removeItem(PENDING_REGISTRATION_KEY);
    };

    useEffect(() => {
        const pendingRegistration = loadPendingRegistration();
        const existingToken = getStoredHospitalToken();
        const existingAuth = getStoredHospitalAuth();

        if (pendingRegistration) {
            const resumeStep = pendingRegistration.stepReached >= 3 ? 3 : pendingRegistration.stepReached || 2;
            setFormData((prev) => ({ ...prev, ...normalizeFormData(pendingRegistration.formData) }));
            setCurrentStep(resumeStep);
            setStatusMessage('We found your saved registration details. You can continue from the next step.');
            return;
        }

        if (existingToken && existingAuth) {
            fetchHospitalProfile(existingToken).catch((err) => {
                console.warn('Unable to load saved hospital profile from token:', err);
                setStatusMessage('Saved session token found but profile load failed. Please continue registration.');
            });
            return;
        }

        try {
            const pgetlocaldata = localStorage.getItem(STORAGE_KEYS.PATIENT) || localStorage.getItem('PatientLogin');
            const dgetlocaldata = localStorage.getItem(STORAGE_KEYS.DOCTOR) || localStorage.getItem('healthdoctor');
            if (pgetlocaldata != null) {
                const bytes = CryptoJS.AES.decrypt(pgetlocaldata, SECRET_KEY);
                const decrypted = bytes.toString(CryptoJS.enc.Utf8);
                if (decrypted) {
                    const data = JSON.parse(decrypted);
                    setlogdata(data.userData || data.patientData || data);
                }
            } else if (dgetlocaldata != null) {
                const bytes = CryptoJS.AES.decrypt(dgetlocaldata, SECRET_KEY);
                const decrypted = bytes.toString(CryptoJS.enc.Utf8);
                if (decrypted) {
                    const data = JSON.parse(decrypted);
                    setlogdata(data.doctorData || data);
                }
            }
        } catch (err) {
            console.error('Error decrypting login data in hospital register flow:', err);
        }
    }, []);

    useEffect(() => {
        document.title = 'Register Hospital | Health Easy EMI';
    }, []);

    const updateFormData = (updatedValues) => {
        setFormData((prev) => {
            const nextState = { ...prev, ...updatedValues };
            savePendingRegistration(nextState, currentStep);
            return nextState;
        });
    };

    const addInterestType = () => {
        updateFormData({ interesttype: [...formData.interesttype, ''] });
    };

    const updateInterestType = (index, value) => {
        updateFormData({
            interesttype: formData.interesttype.map((item, idx) => (idx === index ? value : item)),
        });
    };

    const removeInterestType = (index) => {
        updateFormData({
            interesttype: formData.interesttype.filter((_, idx) => idx !== index),
        });
    };

    const getSurgeryTypeName = (id) => {
        const found = surgerytypes.find((item) => item._id === id);
        return found?.surgerytypename || id;
    };

    const handleSurgeryTypeSelect = (e) => {
        const selectedId = e.target.value;
        setSelectedSurgeryType('');
        if (!selectedId) return;
        if (formData.treatment.includes(selectedId)) return;
        updateFormData({ treatment: [...formData.treatment, selectedId] });
    };

    const removeSurgeryType = (id) => {
        updateFormData({
            treatment: formData.treatment.filter((item) => item !== id),
        });
    };

    const addBranchItem = () => {
        if (!currentBranch.branchname.trim())
            return;
        if (!currentBranch.summary.trim())
            return;
        const newBranch = {
            ...currentBranch,
            id:
                currentBranch.id ||
                `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        };
        if (editingBranchIndex !== null) {
            const updated = [...formData.branchdetails];
            updated[editingBranchIndex] = newBranch;
            updateFormData({
                branchdetails: updated
            });
            setEditingBranchIndex(null);
        } else {
            updateFormData({
                branchdetails: [
                    ...formData.branchdetails,
                    newBranch
                ]
            });
        }
        setCurrentBranch(emptyBranch);
    };

    const editBranchItem = (index) => {
        setCurrentBranch(formData.branchdetails[index]);
        setEditingBranchIndex(index);
    };

    const updateBranchItem = (index, field, value) => {
        updateFormData({
            branchdetails: formData.branchdetails.map((item, idx) =>
                idx === index ? { ...item, [field]: value } : item
            ),
        });
    };

    const removeBranchItem = (index) => {
        updateFormData({
            branchdetails: formData.branchdetails.filter((_, idx) => idx !== index),
        });
    };

    const updateBranchPhotos = async (files) => {
        if (!files.length) return;
        setLoading(true);
        try {
            const uploadPromises = Array.from(files).map(uploadFile);
            const uploaded = await Promise.all(uploadPromises);
            setCurrentBranch(prev => ({
                ...prev,
                photos: [
                    ...prev.photos,
                    ...uploaded
                ]
            }));
        }
        finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        updateFormData({ [name]: value });
    };

    const handleNumericInputChange = (e) => {
        const { name, value } = e.target;
        updateFormData({ [name]: value.replace(/\D/g, '') });
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            updateFormData({ [name]: files[0] });
        }
    };

    const getDisplayValue = (value) => {
        if (!value) return '';
        if (typeof value === 'string') return value;
        if (value instanceof File) return value.name;
        return '';
    };

    const validateStep = (step) => {
        const requiredText = (value) => (typeof value === 'string' ? value.trim() : '');

        if (step === 1) {
            if (!requiredText(formData.hospitalname)) return 'Hospital name is required';
            if (!requiredText(formData.email)) return 'Email is required';
            if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) return 'Please enter a valid email';
            if (!requiredText(formData.mobile)) return 'Mobile number is required';
            if (!/^\d{10}$/.test(formData.mobile)) return 'Please enter a valid 10-digit mobile number';
            if (!formData.logo) return 'Hospital logo is required';
            if (!requiredText(formData.password)) return 'Password is required';
            if (formData.password.length < 6) return 'Password must be at least 6 characters';
            return null;
        }

        if (step === 2) {
            if (!requiredText(formData.mobile)) return 'Mobile number is required';
            if (!/^\d{10}$/.test(formData.mobile)) return 'Please enter a valid 10-digit mobile number';
            if (!requiredText(formData.otp)) return 'OTP is required';
            if (!/^\d{4,6}$/.test(formData.otp)) return 'Please enter a valid OTP';
            return null;
        }

        if (step === 3) {
            if (!requiredText(formData.legalentityname)) return 'Legal entity name is required';
            if (!requiredText(formData.hospitaltype)) return 'Hospital type is required';
            if (!requiredText(formData.registrationnumber)) return 'Registration number is required';
            if (!requiredText(formData.gstnumber)) return 'GST number is required';
            if (!requiredText(formData.pannumber)) return 'PAN number is required';
            if (!requiredText(formData.establishmentyear)) return 'Establishment year is required';
            if (!/^\d{4}$/.test(formData.establishmentyear)) return 'Please enter a valid 4-digit establishment year';
            if (!requiredText(formData.websiteurl)) return 'Website URL is required';
            if (!requiredText(formData.summary)) return 'Summary is required';
            if (!requiredText(formData.registeredaddress)) return 'Registered address is required';
            if (!Array.isArray(formData.branchdetails) || formData.branchdetails.length === 0) return 'At least one branch detail is required';
            for (const branch of formData.branchdetails) {
                if (!requiredText(branch.branchname)) return 'Branch name is required for each branch';
                if (!requiredText(branch.summary)) return 'Branch summary is required for each branch';
            }
            if (!requiredText(formData.contactpersonname)) return 'Contact person name is required';
            if (!requiredText(formData.designation)) return 'Designation is required';
            if (!requiredText(formData.contactpersonmobile)) return 'Contact person mobile is required';
            if (!/^\d{10}$/.test(formData.contactpersonmobile)) return 'Please enter a valid 10-digit contact mobile number';
            if (!requiredText(formData.contactpersonemail)) return 'Contact person email is required';
            if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.contactpersonemail)) return 'Please enter a valid contact person email';
            return null;
        }

        if (step === 4) {
            if (!requiredText(formData.bankname)) return 'Bank name is required';
            if (!requiredText(formData.accountholdername)) return 'Account holder name is required';
            if (!requiredText(formData.accountnumber)) return 'Account number is required';
            if (!requiredText(formData.ifsccode)) return 'IFSC code is required';
            if (!requiredText(formData.bankbranchname)) return 'Bank branch name is required';
            if (!formData.cancelledchequenupload) return 'Cancelled cheque upload is required';
            return null;
        }

        if (step === 5) {
            if (!requiredText(formData.availabletenures)) return 'Available tenures are required';
            if (!Array.isArray(formData.interesttype) || formData.interesttype.length === 0 || formData.interesttype.every((item) => !requiredText(item))) return 'At least one interest type is required';
            if (!requiredText(formData.downpaymentrequired)) return 'Down payment is required';
            if (!['Yes', 'No'].includes(formData.downpaymentrequired)) return 'Please select Yes or No for down payment';
            return null;
        }

        if (step === 6) {
            if (!Array.isArray(formData.treatment) || formData.treatment.length === 0) return 'Please select at least one surgery type';
            if (!formData.hospitalregistrationcertificate) return 'Hospital registration certificate is required';
            if (!requiredText(formData.nabhaccreditation)) return 'NABH accreditation status is required';
            if (!requiredText(formData.nabhnumber)) return 'NABH number is required';
            if (!formData.nabhcertificate) return 'NABH certificate is required';
            if (!formData.gstcertificate) return 'GST certificate is required';
            if (!formData.pancopy) return 'PAN copy is required';
            if (!formData.authorizedsignatoryidproof) return 'Authorized signatory ID proof is required';
            if (!requiredText(formData.password)) return 'Password is required';
            return null;
        }

        return null;
    };

    const uploadFile = async (file) => {
        if (!file) return '';
        if (typeof file === 'string') return file;

        const uploadPayload = new FormData();
        uploadPayload.append('file', file);

        try {
            const response = await axios.post(`${API_BASE_URL}/user/upload`, uploadPayload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response?.data?.Status === 200 && response?.data?.Data?.url) {
                return response.data.Data.url;
            }

            throw new Error(response?.data?.Message || 'File upload failed');
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    };

    const parseArrayValue = (value) => {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        return value
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    };

    const buildFinalPayload = async () => {
        const uploadFields = [
            'logo',
            'cancelledchequenupload',
            'hospitalregistrationcertificate',
            'nabhcertificate',
            'gstcertificate',
            'pancopy',
            'authorizedsignatoryidproof',
        ];

        const uploadedValues = { ...formData };
        for (const field of uploadFields) {
            if (uploadedValues[field] instanceof File) {
                uploadedValues[field] = await uploadFile(uploadedValues[field]);
            }
        }

        return {
            hospitalname: uploadedValues.hospitalname,
            legalentityname: uploadedValues.legalentityname,
            hospitaltype: uploadedValues.hospitaltype,
            registrationnumber: uploadedValues.registrationnumber,
            gstnumber: uploadedValues.gstnumber,
            pannumber: uploadedValues.pannumber,
            establishmentyear: Number(uploadedValues.establishmentyear),
            websiteurl: uploadedValues.websiteurl,
            logo: uploadedValues.logo || '',
            summary: uploadedValues.summary,
            registeredaddress: uploadedValues.registeredaddress,
            branchdetails: Array.isArray(uploadedValues.branchdetails)
                ? uploadedValues.branchdetails.map((branch) => ({
                    branchname: branch.branchname?.trim() || '',
                    summary: branch.summary?.trim() || '',
                    photos: Array.isArray(branch.photos) ? branch.photos : [],
                    locationurl: branch.locationurl?.trim() || '',
                    city: branch.city?.trim() || '',
                    state: branch.state?.trim() || '',
                    pincode: branch.pincode?.trim() || '',
                    landmark: branch.landmark?.trim() || '',
                }))
                : [],
            email: uploadedValues.email,
            contactpersonname: uploadedValues.contactpersonname,
            designation: uploadedValues.designation,
            contactpersonmobile: uploadedValues.contactpersonmobile,
            contactpersonemail: uploadedValues.contactpersonemail,
            alternatecontactperson: uploadedValues.alternatecontactperson,
            alternatemobile: uploadedValues.alternatemobile,
            bankname: uploadedValues.bankname,
            accountholdername: uploadedValues.accountholdername,
            accountnumber: uploadedValues.accountnumber,
            ifsccode: uploadedValues.ifsccode,
            bankbranchname: uploadedValues.bankbranchname,
            cancelledchequenupload: uploadedValues.cancelledchequenupload || '',
            availabletenures: uploadedValues.availabletenures,
            interesttype: Array.isArray(uploadedValues.interesttype)
                ? uploadedValues.interesttype.map((type) => type.trim()).filter(Boolean)
                : [],
            downpaymentrequired: uploadedValues.downpaymentrequired,
            treatment: Array.isArray(uploadedValues.treatment)
                ? uploadedValues.treatment.filter(Boolean)
                : parseArrayValue(uploadedValues.treatment),
            hospitalregistrationcertificate: uploadedValues.hospitalregistrationcertificate || '',
            nabhaccreditation: uploadedValues.nabhaccreditation,
            nabhnumber: uploadedValues.nabhnumber,
            nabhcertificate: uploadedValues.nabhcertificate || '',
            gstcertificate: uploadedValues.gstcertificate || '',
            pancopy: uploadedValues.pancopy || '',
            authorizedsignatoryidproof: uploadedValues.authorizedsignatoryidproof || '',
            password: uploadedValues.password,
        };
    };

    const handleNextStep = async () => {
        setValidationError('');
        setStatusMessage('');

        if (currentStep === 1) {
            const stepError = validateStep(1);
            if (stepError) {
                setValidationError(stepError);
                return;
            }

            setLoading(true);
            try {
                let logoUrl = '';
                if (formData.logo instanceof File) {
                    logoUrl = await uploadFile(formData.logo);
                    setFormData((prev) => ({ ...prev, logo: logoUrl }));
                }

                const signupPayload = {
                    hospitalname: formData.hospitalname.trim(),
                    email: formData.email.trim(),
                    mobile: formData.mobile.trim(),
                    logo: logoUrl || formData.logo,
                    password: formData.password,
                };

                const response = await axios.post(`${API_BASE_URL}/hospital/signup`, signupPayload);
                const responseData = response?.data?.Data || response?.data || {};

                if (response?.data?.Status === 200 || response?.data?.status === 200 || responseData) {
                    savePendingRegistration({ ...formData, logo: logoUrl || formData.logo }, 2);
                    setStatusMessage('Signup successful. Please verify your OTP to continue.');
                    setCurrentStep(2);
                } else {
                    throw new Error(response?.data?.Message || 'Signup failed');
                }
            } catch (error) {
                setValidationError(error.message || 'Signup failed. Please try again.');
            } finally {
                setLoading(false);
            }
            return;
        }

        if (currentStep === 2) {
            const stepError = validateStep(2);
            if (stepError) {
                setValidationError(stepError);
                return;
            }

            setLoading(true);
            try {
                const otpPayload = {
                    mobile: formData.mobile.trim(),
                    otp: formData.otp.trim(),
                };

                const response = await axios.post(`${API_BASE_URL}/hospital/signup/otpverification`, otpPayload);
                const responseData = response?.data?.Data || response?.data || {};
                const token = responseData.accessToken || responseData.token || response?.headers?.authorization;

                if (!token) {
                    throw new Error(response?.data?.Message || 'OTP verification did not return a valid token');
                }

                const savedToken = persistHospitalAuth(responseData) || token;
                let normalizedProfile;
                try {
                    normalizedProfile = await fetchHospitalProfile(savedToken);
                } catch (err) {
                    console.warn('Profile fetch after OTP failed, continuing to step 3', err);
                }

                savePendingRegistration(normalizedProfile || formData, 3);
                setStatusMessage('OTP verified successfully. Your registration details will now be submitted.');
                setCurrentStep(3);
            } catch (error) {
                setValidationError(error.message || 'OTP verification failed. Please try again.');
            } finally {
                setLoading(false);
            }
            return;
        }

        if (currentStep === 6) {
            const stepError = validateStep(6);
            if (stepError) {
                setValidationError(stepError);
                return;
            }

            setLoading(true);
            try {
                const token = getStoredHospitalToken();
                if (!token) {
                    throw new Error('Authentication token is missing. Please verify OTP again.');
                }

                const payload = await buildFinalPayload();
                console.log(payload)
                const response = await axios.post(`${API_BASE_URL}/hospital/profile/edit`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response?.data?.Status === 200 || response?.data?.status === 200) {
                    clearPendingRegistration();
                    localStorage.removeItem(STORAGE_KEYS.HOSPITAL);
                    localStorage.removeItem('HospitalLogin');
                    setStatusMessage('Registration completed successfully.');
                    setFormData(initialFormData);
                    setCurrentStep(1);
                    navigate('/hospital');
                } else {
                    throw new Error(response?.data?.Message || 'Profile update failed');
                }
            } catch (error) {
                setValidationError(error.message || 'Profile update failed. Please try again.');
            } finally {
                setLoading(false);
            }
            return;
        }

        const stepError = validateStep(currentStep);
        if (stepError) {
            setValidationError(stepError);
            return;
        }

        setValidationError('');
        setCurrentStep((prev) => prev + 1);
    };

    const handlePrevStep = () => {
        setValidationError('');
        setStatusMessage('');
        setCurrentStep((prev) => prev - 1);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleNextStep();
    };

    return (
        <>
            <NavBar logindata={logdata} />

            <section className='breadcrumb_Sec'>
                <Container className='text-center '>
                    <h2>Register Hospital</h2>
                </Container>
            </section>

            <div className="medical-loan-page">
                <div className="medical-loan-container">
                    <div className="loan-steps-indicator">
                        <div
                            className="loan-progress-line"
                            style={{ width: `calc(90% * ${(currentStep - 1) / (stepsList.length - 1)})` }}
                        />
                        {stepsList.map((step) => (
                            <div
                                key={step.number}
                                className={`loan-step ${currentStep === step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}
                                onClick={() => {
                                    if (step.number < currentStep) {
                                        setValidationError('');
                                        setStatusMessage('');
                                        setCurrentStep(step.number);
                                    }
                                }}
                                style={{ cursor: step.number < currentStep ? 'pointer' : 'default' }}
                            >
                                <div className="loan-step-number">
                                    {currentStep > step.number ? '✓' : step.number}
                                </div>
                                <div className="loan-step-title">{step.title}</div>
                            </div>
                        ))}
                    </div>

                    {validationError && (
                        <div className="validation-error-box">
                            <span className="error-text">{validationError}</span>
                        </div>
                    )}

                    {statusMessage && (
                        <div className="validation-error-box" style={{ background: '#ecfdf3', borderColor: '#34d399' }}>
                            <span className="error-text" style={{ color: '#047857' }}>{statusMessage}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="medical-loan-form">
                        {currentStep === 1 && (
                            <section className="form-section">
                                <h2>1. Basic Information</h2>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Hospital Name <span className="required-star">*</span></label>
                                        <input type="text" name="hospitalname" value={formData.hospitalname} onChange={handleInputChange} placeholder="Enter hospital name" />
                                    </div>
                                    <div className="form-group">
                                        <label>Email <span className="required-star">*</span></label>
                                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Enter email" />
                                    </div>
                                    <div className="form-group">
                                        <label>Mobile <span className="required-star">*</span></label>
                                        <input type="text" name="mobile" value={formData.mobile} onChange={handleInputChange} maxLength="10" placeholder="Enter 10-digit mobile" />
                                    </div>
                                    <div className="form-group">
                                        <label>Hospital Logo <span className="required-star">*</span></label>
                                        <input type="file" name="logo" onChange={handleFileChange} />
                                        {formData.logo && <span className="selected-filename">{getDisplayValue(formData.logo)}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Password <span className="required-star">*</span></label>
                                        <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Create password" />
                                    </div>
                                </div>
                            </section>
                        )}

                        {currentStep === 2 && (
                            <section className="form-section">
                                <h2>2. OTP Verification</h2>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Mobile <span className="required-star">*</span></label>
                                        <input type="text" name="mobile" value={formData.mobile} onChange={handleInputChange} maxLength="10" placeholder="Enter registered mobile" />
                                    </div>
                                    <div className="form-group">
                                        <label>OTP <span className="required-star">*</span></label>
                                        <input type="text" name="otp" value={formData.otp} onChange={handleInputChange} maxLength="6" placeholder="Enter OTP" />
                                    </div>
                                </div>
                            </section>
                        )}

                        {currentStep === 3 && (
                            <section className="form-section">
                                <h2>3. Primary Contact</h2>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Legal Entity Name <span className="required-star">*</span></label>
                                        <input type="text" name="legalentityname" value={formData.legalentityname} onChange={handleInputChange} placeholder="Enter legal entity name" />
                                    </div>
                                    <div className="form-group">
                                        <label>Hospital Type <span className="required-star">*</span></label>
                                        <select name="hospitaltype" value={formData.hospitaltype} onChange={handleInputChange}>
                                            <option value="">Select Type</option>
                                            <option value="Hospital">Hospital</option>
                                            <option value="Clinic">Clinic</option>
                                            <option value="Diagnostic Center">Diagnostic Center</option>
                                            <option value="Multi-Specialty">Multi-Specialty</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Registration Number <span className="required-star">*</span></label>
                                        <input type="text" name="registrationnumber" value={formData.registrationnumber} onChange={handleInputChange} placeholder="Enter registration number" />
                                    </div>
                                    <div className="form-group">
                                        <label>GST Number <span className="required-star">*</span></label>
                                        <input type="text" name="gstnumber" value={formData.gstnumber} onChange={handleInputChange} placeholder="Enter GST number" />
                                    </div>
                                    <div className="form-group">
                                        <label>PAN Number <span className="required-star">*</span></label>
                                        <input type="text" name="pannumber" value={formData.pannumber} onChange={handleInputChange} placeholder="Enter PAN number" />
                                    </div>
                                    <div className="form-group">
                                        <label>Establishment Year <span className="required-star">*</span></label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            name="establishmentyear"
                                            value={formData.establishmentyear}
                                            onChange={handleNumericInputChange}
                                            placeholder="Enter year (e.g. 2010)"
                                            maxLength={4}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Website URL <span className="required-star">*</span></label>
                                        <input type="text" name="websiteurl" value={formData.websiteurl} onChange={handleInputChange} placeholder="Enter website URL" />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label>Summary <span className="required-star">*</span></label>
                                        <textarea type="text" name="summary" value={formData.summary} onChange={handleInputChange} rows="3" placeholder="Enter hospital summary" />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label>Registered Address <span className="required-star">*</span></label>
                                        <textarea name="registeredaddress" value={formData.registeredaddress} onChange={handleInputChange} rows="3" placeholder="Enter registered address" />
                                    </div>
                                    <div className="form-group branch-section">
                                        <label>Branch Details <span className="required-star">*</span></label>
                                        <div className="branch-todo-list">
                                            {formData.branchdetails.map((branch, index) => (
                                                <div className="branch-todo-item" key={branch.id || index}>
                                                    <div>
                                                        <strong>{branch.branchname}</strong>
                                                        <span>{branch.city}</span>
                                                        <span>{branch.state}</span>
                                                        <span>{branch.pincode}</span>
                                                    </div>
                                                    <div>
                                                        <button
                                                            type="button"
                                                            onClick={() => editBranchItem(index)}
                                                        >
                                                            <FaRegPenToSquare />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeBranchItem(index)}
                                                        >
                                                            <FaRegTrashCan />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="branch-list">
                                            <div className="branch-card">
                                                <div className="branch-card-header">
                                                    <div>
                                                        <strong>Branch</strong>
                                                        <div className="branch-card-meta">
                                                            {currentBranch.branchname || "Unnamed Branch"}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="branch-card-body">
                                                    <div className="form-group branch-field-half">
                                                        <label>Branch Name</label>
                                                        <input
                                                            type="text"
                                                            value={currentBranch.branchname}
                                                            onChange={(e) =>
                                                                setCurrentBranch({
                                                                    ...currentBranch,
                                                                    branchname: e.target.value,
                                                                })
                                                            }
                                                            placeholder="Enter branch name"
                                                        />
                                                    </div>
                                                    <div className="form-group branch-field-half">
                                                        <label>Location URL</label>
                                                        <input
                                                            type="text"
                                                            value={currentBranch.locationurl}
                                                            onChange={(e) =>
                                                                setCurrentBranch({
                                                                    ...currentBranch,
                                                                    locationurl: e.target.value,
                                                                })
                                                            }
                                                            placeholder="Enter location URL"
                                                        />
                                                    </div>
                                                    <div className="form-group branch-field-full">
                                                        <label>Summary</label>
                                                        <textarea
                                                            rows="3"
                                                            value={currentBranch.summary}
                                                            onChange={(e) =>
                                                                setCurrentBranch({
                                                                    ...currentBranch,
                                                                    summary: e.target.value,
                                                                })
                                                            }
                                                            placeholder="Enter branch summary"
                                                        />
                                                    </div>
                                                    <div className="form-group branch-field-full">
                                                        <label>Photos</label>
                                                        <input
                                                            type="file"
                                                            multiple
                                                            accept="image/*"
                                                            onChange={(e) => updateBranchPhotos(e.target.files)}
                                                        />
                                                        {currentBranch.photos?.length > 0 && (
                                                            <div className="branch-photo-list">
                                                                {currentBranch.photos.map((photo, photoIndex) => (
                                                                    <span
                                                                        key={photoIndex}
                                                                        className="branch-photo-chip"
                                                                    >
                                                                        {typeof photo === "string"
                                                                            ? photo.split("/").pop()
                                                                            : photo?.name || `Photo ${photoIndex + 1}`}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="branch-location-row branch-field-full">
                                                        <div className="form-group">
                                                            <label>City</label>
                                                            <input
                                                                type="text"
                                                                value={currentBranch.city}
                                                                onChange={(e) =>
                                                                    setCurrentBranch({
                                                                        ...currentBranch,
                                                                        city: e.target.value,
                                                                    })
                                                                }
                                                                placeholder="Enter city"
                                                            />
                                                        </div>
                                                        <div className="form-group">
                                                            <label>State</label>
                                                            <input
                                                                type="text"
                                                                value={currentBranch.state}
                                                                onChange={(e) =>
                                                                    setCurrentBranch({
                                                                        ...currentBranch,
                                                                        state: e.target.value,
                                                                    })
                                                                }
                                                                placeholder="Enter state"
                                                            />
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Pincode</label>
                                                            <input
                                                                type="text"
                                                                value={currentBranch.pincode}
                                                                onChange={(e) =>
                                                                    setCurrentBranch({
                                                                        ...currentBranch,
                                                                        pincode: e.target.value,
                                                                    })
                                                                }
                                                                placeholder="Enter pincode"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="form-group branch-field-full">
                                                        <label>Landmark</label>
                                                        <input
                                                            type="text"
                                                            value={currentBranch.landmark}
                                                            onChange={(e) =>
                                                                setCurrentBranch({
                                                                    ...currentBranch,
                                                                    landmark: e.target.value,
                                                                })
                                                            }
                                                            placeholder="Enter landmark"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <button type="button" className="array-item-add branch-add-button btn btn-primary" onClick={addBranchItem}>
                                            {editingBranchIndex !== null
                                                ? "Update Branch"
                                                : "Add Branch"}
                                        </button>
                                    </div>
                                    <div className="form-group">
                                        <label>Contact Person Name <span className="required-star">*</span></label>
                                        <input type="text" name="contactpersonname" value={formData.contactpersonname} onChange={handleInputChange} placeholder="Enter contact person name" />
                                    </div>
                                    <div className="form-group">
                                        <label>Designation <span className="required-star">*</span></label>
                                        <input type="text" name="designation" value={formData.designation} onChange={handleInputChange} placeholder="Enter designation" />
                                    </div>
                                    <div className="form-group">
                                        <label>Contact Person Mobile <span className="required-star">*</span></label>
                                        <input type="text" name="contactpersonmobile" value={formData.contactpersonmobile} onChange={handleInputChange} maxLength="10" placeholder="Enter mobile" />
                                    </div>
                                    <div className="form-group">
                                        <label>Contact Person Email <span className="required-star">*</span></label>
                                        <input type="email" name="contactpersonemail" value={formData.contactpersonemail} onChange={handleInputChange} placeholder="Enter email" />
                                    </div>
                                    <div className="form-group">
                                        <label>Alternate Contact Person</label>
                                        <input type="text" name="alternatecontactperson" value={formData.alternatecontactperson} onChange={handleInputChange} placeholder="Enter alternate contact person" />
                                    </div>
                                    <div className="form-group">
                                        <label>Alternate Mobile</label>
                                        <input type="text" name="alternatemobile" value={formData.alternatemobile} onChange={handleInputChange} maxLength="10" placeholder="Enter alternate mobile" />
                                    </div>
                                </div>
                            </section>
                        )}

                        {currentStep === 4 && (
                            <section className="form-section">
                                <h2>4. Banking & Settlement</h2>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Bank Name <span className="required-star">*</span></label>
                                        <input type="text" name="bankname" value={formData.bankname} onChange={handleInputChange} placeholder="Enter bank name" />
                                    </div>
                                    <div className="form-group">
                                        <label>Account Holder Name <span className="required-star">*</span></label>
                                        <input type="text" name="accountholdername" value={formData.accountholdername} onChange={handleInputChange} placeholder="Enter account holder name" />
                                    </div>
                                    <div className="form-group">
                                        <label>Account Number <span className="required-star">*</span></label>
                                        <input type="text" name="accountnumber" value={formData.accountnumber} onChange={handleInputChange} placeholder="Enter account number" />
                                    </div>
                                    <div className="form-group">
                                        <label>IFSC Code <span className="required-star">*</span></label>
                                        <input type="text" name="ifsccode" value={formData.ifsccode} onChange={handleInputChange} placeholder="Enter IFSC code" />
                                    </div>
                                    <div className="form-group">
                                        <label>Bank Branch Name <span className="required-star">*</span></label>
                                        <input type="text" name="bankbranchname" value={formData.bankbranchname} onChange={handleInputChange} placeholder="Enter branch name" />
                                    </div>
                                    <div className="form-group">
                                        <label>Cancelled Cheque Upload <span className="required-star">*</span></label>
                                        <input type="file" name="cancelledchequenupload" onChange={handleFileChange} />
                                        {formData.cancelledchequenupload && <span className="selected-filename">{getDisplayValue(formData.cancelledchequenupload)}</span>}
                                    </div>
                                </div>
                            </section>
                        )}

                        {currentStep === 5 && (
                            <section className="form-section">
                                <h2>5. EMI Program</h2>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Available Tenures <span className="required-star">*</span></label>
                                        <input type="text" name="availabletenures" value={formData.availabletenures} onChange={handleInputChange} placeholder="e.g. 6, 12, 24" />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label>Interest Type <span className="required-star">*</span></label>
                                        <div className="array-field-list">
                                            {formData.interesttype.map((interest, index) => (
                                                <div key={`${index}`} className="array-field-item interest-item">
                                                    <input
                                                        type="text"
                                                        value={interest}
                                                        onChange={(e) => updateInterestType(index, e.target.value)}
                                                        placeholder="Enter interest type"
                                                    />
                                                    <button type="button" onClick={() => removeInterestType(index)} className="array-item-remove btn btn-danger">
                                                        <FaRegTrashCan />
                                                    </button>
                                                </div>
                                            ))}
                                            <button type="button" className="array-item-add btn btn-primary" onClick={addInterestType}>
                                                Add Interest Type
                                            </button>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Down Payment Required <span className="required-star">*</span></label>
                                        <select
                                            name="downpaymentrequired"
                                            value={formData.downpaymentrequired}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Select</option>
                                            <option value="Yes">Yes</option>
                                            <option value="No">No</option>
                                        </select>
                                    </div>
                                </div>
                            </section>
                        )}

                        {currentStep === 6 && (
                            <section className="form-section">
                                <h2>6. Treatment & Department</h2>
                                <div className="form-grid">
                                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label>Treatment <span className="required-star">*</span></label>
                                        <select
                                            name="treatment"
                                            value={selectedSurgeryType}
                                            onChange={handleSurgeryTypeSelect}
                                        >
                                            <option value="">Select surgery type</option>
                                            {surgerytypes
                                                .filter((type) => !formData.treatment.includes(type._id))
                                                .map((type) => (
                                                    <option key={type._id} value={type._id}>
                                                        {type.surgerytypename}
                                                    </option>
                                                ))}
                                        </select>
                                        {Array.isArray(formData.treatment) && formData.treatment.length > 0 && (
                                            <div className="array-field-list" style={{ marginTop: '12px' }}>
                                                {formData.treatment.map((typeId) => (
                                                    <div key={typeId} className="array-field-item interest-item">
                                                        <input type="text" value={getSurgeryTypeName(typeId)} readOnly />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeSurgeryType(typeId)}
                                                            className="array-item-remove btn btn-danger"
                                                        >
                                                            <FaRegTrashCan />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label>Hospital Registration Certificate <span className="required-star">*</span></label>
                                        <input type="file" name="hospitalregistrationcertificate" onChange={handleFileChange} />
                                        {formData.hospitalregistrationcertificate && <span className="selected-filename">{getDisplayValue(formData.hospitalregistrationcertificate)}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>NABH Accreditation <span className="required-star">*</span></label>
                                        <select name="nabhaccreditation" value={formData.nabhaccreditation} onChange={handleInputChange}>
                                            <option value="">Select</option>
                                            <option value="Yes">Yes</option>
                                            <option value="No">No</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>NABH Number <span className="required-star">*</span></label>
                                        <input type="text" name="nabhnumber" value={formData.nabhnumber} onChange={handleInputChange} placeholder="Enter NABH number" />
                                    </div>
                                    <div className="form-group">
                                        <label>NABH Certificate <span className="required-star">*</span></label>
                                        <input type="file" name="nabhcertificate" onChange={handleFileChange} />
                                        {formData.nabhcertificate && <span className="selected-filename">{getDisplayValue(formData.nabhcertificate)}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>GST Certificate <span className="required-star">*</span></label>
                                        <input type="file" name="gstcertificate" onChange={handleFileChange} />
                                        {formData.gstcertificate && <span className="selected-filename">{getDisplayValue(formData.gstcertificate)}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>PAN Copy <span className="required-star">*</span></label>
                                        <input type="file" name="pancopy" onChange={handleFileChange} />
                                        {formData.pancopy && <span className="selected-filename">{getDisplayValue(formData.pancopy)}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Authorized Signatory ID Proof <span className="required-star">*</span></label>
                                        <input type="file" name="authorizedsignatoryidproof" onChange={handleFileChange} />
                                        {formData.authorizedsignatoryidproof && <span className="selected-filename">{getDisplayValue(formData.authorizedsignatoryidproof)}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Password <span className="required-star">*</span></label>
                                        <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Confirm password" />
                                    </div>
                                </div>
                            </section>
                        )}

                        <div className="step-navigation">
                            {currentStep > 1 && (
                                <button type="button" className="prev-btn" onClick={handlePrevStep} disabled={loading}>
                                    Back
                                </button>
                            )}
                            <button type="submit" className="next-btn" disabled={loading}>
                                {loading ? (currentStep === 1 ? 'Submitting...' : currentStep === 2 ? 'Verifying OTP...' : 'Submitting...') : currentStep === 1 ? 'Submit & Continue' : currentStep === 2 ? 'Verify OTP' : currentStep === 6 ? 'Finish Registration' : 'Next Step'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <FooterBar />
        </>
    );
};

export default HospitalRegister;