import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import DoctorSidebar from './DoctorSidebar';
import DoctorNav from './DoctorNav';
import axios from 'axios';
import Swal from 'sweetalert2';
import CryptoJS from 'crypto-js';
import Loader from '../Loader';
import { FaAmbulance, FaLocationArrow, FaMapMarkerAlt, FaRoute } from 'react-icons/fa';

const D_AmbulanceRequest = () => {
  const SECRET_KEY = 'health-emi';
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [doctor, setDoctor] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    let data;
    const getlocaldata = localStorage.getItem('healthdoctor');
    if (getlocaldata != null) {
      const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      data = JSON.parse(decrypted);
    }
    if (!data) {
      navigate('/doctor');
    } else {
      setDoctor(data.doctorData);
      setToken(`Bearer ${data.accessToken}`);
    }
  }, [navigate]);

  const [form, setForm] = useState({
    pickupaddress: '',
    pickup_longitude: '',
    pickup_latitude: '',
    dropaddress: '',
    drop_longitude: '',
    drop_latitude: ''
  });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const getCurrentLocation = (type) => {
    if (!navigator.geolocation) {
      Swal.fire({ title: 'Geolocation not supported', icon: 'warning' });
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (type === 'pickup') {
          setForm((prev) => ({
            ...prev,
            pickup_latitude: latitude,
            pickup_longitude: longitude,
          }));
        } else {
          setForm((prev) => ({
            ...prev,
            drop_latitude: latitude,
            drop_longitude: longitude,
          }));
        }
        setLoading(false);
        Swal.fire({ title: 'Location captured', icon: 'success', timer: 1200, showConfirmButton: false });
      },
      (err) => {
        console.error(err);
        setLoading(false);
        Swal.fire({ title: 'Failed to get location', text: err.message, icon: 'error' });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const validate = () => {
    const required = [
      'pickupaddress',
      'pickup_longitude',
      'pickup_latitude',
      'dropaddress',
      'drop_longitude',
      'drop_latitude',
    ];
    for (const key of required) {
      if (form[key] === '' || form[key] === null || form[key] === undefined) {
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      Swal.fire({ title: 'Please fill all fields', icon: 'warning' });
      return;
    }
    setLoading(true);
    await axios({
      method: 'post',
      url: 'https://healtheasy-o25g.onrender.com/doctor/ambulancerequests/save',
      headers: {
        Authorization: token,
      },
      data: {
        pickupaddress: form.pickupaddress,
        pickup_longitude: Number(form.pickup_longitude),
        pickup_latitude: Number(form.pickup_latitude),
        dropaddress: form.dropaddress,
        drop_longitude: Number(form.drop_longitude),
        drop_latitude: Number(form.drop_latitude),
      },
    })
      .then((res) => {
        Swal.fire({
          title: 'Ambulance Requested',
          text: 'Your request has been submitted successfully.',
          icon: 'success',
        });
        // Reset form
        setForm({
          pickupaddress: '',
          pickup_longitude: '',
          pickup_latitude: '',
          dropaddress: '',
          drop_longitude: '',
          drop_latitude: '',
        });
      })
      .catch((error) => {
        console.error(error);
        Swal.fire({
          title: 'Failed to submit',
          text: error?.response?.data?.Message || 'Something went wrong, please try again.',
          icon: 'error',
        });
      })
      .finally(() => setLoading(false));
  };

  return (
    <>
      <Container fluid className="p-0 panel">
        <Row className="g-0">
          <DoctorSidebar />
          <Col xs={12} md={9} lg={10} className="p-3">
            <DoctorNav doctorname={doctor && doctor.name} />
            <div className="bg-white rounded p-2">
              <div className="p-4 rounded" style={{
                background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 50%, #DBEAFE 100%)',
              }}>
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, background: '#4F46E5', color: 'white' }}>
                    <FaAmbulance size={22} />
                  </div>
                  <div>
                    <h4 className="m-0" style={{ color: '#111827' }}>Book Ambulance</h4>
                    <div className="text-muted">Request an ambulance for your patient with precise pickup and drop details.</div>
                  </div>
                </div>
              </div>

              <Card className="mt-3 shadow-sm border-0">
                <Card.Body className="p-4">
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6} className="mb-4">
                        <div className="d-flex align-items-center mb-2" style={{ color: '#374151' }}>
                          <FaMapMarkerAlt className="me-2" />
                          <h6 className="m-0">Pickup Location</h6>
                        </div>
                        <Form.Group className="mb-3">
                          <Form.Label>Pickup Address</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter pickup address"
                            name="pickupaddress"
                            value={form.pickupaddress}
                            onChange={onChange}
                          />
                        </Form.Group>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Pickup Latitude</Form.Label>
                              <Form.Control
                                type="number"
                                step="any"
                                placeholder="e.g. 21.23007"
                                name="pickup_latitude"
                                value={form.pickup_latitude}
                                onChange={onChange}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Pickup Longitude</Form.Label>
                              <Form.Control
                                type="number"
                                step="any"
                                placeholder="e.g. 72.82851"
                                name="pickup_longitude"
                                value={form.pickup_longitude}
                                onChange={onChange}
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Button variant="outline-primary" size="sm" type="button" onClick={() => getCurrentLocation('pickup')}>
                          <FaLocationArrow className="me-2" /> Use Current Location
                        </Button>
                      </Col>

                      <Col md={6} className="mb-4">
                        <div className="d-flex align-items-center mb-2" style={{ color: '#374151' }}>
                          <FaRoute className="me-2" />
                          <h6 className="m-0">Drop Location</h6>
                        </div>
                        <Form.Group className="mb-3">
                          <Form.Label>Drop Address</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter drop address"
                            name="dropaddress"
                            value={form.dropaddress}
                            onChange={onChange}
                          />
                        </Form.Group>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Drop Latitude</Form.Label>
                              <Form.Control
                                type="number"
                                step="any"
                                placeholder="e.g. 21.23536"
                                name="drop_latitude"
                                value={form.drop_latitude}
                                onChange={onChange}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Drop Longitude</Form.Label>
                              <Form.Control
                                type="number"
                                step="any"
                                placeholder="e.g. 72.82685"
                                name="drop_longitude"
                                value={form.drop_longitude}
                                onChange={onChange}
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Button variant="outline-primary" size="sm" type="button" onClick={() => getCurrentLocation('drop')}>
                          <FaLocationArrow className="me-2" /> Use Current Location
                        </Button>
                      </Col>
                    </Row>

                    <div className="d-flex justify-content-end mt-2">
                      <Button type="submit" className="px-4" style={{ backgroundColor: '#4F46E5' }} disabled={loading || !token}>
                        {loading ? (
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        ) : null}
                        Request Ambulance
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>

              <div className="text-muted small mt-2 px-1">
                Tip: You can click "Use Current Location" to auto-fill latitude and longitude fields.
              </div>
            </div>
          </Col>
        </Row>
      </Container>
      {loading ? <Loader /> : ''}
    </>
  );
};

export default D_AmbulanceRequest;
