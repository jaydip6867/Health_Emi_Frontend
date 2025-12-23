import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Badge,
  Modal,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import DoctorSidebar from "./DoctorSidebar";
import axios from "axios";
import Swal from "sweetalert2";
import CryptoJS from "crypto-js";
import Loader from "../Loader";
import SmartDataTable from "../components/SmartDataTable";
import {
  API_BASE_URL,
  SECRET_KEY,
  STORAGE_KEYS,
  GOOGLE_MAPS_API_KEY,
} from "../config";
import {
  FaAmbulance,
  FaLocationArrow,
  FaMapMarkerAlt,
  FaRoute,
  FaArrowRight,
  FaMapPin,
} from "react-icons/fa";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import NavBar from "../Visitor/Component/NavBar";

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
    )}&libraries=places,marker`;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve(window.google);
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return gmapsPromise;
};

const DROP_ICON_URL = "http://maps.google.com/mapfiles/ms/icons/green-dot.png";

const D_AmbulanceRequest = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [doctor, setDoctor] = useState(null);
  const [token, setToken] = useState(null);

  const [ambulanceHistory, setAmbulanceHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const itemsPerPage = 5;

  // Add this function to fetch ambulance history for the doctor
  const fetchAmbulanceHistory = async (page = 1) => {
    if (!token || !doctor?._id) return;

    setHistoryLoading(true);
    try {
      const response = await axios({
        method: "post",
        url: `${API_BASE_URL}/doctor/ambulancerequests/list`,
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        data: {
          search: "",
        },
      });

      if (response.data && response.data.Data) {
        let doctorData = response.data.Data.filter((item) => {
          return item.doctorid == doctor._id;
        });
        // console.log(doctorData, "doctorData");
        setAmbulanceHistory(doctorData);
        const totalItems = doctorData.length;
        setTotalPages(Math.ceil(totalItems / itemsPerPage));
      }
    } catch (error) {
      console.error("Error fetching ambulance history:", error);
      setAmbulanceHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return ambulanceHistory.slice(startIndex, endIndex);
  };

  {
    getPaginatedData().map((request, index) => (
      <tr key={request._id}>
        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
        {/* rest of your row content */}
      </tr>
    ));
  }

  // Add this effect to fetch history when component mounts or page changes
  useEffect(() => {
    if (doctor?._id && token) {
      fetchAmbulanceHistory();
    }
  }, [doctor, token]);

  useEffect(() => {
    // Only try to get current location if we don't already have pickup coordinates
    if (!form.pickup_latitude || !form.pickup_longitude) {
      getCurrentLocation("pickup");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Add this render function for status badges
  const renderStatusBadge = (status) => {
    const statusMap = {
      completed: { text: "Completed", class: "badge bg-success" },
      cancelled: { text: "Cancelled", class: "badge bg-danger" },
      pending: { text: "Pending", class: "badge bg-warning" },
      accepted: { text: "Accepted", class: "badge bg-info" },
    };
    const statusInfo = statusMap[status] || {
      text: status,
      class: "badge bg-secondary",
    };
    return <span className={statusInfo.class}>{statusInfo.text}</span>;
  };

  // Add this effect to handle modal close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isViewModalOpen && e.target.classList.contains("modal")) {
        setIsViewModalOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isViewModalOpen]);

  useEffect(() => {
    let data;
    const getlocaldata = localStorage.getItem(STORAGE_KEYS.DOCTOR);
    if (getlocaldata != null) {
      const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      data = JSON.parse(decrypted);
    }
    if (!data) {
      navigate("/doctor");
    } else {
      setDoctor(data.doctorData);

      setToken(`Bearer ${data.accessToken}`);
    }
  }, [navigate]);
  // console.log(doctor, 'rewuesyt')
  const [form, setForm] = useState({
    pickupaddress: "",
    pickup_longitude: "",
    pickup_latitude: "",
    dropaddress: "",
    drop_longitude: "",
    drop_latitude: "",
  });

  const [details, setDetails] = useState({
    name: "",
    mobile: "",
    pickup_house_number: "",
    drop_house_number: "",
    book_for: "myself",
    ambulance_type: "",
    price: "",
    gst_per: 18,
    distance: 0,
  });

  const [platformFee, setPlatformFee] = useState(0);

  // Map state/refs
  const [activeType, setActiveType] = useState("pickup"); // 'pickup' | 'drop'
  const activeTypeRef = useRef("pickup");
  const mapRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const dropMarkerRef = useRef(null);
  const defaultCenter = [19.076, 72.8777]; // Mumbai
  const autoLocatedRef = useRef(false);
  const [countryCode, setCountryCode] = useState("in"); // ISO2, default India
  const [currentCity, setCurrentCity] = useState("");

  // Autosuggest state for Pickup
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const pickupDebounceRef = useRef(null);

  // Autosuggest state for Drop
  const [dropSuggestions, setDropSuggestions] = useState([]);
  const [showDropSuggestions, setShowDropSuggestions] = useState(false);
  const dropDebounceRef = useRef(null);

  const [vehiclePrices, setVehiclePrices] = useState(null);

  // Reverse geocode via Nominatim (returns display name string)
  const reverseGeocode = async (lng, lat) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        {
          headers: { Accept: "application/json" },
        }
      );
      const data = await res.json();
      return data?.display_name || "";
    } catch (e) {
      console.error("Reverse geocoding failed", e);
      return "";
    }
  };

  // Reverse geocode full metadata (address + display name)
  const reverseGeocodeMeta = async (lng, lat) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        {
          headers: { Accept: "application/json" },
        }
      );
      const data = await res.json();
      return {
        display_name: data?.display_name || "",
        address: data?.address || {},
      };
    } catch (e) {
      return { display_name: "", address: {} };
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "pickupaddress") {
      setActiveType("pickup");
      if (pickupDebounceRef.current) clearTimeout(pickupDebounceRef.current);
      pickupDebounceRef.current = setTimeout(() => {
        fetchAddressSuggestions("pickup", value);
      }, 350);
    }

    if (name === "dropaddress") {
      setActiveType("drop");
      if (dropDebounceRef.current) clearTimeout(dropDebounceRef.current);
      dropDebounceRef.current = setTimeout(() => {
        fetchAddressSuggestions("drop", value);
      }, 350);
    }
  };

  useEffect(() => {
    activeTypeRef.current = activeType;
  }, [activeType]);

  const ensureMap = async () => {
    if (mapRef.current) return mapRef.current;
    const google = await loadGoogleMaps();
    const map = new google.maps.Map(document.getElementById("ambulanceMap"), {
      center: { lat: defaultCenter[0], lng: defaultCenter[1] },
      zoom: 12,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    map.addListener("click", async (evt) => {
      const lat = evt.latLng.lat();
      const lng = evt.latLng.lng();
      const address = await reverseGeocode(lng, lat);
      const fix = (n) => Number(n.toFixed(6));
      if (activeTypeRef.current === "pickup") {
        if (pickupMarkerRef.current) {
          pickupMarkerRef.current.setPosition({ lat, lng });
        } else {
          pickupMarkerRef.current = new window.google.maps.Marker({
            position: { lat, lng },
            map,
          });
        }
        setForm((prev) => ({
          ...prev,
          pickup_latitude: fix(lat),
          pickup_longitude: fix(lng),
          pickupaddress: address || prev.pickupaddress,
        }));
      } else {
        if (dropMarkerRef.current) {
          dropMarkerRef.current.setPosition({ lat, lng });
        } else {
          dropMarkerRef.current = new google.maps.Marker({
            position: { lat, lng },
            map,
            icon: DROP_ICON_URL,
          });
        }
        setForm((prev) => ({
          ...prev,
          drop_latitude: fix(lat),
          drop_longitude: fix(lng),
          dropaddress: address || prev.dropaddress,
        }));
      }
    });

    mapRef.current = map;
    return map;
  };

  useEffect(() => {
    (async () => {
      await ensureMap();
      const autoCenterOnCurrentLocation = () => {
        if (autoLocatedRef.current) return;
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;
            const map = await ensureMap();
            map.setCenter({ lat: latitude, lng: longitude });
            map.setZoom(14);
            const fix = (n) => Number(n.toFixed(6));
            let address = "";
            const meta = await reverseGeocodeMeta(longitude, latitude);
            address = meta.display_name;
            if (meta.address?.country_code)
              setCountryCode((meta.address.country_code || "").toLowerCase());
            const cityCandidate =
              meta.address?.city ||
              meta.address?.town ||
              meta.address?.village ||
              meta.address?.state_district ||
              meta.address?.state ||
              "";
            if (cityCandidate) setCurrentCity(cityCandidate);
            if (
              !form.pickup_latitude ||
              !form.pickup_longitude ||
              !form.pickupaddress
            ) {
              if (pickupMarkerRef.current) {
                pickupMarkerRef.current.setPosition({
                  lat: latitude,
                  lng: longitude,
                });
              } else {
                const google = window.google;
                pickupMarkerRef.current = new google.maps.Marker({
                  position: { lat: latitude, lng: longitude },
                  map,
                });
              }
              setForm((prev) => ({
                ...prev,
                pickup_latitude: prev.pickup_latitude || fix(latitude),
                pickup_longitude: prev.pickup_longitude || fix(longitude),
                pickupaddress: prev.pickupaddress || address,
              }));
            }
            autoLocatedRef.current = true;
          },
          () => {},
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
        );
      };
      autoCenterOnCurrentLocation();
    })();
    return () => {
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (details.book_for === "myself" && doctor) {
      setDetails((prev) => ({
        ...prev,
        name: doctor.name || "",
        mobile: doctor.mobile || "",
      }));
    } else if (details.book_for === "other" && doctor) {
      setDetails((prev) => ({
        ...prev,
        name:  "",
        mobile: "",
      }));
    }
  }, [details.book_for, doctor]);
  const fetchAddressSuggestions = async (type, query) => {
    if (!query || query.trim().length < 3) {
      if (type === "pickup") {
        setPickupSuggestions([]);
        setShowPickupSuggestions(false);
      } else {
        setDropSuggestions([]);
        setShowDropSuggestions(false);
      }
      return;
    }

    if (!window.google || !window.google.maps) {
      console.error("Google Maps JS not loaded");
      return;
    }

    try {
      const map = await ensureMap();
      const center = map.getCenter();

      const service = new window.google.maps.places.AutocompleteService();

      service.getPlacePredictions(
        {
          input: query,
          location: new window.google.maps.LatLng(center.lat(), center.lng()),
          radius: 5000,
          componentRestrictions: { country: "in" },
        },
        (predictions, status) => {
          if (
            status !== window.google.maps.places.PlacesServiceStatus.OK ||
            !predictions
          ) {
            console.error("Places API error:", status);
            return;
          }

          const items = predictions.map((p) => ({
            place_id: p.place_id,
            display_name: p.description,
            lat: null,
            lon: null,
          }));

          const suggestions = [{ group: "Suggestions", items }];

          if (type === "pickup") {
            setPickupSuggestions(suggestions);
            setShowPickupSuggestions(true);
          } else {
            setDropSuggestions(suggestions);
            setShowDropSuggestions(true);
          }
        }
      );
    } catch (e) {
      console.error("Autocomplete failed", e);
    }
  };

  const fetchPlaceDetails = (placeId) => {
    if (!placeId || !window.google) return Promise.resolve(null);

    return new Promise((resolve) => {
      const service = new window.google.maps.places.PlacesService(
        document.createElement("div")
      );

      service.getDetails(
        {
          placeId,
          fields: ["geometry", "formatted_address", "name"],
        },
        (place, status) => {
          if (
            status !== window.google.maps.places.PlacesServiceStatus.OK ||
            !place?.geometry?.location
          ) {
            console.error("Place details error:", status);
            resolve(null);
            return;
          }

          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();

          resolve({
            lat: Number(lat.toFixed(6)),
            lon: Number(lng.toFixed(6)),
            display_name: place.formatted_address || place.name || "",
          });
        }
      );
    });
  };

  const selectSuggestion = async (type, sug) => {
    let lat = sug.lat != null ? Number(Number(sug.lat).toFixed(6)) : null;
    let lon = sug.lon != null ? Number(Number(sug.lon).toFixed(6)) : null;
    let display = sug.display_name || "";
    if ((!lat || !lon) && sug.place_id) {
      const details = await fetchPlaceDetails(sug.place_id);
      if (details) {
        lat = details.lat;
        lon = details.lon;
        display = details.display_name || display;
      }
    }
    if (!lat || !lon) {
      console.warn("No coordinates available for selected suggestion", sug);
      return;
    }
    const map = await ensureMap();
    map.setCenter({ lat, lng: lon });
    map.setZoom(14);
    if (type === "pickup") {
      if (pickupMarkerRef.current) {
        pickupMarkerRef.current.setPosition({ lat, lng: lon });
      } else {
        const google = window.google;
        pickupMarkerRef.current = new google.maps.Marker({
          position: { lat, lng: lon },
          map,
        });
      }
      setForm((prev) => ({
        ...prev,
        pickup_latitude: lat,
        pickup_longitude: lon,
        pickupaddress: display,
      }));
      setPickupSuggestions([]);
      setShowPickupSuggestions(false);
    } else {
      if (dropMarkerRef.current) {
        dropMarkerRef.current.setPosition({ lat, lng: lon });
      } else {
        const google = window.google;
        dropMarkerRef.current = new google.maps.Marker({
          position: { lat, lng: lon },
          map,
          icon: DROP_ICON_URL,
        });
      }
      setForm((prev) => ({
        ...prev,
        drop_latitude: lat,
        drop_longitude: lon,
        dropaddress: display,
      }));
      setDropSuggestions([]);
      setShowDropSuggestions(false);
    }
  };

  const getCurrentLocation = async (type) => {
    if (!navigator.geolocation) {
      Swal.fire("Error", "Geolocation not supported", "warning");
      return;
    }

    const permission =
      navigator.permissions &&
      (await navigator.permissions.query({ name: "geolocation" }));

    if (permission?.state === "denied") {
      Swal.fire(
        "Location blocked",
        "Please allow location access in browser settings",
        "error"
      );
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;

          const map = await ensureMap();
          map.setCenter({ lat: latitude, lng: longitude });
          map.setZoom(14);

          const geocoder = new window.google.maps.Geocoder();

          geocoder.geocode(
            { location: { lat: latitude, lng: longitude } },
            (results, status) => {
              if (status === "OK" && results[0]) {
                const address = results[0].formatted_address;

                const fix = (n) => Number(n.toFixed(6));

                if (type === "pickup") {
                  pickupMarkerRef.current?.setMap(null);
                  pickupMarkerRef.current = new window.google.maps.Marker({
                    position: { lat: latitude, lng: longitude },
                    map,
                  });

                  setForm((prev) => ({
                    ...prev,
                    pickup_latitude: fix(latitude),
                    pickup_longitude: fix(longitude),
                    pickupaddress: address,
                  }));
                } else {
                  dropMarkerRef.current?.setMap(null);
                  dropMarkerRef.current = new window.google.maps.Marker({
                    position: { lat: latitude, lng: longitude },
                    map,
                    icon: DROP_ICON_URL,
                  });

                  setForm((prev) => ({
                    ...prev,
                    drop_latitude: fix(latitude),
                    drop_longitude: fix(longitude),
                    dropaddress: address,
                  }));
                }

                Swal.fire({
                  title: "Location detected",
                  icon: "success",
                  timer: 1200,
                  showConfirmButton: false,
                });
              }
            }
          );
        } catch (e) {
          console.error(e);
          Swal.fire("Error", "Failed to process location", "error");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setLoading(false);
        Swal.fire(
          "Location Error",
          err.message || "Unable to detect location",
          "error"
        );
      },
      {
        enableHighAccuracy: false,
        timeout: 20000,
        maximumAge: 30000,
      }
    );
  };

  const validate = () => {
    const required = [
      "pickupaddress",
      "pickup_longitude",
      "pickup_latitude",
      "dropaddress",
      "drop_longitude",
      "drop_latitude",
    ];
    for (const key of required) {
      if (form[key] === "" || form[key] === null || form[key] === undefined) {
        return false;
      }
    }
    return true;
  };

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

  // Helper function to handle mobile number input (10-digit Indian numbers only)
  const handleMobileChange = (e) => {
    const value = e.target.value;
    // Remove all non-digit characters
    const numericValue = value.replace(/\D/g, "");
    // Limit to 10 digits
    const limitedValue = numericValue.slice(0, 10);

    setDetails((p) => ({
      ...p,
      mobile: limitedValue,
    }));
  };

  const validateDetails = () => {
    if (!details.name || !details.mobile) return false;
    // Validate 10-digit Indian mobile number
    if (!/^\d{10}$/.test(String(details.mobile))) return false;
    if (
      details.price === "" ||
      details.price === null ||
      details.price === undefined
    )
      return false;
    if (isNaN(Number(details.price))) return false;
    return true;
  };

  // Auto compute distance once both locations are available
  useEffect(() => {
    const hasPickup =
      form.pickup_latitude && form.pickup_longitude && form.pickupaddress;
    const hasDrop =
      form.drop_latitude && form.drop_longitude && form.dropaddress;
    if (hasPickup && hasDrop) {
      const dist = haversineKm(
        Number(form.pickup_latitude),
        Number(form.pickup_longitude),
        Number(form.drop_latitude),
        Number(form.drop_longitude)
      );
      setDetails((p) => ({ ...p, distance: dist }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    form.pickup_latitude,
    form.pickup_longitude,
    form.drop_latitude,
    form.drop_longitude,
    form.pickupaddress,
    form.dropaddress,
  ]);

  // Fetch all vehicle prices when distance is available
  useEffect(() => {
    if (Number(details.distance) > 0 && token) {
      fetchAllPrices(details.distance);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [details.distance, token]);

  const fetchPrice = async (type, distanceKm) => {
    if (!token) return;
    try {
      const res = await axios({
        method: "post",
        url: `${API_BASE_URL}/doctor/ambulancerequests/getprice`,
        headers: { Authorization: token },
        data: { distance: distanceKm },
      });
      const payload = res.data.Data;
      const typeKeyMap = {
        Ambulance: "ambulance_price",
        Bike: "bike_price",
        Rickshaw: "rickshaw_price",
        Cab: "cab_price",
      };
      const key = typeKeyMap[type] || "ambulance_price";
      const nextPrice = payload[key];
      const nextGst = payload.gst_per;
      setDetails((p) => ({
        ...p,
        price:
          nextPrice !== undefined &&
          nextPrice !== null &&
          !isNaN(Number(nextPrice))
            ? Number(nextPrice)
            : p.price,
        gst_per:
          nextGst !== undefined && nextGst !== null && !isNaN(Number(nextGst))
            ? Number(nextGst)
            : p.gst_per,
      }));
    } catch (e) {}
  };

  const fetchAllPrices = async (distanceKm) => {
    if (!token) return;
    try {
      const res = await axios({
        method: "post",
        url: `${API_BASE_URL}/doctor/ambulancerequests/getprice`,
        headers: { Authorization: token },
        data: { distance: Math.round(distanceKm) },
      });
      // console.log(res.data);
      const p = res.data?.Data || {};
      const prices = {
        Ambulance: p.ambulance_price,
        Bike: p.bike_price,
        Rickshaw: p.rickshaw_price,
        Cab: p.cab_price,
      };
      setVehiclePrices(prices);
      setDetails((prev) => ({
        ...prev,
        price:
          prices[prev.ambulance_type] !== undefined &&
          prices[prev.ambulance_type] !== null
            ? Number(prices[prev.ambulance_type])
            : prev.price,
        gst_per:
          p.gst_per !== undefined && p.gst_per !== null
            ? Number(p.gst_per)
            : prev.gst_per,
      }));
      if (p.platform_fee !== undefined && p.platform_fee !== null) {
        setPlatformFee(Number(p.platform_fee));
      } else {
        setPlatformFee(0);
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (!details.ambulance_type) return;
    if (Number(details.distance) <= 0) return;
    fetchPrice(details.ambulance_type, details.distance);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [details.ambulance_type, details.distance, token]);

  const performSave = async (overrideDistance) => {
    setLoading(true);
    await axios({
      method: "post",
      url: `${API_BASE_URL}/doctor/ambulancerequests/save`,
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
        name: details.name,
        mobile: details.mobile,
        pickup_house_number: details.pickup_house_number,
        drop_house_number: details.drop_house_number,
        book_for: details.book_for,
        ambulance_type: details.ambulance_type,
        price: Number(details.price),
        gst_per: Number(details.gst_per),
        platform_fee: Number(platformFee),
        distance: Number(
          overrideDistance !== undefined ? overrideDistance : details.distance
        ),
      },
    })
      .then((res) => {
        if (res.data && res.data.Data) {
          localStorage.setItem(
            "lastAmbulanceRequest",
            JSON.stringify({
              requestId: res.data.Data.requestId,
              notifiedCount: res.data.Data.notifiedCount,
              timestamp: new Date().toISOString(),
            })
          );
        }
        if (
          pickupMarkerRef.current &&
          typeof pickupMarkerRef.current.setMap === "function"
        ) {
          pickupMarkerRef.current.setMap(null);
          pickupMarkerRef.current = null;
        }
        if (
          dropMarkerRef.current &&
          typeof dropMarkerRef.current.setMap === "function"
        ) {
          dropMarkerRef.current.setMap(null);
          dropMarkerRef.current = null;
        }
        setForm({
          pickupaddress: "",
          pickup_longitude: "",
          pickup_latitude: "",
          dropaddress: "",
          drop_longitude: "",
          drop_latitude: "",
        });
        setDetails({
          name: "",
          mobile: "",
          pickup_house_number: "",
          drop_house_number: "",
          book_for: "myself",
          ambulance_type: "",
          price: "",
          gst_per: 18,
          distance: 0,
        });
        setPlatformFee(0);
        localStorage.setItem("amb_req_id", res.data.Data.requestId);
        navigate(`/doctor/ambulance-request/status/${res.data.Data.requestId}`);
      })
      .catch((error) => {
        console.error(error);
        Swal.fire({
          title: "Failed to submit",
          text:
            error?.response?.data?.Message ||
            "Something went wrong, please try again.",
          icon: "error",
        });
      })
      .finally(() => setLoading(false));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      Swal.fire({
        title: "Please select pickup and drop locations",
        icon: "warning",
      });
      return;
    }
    const dist = haversineKm(
      Number(form.pickup_latitude),
      Number(form.pickup_longitude),
      Number(form.drop_latitude),
      Number(form.drop_longitude)
    );
    const nextDetails = { ...details, distance: dist };
    setDetails(nextDetails);
    if (!nextDetails.name || !nextDetails.mobile) {
      Swal.fire({ title: "Enter passenger name and mobile", icon: "warning" });
      return;
    }
    if (!/^\d{10}$/.test(String(nextDetails.mobile))) {
      Swal.fire({
        title: "Enter valid 10-digit mobile number",
        icon: "warning",
      });
      return;
    }
    if (!nextDetails.ambulance_type) {
      Swal.fire({ title: "Please select a vehicle", icon: "warning" });
      return;
    }
    if (
      nextDetails.price === "" ||
      nextDetails.price === null ||
      nextDetails.price === undefined ||
      isNaN(Number(nextDetails.price))
    ) {
      Swal.fire({ title: "Select vehicle to get fare", icon: "warning" });
      return;
    }
    performSave(dist);
  };

  const hasBothLocations =
    !!form.pickupaddress &&
    !!form.dropaddress &&
    !!form.pickup_latitude &&
    !!form.pickup_longitude &&
    !!form.drop_latitude &&
    !!form.drop_longitude;

  const mobileValid = /^\d{10}$/.test(String(details.mobile || ""));
  const priceValid = !(
    details.price === "" ||
    details.price === null ||
    details.price === undefined ||
    isNaN(Number(details.price))
  );
  const showVehicle = hasBothLocations && !!details.name && mobileValid;
  const canSubmit =
    hasBothLocations &&
    !!details.ambulance_type &&
    !!details.name &&
    mobileValid &&
    priceValid;

  // Table columns configuration for SmartDataTable
  const customTableStyles = {
    table: {
      backgroundColor: "transparent",
      borderRadius: 0,
      boxShadow: "none",
    },
  };

  const columns = [
    {
      name: "No",
      cell: (row, index) => index + 1,
      width: "50px",
    },
    {
      name: "Name",
      selector: (row) => row.name,
      cell: (row) => (
        <div className="">
          <span className="fw-semibold">{row?.name || "N/A"}</span>
        </div>
      ),
    },
    {
      name: "Pickup",
      selector: (row) => row.pickupaddress,
      cell: (row) => (
        <div
          className="text-truncate"
          style={{ maxWidth: "150px" }}
          title={row.pickupaddress}
        >
          <span>{row.pickupaddress || "N/A"}</span>
        </div>
      ),
    },
    {
      name: "Drop",
      selector: (row) => row.dropaddress,
      cell: (row) => (
        <div
          className="text-truncate"
          style={{ maxWidth: "150px" }}
          title={row.dropaddress}
        >
          <span>{row.dropaddress || "N/A"}</span>
        </div>
      ),
    },
    {
      name: "Type",
      selector: (row) => row.ambulance_type,
      cell: (row) => (
        <span className="badge bg-primary">{row.ambulance_type || "N/A"}</span>
      ),
    },
    {
      name: "Status",
      selector: (row) => row.status,
      cell: (row) => renderStatusBadge(row.status),
    },
    {
      name: "View",
      cell: (row) => (
        <button
          className="btn btn-sm p-1 appt-view-btn"
          onClick={() => {
            setSelectedRequest(row);
            setIsViewModalOpen(true);
          }}
          title="View Details"
        >
          <MdOutlineRemoveRedEye size={18} />
        </button>
      ),
      width: "100px",
      center: true,
    },
  ];

  return (
    <>
      <NavBar logindata={doctor} />
      <Container className="my-4">
        <Row className="g-0">
          <DoctorSidebar doctor={doctor} />
          <Col xs={12} lg={9} className="p-3">
            <div className="bg-white rounded p-2">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 border-bottom py-3">
                <h4 className="mb-0">Book Ambulance</h4>
                <Button
                  variant="primary"
                  className="apt_accept_btn"
                  onClick={() => setShowHistory(!showHistory)}
                >
                  {showHistory ? "Hide" : "Show"} Ambulance History
                </Button>
              </div>
              {localStorage.getItem("amb_req_id") != null ? (
                <div className="d-flex justify-content-end mt-2">
                  <Button
                    type="submit"
                    className="px-4"
                    style={{ backgroundColor: "#4F46E5" }}
                    onClick={() => {
                      navigate(
                        `/doctor/ambulance-request/status/${localStorage.getItem(
                          "amb_req_id"
                        )}`
                      );
                    }}
                  >
                    {loading ? (
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                    ) : null}
                    ambulace ride pogress
                  </Button>
                </div>
              ) : (
                <Row>
                  <Col xs={12} md={5}>
                    {/* Map + Geocoder */}
                    <Card className="mt-3 shadow-sm border-0">
                      <Card.Header className="bg-light d-flex flex-wrap gap-2 align-items-center">
                        <div className="me-3 fw-semibold">Select Target:</div>
                        <Form.Check
                          inline
                          type="radio"
                          id="active-pickup"
                          label="Pickup"
                          name="activeType"
                          checked={activeType === "pickup"}
                          onChange={() => setActiveType("pickup")}
                        />
                        <Form.Check
                          inline
                          type="radio"
                          id="active-drop"
                          label="Drop"
                          name="activeType"
                          checked={activeType === "drop"}
                          onChange={() => setActiveType("drop")}
                        />
                      </Card.Header>
                      <Card.Body className="p-0" style={{ height: 380 }}>
                        <div
                          id="ambulanceMap"
                          style={{ width: "100%", height: "100%" }}
                        />
                      </Card.Body>
                    </Card>
                    <div className="text-muted small mt-2 px-1">
                      Tip: You can click "Use Current Location" to auto-fill
                      latitude and longitude fields.
                    </div>
                  </Col>
                  <Col xs={12} md={7}>
                    {/* Form of ambulace */}
                    <Card className="mt-3 shadow-sm border-0">
                      <Card.Body className="p-4">
                        <Form onSubmit={handleSubmit}>
                          <Row>
                            <Col md={6} className="mb-4">
                              <div
                                className="d-flex align-items-center mb-2"
                                style={{ color: "#374151" }}
                              >
                                <FaMapMarkerAlt className="me-2" />
                                <h6 className="m-0">Pickup Location</h6>
                              </div>
                              <Form.Group className="mb-3 position-relative">
                                <Form.Label>Pickup Address</Form.Label>
                                <Form.Control
                                  type="text"
                                  placeholder="Search pickup address"
                                  name="pickupaddress"
                                  value={form.pickupaddress}
                                  onChange={onChange}
                                  onFocus={() => {
                                    setActiveType("pickup");
                                    if (
                                      form.pickupaddress &&
                                      form.pickupaddress.length >= 3
                                    ) {
                                      setShowPickupSuggestions(true);
                                      if (
                                        !pickupSuggestions ||
                                        pickupSuggestions.length === 0
                                      ) {
                                        fetchAddressSuggestions(
                                          "pickup",
                                          form.pickupaddress
                                        );
                                      }
                                    }
                                  }}
                                  onBlur={() =>
                                    setTimeout(
                                      () => setShowPickupSuggestions(false),
                                      150
                                    )
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Escape")
                                      setShowPickupSuggestions(false);
                                  }}
                                  autoComplete="off"
                                />
                                {showPickupSuggestions &&
                                  pickupSuggestions.length > 0 && (
                                    <div
                                      className="bg-white border rounded shadow position-absolute w-100"
                                      style={{
                                        zIndex: 1050,
                                        maxHeight: 260,
                                        overflowY: "auto",
                                      }}
                                    >
                                      {pickupSuggestions.map((group, gIdx) => (
                                        <div key={`p-group-${gIdx}`}>
                                          <div className="px-2 py-1 small text-muted bg-light">
                                            {group.group}
                                          </div>
                                          {group.items.map((sug, idx) => (
                                            <div
                                              key={`p-${sug.osm_id}-${idx}`}
                                              className="p-2 suggestion-item"
                                              style={{ cursor: "pointer" }}
                                              onMouseDown={(e) => {
                                                e.preventDefault();
                                                selectSuggestion("pickup", sug);
                                              }}
                                            >
                                              <div
                                                className="fw-semibold"
                                                style={{ fontSize: "0.9rem" }}
                                              >
                                                {sug.display_name}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                              </Form.Group>
                              {/* Hidden fields for pickup coordinates (not shown to user) */}
                              <Form.Control
                                type="hidden"
                                name="pickup_latitude"
                                value={form.pickup_latitude}
                                readOnly
                              />
                              <Form.Control
                                type="hidden"
                                name="pickup_longitude"
                                value={form.pickup_longitude}
                                readOnly
                              />
                              <Button
                                variant="outline-primary"
                                size="sm"
                                type="button"
                                onClick={() => getCurrentLocation("pickup")}
                              >
                                <FaLocationArrow className="me-2" /> Use Current
                                Location
                              </Button>
                            </Col>

                            <Col md={6} className="mb-4">
                              <div
                                className="d-flex align-items-center mb-2"
                                style={{ color: "#374151" }}
                              >
                                <FaRoute className="me-2" />
                                <h6 className="m-0">Drop Location</h6>
                              </div>
                              <Form.Group className="mb-3 position-relative">
                                <Form.Label>Drop Address</Form.Label>
                                <Form.Control
                                  type="text"
                                  placeholder="Search drop address"
                                  name="dropaddress"
                                  value={form.dropaddress}
                                  onChange={onChange}
                                  onFocus={() => {
                                    setActiveType("drop");
                                    if (
                                      form.dropaddress &&
                                      form.dropaddress.length >= 3
                                    ) {
                                      setShowDropSuggestions(true);
                                      if (
                                        !dropSuggestions ||
                                        dropSuggestions.length === 0
                                      ) {
                                        fetchAddressSuggestions(
                                          "drop",
                                          form.dropaddress
                                        );
                                      }
                                    }
                                  }}
                                  onBlur={() =>
                                    setTimeout(
                                      () => setShowDropSuggestions(false),
                                      150
                                    )
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Escape")
                                      setShowDropSuggestions(false);
                                  }}
                                  autoComplete="off"
                                />
                                {showDropSuggestions &&
                                  dropSuggestions.length > 0 && (
                                    <div
                                      className="bg-white border rounded shadow position-absolute w-100"
                                      style={{
                                        zIndex: 1050,
                                        maxHeight: 260,
                                        overflowY: "auto",
                                      }}
                                    >
                                      {dropSuggestions.map((group, gIdx) => (
                                        <div key={`d-group-${gIdx}`}>
                                          <div className="px-2 py-1 small text-muted bg-light">
                                            {group.group}
                                          </div>
                                          {group.items.map((sug, idx) => (
                                            <div
                                              key={`d-${sug.osm_id}-${idx}`}
                                              className="p-2 suggestion-item"
                                              style={{ cursor: "pointer" }}
                                              onMouseDown={(e) => {
                                                e.preventDefault();
                                                selectSuggestion("drop", sug);
                                              }}
                                            >
                                              <div
                                                className="fw-semibold"
                                                style={{ fontSize: "0.9rem" }}
                                              >
                                                {sug.display_name}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                              </Form.Group>
                              {/* Hidden fields for drop coordinates (not shown to user) */}
                              <Form.Control
                                type="hidden"
                                name="drop_latitude"
                                value={form.drop_latitude}
                                readOnly
                              />
                              <Form.Control
                                type="hidden"
                                name="drop_longitude"
                                value={form.drop_longitude}
                                readOnly
                              />
                              {/* <Button
                                variant="outline-primary"
                                size="sm"
                                type="button"
                                onClick={() => getCurrentLocation("drop")}
                              >
                                <FaLocationArrow className="me-2" /> Use Current
                                Location
                              </Button> */}
                            </Col>
                          </Row>

                          {/* Passenger details (after locations, before vehicle) */}
                          {hasBothLocations && (
                            <div className="mt-3">
                              <div
                                className="d-flex align-items-center mb-2"
                                style={{ color: "#374151" }}
                              >
                                <h6 className="m-0">Passenger Details</h6>
                              </div>
                              <Row className="g-3">
                                <Col md={6}>
                                  <Form.Group>
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                      value={details.name}
                                      onChange={(e) =>
                                        setDetails((p) => ({
                                          ...p,
                                          name: e.target.value,
                                        }))
                                      }
                                      placeholder="Full name"
                                    />
                                  </Form.Group>
                                </Col>
                                <Col md={6}>
                                  <Form.Group>
                                    <Form.Label>Mobile</Form.Label>
                                    <Form.Control
                                      value={details.mobile}
                                      onChange={handleMobileChange}
                                      placeholder="e.g. 9876543210"
                                    />
                                  </Form.Group>
                                </Col>
                                <Col md={6}>
                                  <Form.Group>
                                    <Form.Label>Pickup House No.</Form.Label>
                                    <Form.Control
                                      value={details.pickup_house_number}
                                      onChange={(e) =>
                                        setDetails((p) => ({
                                          ...p,
                                          pickup_house_number: e.target.value,
                                        }))
                                      }
                                      placeholder="House/Flat no."
                                    />
                                  </Form.Group>
                                </Col>
                                <Col md={6}>
                                  <Form.Group>
                                    <Form.Label>Drop House No.</Form.Label>
                                    <Form.Control
                                      value={details.drop_house_number}
                                      onChange={(e) =>
                                        setDetails((p) => ({
                                          ...p,
                                          drop_house_number: e.target.value,
                                        }))
                                      }
                                      placeholder="House/Flat no."
                                    />
                                  </Form.Group>
                                </Col>
                                <Col md={12}>
                                  <Form.Group>
                                    <Form.Label>Book For</Form.Label>
                                    <div>
                                      {["myself", "other"].map((opt) => (
                                        <Form.Check
                                          inline
                                          key={opt}
                                          type="radio"
                                          label={opt}
                                          name="book_for"
                                          checked={details.book_for === opt}
                                          onChange={() =>
                                            setDetails((p) => ({
                                              ...p,
                                              book_for: opt,
                                            }))
                                          }
                                        />
                                      ))}
                                    </div>
                                  </Form.Group>
                                </Col>
                              </Row>
                            </div>
                          )}

                          {showVehicle && (
                            <div className="mt-3">
                              <div
                                className="d-flex align-items-center justify-content-between mb-2"
                                style={{ color: "#374151" }}
                              >
                                <div className="d-flex align-items-center">
                                  <FaAmbulance className="me-2" />
                                  <h6 className="m-0">Select Vehicle</h6>
                                </div>
                                <div className="small text-muted"></div>
                              </div>
                              <Row className="bg-white g-3">
                                {[
                                  // { key: "Ambulance", label: "Ambulance", icon: <FaAmbulance size={28} className="me-3" />, sub: "Emergency medical van" },
                                  // { key: "Bike", label: "Bike", icon: <FaMotorcycle size={28} className="me-3" />, sub: "Beat the traffic on a bike" },
                                  // { key: "Rickshaw", label: "Rickshaw", icon: <FaCar size={28} className="me-3" />, sub: "Quick auto ride in town" },
                                  // { key: "Cab", label: "Cab", icon: <FaCar size={28} className="me-3" />, sub: "Comfy, economical cars" },
                                  {
                                    key: "Ambulance",
                                    label: "Ambulance",
                                    icon: require("../Visitor/assets/icon/ambulance_icon.png"),
                                    sub: "Emergency medical van",
                                  },
                                  {
                                    key: "Bike",
                                    label: "Bike",
                                    icon: require("../Visitor/assets/icon/bike_icon.png"),
                                    sub: "Beat the traffic on a bike",
                                  },
                                  {
                                    key: "Rickshaw",
                                    label: "Rickshaw",
                                    icon: require("../Visitor/assets/icon/rikshaw_icon.png"),
                                    sub: "Quick auto ride in town",
                                  },
                                  {
                                    key: "Cab",
                                    label: "Cab",
                                    icon: require("../Visitor/assets/icon/car_icon.png"),
                                    sub: "Comfy, economical cars",
                                  },
                                ].map((opt, idx) => {
                                  const price = vehiclePrices
                                    ? vehiclePrices[opt.key]
                                    : null;
                                  const selected =
                                    details.ambulance_type === opt.key;
                                  return (
                                    <Col
                                      xs={6}
                                      key={opt.key}
                                      className={`text-center`}
                                    >
                                      <div
                                        className={`p-2 border rounded h-100 d-flex flex-column justify-content-center ${
                                          selected ? "shadow-sm" : ""
                                        }`}
                                        style={{
                                          cursor: "pointer",
                                          backgroundColor: selected
                                            ? "#EEF2FF"
                                            : "#fff",
                                        }}
                                        onClick={() =>
                                          setDetails((p) => ({
                                            ...p,
                                            ambulance_type: opt.key,
                                            price:
                                              price !== undefined &&
                                              price !== null
                                                ? Number(price)
                                                : p.price,
                                          }))
                                        }
                                      >
                                        <div className="text-center">
                                          <img
                                            src={opt.icon}
                                            alt="ambulance image"
                                            className="mx-auto mb-2"
                                            style={{ maxHeight: "35px" }}
                                          />
                                          <div>
                                            <div className="fw-semibold">
                                              {price !== undefined &&
                                              price !== null
                                                ? `₹${price}`
                                                : "—"}{" "}
                                            </div>
                                            <div className="fw-semibold badge text-bg-dark">
                                              {opt.label}
                                            </div>
                                            {/* <div className="text-muted" style={{ fontSize: "0.8rem" }}>{opt.sub}</div> */}
                                          </div>
                                        </div>
                                        {/* <div className="text-end">
                                            <div className="text-muted" style={{ fontSize: "0.8rem" }}>GST + {platformFee ? `(₹${platformFee}) platform fee incl.` : ""}</div>
                                          </div> */}
                                      </div>
                                    </Col>
                                  );
                                })}
                              </Row>
                            </div>
                          )}

                          <div className="d-flex justify-content-end mt-2">
                            <Button
                              type="submit"
                              className="px-4"
                              style={{ backgroundColor: "#4F46E5" }}
                              disabled={loading || !token || !canSubmit}
                            >
                              {loading ? (
                                <span
                                  className="spinner-border spinner-border-sm me-2"
                                  role="status"
                                  aria-hidden="true"
                                ></span>
                              ) : null}
                              Request Ambulance
                            </Button>
                          </div>
                        </Form>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              )}
            </div>

            {showHistory && (
              <div className="appointments-card mb-3 mt-4">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 border-bottom pb-3">
                  <h4 className="mb-0">Book Ambulance History</h4>
                  <Badge text="white" className="apt_accept_btn">
                    {ambulanceHistory ? ambulanceHistory.length : 0} Requests
                  </Badge>
                </div>
                <SmartDataTable
                  className="appointments-table"
                  columns={columns}
                  data={ambulanceHistory || []}
                  pagination
                  customStyles={customTableStyles}
                />
              </div>
            )}
          </Col>
        </Row>
        <Modal
          show={isViewModalOpen}
          onHide={() => setIsViewModalOpen(false)}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>Ambulance Details</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-0">
            {selectedRequest && (
              <div className="ambulance-details-card">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                  <div className="text-muted">
                    {selectedRequest.createdAt
                      ? new Date(selectedRequest.createdAt).toLocaleString(
                          "en-US",
                          {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          }
                        )
                      : "Today, 4:42PM"}
                  </div>
                  <Badge
                    bg={
                      selectedRequest?.status === "completed"
                        ? "success"
                        : selectedRequest?.status === "cancelled"
                        ? "danger"
                        : "warning"
                    }
                  >
                    {selectedRequest?.status}
                  </Badge>
                  <div className="fw-bold text-success">
                    ₹ {selectedRequest.price || "80"}
                  </div>
                </div>

                {/* Ambulance Driver/Vehicle Info */}
                {selectedRequest.acceptedAmbulance && (
                  <div className="d-flex align-items-center p-3 border-bottom">
                    <FaAmbulance className="text-primary me-3" size={24} />
                    <div className="flex-grow-1">
                      <div className="fw-semibold">
                        {selectedRequest.acceptedAmbulance.fullname ||
                          "NandKumar Yadav"}
                      </div>
                      <div className="text-muted small">
                        Ambulance |{" "}
                        {selectedRequest.acceptedAmbulance.vehicle_no ||
                          "GJ-05-TR-2859"}
                      </div>
                    </div>
                    {/* <FaArrowRight className="text-muted" /> */}
                  </div>
                )}

                {/* Pickup Location */}
                <div className="p-3 border-bottom">
                  <div className="d-flex">
                    <div className="me-3">
                      <div className="position-relative">
                        <FaMapPin className="text-success" size={20} />
                        <div className="vertical-dashed-line"></div>
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <div className="text-muted small mb-1">
                        Pickup Location
                      </div>
                      <div className="fw-medium">
                        {selectedRequest.pickupaddress ||
                          "Sahajanand Business Hub, Yogi Cho..."}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Drop Location */}
                <div className="p-3 border-bottom">
                  <div className="d-flex">
                    <div className="me-3">
                      <FaMapPin className="text-danger" size={20} />
                    </div>
                    <div className="flex-grow-1">
                      <div className="text-muted small mb-1">Drop Location</div>
                      <div className="fw-medium">
                        {selectedRequest.dropaddress ||
                          "Savan Plaza, Savaliya Circle"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="d-flex justify-content-between align-items-center p-3 bg-light">
                  <div className="text-muted small">
                    Total Distance {selectedRequest.distance || "5.2"} Km
                  </div>
                  <div className="text-muted small">
                    Total Duration{" "}
                    {Math.round((selectedRequest.distance || 5.2) * 5)} Min
                  </div>
                </div>
              </div>
            )}
          </Modal.Body>
        </Modal>
      </Container>
      {loading ? <Loader /> : ""}

      <style jsx>{`
        .ambulance-details-card {
          background: white;
          border-radius: 8px;
          overflow: hidden;
        }

        .vertical-dashed-line {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: 2px;
          height: 40px;
          background-image: linear-gradient(
            to bottom,
            #ccc 50%,
            transparent 50%
          );
          background-size: 2px 8px;
          background-repeat: repeat-y;
        }
      `}</style>
    </>
  );
};

export default D_AmbulanceRequest;
