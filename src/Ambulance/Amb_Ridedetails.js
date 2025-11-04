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
import Amb_Nav from "./Amb_Nav";
import Amb_Sidebar from "./Amb_Sidebar";
import "../../src/amb_request.css";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

// Leaflet + Routing imports
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

const MySwal = withReactContent(Swal);

// Fix default marker icons (for bundlers)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom ambulance icon
const ambulanceIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/12349/12349613.png',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  className: 'ambulance-icon',
});

// Pickup (red) and Drop (green) icons
const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const dropIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

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
  const mapContainer = useRef(null);
  const map = useRef(null); // L.Map instance
  const markers = useRef({
    pickup: null,
    drop: null,
    ambulance: null,
    currentCircle: null,
  });
  const routeControlRef = useRef(null);
  const watchIdRef = useRef(null);
  const lastTargetRef = useRef(null);
  const routeCoordsRef = useRef([]); // [[lat, lng], ...] for heading calculation
  const [liveSpeed, setLiveSpeed] = useState(0);
  const socketRef = useRef(null);
  const ambulanceMetaRef = useRef({ channelId: null, ambulanceId: null });

  useEffect(() => {
    try {
      const storedData = localStorage.getItem("ambulance_socket");
      if (storedData) {
        const parsed = JSON.parse(storedData);
        ambulanceMetaRef.current = { channelId: parsed.channelId, ambulanceId: parsed.ambulanceId };
        const s = io("https://healtheasy-o25g.onrender.com");
        socketRef.current = s;
        if (parsed.channelId) {
          s.emit("init", { channelid: parsed.channelId });
        }
        s.on("connect_error", (err) => console.error("Socket connect_error:", err?.message || err));
      }
    } catch (e) {
      console.error("Failed to init socket:", e);
    }
    return () => {
      try { socketRef.current?.disconnect(); } catch {}
    };
  }, []);

  const SECRET_KEY = "health-emi";

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

  // Initialize Leaflet map when ride is loaded
  useEffect(() => {
    if (!ride) return;
    const container = document.getElementById('rideMap');
    if (!container) return;

    if (!map.current) {
      map.current = L.map('rideMap');
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map.current);
    }

    // Add pickup & drop markers
    if (ride?.pickuplocation?.coordinates) {
      const [plng, plat] = ride.pickuplocation.coordinates;
      const platlng = L.latLng(plat, plng);
      if (!markers.current.pickup) {
        markers.current.pickup = L.marker(platlng, { icon: pickupIcon }).addTo(map.current).bindPopup('Pickup');
      } else {
        markers.current.pickup.setLatLng(platlng);
      }
      map.current.setView(platlng, 14);
    }
    if (ride?.droplocation?.coordinates) {
      const [dlng, dlat] = ride.droplocation.coordinates;
      const dlatlng = L.latLng(dlat, dlng);
      if (!markers.current.drop) {
        markers.current.drop = L.marker(dlatlng, { icon: dropIcon }).addTo(map.current).bindPopup('Drop');
      } else {
        markers.current.drop.setLatLng(dlatlng);
      }
    }

    // Try to show current location once
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setCurrentLocation({ lat: latitude, lng: longitude, loading: false, error: null });
          const cur = L.latLng(latitude, longitude);
          if (!markers.current.ambulance) {
            markers.current.ambulance = L.marker(cur, { icon: ambulanceIcon }).addTo(map.current).bindPopup('You');
          } else {
            markers.current.ambulance.setLatLng(cur);
          }
          if (!markers.current.currentCircle) {
            markers.current.currentCircle = L.circle(cur, { radius: 80, color: '#1E88E5', fillOpacity: 0.25 }).addTo(map.current);
          } else {
            markers.current.currentCircle.setLatLng(cur);
          }
        },
        (err) => {
          setCurrentLocation((p) => ({ ...p, loading: false, error: err?.message || 'Location error' }));
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }

    // Resume unfinished leg after refresh
    const saved = getRouteState();
    if (saved && saved.rideId === ride?._id && saved.target?.lat && saved.target?.lng) {
      try {
        const resumeLL = L.latLng(saved.target.lat, saved.target.lng);
        startWatchToTarget(resumeLL, () => {});
      } catch {}
    }

    return () => {
      // do not destroy map to preserve across rerenders
    };
  }, [ride]);

  // Draw or update route with multiple waypoints (current -> pickup -> drop)
  const drawRoute = async (fromLatLng, toLatLng, viaPoint = null) => {
    if (!map.current) return;

    // Clean up existing route if any
    if (routeControlRef.current) {
      try { map.current.removeLayer(routeControlRef.current); } catch {}
      routeControlRef.current = null;
    }

    try {
      // Format coordinates for OSRM API
      let coords = `${fromLatLng.lng},${fromLatLng.lat}`;
      
      // Add via point if provided (pickup location)
      if (viaPoint) {
        coords += `;${viaPoint.lng},${viaPoint.lat}`;
      }
      
      // Add final destination (drop location)
      coords += `;${toLatLng.lng},${toLatLng.lat}`;
      
      const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const routeCoordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        routeCoordsRef.current = routeCoordinates;
        
        // Draw the route on the map
        const routeLayer = L.geoJSON({
          type: 'Feature',
          properties: {},
          geometry: route.geometry
        }, {
          style: {
            color: '#0d6efd',
            weight: 6,
            opacity: 0.9
          }
        }).addTo(map.current);
        
        routeControlRef.current = routeLayer;
      }
    } catch (error) {
      console.error('Error drawing route:', error);
      // Retry after a delay
      setTimeout(() => drawRoute(fromLatLng, toLatLng, viaPoint), 2000);
    }
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

    lastTargetRef.current = targetLatLng;
    saveRouteState({ rideId: ride?._id, target: { lat: targetLatLng.lat, lng: targetLatLng.lng } });

    // Get pickup and drop locations from ride data
    let pickupLatLng = null;
    let dropLatLng = null;
    
    if (ride?.pickuplocation?.coordinates) {
      const [plng, plat] = ride.pickuplocation.coordinates;
      pickupLatLng = L.latLng(plat, plng);
    }
    
    if (ride?.droplocation?.coordinates) {
      const [dlng, dlat] = ride.droplocation.coordinates;
      dropLatLng = L.latLng(dlat, dlng);
    }

    // Determine if we're going to pickup or drop location
    const isGoingToPickup = targetLatLng === pickupLatLng;
    
    // initial route from current to target, including via points if needed
    const cur = L.latLng(currentLocation.lat || 0, currentLocation.lng || 0);
    
    // If going to pickup and we have a drop location, include it in the route
    const viaPoint = isGoingToPickup && dropLatLng ? pickupLatLng : null;
    const finalTarget = isGoingToPickup && dropLatLng ? dropLatLng : targetLatLng;
    
    drawRoute(cur, finalTarget, viaPoint);
    
    let lastRouteUpdate = Date.now();
    const ROUTE_UPDATE_INTERVAL = 5000; // Update route every 5 seconds

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, speed } = pos.coords;
        const now = Date.now();
        setCurrentLocation({ lat: latitude, lng: longitude, loading: false, error: null });
        setLiveSpeed(speed ? speed * 3.6 : 0);
        const here = L.latLng(latitude, longitude);

        // Emit live location via socket for server/clients
        try {
          const ambId = ambulanceMetaRef.current?.ambulanceId;
          if (ambId && socketRef.current) {
            socketRef.current.emit("ambulanceLocationUpdate", {
              ambulanceId: ambId,
              lat: latitude,
              lng: longitude,
            });
          }
        } catch (e) {
          console.error("Socket emit failed:", e);
        }

        // Update ambulance position and map view
        if (markers.current.ambulance) {
          markers.current.ambulance.setLatLng(here);
        } else if (map.current) {
          markers.current.ambulance = L.marker(here, { icon: ambulanceIcon }).addTo(map.current);
        }
        if (markers.current.currentCircle) {
          markers.current.currentCircle.setLatLng(here);
        } else if (map.current) {
          markers.current.currentCircle = L.circle(here, { radius: 80, color: '#1E88E5', fillOpacity: 0.25 }).addTo(map.current);
        }
        map.current?.panTo(here, { animate: true });

        // Update route periodically to show remaining path
        if (now - lastRouteUpdate > ROUTE_UPDATE_INTERVAL) {
          lastRouteUpdate = now;
          // Redraw route from current position to target
          if (routeControlRef.current) {
            try {
              routeControlRef.current.setWaypoints([here, targetLatLng]);
            } catch (e) {
              console.error('Error updating route:', e);
              // If update fails, redraw the entire route
              drawRoute(here, targetLatLng);
            }
          } else {
            drawRoute(here, targetLatLng);
          }
        }

        // Rotate ambulance marker toward next route point
        try {
          const el = markers.current.ambulance?.getElement?.();
          if (el && routeCoordsRef.current?.length) {
            const [angle] = computeHeading(latitude, longitude, routeCoordsRef.current);
            el.style.transformOrigin = 'center';
            el.style.transform = `rotate(${angle}deg)`;
          }
        } catch {}

        // arrival check (within 50m)
        if (here.distanceTo(targetLatLng) <= 50) {
          if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
          clearRouteState();
          // Remove the route when destination is reached
          if (routeControlRef.current) {
            try {
              routeControlRef.current.setWaypoints([]);
              map.current?.removeControl(routeControlRef.current);
              routeControlRef.current = null;
            } catch {}
          }
          if (typeof onArrive === 'function') onArrive();
        }
      },
      (err) => {
        setCurrentLocation((p) => ({ ...p, error: err?.message || 'Location error' }));
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    );
  };

  const stopWatchAndClearRoute = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (routeControlRef.current) {
      try {
        // Clear waypoints first to prevent LRM trying to remove non-existing layers
        routeControlRef.current.setWaypoints([]);
      } catch {}
      try { map.current && map.current.removeControl(routeControlRef.current); } catch {}
      routeControlRef.current = null;
    }
    routeCoordsRef.current = [];
    clearRouteState();
  };

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

        //soket
        try {
          // Socket is initialized in a component effect and location emits occur
          // inside the existing navigator.geolocation.watchPosition handler.
          // No additional setup needed here.
        } catch {}
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
            const pickupLL = L.latLng(plat, plng);
            // ensure we have a current fix first
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(() => {
                startWatchToTarget(pickupLL, () => {
                  // on arrival at pickup, switch to drop
                  if (ride?.droplocation?.coordinates) {
                    const [dlng, dlat] = ride.droplocation.coordinates;
                    const dropLL = L.latLng(dlat, dlng);
                    startWatchToTarget(dropLL, () => {
                      // arrived at drop
                      stopWatchAndClearRoute();
                      MySwal.fire({ title: 'Ride Completed', text: 'Reached destination.', icon: 'success' });
                    });
                  }
                });
              }, () => {
                // fallback start even if immediate fix fails
                startWatchToTarget(pickupLL, () => {
                  if (ride?.droplocation?.coordinates) {
                    const [dlng, dlat] = ride.droplocation.coordinates;
                    const dropLL = L.latLng(dlat, dlng);
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
        stopWatchAndClearRoute();
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
                {/* <Card.Header className="bg-light py-3 d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Live Map & Route</h5>
                  <span className="badge bg-primary">{liveSpeed.toFixed(1)} km/h</span>
                </Card.Header> */}
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
