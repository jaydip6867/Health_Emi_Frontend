import React, { useState, useEffect } from 'react';
import { Col } from 'react-bootstrap';
import { NavLink, useNavigate } from 'react-router-dom';
import { GiHamburgerMenu } from 'react-icons/gi';
import { Button } from 'react-bootstrap';
import { FiActivity, FiCalendar, FiDollarSign, FiFilePlus, FiLayout, FiLogOut, FiMessageSquare, FiSettings, FiTruck, FiXCircle } from "react-icons/fi";
import { IoCalendarOutline } from "react-icons/io5";
import { TbRosetteDiscountCheckFilled } from "react-icons/tb";
import { isPast } from 'date-fns';
import { Form } from 'react-bootstrap';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { API_BASE_URL, SECRET_KEY, STORAGE_KEYS } from '../config';

const DoctorSidebar = ({ doctor }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isAvailable, setIsAvailable] = useState(false);
    const [token, setToken] = useState(null);
    const [profile, setProfile] = useState(null);
    const navigate = useNavigate();

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.DOCTOR);
            if (stored) {
                const bytes = CryptoJS.AES.decrypt(stored, SECRET_KEY);
                const decrypted = bytes.toString(CryptoJS.enc.Utf8);
                if (decrypted) {
                    const obj = JSON.parse(decrypted);
                    if (obj && obj.accessToken) {
                        const t = `Bearer ${obj.accessToken}`;
                        setToken(t);
                        // Fetch profile on sidebar load
                        axios({
                            method: 'get',
                            url: `${API_BASE_URL}/doctor/profile`,
                            headers: { Authorization: t }
                        }).then((res) => {
                            const data = res?.data?.Data || null;
                            setProfile(data);
                            setIsAvailable(Boolean(data?.is_available));
                        }).catch(() => {
                            // silently ignore for sidebar
                        });
                    }
                }
            }
        } catch (e) {}
    }, []);

    const handleAvailabilityChange = async (e) => {
        const next = e.target.checked;
        setIsAvailable(next);
        if (!token || !profile) return;
        try {
            const payload = { ...profile, is_available: next };
            if (!payload.password) delete payload.password;
            if ('available' in payload) delete payload.available;
            await axios({
                method: 'post',
                url: `${API_BASE_URL}/doctor/profile/edit`,
                headers: { Authorization: token },
                data: payload,
            });
            // update local cached profile and storage
            setProfile((prev) => (prev ? { ...prev, is_available: next } : prev));
            try {
                const stored = localStorage.getItem(STORAGE_KEYS.DOCTOR);
                if (stored) {
                    const bytes = CryptoJS.AES.decrypt(stored, SECRET_KEY);
                    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
                    if (decrypted) {
                        const obj = JSON.parse(decrypted);
                        if (obj && obj.doctorData) {
                            obj.doctorData.is_available = next;
                            const cipher = CryptoJS.AES.encrypt(JSON.stringify(obj), SECRET_KEY).toString();
                            localStorage.setItem(STORAGE_KEYS.DOCTOR, cipher);
                        }
                    }
                }
            } catch (err) {}
        } catch (err) {
            // revert UI on failure
            setIsAvailable(!next);
        }
    };

    return (
        <>
            {/* Toggle Button */}
            <div className="d-lg-none p-2 bg-light shadow-sm">
                <button className="btn btn-outline-secondary" onClick={toggleSidebar}>
                    <GiHamburgerMenu />
                </button>
            </div>

            {/* Sidebar */}
            <Col xs={12} sm={4} md={3} className={`sidebar-wrapper ${isOpen ? 'open blackarea' : 'min-vh-100'} d-none d-md-block d-sm-block position-sticky top-0 mt-3`} >
                <div className="bg-white rounded sidebar-inner position-relative">
                    <div className={`${isOpen ? 'd-block position-absolute top-0 end-0 z-3 p-2' : 'd-none'}`}><FiXCircle style={{color:'white'}} onClick={toggleSidebar}/></div>
                    <div>
                        <div className='patient_profile'>
                            <img src={doctor?.profile_pic || require('../Visitor/assets/profile_icon_img.png')} alt={`${doctor?.name} profile`} />
                        </div>
                        <div className='text-center py-3 align-items-center d-flex flex-column gap-2'>
                            <div className='d-flex align-items-center gap-2 mb-2'>
                                {isAvailable === true ? (
                                    <span className='apt_complete_btn small'>Available</span>
                                ) : (
                                    <span className='apt_dark_btn small'>Not Available</span>
                                )}
                                <Form.Check 
                                    type="switch"
                                    id="availability-toggle"
                                    checked={isAvailable || false}
                                    onChange={handleAvailabilityChange}
                                    className="ms-2"
                                />
                            </div>
                            <div>
                                <h5 style={{ color: 'var(--grayscale-color-800)' }}>Dr. {doctor?.name} <TbRosetteDiscountCheckFilled fill='#0E9384'/></h5>
                                <p className='m-0' style={{ color: '#0E9384' }}>{doctor?.specialty} Psychologist</p>
                            </div>
                        </div>

                        <div className="sidebar_nav mt-3 px-3">
                            <NavLink to={'/doctor/doctordashboard'} className={({ isActive }) => (isActive ? 'active' : '')}>
                                <FiLayout /> Dashboard
                            </NavLink>
                            <NavLink to={'/doctor/doctorappointment'} className={({ isActive }) => (isActive ? 'active' : '')}>
                                <IoCalendarOutline /> Consultant Appointment
                            </NavLink>
                            <NavLink to={'/doctor/doctorsurgeryappointment'} className={({ isActive }) => (isActive ? 'active' : '')}>
                                <IoCalendarOutline /> Surgery Appointment
                            </NavLink>
                            <NavLink to={'/doctor/doctorsurgery'} className={({ isActive }) => (isActive ? 'active' : '')}>
                                <FiActivity /> My Surgery
                            </NavLink>
                            <NavLink to={'/doctor/doctorblog'} className={({ isActive }) => (isActive ? 'active' : '')}>
                                <FiFilePlus /> Blog
                            </NavLink>
                            <NavLink to={'/doctor/doctorconsultation'} className={({ isActive }) => (isActive ? 'active' : '')}>
                                <FiDollarSign /> Consultation
                            </NavLink>
                            <NavLink to={'/doctor/doctorreviews'} className={({ isActive }) => (isActive ? 'active' : '')}>
                                <FiMessageSquare /> Reviews
                            </NavLink>
                            <NavLink to={'/doctor/calender'} className={({ isActive }) => (isActive ? 'active' : '')}>
                                <FiCalendar /> Calendar
                            </NavLink>
                            <NavLink to={'/doctor/ambulance-request'} className={({ isActive }) => (isActive ? 'active' : '')}>
                                <FiTruck /> Ambulance Booking
                            </NavLink>
                            <NavLink to={'/doctor/ambulance-history'} className={({ isActive }) => (isActive ? 'active' : '')}>
                                <FiTruck /> Ambulance History
                            </NavLink>
                            <NavLink to={'/doctor/doctorprofile'} className={({ isActive }) => (isActive ? 'active' : '')}>
                                <FiSettings />Settings
                            </NavLink>
                        </div>
                    </div>
                    <div className='mx-2'>
                        <Button className='w-100 logout-btn' onClick={() => (localStorage.removeItem('healthdoctor'), navigate('/doctor'))}><FiLogOut size={20} /> Logout</Button>

                    </div>
                </div>
            </Col>
        </>
    );
};

export default DoctorSidebar;
