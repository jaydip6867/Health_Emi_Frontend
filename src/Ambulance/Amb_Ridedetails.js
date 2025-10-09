import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  FaMapMarkerAlt,
  FaUserMd,
  FaPhone,
  FaEnvelope,
  FaArrowLeft,
  FaAmbulance,
} from "react-icons/fa";
import axios from "axios";
import CryptoJS from "crypto-js";
import Amb_Nav from "./Amb_Nav";
import Amb_Sidebar from "./Amb_Sidebar";
import "../../src/amb_request.css";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
const MySwal = withReactContent(Swal);

const Amb_Ridedetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ambulance, setAmbulance] = useState(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({
    lat: 0,
    lng: 0,
    loading: true,
    error: null,
  });

  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef({
    pickup: null,
    drop: null,
    ambulance: null,
  });

  const SECRET_KEY = "health-emi";

  const fetchRideDetails = async () => {
    try {
      const getlocaldata = localStorage.getItem("healthambulance");
      if (!getlocaldata) {
        navigate("/ambulance");
        return;
      }

      const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
      const data = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      setAmbulance(data.ambulanceData);

      const response = await axios.post(
        "https://healtheasy-o25g.onrender.com/ambulance/ambulancerequest/getone",
        { ambulancerequestid: id },
        {
          headers: {
            Authorization: `Bearer ${data.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.IsSuccess && response.data.Data) {
        setRide(response.data.Data);
      } else {
        throw new Error("Failed to fetch ride details");
      }
    } catch (err) {
      console.error("Error fetching ride details:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load ride details. Please try again."
      );
      await MySwal.fire({
        title: "Error!",
        text:
          err.response?.data?.message ||
          "Failed to load ride details. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#dc3545",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update ambulance marker when location changes
  const updateAmbulanceMarker = (location) => {
    if (!map.current || !markers.current) return;

    if (!markers.current.ambulance && map.current) {
      markers.current.ambulance = new maplibregl.Marker({
        color: "#0000FF",
        rotation: 45,
      })
        .setLngLat([location.lng, location.lat])
        .setPopup(
          new maplibregl.Popup().setHTML("<strong>Your Ambulance</strong>")
        )
        .addTo(map.current);
    } else if (markers.current.ambulance) {
      markers.current.ambulance.setLngLat([location.lng, location.lat]);
    }

    // Update map view to include all markers
    fitMapToMarkers();
  };

  // Fit map to show all markers
  const fitMapToMarkers = () => {
    if (!map.current || !ride) return;

    const bounds = new maplibregl.LngLatBounds();

    // Add pickup and drop points
    bounds.extend([
      ride.pickuplocation.coordinates[0],
      ride.pickuplocation.coordinates[1],
    ]);
    bounds.extend([
      ride.droplocation.coordinates[0],
      ride.droplocation.coordinates[1],
    ]);

    // Add current location if available
    if (currentLocation.lat !== 0 && currentLocation.lng !== 0) {
      bounds.extend([currentLocation.lng, currentLocation.lat]);
    }

    map.current.fitBounds(bounds, { padding: 100 });
  };
  // Get current location
  useEffect(() => {
    if (!navigator.geolocation) {
      setCurrentLocation((prev) => ({
        ...prev,
        loading: false,
        error: "Geolocation is not supported by your browser",
      }));
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          loading: false,
          error: null,
        };
        setCurrentLocation(newLocation);
        updateAmbulanceMarker(newLocation);
      },
      (error) => {
        console.error("Error getting location:", error);
        setCurrentLocation((prev) => ({
          ...prev,
          loading: false,
          error: "Unable to retrieve your location",
        }));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

 
  // Initialize map when component mounts and ride data is available
  useEffect(() => {
    if (!ride || !mapContainer.current) return;
  
    let mapInstance;
    let mapLoaded = false;
  
    try {
      mapInstance = new maplibregl.Map({
        container: mapContainer.current,
        style: "https://tiles.stadiamaps.com/styles/osm_bright.json",
        center: [
          currentLocation.lng || ride.pickuplocation.coordinates[0],
          currentLocation.lat || ride.pickuplocation.coordinates[1],
        ],
        zoom: 12,
        attributionControl: false,
        maxZoom: 18,
        minZoom: 10,
        preserveDrawingBuffer: true,
      });
  
      mapInstance.addControl(new maplibregl.NavigationControl());
  
      mapInstance.on("load", () => {
        mapLoaded = true;
  
        // 🟢 Pickup Marker
        markers.current.pickup = new maplibregl.Marker({ color: "#FF0000" })
          .setLngLat([
            ride.pickuplocation.coordinates[0],
            ride.pickuplocation.coordinates[1],
          ])
          .setPopup(
            new maplibregl.Popup().setHTML(
              `<strong>Pickup:</strong> ${ride.pickupaddress}`
            )
          )
          .addTo(mapInstance);
  
        // 🟢 Drop Marker
        markers.current.drop = new maplibregl.Marker({ color: "#00AA00" })
          .setLngLat([
            ride.droplocation.coordinates[0],
            ride.droplocation.coordinates[1],
          ])
          .setPopup(
            new maplibregl.Popup().setHTML(
              `<strong>Drop:</strong> ${ride.dropaddress}`
            )
          )
          .addTo(mapInstance);
  
        // 🟢 Ambulance Marker
        if (currentLocation.lat && currentLocation.lng) {
          markers.current.ambulance = new maplibregl.Marker({
            color: "#0000FF",
            rotation: 45,
          })
            .setLngLat([currentLocation.lng, currentLocation.lat])
            .setPopup(
              new maplibregl.Popup().setHTML("<strong>Your Ambulance</strong>")
            )
            .addTo(mapInstance);
        }
  
        fitMapToMarkers();
      });
  
      map.current = mapInstance;
    } catch (error) {
      console.error("Error initializing map:", error);
      if (mapInstance) mapInstance.remove();
      return;
    }
  
    return () => {
      // 🛡️ Cleanup only after map has loaded
      if (!mapInstance) return;
      if (mapLoaded) {
        mapInstance.remove();
      } else {
        // Wait for load to complete before removing
        mapInstance.once("load", () => mapInstance.remove());
      }
      map.current = null;
    };
  }, [ride]);
  

  useEffect(() => {
    fetchRideDetails();
  }, [id, navigate]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "notified":
        return (
          <Badge bg="warning" className="text-dark">
            <FaAmbulance className="me-2 text-white" /> Pending
          </Badge>
        );
      case "accepted":
        return (
          <Badge bg="success">
            {" "}
            <FaAmbulance className="me-2 text-white" />
            Accepted
          </Badge>
        );
      case "completed":
        return (
          <Badge bg="info">
            {" "}
            <FaAmbulance className="me-2 text-white" />
            Completed
          </Badge>
        );
      case "rejected":
        return (
          <Badge bg="danger">
            {" "}
            <FaAmbulance className="me-2 text-white" />
            Rejected
          </Badge>
        );
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const handleAcceptRide = async () => {
    try {
      setIsAccepting(true);
      const getlocaldata = localStorage.getItem("healthambulance");
      const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
      const data = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

      const response = await axios.post(
        "https://healtheasy-o25g.onrender.com/ambulance/ambulancerequest/accept",
        { ambulancerequestid: id },
        {
          headers: {
            Authorization: `Bearer ${data.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.IsSuccess) {
        await MySwal.fire({
          title: "Ride Accepted!",
          text: "You have successfully accepted the ride. Please proceed to the pickup location.",
          icon: "success",
          confirmButtonText: "Start Ride",
          confirmButtonColor: "#198754",
        });

        // Refresh ride details to show updated status
        fetchRideDetails();
      } else {
        throw new Error(response.data.message || "Failed to accept ride");
      }
    } catch (error) {
      console.error("Error accepting ride:", error);
      await MySwal.fire({
        title: "Error!",
        text:
          error.response?.data?.message ||
          "Failed to accept ride. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#dc3545",
      });
    } finally {
      setIsAccepting(false);
    }
  };

  // Add this function to show accept ride confirmation
  const confirmAcceptRide = () => {
    MySwal.fire({
      title: "Accept This Ride?",
      text: "Are you ready to accept this ride request?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#198754",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, accept ride",
      cancelButtonText: "No, cancel",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        handleAcceptRide();
      }
    });
  };

  const handleCompleteRide = async () => {
    try {
      setIsCompleting(true);
      const getlocaldata = localStorage.getItem("healthambulance");
      const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
      const data = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

      const response = await axios.post(
        "https://healtheasy-o25g.onrender.com/ambulance/ambulancerequest/complete",
        { ambulancerequestid: id },
        {
          headers: {
            Authorization: `Bearer ${data.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.IsSuccess) {
        // Show success message with SweetAlert
        await MySwal.fire({
          title: "Success!",
          text: "Ride marked as completed successfully!",
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#0d6efd",
        });

        // Navigate back to list
        navigate("/ambulance/ambrequests");
      } else {
        throw new Error(response.data.message || "Failed to complete ride");
      }
    } catch (error) {
      console.error("Error completing ride:", error);
      await MySwal.fire({
        title: "Error!",
        text:
          error.response?.data?.message ||
          "Failed to complete ride. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#dc3545",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  // Update the confirmCompleteRide function
  const confirmCompleteRide = () => {
    MySwal.fire({
      title: "Confirm Ride Completion",
      text: "Are you sure you want to mark this ride as completed?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#198754",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, complete it!",
      cancelButtonText: "No, cancel",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        handleCompleteRide();
      }
    });
  };
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Container fluid className="p-0 panel">
        <Row className="g-0">
          <Amb_Sidebar />
          <Col xs={12} sm={9} lg={10} className="p-3">
            <Amb_Nav ambulancename={ambulance?.fullname} />
            <Alert variant="danger" className="mt-3">
              {error}
            </Alert>
            <Button variant="outline-primary" onClick={() => navigate(-1)}>
              <FaArrowLeft className="me-2" /> Go Back
            </Button>
          </Col>
        </Row>
      </Container>
    );
  }

  if (!ride) return null;

  const requester =
    ride.requestertype === "doctor" ? ride.doctorid : ride.patientid;

  return (
    <Container fluid className="p-0 panel">
      <Row className="g-0">
        <Amb_Sidebar />
        <Col xs={12} sm={9} lg={10} className="p-3">
          <Amb_Nav ambulancename={ambulance?.fullname} />

          <div className="d-flex justify-content-start align-items-center mb-4">
            <Button
              variant="outline-secondary"
              className="d-flex align-items-center"
              onClick={() => navigate(-1)}
            >
              <FaArrowLeft className="me-2" /> Back to Requests
            </Button>
          </div>

          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center py-3">
              <div>
                <h4 className="mb-0">Ride Details</h4>
              </div>
              <div>{getStatusBadge(ride.status)}</div>
            </Card.Header>
          </Card>

          <Row className="g-4">
            {/* Requester Information */}
            <Col md={6}>
              <Card className="h-100">
                <Card.Header className="bg-light py-3">
                  <h5 className="mb-0">Requester Information</h5>
                </Card.Header>
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <img
                        src={
                          requester?.profile_pic ||
                          "https://via.placeholder.com/100"
                        }
                        alt="Profile"
                        className="rounded-circle "
                        style={{
                          height: "150px",
                          width: "150px",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    <div className="ms-4">
                      <h5 className="mb-2">{requester?.name || "N/A"}</h5>
                      <p className="mb-1 text-muted">
                        <FaUserMd className="me-2" />
                        {ride.requestertype === "doctor" ? "Doctor" : "Patient"}
                      </p>
                      {requester?.mobile && (
                        <p className="mb-1 text-muted">
                          <FaPhone className="me-2" />
                          {requester.mobile}
                        </p>
                      )}
                      {requester?.email && (
                        <p className="mb-0 text-muted">
                          <FaEnvelope className="me-2" />
                          {requester.email}
                        </p>
                      )}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Ride Information */}
            <Col md={6}>
              <Card className="h-100">
                <Card.Header className="bg-light py-3">
                  <h5 className="mb-0">Ride Information</h5>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <div className="text-muted small mb-1">Requested At</div>
                    <div>{new Date(ride.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="mb-3">
                    <div className="text-muted small mb-1">Last Updated</div>
                    <div>{new Date(ride.updatedAt).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-muted small mb-1">Status</div>
                    <div>{getStatusBadge(ride.status)}</div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Pickup Location */}
            <Col md={6}>
              <Card className="h-100">
                <Card.Header className="bg-light py-3 d-flex align-items-center">
                  <FaMapMarkerAlt className="text-danger me-2" />
                  <h5 className="mb-0">Pickup Location</h5>
                </Card.Header>
                <Card.Body>
                  <p className="mb-3">{ride.pickupaddress}</p>
                  {/* {ride.pickuplocation?.coordinates && (
                    <div className="bg-light p-3 rounded">
                      <div className="text-muted small mb-1">Coordinates</div>
                      <div>Latitude: {ride.pickuplocation.coordinates[1]}</div>
                      <div>Longitude: {ride.pickuplocation.coordinates[0]}</div>
                    </div>
                  )} */}
                </Card.Body>
              </Card>
            </Col>

            {/* Drop Location */}
            <Col md={6}>
              <Card className="h-100">
                <Card.Header className="bg-light py-3 d-flex align-items-center">
                  <FaMapMarkerAlt className="text-success me-2" />
                  <h5 className="mb-0">Drop Location</h5>
                </Card.Header>
                <Card.Body>
                  <p className="mb-3">{ride.dropaddress}</p>
                  {/* {ride.droplocation?.coordinates && (
                    <div className="bg-light p-3 rounded">
                      <div className="text-muted small mb-1">Coordinates</div>
                      <div>Latitude: {ride.droplocation.coordinates[1]}</div>
                      <div>Longitude: {ride.droplocation.coordinates[0]}</div>
                    </div>
                  )} */}
                </Card.Body>
              </Card>
            </Col>

            <Col xs={12}>
              <Card className="mb-4">
                <Card.Header className="bg-light py-3 d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Ride Map</h5>
                  {currentLocation.loading && (
                    <small className="text-muted">
                      <Spinner animation="border" size="sm" className="me-2" />
                      Getting your location...
                    </small>
                  )}
                  {currentLocation.error && (
                    <small className="text-danger">
                      {currentLocation.error}
                    </small>
                  )}
                </Card.Header>
                <Card.Body className="p-0">
                  {ride?.pickuplocation?.coordinates &&
                  ride?.droplocation?.coordinates ? (
                    <div
                      ref={mapContainer}
                      style={{
                        width: "100%",
                        height: "400px",
                        borderRadius: "8px",
                      }}
                    />
                  ) : (
                    <div className="text-center p-4">
                      <p>Map data not available</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <div className="d-flex justify-content-end mt-4">
            {ride.status === "notified" && (
              <Button
                variant="outline-primary"
                size="md"
                className="me-2"
                onClick={confirmAcceptRide}
                disabled={isAccepting}
              >
                {isAccepting ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Accepting...
                  </>
                ) : (
                  "Accept Ride"
                )}
              </Button>
            )}
            {ride.status === "accepted" && (
              <Button
                variant="outline-success"
                size="md"
                className="me-2"
                onClick={confirmCompleteRide}
                disabled={isCompleting}
              >
                {isCompleting ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Completing...
                  </>
                ) : (
                  "Ride Complete"
                )}
              </Button>
            )}
            <Button
              variant="outline-secondary"
              size="md"
              onClick={() => navigate(-1)}
            >
              Back to List
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Amb_Ridedetails;
