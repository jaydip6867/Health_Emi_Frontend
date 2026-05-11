import React, { useEffect, useRef, useState } from "react";
import NavBar from "./Component/NavBar";
import { Button, Col, Container, Row } from "react-bootstrap";
import Loader from "../Loader";
import FooterBar from "./Component/FooterBar";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import CryptoJS from "crypto-js";
import { useNavigate } from "react-router-dom";
import SearchBox from "./Component/SearchBox";
import { TbMapPin } from "react-icons/tb";
import { MdFilterListAlt } from "react-icons/md";
import DoctorListComponents from "./Component/DoctorListComponent";
import { API_BASE_URL, SECRET_KEY, STORAGE_KEYS } from "../config";
import { TbChevronRight } from "react-icons/tb";
import HospitalSearch from "./Component/HospitalSearch";

const HospitalList = () => {
  var navigate = useNavigate();
  const searchRef = useRef();
  const [patient, setpatient] = useState(null);
  const [token, settoken] = useState(null);
  const normalize = (str = "") => str.toLowerCase().trim().replace(/\s+/g, " ");

  useEffect(() => {
    var getlocaldata = localStorage.getItem(STORAGE_KEYS.PATIENT);
    if (getlocaldata != null) {
      const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      var data = JSON.parse(decrypted);
    }
    if (data) {
      setpatient(data.userData);
      settoken(`Bearer ${data.accessToken}`);
    }
  }, [navigate]);
  const [loading, setloading] = useState(false);
  const [doctor_list, setdoclist] = useState([]);
  const [hospitalAllList, setHospitalAllList] = useState([]);
  const [hospitalList, setHospitalList] = useState([]);

  // Filters state
  useEffect(() => {
    setloading(true);
    // Always call getdoctorlist, it will handle both cases
    getdoctorlist();
  }, []); // Add d_id to dependency array to refetch when it changes

  const getdoctorlist = async () => {
    try {
      const endpoint = `${API_BASE_URL}/user/doctors`; // When no ID, get all doctors

      const requestData = {
        search: "",
      };

      const response = await axios({
        method: "post",
        url: endpoint,
        headers: token ? { Authorization: token } : {},
        data: requestData,
      });

      const doctorsData = response.data.Data?.docs || [];
      setdoclist(Array.isArray(doctorsData) ? doctorsData : []);
      // const uniqueHospitals = [
      //   ...new Map(
      //     doctorsData
      //       .flatMap((d) => d.hospitals || [])
      //       .map((h) => [`${h.name}_${h.city}`, h])
      //   ).values(),
      // ];

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
      setHospitalAllList(uniqueHospitals);
      setHospitalList(uniqueHospitals);
    } catch (error) {
      // console.error('Error fetching doctors list:', error);
      setdoclist([]);
    } finally {
      setloading(false);
    }
  };

  const showAllHospitals = () => {
    setHospitalList([...hospitalAllList]);
    if (searchRef.current) {
      searchRef.current.resetFilters();
    }
  };

  return (
    <>
      <NavBar logindata={patient} />
      {/* header bg */}
      <section className="spacer-y bg_sec_search">
        <Container>
          <Row>
            <Col xs={12}>
              <h2 className="head_sec text-center">
                Find Perfect <span className="sky-blue">Hospital</span>{" "}
              </h2>
            </Col>
          </Row>
        </Container>
      </section>
      {/* search box */}
      <div style={{ marginTop: "-22px" }}>
        <HospitalSearch
          ref={searchRef}
          hospitalList={hospitalList}
          hospitalAllList={hospitalAllList}
          setHospitalList={setHospitalList}
        />
      </div>

      {/* doctor list section */}
      <section className="py-5">
        <Container>
          <Row>
            <Col xs={12} className="pb-2">
              <button
                onClick={showAllHospitals}
                className="btn btn-outline-primary rounded-pill "
              >
                show all hospitals
              </button>
            </Col>
          </Row>
          <Row>
            {doctor_list.length <= 0 ? (
              <Col>No Hospital Found...</Col>
            ) : (
              hospitalList.map((doc, i) => (
                <Col className="p-2" xs={12} md={6} lg={4} key={i}>
                  <div className="card main-card-box d-flex flex-column justify-content-between  p-3">
                    <div className="py-2">
                      <div className="d-flex align-items-center mb-2">
                        <div className="hospital_icon">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 39 36"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                              d="M7.68117 6.94664H0.390625C0.287088 6.94685 0.187851 6.98807 0.114639 7.06128C0.0414278 7.13449 0.000206455 7.23373 0 7.33727V8.77633C0 8.99148 0.175391 9.16695 0.390625 9.16695H1.61055V33.3476H0.390625C0.287088 33.3478 0.187851 33.389 0.114639 33.4622C0.0414278 33.5354 0.000206455 33.6347 0 33.7382V35.5469C0 35.762 0.175469 35.9375 0.390625 35.9375H38.0469C38.262 35.9375 38.4375 35.762 38.4375 35.5469V33.7381C38.4375 33.523 38.262 33.3475 38.0469 33.3475H36.827V10.7294H30.7563V33.3476H29.1938V3.78273H9.24367V33.3476H7.68117V9.16687V6.94664ZM20.411 22.5403H24.3795C24.5946 22.5403 24.7701 22.7158 24.7701 22.9309V33.3476H20.4111V22.5403H20.411ZM18.8484 33.3476H14.4895V22.9309C14.4895 22.7159 14.6649 22.5403 14.8801 22.5403H18.8484V33.3476ZM8.40742 0H30.0302C30.2453 0 30.4208 0.175469 30.4208 0.390625V1.82969C30.4208 2.04484 30.2453 2.22031 30.0302 2.22031H8.40742C8.30388 2.22011 8.20465 2.17888 8.13144 2.10567C8.05822 2.03246 8.017 1.93322 8.0168 1.82969V0.390625C8.0168 0.175469 8.19227 0 8.40742 0ZM20.7782 6.13273C20.9933 6.13273 21.1688 6.3082 21.1688 6.52336V9.06555H23.711C23.9262 9.06555 24.1016 9.24102 24.1016 9.45617V12.575C24.1016 12.7902 23.9262 12.9656 23.711 12.9656H21.1688V15.5078C21.1688 15.723 20.9934 15.8984 20.7782 15.8984H17.6594C17.5558 15.8982 17.4566 15.857 17.3834 15.7838C17.3102 15.7106 17.269 15.6113 17.2687 15.5078V12.9656H14.7266C14.623 12.9654 14.5238 12.9242 14.4506 12.851C14.3774 12.7778 14.3361 12.6785 14.3359 12.575V9.45617C14.3359 9.24102 14.5114 9.06555 14.7266 9.06555H17.2687V6.52336C17.2687 6.30828 17.4442 6.13273 17.6594 6.13273H20.7782ZM30.7563 9.16687V6.94664H38.0469C38.262 6.94664 38.4375 7.12211 38.4375 7.33727V8.77633C38.4375 8.99148 38.262 9.16695 38.0469 9.16695H30.7563V9.16687Z"
                              fill="#00233D"
                            />
                          </svg>
                        </div>
                        <div>
                          <h2 className="title-hospital mb-0">{doc.name}</h2>
                          <div className="d-flex align-items-center h-100">
                            <TbMapPin size={20} className="text-sub-title" />{" "}
                            <div className="ms-1 text-sub-title">
                              {doc.city} , {doc.state}
                            </div>
                          </div>
                        </div>
                      </div>
                      <hr className="border-x" />
                    </div>

                    <div className="d-flex justify-content-end h-100 ">
                      <Link
                        to={`/hospital-doctors/${doc.name}`}
                        className="text-primary see-all-doc"
                      >
                        See All Dooctors <TbChevronRight size={18} />
                      </Link>
                    </div>
                  </div>
                </Col>
              ))
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
