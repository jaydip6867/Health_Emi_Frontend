import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoChatbubblesSharp, IoCloseOutline, IoSendSharp } from 'react-icons/io5';
import { FaListUl } from 'react-icons/fa';
import CryptoJS from 'crypto-js';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { API_BASE_URL, SECRET_KEY, STORAGE_KEYS } from '../config';
import {
  loadChatbotContext,
  generateDemoReply,
  buildHealthBotSystemPrompt,
  buildUserContextBlock,
} from '../chatbot/chatbotContext';
import './ChatBot.css';

const APPOINTMENT_TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
  '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM'
];

function normalizeTimeSlot(time) {
  if (!time || typeof time !== 'string') return '';
  const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return time.trim();
  const h = parseInt(match[1], 10);
  const m = match[2];
  const ampm = match[3].toUpperCase();
  return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
}

function parseDmY(dateStr) {
  const [dd, mm, yyyy] = dateStr.split('-');
  return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
}

function formatDmYFromDate(date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

function isSameCalendarDay(d1, d2) {
  if (!d1 || !d2) return false;
  return d1.getFullYear() === d2.getFullYear()
    && d1.getMonth() === d2.getMonth()
    && d1.getDate() === d2.getDate();
}

function isSlotInFutureForDate(slotTime, dateStr) {
  if (!dateStr) return true;
  const selectedDate = parseDmY(dateStr);
  if (!isSameCalendarDay(selectedDate, new Date())) return true;

  const [time, meridiem] = slotTime.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  hours = (hours % 12) + (meridiem === 'PM' ? 12 : 0);
  const slotDateTime = new Date(selectedDate);
  slotDateTime.setHours(hours, minutes, 0, 0);
  return slotDateTime.getTime() > Date.now();
}

function getAvailableTimeSlots(bookedSlots, dateStr) {
  const bookedSet = new Set((bookedSlots || []).map(normalizeTimeSlot));
  return APPOINTMENT_TIME_SLOTS.filter((slot) => {
    if (bookedSet.has(normalizeTimeSlot(slot))) return false;
    return isSlotInFutureForDate(slot, dateStr);
  });
}

async function fetchDoctorBlockedDates(doctorId) {
  if (!doctorId) return [];
  try {
    const res = await fetch(`${API_BASE_URL}/user/appointments/doctorblockeddates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doctorid: doctorId })
    });
    const data = await res.json();
    if ((res.ok || data.Status === 200 || data.IsSuccess) && Array.isArray(data.Data)) {
      return data.Data;
    }
  } catch (err) {
    console.error('Failed to fetch doctor blocked dates', err);
  }
  return [];
}

async function fetchBookedSlotsForDoctor(doctorId, dateVal) {
  if (!doctorId || !dateVal) return [];
  try {
    const res = await fetch(`${API_BASE_URL}/user/appointments/bookedslots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doctorid: doctorId, date: dateVal })
    });
    const data = await res.json();
    if ((res.ok || data.Status === 200 || data.IsSuccess) && Array.isArray(data.Data)) {
      return data.Data.map(normalizeTimeSlot);
    }
  } catch (err) {
    console.error('Failed to fetch booked slots', err);
  }
  return [];
}

function isDateBlockedForDoctor(dateStr, blockedDates) {
  return (blockedDates || []).includes(dateStr);
}

// Interactive subcomponent to render Hospitals and Doctors in horizontal card grids
function HospitalDoctorCards({ hospitals, doctors, onNavigate, defaultTab = 'doctors' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="chatbot-cards-message-container">
      <div className="chatbot-cards-tabs">
        <button 
          className={`chatbot-tab-btn ${activeTab === 'doctors' ? 'active' : ''}`}
          onClick={() => setActiveTab('doctors')}
        >
          Doctors ({doctors.length})
        </button>
        <button 
          className={`chatbot-tab-btn ${activeTab === 'hospitals' ? 'active' : ''}`}
          onClick={() => setActiveTab('hospitals')}
        >
          Hospitals ({hospitals.length})
        </button>
      </div>

      <div className="chatbot-cards-scroller" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 4px', maxHeight: '400px', overflowY: 'auto', overflowX: 'hidden' }}>
        {activeTab === 'doctors' ? (
          doctors.length === 0 ? (
            <div className="chatbot-no-cards">No doctors found</div>
          ) : (
            doctors.map((doc, idx) => (
              <div key={idx} className="chatbot-card doctor-card" style={{ width: '100%', minWidth: 'unset', maxWidth: '100%', margin: '0', flex: 'none', height: 'auto' }}>
                <img 
                  src={doc.profile_pic || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200'} 
                  alt={doc.name} 
                  className="chatbot-card-img"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200';
                  }}
                />
                <div className="chatbot-card-body">
                  <div className="chatbot-card-rating">
                    ★ {doc.averageRating === 0 ? '0' : (doc.averageRating || '0')}
                  </div>
                  <h6 className="chatbot-card-title">Dr. {doc.name}</h6>
                  <p className="chatbot-card-subtitle">{doc.specialty || 'Specialist'}</p>
                  <p className="chatbot-card-location">{doc.city}, {doc.state}</p>
                  <div className="chatbot-card-footer">
                    <span className="chatbot-card-fee">₹{doc.consultationsDetails?.clinic_visit_price || '-'}</span>
                    <button 
                      className="chatbot-card-btn"
                      onClick={() => onNavigate(`/doctorprofile/${encodeURIComponent(btoa(doc._id))}`)}
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))
          )
        ) : (
          hospitals.length === 0 ? (
            <div className="chatbot-no-cards">No hospitals found</div>
          ) : (
            hospitals.map((hosp, idx) => (
              <div key={idx} className="chatbot-card doctor-card" style={{ width: '100%', minWidth: 'unset', maxWidth: '100%', margin: '0', flex: 'none', height: 'auto' }}>
                <img 
                  src="https://images.unsplash.com/photo-1587351021759-3e566d6af7bf?auto=format&fit=crop&q=80&w=200" 
                  alt={hosp.name} 
                  className="chatbot-card-img"
                />
                <div className="chatbot-card-body">
                  <div className="chatbot-card-rating">
                    ★ 4.5
                  </div>
                  <h6 className="chatbot-card-title">{hosp.name}</h6>
                  <p className="chatbot-card-subtitle">Multi-Specialty Hospital</p>
                  <p className="chatbot-card-location">{hosp.city}, {hosp.state}</p>
                  <div className="chatbot-card-footer">
                    <span className="chatbot-card-fee" style={{ fontSize: '11px' }}>Open 24/7</span>
                    <button 
                      className="chatbot-card-btn"
                      onClick={() => onNavigate(`/hospital-doctors/${hosp.name}`)}
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}

function DoctorVerticalCards({ doctors, onNavigate }) {
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');

  // Extract unique specialties from the doctors array
  const specialties = ['All', ...new Set(doctors.map(doc => doc.specialty || doc.specialization || 'Specialist').filter(Boolean))];

  // Filter doctors based on the selected specialty
  const filteredDoctors = selectedSpecialty === 'All' 
    ? doctors 
    : doctors.filter(doc => (doc.specialty || doc.specialization || 'Specialist') === selectedSpecialty);

  return (
    <div className="chatbot-cards-message-container" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 4px', maxHeight: '400px' }}>
      
      {/* Specialty Filter Row */}
      {specialties.length > 1 && (
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', flexShrink: 0 }}>
          {specialties.map(spec => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(spec)}
              style={{
                padding: '4px 12px',
                borderRadius: '16px',
                border: `1px solid ${selectedSpecialty === spec ? '#2563eb' : '#cbd5e1'}`,
                backgroundColor: selectedSpecialty === spec ? '#2563eb' : '#f8fafc',
                color: selectedSpecialty === spec ? '#ffffff' : '#334155',
                fontSize: '12px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {spec}
            </button>
          ))}
        </div>
      )}

      {/* Scrollable Doctors List */}
      <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px' }}>
        {filteredDoctors.length === 0 ? (
          <div className="chatbot-no-cards">No doctors found.</div>
        ) : (
          filteredDoctors.map((doc, idx) => (
            <div key={idx} className="chatbot-card doctor-card" style={{ width: '100%', minWidth: 'unset', maxWidth: '100%', margin: '0', flex: 'none', height: 'auto' }}>
              <img 
                src={doc.profile_pic || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200'} 
                alt={doc.name} 
                className="chatbot-card-img"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200';
                }}
              />
              <div className="chatbot-card-body">
                <div className="chatbot-card-rating">
                  ★ {doc.averageRating === 0 ? '0' : (doc.averageRating || '0')}
                </div>
                <h6 className="chatbot-card-title">Dr. {doc.name}</h6>
                <p className="chatbot-card-subtitle">{doc.specialty || doc.specialization || 'Specialist'}</p>
                <p className="chatbot-card-location">{doc.city}, {doc.state}</p>
                <div className="chatbot-card-footer">
                  <span className="chatbot-card-fee">₹{doc.consultationsDetails?.clinic_visit_price || '-'}</span>
                  <button 
                    className="chatbot-card-btn"
                    onClick={() => onNavigate(`/doctorprofile/${encodeURIComponent(btoa(doc._id))}`)}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Geocodes address text - uses Nominatim (free, no API key) first, then Google Maps as fallback
const geocodeAddress = async (addressText) => {
  // Try Nominatim (OpenStreetMap) first - no API key needed
  try {
    const encoded = encodeURIComponent(addressText + ', India');
    const nominatimRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&countrycodes=in&limit=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (nominatimRes.ok) {
      const nominatimData = await nominatimRes.json();
      if (nominatimData && nominatimData.length > 0) {
        const result = nominatimData[0];
        return {
          lat: parseFloat(parseFloat(result.lat).toFixed(6)),
          lng: parseFloat(parseFloat(result.lon).toFixed(6)),
          address: result.display_name || addressText
        };
      }
    }
  } catch (nominatimErr) {
    console.warn('Nominatim geocoding failed, trying Google Maps:', nominatimErr);
  }

  // Fallback to Google Maps Geocoder if available
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.maps) {
      // No geocoder available — reject so caller can show user a friendly retry message
      reject(new Error('Could not locate this address. Please check the address and try again.'));
      return;
    }
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: addressText, componentRestrictions: { country: "in" } }, (results, status) => {
      if (status === "OK" && results[0]) {
        resolve({
          lat: parseFloat(results[0].geometry.location.lat().toFixed(6)),
          lng: parseFloat(results[0].geometry.location.lng().toFixed(6)),
          address: results[0].formatted_address
        });
      } else {
        reject(new Error('Address not found. Please provide a more specific address (e.g., hospital name + city).'));
      }
    });
  });
};

// Calculates distance in km using Haversine formula
const haversineKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
};

function AmbulanceVehicleSelect({ bookingState, onSelect }) {
  const prices = bookingState.vehiclePrices;
  const options = [
    { type: 'Ambulance', cat: 'Basic', label: 'Ambulance (Basic)', price: prices.AmbulanceBasic, desc: 'For standard patients' },
    { type: 'Ambulance', cat: 'Advance', label: 'Ambulance (Advance)', price: prices.AmbulanceAdvance, desc: 'With ICU / Oxygen facilities' },
    { type: 'Cab', cat: 'Basic', label: 'Medical Cab', price: prices.Cab, desc: 'For stable ambulatory patients' },
    { type: 'Rickshaw', cat: 'Basic', label: 'Auto Rickshaw', price: prices.Rickshaw, desc: 'Quick local transit' },
    { type: 'Bike', cat: 'Basic', label: 'First Responder Bike', price: prices.Bike, desc: 'Emergency response' },
  ];

  return (
    <div className="chatbot-vehicle-select-container">
      <div className="chatbot-vehicle-header">
        Select Vehicle Type ({bookingState.distance} km)
      </div>
      <div className="chatbot-vehicle-options">
        {options.map((opt, i) => (
          <div key={i} className="chatbot-vehicle-option-card" onClick={() => onSelect(opt)}>
            <div className="chatbot-vehicle-info">
              <span className="chatbot-vehicle-name">{opt.label}</span>
              <span className="chatbot-vehicle-desc">{opt.desc}</span>
            </div>
            <div className="chatbot-vehicle-price-col">
              <span className="chatbot-vehicle-price">₹{opt.price}</span>
              <span className="chatbot-vehicle-select-btn">Select</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AmbulanceBookingConfirm({ bookingState, onConfirm, onCancel }) {
  return (
    <div className="chatbot-confirm-card">
      <h6 className="chatbot-confirm-title">Confirm Booking</h6>
      <div className="chatbot-confirm-details">
        <p><strong>Passenger:</strong> {bookingState.name}</p>
        <p><strong>Mobile:</strong> {bookingState.mobile}</p>
        <p><strong>From:</strong> {bookingState.pickupaddress}</p>
        <p><strong>To:</strong> {bookingState.dropaddress}</p>
        <p><strong>Vehicle:</strong> {bookingState.selectedVehicle === 'Ambulance' ? `Ambulance (${bookingState.selectedCategory})` : bookingState.selectedVehicle}</p>
        <p><strong>Distance:</strong> {bookingState.distance} Km</p>
        <p className="chatbot-confirm-price"><strong>Total Fare:</strong> ₹{bookingState.selectedPrice}</p>
      </div>
      <div className="chatbot-confirm-actions">
        <button className="chatbot-confirm-btn confirm" onClick={onConfirm}>Confirm & Book</button>
        <button className="chatbot-confirm-btn cancel" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}


function AppointmentBookingConfirm({ aptState, onConfirm, onCancel }) {
  return (
    <div className="chatbot-confirm-card">
      <h6 className="chatbot-confirm-title">Confirm Appointment</h6>
      <div className="chatbot-confirm-details">
        <p><strong>Doctor:</strong> {aptState.doctor?.name}</p>
        <p><strong>Specialty:</strong> {aptState.doctor?.specialization}</p>
        <p><strong>Type:</strong> {aptState.visit_type === 'clinic_visit' ? 'Clinic Visit' : 'E-OPD'}</p>
        <p><strong>Date:</strong> {aptState.date}</p>
        <p><strong>Time Slot:</strong> {aptState.timeSlot}</p>
        {aptState.visit_type === 'clinic_visit' && <p><strong>Hospital:</strong> {aptState.hospital}</p>}
        {aptState.reason && <p><strong>Reason:</strong> {aptState.reason}</p>}
      </div>
      <div className="chatbot-confirm-actions">
        <button className="chatbot-confirm-btn confirm" onClick={onConfirm}>Confirm & Book</button>
        <button className="chatbot-confirm-btn cancel" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function SurgeryBookingConfirm({ surgState, onConfirm, onCancel }) {
  return (
    <div className="chatbot-confirm-card">
      <h6 className="chatbot-confirm-title">Confirm Surgery Booking</h6>
      <div className="chatbot-confirm-details">
        <p><strong>Doctor:</strong> {surgState.doctor?.name}</p>
        <p><strong>Surgery:</strong> {surgState.surgery?.name || surgState.surgery?.surgerytypeid?.surgerytypename}</p>
        <p><strong>Room Type:</strong> {surgState.roomType}</p>
        <p><strong>Hospital:</strong> {surgState.hospital}</p>
        <p><strong>Date:</strong> {surgState.date}</p>
        <p><strong>Time Slot:</strong> {surgState.timeSlot}</p>
      </div>
      <div className="chatbot-confirm-actions">
        <button className="chatbot-confirm-btn confirm" onClick={onConfirm}>Confirm & Pay 15%</button>
        <button className="chatbot-confirm-btn cancel" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function DoctorChips({ doctors, onSelect }) {
  return (
    <div className="chatbot-doctor-chips-container">
      <div className="chatbot-chips-scroll">
        {doctors.map((doc, idx) => {
          let profilePic = doc.profile_pic;
          if (profilePic && !profilePic.startsWith('http')) {
            profilePic = `${API_BASE_URL}${profilePic.startsWith('/') ? '' : '/'}${profilePic}`;
          }
          if (!profilePic) {
            profilePic = 'https://via.placeholder.com/40';
          }

          return (
            <button 
              key={idx} 
              className="chatbot-doctor-chip"
              onClick={() => onSelect(doc)}
            >
              <img src={profilePic} alt={doc.name} className="chatbot-chip-img" />
              <div className="chatbot-chip-info">
                <span className="chatbot-chip-name">{doc.name}</span>
                <span className="chatbot-chip-spec">{doc.specialty || doc.specialization || 'Doctor'}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function OptionChips({ options, onSelect }) {
  return (
    <div className="chatbot-doctor-chips-container" style={{ marginTop: '8px' }}>
      <div className="chatbot-chips-scroll" style={{ padding: '4px 0' }}>
        {options.map((opt, idx) => (
          <button 
            key={idx} 
            onClick={() => onSelect(opt)}
            style={{ 
              margin: '0 4px', 
              padding: '6px 14px', 
              borderRadius: '20px', 
              border: '1px solid #cbd5e1', 
              backgroundColor: '#f8fafc', 
              color: '#334155', 
              fontSize: '13px', 
              cursor: 'pointer', 
              whiteSpace: 'nowrap' 
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function DatePickerWidget({ onSelect, doctorId, minBookingDate }) {
  const [date, setDate] = useState(null);
  const [excludeDates, setExcludeDates] = useState([]);

  useEffect(() => {
    if (!doctorId) {
      setExcludeDates([]);
      return;
    }
    fetchDoctorBlockedDates(doctorId).then((blocked) => {
      const excluded = blocked
        .map((d) => parseDmY(d))
        .filter((d) => !isNaN(d.getTime()));
      setExcludeDates(excluded);
    });
  }, [doctorId]);

  const minDate = minBookingDate || new Date();

  return (
    <div className="chatbot-date-picker" style={{ padding: '10px', backgroundColor: '#f0f4f8', borderRadius: '8px', marginTop: '10px' }}>
      <div className="custom-datepicker-container w-100 mb-2">
        <DatePicker
          selected={date}
          onChange={d => setDate(d)}
          inline
          minDate={minDate}
          excludeDates={excludeDates}
          calendarClassName="custom-calendar"
          style={{ width: '100%' }}
        />
      </div>
      <button 
        className="chatbot-submit-btn" 
        style={{ width: '100%', padding: '8px', backgroundColor: '#2196f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        onClick={() => {
          if (!date) return;
          onSelect(formatDmYFromDate(date));
        }}
      >
        Confirm Date
      </button>
    </div>
  );
}

function EmiDocUploadWidget({ documentType, isPDF, onUploadSuccess, onNext, currentValue, skippable }) {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(currentValue || '');

  const handleSkip = () => {
    const placeholder = 'https://placehold.co/600x400/eeeeee/888888?text=Not+Available';
    setPreview(placeholder);
    onUploadSuccess(placeholder);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    if (isPDF) {
      if (file.type !== 'application/pdf') {
        setError('Please upload a PDF document.');
        return;
      }
    } else {
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file (PNG/JPG).');
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/user/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed. Please try again.');
      }

      const resData = await response.json();
      if (resData.Status === 200 && resData.Data?.url) {
        setPreview(resData.Data.url);
        onUploadSuccess(resData.Data.url);
      } else {
        throw new Error(resData.Message || 'Upload failed');
      }
    } catch (err) {
      setError(err.message || 'Error uploading file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="emi-upload-widget">
      <div 
        className={`emi-dropzone ${dragActive ? 'active' : ''} ${preview ? 'has-file' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        {loading ? (
          <div className="emi-upload-loading">
            <span className="emi-spinner"></span>
            Uploading {documentType}...
          </div>
        ) : preview ? (
          <div className="emi-upload-preview">
            {isPDF ? (
              <div className="emi-pdf-preview">
                <span className="emi-file-icon">📄</span>
                <span className="emi-file-name">{documentType} Uploaded (PDF)</span>
              </div>
            ) : (
              <img src={preview} alt={documentType} className="emi-img-preview" />
            )}
            <button className="emi-reupload-btn" onClick={() => { setPreview(''); onUploadSuccess(''); }}>
              Change File
            </button>
          </div>
        ) : (
          <div className="emi-upload-prompt">
            <span className="emi-upload-icon">📤</span>
            <p>Drag & Drop your <strong>{documentType}</strong> here or</p>
            <label className="emi-select-btn">
              Browse File
              <input 
                type="file" 
                accept={isPDF ? '.pdf' : 'image/*'} 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
              />
            </label>
          </div>
        )}
      </div>
      {error && <div className="emi-upload-error">{error}</div>}
      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        {preview && (
          <button className="emi-next-step-btn" onClick={onNext} style={{ flex: 1, marginTop: 0 }}>
            Next Step →
          </button>
        )}
        {skippable && !preview && (
          <button className="emi-skip-btn" onClick={handleSkip} style={{ flex: 1, padding: '10px', background: '#e0e0e0', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>
            Skip (Not Available)
          </button>
        )}
      </div>
    </div>
  );
}

function EmiApplicationSummary({ application, onConfirm, onCancel }) {
  return (
    <div className="emi-summary-card">
      <div className="emi-summary-header">
        <h4>📋 EMI Application Summary</h4>
      </div>
      <div className="emi-summary-body" style={{ maxHeight: '300px', overflowY: 'auto' }}>
        <div className="emi-summary-item"><strong>Applicant:</strong> <span>{application.full_name}</span></div>
        <div className="emi-summary-item"><strong>Marital Status:</strong> <span>{application.marital_status}</span></div>
        <div className="emi-summary-item"><strong>DOB:</strong> <span>{application.dob}</span></div>
        <div className="emi-summary-item"><strong>PAN No:</strong> <span>{application.pan_no}</span></div>
        <div className="emi-summary-item"><strong>Aadhaar No:</strong> <span>{application.aadhar_no}</span></div>
        <div className="emi-summary-item"><strong>Pincode:</strong> <span>{application.pincode}</span></div>
        <div className="emi-summary-item"><strong>Employment:</strong> <span>{application.employment_type}</span></div>
        <div className="emi-summary-item"><strong>Monthly Income:</strong> <span>₹{application.monthly_income}</span></div>
        <div className="emi-summary-item"><strong>Hospital Name:</strong> <span>{application.hospital_name}</span></div>
        <div className="emi-summary-item"><strong>NABH Status:</strong> <span>{application.nabh_status}</span></div>
        <div className="emi-summary-item"><strong>Patient Name:</strong> <span>{application.patient_name}</span></div>
        <div className="emi-summary-item"><strong>Relationship Proof:</strong> <span>{application.relationship_proof ? 'Uploaded ✅' : 'Missing ❌'}</span></div>
        <div className="emi-summary-item"><strong>Treatment Type:</strong> <span>{application.treatment_type}</span></div>
        <div className="emi-summary-item"><strong>Est. Amount:</strong> <span>₹{application.estimated_amount}</span></div>
        <div className="emi-summary-item"><strong>Quotation:</strong> <span>{application.hospital_quotation ? (application.hospital_quotation.includes('placehold.co') ? 'Skipped ⏭️' : 'Uploaded ✅') : 'Missing ❌'}</span></div>
        <div className="emi-summary-item"><strong>Prescription:</strong> <span>{application.prescription ? (application.prescription.includes('placehold.co') ? 'Skipped ⏭️' : 'Uploaded ✅') : 'Missing ❌'}</span></div>
        <div className="emi-summary-item"><strong>Insurance Card:</strong> <span>{application.insurance_card ? (application.insurance_card.includes('placehold.co') ? 'Skipped ⏭️' : 'Uploaded ✅') : 'Missing ❌'}</span></div>
        <div className="emi-summary-item"><strong>Aadhaar Card:</strong> <span>{application.aadhaar_card ? 'Uploaded ✅' : 'Missing ❌'}</span></div>
        <div className="emi-summary-item"><strong>PAN Card:</strong> <span>{application.pan_card ? 'Uploaded ✅' : 'Missing ❌'}</span></div>
        <div className="emi-summary-item"><strong>ITR Status:</strong> <span>{application.itr_status}</span></div>
        {application.itr_status === 'yes' && (
          <div className="emi-summary-item"><strong>ITR Document:</strong> <span>{application.itr_file ? 'Uploaded ✅' : 'Missing ❌'}</span></div>
        )}
        <div className="emi-summary-item"><strong>Patient Age:</strong> <span>{application.patient_age}</span></div>
        <div className="emi-summary-item"><strong>Alternate No:</strong> <span>{application.alternate_no}</span></div>
      </div>
      <div className="emi-summary-actions">
        <button className="emi-confirm-btn" onClick={onConfirm}>Confirm & Submit</button>
        <button className="emi-cancel-btn" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function EmiStatusTable({ applications }) {
  if (!Array.isArray(applications) || applications.length === 0) return null;
  return (
    <div className="emi-status-container">
      <div className="emi-status-header">Your Health EMI Application Status</div>
      {applications.map((app, index) => {
        const dateStr = new Date(app.createdAtTimestamps).toLocaleDateString();
        const statusClass = app.status === 'approved' ? 'approved' : app.status === 'rejected' ? 'rejected' : 'pending';
        const statusLabel = app.status === 'approved' ? '✅ Approved' : app.status === 'rejected' ? '❌ Rejected' : '⏳ Pending Review';
        return (
          <div key={index} className="emi-status-card">
            <div className="emi-status-card-header">
              <span className="emi-status-app-number">Application #{index + 1}</span>
              <span className={`emi-status-badge ${statusClass}`}>{statusLabel}</span>
            </div>
            <table className="emi-status-table">
              <tbody>
                <tr>
                  <td className="emi-status-label">Date</td>
                  <td className="emi-status-value">{dateStr}</td>
                </tr>
                <tr>
                  <td className="emi-status-label">Estimate</td>
                  <td className="emi-status-value">₹{app.medical_estimate}</td>
                </tr>
                {app.admin_remarks && (
                  <tr>
                    <td className="emi-status-label">Remarks</td>
                    <td className="emi-status-value">{app.admin_remarks}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

const AVATAR_URL = 'https://api.dicebear.com/7.x/bottts/svg?seed=HealthBot&backgroundColor=0055ff';
const USER_AVATAR_URL = 'https://api.dicebear.com/7.x/initials/svg?seed=User&backgroundColor=888888'; // Placeholder user icon
const CHAT_ICON_GIF = 'https://assets-v2.lottiefiles.com/a/4bf1141e-1167-11ee-8a8b-d7fba4b8c5e1/XuJuDXrePh.gif';

export default function ChatBot() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hi there! 👋 Welcome to Healtheasy EMI. I am HealthBot, your AI assistant. How can I help you today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestionsDrawer, setShowSuggestionsDrawer] = useState(false);
  const [cachedContext, setCachedContext] = useState('');
  const [siteContextPayload, setSiteContextPayload] = useState(null);
  const [contextReady, setContextReady] = useState(false);
  const [contextLoading, setContextLoading] = useState(false);
  const [bookingState, setBookingState] = useState({
    isActive: false,
    step: 0,
    name: '',
    mobile: '',
    pickupaddress: '',
    pickup_latitude: null,
    pickup_longitude: null,
    dropaddress: '',
    drop_latitude: null,
    drop_longitude: null,
    distance: 0,
    vehiclePrices: {},
    platformFee: 0,
    selectedVehicle: '',
    selectedCategory: '',
    selectedPrice: 0,
    isExistingUser: false
  });

  const [aptBookingState, setAptBookingState] = useState({
    isActive: false,
    step: 0,
    doctorsList: [],
    hospitalsList: [],
    specialitiesList: [],
    filteredDoctors: [],
    hospital: '',
    speciality: '',
    doctor: null,
    visit_type: '',
    date: '',
    timeSlot: '',
    reason: '',
    patientname: '',
    mobile: ''
  });

  const [surgBookingState, setSurgBookingState] = useState({
    isActive: false,
    step: 0,
    doctorsList: [],
    hospitalsList: [],
    filteredDoctors: [],
    hospital: '',
    doctor: null,
    surgery: null,
    roomType: '',
    date: '',
    patientname: '',
    mobile: ''
  });
  
  const [uploadState, setUploadState] = useState({
    isActive: false,
    step: 0,
    name: '',
    mobile: '',
    otp: '',
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
    relationship_proof: '',
    treatment_type: '',
    estimated_amount: '',
    hospital_quotation: '',
    prescription: '',
    aadhaar_card: '',
    pan_card: '',
    itr_status: '',
    itr_file: '',
    patient_age: '',
    alternate_no: '',
    isExistingUser: false
  });

  const [statusCheckState, setStatusCheckState] = useState({
    isActive: false,
    step: 0,
    name: '',
    mobile: '',
    isExistingUser: false
  });
  
  const messagesEndRef = useRef(null);
  const [showTooltip, setShowTooltip] = useState(false);

  // 3s delay tooltip on load
  useEffect(() => {
    const tooltipTimeout = setTimeout(() => {
      if (!isOpen) {
        setShowTooltip(true);
        try {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
          audio.volume = 0.15;
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.warn("Autoplay prevented for tooltip sound:", error);
            });
          }
        } catch (e) {
          console.error("Audio playback blocked", e);
        }
      }
    }, 3000);
    return () => clearTimeout(tooltipTimeout);
  }, [isOpen]);

  // Sound on new AI messages only — avoid spamming on rapid state updates
  const lastAiMsgRef = useRef(0);
  useEffect(() => {
    if (messages.length > 1) {
      const lastMsg = messages[messages.length - 1];
      // Only play sound for new AI messages, not user messages or rapid bot sequences
      if (lastMsg && lastMsg.sender === 'ai') {
        const now = Date.now();
        if (now - lastAiMsgRef.current > 800) { // debounce: at most once every 800ms
          lastAiMsgRef.current = now;
          try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
            audio.volume = 0.15;
            const playPromise = audio.play();
            if (playPromise !== undefined) {
              playPromise.catch(error => {
                console.warn("Autoplay prevented for message sound:", error);
              });
            }
          } catch (e) {
            console.error("Audio playback blocked", e);
          }
        }
      }
    }
  }, [messages.length]);

  // Read DeepSeek API Key from environment variables
  const apiKey = process.env.REACT_APP_DEEPSEEK_API_KEY || '';
  const isDemoMode = !apiKey;

  const refreshChatbotContext = async () => {
    setContextLoading(true);
    try {
      const userObj = getUserData();
      const { payload, contextText, systemPrompt } = await loadChatbotContext(userObj);
      setSiteContextPayload(payload);
      setCachedContext(contextText);
      setContextReady(true);
      return { payload, contextText, systemPrompt };
    } catch (e) {
      console.error('Failed to load chatbot context', e);
      setContextReady(false);
      return null;
    } finally {
      setContextLoading(false);
    }
  };

  // Preload live doctors, hospitals, surgeries & blogs for HealthBot
  useEffect(() => {
    refreshChatbotContext();
  }, []);

  useEffect(() => {
    if (isOpen && !contextReady && !contextLoading) {
      refreshChatbotContext();
    }
  }, [isOpen]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setShowTooltip(false);
  };

  const getAuthToken = () => {
    try {
      const getlocaldata = localStorage.getItem(STORAGE_KEYS.PATIENT);
      if (getlocaldata) {
        const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        if (decrypted) {
          const data = JSON.parse(decrypted);
          return `Bearer ${data.accessToken}`;
        }
      }
    } catch (e) {
      console.error('Failed to decrypt token', e);
    }
    return null;
  };

  const fetchHospitalsAndDoctors = async (triggerText = '') => {
    setIsTyping(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/user/doctors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': token } : {})
        },
        body: JSON.stringify({ search: '' })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch doctor list');
      }

      const resData = await response.json();
      const doctorsData = resData.Data?.docs || [];

      const normalize = (str = "") => str.toLowerCase().trim().replace(/\s+/g, " ");
      const uniqueHospitals = [
        ...new Map(
          doctorsData
            .flatMap((d) => d.hospitals || [])
            .map((h) => {
              const key = `${normalize(h.name)}_${normalize(h.city)}`;
              return [key, h];
            })
        ).values(),
      ];

      const defaultTab = triggerText.toLowerCase().includes('hospital') ? 'hospitals' : 'doctors';

      const cardMessage = {
        sender: 'ai',
        type: 'hospital_doctor_cards',
        hospitals: uniqueHospitals.slice(0, 5),
        doctors: doctorsData.slice(0, 5),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        defaultTab
      };

      setMessages(prev => [...prev, cardMessage]);
    } catch (err) {
      console.error('Error fetching cards:', err);
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: 'Sorry, I had trouble retrieving the hospital and doctor list. You can browse them on our site at [Hospitals](/hospitallist) and [Doctors](/doctorfind).',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const fetchDoctorsNearbyAndShowVerticalList = async () => {
    setIsTyping(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/user/doctors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': token } : {})
        },
        body: JSON.stringify({ search: '' })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch doctor list');
      }

      const resData = await response.json();
      const doctorsData = resData.Data?.docs || [];

      const cardMessage = {
        sender: 'ai',
        type: 'doctor_vertical_cards',
        doctors: doctorsData,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, cardMessage]);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: 'Sorry, I had trouble retrieving the doctor list. You can browse them on our site at [Doctors](/doctorfind).',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const startDoctorAppointmentBooking = async () => {
    setIsTyping(true);
    try {
      const token = getAuthToken();
      const userObj = getUserData();
      const response = await fetch(`${API_BASE_URL}/user/doctors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': token } : {})
        },
        body: JSON.stringify({ search: '' })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch doctor list');
      }

      const resData = await response.json();
      const doctorsData = resData.Data?.docs || [];

      // Extract unique hospitals
      const uniqueHospitalsSet = new Set();
      doctorsData.forEach(doc => {
        if (doc.hospitals) {
          doc.hospitals.forEach(h => {
             if (h.name) uniqueHospitalsSet.add(h.name.trim());
          });
        }
      });
      const hospitalsList = Array.from(uniqueHospitalsSet);

      // Pre-fill user details from session so registration steps are skipped
      const isLoggedIn = !!(userObj.token && userObj.name);
      setAptBookingState({
        isActive: true,
        step: 1,
        doctor: null,
        visit_type: '',
        date: '',
        timeSlot: '',
        hospital: '',
        speciality: '',
        reason: '',
        patientname: isLoggedIn ? userObj.name : '',
        mobile: isLoggedIn ? userObj.mobile : '',
        email: '',
        gender: '',
        pincode: '',
        blood_group: '',
        doctorsList: doctorsData,
        hospitalsList: hospitalsList,
        specialitiesList: [],
        filteredDoctors: [],
        bookedSlots: [],
        doctorBlockedDates: [],
        isLoggedInUser: isLoggedIn,
        isExistingUser: false
      });

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Sure! Let's schedule an appointment for you.${isLoggedIn ? ` (Booking as ${userObj.name})` : ''} Please select a nearby hospital from the options below:`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: '⚠️ Failed to load doctor list. Please try again later.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleDoctorChipSelect = (doc) => {
    setAptBookingState(prev => ({
      ...prev,
      doctor: doc,
      step: 4,
      doctorBlockedDates: []
    }));

    fetchDoctorBlockedDates(doc._id).then((dates) => {
      setAptBookingState(prev => (
        prev.doctor?._id === doc._id ? { ...prev, doctorBlockedDates: dates } : prev
      ));
    });

    setMessages(prev => [
      ...prev,
      {
        sender: 'user',
        text: `Doctor: ${doc.name}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      {
        sender: 'ai',
        text: `Selected Doctor: ${doc.name} (${doc.specialty || doc.specialization || 'Doctor'}).\n\nPlease select the consultation type:`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const startSurgeryAppointmentBooking = async () => {
    setMessages(prev => [
      ...prev,
      {
        sender: 'ai',
        text: 'Let\'s book your Surgery Appointment. Fetching available hospitals and doctors...',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setIsTyping(true);

    try {
      const userObj = getUserData();
      const token = userObj.token;
      const response = await fetch(`${API_BASE_URL}/user/doctors`, {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token 
        },
        body: JSON.stringify({})
      });
      const resData = await response.json();

      const allDoctorsData = resData.Data?.docs || [];
      // Filter doctors who offer surgeries
      const doctorsData = allDoctorsData.filter(doc => doc.surgeriesDetails && doc.surgeriesDetails.length > 0);

      if (doctorsData.length === 0) {
        setIsTyping(false);
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: 'No doctors are currently available for surgery appointments.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        return;
      }

      // Extract unique hospitals
      const uniqueHospitalsSet = new Set();
      doctorsData.forEach(doc => {
        if (doc.hospitals) {
          doc.hospitals.forEach(h => {
             if (h.name) uniqueHospitalsSet.add(h.name.trim());
          });
        }
      });
      const hospitalsList = Array.from(uniqueHospitalsSet);

      setSurgBookingState({
        isActive: true,
        step: 1,
        doctorsList: doctorsData,
        hospitalsList: hospitalsList,
        filteredDoctors: [],
        hospital: '',
        doctor: null,
        surgery: null,
        roomType: '',
        date: '',
        timeSlot: '',
        patientname: '',
        mobile: '',
        bookedSlots: [],
        doctorBlockedDates: []
      });

      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: 'Please select a Nearby Hospital:',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (error) {
      console.error('Error fetching surgery doctors', error);
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: 'Sorry, I could not fetch the hospital list right now. Please try again later.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const handleAptBookingStepInput = async (text) => {
    const nextState = { ...aptBookingState };
    
    // Step 1: Select Hospital
    if (nextState.step === 1) {
      const hospitalVal = text.trim();
      nextState.hospital = hospitalVal;
      
      const uniqueSpecialitiesSet = new Set();
      nextState.doctorsList.forEach(doc => {
         const hasHospital = doc.hospitals && doc.hospitals.some(h => h.name && h.name.trim().toLowerCase() === hospitalVal.toLowerCase());
         const spec = doc.specialty || doc.specialization;
         if (hasHospital && spec) {
             uniqueSpecialitiesSet.add(spec.trim());
         }
      });
      nextState.specialitiesList = Array.from(uniqueSpecialitiesSet);
      nextState.step = 2;
      setAptBookingState(nextState);

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Selected Hospital: ${hospitalVal}.\n\nPlease select a speciality:`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      return;
    }

    // Step 2: Select Speciality
    if (nextState.step === 2) {
      const specVal = text.trim();
      nextState.speciality = specVal;
      
      const filtered = nextState.doctorsList.filter(doc => {
         const hasHospital = doc.hospitals && doc.hospitals.some(h => h.name && h.name.trim().toLowerCase() === nextState.hospital.toLowerCase());
         const spec = doc.specialty || doc.specialization;
         const hasSpec = spec && spec.trim().toLowerCase() === specVal.toLowerCase();
         return hasHospital && hasSpec;
      });
      nextState.filteredDoctors = filtered;
      nextState.step = 3;
      setAptBookingState(nextState);

      if (filtered.length === 0) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: `No doctors found for ${specVal} at ${nextState.hospital}. Please select another speciality:`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: `Selected Speciality: ${specVal}.\n\nPlease select a doctor:`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          },
          {
            sender: 'ai',
            type: 'doctor_chips',
            doctors: filtered,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
      return;
    }

    // Step 3: Select Doctor by name input
    if (nextState.step === 3) {
      const query = text.toLowerCase().trim();
      const matchedDoc = nextState.filteredDoctors.find(doc => {
        const spec = doc.specialty || doc.specialization;
        return doc.name.toLowerCase().includes(query) || (spec && spec.toLowerCase().includes(query));
      });

      if (!matchedDoc) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: '⚠️ Could not find a matching doctor. Please select from the suggestion chips or try typing the name again:',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        return;
      }

      nextState.doctor = matchedDoc;
      nextState.step = 4;
      setAptBookingState(nextState);

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Selected Doctor: ${matchedDoc.name} (${matchedDoc.specialty || matchedDoc.specialization || 'Doctor'}).\n\nPlease select the consultation type:`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      return;
    }

    // Step 4: Select Consultation Type
    if (nextState.step === 4) {
      const typeText = text.toLowerCase().trim();
      let visit_type = '';
      if (typeText.includes('clinic')) {
        visit_type = 'clinic_visit';
      } else if (typeText.includes('eopd') || typeText.includes('e-opd') || typeText.includes('online')) {
        visit_type = 'eopd';
        nextState.hospital = 'Online Consultation (E-OPD)';
      } else if (typeText.includes('home')) {
        visit_type = 'home_visit';
        nextState.hospital = 'Home Visit';
      } else {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: '⚠️ Please select a valid option from the buttons below.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        return;
      }

      nextState.visit_type = visit_type;
      nextState.step = 5;
      setAptBookingState(nextState);

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Selected Consultation: ${visit_type === 'clinic_visit' ? 'Clinic Visit' : visit_type === 'home_visit' ? 'Home Visit' : 'E-OPD'}.\n\nPlease choose the Date of your appointment using the calendar below (or click 'Today' / 'Tomorrow'):`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        {
          sender: 'ai',
          type: 'date_picker',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      return;
    }

    // Step 5: Select Date
    if (nextState.step === 5) {
      let dateVal = text.trim();
      const lower = dateVal.toLowerCase();

      if (lower === 'today') {
        const d = new Date();
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        dateVal = `${dd}-${mm}-${yyyy}`;
      } else if (lower === 'tomorrow') {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        dateVal = `${dd}-${mm}-${yyyy}`;
      }

      const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
      if (!dateRegex.test(dateVal)) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: '⚠️ Please enter a valid date in DD-MM-YYYY format (e.g. 25-12-2026):',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        return;
      }

      if (isDateBlockedForDoctor(dateVal, nextState.doctorBlockedDates)) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: '⚠️ The doctor is unavailable on this date due to a scheduled surgery (3-day recovery block). Please choose another date from the calendar.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        return;
      }

      nextState.date = dateVal;

      setIsTyping(true);
      try {
        nextState.bookedSlots = await fetchBookedSlotsForDoctor(nextState.doctor._id, dateVal);
      } finally {
        setIsTyping(false);
      }

      const availableCount = getAvailableTimeSlots(nextState.bookedSlots, dateVal).length;
      if (availableCount === 0) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: `⚠️ No time slots are available on ${dateVal}. Please choose another date.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        return;
      }

      nextState.step = 6;
      setAptBookingState(nextState);

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Selected Date: ${dateVal}.\n\nPlease select an available time slot from the options below:`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      return;
    }

    // Step 6: Select Time Slot
    if (nextState.step === 6) {
      const timeVal = normalizeTimeSlot(text.trim());
      const availableSlots = getAvailableTimeSlots(nextState.bookedSlots, nextState.date);
      if (!availableSlots.includes(timeVal)) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: `⚠️ The time slot ${text.trim()} is not available. Please choose a different slot from the options below.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        return;
      }
      nextState.timeSlot = timeVal;
      nextState.step = 7;
      setAptBookingState(nextState);

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Selected Time: ${timeVal}.\n\nPlease describe the reason for your visit/consultation:`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      return;
    }

    // Step 7: Enter Reason
    if (nextState.step === 7) {
      const reasonVal = text.trim();
      nextState.reason = reasonVal;

      const userObj = getUserData();
      if (userObj.token) {
        nextState.step = 8;
        setAptBookingState(nextState);

        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: 'Perfect! Please verify your appointment details below and click Confirm to schedule:',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          },
          {
            sender: 'ai',
            type: 'appointment_booking_confirm',
            aptState: nextState,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        nextState.step = 11;
        setAptBookingState(nextState);

        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: "⚠️ You must be logged in to book an appointment. Let's create a quick account for you first.\n\nPlease enter your Full Name:",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
      return;
    }

    // Registration Step 11: Name
    if (nextState.step === 11) {
      const nameVal = text.trim();
      nextState.patientname = nameVal;
      nextState.step = 12;
      setAptBookingState(nextState);

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Name: ${nameVal}.\n\nPlease enter your 10-digit mobile number:`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      return;
    }

    // Registration Step 12: Mobile
    if (nextState.step === 12) {
      const mobVal = text.trim().replace(/\D/g, '');
      if (mobVal.length !== 10) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: '⚠️ Please enter a valid 10-digit mobile number:',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        return;
      }

      nextState.mobile = mobVal;
      nextState.step = 13;
      setAptBookingState(nextState);

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Mobile: ${mobVal}.\n\nPlease enter your Email Address:`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      return;
    }

    // Registration Step 13: Email
    if (nextState.step === 13) {
      const emailVal = text.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailVal)) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: '⚠️ Please enter a valid Email Address:',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        return;
      }

      nextState.email = emailVal;
      nextState.step = 14;
      setAptBookingState(nextState);

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Email: ${emailVal}.\n\nPlease select your Gender:`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      return;
    }

    // Registration Step 14: Gender
    if (nextState.step === 14) {
      const genderVal = text.trim();
      nextState.gender = genderVal;
      nextState.step = 15;
      setAptBookingState(nextState);

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Gender: ${genderVal}.\n\nPlease enter your 6-digit Pincode:`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      return;
    }

    // Registration Step 15: Pincode
    if (nextState.step === 15) {
      const pinVal = text.trim().replace(/\D/g, '');
      if (pinVal.length !== 6) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: '⚠️ Please enter a valid 6-digit pincode:',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        return;
      }

      nextState.pincode = pinVal;
      nextState.step = 16;
      setAptBookingState(nextState);

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Pincode: ${pinVal}.\n\nPlease select or enter your Blood Group (e.g. O+, A+, B+, AB+):`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      return;
    }

    // Registration Step 16: Blood Group
    if (nextState.step === 16) {
      const bgVal = text.trim();
      nextState.blood_group = bgVal;
      nextState.step = 17;
      setAptBookingState(nextState);

      setIsTyping(true);
      try {
        const response = await fetch(`${API_BASE_URL}/user/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: nextState.patientname,
            mobile: nextState.mobile,
            email: nextState.email,
            gender: nextState.gender,
            pincode: Number(nextState.pincode),
            blood_group: nextState.blood_group,
            password: 'Welcome@123'
          })
        });

        const resData = await response.json();
        if (response.ok || resData.Status === 200) {
          setMessages(prev => [
            ...prev,
            {
              sender: 'ai',
              text: `Verification OTP has been sent to ${nextState.mobile}. Please enter the 6-digit verification code:`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        } else {
          throw new Error(resData.Message || 'Registration failed');
        }
      } catch (error) {
        console.error(error);
        if (error.message && error.message.toLowerCase().includes('already exist')) {
          try {
            const fpResponse = await fetch(`${API_BASE_URL}/user/forgetpassword`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                mobile: nextState.mobile
              })
            });
            const fpData = await fpResponse.json();
            if (fpResponse.ok || fpData.Status === 200 || fpData.IsSuccess) {
              nextState.isExistingUser = true;
              nextState.step = 17;
              setAptBookingState(nextState);
              setMessages(prev => [
                ...prev,
                {
                  sender: 'ai',
                  text: `An account already exists with this mobile number. We have sent a verification OTP to your mobile. Please enter the 6-digit OTP code to verify and log in:`,
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              ]);
              return;
            }
          } catch (fpErr) {
            console.error('Forget password fallback failed:', fpErr);
          }
        }

        nextState.step = 11;
        setAptBookingState(nextState);
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: `⚠️ Registration failed: ${error.message || 'Server error'}. Let's try again. Please enter your Full Name:`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } finally {
        setIsTyping(false);
      }
      return;
    }

    // Registration Step 17: OTP Verification
    if (nextState.step === 17) {
      const otpVal = text.trim();
      setIsTyping(true);
      try {
        if (nextState.isExistingUser) {
          const verifyResponse = await fetch(`${API_BASE_URL}/user/forgetpassword/verifyotp`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              mobile: nextState.mobile,
              otp: otpVal
            })
          });
          const verifyData = await verifyResponse.json();
          if (!verifyResponse.ok || (verifyData.Status && verifyData.Status !== 200)) {
            throw new Error(verifyData.Message || 'OTP verification failed');
          }

          const setPassResponse = await fetch(`${API_BASE_URL}/user/forgetpassword/setpassword`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              mobile: nextState.mobile,
              password: 'Welcome@123'
            })
          });
          const setPassData = await setPassResponse.json();
          if (!setPassResponse.ok || (setPassData.Status && setPassData.Status !== 200)) {
            throw new Error(setPassData.Message || 'Failed to authenticate after OTP verification');
          }

          const encrypted = CryptoJS.AES.encrypt(JSON.stringify(setPassData.Data), SECRET_KEY).toString();
          localStorage.setItem(STORAGE_KEYS.PATIENT, encrypted);

          nextState.step = 7;
          nextState.isExistingUser = false;
          setAptBookingState(nextState);

          setMessages(prev => [
            ...prev,
            {
              sender: 'ai',
              text: '🎉 Welcome back! Account verified and logged in successfully! Please confirm your appointment details below:',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            },
            {
              sender: 'ai',
              type: 'appointment_booking_confirm',
              aptState: nextState,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        } else {
          const response = await fetch(`${API_BASE_URL}/user/signup/otpverification`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: nextState.email,
              otp: otpVal
            })
          });

          const resData = await response.json();
          if (response.ok || resData.Status === 200) {
            const encrypted = CryptoJS.AES.encrypt(JSON.stringify(resData.Data), SECRET_KEY).toString();
            localStorage.setItem(STORAGE_KEYS.PATIENT, encrypted);

            nextState.step = 7;
            setAptBookingState(nextState);

            setMessages(prev => [
              ...prev,
              {
                sender: 'ai',
                text: '🎉 Account verified and logged in successfully! Please confirm your appointment details below:',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              },
              {
                sender: 'ai',
                type: 'appointment_booking_confirm',
                aptState: nextState,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]);
          } else {
            throw new Error(resData.Message || 'Verification failed');
          }
        }
      } catch (error) {
        console.error(error);
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: `⚠️ Incorrect OTP code. Please enter the valid 6-digit OTP code:`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } finally {
        setIsTyping(false);
      }
      return;
    }
  };

  const handleSaveDoctorAppointment = async () => {
    setIsTyping(true);
    try {
      const userObj = getUserData();
      if (!userObj.token || userObj.token.includes('undefined')) {
        throw new Error('User session not found. Please register/log in.');
      }

      let paymentAmount = 500;
      if (aptBookingState.doctor && aptBookingState.doctor.consultationsDetails) {
        const type = aptBookingState.visit_type;
        const consult = aptBookingState.doctor.consultationsDetails;
        if (type === 'clinic_visit' && consult.clinic_visit_price) {
           paymentAmount = Math.max(1, Math.round(Number(consult.clinic_visit_price) * 0.10));
        } else if (type === 'eopd' && consult.eopd_price) {
           paymentAmount = Math.max(1, Math.round(Number(consult.eopd_price) * 0.10));
        } else if (type === 'home_visit' && consult.home_visit_price) {
           paymentAmount = Math.max(1, Math.round(Number(consult.home_visit_price) * 0.10));
        }
      }

      // Initiate Razorpay payment of 10%
      const orderResponse = await fetch(`${API_BASE_URL}/user/order/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': userObj.token
        },
        body: JSON.stringify({ amount: paymentAmount })
      });

      const orderData = await orderResponse.json();
      if (!orderResponse.ok || !orderData.Data) {
        throw new Error('Failed to initiate payment');
      }

      const options = {
        key: "rzp_live_S0smOweosyTmQ8",
        order_id: orderData.Data.id,
        amount: orderData.Data.amount,
        currency: "INR",
        name: "Health Easy EMI",
        description: "Appointment Booking Fee",
        handler: async function (response) {
          try {
            setIsTyping(true);
            const saveResponse = await fetch(`${API_BASE_URL}/user/appointments/save`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': userObj.token
              },
              body: JSON.stringify({
                patientname: userObj.name || aptBookingState.patientname || 'Patient',
                mobile: userObj.mobile || aptBookingState.mobile,
                alt_mobile: '',
                date: aptBookingState.date,
                time: aptBookingState.timeSlot,
                appointment_reason: aptBookingState.reason,
                doctorid: aptBookingState.doctor._id,
                hospital_name: aptBookingState.hospital,
                visit_types: aptBookingState.visit_type
              })
            });

            const resData = await saveResponse.json();
            if (saveResponse.ok && (resData.Status === 200 || resData.IsSuccess)) {
              setMessages(prev => [
                ...prev,
                {
                  sender: 'ai',
                  text: `🎉 Appointment successfully booked!\n\n👨‍⚕️ Doctor: ${aptBookingState.doctor.name}\n📅 Date: ${aptBookingState.date}\n🕒 Time: ${aptBookingState.timeSlot}\n📍 Location: ${aptBookingState.hospital}\n\nWe have sent a confirmation message to your mobile. Thank you for choosing Healtheasy EMI!`,
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              ]);

              setAptBookingState({
                isActive: false,
                step: 0,
                doctor: null,
                visit_type: '',
                date: '',
                timeSlot: '',
                hospital: '',
                reason: '',
                patientname: '',
                mobile: '',
                email: '',
                gender: '',
                pincode: '',
                blood_group: '',
                doctorsList: [],
                isExistingUser: false
              });
            } else {
              throw new Error(resData.Message || 'Booking request rejected by server');
            }
          } catch (error) {
            console.error(error);
            setMessages(prev => [
              ...prev,
              {
                sender: 'ai',
                text: `⚠️ Appointment booking failed after payment: ${error.message || 'Server error'}. Please contact support.`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]);
          } finally {
            setIsTyping(false);
          }
        },
        prefill: {
          name: userObj.name || aptBookingState.patientname || "",
          contact: userObj.mobile || aptBookingState.mobile || "",
        },
        theme: { color: "#4CAF50" },
        modal: {
          ondismiss() {
            setMessages(prev => [
              ...prev,
              {
                sender: 'ai',
                text: '❌ Payment cancelled. Your appointment was not booked.',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]);
            setIsTyping(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      setIsTyping(false);

    } catch (error) {
      console.error(error);
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `⚠️ Payment initiation failed: ${error.message || 'Server error'}. Please try again later.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }
  };

  const handleCancelDoctorAppointment = () => {
    setMessages(prev => [
      ...prev,
      {
        sender: 'ai',
        text: '❌ Appointment booking cancelled. What else can I help you with?',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setAptBookingState({
      isActive: false,
      step: 0,
      doctor: null,
      visit_type: '',
      date: '',
      timeSlot: '',
      hospital: '',
      reason: '',
      patientname: '',
      mobile: '',
      email: '',
      gender: '',
      pincode: '',
      blood_group: '',
      doctorsList: []
    });
  };

  const getUserData = () => {
    try {
      let localData = localStorage.getItem(STORAGE_KEYS.PATIENT);
      if (localData) {
        const bytes = CryptoJS.AES.decrypt(localData, SECRET_KEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        if (decrypted) {
          const parsed = JSON.parse(decrypted);
          return {
            role: 'patient',
            token: `Bearer ${parsed.accessToken}`,
            name: parsed.userData?.name || parsed.patientData?.name || '',
            mobile: parsed.userData?.mobile || parsed.patientData?.mobile || '',
            apiPrefix: 'user'
          };
        }
      }
      
      localData = localStorage.getItem(STORAGE_KEYS.DOCTOR);
      if (localData) {
        const bytes = CryptoJS.AES.decrypt(localData, SECRET_KEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        if (decrypted) {
          const parsed = JSON.parse(decrypted);
          return {
            role: 'doctor',
            token: `Bearer ${parsed.accessToken}`,
            name: parsed.doctorData?.name || '',
            mobile: parsed.doctorData?.mobile || '',
            apiPrefix: 'doctor'
          };
        }
      }
    } catch (e) {
      console.error('Error reading user data:', e);
    }
    return {
      role: 'patient',
      token: null,
      name: '',
      mobile: '',
      apiPrefix: 'user'
    };
  };

  const fetchAmbulancePrices = async (state) => {
    const userObj = getUserData();
    const prefix = userObj.apiPrefix;
    const token = userObj.token;

    try {
      const response = await fetch(`${API_BASE_URL}/${prefix}/ambulancerequests/getprice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': token } : {})
        },
        body: JSON.stringify({
          pickup_longitude: state.pickup_longitude,
          pickup_latitude: state.pickup_latitude,
          drop_longitude: state.drop_longitude,
          drop_latitude: state.drop_latitude,
          distance: Math.round(state.distance),
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get price from API');
      }

      const resData = await response.json();
      const p = resData.Data || {};
      return {
        prices: {
          AmbulanceBasic: p.ambulance_price || 1000,
          AmbulanceAdvance: p.advance_ambulance_price || 2000,
          Bike: p.bike_price || 500,
          Rickshaw: p.rickshaw_price || 400,
          Cab: p.cab_price || 800
        },
        platformFee: p.platform_fee || 0
      };
    } catch (e) {
      console.error('Error fetching prices, fallback applied:', e);
      return {
        prices: {
          AmbulanceBasic: 1000,
          AmbulanceAdvance: 2000,
          Bike: 500,
          Rickshaw: 400,
          Cab: 800
        },
        platformFee: 0
      };
    }
  };

  // Re-authenticates an existing user via forget-password OTP when token is stale/expired
  const reAuthAmbulanceViaotp = async (mobileNum) => {
    try {
      const fpRes = await fetch(`${API_BASE_URL}/user/forgetpassword`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: mobileNum })
      });
      const fpData = await fpRes.json();
      if (fpRes.ok || fpData.IsSuccess || fpData.Status === 200) {
        // Clear stale token
        localStorage.removeItem(STORAGE_KEYS.PATIENT);
        setBookingState(prev => ({ ...prev, step: 15, isExistingUser: true }));
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: `🔐 Your session has expired. We've sent a fresh OTP to your mobile (${mobileNum}). Please enter the 6-digit OTP to continue booking:`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        return true;
      }
    } catch (e) {
      console.error('reAuth failed:', e);
    }
    return false;
  };

  const handleSaveAmbulanceBooking = async () => {
    setIsTyping(true);
    const userObj = getUserData();
    const token = userObj.token;
    const prefix = userObj.apiPrefix;

    if (!token) {
      // No token at all — trigger OTP re-auth using collected mobile
      const mobileNum = bookingState.mobile;
      if (mobileNum) {
        const reAuthed = await reAuthAmbulanceViaotp(mobileNum);
        if (reAuthed) {
          setIsTyping(false);
          return;
        }
      }
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: '⚠️ Session expired. Please refresh the page and log in to complete the booking.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${prefix}/ambulancerequests/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          pickupaddress: bookingState.pickupaddress,
          pickup_longitude: Number(bookingState.pickup_longitude),
          pickup_latitude: Number(bookingState.pickup_latitude),
          dropaddress: bookingState.dropaddress,
          drop_longitude: Number(bookingState.drop_longitude),
          drop_latitude: Number(bookingState.drop_latitude),
          name: bookingState.name,
          mobile: bookingState.mobile,
          pickup_house_number: 'Chatbot Booking',
          drop_house_number: 'Chatbot Booking',
          book_for: 'myself',
          ambulance_type: bookingState.selectedVehicle,
          category: bookingState.selectedVehicle === 'Ambulance' ? bookingState.selectedCategory : 'Basic',
          price: Number(bookingState.selectedPrice),
          gst_per: 18,
          platform_fee: Number(bookingState.platformFee || 0),
          distance: Number(bookingState.distance)
        })
      });

      const resData = await response.json();

      // Handle 401: stale/expired token — re-auth via OTP
      if (response.status === 401) {
        const reAuthed = await reAuthAmbulanceViaotp(bookingState.mobile);
        if (reAuthed) return;
        throw new Error('Session expired. Please log in again to complete your booking.');
      }

      if (!response.ok || !resData.IsSuccess) {
        throw new Error(resData.Message || 'Failed to create booking');
      }

      const bookingId = resData.Data.requestId;
      localStorage.setItem("amb_req_id", bookingId);
      localStorage.setItem(
        "lastAmbulanceRequest",
        JSON.stringify({
          requestId: bookingId,
          notifiedCount: resData.Data.notifiedCount || 0,
          timestamp: new Date().toISOString(),
        })
      );

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `🎉 Booking Successful!\n\nAmbulance booking request created successfully.\nRequest ID: ${bookingId}\n\nRedirecting you to the live ride status page in a few seconds...`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      setBookingState({ isActive: false });

      setTimeout(() => {
        setIsOpen(false);
        const routePrefix = userObj.role === 'doctor' ? 'doctor' : 'patient';
        navigate(`/${routePrefix}/ambulance-request/status/${bookingId}`);
      }, 3500);

    } catch (err) {
      console.error('Error saving ambulance request:', err);
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `❌ Booking failed: ${err.message || 'Server error'}. You may try again or visit the Ambulance Booking page.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      // Don't reset booking state on failure - let user retry
    } finally {
      setIsTyping(false);
    }
  };

  const handleCancelAmbulanceBooking = () => {
    setBookingState({ isActive: false });
    setMessages(prev => [
      ...prev,
      {
        sender: 'ai',
        text: 'Ambulance booking request has been cancelled. How else can I assist you?',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleBookingStepInput = async (text) => {
    const userObj = getUserData();
    let nextState = { ...bookingState };

    if (nextState.step === 1) {
      const passengerName = text.trim().toLowerCase() === 'next' ? (userObj.name || 'Guest') : text.trim();
      nextState.name = passengerName;
      nextState.step = 2;
      setBookingState(nextState);

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Passenger Name: ${passengerName}.\n\nNow, please enter the 10-digit mobile number (or send 'next' to use ${userObj.mobile || '9999999999'}):`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } 
    else if (nextState.step === 2) {
      let mobileVal = text.trim().toLowerCase() === 'next' ? (userObj.mobile || '9999999999') : text.trim();
      mobileVal = mobileVal.replace(/\D/g, '').slice(0, 10);
      if (mobileVal.length < 10) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: `⚠️ Please provide a valid 10-digit mobile number.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        return;
      }

      nextState.mobile = mobileVal;

      if (!userObj.token) {
        nextState.step = 11;
        setBookingState(nextState);
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: `Mobile Number: ${mobileVal}.\n\nTo complete this booking, we will create a quick patient account for you.\n\nPlease enter your Email Address:`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        nextState.step = 3;
        setBookingState(nextState);
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: `Mobile Number: ${mobileVal}.\n\nPlease enter the Pickup Address (e.g. "Lilavati Hospital, Bandra"):`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    }
    else if (nextState.step === 11) {
      const emailVal = text.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailVal)) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: `⚠️ Please enter a valid email address.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        return;
      }

      nextState.email = emailVal;
      nextState.step = 12;
      setBookingState(nextState);
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Email: ${emailVal}.\n\nPlease select your Gender:`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
    else if (nextState.step === 12) {
      let genderVal = text.trim();
      const lowerGender = genderVal.toLowerCase();
      if (lowerGender === 'male') genderVal = 'Male';
      else if (lowerGender === 'female') genderVal = 'Female';
      else {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: `⚠️ Please select a gender or enter 'Male' or 'Female'.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        return;
      }

      nextState.gender = genderVal;
      nextState.step = 13;
      setBookingState(nextState);
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Gender: ${genderVal}.\n\nPlease enter your 6-digit Pincode:`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
    else if (nextState.step === 13) {
      const pincodeVal = text.replace(/\D/g, '').slice(0, 6);
      if (pincodeVal.length < 6) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: `⚠️ Please enter a valid 6-digit pincode.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        return;
      }

      nextState.pincode = pincodeVal;
      nextState.step = 14;
      setBookingState(nextState);

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Pincode: ${pincodeVal}.\n\nPlease select or enter your Blood Group (e.g. O+, A+, B+, AB+):`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
    else if (nextState.step === 14) {
      const bgVal = text.trim();
      nextState.blood_group = bgVal;
      nextState.step = 15;
      setBookingState(nextState);

      setIsTyping(true);
      try {
        const response = await fetch(`${API_BASE_URL}/user/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: nextState.name,
            mobile: nextState.mobile,
            email: nextState.email,
            gender: nextState.gender,
            pincode: Number(nextState.pincode),
            blood_group: nextState.blood_group,
            password: 'Welcome@123'
          })
        });

        const resData = await response.json();
        if (response.ok || resData.Status === 200 || resData.IsSuccess) {
          setMessages(prev => [
            ...prev,
            {
              sender: 'ai',
              text: `Registration details submitted. An OTP code has been sent to your mobile. Please enter the 6-digit OTP code to verify and log in:`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        } else {
          throw new Error(resData.Message || 'Failed to initialize registration');
        }
      } catch (err) {
        console.error(err);
        if (err.message && err.message.toLowerCase().includes('already exist')) {
          try {
            const fpResponse = await fetch(`${API_BASE_URL}/user/forgetpassword`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                mobile: nextState.mobile
              })
            });
            const fpData = await fpResponse.json();
            if (fpResponse.ok || fpData.Status === 200 || fpData.IsSuccess) {
              nextState.isExistingUser = true;
              nextState.step = 15;
              setBookingState(nextState);
              setMessages(prev => [
                ...prev,
                {
                  sender: 'ai',
                  text: `An account already exists with this mobile number. We have sent a verification OTP to your mobile. Please enter the 6-digit OTP code to verify and log in:`,
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              ]);
              return;
            }
          } catch (fpErr) {
            console.error('Forget password fallback failed:', fpErr);
          }
        }

        nextState.step = 14;
        setBookingState(nextState);
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: `❌ Registration failed: ${err.message || 'Server error'}. Please enter your Blood Group again to retry:`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } finally {
        setIsTyping(false);
      }
    }
    else if (nextState.step === 15) {
      const otpVal = text.trim().replace(/\D/g, '').slice(0, 6);
      if (otpVal.length < 6) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: `⚠️ Please enter a valid 6-digit OTP code.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        return;
      }

      setIsTyping(true);
      try {
        if (nextState.isExistingUser) {
          const verifyResponse = await fetch(`${API_BASE_URL}/user/forgetpassword/verifyotp`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              mobile: nextState.mobile,
              otp: otpVal
            })
          });
          const verifyData = await verifyResponse.json();
          if (!verifyResponse.ok || (verifyData.Status && verifyData.Status !== 200)) {
            throw new Error(verifyData.Message || 'OTP verification failed');
          }

          // NOTE: setpassword call uses a temporary password — the user can reset it later from profile
          const setPassResponse = await fetch(`${API_BASE_URL}/user/forgetpassword/setpassword`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              mobile: nextState.mobile,
              password: 'Welcome@123'
            })
          });
          const setPassData = await setPassResponse.json();
          if (!setPassResponse.ok || (setPassData.Status && setPassData.Status !== 200)) {
            throw new Error(setPassData.Message || 'Session verification failed. Please try again.');
          }

          const encrypted = CryptoJS.AES.encrypt(JSON.stringify(setPassData.Data), SECRET_KEY).toString();
          localStorage.setItem(STORAGE_KEYS.PATIENT, encrypted);

          nextState.isExistingUser = false;

          // If booking data already exists (re-auth mid-booking), skip to confirm
          if (nextState.pickupaddress && nextState.dropaddress && nextState.selectedVehicle) {
            nextState.step = 6;
            setBookingState(nextState);
            setMessages(prev => [
              ...prev,
              {
                sender: 'ai',
                text: `✅ Session restored! Showing your booking summary:`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              },
              {
                sender: 'ai',
                type: 'ambulance_booking_confirm',
                bookingState: nextState,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]);
          } else {
            nextState.step = 3;
            setBookingState(nextState);
            setMessages(prev => [
              ...prev,
              {
                sender: 'ai',
                text: `🎉 Welcome back! Account verified and logged in.\n\nPlease enter the Pickup Address (e.g. "Lilavati Hospital, Bandra"):`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]);
          }
        } else {
          const response = await fetch(`${API_BASE_URL}/user/signup/otpverification`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: nextState.email,
              otp: otpVal
            })
          });

          const resData = await response.json();
          if (!response.ok || !resData.IsSuccess) {
            throw new Error(resData.Message || 'Failed to verify OTP');
          }

          const encrypted = CryptoJS.AES.encrypt(JSON.stringify(resData.Data), SECRET_KEY).toString();
          localStorage.setItem(STORAGE_KEYS.PATIENT, encrypted);

          nextState.step = 3;
          setBookingState(nextState);

          setMessages(prev => [
            ...prev,
            {
              sender: 'ai',
              text: `🎉 Registration & verification successful! You are now logged in.\n\nLet's continue with the booking. Please enter the Pickup Address (e.g. "Lilavati Hospital, Bandra"):`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }
      } catch (err) {
        console.error(err);
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: `❌ Verification failed: ${err.message || 'Server error'}. Please enter the correct OTP code:`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } finally {
        setIsTyping(false);
      }
    } 
    else if (nextState.step === 3) {
      setIsTyping(true);
      try {
        const geo = await geocodeAddress(text.trim());
        if (!geo || !geo.lat || !geo.lng) {
          throw new Error('Could not resolve this address. Please try a more specific address.');
        }
        nextState.pickupaddress = geo.address;
        nextState.pickup_latitude = geo.lat;
        nextState.pickup_longitude = geo.lng;
        nextState.step = 4;
        setBookingState(nextState);

        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: `📍 Pickup: ${geo.address}\n\nNow, please enter the Drop Address (e.g. "Apex Hospital, Mulund"):`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } catch (err) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: `⚠️ Address lookup failed: ${err.message}. Please try again:`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } finally {
        setIsTyping(false);
      }
    } 
    else if (nextState.step === 4) {
      setIsTyping(true);
      try {
        const geo = await geocodeAddress(text.trim());
        nextState.dropaddress = geo.address;
        nextState.drop_latitude = geo.lat;
        nextState.drop_longitude = geo.lng;

        let dist = haversineKm(
          nextState.pickup_latitude,
          nextState.pickup_longitude,
          geo.lat,
          geo.lng
        );
        // Ensure minimum 1km so backend distance validation never fails
        if (!dist || dist < 1) dist = 1;
        nextState.distance = dist;

        const pricesRes = await fetchAmbulancePrices(nextState);
        nextState.vehiclePrices = pricesRes.prices;
        nextState.platformFee = pricesRes.platformFee;
        nextState.step = 5;
        setBookingState(nextState);

        const vehicleSelectMessage = {
          sender: 'ai',
          type: 'ambulance_vehicle_select',
          bookingState: nextState,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, vehicleSelectMessage]);

      } catch (err) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: `⚠️ Address lookup failed: ${err.message}. Please try again:`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const startEmiDocumentUpload = async () => {
    setIsTyping(true);
    try {
      const userObj = getUserData();
      const isLoggedIn = !!(userObj.token && userObj.name);

      setBookingState(prev => ({ ...prev, isActive: false }));
      setAptBookingState(prev => ({ ...prev, isActive: false }));

      if (isLoggedIn) {
        setUploadState({
          isActive: true,
          step: 1,
          name: userObj.name,
          mobile: userObj.mobile,
          otp: '',
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
          relationship_proof: '',
          treatment_type: '',
          estimated_amount: '',
          hospital_quotation: '',
          prescription: '',
          aadhaar_card: '',
          pan_card: '',
          itr_status: '',
          itr_file: '',
          patient_age: '',
          alternate_no: '',
          isExistingUser: false
        });

        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: `Welcome ${userObj.name}! Let's start your comprehensive EMI Application. To get started, please enter the Applicant's Full Name:`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        setUploadState({
          isActive: true,
          step: -2,
          name: '',
          mobile: '',
          otp: '',
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
          relationship_proof: '',
          treatment_type: '',
          estimated_amount: '',
          hospital_quotation: '',
          prescription: '',
          aadhaar_card: '',
          pan_card: '',
          itr_status: '',
          itr_file: '',
          patient_age: '',
          alternate_no: '',
          isExistingUser: false
        });

        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: `Welcome to the Bill EMI Application! First, we need to authenticate you. Please enter your First Name:`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };
  const handleSurgBookingStepInput = async (text) => {
    const nextState = { ...surgBookingState };
    const userObj = JSON.parse(localStorage.getItem("user") || "{}");
    const token = localStorage.getItem("token");
    
    // Step 1: Select Hospital
    if (nextState.step === 1) {
      const hospitalVal = text.trim();
      if (!nextState.hospitalsList.includes(hospitalVal)) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: 'Please select a valid Hospital from the options below.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        return;
      }
      nextState.hospital = hospitalVal;
      
      const filtered = nextState.doctorsList.filter(doc => {
         return doc.hospitals && doc.hospitals.some(h => h.name && h.name.trim().toLowerCase() === hospitalVal.toLowerCase());
      });
      nextState.filteredDoctors = filtered;
      nextState.step = 2;
      setSurgBookingState(nextState);

      setMessages(prev => [
        ...prev,
        { sender: 'user', text: hospitalVal, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        {
          sender: 'ai',
          text: `Selected Hospital: ${hospitalVal}.\n\nPlease select a Doctor:`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        {
          sender: 'ai',
          type: 'doctor_chips',
          doctors: filtered,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
    
    // Step 2 is handled by chip selection (handleSurgDoctorChipSelect) -> leads to Step 3

    // Step 3: Select Surgery
    else if (nextState.step === 3) {
      const surgVal = text.trim();
      const surgeryObj = nextState.doctor.surgeriesDetails.find(s => 
         (s.name && s.name.trim() === surgVal) || 
         (s.surgerytypeid?.surgerytypename && s.surgerytypeid.surgerytypename.trim() === surgVal)
      );

      if (!surgeryObj) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: 'Please select a valid Surgery from the options below.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        return;
      }
      nextState.surgery = surgeryObj;
      nextState.step = 4;
      setSurgBookingState(nextState);

      const genP = surgeryObj.general_price || 'N/A';
      const semiP = surgeryObj.semiprivate_price || surgeryObj.semiprivate || 'N/A';
      const privP = surgeryObj.private_price || 'N/A';
      const delP = surgeryObj.delux_price || surgeryObj.deluxe_price || 'N/A';

      setMessages(prev => [
        ...prev,
        { sender: 'user', text: surgVal, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        {
          sender: 'ai',
          text: `Selected Surgery: ${surgVal}.\n\nPlease select a Room Type from below options:\n- General (₹${genP})\n- SemiPrivate (₹${semiP})\n- Private (₹${privP})\n- Delux (₹${delP})`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }

    // Step 4: Select Room Type
    else if (nextState.step === 4) {
      const rawRoom = text.trim();
      const validRooms = ['General', 'SemiPrivate', 'Private', 'Delux'];
      // Case-insensitive match to prevent flow getting stuck on case mismatch
      const roomVal = validRooms.find(r => r.toLowerCase() === rawRoom.toLowerCase()) || null;
      if (!roomVal) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: '⚠️ Please select a valid Room Type: General, SemiPrivate, Private, or Delux.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        return;
      }
      nextState.roomType = roomVal;
      nextState.step = 5;
      setSurgBookingState(nextState);

      setMessages(prev => [
        ...prev,
        { sender: 'user', text: roomVal, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        {
          sender: 'ai',
          text: `Selected Room: ${roomVal}.\n\nPlease choose the Date of your surgery using the calendar below:`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        {
          sender: 'ai',
          type: 'date_picker',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }

    // Step 5: Date
    else if (nextState.step === 5) {
      let dateStr = text.trim();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      if (dateStr.toLowerCase() === 'today') {
         // Surgery cannot be booked today — needs at least 1 day notice
         setMessages(prev => [...prev, { sender: 'ai', text: '⚠️ Surgery appointments require at least 1 day advance notice. Please select a date from tomorrow onwards:', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
         return;
      } else if (dateStr.toLowerCase() === 'tomorrow') {
         const tmrw = new Date();
         tmrw.setDate(tmrw.getDate() + 1);
         dateStr = `${tmrw.getDate().toString().padStart(2, '0')}-${(tmrw.getMonth() + 1).toString().padStart(2, '0')}-${tmrw.getFullYear()}`;
      } else {
         const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
         if (!dateRegex.test(dateStr)) {
           setMessages(prev => [...prev, { sender: 'ai', text: '⚠️ Please provide the date in DD-MM-YYYY format or use the calendar below.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
           return;
         }
         // Validate that the date is not in the past
         const [dd, mm, yyyy] = dateStr.split('-');
         const parsedDate = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
         if (parsedDate < tomorrow) {
           setMessages(prev => [...prev, { sender: 'ai', text: '⚠️ Surgery cannot be scheduled for a past date or today. Please select a future date:', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
           return;
         }
      }
      const blockedDates = nextState.doctorBlockedDates?.length
        ? nextState.doctorBlockedDates
        : await fetchDoctorBlockedDates(nextState.doctor._id);
      nextState.doctorBlockedDates = blockedDates;

      const blockedSet = new Set(blockedDates);
      const newBlock = [];
      for (let i = 0; i < 3; i++) {
        const d = parseDmY(dateStr);
        d.setDate(d.getDate() + i);
        newBlock.push(formatDmYFromDate(d));
      }
      const overlapsExisting = newBlock.some((d) => blockedSet.has(d));
      if (overlapsExisting) {
        setMessages(prev => [...prev, {
          sender: 'ai',
          text: '⚠️ The doctor is unavailable on this date or the following 2 recovery days due to another surgery booking. Please choose another date.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        return;
      }

      nextState.date = dateStr;

      setIsTyping(true);
      try {
        nextState.bookedSlots = await fetchBookedSlotsForDoctor(nextState.doctor._id, dateStr);
      } finally {
        setIsTyping(false);
      }

      const availableCount = getAvailableTimeSlots(nextState.bookedSlots, dateStr).length;
      if (availableCount === 0) {
        setMessages(prev => [...prev, {
          sender: 'ai',
          text: `⚠️ No time slots are available on ${dateStr}. Please choose another date.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        return;
      }

      nextState.step = 6;
      setSurgBookingState(nextState);

      setMessages(prev => [
        ...prev,
        { sender: 'user', text: dateStr, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        {
          sender: 'ai',
          text: `Selected Date: ${dateStr}.\n\nPlease select an available time slot from the options below:`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }

    // Step 6: Time Slot
    else if (nextState.step === 6) {
      const timeStr = normalizeTimeSlot(text.trim());
      const availableSlots = getAvailableTimeSlots(nextState.bookedSlots, nextState.date);
      if (!availableSlots.includes(timeStr)) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: `⚠️ The time slot ${text.trim()} is not available. Please choose a different slot from the options below.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        return;
      }
      nextState.timeSlot = timeStr;
      
      if (!userObj || !userObj.mobile) {
         nextState.step = 7;
         setSurgBookingState(nextState);
         setMessages(prev => [
           ...prev,
           { sender: 'user', text: timeStr, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
           {
             sender: 'ai',
             text: 'Please provide the Patient Name:',
             time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
           }
         ]);
      } else {
         nextState.patientname = userObj.name || 'Patient';
         nextState.mobile = userObj.mobile;
         nextState.step = 9;
         setSurgBookingState(nextState);
         
         setMessages(prev => [
           ...prev,
           { sender: 'user', text: timeStr, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
           {
             sender: 'ai',
             type: 'surgery_booking_confirm',
             surgState: nextState,
             time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
           }
         ]);
      }
    }

    // Step 7: Patient Name (Guest)
    else if (nextState.step === 7) {
      nextState.patientname = text.trim();
      nextState.step = 8;
      setSurgBookingState(nextState);
      setMessages(prev => [
        ...prev,
        { sender: 'user', text: text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        {
          sender: 'ai',
          text: 'Please provide your 10-digit Mobile Number:',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }

    // Step 8: Mobile (Guest)
    else if (nextState.step === 8) {
      const mob = text.trim();
      if (!/^\d{10}$/.test(mob)) {
        setMessages(prev => [...prev, { sender: 'ai', text: 'Please enter a valid 10-digit mobile number.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        return;
      }
      nextState.mobile = mob;
      nextState.step = 9;
      setSurgBookingState(nextState);
      setMessages(prev => [
        ...prev,
        { sender: 'user', text: mob, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        {
          sender: 'ai',
          type: 'surgery_booking_confirm',
          surgState: nextState,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const handleSurgDoctorChipSelect = (doc) => {
    if (!surgBookingState.isActive || surgBookingState.step !== 2) return;
    
    const nextState = { ...surgBookingState, doctor: doc, step: 3, doctorBlockedDates: [] };
    setSurgBookingState(nextState);

    fetchDoctorBlockedDates(doc._id).then((dates) => {
      setSurgBookingState(prev => (
        prev.doctor?._id === doc._id ? { ...prev, doctorBlockedDates: dates } : prev
      ));
    });

    setMessages(prev => [
      ...prev,
      {
        sender: 'ai',
        text: `Selected Doctor: ${doc.name} (${doc.specialty || doc.specialization || 'Doctor'}).\n\nPlease select the Surgery you wish to book:`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleSaveSurgeryAppointment = async () => {
    try {
      const userObj = getUserData();
      const token = userObj.token;
      
      if (!token || token.includes('undefined')) {
        throw new Error('User session not found. Please register/log in.');
      }
      
      const surgObj = surgBookingState.surgery;
      const roomType = surgBookingState.roomType;
      let price = 0;
      if (roomType === 'General') price = surgObj.general_price;
      else if (roomType === 'SemiPrivate') price = surgObj.semiprivate_price || surgObj.semiprivate;
      else if (roomType === 'Private') price = surgObj.private_price;
      else if (roomType === 'Delux') price = surgObj.delux_price || surgObj.deluxe_price;
      
      price = price || 0;
      const amountToPay = Math.max(0, Math.round(Number(price) * 0.15)); // 15% payment
      
      if (amountToPay > 0) {
        // Step 1: Create Razorpay Order
        const orderRes = await fetch(`${API_BASE_URL}/user/order/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': token },
          body: JSON.stringify({ amount: amountToPay })
        });
        const orderData = await orderRes.json();
        if (!orderRes.ok || !orderData.Data) {
          throw new Error(`Payment API Error: ${orderData?.Message || orderData?.error || orderRes.statusText || 'Unknown backend error'}`);
        }
        const orderId = orderData.Data.id;

        const options = {
          key: "rzp_live_S0smOweosyTmQ8",
          amount: orderData.Data.amount,
          currency: "INR",
          name: "HealthEasy EMI",
          description: `15% Advance Payment for Surgery (Total: ₹${price})`,
          order_id: orderId,
          handler: async function (response) {
            try {
              setIsTyping(true);
              // Save Surgery Appointment
              const surgDataPayload = {
                patientname: userObj.name || surgBookingState.patientname || 'Patient',
                mobile: userObj.mobile || surgBookingState.mobile,
                alt_mobile: '',
                alt_name: userObj.name || surgBookingState.patientname || 'Self',
                date: surgBookingState.date,
                time: surgBookingState.timeSlot,
                doctorid: surgBookingState.doctor._id,
                surgeryid: surgBookingState.surgery._id,
                hospital_name: surgBookingState.hospital,
                roomtype: surgBookingState.roomType === 'SemiPrivate' ? 'Semiprivate' : surgBookingState.roomType,
                remark: '',
                report: [] // Handled in deep flow, keeping empty for chatbot
              };

              const saveRes = await fetch(`${API_BASE_URL}/user/surgeryappointments/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': token },
                body: JSON.stringify(surgDataPayload)
              });
              const saveResult = await saveRes.json();
              
              if (!saveRes.ok || !saveResult.IsSuccess) {
                throw new Error(`Surgery Save Failed: ${saveResult?.Message || saveRes.statusText}`);
              }

              setMessages(prev => [
                ...prev,
                {
                  sender: 'ai',
                  text: `🎉 Surgery Appointment successfully booked!\n\n👨‍⚕️ Doctor: ${surgBookingState.doctor.name}\n🏥 Surgery: ${surgBookingState.surgery.name || surgBookingState.surgery.surgerytypeid?.surgerytypename}\n📅 Date: ${surgBookingState.date}\n🕒 Time: ${surgBookingState.timeSlot}\n📍 Location: ${surgBookingState.hospital}\n💵 15% Paid: ₹${amountToPay}\n\nWe have sent a confirmation message to your mobile. Thank you for choosing Healtheasy EMI!`,
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              ]);
              setSurgBookingState({ isActive: false });
            } catch (err) {
              console.error('Payment Verification or Surgery Save Failed:', err);
              alert('Payment Verification Failed! Please contact support.');
            }
          },
          prefill: {
            name: userObj.name || surgBookingState.patientname,
            contact: userObj.mobile || surgBookingState.mobile
          },
          theme: { color: "#3399cc" }
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.open();
      } else {
         // Free or 0 price fallback
         const surgDataPayload = {
            patientname: userObj.name || surgBookingState.patientname || 'Patient',
            mobile: userObj.mobile || surgBookingState.mobile,
            alt_mobile: '',
            date: surgBookingState.date,
            time: surgBookingState.timeSlot,
            doctorid: surgBookingState.doctor._id,
            surgeryid: surgBookingState.surgery._id,
            hospital_name: surgBookingState.hospital,
            roomtype: surgBookingState.roomType,
            remark: '',
            report: []
         };

         await fetch(`${API_BASE_URL}/user/surgeryappointments/save`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json', 'Authorization': token },
           body: JSON.stringify(surgDataPayload)
         });

         setMessages(prev => [
            ...prev,
            {
               sender: 'ai',
               text: `🎉 Surgery Appointment successfully booked!\n\n👨‍⚕️ Doctor: ${surgBookingState.doctor.name}\n🏥 Surgery: ${surgBookingState.surgery.name || surgBookingState.surgery.surgerytypeid?.surgerytypename}\n📅 Date: ${surgBookingState.date}\n🕒 Time: ${surgBookingState.timeSlot}\n📍 Location: ${surgBookingState.hospital}\n\nWe have sent a confirmation message to your mobile. Thank you for choosing Healtheasy EMI!`,
               time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
         ]);
         setSurgBookingState({ isActive: false });
      }
    } catch (error) {
      console.error('Surgery Booking Error:', error);
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `❌ ${error.message || 'There was an error completing your surgery booking. Please try again later.'}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setSurgBookingState(prev => ({ ...prev, isActive: false }));
    }
  };

  const handleCancelSurgeryAppointment = () => {
    setMessages(prev => [
      ...prev,
      {
        sender: 'ai',
        text: '❌ Surgery Appointment booking cancelled.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setSurgBookingState({ isActive: false });
  };

  const handleUploadStepInput = async (text) => {
    const nextState = { ...uploadState };
    const val = text.trim();

    if (nextState.step === -2) {
      if (!val) return;
      nextState.name = val;
      nextState.step = -1;
      setUploadState(nextState);
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Thanks ${nextState.name}! Now, please enter your 10-digit mobile number:`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      return;
    }

    if (nextState.step === -1) {
      if (!/^\d{10}$/.test(val)) {
        setMessages(prev => [...prev, { sender: 'ai', text: '⚠️ Please enter a valid 10-digit mobile number:', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        return;
      }
      nextState.mobile = val;
      setIsTyping(true);
      try {
        const response = await fetch(`${API_BASE_URL}/user/forgetpassword`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobile: val })
        });
        const resData = await response.json();
        if (response.ok && resData.Status === 200) {
          nextState.isExistingUser = true;
          nextState.step = 0;
          setUploadState(nextState);
          setMessages(prev => [...prev, { sender: 'ai', text: `An OTP has been sent to your mobile ${val}. Please enter the OTP to authenticate:`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        } else {
          const regOtpResponse = await fetch(`${API_BASE_URL}/user/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: nextState.name, mobile: val, password: 'Welcome@123', gender: 'male', email: `${val}@healtheasy.com` })
          });
          const regOtpData = await regOtpResponse.json();
          if (regOtpResponse.ok && regOtpData.Status === 200) {
            nextState.isExistingUser = false;
            nextState.step = 0;
            setUploadState(nextState);
            setMessages(prev => [...prev, { sender: 'ai', text: `An OTP has been sent to your mobile ${val}. Please enter the OTP to verify:`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
          } else {
            throw new Error(regOtpData.Message || 'Failed to send OTP.');
          }
        }
      } catch (err) {
        setMessages(prev => [...prev, { sender: 'ai', text: `⚠️ Error: ${err.message || 'Something went wrong'}. Let's try again. Please enter your name:`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        nextState.step = -2;
        setUploadState(nextState);
      } finally {
        setIsTyping(false);
      }
      return;
    }

    if (nextState.step === 0) {
      setIsTyping(true);
      try {
        if (nextState.isExistingUser) {
          const verifyResponse = await fetch(`${API_BASE_URL}/user/forgetpassword/verifyotp`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mobile: nextState.mobile, otp: val })
          });
          const verifyData = await verifyResponse.json();
          if (!verifyResponse.ok || verifyData.Status !== 200) throw new Error(verifyData.Message || 'OTP verification failed');
          const setPassResponse = await fetch(`${API_BASE_URL}/user/forgetpassword/setpassword`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mobile: nextState.mobile, password: 'Welcome@123' })
          });
          const setPassData = await setPassResponse.json();
          if (!setPassResponse.ok || setPassData.Status !== 200) throw new Error(setPassData.Message || 'Failed to authenticate');
          const encrypted = CryptoJS.AES.encrypt(JSON.stringify(setPassData.Data), SECRET_KEY).toString();
          localStorage.setItem(STORAGE_KEYS.PATIENT, encrypted);
        } else {
          const registerVerifyResponse = await fetch(`${API_BASE_URL}/user/register/verifyotp`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mobile: nextState.mobile, otp: val })
          });
          const registerVerifyData = await registerVerifyResponse.json();
          if (!registerVerifyResponse.ok || registerVerifyData.Status !== 200) throw new Error(registerVerifyData.Message || 'OTP verification failed');
          const encrypted = CryptoJS.AES.encrypt(JSON.stringify(registerVerifyData.Data), SECRET_KEY).toString();
          localStorage.setItem(STORAGE_KEYS.PATIENT, encrypted);
        }
        nextState.step = 1;
        setUploadState(nextState);
        setMessages(prev => [...prev, { sender: 'ai', text: `Authentication successful! Let's start your comprehensive EMI Application. To get started, please enter the Applicant's Full Name:`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      } catch (err) {
        setMessages(prev => [...prev, { sender: 'ai', text: `⚠️ Verification failed: ${err.message}. Please enter the OTP again:`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      } finally {
        setIsTyping(false);
      }
      return;
    }

    if (nextState.step === 1) {
      if (!val) return;
      nextState.full_name = val;
      nextState.step = 2;
      setUploadState(nextState);
      setMessages(prev => [...prev, { sender: 'ai', text: `Got it. Are you married or unmarried?`, type: 'option_chips', options: ['married', 'unmarried'], time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      return;
    }

    if (nextState.step === 2) {
      if (!val) return;
      const maritalLower = val.toLowerCase().trim();
      if (maritalLower !== 'married' && maritalLower !== 'unmarried') {
        setMessages(prev => [...prev, { sender: 'ai', text: `⚠️ Please select your marital status:`, type: 'option_chips', options: ['married', 'unmarried'], time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        return;
      }
      nextState.marital_status = maritalLower;
      nextState.step = 3;
      setUploadState(nextState);
      setMessages(prev => [...prev, { sender: 'ai', text: `Please enter your Date of Birth (DD-MM-YYYY):`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      return;
    }

    if (nextState.step === 3) {
      if (!val) return;
      nextState.dob = val;
      nextState.step = 4;
      setUploadState(nextState);
      setMessages(prev => [...prev, { sender: 'ai', text: `Please enter your PAN Card Number:`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      return;
    }

    if (nextState.step === 4) {
      if (!val) return;
      // Validate PAN: 5 letters + 4 digits + 1 letter (AAAAA9999A)
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;
      if (!panRegex.test(val.trim())) {
        setMessages(prev => [...prev, { sender: 'ai', text: '⚠️ Invalid PAN Number format. Please enter a valid PAN (e.g., ABCDE1234F):', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        return;
      }
      nextState.pan_no = val.trim().toUpperCase();
      nextState.step = 5;
      setUploadState(nextState);
      setMessages(prev => [...prev, { sender: 'ai', text: `Please enter your Aadhaar Card Number (12 digits):`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      return;
    }

    if (nextState.step === 5) {
      if (!val) return;
      // Validate Aadhaar: exactly 12 digits
      if (!/^\d{12}$/.test(val.trim().replace(/\s/g, ''))) {
        setMessages(prev => [...prev, { sender: 'ai', text: '⚠️ Invalid Aadhaar Number. Please enter your 12-digit Aadhaar card number:', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        return;
      }
      nextState.aadhar_no = val.trim().replace(/\s/g, '');
      nextState.step = 6;
      setUploadState(nextState);
      setMessages(prev => [...prev, { sender: 'ai', text: `Please enter your 6-digit Pincode:`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      return;
    }

    if (nextState.step === 6) {
      if (!val) return;
      // Validate Pincode: exactly 6 digits
      const cleanPin = val.trim().replace(/\D/g, '');
      if (cleanPin.length !== 6) {
        setMessages(prev => [...prev, { sender: 'ai', text: '⚠️ Please enter a valid 6-digit Indian Pincode:', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        return;
      }
      nextState.pincode = cleanPin;
      nextState.step = 7;
      setUploadState(nextState);
      setMessages(prev => [...prev, { sender: 'ai', text: `What is your Employment Type?`, type: 'option_chips', options: ['Salaried', 'Business'], time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      return;
    }

    if (nextState.step === 7) {
      if (!val) return;
      const empLower = val.toLowerCase().trim();
      if (empLower !== 'salaried' && empLower !== 'business') {
        setMessages(prev => [...prev, { sender: 'ai', text: `⚠️ Please select your employment type:`, type: 'option_chips', options: ['Salaried', 'Business'], time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        return;
      }
      nextState.employment_type = val.trim();
      nextState.step = 8;
      setUploadState(nextState);
      setMessages(prev => [...prev, { sender: 'ai', text: `Please enter your Monthly Income in ₹ (Note: Minimum required is ₹15,000):`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      return;
    }

    if (nextState.step === 8) {
      const inc = parseInt(val.replace(/\D/g, ''));
      if (isNaN(inc) || inc < 15000) {
        setMessages(prev => [...prev, { sender: 'ai', text: `⚠️ Sorry, the minimum monthly income required for Health EMI is ₹15,000. Your application cannot proceed further.`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        setUploadState({ isActive: false });
        return;
      }
      nextState.monthly_income = inc;
      nextState.step = 9;
      setUploadState(nextState);
      setMessages(prev => [...prev, { sender: 'ai', text: `Please enter the Hospital Name:`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      return;
    }

    if (nextState.step === 9) {
      if (!val) return;
      nextState.hospital_name = val;
      nextState.step = 10;
      setUploadState(nextState);
      setMessages(prev => [...prev, { sender: 'ai', text: `Is the hospital NABH Accredited?`, type: 'option_chips', options: ['yes', 'no'], time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      return;
    }

    if (nextState.step === 10) {
      if (!val) return;
      const nabhLower = val.toLowerCase().trim();
      if (nabhLower !== 'yes' && nabhLower !== 'no') {
        setMessages(prev => [...prev, { sender: 'ai', text: `⚠️ Please select 'yes' or 'no' for NABH accreditation:`, type: 'option_chips', options: ['yes', 'no'], time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        return;
      }
      nextState.nabh_status = nabhLower;
      nextState.step = 11;
      setUploadState(nextState);
      setMessages(prev => [...prev, { sender: 'ai', text: `Please enter the Patient's Full Name:`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      return;
    }

    if (nextState.step === 11) {
      if (!val) return;
      nextState.patient_name = val;
      nextState.step = 12;
      setUploadState(nextState);
      setMessages(prev => [
        ...prev, 
        { sender: 'ai', text: `Please upload Proof of Relationship with Patient (Image):`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        { sender: 'ai', type: 'emi_doc_upload', documentType: 'Relationship Proof', isPDF: false, skippable: true, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
      return;
    }

    // Step 12 is Relationship Proof Upload, handled in handleEmiUploadSuccess

    if (nextState.step === 13) {
      if (!val) return;
      const treatLower = val.toLowerCase().trim();
      if (treatLower !== 'surgery' && treatLower !== 'medicine') {
        setMessages(prev => [...prev, { sender: 'ai', text: `⚠️ Please select 'Surgery' or 'Medicine':`, type: 'option_chips', options: ['Surgery', 'Medicine'], time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        return;
      }
      nextState.treatment_type = val.trim();
      nextState.step = 14;
      setUploadState(nextState);
      setMessages(prev => [...prev, { sender: 'ai', text: `Please enter the Estimated Amount for the treatment in ₹:`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      return;
    }

    if (nextState.step === 14) {
      const amt = parseInt(val.replace(/\D/g, ''));
      if (isNaN(amt)) return;
      nextState.estimated_amount = amt;
      nextState.step = 15;
      setUploadState(nextState);
      setMessages(prev => [
        ...prev, 
        { sender: 'ai', text: `Please upload the Hospital Quotation for treatment (Image/PDF):`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        { sender: 'ai', type: 'emi_doc_upload', documentType: 'Hospital Quotation', isPDF: false, skippable: true, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
      return;
    }

    // Steps 15, 16, 17, 18 are File Uploads

    if (nextState.step === 19) {
      if (!val) return;
      const itrLower = val.toLowerCase().trim();
      if (itrLower !== 'yes' && itrLower !== 'no') {
        setMessages(prev => [...prev, { sender: 'ai', text: `⚠️ Please select 'yes' or 'no' for ITR:`, type: 'option_chips', options: ['yes', 'no'], time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        return;
      }
      nextState.itr_status = itrLower;
      if (nextState.itr_status === 'yes') {
        nextState.step = 20;
        setUploadState(nextState);
        setMessages(prev => [
          ...prev, 
          { sender: 'ai', text: `You selected Yes for ITR. Please upload your ITR Document (Image/PDF):`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
          { sender: 'ai', type: 'emi_doc_upload', documentType: 'ITR File', isPDF: false, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);
      } else {
        // Skip ITR upload
        nextState.step = 21;
        setUploadState(nextState);
        setMessages(prev => [...prev, { sender: 'ai', text: `Please enter the Patient's Age:`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      }
      return;
    }

    // Step 20 is ITR File upload

    if (nextState.step === 21) {
      if (!val) return;
      nextState.patient_age = parseInt(val) || 0;
      nextState.step = 22;
      setUploadState(nextState);
      setMessages(prev => [...prev, { sender: 'ai', text: `Please enter an Alternate Mobile Number (Relative/Friend):`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      return;
    }

    if (nextState.step === 22) {
      if (!val) return;
      nextState.alternate_no = val;
      nextState.step = 23;
      setUploadState(nextState);
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          type: 'emi_application_summary',
          application: nextState,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      return;
    }
  };
  const handleEmiUploadSuccess = (url) => {
    setUploadState(prev => {
      const nextState = { ...prev };
      if (nextState.step === 12) nextState.relationship_proof = url;
      else if (nextState.step === 15) nextState.hospital_quotation = url;
      else if (nextState.step === 16) nextState.prescription = url;
      else if (nextState.step === 25) nextState.insurance_card = url;
      else if (nextState.step === 17) nextState.aadhaar_card = url;
      else if (nextState.step === 18) nextState.pan_card = url;
      else if (nextState.step === 20) nextState.itr_file = url;
      return nextState;
    });
  };
  const handleEmiNextStep = () => {
    setUploadState(prev => {
      const nextState = { ...prev };
      const currentStep = nextState.step;

      if (currentStep === 12) {
        if (!nextState.relationship_proof) return prev;
        nextState.step = 13;
        setMessages(msgs => [
          ...msgs,
          { sender: 'ai', text: 'Proof uploaded! Now, enter Treatment Type:', type: 'option_chips', options: ['Surgery', 'Medicine'], time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);
      } else if (currentStep === 15) {
        if (!nextState.hospital_quotation) return prev;
        nextState.step = 16;
        setMessages(msgs => [
          ...msgs,
          { sender: 'ai', text: 'Quotation uploaded/skipped! Now, upload the Medical Prescription (Image):', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
          { sender: 'ai', type: 'emi_doc_upload', documentType: 'Prescription', isPDF: false, skippable: true, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);
      } else if (currentStep === 16) {
        if (!nextState.prescription) return prev;
        nextState.step = 25;
        setMessages(msgs => [
          ...msgs,
          { sender: 'ai', text: 'Prescription uploaded/skipped! Now, upload the Insurance Card (Image):', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
          { sender: 'ai', type: 'emi_doc_upload', documentType: 'Insurance Card', isPDF: false, skippable: true, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);
      } else if (currentStep === 25) {
        if (!nextState.insurance_card) return prev;
        nextState.step = 17;
        setMessages(msgs => [
          ...msgs,
          { sender: 'ai', text: 'Insurance Card uploaded/skipped! Now, upload Aadhaar Card (Image):', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
          { sender: 'ai', type: 'emi_doc_upload', documentType: 'Aadhaar Card', isPDF: false, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);
      } else if (currentStep === 17) {
        if (!nextState.aadhaar_card) return prev;
        nextState.step = 18;
        setMessages(msgs => [
          ...msgs,
          { sender: 'ai', text: 'Aadhaar uploaded! Now, upload PAN Card (Image):', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
          { sender: 'ai', type: 'emi_doc_upload', documentType: 'PAN Card', isPDF: false, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);
      } else if (currentStep === 18) {
        if (!nextState.pan_card) return prev;
        nextState.step = 19;
        setMessages(msgs => [
          ...msgs,
          { sender: 'ai', text: 'PAN Card uploaded! Do you have an ITR?', type: 'option_chips', options: ['yes', 'no'], time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);
      } else if (currentStep === 20) {
        if (!nextState.itr_file) return prev;
        nextState.step = 21;
        setMessages(msgs => [
          ...msgs,
          { sender: 'ai', text: 'ITR uploaded! Please enter the Patient\'s Age:', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);
      }
      return nextState;
    });
  };
  const handleSaveEmiApplication = async (applicationData) => {
    setIsTyping(true);
    try {
      const userObj = getUserData();
      if (!userObj.token) {
        throw new Error('Authentication token is missing. Please login again.');
      }

      const response = await fetch(`${API_BASE_URL}/user/emidocuments/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': userObj.token
        },
        body: JSON.stringify({
          full_name: applicationData.full_name,
          marital_status: applicationData.marital_status,
          dob: applicationData.dob,
          pan_no: applicationData.pan_no,
          aadhar_no: applicationData.aadhar_no,
          pincode: applicationData.pincode,
          employment_type: applicationData.employment_type,
          monthly_income: applicationData.monthly_income,
          hospital_name: applicationData.hospital_name,
          nabh_status: applicationData.nabh_status,
          patient_name: applicationData.patient_name,
          relationship_proof: applicationData.relationship_proof,
          treatment_type: applicationData.treatment_type,
          estimated_amount: applicationData.estimated_amount,
          hospital_quotation: applicationData.hospital_quotation,
          medical_estimate: applicationData.hospital_quotation, // Backend compatibility
          insurance: applicationData.insurance_card || applicationData.hospital_quotation, // Backend compatibility
          reports: applicationData.hospital_quotation, // Backend compatibility
          prescription: applicationData.prescription,
          aadhaar_card: applicationData.aadhaar_card,
          pan_card: applicationData.pan_card,
          itr_status: applicationData.itr_status,
          itr_file: applicationData.itr_file,
          patient_age: applicationData.patient_age,
          alternate_no: applicationData.alternate_no
        })
      });

      const resData = await response.json();
      if (response.ok && (resData.Status === 200 || resData.IsSuccess)) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: '🎉 Success! Your Bill EMI Application has been submitted. Our team will review the documents and update your status within 24 hours.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setUploadState({ isActive: false });
      } else {
        throw new Error(resData.Message || 'Failed to save application. Please try again.');
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `⚠️ Submission failed: ${err.message}. Please try confirming again.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };
  const startEmiStatusCheck = async () => {
    setIsTyping(true);
    try {
      const userObj = getUserData();
      const isLoggedIn = !!(userObj.token && userObj.name);

      setBookingState(prev => ({ ...prev, isActive: false }));
      setAptBookingState(prev => ({ ...prev, isActive: false }));
      setUploadState(prev => ({ ...prev, isActive: false }));

      if (isLoggedIn && userObj.role === 'doctor') {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: 'EMI application status is available for patient accounts. Please log in as a patient to check your Bill EMI status, or use the patient portal.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else if (isLoggedIn) {
        setStatusCheckState({
          isActive: true,
          step: 1,
          name: userObj.name,
          mobile: userObj.mobile,
          isExistingUser: false
        });
        await fetchAndDisplayEmiStatus(userObj.token, 'user');
      } else {
        setStatusCheckState({
          isActive: true,
          step: -2,
          name: '',
          mobile: '',
          isExistingUser: false
        });
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: `Welcome to EMI Status Check! To retrieve your status, please enter your Full Name:`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  const fetchAndDisplayEmiStatus = async (token, prefix = 'user') => {
    setIsTyping(true);
    const url = `${API_BASE_URL}/${prefix}/emidocuments/status`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      });
      const data = await response.json();
      if (response.ok && (data.Status === 200 || data.IsSuccess)) {
        const apps = Array.isArray(data.Data) ? data.Data : [];
        if (apps.length === 0) {
          setMessages(prev => [
            ...prev,
            {
              sender: 'ai',
              text: `🔍 We couldn't find any Health EMI application for your account. You can apply for a Bill EMI using the "Apply for Medical Loan" action!`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        } else {
          setMessages(prev => [
            ...prev,
            {
              sender: 'ai',
              type: 'emi_status_table',
              applications: apps,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }
      } else {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: `⚠️ Failed to retrieve status: ${data.Message || 'Server error'}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      console.error(`fetchAndDisplayEmiStatus failed for URL: ${url}`, err);
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `⚠️ Network error occurred while fetching your status: ${err.message}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
      setStatusCheckState({ isActive: false });
    }
  };

  const handleStatusCheckStepInput = async (text) => {
    const nextState = { ...statusCheckState };

    if (nextState.step === -2) {
      if (!text.trim()) return;
      nextState.name = text.trim();
      nextState.step = -1;
      setStatusCheckState(nextState);

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Thanks ${nextState.name}! Now, please enter your 10-digit mobile number:`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      return;
    }

    if (nextState.step === -1) {
      const mobileVal = text.trim();
      if (!/^\d{10}$/.test(mobileVal)) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: '⚠️ Please enter a valid 10-digit mobile number:',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        return;
      }

      setIsTyping(true);
      try {
        const response = await fetch(`${API_BASE_URL}/user/forgetpassword`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobile: mobileVal })
        });
        const resData = await response.json();

        if (response.ok || resData.Status === 200 || resData.IsSuccess) {
          nextState.mobile = mobileVal;
          nextState.step = 0;
          nextState.isExistingUser = true;
          setStatusCheckState(nextState);

          setMessages(prev => [
            ...prev,
            {
              sender: 'ai',
              text: `🔑 OTP Code sent to ${mobileVal}. Please enter the OTP code to verify and log in:`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        } else {
          nextState.mobile = mobileVal;
          nextState.isExistingUser = false;
          nextState.step = -11;
          setStatusCheckState(nextState);

          setMessages(prev => [
            ...prev,
            {
              sender: 'ai',
              text: `We couldn't find an existing account with that mobile number. Let's register you first to set up your EMI profile.\n\nPlease enter your Email Address:`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }
      } catch (err) {
        console.error(err);
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: `⚠️ Network error: ${err.message}. Please try again:`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } finally {
        setIsTyping(false);
      }
      return;
    }

    if (nextState.step === -11) {
      const emailVal = text.trim();
      if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailVal)) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: '⚠️ Please enter a valid Email Address:',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        return;
      }
      nextState.email = emailVal;
      nextState.step = -12;
      setStatusCheckState(nextState);

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Thanks! Please enter your Gender (Male / Female / Other):`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      return;
    }

    if (nextState.step === -12) {
      const genderVal = text.trim();
      if (!genderVal) return;
      nextState.gender = genderVal;
      nextState.step = -13;
      setStatusCheckState(nextState);

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Got it. Now, please enter your 6-digit Pincode:`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      return;
    }

    if (nextState.step === -13) {
      const pinVal = text.trim();
      if (!/^\d{6}$/.test(pinVal)) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: '⚠️ Please enter a valid 6-digit Pincode:',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        return;
      }
      nextState.pincode = pinVal;
      nextState.step = -14;
      setStatusCheckState(nextState);

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Thanks! What is your Blood Group (e.g., A+, O-, B+, etc.)?`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      return;
    }

    if (nextState.step === -14) {
      const bgVal = text.trim();
      if (!bgVal) return;
      nextState.blood_group = bgVal;
      setStatusCheckState(nextState);

      setIsTyping(true);
      try {
        const response = await fetch(`${API_BASE_URL}/user/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: nextState.name,
            mobile: nextState.mobile,
            email: nextState.email,
            gender: nextState.gender,
            pincode: Number(nextState.pincode),
            blood_group: nextState.blood_group,
            password: 'Welcome@123'
          })
        });
        const resData = await response.json();

        if (response.ok || resData.Status === 200) {
          nextState.step = 0;
          setStatusCheckState(nextState);

          setMessages(prev => [
            ...prev,
            {
              sender: 'ai',
              text: `🔑 A verification OTP code has been sent to your email. Please enter the OTP below to complete registration:`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        } else {
          setMessages(prev => [
            ...prev,
            {
              sender: 'ai',
              text: `⚠️ Registration failed: ${resData.Message || 'Server error'}. Let's try again. Please enter your Email Address:`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
          nextState.step = -11;
          setStatusCheckState(nextState);
        }
      } catch (err) {
        console.error(err);
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: `⚠️ Network error: ${err.message}. Please enter your Email Address to try again:`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        nextState.step = -11;
        setStatusCheckState(nextState);
      } finally {
        setIsTyping(false);
      }
      return;
    }

    if (nextState.step === 0) {
      const otpVal = text.trim();
      if (!otpVal) return;

      setIsTyping(true);
      try {
        if (nextState.isExistingUser) {
          const verifyResponse = await fetch(`${API_BASE_URL}/user/forgetpassword/verifyotp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobile: nextState.mobile, otp: otpVal })
          });
          const verifyData = await verifyResponse.json();

          if (!verifyResponse.ok || (verifyData.Status && verifyData.Status !== 200)) {
            throw new Error(verifyData.Message || 'OTP verification failed');
          }

          const setPassResponse = await fetch(`${API_BASE_URL}/user/forgetpassword/setpassword`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobile: nextState.mobile, password: 'Welcome@123' })
          });
          const setPassData = await setPassResponse.json();

          if (!setPassResponse.ok || (setPassData.Status && setPassData.Status !== 200)) {
            throw new Error(setPassData.Message || 'Failed to authenticate after OTP verification');
          }

          const encrypted = CryptoJS.AES.encrypt(JSON.stringify(setPassData.Data), SECRET_KEY).toString();
          localStorage.setItem(STORAGE_KEYS.PATIENT, encrypted);

          nextState.step = 1;
          nextState.isExistingUser = false;
          setStatusCheckState(nextState);

          setMessages(prev => [
            ...prev,
            {
              sender: 'ai',
              text: `🎉 Verification successful! Logged in as ${setPassData.Data.userData?.name || nextState.name}.`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);

          await fetchAndDisplayEmiStatus("Bearer " + setPassData.Data.accessToken, "user");
        } else {
          const response = await fetch(`${API_BASE_URL}/user/signup/otpverification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: nextState.email, otp: otpVal })
          });
          const resData = await response.json();

          if (response.ok || resData.Status === 200) {
            const encrypted = CryptoJS.AES.encrypt(JSON.stringify(resData.Data), SECRET_KEY).toString();
            localStorage.setItem(STORAGE_KEYS.PATIENT, encrypted);

            nextState.step = 1;
            setStatusCheckState(nextState);

            setMessages(prev => [
              ...prev,
              {
                sender: 'ai',
                text: `🎉 Account verified and logged in successfully as ${resData.Data.userData?.name || nextState.name}.`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]);

            await fetchAndDisplayEmiStatus("Bearer " + resData.Data.accessToken, "user");
          } else {
            throw new Error(resData.Message || 'OTP Verification failed');
          }
        }
      } catch (err) {
        console.error(err);
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: `❌ Verification failed: ${err.message || 'Incorrect OTP code'}. Please try entering the OTP again:`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const startTalkToExpert = async () => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          type: 'talk_to_expert',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }, 600);
  };

  const handleCancelEmiApplication = () => {
    setMessages(prev => [
      ...prev,
      {
        sender: 'ai',
        text: '❌ EMI Document upload cancelled.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setUploadState({ isActive: false });
  };

  // Quick replies configuration
  const defaultQuickReplies = [
    { text: 'Find Hospital / Doctor', action: 'find' },
    { text: 'Ambulance Booking', action: 'ambulance' },
    { text: 'Book Appointment with Doctor', action: 'book' },
    { text: 'Book Surgery Appointment', action: 'surgery' },
    { text: 'Apply for Medical Loan', action: 'upload' },
    { text: 'EMI Status Check', action: 'emi' },
    { text: 'Talk to Expert', action: 'expert' }
  ];

  const getQuickReplies = () => {
    if (bookingState.isActive) {
      if (bookingState.step === 12) {
        return [
          { text: 'Male' },
          { text: 'Female' }
        ];
      }
      if (bookingState.step === 14) {
        return [
          { text: 'O+' },
          { text: 'A+' },
          { text: 'B+' },
          { text: 'AB+' }
        ];
      }
      if (bookingState.step === 1 || bookingState.step === 2) {
        return [
          { text: 'Next' }
        ];
      }
      return [];
    }
    if (aptBookingState.isActive) {
      if (aptBookingState.step === 1) {
        return (aptBookingState.hospitalsList || []).map(h => ({ text: h }));
      }
      if (aptBookingState.step === 2) {
        return (aptBookingState.specialitiesList || []).map(s => ({ text: s }));
      }
      if (aptBookingState.step === 4) {
        const doc = aptBookingState.doctor;
        const consult = doc?.consultationsDetails;
        const opts = [];
        if (consult?.clinic_visit_price > 0) opts.push({ text: 'Clinic Visit' });
        if (consult?.home_visit_price > 0) opts.push({ text: 'Home Visit' });
        if (consult?.eopd_price > 0) opts.push({ text: 'E-OPD' });
        if (opts.length === 0) return [{ text: 'Clinic Visit' }, { text: 'E-OPD' }];
        return opts;
      }
      if (aptBookingState.step === 5) {
        return [{ text: 'Today' }, { text: 'Tomorrow' }];
      }
      if (aptBookingState.step === 6) {
        const availableSlots = getAvailableTimeSlots(
          aptBookingState.bookedSlots,
          aptBookingState.date
        );
        if (availableSlots.length === 0) {
          return [{ text: 'No slots available for this date', disabled: true }];
        }
        return availableSlots.map(s => ({ text: s }));
      }
      if (aptBookingState.step === 14) {
        return [{ text: 'Male' }, { text: 'Female' }];
      }
      if (aptBookingState.step === 16) {
        return [{ text: 'O+' }, { text: 'A+' }, { text: 'B+' }, { text: 'AB+' }];
      }
      return [];
    }
    if (surgBookingState.isActive) {
      if (surgBookingState.step === 1) {
        return (surgBookingState.hospitalsList || []).map(h => ({ text: h }));
      }
      if (surgBookingState.step === 3) {
        const surgeries = surgBookingState.doctor?.surgeriesDetails || [];
        return surgeries.map(s => ({ text: s.name || s.surgerytypeid?.surgerytypename || 'Surgery' }));
      }
      if (surgBookingState.step === 4) {
        return [{ text: 'General' }, { text: 'SemiPrivate' }, { text: 'Private' }, { text: 'Delux' }];
      }
      if (surgBookingState.step === 5) {
        return [{ text: 'Today' }, { text: 'Tomorrow' }];
      }
      if (surgBookingState.step === 6) {
        const availableSlots = getAvailableTimeSlots(
          surgBookingState.bookedSlots,
          surgBookingState.date
        );
        if (availableSlots.length === 0) {
          return [{ text: 'No slots available for this date', disabled: true }];
        }
        return availableSlots.map(s => ({ text: s }));
      }
      return [];
    }
    return [];
  };

  const getFilteredSuggestions = () => {
    if (!input.trim() || bookingState.isActive || aptBookingState.isActive || surgBookingState.isActive) return [];
    return defaultQuickReplies.filter(reply => 
      reply.text.toLowerCase().includes(input.trim().toLowerCase())
    );
  };

  const handleQuickReply = (replyText) => {
    setShowSuggestionsDrawer(false);
    handleSendMessage(replyText);
  };

  const handleSendMessage = async (textToSend, isHidden = false) => {
    const text = typeof textToSend === 'string' ? textToSend : input;
    if (!text.trim()) return;

    if (!isHidden) {
      const newUserMsg = {
        sender: 'user',
        text: text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, newUserMsg]);
    }
    
    setInput('');
    // Prevent double-firing if bot is still processing previous message
    if (isTyping) return;

    setShowSuggestionsDrawer(false);



    const lowerText = text.toLowerCase();
    
    const CORE_TRIGGERS = [
      'Ambulance Booking',
      'Book Appointment with Doctor',
      'Book Surgery Appointment',
      'Apply for Medical Loan',
      'EMI Status Check',
      'Talk to Expert',
      'Find Hospital / Doctor'
    ];
    
    const isCoreTrigger = 
      CORE_TRIGGERS.includes(text) || 
      ['cancel', 'stop', 'exit', 'quit', 'abort'].includes(lowerText) ||
      /book.*ambulance/i.test(lowerText) ||
      /book.*appointment/i.test(lowerText) ||
      /book.*dr/i.test(lowerText) ||
      /book.*doctor/i.test(lowerText) ||
      /book.*surgery/i.test(lowerText) ||
      /apply.*medical loan/i.test(lowerText) ||
      /check.*emi/i.test(lowerText) ||
      /emi.*status/i.test(lowerText);
    
    if (isCoreTrigger) {
      setBookingState(prev => ({...prev, isActive: false}));
      setAptBookingState(prev => ({...prev, isActive: false}));
      setSurgBookingState(prev => ({...prev, isActive: false}));
      setUploadState(prev => ({...prev, isActive: false}));
      setStatusCheckState(prev => ({...prev, isActive: false}));

      if (['cancel', 'stop', 'exit', 'quit', 'abort'].includes(lowerText)) {
        if (!isHidden) {
          setMessages(prev => [...prev, { 
            sender: 'ai', 
            text: 'Current process cancelled. How else can I help you today?', 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
          }]);
        }
        return;
      }
    } else {
      if (uploadState.isActive) {
        await handleUploadStepInput(text);
        return;
      }
      
      if (statusCheckState.isActive) {
        await handleStatusCheckStepInput(text);
        return;
      }
      
      if (bookingState.isActive) {
        await handleBookingStepInput(text);
        return;
      }

      if (aptBookingState.isActive) {
        await handleAptBookingStepInput(text);
        return;
      }

      if (surgBookingState.isActive) {
        await handleSurgBookingStepInput(text);
        return;
      }
    }

    if (text === 'Apply for Medical Loan' || /apply.*medical loan/i.test(lowerText) || lowerText.includes('upload documents') || lowerText.includes('bill emi')) {
      await startEmiDocumentUpload();
      return;
    }

    if (text === 'EMI Status Check' || /check.*emi/i.test(lowerText) || /emi.*status/i.test(lowerText)) {
      await startEmiStatusCheck();
      return;
    }

    if (text === 'Talk to Expert' || lowerText.includes('talk to expert') || lowerText.includes('expert')) {
      await startTalkToExpert();
      return;
    }

    if (text === 'Find Hospital / Doctor' || lowerText.includes('find hospital') || lowerText.includes('find doctor')) {
      await fetchHospitalsAndDoctors(text);
      return;
    }

    if (text === 'Book Surgery Appointment' || /book.*surgery/i.test(lowerText)) {
      await fetchDoctorsNearbyAndShowVerticalList();
      return;
    }

    if (text === 'Book Appointment with Doctor' || /book.*appointment/i.test(lowerText) || lowerText.includes('clinic visit') || lowerText.includes('eopd') || /book.*dr/i.test(lowerText) || /book.*doctor/i.test(lowerText)) {
      await fetchDoctorsNearbyAndShowVerticalList();
      return;
    }

    if (text === 'Ambulance Booking' || /book.*ambulance/i.test(lowerText)) {
      const userObj = getUserData();
      const initialName = userObj.name || '';
      const initialMobile = userObj.mobile || '';
      const isLoggedIn = !!(userObj.token && initialName && initialMobile);

      const initState = {
        isActive: true,
        step: isLoggedIn ? 3 : 1,
        name: initialName || 'Guest',
        mobile: initialMobile || '',
        pickupaddress: '',
        pickup_latitude: null,
        pickup_longitude: null,
        dropaddress: '',
        drop_latitude: null,
        drop_longitude: null,
        distance: 0,
        vehiclePrices: {},
        platformFee: 0,
        selectedVehicle: '',
        selectedCategory: '',
        selectedPrice: 0,
        isExistingUser: false
      };
      setBookingState(initState);

      if (isLoggedIn) {
        // User is logged in — skip name/mobile steps
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: `🚨 Immediate Ambulance Booking\n\nWelcome, ${initialName}! Booking for mobile: ${initialMobile}.\n\nPlease enter the Pickup Address (e.g. "Lilavati Hospital, Bandra"):`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: `🚨 Immediate Ambulance Booking\n\nLet's get the details sorted. Please enter the Passenger Name (or send 'next' to use Guest):`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
      return;
    }

    setIsTyping(true);

    try {
      let contextText = cachedContext;
      let payload = siteContextPayload;
      if (!contextText || !payload) {
        const loaded = await refreshChatbotContext();
        contextText = loaded?.contextText || '';
        payload = loaded?.payload || null;
      }

      const userObj = getUserData();

      let rawBotResponse = '';

      if (isDemoMode) {
        rawBotResponse = generateDemoReply(text, payload, userObj);
      } else {
        const systemPromptContent = buildHealthBotSystemPrompt({
          siteContextBlock: contextText,
          userContextBlock: buildUserContextBlock(userObj),
        });

        const systemPrompt = { role: 'system', content: systemPromptContent };

        const recentMessages = messages
          .filter((m) => m.text && !m.type)
          .slice(-12)
          .map((m) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text,
          }));

        const response = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [...[systemPrompt], ...recentMessages, { role: 'user', content: text }],
            temperature: 0.4,
            max_tokens: 500,
            stream: false,
          }),
        });

        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`);
        }

        const data = await response.json();
        rawBotResponse = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response. Please try again.';
      }

      let processedResponse = rawBotResponse.replace(/\*\*/g, '').replace(/\*/g, '');
      let triggerAction = null;

      if (processedResponse.includes('[TRIGGER_AMBULANCE]')) { triggerAction = 'Ambulance Booking'; processedResponse = processedResponse.replace(/\[TRIGGER_AMBULANCE\]/g, ''); }
      else if (processedResponse.includes('[TRIGGER_DOCTOR]')) { triggerAction = 'Book Appointment with Doctor'; processedResponse = processedResponse.replace(/\[TRIGGER_DOCTOR\]/g, ''); }
      else if (processedResponse.includes('[TRIGGER_SURGERY]')) { triggerAction = 'Book Surgery Appointment'; processedResponse = processedResponse.replace(/\[TRIGGER_SURGERY\]/g, ''); }
      else if (processedResponse.includes('[TRIGGER_LOAN]')) { triggerAction = 'Apply for Medical Loan'; processedResponse = processedResponse.replace(/\[TRIGGER_LOAN\]/g, ''); }
      else if (processedResponse.includes('[TRIGGER_EMI]')) { triggerAction = 'EMI Status Check'; processedResponse = processedResponse.replace(/\[TRIGGER_EMI\]/g, ''); }
      else if (processedResponse.includes('[TRIGGER_EXPERT]')) { triggerAction = 'Talk to Expert'; processedResponse = processedResponse.replace(/\[TRIGGER_EXPERT\]/g, ''); }
      else if (processedResponse.includes('[TRIGGER_FIND]')) { triggerAction = 'Find Hospital / Doctor'; processedResponse = processedResponse.replace(/\[TRIGGER_FIND\]/g, ''); }

      const botMessage = {
        sender: 'ai',
        text: processedResponse.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);

      if (triggerAction) {
        setTimeout(() => {
          handleSendMessage(triggerAction, true);
        }, 800);
      }
    } catch (error) {
      console.error('ChatBot API error:', error);
      const errorMessage = {
        sender: 'ai',
        text: 'Sorry, I encountered an issue connecting to the DeepSeek server. Please check the network connection or try again later.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Utility to convert inline markdown-like links e.g. [Link Text](/path) to interactive anchors
  const renderMessageText = (text) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      const matchIndex = match.index;
      // Add text before match
      if (matchIndex > lastIndex) {
        parts.push(text.substring(lastIndex, matchIndex));
      }

      const linkText = match[1];
      const linkPath = match[2];

      // Add React Router navigation link
      parts.push(
        <span 
          key={matchIndex} 
          onClick={() => {
            setIsOpen(false); // close chatbot window when navigating
            navigate(linkPath);
          }}
          style={{ color: '#064894', textDecoration: 'underline', cursor: 'pointer', fontWeight: '500' }}
        >
          {linkText}
        </span>
      );

      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="chatbot-container">
      {/* 24/7 Tooltip */}
      {showTooltip && !isOpen && (
        <div className="chatbot-tooltip">
          We are Online 24/7
          <div className="chatbot-tooltip-arrow"></div>
        </div>
      )}

      {/* Floating launcher action button */}
      <button className="chatbot-launcher" onClick={toggleChat} aria-label="Toggle chat">
        {isOpen ? <IoCloseOutline style={{ fontSize: '32px' }} /> : <img src={CHAT_ICON_GIF} alt="Chat" className="chatbot-icon-gif" />}
      </button>

      {/* Chat Window widget */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header Panel */}
          <div className="chatbot-header">
            <div className="chatbot-header-top">
              <div className="chatbot-profile-info">
                <img src={AVATAR_URL} alt="HealthBot" className="chatbot-avatar" />
                <div className="chatbot-title-container">
                  <span className="chatbot-header-label">Chat with</span>
                  <span className="chatbot-agent-name">HealthBot</span>
                </div>
              </div>
              <div className="chatbot-header-actions">
                <button className="chatbot-header-btn" onClick={toggleChat}>
                  <IoCloseOutline />
                </button>
              </div>
            </div>
            <div className="chatbot-header-chips">
              {defaultQuickReplies.map((reply, i) => (
                <button
                  key={i}
                  className="chatbot-header-chip"
                  onClick={() => handleQuickReply(reply.text)}
                >
                  {reply.text}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Board */}
          <div className="chatbot-messages">
            {messages.map((msg, index) => {
              const isSent = msg.sender === 'user';
              return (
                <div key={index} className={`chatbot-msg-row ${isSent ? 'sent' : 'received'}`}>
                  {!isSent && <img src={AVATAR_URL} alt="HealthBot" className="chatbot-msg-avatar" />}
                  {msg.type === 'doctor_vertical_cards' ? (
                    <DoctorVerticalCards 
                      doctors={msg.doctors} 
                      onNavigate={(path) => {
                        setIsOpen(false);
                        navigate(path);
                      }}
                    />
                  ) : msg.type === 'hospital_doctor_cards' ? (
                    <HospitalDoctorCards 
                      hospitals={msg.hospitals} 
                      doctors={msg.doctors} 
                      defaultTab={msg.defaultTab}
                      onNavigate={(path) => {
                        setIsOpen(false);
                        navigate(path);
                      }}
                    />
                  ) : msg.type === 'doctor_chips' ? (
                    <DoctorChips 
                      doctors={msg.doctors} 
                      onSelect={(doc) => {
                        if (surgBookingState.isActive) handleSurgDoctorChipSelect(doc);
                        else handleDoctorChipSelect(doc);
                      }} 
                    />
                  ) : msg.type === 'option_chips' ? (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div className="chatbot-message">
                        {renderMessageText(msg.text)}
                      </div>
                      <OptionChips 
                        options={msg.options} 
                        onSelect={(opt) => handleSendMessage(opt)} 
                      />
                    </div>
                  ) : msg.type === 'date_picker' ? (
                    <DatePickerWidget 
                      doctorId={surgBookingState.isActive ? surgBookingState.doctor?._id : aptBookingState.doctor?._id}
                      minBookingDate={(() => {
                        if (surgBookingState.isActive) {
                          const t = new Date();
                          t.setDate(t.getDate() + 1);
                          t.setHours(0, 0, 0, 0);
                          return t;
                        }
                        return new Date();
                      })()}
                      onSelect={(formattedDate) => {
                        if (surgBookingState.isActive) handleSurgBookingStepInput(formattedDate);
                        else handleAptBookingStepInput(formattedDate);
                      }}
                    />
                  ) : msg.type === 'appointment_booking_confirm' ? (
                    <AppointmentBookingConfirm
                      aptState={msg.aptState}
                      onConfirm={handleSaveDoctorAppointment}
                      onCancel={handleCancelDoctorAppointment}
                    />
                  ) : msg.type === 'surgery_booking_confirm' ? (
                    <SurgeryBookingConfirm
                      surgState={msg.surgState}
                      onConfirm={handleSaveSurgeryAppointment}
                      onCancel={handleCancelSurgeryAppointment}
                    />
                  ) : msg.type === 'ambulance_vehicle_select' ? (
                    <AmbulanceVehicleSelect
                      bookingState={msg.bookingState}
                      onSelect={(opt) => {
                        const nextBookingState = {
                          ...bookingState,
                          selectedVehicle: opt.type,
                          selectedCategory: opt.cat,
                          selectedPrice: opt.price,
                          step: 6
                        };
                        setBookingState(nextBookingState);
                        setMessages(prev => [
                          ...prev,
                          {
                            sender: 'ai',
                            type: 'ambulance_booking_confirm',
                            bookingState: nextBookingState,
                            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          }
                        ]);
                      }}
                    />
                  ) : msg.type === 'ambulance_booking_confirm' ? (
                    <AmbulanceBookingConfirm
                      bookingState={msg.bookingState}
                      onConfirm={handleSaveAmbulanceBooking}
                      onCancel={handleCancelAmbulanceBooking}
                    />
                  ) : msg.type === 'emi_doc_upload' ? (
                    <EmiDocUploadWidget
                      documentType={msg.documentType}
                      isPDF={msg.isPDF}
                      skippable={msg.skippable}
                      onUploadSuccess={handleEmiUploadSuccess}
                      onNext={handleEmiNextStep}
                      currentValue={
                        msg.documentType === 'Aadhaar Card' ? uploadState.aadhaar_card :
                        msg.documentType === 'PAN Card' ? uploadState.pan_card :
                        msg.documentType === 'Prescription' ? uploadState.prescription :
                        msg.documentType === 'Insurance Card' ? uploadState.insurance_card :
                        msg.documentType === 'Relationship Proof' ? uploadState.relationship_proof :
                        msg.documentType === 'Hospital Quotation' ? uploadState.hospital_quotation :
                        msg.documentType === 'ITR File' ? uploadState.itr_file :
                        ''
                      }
                    />
                  ) : msg.type === 'emi_application_summary' ? (
                    <EmiApplicationSummary
                      application={msg.application}
                      onConfirm={() => handleSaveEmiApplication(msg.application)}
                      onCancel={handleCancelEmiApplication}
                    />
                  ) : msg.type === 'emi_status_table' ? (
                    <EmiStatusTable applications={msg.applications} />
                  ) : msg.type === 'talk_to_expert' ? (
                    <div className="chatbot-expert-widget">
                      <div className="chatbot-expert-text">
                        Our medical counselors and customer care experts are here to help you:
                      </div>
                      <div className="chatbot-expert-buttons">
                        <a 
                          href="mailto:healtheasyemi@gmail.com" 
                          className="chatbot-expert-btn email-btn"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          📧 healtheasyemi@gmail.com
                        </a>
                        <a 
                          href="tel:+918855919195" 
                          className="chatbot-expert-btn call-btn"
                        >
                          📞 +91 8855919195
                        </a>
                        <a 
                          href="https://wa.me/918855919195" 
                          className="chatbot-expert-btn whatsapp-btn"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          💬 Chat on WhatsApp
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="chatbot-message">
                      {renderMessageText(msg.text)}
                    </div>
                  )}
                  {isSent && <img src={USER_AVATAR_URL} alt="User" className="chatbot-msg-avatar" />}
                </div>
              );
            })}
            
            {/* Show typing status */}
            {isTyping && (
              <div className="chatbot-msg-row received">
                <img src={AVATAR_URL} alt="HealthBot" className="chatbot-msg-avatar" />
                <div className="chatbot-message">
                  <div className="chatbot-typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            

            {/* Quick replies for step-specific items like Gender, Blood Group */}
            {!isTyping && messages[messages.length - 1]?.sender === 'ai' && getQuickReplies().length > 0 && (
              <div className="chatbot-quick-replies">
                {getQuickReplies().map((reply, i) => (
                  <button 
                    key={i} 
                    className={reply.disabled ? "chatbot-quick-btn-disabled" : "chatbot-quick-btn"}
                    disabled={reply.disabled}
                    onClick={() => !reply.disabled && handleQuickReply(reply.text)}
                  >
                    {reply.text}
                  </button>
                ))}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Type Suggestions pill list */}
          {!bookingState.isActive && getFilteredSuggestions().length > 0 && (
            <div className="chatbot-type-suggestions">
              {getFilteredSuggestions().map((reply, i) => (
                <button
                  key={i}
                  className="chatbot-suggestion-pill"
                  onClick={() => handleQuickReply(reply.text)}
                >
                  {reply.text}
                </button>
              ))}
            </div>
          )}


          {/* Demo Mode banner info */}
          {isDemoMode && (
            <div className="chatbot-demo-banner">
              {contextReady && siteContextPayload
                ? `Demo Mode (live data: ${siteContextPayload.meta.totalDoctors} doctors, ${siteContextPayload.meta.totalHospitals} hospitals). Add REACT_APP_DEEPSEEK_API_KEY for full AI.`
                : 'Demo Mode — loading platform data… Add REACT_APP_DEEPSEEK_API_KEY for DeepSeek AI.'}
            </div>
          )}
          {!isDemoMode && contextReady && siteContextPayload && (
            <div className="chatbot-demo-banner" style={{ background: '#e8f5e9', color: '#2e7d32' }}>
              HealthBot AI · {siteContextPayload.meta.totalDoctors} doctors · {siteContextPayload.meta.totalHospitals} hospitals located
            </div>
          )}

          {/* Footer Input Area */}
          <div className="chatbot-footer-container">
            <div className="chatbot-footer">
              <div className="chatbot-footer-icons">
                <button 
                  className={`chatbot-footer-icon-btn ${showSuggestionsDrawer ? 'active' : ''}`}
                  title="Quick Actions Menu"
                  onClick={() => setShowSuggestionsDrawer(prev => !prev)}
                >
                  <FaListUl />
                </button>
              </div>
              <input
                type="text"
                className="chatbot-input"
                placeholder="Enter your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isTyping}
              />
              <button 
                type="button"
                className="chatbot-send-btn" 
                onClick={() => handleSendMessage(input)}
                disabled={!input.trim() || isTyping}
                style={{ zIndex: 10 }}
              >
                <IoSendSharp style={{ pointerEvents: 'none' }} />
              </button>
            </div>
            
            <div className="chatbot-brand-tag">
              Powered By <strong>Health Easy EMI</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
