import React, { useEffect, useState } from "react";
import CryptoJS from "crypto-js";
import { useNavigate } from "react-router-dom";
import {
    Container,
    Row,
    Col,
    Button,
    Modal,
    Form,
} from "react-bootstrap";
import axios from "axios";
import HospitalSidebar from "./HospitalSidebar";
import SmartDataTable from "../components/SmartDataTable";
import { API_BASE_URL, STORAGE_KEYS, } from "../config";
import Select from 'react-select';
import { FiChevronsRight, FiX } from "react-icons/fi";
import Swal from "sweetalert2";
import { MdDeleteOutline, MdOutlineEditCalendar, MdOutlineRemoveRedEye } from "react-icons/md";
const SECRET_KEY = "health-emi";

const HospitalSurgery = () => {

    const navigate = useNavigate();
    const [hospital, setHospital] = useState(null);
    const [token, setToken] = useState("");
    const [loading, setLoading] = useState(false);
    const [surgeries, setSurgeries] = useState([]);
    const [doctorList, setDoctorList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [surgeryTypes, setSurgeryTypes] = useState([]);
    const experienceOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "20+", "30+", "40+", "60+", "100+"];
    const completedSurgeryOptions = ["10+", "50+", "100+", "500+", "1000+", "5000+", "10000+"];
    const [inclusiveList, setInclusiveList] = useState([]);
    const [exclusiveList, setExclusiveList] = useState([]);
    const [inclusiveInput, setInclusiveInput] = useState("");
    const [exclusiveInput, setExclusiveInput] = useState("");

    const [showViewModal, setShowViewModal] = useState(false);
    const [viewData, setViewData] = useState(null);

    const [formData, setFormData] = useState({
        groupId: "",
        surgery_photo: "",
        name: "",
        surgerytypeid: "",
        inclusive: "",
        exclusive: "",
        yearsof_experience: "",
        completed_surgery: "",
        features: "",
        days: "",
        additional_features: "",
        description: "",
        price: "",
        general_price: "",
        semiprivate_price: "",
        private_price: "",
        delux_price: "",
        categoryname: "",
        doctorids: [],
    });

    useEffect(() => {
        const getLocalData = localStorage.getItem(STORAGE_KEYS.HOSPITAL);
        if (!getLocalData) {
            navigate("/hospital");
            return;
        }
        const bytes = CryptoJS.AES.decrypt(
            getLocalData,
            SECRET_KEY
        );
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        const data = JSON.parse(decrypted);
        if (!data) {
            navigate("/hospital");
            return;
        }
        setHospital(data.hospitalData);
        const authToken = `Bearer ${data.accessToken}`;
        setToken(authToken);
    }, []);

    useEffect(() => {
        if (!token) return;
        getDoctorList();
        getSurgeries();
        getSurgeryTypes();
    }, [token]);

    const getDoctorList = async () => {
        try {
            const response = await axios.post(`${API_BASE_URL}/hospital/doctors/list`,
                {
                    search: "",
                },
                {
                    headers: {
                        Authorization: token,
                    },
                }
            );
            setDoctorList(response.data.Data || []);
        }
        catch (err) {
            console.log(err);
        }
    };

    const getSurgeries = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/hospital/surgeries/list`,
                {
                    search: "",
                },
                {
                    headers: {
                        Authorization: token,
                    },
                }
            );
            setSurgeries(response.data.Data || []);
        }
        catch (err) {
            console.log(err);
        }
        finally {
            setLoading(false);
        }
    };

    const getSurgeryTypes = async () => {
        try {
            const response = await axios.post(`${API_BASE_URL}/hospital/surgerytypes`,
                {
                    search: ""
                },
                {
                    headers: {
                        Authorization: token
                    }
                }
            );
            setSurgeryTypes(response.data?.Data || []);
        }
        catch (err) {
            console.log(err);
        }
    };

    const addInclusive = () => {
        if (!inclusiveInput.trim()) return;
        setInclusiveList([...inclusiveList, inclusiveInput]);
        setInclusiveInput("");
    };

    const addExclusive = () => {
        if (!exclusiveInput.trim()) return;
        setExclusiveList([...exclusiveList, exclusiveInput]);
        setExclusiveInput("");
    };

    const removeInclusive = (index) => {
        setInclusiveList(inclusiveList.filter((_, i) => i !== index));
    };

    const removeExclusive = (index) => {
        setExclusiveList(exclusiveList.filter((_, i) => i !== index));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleImageChange = (e) => {
        if (e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const surgeryTypeOptions = surgeryTypes.map((item) => ({
        value: item._id,
        label: item.surgerytypename
    }));

    const selectedSurgeryType =
        surgeryTypeOptions.find(
            option =>
                option.value === formData.surgerytypeid
        ) || null;

    const handleSurgeryTypeChange = (selectedOption) => {
        setFormData((prev) => ({
            ...prev, surgerytypeid: selectedOption ? selectedOption.value : ""
        }));
    };
    const doctorOptions = doctorList.map((doctor) => ({
        value: doctor._id,
        label: doctor.name,
    }));
    const selectedDoctors = doctorOptions.filter((option) =>
        formData.doctorids.includes(option.value)
    );

    const handleDoctorChange = (selectedOptions) => {
        setFormData((prev) => ({
            ...prev,
            doctorids: selectedOptions
                ? selectedOptions.map((item) => item.value)
                : [],
        }));
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            alert("Enter Surgery Name");
            return false;
        }
        if (!formData.surgerytypeid) {
            alert("Select Surgery Type");
            return false;
        }
        if (!formData.yearsof_experience.trim()) {
            alert("Enter Experience");
            return false;
        }
        if (!formData.completed_surgery.trim()) {
            alert("Enter Completed Surgery");
            return false;
        }
        if (formData.doctorids.length === 0) {
            alert("Select Doctor");
            return false;
        }
        return true;
    };

    const openModal = () => {
        setSelectedFile(null);
        setFormData({
            groupId: "",
            surgery_photo: "",
            name: "",
            surgerytypeid: "",
            inclusive: "",
            exclusive: "",
            yearsof_experience: "",
            completed_surgery: "",
            features: "",
            days: "",
            additional_features: "",
            description: "",
            price: "",
            general_price: "",
            semiprivate_price: "",
            private_price: "",
            delux_price: "",
            categoryname: "",
            doctorids: []
        });
        setShowModal(true);
    };

    const uploadFile = async () => {
        if (!selectedFile) return "";
        const formData = new FormData();
        formData.append("file", selectedFile);
        try {
            const response = await axios.post(`${API_BASE_URL}/user/upload`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );
            return response.data?.Data?.url || "";
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    };

    const saveSurgery = async () => {
        if (!validateForm()) return;
        setSaving(true);
        Swal.fire({
            title: "Saving...",
            text: "Please wait while saving surgery details.",
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        try {
            let imageUrl = formData.surgery_photo;
            if (selectedFile) {
                imageUrl = await uploadFile();
            }
            const payload = {
                groupId: formData.groupId,
                surgery_photo: imageUrl,
                name: formData.name,
                surgerytypeid: formData.surgerytypeid,
                inclusive: inclusiveList.join(", "),
                exclusive: exclusiveList.join(", "),
                yearsof_experience: formData.yearsof_experience,
                completed_surgery: formData.completed_surgery,
                features: formData.features,
                days: formData.days,
                additional_features: formData.additional_features,
                description: formData.description,
                price: Number(formData.price),
                general_price: Number(formData.general_price),
                semiprivate_price: Number(formData.semiprivate_price),
                private_price: Number(formData.private_price),
                delux_price: Number(formData.delux_price),
                categoryname: formData.categoryname,
                doctorids: formData.doctorids
            };
            const response = await axios.post(
                `${API_BASE_URL}/hospital/surgeries/save`,
                payload,
                {
                    headers: {
                        Authorization: token
                    }
                }
            );
            Swal.close();
            if (response.data.Status) {
                Swal.fire({
                    icon: "success",
                    title: formData.groupId
                        ? "Surgery Updated Successfully"
                        : "Surgery Added Successfully",
                    text: "Surgery details saved successfully.",
                    timer: 2000,
                    showConfirmButton: false,
                });
                setShowModal(false);
                setSelectedFile(null);
                getSurgeries();
            }
            else {
                Swal.fire({
                    icon: "error",
                    title: "Failed",
                    text: response.data?.Message || "Something went wrong",
                });
            }
        }
        catch (error) {
            Swal.close();
            Swal.fire({
                icon: "error",
                title: "Failed",
                text: error.response?.data?.Message || "Something went wrong",
            });
        }
        finally {
            setSaving(false);
        }
    };

    const editSurgery = async (id) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/hospital/surgeries/getone`,
                {
                    groupId: id
                },
                {
                    headers: {
                        Authorization: token
                    }
                }
            );
            const data = response.data?.Data;
            if (!data) return;
            setInclusiveList(data.inclusive ? data.inclusive.split(",").map(x => x.trim()) : []);
            setExclusiveList(data.exclusive ? data.exclusive.split(",").map(x => x.trim()) : []);
            setFormData({
                groupId: data._id || "",
                surgery_photo: data.surgery_photo || "",
                name: data.name || "",
                surgerytypeid: data.surgerytypeid || "",
                inclusive: inclusiveList,
                exclusive: exclusiveList,
                yearsof_experience: data.yearsof_experience || "",
                completed_surgery: data.completed_surgery || "",
                features: data.features || "",
                days: data.days || "",
                additional_features: data.additional_features || "",
                description: data.description || "",
                price: data.price || "",
                general_price: data.general_price || "",
                semiprivate_price: data.semiprivate_price || "",
                private_price: data.private_price || "",
                delux_price: data.delux_price || "",
                categoryname: data.categoryname || "",
                doctorids: data.doctorids || []
            });
            setSelectedFile(null);
            setShowModal(true);
        }
        catch (err) {
            console.log(err);
            alert("Unable to load surgery.");
        }
    };

    const deleteSurgery = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You want to delete this surgery?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!"
        });
        if (!result.isConfirmed) return;
        try {
            const response = await axios.post(`${API_BASE_URL}/hospital/surgeries/remove`,
                {
                    groupId: id
                },
                {
                    headers: {
                        Authorization: token
                    }
                }
            );
            if (response.data?.Status) {
                Swal.fire({
                    icon: "success",
                    title: "Deleted!",
                    text: "Surgery deleted successfully.",
                    timer: 2000,
                    showConfirmButton: false
                });
                getSurgeries();
            }
        }
        catch (err) {
            Swal.fire({
                icon: "error",
                title: "Delete Failed",
                text: "Unable to delete surgery."
            });
        }
    };

    const viewSurgery = (row) => {
        setViewData(row);
        setShowViewModal(true);
    };

    const columns = [
        {
            name: "Name",
            selector: row => row.name,
            sortable: true,
        },
        {
            name: "Experience",
            selector: row => row.yearsof_experience,
        },
        {
            name: "Completed",
            selector: row => row.completed_surgery,
        },
        {
            name: "Days",
            selector: row => row.days,
        },
        {
            name: "General Price",
            selector: row => row.general_price,
        },
        {
            name: "Category",
            selector: row => row.categoryname,
        },
        {
            name: "Doctors",
            cell: row => row.doctorids?.length || 0,
        },
        {
            name: "Action",
            cell: row => (
                <div className="d-flex align-items-center gap-1">
                    <button
                        className="btn btn-sm p-1 apt_status_btn dark"
                        onClick={() => viewSurgery(row)}
                    >
                        <MdOutlineRemoveRedEye size={18} />
                    </button>
                    <Button
                        className="btn btn-sm p-1 apt_status_btn success"
                        onClick={() => editSurgery(row._id)}>
                        <MdOutlineEditCalendar size={18} />
                    </Button>

                    <Button
                        size="sm"
                        className="btn btn-sm p-1 apt_status_btn danger"
                        onClick={() => deleteSurgery(row._id)}>
                        <MdDeleteOutline size={18} />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <Container>
            <Row className="g-0">
                <HospitalSidebar hospital={hospital} />
                <Col xs={12} sm={9} className="p-3 mt-3">
                    <div className="appointments-card">
                        <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-3">
                            <h4>Hospital Surgeries</h4>
                            <Button
                                className="apt_accept_btn"
                                onClick={openModal}
                            >
                                + Add Surgery
                            </Button>
                        </div>
                        <SmartDataTable
                            columns={columns}
                            data={surgeries}
                            pagination
                            striped
                            responsive
                            highlightOnHover
                            progressPending={loading}
                        />
                    </div>
                    {/* Modal will come in Part-2 */}
                </Col>
            </Row>
            {/* Add Surgery model */}
            <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                size="xl"
                backdrop="static"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        {formData.groupId ? "Update Surgery" : "Add Surgery"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        {/* Surgery Photo */}
                        <Col md={3} xs={4} className="mb-3">
                            <Form.Label>Surgery Photo</Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                            {formData.surgery_photo && (
                                <div className="mt-2">
                                    <img
                                        src={formData.surgery_photo}
                                        alt=""
                                        width={140}
                                        className="rounded border"
                                    />
                                </div>
                            )}
                        </Col>
                        {/* Surgery Name */}
                        <Col md={3} xs={4} className="mb-3">
                            <Form.Label>Surgery Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </Col>
                        {/* Surgery Type */}
                        <Col md={3} xs={4} className="mb-3">
                            <Form.Label>Surgery Type</Form.Label>
                            <Select
                                options={surgeryTypeOptions}
                                value={selectedSurgeryType}
                                onChange={handleSurgeryTypeChange}
                                placeholder="Select Surgery Type"
                                isClearable
                            />
                        </Col>
                        {/* Doctors */}
                        <Col md={3} xs={4} className="mb-3">
                            <Form.Label>Select Doctors</Form.Label>
                            <Select
                                isMulti
                                options={doctorOptions}
                                value={selectedDoctors}
                                onChange={handleDoctorChange}
                                placeholder="Select Doctors"
                                closeMenuOnSelect={false}
                                isClearable
                            />
                        </Col>
                        {/* Category */}
                        <Col md={3} xs={4} className="mb-3">
                            <Form.Label>Category Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="categoryname"
                                value={formData.categoryname}
                                onChange={handleChange}
                            />
                        </Col>
                        {/* Experience */}
                        <Col md={3} xs={4} className="mb-3">
                            <Form.Label>Years of Experience</Form.Label>
                            <Form.Select
                                name="yearsof_experience"
                                value={formData.yearsof_experience}
                                onChange={handleChange}>
                                <option value="">
                                    Select Experience
                                </option>
                                {experienceOptions.map((item) => (
                                    <option key={item} value={item}>
                                        {item} Years
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>
                        {/* Completed */}
                        <Col md={3} xs={4} className="mb-3">
                            <Form.Label>Completed Surgery</Form.Label>
                            <Form.Select
                                name="completed_surgery"
                                value={formData.completed_surgery}
                                onChange={handleChange}>
                                <option value="">
                                    Select Completed Surgery
                                </option>
                                {completedSurgeryOptions.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>
                        {/* Days */}
                        <Col md={3} xs={4} className="mb-3">
                            <Form.Label>Hospital Stay (Days)</Form.Label>
                            <Form.Control
                                type="number"
                                name="days"
                                value={formData.days}
                                onChange={handleChange}
                            />
                        </Col>
                        {/* Features */}
                        <Col md={6} xs={12} className="mb-3">
                            <Form.Label>Features</Form.Label>
                            <Form.Control
                                type="text"
                                name="features"
                                value={formData.features}
                                onChange={handleChange}
                            />
                        </Col>
                        {/* Additional Features */}
                        <Col md={6} xs={12} className="mb-3">
                            <Form.Label>Additional Features</Form.Label>
                            <Form.Control
                                type="text"
                                name="additional_features"
                                value={formData.additional_features}
                                onChange={handleChange}
                            />
                        </Col>
                        {/* General */}
                        <Col md={3} className="mb-3">
                            <Form.Label>General Price</Form.Label>
                            <Form.Control
                                type="number"
                                name="general_price"
                                value={formData.general_price}
                                onChange={handleChange}
                            />
                        </Col>
                        {/* Semi */}
                        <Col md={3} className="mb-3">
                            <Form.Label>Semi Private Price</Form.Label>
                            <Form.Control
                                type="number"
                                name="semiprivate_price"
                                value={formData.semiprivate_price}
                                onChange={handleChange}
                            />
                        </Col>
                        {/* Private */}
                        <Col md={3} className="mb-3">
                            <Form.Label>Private Price</Form.Label>
                            <Form.Control
                                type="number"
                                name="private_price"
                                value={formData.private_price}
                                onChange={handleChange}
                            />
                        </Col>
                        {/* Deluxe */}
                        <Col md={3} className="mb-3">
                            <Form.Label>Deluxe Price</Form.Label>
                            <Form.Control
                                type="number"
                                name="delux_price"
                                value={formData.delux_price}
                                onChange={handleChange}
                            />
                        </Col>
                        {/* Inclusive */}
                        <Col md={6} xs={12} className="mb-3">
                            <Form.Label>
                                Inclusive
                            </Form.Label>
                            <div className="d-flex gap-2">
                                <Form.Control
                                    value={inclusiveInput}
                                    onChange={(e) => setInclusiveInput(e.target.value)}
                                    placeholder="Add inclusive point"
                                />
                                <Button onClick={addInclusive}>Add</Button>
                            </div>
                            <ul className="list-group mt-3" style={{ fontSize: "0.95rem" }}>
                                {
                                    inclusiveList.map((item, index) => (
                                        <li key={index} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-2">
                                            <span>
                                                <FiChevronsRight className="me-2 text-success" />
                                                {item}
                                            </span>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                className="rounded-circle"
                                                onClick={() => removeInclusive(index)}
                                                style={{
                                                    width: "28px",
                                                    height: "28px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}>
                                                <FiX className="text-white" />
                                            </Button>
                                        </li>
                                    ))
                                }
                            </ul>
                        </Col>
                        {/* Exclusive */}
                        <Col md={6} xs={12} className="mb-3">
                            <Form.Label>
                                Exclusive
                            </Form.Label>
                            <div className="d-flex gap-2">
                                <Form.Control
                                    value={exclusiveInput}
                                    onChange={(e) => setExclusiveInput(e.target.value)}
                                    placeholder="Add exclusive point"
                                />
                                <Button onClick={addExclusive} >Add</Button>
                            </div>
                            <ul className="list-group mt-3" style={{ fontSize: "0.95rem" }}>
                                {
                                    exclusiveList.map((item, index) => (
                                        <li key={index} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-2">
                                            <span>
                                                <FiChevronsRight className="me-2 text-success" />
                                                {item}
                                            </span>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                className="rounded-circle"
                                                onClick={() => removeExclusive(index)}
                                                style={{
                                                    width: "28px",
                                                    height: "28px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}>
                                                <FiX className="text-white" />
                                            </Button>
                                        </li>
                                    ))
                                }
                            </ul>
                        </Col>
                        {/* Description */}
                        <Col md={12} className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={5}
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowModal(false)}
                    >
                        Close
                    </Button>
                    <Button
                        className="apt_accept_btn"
                        disabled={saving}
                        onClick={saveSurgery}
                    >
                        {
                            saving ? "Saving..." : formData.groupId ? "Update Surgery" : "Save Surgery"
                        }
                    </Button>
                </Modal.Footer>
            </Modal>
            {/* View Surgery Model */}
            <Modal
                show={showViewModal}
                onHide={() => setShowViewModal(false)}
                size="xl"
                centered
                backdrop="static"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        Surgery Details
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-light">
                    {viewData &&
                        <>
                            <Row className="mb-3">
                                <Col md={4}>
                                    <div className="card shadow-sm border-0 h-100">
                                        <div className="card-body text-center">
                                            {viewData.surgery_photo ?
                                                <img
                                                    src={viewData.surgery_photo}
                                                    alt=""
                                                    className="rounded-circle shadow mb-3"
                                                    style={{
                                                        width: "150px",
                                                        height: "150px",
                                                        objectFit: "cover"
                                                    }} />
                                                :
                                                <div
                                                    className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center mx-auto mb-3"
                                                    style={{
                                                        width: "150px",
                                                        height: "150px"
                                                    }}>
                                                    No Image
                                                </div>
                                            }
                                            <h5 className="fw-bold">
                                                {viewData.name}
                                            </h5>
                                            <span className="badge bg-success">
                                                {viewData.categoryname || "General"}
                                            </span>
                                        </div>
                                    </div>
                                </Col>
                                <Col md={8}>
                                    <div className="card shadow-sm border-0 mb-3">
                                        <div className="card-header bg-white">
                                            <h6 className="mb-0 fw-bold">
                                                Basic Information
                                            </h6>
                                        </div>
                                        <div className="card-body">
                                            <Row>
                                                <Col md={6} className="mb-3">
                                                    <small className="text-muted">
                                                        Surgery Type
                                                    </small>
                                                    <h6>
                                                        {viewData.surgerytypename || "-"}
                                                    </h6>
                                                </Col>
                                                <Col md={6} className="mb-3">
                                                    <small className="text-muted">
                                                        Experience
                                                    </small>
                                                    <h6>
                                                        {viewData.yearsof_experience} Years
                                                    </h6>
                                                </Col>
                                                <Col md={6}>
                                                    <small className="text-muted">
                                                        Completed Surgery
                                                    </small>
                                                    <h6>
                                                        {viewData.completed_surgery}
                                                    </h6>
                                                </Col>
                                                <Col md={6}>
                                                    <small className="text-muted">
                                                        Hospital Stay
                                                    </small>
                                                    <h6>
                                                        {viewData.days} Days
                                                    </h6>
                                                </Col>
                                            </Row>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6}>
                                    <div className="card shadow-sm border-0 mb-3">
                                        <div className="card-header bg-white">
                                            <h6 className="fw-bold mb-0">
                                                Features
                                            </h6>
                                        </div>
                                        <div className="card-body">
                                            <p>
                                                {viewData.features || "-"}
                                            </p>
                                            <p>
                                                {viewData.additional_features || "-"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="card shadow-sm border-0 mb-3">
                                        <div className="card-header bg-white">
                                            <h6 className="fw-bold mb-0">
                                                Additional Features
                                            </h6>
                                        </div>
                                        <div className="card-body">
                                            <p>
                                                {viewData.additional_features || "-"}
                                            </p>
                                        </div>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="card shadow-sm border-0 mb-3">
                                        <div className="card-header bg-white">
                                            <h6 className="fw-bold mb-0">
                                                Pricing
                                            </h6>
                                        </div>
                                        <div className="card-body">
                                            <Row>
                                                <Col xs={6}>
                                                    <div className="price-box">
                                                        General
                                                        <br />
                                                        <b>
                                                            ₹ {viewData.general_price}
                                                        </b>
                                                    </div>
                                                </Col>
                                                <Col xs={6}>
                                                    <div className="price-box">
                                                        Semi Private
                                                        <br />
                                                        <b>
                                                            ₹ {viewData.semiprivate_price}
                                                        </b>
                                                    </div>
                                                </Col>
                                                <Col xs={6} className="mt-3">
                                                    <div className="price-box">
                                                        Private
                                                        <br />
                                                        <b>
                                                            ₹ {viewData.private_price}
                                                        </b>
                                                    </div>
                                                </Col>
                                                <Col xs={6} className="mt-3">
                                                    <div className="price-box">
                                                        Deluxe
                                                        <br />
                                                        <b>
                                                            ₹ {viewData.delux_price}
                                                        </b>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6}>
                                    <div className="card shadow-sm border-0 mb-3">
                                        <div className="card-header bg-success">
                                            <h6 className="mb-0 text-white">
                                                Included
                                            </h6>
                                        </div>
                                        <div className="card-body">
                                            <ul className="mb-0">
                                                {viewData.inclusive
                                                    ?.split(",")
                                                    .map((item, index) => (

                                                        <li key={index}>
                                                            {item}
                                                        </li>

                                                    ))
                                                }
                                            </ul>
                                        </div>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="card shadow-sm border-0 mb-3">
                                        <div className="card-header bg-danger">
                                            <h6 className="mb-0 text-white">
                                                Excluded
                                            </h6>
                                        </div>
                                        <div className="card-body">
                                            <ul className="mb-0">
                                                {viewData.exclusive
                                                    ?.split(",")
                                                    .map((item, index) => (
                                                        <li key={index}>
                                                            {item}
                                                        </li>
                                                    ))
                                                }
                                            </ul>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                            <div className="card shadow-sm border-0">
                                <div className="card-header bg-white">
                                    <h6 className="fw-bold mb-0">
                                        Description
                                    </h6>
                                </div>
                                <div className="card-body">
                                    <p className="mb-0">
                                        {viewData.description}
                                    </p>
                                </div>
                            </div>
                        </>
                    }
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowViewModal(false)}
                    >
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default HospitalSurgery;