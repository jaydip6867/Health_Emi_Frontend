import React, { useEffect, useState } from 'react'
import CryptoJS from "crypto-js";
import { useNavigate } from 'react-router-dom';
import { Col, Container, Row, Modal, Button, Form } from 'react-bootstrap';
import { API_BASE_URL, SECRET_KEY, STORAGE_KEYS } from '../config';
import HospitalSidebar from './HospitalSidebar';
import SmartDataTable from "../components/SmartDataTable";
import Swal from "sweetalert2";
import axios from 'axios';
import { MdClear, MdDelete, MdOutlineEditCalendar, MdOutlineRemoveRedEye } from 'react-icons/md';
import Loader from '../Loader';

const HospitalBlog = () => {

    const SECRET_KEY = "health-emi";
    var navigate = useNavigate();

    const [hospital, sethospital] = useState(null)
    const [token, settoken] = useState(null)
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);

    const [selectedBlog, setSelectedBlog] = useState(null);

    const [blogForm, setBlogForm] = useState({
        blogid: "",
        image: [],
        title: "",
        description: "",
        showto_doctor: false,
        showto_patient: true,
        url: "",
        meta_title: "",
        meta_description: "",
        meta_keywords: [],
        tags: [],
        expirydate: ""
    });

    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreview, setImagePreview] = useState([]);
    const [keywordInput, setKeywordInput] = useState("");
    const [tagInput, setTagInput] = useState("");

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
            // console.log(data)
            sethospital(data.hospitalData);
            const authToken = `Bearer ${data.accessToken}`;
            // console.log(authToken)
            settoken(authToken);
            getBlogs(authToken);
        }

    }, [navigate])

    const getBlogs = async (authToken = token) => {
        setLoading(true);
        try {
            const response = await axios.post(
                `${API_BASE_URL}/hospital/blogs/list`,
                {
                    search: ""
                },
                {
                    headers: {
                        Authorization: authToken
                    }
                }
            );
            setBlogs(
                response?.data?.Data ||
                response?.data?.data ||
                []
            );
        } catch (err) {
            console.log(err);
        }
        finally {
            setLoading(false);
        }
    }

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            // Old + New images merge
            setSelectedImages((prev) => [
                ...prev,
                ...files
            ]);
            // Old + New preview merge
            const newPreviews = files.map((file) =>
                URL.createObjectURL(file)
            );
            setImagePreview((prev) => [
                ...prev,
                ...newPreviews
            ]);
        }
        // same file again select karva mate input reset
        e.target.value = "";
    };
    const removePreviewImage = (index) => {
        setSelectedImages((prev) => {
            const updated = [...prev];
            updated.splice(index, 1);
            return updated;
        });
        setImagePreview((prev) => {
            const updated = [...prev];
            updated.splice(index, 1);
            return updated;
        });
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setBlogForm({
            ...blogForm,
            [name]: type === "checkbox"
                ? checked
                : value
        });
    }

    const addKeyword = (e) => {
        if (e.key === "Enter" && keywordInput.trim()) {
            setBlogForm({
                ...blogForm,
                meta_keywords: [
                    ...blogForm.meta_keywords,
                    keywordInput.trim()
                ]
            });
            setKeywordInput("");
        }
    }
    const removeKeyword = (index) => {
        const arr = [...blogForm.meta_keywords];
        arr.splice(index, 1);
        setBlogForm({
            ...blogForm,
            meta_keywords: arr
        });
    }
    const addTag = (e) => {
        if (e.key === "Enter" && tagInput.trim()) {
            setBlogForm({
                ...blogForm,
                tags: [
                    ...blogForm.tags,
                    tagInput.trim()
                ]
            });
            setTagInput("");
        }
    }
    const removeTag = (index) => {
        const arr = [...blogForm.tags];
        arr.splice(index, 1);
        setBlogForm({
            ...blogForm,
            tags: arr
        });
    }

    const uploadImages = async () => {
        if (selectedImages.length === 0) {
            return blogForm.image;
        }
        try {
            let uploadedUrls = [];
            for (const image of selectedImages) {
                const uploadPayload = new FormData();
                uploadPayload.append(
                    "image",
                    image
                );
                const response = await axios.post(
                    `${API_BASE_URL}/user/upload`,
                    uploadPayload,
                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data"
                        }
                    }
                );
                const url =
                    response?.data?.url ||
                    response?.data?.Data ||
                    response?.data?.data;
                if (url) {
                    uploadedUrls.push(url);
                }
            }
            return uploadedUrls;
        } catch (err) {
            console.log(err);
            return [];
        }
    }
    const formatDate = (date) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    }

    const saveBlog = async () => {
        setLoading(true)
        try {
            // First Image Upload
            const uploadedImages = await uploadImages();

            const payload = {
                blogid: blogForm.blogid,
                image:
                    uploadedImages.length > 0
                        ?
                        uploadedImages
                        :
                        blogForm.image,
                title: blogForm.title,
                description: blogForm.description,
                showto_doctor:
                    blogForm.showto_doctor,
                showto_patient:
                    blogForm.showto_patient,
                url: blogForm.url,
                meta_title: blogForm.meta_title,
                meta_description:
                    blogForm.meta_description,
                meta_keywords:
                    blogForm.meta_keywords,
                tags:
                    blogForm.tags,
                expirydate:
                    blogForm.expirydate ? formatDate(blogForm.expirydate) : ""
            };
            console.log("Final Payload", payload);
            await axios.post(
                `${API_BASE_URL}/hospital/blogs/save`,
                payload,
                {
                    headers: {
                        Authorization: token
                    }
                }
            );
            Swal.fire(
                "Success",
                "Blog Saved Successfully",
                "success"
            );
            setShowModal(false);
            getBlogs();
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false)
        }
    }

    const getOneBlog = async (blogid) => {
        setLoading(true)
        try {
            const response = await axios.post(
                `${API_BASE_URL}/hospital/blogs/getone`,
                {
                    blogid: blogid
                },
                {
                    headers: {
                        Authorization: token
                    }
                }
            );
            return (
                response?.data?.Data ||
                response?.data?.data ||
                null
            );
        } catch (err) {
            console.log(err);
            return null;
        } finally {
            setLoading(false)
        }
    }
    const viewBlog = async (id) => {
        const data = await getOneBlog(id);
        if (data) {
            setLoading(false)
            setSelectedBlog(data);
            setShowViewModal(true);
        }
    }

    const convertToInputDate = (date) => {
        if (!date) return "";
        const [d, m, y] = date.split("-");
        return `${y}-${m}-${d}`;
    }

    const editBlog = async (id) => {
        const data = await getOneBlog(id);
        if (data) {
            setBlogForm({
                blogid: data._id,
                image: data.image || [],
                title: data.title || "",
                description: data.description || "",
                showto_doctor: data.showto_doctor,
                showto_patient: data.showto_patient,
                url: data.url || "",
                meta_title: data.meta_title || "",
                meta_description: data.meta_description || "",
                meta_keywords: data.meta_keywords || [],
                tags: data.tags || [],
                expirydate:
                    convertToInputDate(data.expirydate)
            });
            setImagePreview(
                data.image || []
            );
            setShowModal(true);
        }
    }
    const closeBlogModal = () => {
        setShowModal(false);
        setSelectedImages([]);
        setImagePreview([]);
        setLoading(false)
        setBlogForm({
            blogid: "",
            image: [],
            title: "",
            description: "",
            showto_doctor: false,
            showto_patient: true,
            url: "",
            meta_title: "",
            meta_description: "",
            meta_keywords: [],
            tags: [],
            expirydate: ""
        });
    }
    const deleteBlog = async (id) => {
        const result = await Swal.fire({
            title: "Delete Blog?",
            text: "Are you sure?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Delete"
        });
        if (result.isConfirmed) {
            try {
                await axios.post(
                    `${API_BASE_URL}/hospital/blogs/remove`,
                    {
                        blogid: id
                    },
                    {
                        headers: {
                            Authorization: token
                        }
                    }
                );
                Swal.fire(
                    "Deleted!",
                    "Blog removed successfully",
                    "success"
                );
                getBlogs();
            } catch (err) {
                console.log(err);
            }
        }
    }

    const columns = [
        {
            name: "Image",
            cell: (row) => (
                <img
                    src={row.image?.[0]}
                    width="70"
                    height="50"
                    style={{
                        objectFit: "cover",
                        borderRadius: "5px"
                    }}
                />
            )
        },
        {
            name: "Title",
            selector: (row) => row.title,
            sortable: true
        },
        // {
        //     name: "Patient",
        //     cell: (row) =>
        //         row.showto_patient
        //             ?
        //             <span className="badge bg-success">
        //                 Yes
        //             </span>
        //             :
        //             <span className="badge bg-danger">
        //                 No
        //             </span>
        // },
        // {
        //     name: "Doctor",
        //     cell: (row) =>

        //         row.showto_doctor
        //             ?
        //             <span className="badge bg-success">
        //                 Yes
        //             </span>
        //             :
        //             <span className="badge bg-danger">
        //                 No
        //             </span>
        // },
        {
            name: "Expiry Date",
            selector: (row) => row.expirydate
        },
        {
            name: "Action",
            cell: (row) => (
                <div className="d-flex gap-2">
                    <Button
                        size="sm"
                        variant="info"
                        onClick={() => viewBlog(row._id)}
                        className='btn btn-sm p-1 appt-view-btn'
                    >
                        <MdOutlineRemoveRedEye size={18} />
                    </Button>
                    <Button
                        size="sm"
                        variant="warning"
                        onClick={() => editBlog(row._id)}
                        className='btn btn-sm p-1 appt-view-btn'
                        >
                        <MdOutlineEditCalendar size={18} />
                    </Button>
                    <Button
                        size="sm"
                        variant="danger"
                        onClick={() => deleteBlog(row._id)}
                        className='btn btn-sm p-1 appt-view-btn dark'
                    >
                        <MdDelete />
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
                        <div className="appointments-card mb-3 ">
                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 border-bottom pb-3">
                                <h4 className="mb-0">Blogs</h4>
                                <Button
                                    variant="primary"
                                    onClick={() => setShowModal(true)}
                                    className='apt_accept_btn'
                                >
                                    Add Blog
                                </Button>
                            </div>
                        </div>
                        <SmartDataTable
                            columns={columns}
                            data={blogs}
                            pagination
                            responsive
                            striped
                            highlightOnHover
                            progressPending={loading}
                        />
                    </Col>
                </Row>
                {/* Add Mblog Model */}
                <Modal
                    show={showModal}
                    onHide={closeBlogModal}
                    size="lg"
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {blogForm.blogid ? "Edit Blog" : "Add Blog"}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Title
                                </Form.Label>
                                <Form.Control
                                    name="title"
                                    value={blogForm.title}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Description
                                </Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    name="description"
                                    value={blogForm.description}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Blog Images
                                </Form.Label>
                                <Form.Control
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                />
                                <div className="d-flex gap-3 flex-wrap mt-3">
                                    {imagePreview.map((img, index) => (
                                        <div
                                            key={index}
                                            className="position-relative"
                                        >
                                            <img
                                                src={img}
                                                alt="preview"
                                                style={{
                                                    width: "120px",
                                                    height: "90px",
                                                    objectFit: "cover",
                                                    borderRadius: "8px",
                                                    border: "1px solid #ddd"
                                                }}
                                            />
                                            <Button
                                                size="sm"
                                                variant="danger"
                                                style={{
                                                    position: "absolute",
                                                    top: "3px",
                                                    right: "3px",
                                                    borderRadius: "50%",
                                                }}
                                                onClick={() => removePreviewImage(index)}
                                            >
                                                <MdClear size={14} />
                                            </Button>
                                        </div>
                                    ))
                                    }
                                </div>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Meta Keywords
                                </Form.Label>
                                <Form.Control
                                    value={keywordInput}
                                    placeholder="Type and press Enter"
                                    onChange={(e) =>
                                        setKeywordInput(e.target.value)
                                    }
                                    onKeyDown={addKeyword}
                                />
                                <div className="mt-2">
                                    {blogForm.meta_keywords.map(
                                        (item, index) => (
                                            <span
                                                key={index}
                                                className="badge bg-primary text-white me-2 p-2"
                                            >
                                                {item}
                                                <button
                                                    type="button"
                                                    className="btn-close btn-close-white ms-2"
                                                    style={{
                                                        fontSize: "10px"
                                                    }}
                                                    onClick={() => removeKeyword(index)}
                                                />
                                            </span>
                                        ))
                                    }
                                </div>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Tags
                                </Form.Label>
                                <Form.Control
                                    value={tagInput}
                                    placeholder="Type and press Enter"
                                    onChange={(e) =>
                                        setTagInput(e.target.value)
                                    }
                                    onKeyDown={addTag}
                                />
                                <div className="mt-2">
                                    {
                                        blogForm.tags.map((item, index) => (
                                            <span
                                                key={index}
                                                className="badge bg-success text-white me-2 p-2"
                                            >
                                                {item}
                                                <button
                                                    type="button"
                                                    className="btn-close btn-close-white ms-2"
                                                    style={{
                                                        fontSize: "10px"
                                                    }}
                                                    onClick={() => removeTag(index)}
                                                />
                                            </span>
                                        ))
                                    }
                                </div>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Expiry Date
                                </Form.Label>
                                <Form.Control
                                    type="date"
                                    name="expirydate"
                                    value={blogForm.expirydate}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                            <Form.Check
                                type="checkbox"
                                label="Show To Doctor"
                                name="showto_doctor"
                                checked={blogForm.showto_doctor}
                                onChange={handleChange}
                            />
                            <Form.Check
                                type="checkbox"
                                label="Show To Patient"
                                name="showto_patient"
                                checked={blogForm.showto_patient}
                                onChange={handleChange}
                            />
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            onClick={closeBlogModal}
                        >
                            Close
                        </Button>
                        <Button
                            variant="success"
                            onClick={saveBlog}
                        >
                            Save Blog
                        </Button>
                    </Modal.Footer>
                </Modal>
                {/* View Blog Model */}
                <Modal
                    show={showViewModal}
                    onHide={() => setShowViewModal(false)}
                    size="lg"
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title>
                            Blog Details
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {
                            selectedBlog &&
                            <div>
                                <img
                                    src={selectedBlog.image?.[0]}
                                    className="img-fluid rounded mb-3"
                                    style={{
                                        height: "250px",
                                        width: "100%",
                                        objectFit: "cover"
                                    }}

                                />
                                <h4>
                                    {selectedBlog.title}
                                </h4>
                                <p>
                                    {selectedBlog.description}
                                </p>
                                <hr />
                                <p>
                                    <b>Meta Title : </b>
                                    {selectedBlog.meta_title}
                                </p>
                                <p>
                                    <b>URL : </b>
                                    {selectedBlog.url}
                                </p>
                                <p>
                                    <b>Tags : </b>
                                    {
                                        selectedBlog.tags?.map((tag, i) => (
                                            <span
                                                key={i}
                                                className="badge text-white bg-primary me-1"
                                            >
                                                {tag}
                                            </span>
                                        ))
                                    }
                                </p>
                                <p>
                                    <b>Keywords : </b>
                                    {
                                        selectedBlog.meta_keywords?.map((tag, i) => (
                                            <span
                                                key={i}
                                                className="badge text-white bg-secondary me-1"
                                            >
                                                {tag}
                                            </span>
                                        ))
                                    }
                                </p>
                            </div>
                        }
                    </Modal.Body>
                </Modal>
                {loading ? <Loader /> : ""}
            </Container>
        </>
    )
}

export default HospitalBlog