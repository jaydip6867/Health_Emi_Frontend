import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Col,
  Container,
  Form,
  Modal,
  OverlayTrigger,
  Row,
  ToastContainer,
  Tooltip,
} from "react-bootstrap";
import DoctorSidebar from "./DoctorSidebar";
import CryptoJS from "crypto-js";
import DatePicker from "react-datepicker";
import { enGB } from "date-fns/locale";
import axios from "axios";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import Loader from "../Loader";
import {
  MdDeleteOutline,
  MdOutlineEditCalendar,
  MdDeleteForever,
  MdDelete,
  MdOutlineRemoveRedEye,
} from "react-icons/md";
import SmartDataTable from "../components/SmartDataTable";
import { API_BASE_URL, SECRET_KEY } from "../config";
import NavBar from "../Visitor/Component/NavBar";
import { FiClipboard, FiClock } from "react-icons/fi";

const D_Blog = () => {
  var navigate = useNavigate();
  const [loading, setloading] = useState(false);

  const [doctor, setdoctor] = useState(null);
  const [token, settoken] = useState(null);

  useEffect(() => {
    var getlocaldata = localStorage.getItem("healthdoctor");
    if (getlocaldata != null) {
      const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      var data = JSON.parse(decrypted);
    }
    if (!data) {
      navigate("/doctor");
    } else {
      setdoctor(data.doctorData);
      settoken(`Bearer ${data.accessToken}`);
    }
  }, [navigate]);

  // Get Blog

  useEffect(() => {
    if (token) {
      getblog();
    }
  }, [token]);

  const [bloglist, setbloglist] = useState(null);
  const [displist, setdisplist] = useState(null);
  function getblog() {
    setloading(true);
    axios({
      method: "post",
      url: `${API_BASE_URL}/doctor/blogs/list`,
      headers: {
        Authorization: token,
      },
      data: {
        search: "",
      },
    })
      .then((res) => {
        // console.log(res.data.Data)
        setbloglist(res.data.Data);
        setdisplist(res.data.Data);
      })
      .catch(function (error) {
        // console.log(error);
        toast(error.response.data.Message, { className: "custom-toast-error" });
      })
      .finally(() => {
        setloading(false);
      });
  }

  // ADD blog

  const blog_var = {
    title: "",
    description: "",
    showto_doctor: false,
    showto_patient: true,
    expirydate: null,
    image: [],
  };
  const [blog, setblog] = useState(blog_var);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  let selectedImage = null;
  // Image upload function
  useEffect(() => {
    return () => {
      // Clean up object URLs
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);
  async function uploadMultipleImages(files) {
    if (!files || files.length === 0) return [];
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    try {
      const response = await axios({
        method: "post",
        url: `${API_BASE_URL}/user/upload/multiple`,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token,
        },
      });

      if (response.data.Status && response.data.Data) {
        return response.data.Data.map((item) => item.path);
      }
      return [];
    } catch (error) {
      console.error("Error uploading images:", error);
      toast("Error uploading images", { className: "custom-toast-error" });
      return [];
    }
  }

  async function addblog() {
    setloading(true);

    try {
      // Upload all selected images
      let imageUrls = [];
      if (selectedImages.length > 0) {
        imageUrls = await uploadMultipleImages(selectedImages);
        if (imageUrls.length === 0) {
          setloading(false);
          toast("Failed to upload images", { className: "custom-toast-error" });
          return;
        }
      }

      // Prepare blog data
      const blogData = {
        title: blog.title,
        description: blog.description,
        showto_doctor: blog.showto_doctor,
        showto_patient: blog.showto_patient,
        image: imageUrls, // This will be an array of image URLs
        expirydate: blog.expirydate
          ? new Date(blog.expirydate)
              .toLocaleDateString("en-GB")
              .replace(/\//g, "-")
          : "",
      };

      // Save blog
      const response = await axios({
        method: "post",
        url: `${API_BASE_URL}/doctor/blogs/save`,
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        data: blogData,
      });

      // Handle success
      Swal.fire({
        title: "Blog Added Successfully",
        icon: "success",
      });

      // Reset form
      setblog(blog_var);
      setSelectedImages([]);
      setImagePreviews([]);
      handleblogClose();
      getblog();
    } catch (error) {
      console.error("Error adding blog:", error);
      toast(error.response?.data?.Message || "Error adding blog", {
        className: "custom-toast-error",
      });
    } finally {
      setloading(false);
    }
  }

  // delete blog
  function deleteblog(id) {
    Swal.fire({
      title: "Are you sure?",
      text: "You Want Delete This Surgery.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios({
          method: "post",
          url: `${API_BASE_URL}/doctor/blogs/remove`,
          headers: {
            Authorization: token,
          },
          data: {
            blogid: id,
          },
        })
          .then((res) => {
            Swal.fire({
              title: "Blog Deleted",
              text: "The blog has been removed successfully.",
              icon: "success",
            });
            getblog();
          })
          .catch(function (error) {
            // console.log(error);
            toast(error.message, { className: "custom-toast-error" });
          })
          .finally(() => {});
      }
    });
  }

  // display single blog
  // display blog in model
  const [show, setShow] = useState(false);
  const [single_view, setsingleview] = useState(null);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  function btnview(id) {
    var datasingle = bloglist.filter((v, i) => {
      return v._id === id;
    });
    setsingleview(datasingle);
    handleShow();
    // console.log(datasingle);
  }

  // Edit Blog display surgery in model
  const [editshow, seteditShow] = useState(false);
  const [edit_record, seteditrecord] = useState(null);
  const [editSelectedImages, setEditSelectedImages] = useState([]);
  const [editImagePreviews, setEditImagePreviews] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);

  // Add this useEffect for cleanup
  useEffect(() => {
    return () => {
      editImagePreviews.forEach((preview) => {
        if (preview.startsWith("blob:")) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [editImagePreviews]);

  const edithandleClose = () => seteditShow(false);
  const edithandleShow = () => seteditShow(true);

  const btnedit = (id) => {
    const blogToEdit = bloglist.find((blog) => blog._id === id);
    if (blogToEdit) {
      // Ensure we're using the correct property name (image, not images)
      const blogImages = Array.isArray(blogToEdit.image)
        ? blogToEdit.image
        : blogToEdit.image
        ? [blogToEdit.image]
        : [];

      seteditrecord({
        ...blogToEdit,
        image: [...blogImages], // Ensure we have a clean copy of the array
      });

      // Set initial previews from existing images
      setEditImagePreviews([...blogImages]);
      setEditSelectedImages([]);
      setRemovedImages([]);

      // Set expiry date if it exists
      if (blogToEdit.expirydate) {
        const [day, month, year] = blogToEdit.expirydate.split("-");
        setStartDate(new Date(year, month - 1, day));
      } else {
        setStartDate(null);
      }
      edithandleShow();
    }
  };
  const [startDate, setStartDate] = useState(null);

  async function editblog() {
    setloading(true);
    try {
      // Start with existing images
      let imageUrls = [...(Array.isArray(edit_record.image) ? edit_record.image : [])];

      // Remove images that were marked for removal
      if (removedImages.length > 0) {
        // Remove from the array
        imageUrls = imageUrls.filter((img) => !removedImages.includes(img));

        // Remove from server (optional)
        await Promise.all(
          removedImages.map(async (imgUrl) => {
            try {
              await axios({
                method: "post",
                url: `${API_BASE_URL}/user/upload/removeimage`,
                headers: { Authorization: token },
                data: { path: imgUrl },
              });
            } catch (error) {
              console.error("Error removing image:", error);
            }
          })
        );
      }

      // Upload new images if any
      if (editSelectedImages.length > 0) {
        const uploadedUrls = await uploadMultipleImages(editSelectedImages);
        if (uploadedUrls.length > 0) {
          imageUrls = [...imageUrls, ...uploadedUrls];
        }
      }

      // Prepare the blog data
      const blogData = {
        blogid: edit_record._id,
        image: imageUrls, // This will be an array of image URLs
        title: edit_record.title,
        description: edit_record.description,
        showto_doctor: edit_record.showto_doctor,
        showto_patient: edit_record.showto_patient,
        expirydate: startDate
          ? startDate.toLocaleDateString("en-GB").replace(/\//g, "-")
          : "",
      };

      // Update the blog
      const response = await axios({
        method: "post",
        url: `${API_BASE_URL}/doctor/blogs/save`,
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        data: blogData,
      });

      // Handle success
      Swal.fire({
        title: "Blog Updated Successfully",
        icon: "success",
      });
      getblog();
      edithandleClose();
    } catch (error) {
      console.error("Error updating blog:", error);
      toast(error.response?.data?.Message || "Error updating blog", {
        className: "custom-toast-error",
      });
    } finally {
      setloading(false);
    }
  }

  // show add blog model
  const [show_ad_blog, setadblog] = useState(false);
  const handleblogClose = () => setadblog(false);
  const handleblogShow = () => setadblog(true);

  const renderTooltip = (label) => (props) =>
    (
      <Tooltip id="button-tooltip" {...props}>
        {label} Blog
      </Tooltip>
    );

  // Function to check if blog has expired
  const isBlogExpired = (expiryDate) => {
    if (!expiryDate || expiryDate === "" || expiryDate === "Not Defined") {
      return false;
    }

    try {
      // Parse expiry date (format: dd-mm-yyyy)
      const parts = String(expiryDate).split("-");
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // JavaScript months are 0-indexed
        const year = parseInt(parts[2], 10);
        const expiryDateObj = new Date(year, month, day);

        // Get current date without time
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return expiryDateObj < today;
      }
    } catch (error) {
      console.error("Error parsing expiry date:", error);
    }

    return false;
  };

  // Minimal table inline styles; visuals handled in CSS
  const customTableStyles = {
    table: {
      backgroundColor: "transparent",
      borderRadius: 0,
      boxShadow: "none",
    },
  };

  // table data
  const columns = [
    {
      name: "No",
      selector: (row, index) => index + 1,
      width: "40px",
    },
    {
      name: "Title",
      selector: (row) => row?.title || "",
      cell: (row) => (
        <div className="d-flex align-items-center flex-wrap gap-3">
          <img
            src={row?.image[0] || require("../Visitor/assets/blog.png")}
            className="appt-avatar rounded-circle"
            alt={`blog of ${row.title}`}
          />
          <span
            className="fw-semibold appt-doctor-name text-truncate"
            style={{ maxWidth: "150px" }}
          >
            {row.title}
          </span>
        </div>
      ),
      // <span className="fw-medium truncaate_description">{row.title}</span>,
    },
    {
      name: "Description",
      selector: (row) => row.description || "",
      cell: (row) => (
        <div className="d-flex align-items-center gap-2 text-muted small">
          <FiClipboard style={{ minWidth: "16px", minHeight: "16px" }} />
          <span className="truncaate_description" style={{ maxWidth: "200px" }}>
            {row.description}
          </span>
        </div>
      ),
    },
    {
      name: "Expiry Date",
      selector: (row) => row.expirydate || "Not Defined",
      cell: (row) => (
        <div className="d-flex align-items-center gap-2 text-muted small">
          <FiClock
            style={{ minWidth: "16px", minHeight: "16px" }}
            className="text-muted"
          />
          <span>{row.expirydate === "" ? "Not Defined" : row.expirydate}</span>
        </div>
      ),
    },
    {
      name: "Action",
      cell: (row) => (
        <div className="d-flex align-items-center gap-1">
          {!isBlogExpired(row.expirydate) && (
            <OverlayTrigger placement="top" overlay={renderTooltip("Edit")}>
              <button
                className="btn btn-sm p-1 apt_status_btn success"
                onClick={() => btnedit(row._id)}
              >
                <MdOutlineEditCalendar size={18} />
              </button>
            </OverlayTrigger>
          )}

          <OverlayTrigger placement="top" overlay={renderTooltip("Delete")}>
            <button
              className="btn btn-sm p-1 apt_status_btn danger"
              onClick={() => deleteblog(row._id)}
            >
              <MdDeleteOutline size={18} />
            </button>
          </OverlayTrigger>

          <OverlayTrigger
            placement="top"
            overlay={renderTooltip("View Details")}
          >
            <button
              className="btn btn-sm p-1 apt_status_btn dark"
              onClick={() => btnview(row._id)}
            >
              <MdOutlineRemoveRedEye size={18} />
            </button>
          </OverlayTrigger>
        </div>
      ),
      width: "150px",
    },
  ];

  const [search, setSearch] = useState("");
  const searchbox = (e) => {
    setSearch(e.target.value);
    var data = bloglist.filter((items) => items.title.includes(e.target.value));
    setdisplist(data);
    // console.log(data)
  };

  return (
    <>
      <NavBar logindata={doctor} />
      <Container className="my-4">
        <Row className="align-items-start">
          <DoctorSidebar doctor={doctor} />
          <Col xs={12} lg={9}>
            <div className="appointments-card mb-3">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 border-bottom pb-3">
                <h4 className="mb-0">My Blogs</h4>
                <Button
                  variant="primary"
                  onClick={handleblogShow}
                  className="apt_accept_btn"
                >
                  Add Blog
                </Button>
              </div>
              <SmartDataTable
                className="appointments-table"
                columns={columns}
                data={displist ? displist : []}
                pagination
                customStyles={customTableStyles}
              />
            </div>
          </Col>
        </Row>
        {/* add blog modal */}
        <Modal show={show_ad_blog} onHide={handleblogClose} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Add Blog Detail</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="g-4">
              <Col xs={12}>
                <Form className="row register_doctor border rounded m-1 px-2 gy-3">
                  <Form.Group className="col-12 col-md-6">
                    <Form.Label>Blog Images</Form.Label>
                    <Form.Control
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        if (files.length > 0) {
                          setSelectedImages(files);
                          // Create previews
                          const previews = files.map((file) =>
                            URL.createObjectURL(file)
                          );
                          setImagePreviews(previews);
                        }
                      }}
                    />
                    {/* Image previews */}
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      {imagePreviews.map((preview, index) => (
                        <div
                          key={index}
                          style={{
                            position: "relative",
                            width: "100px",
                            height: "100px",
                          }}
                        >
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              borderRadius: "4px",
                              border: "1px solid #ddd",
                            }}
                          />
                          <Button
                            variant="danger"
                            size="sm"
                            style={{
                              position: "absolute",
                              top: "2px",
                              right: "2px",
                              padding: "0.1rem 0.3rem",
                              fontSize: "0.7rem",
                            }}
                            onClick={() => {
                              const newImages = [...selectedImages];
                              const newPreviews = [...imagePreviews];
                              newImages.splice(index, 1);
                              newPreviews.splice(index, 1);
                              setSelectedImages(newImages);
                              setImagePreviews(newPreviews);
                            }}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </Form.Group>

                  <Form.Group controlId="title">
                    <div>
                      <Form.Label>Title</Form.Label>
                      <Form.Control
                        placeholder="Ex:- What is Tomato Flu: Symptoms, Causes, Treatment & Preventive Tips"
                        name="title"
                        value={blog.title}
                        onChange={(e) =>
                          setblog({ ...blog, title: e.target.value })
                        }
                      />
                    </div>
                  </Form.Group>
                  <Form.Group controlId="description">
                    <div>
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        placeholder="The ‘new’ virus, tomato flu, is a variant of already existing hand, "
                        name="description"
                        value={blog.description}
                        rows={4}
                        onChange={(e) =>
                          setblog({ ...blog, description: e.target.value })
                        }
                      />
                    </div>
                  </Form.Group>
                  <Form.Group controlId="expirydate" className="col-12">
                    <Form.Label>Expiry Date</Form.Label>
                    <div>
                      <DatePicker
                        selected={blog.expirydate}
                        onChange={(date) =>
                          setblog({ ...blog, expirydate: date })
                        }
                        dateFormat="dd-MM-y"
                        placeholderText="Select date"
                        locale={enGB}
                        value={blog.expirydate}
                        minDate={new Date()}
                      />
                    </div>
                    <div className="mb-3 mt-4">
                      <Form.Check
                        type="switch"
                        name="showto_doctor"
                        label="Display Blog to doctor"
                        id="docshow"
                        checked={blog.showto_doctor}
                        onChange={(e) =>
                          setblog({ ...blog, showto_doctor: e.target.checked })
                        }
                      />
                      <Form.Check
                        type="switch"
                        name="showto_patient"
                        label="Display Blog to patient"
                        id="patshow"
                        checked={blog.showto_patient}
                        onChange={(e) =>
                          setblog({ ...blog, showto_patient: e.target.checked })
                        }
                      />
                    </div>
                  </Form.Group>
                </Form>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Form.Group>
              <Form.Control
                type="button"
                value={"Add Blog"}
                onClick={addblog}
                className="theme_btn"
              />
            </Form.Group>
          </Modal.Footer>
        </Modal>

        {/* view blog modal */}
        {single_view &&
          single_view.map((v, i) => {
            return (
              <Modal
                show={show}
                onHide={handleClose}
                centered
                size="lg"
                key={i}
              >
                <Modal.Header closeButton>
                  <Modal.Title>{v?.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <div className="p-3">
                    {/* Image Gallery */}
                    {v?.image?.length > 0 ? (
                      <div className="mb-4">
                        <div className="d-flex flex-wrap gap-3 mb-3">
                          {v.image.map((img, imgIndex) => (
                            <div
                              key={imgIndex}
                              className="position-relative"
                              style={{ width: "120px", height: "120px" }}
                            >
                              <img
                                src={img}
                                alt={`${v?.title} - ${imgIndex + 1}`}
                                className="img-fluid rounded h-100 w-100"
                                style={{
                                  objectFit: "cover",
                                  border: "1px solid #eee",
                                  cursor: "pointer",
                                }}
                                onClick={() => {
                                  // Open image in lightbox or full view
                                  window.open(img, "_blank");
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 bg-light rounded mb-4">
                        <i className="bi bi-images fs-1 text-muted"></i>
                        <p className="mt-2 mb-0">No images available</p>
                      </div>
                    )}

                    {/* Blog Content */}
                    <div className="mb-4">
                      <h5 className="mb-3">Description</h5>
                      <p
                        className="text-muted"
                        style={{ whiteSpace: "pre-line" }}
                      >
                        {v?.description || "No description available."}
                      </p>
                    </div>

                    {/* Blog Metadata */}
                    <div className="d-flex flex-wrap gap-4 text-muted small border-top pt-3">
                      <div>
                        <span className="fw-medium">Visible To:</span>{" "}
                        {v?.showto_doctor && "Doctors"}{" "}
                        {v?.showto_doctor && v?.showto_patient && "& "}
                        {v?.showto_patient && "Patients"}
                      </div>
                      {v?.expirydate && (
                        <div>
                          <span className="fw-medium">Expires:</span>{" "}
                          {v.expirydate}
                        </div>
                      )}
                    </div>
                  </div>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={handleClose}>
                    Close
                  </Button>
                </Modal.Footer>
              </Modal>
            );
          })}
        {/* update log modal */}
        {!edit_record ? (
          ""
        ) : (
          <Modal show={editshow} onHide={edithandleClose} centered size="lg">
            <Modal.Header closeButton>
              <Modal.Title>Update Blog</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="p-3 border rounded">
                <Form className="row register_doctor">
                  <Form.Group className="mb-4 col-12">
                    <Form.Label className="fw-semibold">Blog Images</Form.Label>
                    <Form.Control
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        if (files.length > 0) {
                          setEditSelectedImages((prev) => [...prev, ...files]);
                          const newPreviews = files.map((file) =>
                            URL.createObjectURL(file)
                          );
                          setEditImagePreviews((prev) => [
                            ...prev,
                            ...newPreviews,
                          ]);
                        }
                      }}
                      className="mb-2"
                    />
                    <Form.Text className="text-muted d-block mb-3">
                      Click to add more images (Max 10MB per image)
                    </Form.Text>

                    <div className="d-flex flex-wrap gap-3">
                      {editImagePreviews.map((preview, index) => {
                        // Check if this is an existing image (not a new upload)
                        const isExistingImage =
                          index <
                          (Array.isArray(edit_record?.image)
                            ? edit_record.image.length
                            : 0);
                        const isRemoved = removedImages.includes(preview);

                        return (
                          <div
                            key={index}
                            className="position-relative"
                            style={{
                              width: "120px",
                              height: "120px",
                              opacity: isRemoved ? 0.5 : 1,
                              transition: "opacity 0.2s",
                            }}
                          >
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="img-fluid h-100 w-100 rounded"
                              style={{
                                objectFit: "cover",
                                border: `2px solid ${
                                  isRemoved ? "#dc3545" : "#dee2e6"
                                }`,
                                cursor: "pointer",
                              }}
                            />
                            <button
                              type="button"
                              className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 rounded-circle p-0 d-flex align-items-center justify-content-center"
                              style={{
                                width: "24px",
                                height: "24px",
                                zIndex: 1,
                              }}
                              onClick={() => {
                                if (isExistingImage) {
                                  // Toggle removal of existing image
                                  if (isRemoved) {
                                    setRemovedImages((prev) =>
                                      prev.filter((img) => img !== preview)
                                    );
                                  } else {
                                    setRemovedImages((prev) => [
                                      ...prev,
                                      preview,
                                    ]);
                                  }
                                } else {
                                  // Remove new image that hasn't been uploaded yet
                                  const newPreviews = [...editImagePreviews];
                                  newPreviews.splice(index, 1);
                                  setEditImagePreviews(newPreviews);

                                  const newSelected = [...editSelectedImages];
                                  const newIndex =
                                    index -
                                    (edit_record?.oldImages?.length || 0) +
                                    removedImages.length;
                                  newSelected.splice(newIndex, 1);
                                  setEditSelectedImages(newSelected);

                                  // Clean up the object URL
                                  URL.revokeObjectURL(preview);
                                }
                              }}
                              title={isRemoved ? "Undo remove" : "Remove image"}
                            >
                              {isRemoved ? (
                                <MdDelete  size={18}/>
                              ) : (
                                <MdDeleteForever  size={18} />
                              )}
                            </button>

                            {isRemoved && (
                              <div className="position-absolute top-50 start-50 translate-middle">
                                <span className="badge bg-danger">Removed</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </Form.Group>
                  <Form.Group controlId="title" className="mb-3">
                    <div>
                      <Form.Label>Title</Form.Label>
                      <Form.Control
                        placeholder="Ex:- What is Tomato Flu: Symptoms, Causes, Treatment & Preventive Tips"
                        name="title"
                        value={edit_record.title}
                        onChange={(e) =>
                          seteditrecord({
                            ...edit_record,
                            title: e.target.value,
                          })
                        }
                      />
                    </div>
                  </Form.Group>
                  <Form.Group controlId="description" className="mb-3">
                    <div>
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        placeholder="The ‘new’ virus, tomato flu, is a variant of already existing hand, "
                        name="description"
                        value={edit_record.description}
                        onChange={(e) =>
                          seteditrecord({
                            ...edit_record,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                  </Form.Group>
                  <Form.Group controlId="expirydate" className="mb-3">
                    <Form.Label>Expiry Date</Form.Label>
                    <div>
                      <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        dateFormat="dd-MM-y"
                        placeholderText="Select date"
                        locale={enGB}
                        minDate={new Date()}
                      />
                    </div>
                  </Form.Group>
                  <div className="mb-3">
                    <Form.Check
                      type="switch"
                      name="showto_doctor"
                      label="Display Blog to doctor"
                      id="docshow"
                      checked={edit_record.showto_doctor}
                      onChange={(e) =>
                        seteditrecord({
                          ...edit_record,
                          showto_doctor: e.target.checked,
                        })
                      }
                    />
                    <Form.Check
                      type="switch"
                      name="showto_patient"
                      label="Display Blog to patient"
                      id="patshow"
                      checked={edit_record.showto_patient}
                      onChange={(e) =>
                        seteditrecord({
                          ...edit_record,
                          showto_patient: e.target.checked,
                        })
                      }
                    />
                  </div>
                </Form>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Form.Group>
                <Form.Control
                  type="button"
                  value={"Update Blog"}
                  onClick={editblog}
                  className="theme_btn"
                />
              </Form.Group>
              <Button variant="secondary" onClick={edithandleClose}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        )}
      </Container>
      <ToastContainer />
      {loading ? <Loader /> : ""}
    </>
  );
};

export default D_Blog;
