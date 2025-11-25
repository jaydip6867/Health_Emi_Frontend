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
import {
  API_BASE_URL,
  SOCKET_URL,
  SECRET_KEY,
  STORAGE_KEYS,
  GOOGLE_MAPS_API_KEY,
} from "../config";
import Amb_Nav from "./Amb_Nav";
import Amb_Sidebar from "./Amb_Sidebar";
import "../../src/amb_request.css";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

// Google Maps loader (replaces Leaflet)
let gmapsPromise = null;
const loadGoogleMaps = () => {
  if (window.google && window.google.maps)
    return Promise.resolve(window.google);
  if (gmapsPromise) return gmapsPromise;
  gmapsPromise = new Promise((resolve, reject) => {
    const id = "gmaps-loader";
    const existing = document.getElementById(id);
    if (existing) {
      existing.addEventListener("load", () => resolve(window.google));
      existing.addEventListener("error", reject);
      return;
    }
    const s = document.createElement("script");
    s.id = id;
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      GOOGLE_MAPS_API_KEY
    )}&libraries=places,marker,geometry`;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve(window.google);
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return gmapsPromise;
};

// Icon URLs
const AMBULANCE_ICON =
  "https://cdn-icons-png.flaticon.com/512/12349/12349613.png";
const PICKUP_ICON = "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
const DROP_ICON = "http://maps.google.com/mapfiles/ms/icons/green-dot.png";

const MySwal = withReactContent(Swal);
const verifyOTPBeforeComplete = async (requestId, accessToken) => {
  try {
    const { value: otp } = await MySwal.fire({
      title: "Enter OTP to Complete Ride",
      input: "number",
      inputAttributes: {
        maxlength: 6,
        minlength: 4,
        inputmode: "numeric",
      },
      showCancelButton: true,
      confirmButtonText: "Verify",
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !MySwal.isLoading(),
      inputValidator: (value) => {
        if (!value || String(value).length < 4) {
          return "Please enter a valid OTP (4-6 digits)";
        }
      },
    });

    if (!otp) {
      return { success: false, message: "OTP input cancelled" };
    }

    const res = await axios.post(
      `${API_BASE_URL}/ambulance/ambulancerequest/otpverification`,
      {
        ambulancerequestid: requestId,
        otp: String(otp),
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      success: !!res.data?.IsSuccess,
      message: res.data?.Message || "OTP verified successfully",
    };
  } catch (err) {
    return {
      success: false,
      message:
        err.response?.data?.Message || err.message || "Failed to verify OTP",
    };
  }
};
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
  const tempLineRef = useRef(null); // straight line fallback while routing
  const trailRef = useRef(null); // breadcrumb trail of ambulance
  const watchIdRef = useRef(null);
  const lastTargetRef = useRef(null);
  const routeCoordsRef = useRef([]);
  const routeInitializedRef = useRef(false);
  const [liveSpeed, setLiveSpeed] = useState(0);
  const [mapError, setMapError] = useState(null);
  const [polyline, setPolyline] = useState(null);
  const pathCoordinatesRef = useRef([]);
  const [isRouting, setIsRouting] = useState(false);
  const directionsRef = useRef(null);
  const [rideStarted, setRideStarted] = useState(false);
  // Persist current navigation leg and path data across refresh
  const STORAGE_KEY = "amb_route_state";
  const PATH_STORAGE_KEY = "amb_path_data";

  const saveRouteState = (state) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  };

  const getRouteState = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    } catch {
      return null;
    }
  };

  const clearRouteState = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(PATH_STORAGE_KEY);
    } catch {}
  };

  // Save path to localStorage
  const savePathToStorage = (path) => {
    try {
      localStorage.setItem(PATH_STORAGE_KEY, JSON.stringify(path));
    } catch (e) {
      console.error("Failed to save path to storage:", e);
    }
  };

  // Load path from localStorage
  const loadPathFromStorage = () => {
    try {
      const savedPath = localStorage.getItem(PATH_STORAGE_KEY);
      return savedPath ? JSON.parse(savedPath) : [];
    } catch (e) {
      console.error("Failed to load path from storage:", e);
      return [];
    }
  };

  // Fetch an OSRM route and return as google.maps.LatLng[]
  const fetchOsrmRoute = async (startLatLng, endLatLng) => {
    const start = `${startLatLng.lng()},${startLatLng.lat()}`; // OSRM needs lon,lat
    const end = `${endLatLng.lng()},${endLatLng.lat()}`;
    const url = `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OSRM request failed: ${res.status}`);
    const data = await res.json();
    const coords = data?.routes?.[0]?.geometry?.coordinates || [];
    return coords.map(([lng, lat]) => new window.google.maps.LatLng(lat, lng));
  };

  const calculateRoute = async (start, end) => {
    if (!window.google || !mapRef.current) return;
    try {
      setIsRouting(true);
      const path = await fetchOsrmRoute(start, end);

      // Maintain your existing polyline
      if (polyline) {
        polyline.setPath(path);
      } else {
        const newPolyline = new window.google.maps.Polyline({
          path,
          geodesic: true,
          strokeColor: "#1E88E5",
          strokeOpacity: 0.8,
          strokeWeight: 6,
          map: mapRef.current,
          icons: [
            {
              icon: {
                path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 3,
                strokeColor: "#1E88E5",
              },
              offset: "100%",
            },
          ],
        });
        setPolyline(newPolyline);
      }

      // Fit bounds to the new route
      const bounds = new window.google.maps.LatLngBounds();
      path.forEach((ll) => bounds.extend(ll));
      if (!bounds.isEmpty()) mapRef.current.fitBounds(bounds);

      // Keep downstream code working by mocking overview_path
      directionsRef.current = { routes: [{ overview_path: path }] };
    } catch (e) {
      console.error("OSRM routing failed:", e);
    } finally {
      setIsRouting(false);
    }
  };
  // Find nearest point on path
  const findNearestPointOnPath = (point, path) => {
    if (!window.google) return null;

    let minDistance = Number.MAX_VALUE;
    let nearestPoint = null;

    for (let i = 0; i < path.length; i++) {
      const distance =
        window.google.maps.geometry.spherical.computeDistanceBetween(
          point,
          path[i]
        );

      if (distance < minDistance) {
        minDistance = distance;
        nearestPoint = path[i];
      }
    }

    return nearestPoint;
  };

  // Track ambulance position and update polyline
  const updateAmbulancePosition = (position) => {
    if (!mapRef.current || !window.google) return;

    const { latitude, longitude, speed } = position.coords;
    const newPos = { lat: latitude, lng: longitude };

    // Update speed if available
    if (speed !== null) {
      setLiveSpeed(Math.round(speed * 3.6)); // Convert m/s to km/h
    }

    // If we have a route, snap to the nearest point on the route
    let displayPos = newPos;
    if (directionsRef.current?.routes?.[0]?.overview_path) {
      const nearest = findNearestPointOnPath(
        newPos,
        directionsRef.current.routes[0].overview_path
      );

      if (nearest) {
        displayPos = nearest;
      }
    }

    // Update ambulance marker
    if (markersRef.current.ambulance) {
      markersRef.current.ambulance.setPosition(displayPos);

      // Calculate heading if we have a previous position
      if (markersRef.current.ambulance.lastPos) {
        const heading = window.google.maps.geometry.spherical.computeHeading(
          markersRef.current.ambulance.lastPos,
          displayPos
        );

        // Only update if we've moved significantly
        const distance =
          window.google.maps.geometry.spherical.computeDistanceBetween(
            markersRef.current.ambulance.lastPos,
            displayPos
          );

        if (distance > 5) {
          // Only update if moved more than 5 meters
          markersRef.current.ambulance.setIcon({
            url: AMBULANCE_ICON,
            scaledSize: new window.google.maps.Size(40, 40),
            anchor: new window.google.maps.Point(20, 20),
            rotation: heading,
          });
        }
      }
      markersRef.current.ambulance.lastPos = displayPos;
    } else {
      markersRef.current.ambulance = new window.google.maps.Marker({
        position: displayPos,
        map: mapRef.current,
        icon: {
          url: AMBULANCE_ICON,
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 20),
        },
        title: "Your Ambulance",
      });
      markersRef.current.ambulance.lastPos = displayPos;
    }

    // Add new position to path if it's significantly different from last position
    const path = pathCoordinatesRef.current;
    if (
      path.length === 0 ||
      window.google.maps.geometry.spherical.computeDistanceBetween(
        path[path.length - 1],
        displayPos
      ) > 10
    ) {
      // Only add point if moved more than 10 meters
      const newPath = [...path, displayPos];
      pathCoordinatesRef.current = newPath;

      // Save the updated path to localStorage
      savePathToStorage(newPath);

      // Update or create polyline
      if (polyline) {
        polyline.setPath(newPath);
      } else {
        const newPolyline = new window.google.maps.Polyline({
          path: newPath,
          geodesic: true,
          strokeColor: "#1E88E5",
          strokeOpacity: 0.8,
          strokeWeight: 4,
          map: mapRef.current,
        });
        setPolyline(newPolyline);
      }
    }

    // Pan map to follow the ambulance with some padding
    mapRef.current.panTo(displayPos);
  };

  // Start watching position
  const startWatchingPosition = () => {
    if (navigator.geolocation) {
      // Clear any existing watch
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        updateAmbulancePosition,
        (error) => console.error("Error watching position:", error),
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000,
        }
      );
    }
  };

  // Cleanup effect for the component
  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Initialize Google Map when ride is loaded
  useEffect(() => {
    if (!ride) return;
    const container = document.getElementById("rideMap");
    if (!container) return;

    // Load saved path from storage
    const savedPath = loadPathFromStorage();
    if (savedPath.length > 0) {
      pathCoordinatesRef.current = savedPath;
    }
    // Return index of nearest point on a google.maps.LatLng[] path

    const init = async () => {
      try {
        await loadGoogleMaps();
        if (!mapRef.current) {
          mapRef.current = new window.google.maps.Map(container, {
            zoom: 12,
            center: { lat: 20.5937, lng: 78.9629 },
            mapTypeId: "roadmap",
            streetViewControl: false,
          });
          directionsServiceRef.current =
            new window.google.maps.DirectionsService();
          directionsRendererRef.current =
            new window.google.maps.DirectionsRenderer({
              map: mapRef.current,
              suppressMarkers: true,
              preserveViewport: false,
              polylineOptions: {
                strokeColor: "#1E88E5",
                strokeWeight: 6,
                strokeOpacity: 0.9,
                icons: [
                  {
                    icon: {
                      path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                      scale: 3,
                      strokeColor: "#1E88E5",
                      strokeOpacity: 0.9,
                    },
                    offset: "25px",
                    repeat: "80px",
                  },
                ],
              },
            });
        }

        // Add pickup & drop markers
        if (ride?.pickuplocation?.coordinates) {
          const [plng, plat] = ride.pickuplocation.coordinates;
          const ppos = { lat: plat, lng: plng };
          if (markersRef.current.pickup) markersRef.current.pickup.setMap(null);
          markersRef.current.pickup = new window.google.maps.Marker({
            position: ppos,
            map: mapRef.current,
            icon: PICKUP_ICON,
            title: "Pickup",
          });
          mapRef.current.setCenter(ppos);
        }
        if (ride?.droplocation?.coordinates) {
          const [dlng, dlat] = ride.droplocation.coordinates;
          const dpos = { lat: dlat, lng: dlng };
          if (markersRef.current.drop) markersRef.current.drop.setMap(null);
          markersRef.current.drop = new window.google.maps.Marker({
            position: dpos,
            map: mapRef.current,
            icon: DROP_ICON,
            title: "Drop",
          });
        }

        // Fit to bounds
        const bounds = new window.google.maps.LatLngBounds();
        ["pickup", "drop", "ambulance"].forEach((k) => {
          const m = markersRef.current[k];
          if (m) bounds.extend(m.getPosition());
        });
        if (!bounds.isEmpty()) mapRef.current.fitBounds(bounds);

        // Start watching position when map is ready
        startWatchingPosition();

        // Calculate route if we have pickup and drop locations
        if (
          ride?.pickuplocation?.coordinates &&
          ride?.droplocation?.coordinates
        ) {
          const [pLng, pLat] = ride.pickuplocation.coordinates;
          const [dLng, dLat] = ride.droplocation.coordinates;
          const start = new window.google.maps.LatLng(pLat, pLng);
          const end = new window.google.maps.LatLng(dLat, dLng);

          calculateRoute(start, end);
        }

        // Resume unfinished leg after refresh
        const saved = getRouteState();
        if (
          saved &&
          saved.rideId === ride?._id &&
          saved.target?.lat &&
          saved.target?.lng
        ) {
          // Clear static route and reset breadcrumb before live tracking
          if (polyline) {
            polyline.setMap(null);
            setPolyline(null);
          }
          pathCoordinatesRef.current = [];
          savePathToStorage([]);
          if (trailRef.current) {
            trailRef.current.setMap(null);
            trailRef.current = null;
          }
          startWatchToTarget(
            new window.google.maps.LatLng(saved.target.lat, saved.target.lng),
            () => {}
          );
        }
      } catch (e) {
        setMapError("Failed to load Google Maps");
      }
    };

    init();

    return () => {
      // keep map instance
    };
  }, [ride]);

  // Draw or update route using Google Directions
  const drawRoute = async (fromLatLng, toLatLng) => {
    if (!mapRef.current || !window.google) return;
    try {
      const path = await fetchOsrmRoute(fromLatLng, toLatLng);

      // Update or create the displayed route polyline
      if (polyline) {
        polyline.setPath(path);
      } else {
        const newPolyline = new window.google.maps.Polyline({
          path,
          geodesic: true,
          strokeColor: "#1E88E5",
          strokeOpacity: 0.9,
          strokeWeight: 6,
          map: mapRef.current,
          icons: [
            {
              icon: {
                path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 3,
                strokeColor: "#1E88E5",
                strokeOpacity: 0.9,
              },
              offset: "25px",
              repeat: "80px",
            },
          ],
        });
        setPolyline(newPolyline);
      }

      // Fit to route
      const bounds = new window.google.maps.LatLngBounds();
      path.forEach((ll) => bounds.extend(ll));
      if (!bounds.isEmpty()) mapRef.current.fitBounds(bounds);

      // Mock overview_path for snapping code
      directionsRef.current = { routes: [{ overview_path: path }] };
      routeCoordsRef.current = path.map((ll) => [ll.lat(), ll.lng()]);
      routeInitializedRef.current = true;
    } catch (e) {
      // Retry shortly, same as your old logic
      setTimeout(() => drawRoute(fromLatLng, toLatLng), 2000);
    }
  };

  // Start watching position and navigate to a target
  const startWatchToTarget = (targetLatLng, onArrive) => {
    if (!navigator.geolocation) return;
    if (watchIdRef.current)
      navigator.geolocation.clearWatch(watchIdRef.current);

    const tgt =
      targetLatLng instanceof window.google.maps.LatLng
        ? targetLatLng
        : new window.google.maps.LatLng(targetLatLng.lat, targetLatLng.lng);
    lastTargetRef.current = tgt;
    saveRouteState({
      rideId: ride?._id,
      target: { lat: tgt.lat(), lng: tgt.lng() },
    });

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

    const cur = new window.google.maps.LatLng(
      currentLocation.lat || 0,
      currentLocation.lng || 0
    );
    const finalTarget = tgt; // always route to current leg target

    // Draw route with the freshest origin possible
    routeInitializedRef.current = false;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const origin = new window.google.maps.LatLng(
            pos.coords.latitude,
            pos.coords.longitude
          );
          drawRoute(origin, finalTarget);
        },
        () => {
          drawRoute(cur, finalTarget);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      drawRoute(cur, finalTarget);
    }

    let lastRouteUpdate = Date.now();
    const ROUTE_UPDATE_INTERVAL = 5000;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, speed } = pos.coords;
        const now = Date.now();
        setCurrentLocation({
          lat: latitude,
          lng: longitude,
          loading: false,
          error: null,
        });
        setLiveSpeed(speed ? speed * 3.6 : 0);
        const here = new window.google.maps.LatLng(latitude, longitude);

        // Update ambulance marker
        if (markersRef.current.ambulance) {
          markersRef.current.ambulance.setPosition(here);
        } else if (mapRef.current) {
          markersRef.current.ambulance = new window.google.maps.Marker({
            position: here,
            map: mapRef.current,
            icon: {
              url: AMBULANCE_ICON,
              scaledSize: new window.google.maps.Size(40, 40),
              anchor: new window.google.maps.Point(20, 20),
            },
            title: "You",
          });
        }
        // Update breadcrumb trail
        if (mapRef.current) {
          if (!trailRef.current) {
            trailRef.current = new window.google.maps.Polyline({
              map: mapRef.current,
              path: [here],
              strokeColor: "#0d6efd",
              strokeOpacity: 0.8,
              strokeWeight: 3,
            });
          } else {
            const path = trailRef.current.getPath();
            path.push(here);
          }
        }
        // Update temporary straight line endpoint while waiting for route
        if (tempLineRef.current) {
          tempLineRef.current.setPath([here, finalTarget]);
        }
        mapRef.current?.panTo(here);

        if (!routeInitializedRef.current) {
          drawRoute(here, finalTarget);
          routeInitializedRef.current = true;
        } else if (now - lastRouteUpdate > ROUTE_UPDATE_INTERVAL) {
          lastRouteUpdate = now;
          drawRoute(here, finalTarget);
        }

        // arrival check within ~50m
        const dist = window.google.maps.geometry
          ? window.google.maps.geometry.spherical.computeDistanceBetween(
              here,
              tgt
            )
          : null;
        if (dist !== null && dist <= 50) {
          if (watchIdRef.current)
            navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
          clearRouteState();
          directionsRendererRef.current &&
            directionsRendererRef.current.set("directions", null);
          if (typeof onArrive === "function") onArrive();
        }
      },
      (err) =>
        setCurrentLocation((p) => ({
          ...p,
          error: err?.message || "Location error",
        })),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    );
  };

  const stopWatchAndClearRoute = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (directionsRendererRef.current) {
      try {
        directionsRendererRef.current.set("directions", null);
      } catch {}
    }
    if (tempLineRef.current) {
      try {
        tempLineRef.current.setMap(null);
      } catch {}
      tempLineRef.current = null;
    }
    if (trailRef.current) {
      try {
        trailRef.current.setMap(null);
      } catch {}
      trailRef.current = null;
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
      console.log(data.accessToken);
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

      const startRes = await axios.post(
        `${API_BASE_URL}/ambulance/ambulancerequest/startride`,
        { ambulancerequestid: ride?._id || id },
        {
          headers: {
            Authorization: `Bearer ${data.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!startRes.data?.IsSuccess) {
        throw new Error(startRes.data?.message || "Failed to start ride");
      }

      // Prompt OTP immediately after accept, before starting ride
      const otpResult = await verifyOTPBeforeComplete(id, data.accessToken);
      if (!otpResult.success) {
        await MySwal.fire({
          title: "OTP Verification Failed",
          text: otpResult.message || "Please try again.",
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#dc3545",
        });
        return false; // do not start ride/socket/nav
      }

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

      if (!response.data.IsSuccess) {
        throw new Error(response.data.message || "Failed to accept ride");
      }
      await MySwal.fire({
        title: "Ride Accepted!",
        text: "OTP verified. You can start to the pickup location.",
        icon: "success",
        confirmButtonText: "Start Ride",
        confirmButtonColor: "#198754",
      });
      // Refresh ride details to show updated status
      fetchRideDetails();

      // socket live updates after OTP success
      const socket = io(SOCKET_URL);
      const storedData = localStorage.getItem("ambulance_socket");
      const ambulanceSocket = JSON.parse(storedData);
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

      return true;
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
      return false;
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
          const ok = await handleAcceptRide();
          if (!ok) {
            // user canceled or OTP failed — do not set status or show success toast
            return;
          }

          setRide((prev) => (prev ? { ...prev, status: "accepted" } : prev));
          MySwal.fire({
            title: "Ride Accepted",
            text: "Navigation will start now.",
            icon: "success",
            toast: true,
            position: "top",
            timer: 2000,
            showConfirmButton: false,
          });
          // Start navigation: current -> pickup
          if (ride?.pickuplocation?.coordinates) {
            const [plng, plat] = ride.pickuplocation.coordinates;
            const pickupLL = new window.google.maps.LatLng(plat, plng);
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                () => {
                  startWatchToTarget(pickupLL, () => {
                    if (ride?.droplocation?.coordinates) {
                      const [dlng, dlat] = ride.droplocation.coordinates;
                      const dropLL = new window.google.maps.LatLng(dlat, dlng);
                      startWatchToTarget(dropLL, () => {
                        stopWatchAndClearRoute();
                        MySwal.fire({
                          title: "Ride Completed",
                          text: "Reached destination.",
                          icon: "success",
                        });
                      });
                    }
                  });
                },
                () => {
                  startWatchToTarget(pickupLL, () => {
                    if (ride?.droplocation?.coordinates) {
                      const [dlng, dlat] = ride.droplocation.coordinates;
                      const dropLL = new window.google.maps.LatLng(dlat, dlng);
                      startWatchToTarget(dropLL, () => {
                        stopWatchAndClearRoute();
                        MySwal.fire({
                          title: "Ride Completed",
                          text: "Reached destination.",
                          icon: "success",
                        });
                      });
                    }
                  });
                },
                { enableHighAccuracy: true, timeout: 8000 }
              );
            }
          }
        } catch (e) {
          MySwal.fire({
            title: "Failed to accept",
            text: "Please try again.",
            icon: "error",
          });
        } finally {
          setIsAccepting(false);
        }
      }
    });
  };

  const handleCompleteRide = async () => {
    try {
      setIsCompleting(true);

      // Resolve ride/request id from your current ride object
      console.log(ride?.ambulancerequestid);
      const requestId = ride?._id || ride?.ambulancerequestid || ride?.id;
      if (!requestId) {
        await MySwal.fire({
          title: "Missing Ride ID",
          text: "Unable to determine the ride ID to complete.",
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#dc3545",
        });
        return;
      }

      // Decrypt token (your existing pattern)
      // Before starting navigation, verify OTP for starting the ride
      const getlocaldata = localStorage.getItem(STORAGE_KEYS.AMBULANCE);
      const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
      const data = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

      // 2) Complete ride
      const response = await axios.post(
        `${API_BASE_URL}/ambulance/ambulancerequest/complete`,
        { ambulancerequestid: requestId },
        {
          headers: {
            Authorization: `Bearer ${data.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.IsSuccess) {
        await MySwal.fire({
          title: "Success!",
          text: "Ride marked as completed successfully!",
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#0d6efd",
        });

        navigate("/ambulance/ambrequests");
      } else {
        throw new Error(response.data.message || "Failed to complete ride");
      }
    } catch (error) {
      await MySwal.fire({
        title: "Error!",
        text:
          error.response?.data?.message ||
          error.message ||
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
                  <span className="badge bg-primary">
                    {liveSpeed.toFixed(1)} km/h
                  </span>
                </Card.Header>
                <Card.Body style={{ height: "480px", padding: 0 }}>
                  <div id="rideMap" style={{ height: "100%", width: "100%" }} />
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
