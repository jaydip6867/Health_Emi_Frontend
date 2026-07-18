import React, { useEffect, useState } from 'react'
import CryptoJS from "crypto-js";
import { useNavigate } from 'react-router-dom';
import { Button, Col, Container, Modal, Row, Form } from 'react-bootstrap';
import { API_BASE_URL, SECRET_KEY, STORAGE_KEYS } from '../config';
import HospitalSidebar from './HospitalSidebar';
import SmartDataTable from "../components/SmartDataTable";
import axios from 'axios';
import { FiX } from 'react-icons/fi';
import Loader from '../Loader';
import { MdDeleteOutline, MdOutlineEditCalendar, MdOutlineRemoveRedEye } from 'react-icons/md';
import Swal from 'sweetalert2';

const HospitalBranch = () => {

    const SECRET_KEY = "health-emi";
    var navigate = useNavigate();

    const [hospital, sethospital] = useState(null)
    const [loading, setloading] = useState(false)
    const [token, settoken] = useState(null)
    const [profileData, setProfileData] = useState({});
    const [branches, setBranches] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);

    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreview, setImagePreview] = useState([]);

    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState(null);

    const [branchForm, setBranchForm] = useState({
        branchname: "",
        summary: "",
        photos: [],
        locationurl: "",
        city: "",
        state: "",
        pincode: "",
        landmark: ""
    });

    useEffect(() => {
        var getlocaldata = localStorage.getItem(STORAGE_KEYS.HOSPITAL);
        if (getlocaldata != null) {
            const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            var data = JSON.parse(decrypted);
        }
        if (!data) {
            navigate('/hospital')
        }
        else {
            sethospital(data.hospitalData);
            const authToken = `Bearer ${data.accessToken}`;
            sethospital(data.hospitalData);
            settoken(authToken);

            getProfile(authToken);
        }

    }, [navigate])

    useEffect(() => {
        return () => {
            imagePreview.forEach(x => {
                if (!x.isOld) {
                    URL.revokeObjectURL(x.url);
                }
            });
        };
    }, [imagePreview]);

    const getProfile = async () => {
        setloading(true)
        try {
            const response = await axios.get(`${API_BASE_URL}/hospital/profile`,
                {
                    headers: {
                        Authorization: token
                    }
                }
            );
            const data = response.data?.Data || {};
            setProfileData(data);
            setBranches(data.branchdetails || []);
        }
        catch (err) {
            console.log(err);
        } finally {
            setloading(false);
        }
    }

    const openAddModal = () => {
        setEditingIndex(null);

        setBranchForm({
            branchname: "",
            summary: "",
            photos: [],
            locationurl: "",
            city: "",
            state: "",
            pincode: "",
            landmark: ""
        });

        setSelectedImages([]);
        setImagePreview([]);

        setShowModal(true);
    }

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        setSelectedImages(prev => [...prev, ...files]);
        setBranchForm(prev => ({
            ...prev,
            photos: [...prev.photos, ...files]
        }));
        const previews = files.map(file => ({
            url: URL.createObjectURL(file),
            isOld: false
        }));
        setImagePreview(prev => [...prev, ...previews]);
        e.target.value = "";
    };

    const uploadImages = async () => {
        try {
            return await Promise.all(
                selectedImages.map(file => uploadFile(file))
            );
        } catch (error) {
            throw error;
        }
    };

    const uploadFile = async (file) => {
        if (!file) return "";
        // Already uploaded image
        if (typeof file === "string") return file;
        const uploadPayload = new FormData();
        uploadPayload.append("file", file);
        try {
            const response = await axios.post(
                `${API_BASE_URL}/user/upload`,
                uploadPayload,
                {
                    headers: {
                        Authorization: token,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            if (
                response?.data?.Status === 200 &&
                response?.data?.Data?.url
            ) {
                return response.data.Data.url;
            }
            throw new Error(response?.data?.Message || "Upload Failed");
        } catch (err) {
            console.log(err);
            throw err;
        }
    };

    const saveBranch = async () => {
        Swal.fire({
            title: "Saving Branch...",
            text: "Please wait while branch details are being saved.",
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        try {
            let uploaded = [];
            if (selectedImages.length) {
                uploaded = await uploadImages();
            }
            const photos = [
                ...(branchForm.photos || []).filter(
                    item => typeof item === "string"
                ),
                ...uploaded
            ];
            const newBranch = {
                branchname: branchForm.branchname.trim(),
                summary: branchForm.summary.trim(),
                photos,
                locationurl: branchForm.locationurl.trim(),
                city: branchForm.city.trim(),
                state: branchForm.state.trim(),
                pincode: branchForm.pincode.trim(),
                landmark: branchForm.landmark.trim()
            };
            let updatedBranches = [...branches];
            if (editingIndex === null) {
                updatedBranches.push(newBranch);
            }
            else {
                updatedBranches[editingIndex] = newBranch;
            }
            const payload = {
                ...profileData,
                branchdetails: updatedBranches
            };
            const response = await axios.post(
                `${API_BASE_URL}/hospital/profile/edit`,
                payload,
                {
                    headers: {
                        Authorization: token
                    }
                }
            );
            Swal.close();
            if (response.data?.Status === 200 || response.data?.Status === true) {
                Swal.fire({
                    icon: "success",
                    title: editingIndex === null
                        ? "Branch Added Successfully"
                        : "Branch Updated Successfully",
                    text: "Hospital branch details saved successfully.",
                    timer: 2000,
                    showConfirmButton: false
                });
                setBranches(updatedBranches);
                setShowModal(false);
                setSelectedImages([]);
                setImagePreview([]);
            }
            else {
                Swal.fire({
                    icon: "error",
                    title: "Failed",
                    text:
                        response.data?.Message ||
                        "Unable to save branch."
                });
            }
        }
        catch (error) {
            Swal.close();
            console.log("Save Branch Error:", error);
            Swal.fire({
                icon: "error",
                title: "Something went wrong",
                text:
                    error.response?.data?.Message ||
                    error.message ||
                    "Branch save failed."
            });
        }
        finally {
            setloading(false);
        }
    };

    const editBranch = (row, index) => {
        setEditingIndex(index);
        setBranchForm({
            ...row,
            photos: [...(row.photos || [])]
        });
        setImagePreview(
            (row.photos || []).map(img => ({
                url: img,
                isOld: true
            }))
        );
        setSelectedImages([]);
        setShowModal(true);
    }

    const deleteBranch = async (index) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You want to delete this branch?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, Delete it!",
            cancelButtonText: "Cancel"
        });
        // User cancelled
        if (!result.isConfirmed) {
            return;
        }
        setloading(true);
        Swal.fire({
            title: "Deleting...",
            text: "Please wait while branch is being removed.",
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        try {
            let arr = [...branches];
            arr.splice(index, 1);
            const payload = {
                ...profileData,
                branchdetails: arr
            };
            const response = await axios.post(
                `${API_BASE_URL}/hospital/profile/edit`,
                payload,
                {
                    headers: {
                        Authorization: token
                    }
                }
            );
            Swal.close();
            if (
                response.data?.Status === 200 ||
                response.data?.Status === true
            ) {
                setBranches(arr);
                Swal.fire({
                    icon: "success",
                    title: "Deleted Successfully",
                    text: "Branch removed successfully.",
                    timer: 2000,
                    showConfirmButton: false
                });
            }
            else {
                Swal.fire({
                    icon: "error",
                    title: "Delete Failed",
                    text:
                        response.data?.Message ||
                        "Unable to delete branch."
                });
            }
        }
        catch (error) {
            Swal.close();
            console.log(error);
            Swal.fire({
                icon: "error",
                title: "Something went wrong",
                text:
                    error.response?.data?.Message ||
                    "Branch delete failed."
            });
        }
        finally {
            setloading(false);
        }
    };

    const removePreviewImage = (index) => {

        const removedItem = imagePreview[index];

        // Remove preview
        setImagePreview(prev => prev.filter((_, i) => i !== index));

        // Remove from branch photos
        setBranchForm(prev => ({
            ...prev,
            photos: prev.photos.filter((_, i) => i !== index)
        }));

        // Remove only newly selected files
        if (!removedItem.isOld) {
            const fileIndex = imagePreview
                .slice(0, index)
                .filter(item => !item.isOld)
                .length;

            setSelectedImages(prev => {
                const files = [...prev];
                files.splice(fileIndex, 1);
                return files;
            });
        }
    };

    const viewBranch = (branch) => {
        setSelectedBranch(branch);
        setShowViewModal(true);
    };

    const columns = [
        {
            name: "Photo",
            cell: (row) => (
                row.photos?.length ?
                    <img
                        src={row.photos[0]}
                        width={70}
                        height={50}
                        style={{
                            height: "50px",
                            objectFit: "cover",
                            borderRadius: 5
                        }}
                    />
                    : "-"
            )
        },
        {
            name: "Branch",
            selector: row => row.branchname
        },
        {
            name: "City",
            selector: row => row.city
        },
        {
            name: "State",
            selector: row => row.state
        },
        {
            name: "Pincode",
            selector: row => row.pincode
        },
        {
            name: "Action",
            cell: (row, index) => (
                <div className="d-flex align-items-center gap-1">
                    <Button
                        size="sm"
                        className="btn btn-sm p-1 apt_status_btn dark"
                        onClick={() => viewBranch(row)}
                    >
                        <MdOutlineRemoveRedEye size={18} />
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => editBranch(row, index)}
                        className='btn btn-sm p-1 apt_status_btn success'
                    >
                        <MdOutlineEditCalendar size={18} />
                    </Button>

                    <Button
                        size="sm"
                        onClick={() => deleteBranch(index)}
                        className="btn btn-sm p-1 apt_status_btn danger"
                    >
                        <MdDeleteOutline size={18} />
                    </Button>

                </div>
            )
        }
    ];

    return (
        <>
            <Container >
                <Row className='g-0'>
                    <HospitalSidebar hospital={hospital} />
                    <Col xs={12} sm={9} className='p-3 mt-3'>
                        <div className="appointments-card">
                            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-3">
                                <h4>Hospital Branch</h4>
                                <Button
                                    className="apt_accept_btn"
                                    onClick={openAddModal}
                                >
                                    Add Branch
                                </Button>
                            </div>
                        </div>
                        <SmartDataTable
                            columns={columns}
                            data={branches}
                            pagination
                            responsive
                            striped
                            highlightOnHover
                            progressPending={loading}
                        />
                    </Col>
                </Row>
                {/* Add & Edit Branch */}
                <Modal
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    size="lg"
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {editingIndex === null ? "Add Branch" : "Edit Branch"}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Row>
                                <Col md={6} className="mb-3">
                                    <Form.Label>Branch Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={branchForm.branchname}
                                        onChange={(e) =>
                                            setBranchForm({
                                                ...branchForm,
                                                branchname: e.target.value,
                                            })
                                        }
                                        placeholder="Enter Branch Name"
                                    />
                                </Col>

                                <Col md={6} className="mb-3">
                                    <Form.Label>Location URL</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={branchForm.locationurl}
                                        onChange={(e) =>
                                            setBranchForm({
                                                ...branchForm,
                                                locationurl: e.target.value,
                                            })
                                        }
                                        placeholder="Google Map URL"
                                    />
                                </Col>

                                <Col md={12} className="mb-3">
                                    <Form.Label>Summary</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        value={branchForm.summary}
                                        onChange={(e) =>
                                            setBranchForm({
                                                ...branchForm,
                                                summary: e.target.value,
                                            })
                                        }
                                        placeholder="Branch Summary"
                                    />
                                </Col>

                                <Col md={12} className="mb-3">
                                    <Form.Label>Branch Photos</Form.Label>

                                    <Form.Control
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />

                                    <div className="d-flex flex-wrap gap-3 mt-3">
                                        {imagePreview.map((item, index) => (
                                            <div
                                                key={index}
                                                className="position-relative"
                                            >
                                                <img
                                                    src={item.url}
                                                    alt=""
                                                    style={{
                                                        width: "140px",
                                                        height: "100px",
                                                        objectFit: "cover",
                                                        borderRadius: "8px",
                                                        border: "1px solid #ddd",
                                                    }}
                                                />

                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    className="position-absolute top-0 end-0 rounded-circle p-1"
                                                    onClick={() => removePreviewImage(index)}
                                                >
                                                    <FiX size={14} />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </Col>

                                <Col md={4} className="mb-3">
                                    <Form.Label>City</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={branchForm.city}
                                        onChange={(e) =>
                                            setBranchForm({
                                                ...branchForm,
                                                city: e.target.value,
                                            })
                                        }
                                        placeholder="City"
                                    />
                                </Col>

                                <Col md={4} className="mb-3">
                                    <Form.Label>State</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={branchForm.state}
                                        onChange={(e) =>
                                            setBranchForm({
                                                ...branchForm,
                                                state: e.target.value,
                                            })
                                        }
                                        placeholder="State"
                                    />
                                </Col>

                                <Col md={4} className="mb-3">
                                    <Form.Label>Pincode</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={branchForm.pincode}
                                        onChange={(e) =>
                                            setBranchForm({
                                                ...branchForm,
                                                pincode: e.target.value,
                                            })
                                        }
                                        placeholder="Pincode"
                                    />
                                </Col>

                                <Col md={12} className="mb-3">
                                    <Form.Label>Landmark</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={branchForm.landmark}
                                        onChange={(e) =>
                                            setBranchForm({
                                                ...branchForm,
                                                landmark: e.target.value,
                                            })
                                        }
                                        placeholder="Nearest Landmark"
                                    />
                                </Col>
                            </Row>
                        </Form>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            onClick={() => setShowModal(false)}
                        >
                            Close
                        </Button>

                        <Button
                            variant="success"
                            onClick={saveBranch}
                        >
                            {editingIndex === null ? "Add Branch" : "Update Branch"}
                        </Button>
                    </Modal.Footer>
                </Modal>
                {/* View Branch */}
                <Modal
                    show={showViewModal}
                    onHide={() => setShowViewModal(false)}
                    size="lg"
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title>
                            Branch Details
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {selectedBranch && (
                            <>
                                {/* Images */}
                                {selectedBranch.photos?.length > 0 && (
                                    <div className="mb-4">
                                        <Row>
                                            {selectedBranch.photos.map((photo, index) => (
                                                <Col
                                                    md={4}
                                                    className="mb-3"
                                                    key={index}
                                                >
                                                    <img
                                                        src={photo}
                                                        alt=""
                                                        className="img-fluid rounded shadow-sm border"
                                                        style={{
                                                            width: "100%",
                                                            height: "180px",
                                                            objectFit: "cover"
                                                        }}
                                                    />
                                                </Col>
                                            ))}
                                        </Row>
                                    </div>
                                )}
                                <Row>

                                    <Col md={6} className="mb-3">
                                        <small className="text-muted">
                                            Branch Name
                                        </small>
                                        <h6>
                                            {selectedBranch.branchname || "-"}
                                        </h6>
                                    </Col>

                                    <Col md={6} className="mb-3">
                                        <small className="text-muted">
                                            City
                                        </small>
                                        <h6>
                                            {selectedBranch.city || "-"}
                                        </h6>
                                    </Col>

                                    <Col md={6} className="mb-3">
                                        <small className="text-muted">
                                            State
                                        </small>
                                        <h6>
                                            {selectedBranch.state || "-"}
                                        </h6>
                                    </Col>

                                    <Col md={6} className="mb-3">
                                        <small className="text-muted">
                                            Pincode
                                        </small>
                                        <h6>
                                            {selectedBranch.pincode || "-"}
                                        </h6>
                                    </Col>

                                    <Col md={12} className="mb-3">
                                        <small className="text-muted">
                                            Landmark
                                        </small>
                                        <h6>
                                            {selectedBranch.landmark || "-"}
                                        </h6>
                                    </Col>
                                    <Col md={12} className="mb-3">
                                        <small className="text-muted">
                                            Google Map URL
                                        </small>
                                        <div>
                                            {selectedBranch.locationurl ? (
                                                <a href={selectedBranch.locationurl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    {selectedBranch.locationurl}
                                                </a>
                                            ) : ("-")}
                                        </div>
                                    </Col>
                                    <Col md={12}>
                                        <small className="text-muted">
                                            Summary
                                        </small>
                                        <div
                                            className="border rounded p-3 bg-light mt-2"
                                        >
                                            {selectedBranch.summary || "-"}
                                        </div>
                                    </Col>
                                </Row>
                            </>
                        )}
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
                {loading ? <Loader /> : ""}
            </Container>
        </>
    )
}

export default HospitalBranch