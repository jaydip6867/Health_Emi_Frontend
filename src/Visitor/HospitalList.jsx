import React, { useEffect, useRef, useState } from "react";
import NavBar from "./Component/NavBar";
import { Button, Col, Container, Row } from "react-bootstrap";
import Loader from "../Loader";
import FooterBar from "./Component/FooterBar";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";
import SearchBox from "./Component/SearchBox";
import { TbMapPin } from "react-icons/tb";
import { MdFilterListAlt } from "react-icons/md";
import DoctorListComponents from "./Component/DoctorListComponent";
import { API_BASE_URL, SECRET_KEY, STORAGE_KEYS } from "../config";
import { TbChevronRight } from "react-icons/tb";
import HospitalSearch from "./Component/HospitalSearch";

const HospitalList = () => {
  const navigate = useNavigate();
  const searchRef = useRef();

  const [patient, setpatient] = useState(null);
  const [token, settoken] = useState(null);

  const [loading, setloading] = useState(false);
  const [doctor_list, setdoclist] = useState([]);
  const [hospitalAllList, setHospitalAllList] = useState([]);
  const [hospitalList, setHospitalList] = useState([]);

  // =========================================================
  // Get Patient Data
  // =========================================================
  useEffect(() => {
    const getlocaldata = localStorage.getItem(STORAGE_KEYS.PATIENT);

    if (getlocaldata != null) {
      try {
        const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        const data = JSON.parse(decrypted);

        if (data) {
          setpatient(data.userData);
          settoken(`Bearer ${data.accessToken}`);
        }
      } catch (error) {
        console.error("Error decrypting patient data:", error);
      }
    }
  }, [navigate]);

  // =========================================================
  // Get Doctors
  // =========================================================
  useEffect(() => {
    getdoctorlist();
  }, [token]);

  const getdoctorlist = async () => {
    try {
      setloading(true);

      const endpoint = `${API_BASE_URL}/user/doctors`;

      const requestData = {
        search: "",
      };

      const response = await axios({
        method: "post",
        url: endpoint,
        headers: token ? { Authorization: token } : {},
        data: requestData,
      });

      const doctorsData = response.data?.Data?.docs || [];

      setdoclist(Array.isArray(doctorsData) ? doctorsData : []);

      // =====================================================
      // Extract Hospitals from all doctors
      // New API structure:
      //
      // hospitals: [
      //   {
      //      hospitalid,
      //      hospitalname,
      //      branches: [
      //        {
      //          branchid,
      //          branchname,
      //          city,
      //          state,
      //          pincode,
      //          landmark,
      //          locationurl
      //        }
      //      ]
      //   }
      // ]
      // =====================================================

      const hospitalMap = new Map();

      doctorsData.forEach((doctor) => {
        const hospitals = Array.isArray(doctor?.hospitals)
          ? doctor.hospitals
          : [];

        hospitals.forEach((hospital) => {
          // New API hospital structure
          if (hospital?.hospitalid) {
            const hospitalId = hospital.hospitalid;

            if (!hospitalMap.has(hospitalId)) {
              hospitalMap.set(hospitalId, {
                ...hospital,
                doctors: [doctor],
              });
            } else {
              const existingHospital = hospitalMap.get(hospitalId);

              // Avoid duplicate doctors
              const doctorAlreadyExists = existingHospital.doctors?.some(
                (d) => d?._id === doctor?._id
              );

              if (!doctorAlreadyExists) {
                existingHospital.doctors = [
                  ...(existingHospital.doctors || []),
                  doctor,
                ];
              }
            }
          }

          // =================================================
          // Optional backward compatibility
          // Old API structure:
          // {
          //    name,
          //    address
          // }
          // =================================================
          else if (hospital?.name) {
            const hospitalKey = hospital.name.toLowerCase().trim();

            if (!hospitalMap.has(hospitalKey)) {
              hospitalMap.set(hospitalKey, {
                ...hospital,
                hospitalid: hospital?._id || "",
                hospitalname: hospital.name,
                branches: [],
                doctors: [doctor],
              });
            } else {
              const existingHospital = hospitalMap.get(hospitalKey);

              const doctorAlreadyExists = existingHospital.doctors?.some(
                (d) => d?._id === doctor?._id
              );

              if (!doctorAlreadyExists) {
                existingHospital.doctors = [
                  ...(existingHospital.doctors || []),
                  doctor,
                ];
              }
            }
          }
        });
      });

      const uniqueHospitals = Array.from(hospitalMap.values());

      setHospitalAllList(uniqueHospitals);
      setHospitalList(uniqueHospitals);
    } catch (error) {
      console.error("Error fetching doctors list:", error);

      setdoclist([]);
      setHospitalAllList([]);
      setHospitalList([]);
    } finally {
      setloading(false);
    }
  };

  // =========================================================
  // Show All Hospitals
  // =========================================================
  const showAllHospitals = () => {
    setHospitalList([...hospitalAllList]);
    console.log(hospitalAllList);
    if (searchRef.current) {
      searchRef.current.resetFilters();
    }
  };

  // =========================================================
  // Hospital Search
  // =========================================================
  const handleHospitalSearch = (searchValue) => {
    const search = (searchValue || "").toLowerCase().trim();

    if (!search) {
      setHospitalList([...hospitalAllList]);
      return;
    }

    const filtered = hospitalAllList.filter((hospital) => {
      const hospitalName = (
        hospital?.hospitalname ||
        hospital?.name ||
        ""
      ).toLowerCase();

      const branchMatch = Array.isArray(hospital?.branches)
        ? hospital.branches.some((branch) => {
          const branchName = (
            branch?.branchname ||
            ""
          ).toLowerCase();

          const city = (branch?.city || "").toLowerCase();
          const state = (branch?.state || "").toLowerCase();
          const landmark = (branch?.landmark || "").toLowerCase();

          return (
            branchName.includes(search) ||
            city.includes(search) ||
            state.includes(search) ||
            landmark.includes(search)
          );
        })
        : false;

      return hospitalName.includes(search) || branchMatch;
    });

    setHospitalList(filtered);
  };

  return (
    <>
      {/* Header */}
      <NavBar />

      <section
        className="py-5"
        style={{
          backgroundColor: "#f8fbfd",
          minHeight: "250px",
        }}
      >
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} className="text-center">
              <h1 className="fw-bold">
                Find Perfect Hospital
              </h1>

              <p className="text-muted">
                Find the right hospital and branch for your treatment
              </p>
            </Col>

            {/* Search Box */}
            <Col xs={12}>
              <div style={{ marginTop: "-5px" }}>
                <HospitalSearch
                  ref={searchRef}
                  hospitals={hospitalAllList}
                  onSearch={handleHospitalSearch}
                />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Hospital List Section */}
      <section className="py-5">
        <Container>
          <Row>
            <Col xs={12} className="pb-3">
              <Button
                onClick={showAllHospitals}
                variant="outline-primary"
                className="rounded-pill"
              >
                Show All Hospitals
              </Button>
            </Col>
          </Row>

          <Row>
            {loading ? (
              <Col className="text-center">
                <p className="text-muted">Loading hospitals...</p>
              </Col>
            ) : hospitalList.length <= 0 ? (
              <Col className="text-center">
                <p className="text-muted">
                  No Hospital Found...
                </p>
              </Col>
            ) : (
              hospitalList.map((hospital, index) => {
                const hospitalName =
                  hospital?.hospitalname ||
                  hospital?.name ||
                  "Hospital";

                const branches = Array.isArray(hospital?.branches)
                  ? hospital.branches
                  : [];

                return (
                  <Col
                    className="p-2"
                    xs={12}
                    md={6}
                    lg={4}
                    key={
                      hospital?.hospitalid ||
                      hospital?._id ||
                      `${hospitalName}-${index}`
                    }
                  >
                    <div
                      className="card main-card-box d-flex flex-column justify-content-between p-3 h-100"
                      style={{
                        borderRadius: "12px",
                      }}
                    >
                      {/* Hospital Header */}
                      <div className="py-2">
                        <div className="d-flex align-items-center mb-3">
                          {/* Hospital Logo */}
                          <div className="hospital_icon me-3">
                            {hospital?.logo ? (
                              <img
                                src={hospital.logo}
                                alt={hospitalName}
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  objectFit: "contain",
                                  borderRadius: "8px",
                                }}
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <svg
                                width="38"
                                height="36"
                                viewBox="0 0 39 36"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M7.68117 6.94664H0.390625C0.287088 6.94685 0.187851 6.98807 0.114639 7.06128C0.0414278 7.13449 0.000206455 7.23373 0 7.33727V8.77633C0 8.99148 0.175391 9.16695 0.390625 9.16695H1.61055V33.3476H0.390625C0.287088 33.3478 0.187851 33.389 0.114639 33.4622C0.0414278 33.5354 0.000206455 33.6347 0 33.7382V35.5469C0 35.762 0.175469 35.9375 0.390625 35.9375H38.0469C38.262 35.9375 38.4375 35.762 38.4375 35.5469V33.7381C38.4375 33.523 38.262 33.3475 38.0469 33.3475H36.827V10.7294H30.7563V33.3476H29.1938V3.78273H9.24367V33.3476H7.68117V9.16687V6.94664ZM20.411 22.5403H24.3795C24.5946 22.5403 24.7701 22.7158 24.7701 22.9309V33.3476H20.4111V22.5403H20.411ZM18.8484 33.3476H14.4895V22.9309C14.4895 22.7159 14.6649 22.5403 14.8801 22.5403H18.8484V33.3476ZM8.40742 0H30.0302C30.2453 0 30.4208 0.175469 30.4208 0.390625V1.82969C30.4208 2.04484 30.2453 2.22031 30.0302 2.22031H8.40742C8.30388 2.22011 8.20465 2.17888 8.13144 2.10567C8.05822 2.03246 8.017 1.93322 8.0168 1.82969V0.390625C8.0168 0.175469 8.19227 0 8.40742 0ZM20.7782 6.13273C20.9933 6.13273 21.1688 6.3082 21.1688 6.52336V9.06555H23.711C23.9262 9.06555 24.1016 9.24102 24.1016 9.45617V12.575C24.1016 12.7902 23.9262 12.9656 23.711 12.9656H21.1688V15.5078C21.1688 15.723 20.9934 15.8984 20.7782 15.8984H17.6594C17.5558 15.8982 17.4566 15.857 17.3834 15.7838C17.3102 15.7106 17.269 15.6113 17.2687 15.5078V12.9656H14.7266C14.623 12.9654 14.5238 12.9242 14.4506 12.851C14.3774 12.7778 14.3361 12.6785 14.3359 12.575V9.45617C14.3359 9.24102 14.5114 9.06555 14.7266 9.06555H17.2687V6.52336C17.2687 6.30828 17.4442 6.13273 17.6594 6.13273H20.7782ZM30.7563 9.16687V6.94664H38.0469C38.262 6.94664 38.4375 7.12211 38.4375 7.33727V8.77633C38.4375 8.99148 38.262 9.16695 38.0469 9.16695H30.7563V9.16687Z"
                                  fill="#00233D"
                                />
                              </svg>
                            )}
                          </div>

                          {/* Hospital Name */}
                          <div>
                            <h2 className="title-hospital mb-0">
                              <Link to={`/hospitalprofile/${encodeURIComponent(btoa(hospital.hospitalid))}`}> {hospitalName} </Link>
                            </h2>

                            {branches.length > 0 && (
                              <div className="text-muted small mt-1">
                                {branches.length}{" "}
                                {branches.length === 1
                                  ? "Branch"
                                  : "Branches"}
                              </div>
                            )}
                          </div>
                        </div>

                        <hr className="border-x" />

                        {/* =================================================
                            Branch List
                           ================================================= */}
                        {branches.length > 0 ? (
                          <div className="mt-3">

                            <div
                              style={{
                                maxHeight: "220px",
                                overflowY: "auto",
                              }}
                            >
                              {branches.slice(0, 5).map((branch, branchIndex) => (
                                <div
                                  key={
                                    branch?.branchid ||
                                    `${hospital?.hospitalid}-branch-${branchIndex}`
                                  }
                                  className="border rounded-3 p-2 mb-2"
                                  style={{
                                    backgroundColor: "#f8fafc",
                                  }}
                                >
                                  <div className="d-flex align-items-start">
                                    <TbMapPin
                                      size={20}
                                      className="text-primary me-2 mt-1"
                                    />

                                    <div className="flex-grow-1">
                                      <div className="fw-bold">
                                        {branch?.branchname ||
                                          "Branch"}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-muted small py-2">
                            No branches available
                          </div>
                        )}
                      </div>
                    </div>
                  </Col>
                );
              })
            )}
          </Row>
        </Container>
      </section>

      <FooterBar />

      {loading ? <Loader /> : ""}
    </>
  );
};

export default HospitalList;