import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Container, Row, Col, Spinner, Badge } from 'react-bootstrap';
import { FaAmbulance, FaMapMarkerAlt, FaPhone, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import Swal from 'sweetalert2';

const D_StatusAmbulance = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState(null);
  const [error, setError] = useState(null);
  const SECRET_KEY = "health-emi";

  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      const getlocaldata = localStorage.getItem("healthdoctor");
      if (!getlocaldata) {
        navigate("/doctor");
        return;
      }

      const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
      const data = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

      const response = await axios.post(
        'https://healtheasy-o25g.onrender.com/doctor/ambulancerequests/getone',
        { ambulancerequestid: id },
        {
          headers: {
            'Authorization': `Bearer ${data.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.Data) {
        setRequest(response.data.Data);
      } else {
        throw new Error('No data received');
      }
    } catch (error) {
      console.error('Error fetching request details:', error);
      setError(error.response?.data?.message || 'Failed to load request details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You want to cancel this ambulance request?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, cancel it!'
      });

      if (result.isConfirmed) {
        const getlocaldata = localStorage.getItem("healthdoctor");
        const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
        const data = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

        await axios.post(
          'https://healtheasy-o25g.onrender.com/doctor/ambulancerequests/cancel',
          { ambulancerequestid: id },
          {
            headers: {
              'Authorization': `Bearer ${data.accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        Swal.fire(
          'Cancelled!',
          'Your ambulance request has been cancelled.',
          'success'
        );
        navigate('/doctor/ambulance-request');
      }
    } catch (error) {
      console.error('Error cancelling request:', error);
      Swal.fire(
        'Error',
        error.response?.data?.message || 'Failed to cancel request',
        'error'
      );
    }
  };

  useEffect(() => {
    fetchRequestDetails();
    // Refresh data every 10 seconds
    // const interval = setInterval(fetchRequestDetails, 10000);
    // return () => clearInterval(interval);
    fetchRequestDetails()
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-3">
        {error}
      </div>
    );
  }

  if (!request) {
    return (
      <div className="alert alert-info m-3">
        No request found with the provided ID.
      </div>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Ambulance Request Status</h2>
      
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Request Ambulance</h5>
          <Badge 
            bg={
              request.status === 'completed' ? 'success' : 
              request.status === 'cancelled' ? 'danger' : 
              request.status === 'accepted' ? 'primary' : 'warning'
            }
            className="text-capitalize"
          >
            {request.status}
          </Badge>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6} className="mb-4">
              <div className="d-flex align-items-start mb-3">
                <FaMapMarkerAlt className="text-danger mt-1 me-2" size={20} />
                <div>
                  <h6>Pickup Location</h6>
                  <p className="mb-1">{request.pickupaddress}</p>
                  <small className="text-muted">
                    {request.pickuplocation?.coordinates?.reverse().join(', ')}
                  </small>
                </div>
              </div>
            </Col>
            
            <Col md={6} className="mb-4">
              <div className="d-flex align-items-start">
                <FaMapMarkerAlt className="text-success mt-1 me-2" size={20} />
                <div>
                  <h6>Drop Location</h6>
                  <p className="mb-1">{request.dropaddress}</p>
                  <small className="text-muted">
                    {request.droplocation?.coordinates?.reverse().join(', ')}
                  </small>
                </div>
              </div>
            </Col>
          </Row>

          <div className="mb-3">
            <h6>Near by ambulance</h6>
            <div className="d-flex align-items-center">
              <FaAmbulance className="me-2" />
              <span className="me-3">
                {request.status === 'notified' && 
                  `Notified ${request.notifiedAmbulances?.length || 0} ambulances`}
                {request.status === 'accepted' && 
                  `Ambulance is on the way`}
                {request.status === 'completed' && 
                  `Ride completed`}
                {request.status === 'cancelled' && 
                  `Request cancelled`}
              </span>
            </div>
          </div>

          {request.acceptedAmbulance && (
            <div className="mb-3">
              <h6>Assigned Ambulance</h6>
              <div className="d-flex align-items-center">
                <FaAmbulance className="me-2" />
                <div>
                  <div>Driver: {request.acceptedAmbulance.driverName || 'N/A'}</div>
                  <div>
                    <FaPhone className="me-1" />
                    <a href={`tel:${request.acceptedAmbulance.contactNumber}`}>
                      {request.acceptedAmbulance.contactNumber || 'N/A'}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4">
            <Button 
              variant="outline-danger" 
              onClick={handleCancelRequest}
              disabled={['completed', 'cancelled'].includes(request.status)}
            >
              <FaTimes className="me-2" />
              Cancel Request
            </Button>
          </div>
        </Card.Body>
        <Card.Footer className="text-muted">
          <small>
            Requested on: {new Date(request.createdAt).toLocaleString()}
            {request.updatedAt !== request.createdAt && 
              ` • Last updated: ${new Date(request.updatedAt).toLocaleString()}`}
          </small>
        </Card.Footer>
      </Card>
    </Container>
  );
};

export default D_StatusAmbulance;