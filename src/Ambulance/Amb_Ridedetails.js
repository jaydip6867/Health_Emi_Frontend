import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
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
import { API_BASE_URL, SOCKET_URL, SECRET_KEY, STORAGE_KEYS, GOOGLE_MAPS_API_KEY } from '../config';
import Amb_Nav from "./Amb_Nav";
import Amb_Sidebar from "./Amb_Sidebar";
import "../../src/amb_request.css";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

// Google Maps loader (replaces Leaflet)
let gmapsPromise = null;
const loadGoogleMaps = () => {
  if (window.google && window.google.maps) return Promise.resolve(window.google);
  if (gmapsPromise) return gmapsPromise;
  gmapsPromise = new Promise((resolve, reject) => {
    const id = 'gmaps-loader';
    const existing = document.getElementById(id);
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google));
      existing.addEventListener('error', reject);
      return;
    }
    const s = document.createElement('script');
    s.id = id;
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}&libraries=places,marker`;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve(window.google);
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return gmapsPromise;
};

// Icon URLs
const AMBULANCE_ICON = 'https://cdn-icons-png.flaticon.com/512/12349/12349613.png';
const PICKUP_ICON = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
const DROP_ICON = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';

const MySwal = withReactContent(Swal);

// Google Maps marker icon sizes will be set per-marker via icon options

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
  let startRide;
  const mapRef = useRef(null); // google.maps.Map
  const directionsServiceRef = useRef(null); // google.maps.DirectionsService
  const directionsRendererRef = useRef(null); // google.maps.DirectionsRenderer
  const markersRef = useRef({ pickup: null, drop: null, ambulance: null });
  const watchIdRef = useRef(null);
  const lastTargetRef = useRef(null);
  const routeCoordsRef = useRef([]);
  const [liveSpeed, setLiveSpeed] = useState(0);
  const [mapError, setMapError] = useState(null);

  // Persist current navigation leg across refresh
  const STORAGE_KEY = 'amb_route_state';
  const saveRouteState = (state) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  };
  const getRouteState = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch { return null; }
  };
  const clearRouteState = () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  // Initialize Google Map when ride is loaded
  useEffect(() => {
    if (!ride) return;
    const container = document.getElementById('rideMap');
    if (!container) return;

    const init = async () => {
      try {
        await loadGoogleMaps();
        if (!mapRef.current) {
          mapRef.current = new window.google.maps.Map(container, {
            zoom: 12,
            center: { lat: 20.5937, lng: 78.9629 },
            mapTypeId: 'roadmap',
            streetViewControl: false,
          });
          directionsServiceRef.current = new window.google.maps.DirectionsService();
          directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
            map: mapRef.current,
            suppressMarkers: true,
            preserveViewport: true,
          });
        }

        // Add pickup & drop markers
        if (ride?.pickuplocation?.coordinates) {
          const [plng, plat] = ride.pickuplocation.coordinates;
          const ppos = { lat: plat, lng: plng };
          if (markersRef.current.pickup) markersRef.current.pickup.setMap(null);
          markersRef.current.pickup = new window.google.maps.Marker({
            position: ppos, map: mapRef.current, icon: PICKUP_ICON, title: 'Pickup'
          });
          mapRef.current.setCenter(ppos);
        }
        if (ride?.droplocation?.coordinates) {
          const [dlng, dlat] = ride.droplocation.coordinates;
          const dpos = { lat: dlat, lng: dlng };
          if (markersRef.current.drop) markersRef.current.drop.setMap(null);
          markersRef.current.drop = new window.google.maps.Marker({
            position: dpos, map: mapRef.current, icon: DROP_ICON, title: 'Drop'
          });
        }

        // Fit to bounds
        const bounds = new window.google.maps.LatLngBounds();
        ['pickup','drop','ambulance'].forEach(k => {
          const m = markersRef.current[k];
          if (m) bounds.extend(m.getPosition());
        });
        if (!bounds.isEmpty()) mapRef.current.fitBounds(bounds);

        // Show current location once
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const { latitude, longitude } = pos.coords;
              setCurrentLocation({ lat: latitude, lng: longitude, loading: false, error: null });
              const cur = { lat: latitude, lng: longitude };
              if (markersRef.current.ambulance) markersRef.current.ambulance.setMap(null);
              markersRef.current.ambulance = new window.google.maps.Marker({
                position: cur, map: mapRef.current,
                icon: { url: AMBULANCE_ICON, scaledSize: new window.google.maps.Size(40, 40), anchor: new window.google.maps.Point(20, 20) },
                title: 'You'
              });
            },
            (err) => setCurrentLocation((p) => ({ ...p, loading: false, error: err?.message || 'Location error' })),
            { enableHighAccuracy: true, timeout: 8000 }
          );
        }

        // Resume unfinished leg after refresh
        const saved = getRouteState();
        if (saved && saved.rideId === ride?._id && saved.target?.lat && saved.target?.lng) {
          startWatchToTarget(new window.google.maps.LatLng(saved.target.lat, saved.target.lng), () => {});
        }
      } catch (e) {
        setMapError('Failed to load Google Maps');
      }
    };

    init();

    return () => {
      // keep map instance
    };
  }, [ride]);

  // Draw or update route using Google Directions
  const drawRoute = (fromLatLng, toLatLng, viaPoint = null) => {
    if (!mapRef.current || !directionsServiceRef.current || !directionsRendererRef.current) return;

    const request = {
      origin: fromLatLng,
      destination: toLatLng,
      travelMode: window.google.maps.TravelMode.DRIVING,
      optimizeWaypoints: true,
    };
    if (viaPoint) request.waypoints = [{ location: viaPoint }];

    directionsServiceRef.current.route(request, (result, status) => {
      if (status === window.google.maps.DirectionsStatus.OK) {
        directionsRendererRef.current.setDirections(result);
        // Flatten overview path for heading calc
        const overview = result.routes?.[0]?.overview_path || [];
        routeCoordsRef.current = overview.map(ll => [ll.lat(), ll.lng()]);
      } else {
        setTimeout(() => drawRoute(fromLatLng, toLatLng, viaPoint), 2000);
      }
    });
  };

  // Helpers: heading based on nearest route coordinate
  const computeHeading = (lat, lng, coords) => {
    if (!coords || coords.length === 0) return [0, 0];
    let nearestIdx = 0;
    let min = Infinity;
    for (let i = 0; i < coords.length; i++) {
      const dLat = lat - coords[i][0];
      const dLng = lng - coords[i][1];
      const d = Math.hypot(dLat, dLng);
      if (d < min) { min = d; nearestIdx = i; }
    }
    const nextIdx = Math.min(nearestIdx + 1, coords.length - 1);
    const dy = coords[nextIdx][0] - lat;
    const dx = coords[nextIdx][1] - lng;
    const angleRad = Math.atan2(dy, dx);
    const angleDeg = angleRad * 180 / Math.PI;
    return [angleDeg, nearestIdx];
  };

  // Start watching position and navigate to a target
  const startWatchToTarget = (targetLatLng, onArrive) => {
    if (!navigator.geolocation) return;
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);

    const tgt = targetLatLng instanceof window.google.maps.LatLng ? targetLatLng : new window.google.maps.LatLng(targetLatLng.lat, targetLatLng.lng);
    lastTargetRef.current = tgt;
    saveRouteState({ rideId: ride?._id, target: { lat: tgt.lat(), lng: tgt.lng() } });

    // pickup and drop
    let pickupLL = null;
    let dropLL = null;
    if (ride?.pickuplocation?.coordinates) {
      const [plng, plat] = ride.pickuplocation.coordinates;
      pickupLL = new window.google.maps.LatLng(plat, plng);
    }
    if (ride?.droplocation?.coordinates) {
      const [dlng, dlat] = ride.droplocation.coordinates;
      dropLL = new window.google.maps.LatLng(dlat, dlng);
    }

    const isGoingToPickup = pickupLL && tgt.equals(pickupLL);

    const cur = new window.google.maps.LatLng(currentLocation.lat || 0, currentLocation.lng || 0);
    const viaPoint = isGoingToPickup && dropLL ? pickupLL : null;
    const finalTarget = isGoingToPickup && dropLL ? dropLL : tgt;

    drawRoute(cur, finalTarget, viaPoint);

    let lastRouteUpdate = Date.now();
    const ROUTE_UPDATE_INTERVAL = 5000;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, speed } = pos.coords;
        const now = Date.now();
        setCurrentLocation({ lat: latitude, lng: longitude, loading: false, error: null });
        setLiveSpeed(speed ? speed * 3.6 : 0);
        const here = new window.google.maps.LatLng(latitude, longitude);

        // Update ambulance marker
        if (markersRef.current.ambulance) {
          markersRef.current.ambulance.setPosition(here);
        } else if (mapRef.current) {
          markersRef.current.ambulance = new window.google.maps.Marker({
            position: here, map: mapRef.current,
            icon: { url: AMBULANCE_ICON, scaledSize: new window.google.maps.Size(40, 40), anchor: new window.google.maps.Point(20, 20) },
            title: 'You'
          });
        }
        mapRef.current?.panTo(here);

        if (now - lastRouteUpdate > ROUTE_UPDATE_INTERVAL) {
          lastRouteUpdate = now;
          drawRoute(here, finalTarget, viaPoint);
        }

        // arrival check within ~50m
        const dist = window.google.maps.geometry ? window.google.maps.geometry.spherical.computeDistanceBetween(here, tgt) : null;
        if (dist !== null && dist <= 50) {
          if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
          clearRouteState();
          directionsRendererRef.current && directionsRendererRef.current.set('directions', null);
          if (typeof onArrive === 'function') onArrive();
        }
      },
      (err) => setCurrentLocation((p) => ({ ...p, error: err?.message || 'Location error' })),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    );
  };

  const stopWatchAndClearRoute = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (directionsRendererRef.current) {
      try { directionsRendererRef.current.set('directions', null); } catch {}
    }
    routeCoordsRef.current = [];
    clearRouteState();
  };

  const fetchRideDetails = async () => {
    try {
      const getlocaldata = localStorage.getItem(STORAGE_KEYS.AMBULANCE);
      if (!getlocaldata) {
        navigate("/ambulance");
        return;
      }

      const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
      const data = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      setAmbulance(data.ambulanceData);

      const response = await axios.post(
        `${API_BASE_URL}/ambulance/ambulancerequest/getone`,
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
      const getlocaldata = localStorage.getItem(STORAGE_KEYS.AMBULANCE);
      const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
      const data = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

      const response = await axios.post(
        `${API_BASE_URL}/ambulance/ambulancerequest/accept`,
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

        //soket
        const socket = io(SOCKET_URL);

        const storedData = localStorage.getItem("ambulance_socket");

        const ambulanceSocket = JSON.parse(storedData);
        console.log(ambulanceSocket.channelId);
        console.log(ambulanceSocket.ambulanceId);

        const ambulance_channelid = ambulanceSocket.channelId;
        const ambulanceId = ambulanceSocket.ambulanceId;

        socket.emit("init", { channelid: ambulance_channelid });

        if ("geolocation" in navigator) {
          startRide = navigator.geolocation.watchPosition(
            (position) => {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;

              socket.emit("update-ambulance-location", {
                ambulanceId: ambulanceId,
                lat,
                lng,
              });
            },
            (error) => console.error("❌ GPS Error:", error),
            {
              enableHighAccuracy: true,
              maximumAge: 0,
              timeout: 5000,
            }
          );
        } else {
          console.error("❌ Geolocation not supported in this browser.");
        }
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
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setIsAccepting(true);
          await handleAcceptRide();
          setRide((prev) => prev ? { ...prev, status: 'accepted' } : prev);
          MySwal.fire({
            title: 'Ride Accepted',
            text: 'Navigation will start now.',
            icon: 'success',
            toast: true,
            position: 'top',
            timer: 2000,
            showConfirmButton: false,
          });
          // Start navigation: current -> pickup
          if (ride?.pickuplocation?.coordinates) {
            const [plng, plat] = ride.pickuplocation.coordinates;
            const pickupLL = new window.google.maps.LatLng(plat, plng);
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(() => {
                startWatchToTarget(pickupLL, () => {
                  if (ride?.droplocation?.coordinates) {
                    const [dlng, dlat] = ride.droplocation.coordinates;
                    const dropLL = new window.google.maps.LatLng(dlat, dlng);
                    startWatchToTarget(dropLL, () => {
                      stopWatchAndClearRoute();
                      MySwal.fire({ title: 'Ride Completed', text: 'Reached destination.', icon: 'success' });
                    });
                  }
                });
              }, () => {
                startWatchToTarget(pickupLL, () => {
                  if (ride?.droplocation?.coordinates) {
                    const [dlng, dlat] = ride.droplocation.coordinates;
                    const dropLL = new window.google.maps.LatLng(dlat, dlng);
                    startWatchToTarget(dropLL, () => {
                      stopWatchAndClearRoute();
                      MySwal.fire({ title: 'Ride Completed', text: 'Reached destination.', icon: 'success' });
                    });
                  }
                });
              }, { enableHighAccuracy: true, timeout: 8000 });
            }
          }
        } catch (e) {
          MySwal.fire({ title: 'Failed to accept', text: 'Please try again.', icon: 'error' });
        } finally {
          setIsAccepting(false);
        }
      }
    });
  };

  const handleCompleteRide = async () => {
    try {
      setIsCompleting(true);
      const getlocaldata = localStorage.getItem(STORAGE_KEYS.AMBULANCE);
      const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
      const data = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

      const response = await axios.post(
        `${API_BASE_URL}/ambulance/ambulancerequest/complete`,
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
        navigator.geolocation.clearWatch(startRide);
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
            <Col md={12}>
              <Card className="h-100 mb-4">
                <Card.Header className="bg-light py-3 d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Live Map & Route</h5>
                  <span className="badge bg-primary">{liveSpeed.toFixed(1)} km/h</span>
                </Card.Header>
                <Card.Body style={{ height: '480px', padding: 0 }}>
                  <div id="rideMap" style={{ height: '100%', width: '100%' }} />
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
                  {ride.pickuplocation?.coordinates && (
                    <div className="bg-light p-3 rounded">
                      <div className="text-muted small mb-1">Coordinates</div>
                      <div>Latitude: {ride.pickuplocation.coordinates[1]}</div>
                      <div>Longitude: {ride.pickuplocation.coordinates[0]}</div>
                    </div>
                  )}
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
                  {ride.droplocation?.coordinates && (
                    <div className="bg-light p-3 rounded">
                      <div className="text-muted small mb-1">Coordinates</div>
                      <div>Latitude: {ride.droplocation.coordinates[1]}</div>
                      <div>Longitude: {ride.droplocation.coordinates[0]}</div>
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
