import React, { useEffect, useMemo, useState } from "react";
import Loader from "../Loader";
import DoctorSidebar from "./DoctorSidebar";
import {
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  Modal,
  OverlayTrigger,
  Row,
  Tooltip,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./css/doctor.css";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import Swal from "sweetalert2";
import {
  MdDeleteOutline,
  MdOutlineEditCalendar,
  MdOutlineRemoveRedEye,
} from "react-icons/md";
import CryptoJS from "crypto-js";
import SmartDataTable from '../components/SmartDataTable';
import { FiAward, FiChevronsRight, FiClipboard, FiClock, FiPlus, FiX, FiEdit2 } from "react-icons/fi";
import { API_BASE_URL, SECRET_KEY, STORAGE_KEYS } from '../config';
import NavBar from "../Visitor/Component/NavBar";
import FooterBar from "../Visitor/Component/FooterBar";

const D_Surgery = () => {
  var navigate = useNavigate();
  const [loading, setloading] = useState(false);

  const [doctor, setdoctor] = useState(null);
  const [token, settoken] = useState(null);


  // State for inclusive/exclusive inputs
  const [inclusiveInput, setInclusiveInput] = useState("");
  const [exclusiveInput, setExclusiveInput] = useState("");
  const [inclusiveItems, setInclusiveItems] = useState([]);
  const [exclusiveItems, setExclusiveItems] = useState([]);
  // Categories
  const [categories, setCategories] = useState([]);

  // State for additional features input (todo list)
  const [additionalInput, setAdditionalInput] = useState("");
  const [additionalItems, setAdditionalItems] = useState([]);

  // Handle adding inclusive/exclusive items with duplicate check
  const handleAddInclusive = () => {
    const trimmedInput = inclusiveInput.trim();
    if (
      trimmedInput &&
      !inclusiveItems.some(
        (item) => item.toLowerCase() === trimmedInput.toLowerCase()
      )
    ) {
      setInclusiveItems([...inclusiveItems, trimmedInput]);
      setInclusiveInput("");
    } else if (
      inclusiveItems.some(
        (item) => item.toLowerCase() === trimmedInput.toLowerCase()
      )
    ) {
      toast.warning("This item already exists in the list");
    }
  }
  // Fetch categories by selected speciality type (best-guess endpoint - please confirm)
  const getCategoriesByType = () => {

    axios({
      method: 'post',
      url: `${API_BASE_URL}/doctor/doctorcategories/list`,
      data: { search: '' },
    })
      .then((res) => {
        // console.log(res.data?.Data)
        setCategories(res.data?.Data || []);
      })
      .catch(() => {
        // fallback: if s_type has categories embedded

      });
  };



  // Handle add/remove for additional features
  const handleAddAdditional = () => {
    const trimmedInput = additionalInput.trim();
    if (
      trimmedInput &&
      !additionalItems.some(
        (item) => item.toLowerCase() === trimmedInput.toLowerCase()
      )
    ) {
      setAdditionalItems([...additionalItems, trimmedInput]);
      setAdditionalInput("");
    } else if (
      additionalItems.some(
        (item) => item.toLowerCase() === trimmedInput.toLowerCase()
      )
    ) {
      toast.warning("This item already exists in the list");
    }
  };

  const handleRemoveAdditional = (index) => {
    const newItems = [...additionalItems];
    newItems.splice(index, 1);
    setAdditionalItems(newItems);
  };

  const handleAddExclusive = () => {
    const trimmedInput = exclusiveInput.trim();
    if (
      trimmedInput &&
      !exclusiveItems.some(
        (item) => item.toLowerCase() === trimmedInput.toLowerCase()
      )
    ) {
      setExclusiveItems([...exclusiveItems, trimmedInput]);
      setExclusiveInput("");
    } else if (
      exclusiveItems.some(
        (item) => item.toLowerCase() === trimmedInput.toLowerCase()
      )
    ) {
      toast.warning("This item already exists in the list");
    }
  };

  // Handle removing items
  const handleRemoveInclusive = (index) => {
    const newItems = [...inclusiveItems];
    newItems.splice(index, 1);
    setInclusiveItems(newItems);
  };

  const handleRemoveExclusive = (index) => {
    const newItems = [...exclusiveItems];
    newItems.splice(index, 1);
    setExclusiveItems(newItems);
  };

  // Update surgery data with the lists when form is submitted
  const updateSurgeryWithLists = () => {
    setsurgery((prev) => ({
      ...prev,
      inclusive: inclusiveItems.join(", "),
      exclusive: exclusiveItems.join(", "),
      additional_features: additionalItems.join(", "),
    }));
  };

  var surgeryobj = {
    name: "",
    price: "",
    days: "",
    additional_features: "",
    description: "",
    surgerytypeid: "",
    categoryname: "",
    inclusive: "",
    exclusive: "",
    yearsof_experience: "",
    completed_surgery: "",
    features: "Blade-free laser",
    general_price: "",
    semiprivate_price: "",
    private_price: "",
    delux_price: "",
    surgery_photo: "",
  };
  const [surgery, setsurgery] = useState(surgeryobj);
  const [surgerylist, setsurgerylist] = useState(null);
  const [category_list, setcategory_list] = useState();

  const selsurgery = (e) => {
    const { name, value } = e.target;

    if (name === "surgerytypeid") {
      var cat_list = categories?.filter((x) => x.surgerytypeid._id === value);
      setcategory_list(cat_list);
    }
    setsurgery((surgery) => ({
      ...surgery,
      [name]: value,
    }));
  };

  useEffect(() => {
    var getlocaldata = localStorage.getItem(STORAGE_KEYS.DOCTOR);
    if (getlocaldata != null) {
      const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      var data = JSON.parse(decrypted);
    }
    if (!data) {
      navigate("/doctor");
    } else {
      setdoctor(data?.doctorData);
      settoken(`Bearer ${data?.accessToken}`);
    }
  }, [navigate]);

  useEffect(() => {
    if (token) {
      getsurgery();
      getspeciality();
      getCategoriesByType();
    }
  }, [token]);

  function getsurgery() {
    setloading(true);
    axios({
      method: "post",
      url: `${API_BASE_URL}/doctor/surgeries/list`,
      headers: {
        Authorization: token,
      },
      data: {
        search: "",
      },
    })
      .then((res) => {
        // console.log(res.data?.Data)
        setsurgerylist(res.data?.Data);
      })
      .catch(function (error) {
        // console.log(error);
        toast(error.response.data?.Message, {
          className: "custom-toast-error",
        });
      })
      .finally(() => {
        setloading(false);
      });
  }

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // Handle file selection with preview close
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Function to remove preview
  const removePreview = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    // Clear the file input
    document.getElementById("surgery_photo").value = "";
  };

  // Function to upload file
  const uploadFile = async () => {
    if (!selectedFile) return "";

    const formData = new FormData();
    formData?.append("file", selectedFile);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/user/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data?.Data?.url;
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload image");
      throw error;
    }
  };

  async function addsurgery() {
    try {
      setloading(true);

      // Upload the file first
      let photoUrl = "";
      if (selectedFile) {
        photoUrl = await uploadFile();
      }

      var surgerydata = {
        ...surgery,
        inclusive: inclusiveItems.join(", "),
        exclusive: exclusiveItems.join(", "),
        additional_features: additionalItems.join(", "),
        surgery_photo: photoUrl,
      };

      const response = await axios({
        method: "post",
        url: `${API_BASE_URL}/doctor/surgeries/save`,
        headers: {
          Authorization: token,
        },
        data: surgerydata,
      });

      Swal.fire({
        title: "Surgery Added...",
        icon: "success",
      });

      getsurgery();
      setsurgery(surgeryobj);
      setSelectedFile(null);
      setPreviewUrl("");
      handlesurClose();
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.response?.data?.Message || "An error occurred");
    } finally {
      setloading(false);
    }
  }

  function deletesurgery(sid) {
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
          url: `${API_BASE_URL}/doctor/surgeries/remove`,
          headers: {
            Authorization: token,
          },
          data: {
            surgeryid: sid,
          },
        })
          .then((res) => {
            Swal.fire({
              title: "Deleted!",
              text: "Your Account has been deleted.",
              icon: "success",
            });
            getsurgery();
          })
          .catch(function (error) {
            // console.log(error);
            toast(error.response.data?.Message, {
              className: "custom-toast-error",
            });
          })
          .finally(() => { });
      }
    });
  }

  // display surgery in model
  const [show, setShow] = useState(false);
  const [single_view, setsingleview] = useState(null);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  function btnview(id) {
    var datasingle = surgerylist.filter((v, i) => {
      return v._id === id;
    });
    setsingleview(datasingle);
    // console.log(datasingle)
    handleShow();
    // console.log(datasingle)
  }

  // display edit surgery in model
  const [editshow, seteditShow] = useState(false);
  const [edit_record, seteditrecord] = useState(null);

  const edithandleClose = () => seteditShow(false);
  const edithandleShow = () => seteditShow(true);

  function btnedit(id) {
    var datasingle = surgerylist.filter((v, i) => {
      return v._id === id;
    });
    const surgeryobj = {
      surgeryid: datasingle[0]._id,
      name: datasingle[0].name,
      price: datasingle[0].price,
      days: datasingle[0].days,
      additional_features: datasingle[0].additional_features,
      description: datasingle[0].description,
      surgerytypeid: datasingle[0].surgerytypeid._id,
      categoryname: datasingle[0].categoryname || '',
      general_price: datasingle[0].general_price,
      semiprivate_price: datasingle[0].semiprivate_price,
      private_price: datasingle[0].private_price,
      delux_price: datasingle[0].delux_price,
      inclusive: datasingle[0].inclusive,
      exclusive: datasingle[0].exclusive,
      yearsof_experience: datasingle[0].yearsof_experience,
      completed_surgery: datasingle[0].completed_surgery,
      features: datasingle[0].features,
      surgery_photo: datasingle[0].surgery_photo,
    };


    var cat_list = categories?.filter((x) => x.surgerytypeid._id === surgeryobj.surgerytypeid);
    setcategory_list(cat_list);


    // Initialize inclusive and exclusive items from the existing surgery data
    const ed_incl_items = surgeryobj.inclusive
      ? surgeryobj.inclusive.split(",").map((item) => item.trim())
      : [];
    const ed_excl_items = surgeryobj.exclusive
      ? surgeryobj.exclusive.split(",").map((item) => item.trim())
      : [];
    const ed_additional_items = surgeryobj.additional_features
      ? surgeryobj.additional_features.split(",").map((item) => item.trim())
      : [];

    setInclusiveItems(ed_incl_items);
    setExclusiveItems(ed_excl_items);
    setAdditionalItems(ed_additional_items);
    // setSelectededitinclItems(ed_incl_items);
    // setSelectededitexclItems(ed_excl_items);

    seteditrecord(surgeryobj);

    // load categories for the edit-selected type
    getCategoriesByType();
    edithandleShow();
    // console.log(surgeryobj)
  }


  const seleditsurgery = (e) => {
    const { name, value } = e.target;
    seteditrecord((surgery) => ({
      ...surgery,
      [name]: value,
    }));
    // console.log(edit_record)
  };

  // Helper function to format items array safely
  const formatItems = (items) => {
    if (!items || !Array.isArray(items) || items.length === 0) return "";
    return items.join(", ");
  };

  async function editsurgery() {
    try {
      setloading(true);

      // Upload the file first if a new one is selected
      let photoUrl = edit_record?.surgery_photo || "";
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadResponse = await axios.post(
          `${API_BASE_URL}/user/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: token,
            },
          }
        );
        // console.log(uploadResponse.data)

        if (uploadResponse.data.Data.url) {
          photoUrl = uploadResponse.data.Data.url;
        }
      }

      // console.log(photoUrl)

      // Prepare the surgery data with proper formatting
      const editsurgerydata = {
        ...edit_record,
        surgery_photo: photoUrl,
        // Use the selected items if available, otherwise fallback to existing values
        inclusive: formatItems(inclusiveItems),
        exclusive: formatItems(exclusiveItems),
        additional_features: formatItems(additionalItems),
      };
      // console.log(editsurgerydata)

      const response = await axios({
        method: "post",
        url: `${API_BASE_URL}/doctor/surgeries/save`,
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        data: editsurgerydata,
      });
      if (response.data?.Status) {
        Swal.fire({
          title: "Surgery Updated Successfully",
          icon: "success",
        });
        getsurgery();
        seteditrecord(null);
        edithandleClose();
        setSelectedFile(null);
        setPreviewUrl(null);
      } else {
        throw new Error(response.data?.Message || "Failed to update surgery");
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.Message || error.message || "An error occurred while updating surgery",
        icon: "error",
      });
    } finally {
      setloading(false);
    }
  }

  // show add surgery model
  const [show_ad_sur, setadsur] = useState(false);
  const handlesurClose = () => setadsur(false);
  const handlesurShow = () => setadsur(true);

  const [s_type, setstype] = useState(null);
  // get all speciality
  const getspeciality = () => {
    setloading(true);
    axios({
      method: "post",
      url: `${API_BASE_URL}/doctor/surgerytypes/list`,
      data: {
        search: "",
      },
    })
      .then((res) => {
        // console.log('speciality = ',res.data?.Data)
        setstype(res.data?.Data);
      })
      .catch(function (error) {
        // console.log(error);
        toast(error.response.data?.Message, {
          className: "custom-toast-error",
        });
      })
      .finally(() => {
        setloading(false);
      });
  };


  const [d_sel_cat, setdselcat] = useState([]);
  const [s_type_name, setsname] = useState("");
  const seditchange = (e) => {
    var id = e.target.value;
    // console.log(e.target.value)
    var s_name = s_type.filter((v) => {
      return v._id === id;
    });
    // console.log(s_name)
    seteditrecord({ ...edit_record, surgerytypeid: id });
    // load categories and clear selected category on type change
    getCategoriesByType();
    seteditrecord((prev) => ({ ...prev, categoryname: '' }));
  };


  const renderTooltip = (label) => (props) => (
    <Tooltip id="button-tooltip" {...props}>
      {label} Surgery
    </Tooltip>
  );

  // Minimal table inline styles; visuals handled in CSS
  const customTableStyles = {
    table: { backgroundColor: 'transparent', borderRadius: 0, boxShadow: 'none' }
  };
  // table data
  const columns = [
    {
      name: "No",
      selector: (row, index) => index + 1,
      width: "40px",
    },
    {
      name: "Surgery Name",
      selector: (row) => row.name,
      cell: (row) => (
        <div className="d-flex align-items-center flex-wrap gap-3">
          <img src={row.surgery_photo} className="appt-avatar rounded-circle" alt="surgery_photo" />
          <span className="fw-semibold appt-doctor-name">{row.name}</span>
        </div>
      ),
    },
    {
      name: "Surgery Type",
      selector: (row) => row?.surgerytypeid?.surgerytypename || '',
      cell: (row) => (
        <div className="d-flex align-items-center gap-2 text-muted small">
          <FiClipboard size={16} />
          <span style={{ color: '#6B7280', fontSize: '14px' }}>{row?.surgerytypeid?.surgerytypename}</span>
        </div>
      ),
    },
    {
      name: "Stay",
      selector: (row) => `${row?.days || ''}`,
      cell: (row) => (
        <div className="d-flex align-items-center gap-2 text-muted small">
          <FiClock size={16} className="text-muted" />
          <span>{row?.days + ' Days'}</span>
        </div>
      ),
    },
    {
      name: "Experience",
      selector: (row) => `${row?.yearsof_experience || ''}`,
      cell: (row) => (
        <div className="d-flex align-items-center gap-2 text-muted small">
          <FiAward size={16} className="text-muted" />
          <span>{row?.yearsof_experience + ' Years'}</span>
        </div>
      ),
    }, {
      name: 'Action',
      cell: row => (
        <div className="d-flex align-items-center gap-1">
          <OverlayTrigger placement="top" overlay={renderTooltip('Edit')}>
            <button
              className="btn btn-sm p-1 apt_status_btn success"
              onClick={() => btnedit(row._id)}
            >
              <MdOutlineEditCalendar size={18} />
            </button>
          </OverlayTrigger>

          <OverlayTrigger placement="top" overlay={renderTooltip('Delete')}>
            <button
              className="btn btn-sm p-1 apt_status_btn danger"
              onClick={() => deletesurgery(row._id)}
            >
              <MdDeleteOutline size={18} />
            </button>
          </OverlayTrigger>

          <OverlayTrigger placement="top" overlay={renderTooltip('View Details')}>
            <button
              className="btn btn-sm p-1 apt_status_btn dark"
              onClick={() => btnview(row._id)}
            >
              <MdOutlineRemoveRedEye size={18} />
            </button>
          </OverlayTrigger>
        </div>
      ),
      width: '150px',
      center: true
    }
  ];


  return (
    <>
      <NavBar logindata={doctor} />
      <Container className="my-4">
        <Row className="align-items-start">
          <DoctorSidebar doctor={doctor} />
          <Col xs={12} md={9}>
            <div className='appointments-card mb-3'>
              <div className='d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 border-bottom pb-3'>
                <h4 className='mb-0'>Consultation Appointments</h4>
                <Button variant="primary" onClick={handlesurShow} className="apt_accept_btn">
                  Add Surgery
                </Button>
              </div>
              <SmartDataTable className="appointments-table" columns={columns} data={surgerylist ? surgerylist : ""} pagination customStyles={customTableStyles}
              />
            </div>
          </Col>
        </Row>
        {/* add surgery */}
        <Modal show={show_ad_sur} onHide={handlesurClose} centered size="xl">
          <Modal.Header closeButton>
            <Modal.Title>Add Surgery Detail</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="g-4">
              <Col xs={12} md={12}>
                <div className="bg-white border rounded p-3">
                  <Form className="row register_doctor">
                    <Row>
                      <Col xs={6} lg={3} xl={2}>
                        <Form.Group controlId="surgery_photo" className="mb-3 col-12">
                          {/* <Form.Label>Surgery Photo</Form.Label> */}
                          <input
                            id="surgery_photo"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="d-none"
                          />
                          <div className="position-relative" style={{ width: 160, height: 160 }}>
                            <div
                              className="bg-light overflow-hidden"
                              style={{ width: '100%', height: '100%', borderRadius: 16 }}
                            >
                              {previewUrl ? (
                                <img
                                  src={previewUrl}
                                  alt="Preview"
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              ) : (
                                <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                                  No Image
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => document.getElementById('surgery_photo').click()}
                              className="btn btn-primary btn-sm position-absolute d-flex align-items-center justify-content-center"
                              style={{ right: 6, bottom: 6, borderRadius: '50%', width: 32, height: 32 }}
                              aria-label="Change photo"
                            >
                              <FiEdit2 size={16} />
                            </button>
                            {previewUrl && (
                              <button
                                type="button"
                                className="btn-close position-absolute"
                                style={{ top: 6, right: 46, backgroundColor: 'white', padding: 6, borderRadius: '50%' }}
                                onClick={removePreview}
                                aria-label="Remove preview"
                              ></button>
                            )}
                          </div>
                        </Form.Group>
                      </Col>
                      <Col xs={12} md={6} lg={9} xl={10}>
                        <Row>
                          <Form.Group controlId="type" className="mb-3 col-12 col-lg-4">
                            <div className="position-relative">
                              <Form.Label>Speciality Type</Form.Label>
                              <Form.Select
                                name="surgerytypeid"
                                value={surgery.surgerytypeid}
                                onChange={selsurgery}
                              >
                                <option value={""}>Select Speciality Type</option>
                                {s_type?.map((v, i) => {
                                  return (
                                    <option key={i} value={v._id}>
                                      {v.surgerytypename}
                                    </option>
                                  );
                                })}
                              </Form.Select>
                            </div>
                          </Form.Group>
                          <Form.Group className="mb-3 col-12 col-lg-4">
                            <div className="position-relative">
                              <Form.Label>Category</Form.Label>
                              <Form.Select
                                name="categoryname"
                                value={surgery.categoryname}
                                onChange={selsurgery}
                                disabled={!surgery.surgerytypeid}
                              >
                                <option value="">Select Category</option>
                                {category_list?.map((c, idx) => (
                                  <option key={idx} value={c.categoryname}>
                                    {c.categoryname}
                                  </option>
                                ))}
                              </Form.Select>
                            </div>
                          </Form.Group>
                          <Form.Group className="mb-3 col-12 col-lg-4">
                            <Form.Label>Surgery Name</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Enter Surgery Name"
                              name="name"
                              value={surgery.name}
                              onChange={selsurgery}
                            />
                          </Form.Group>
                          <Form.Group
                            controlId="days"
                            className="mb-3 col-6 col-md-12 col-lg-4"
                          >
                            <div className="position-relative">
                              <Form.Label>Days Of Surgery</Form.Label>
                              <Form.Select
                                name="days"
                                value={surgery.days}
                                onChange={selsurgery}
                              >
                                <option value={""} selected disabled>
                                  Select Days
                                </option>
                                {[
                                  1,
                                  2,
                                  3,
                                  4,
                                  5,
                                  6,
                                  7,
                                  8,
                                  9,
                                  10,
                                  "10+",
                                  "15+",
                                  "20+",
                                  "25+",
                                  "30+",
                                  "45+",
                                ].map((level) => (
                                  <option key={level} value={level}>
                                    {level} Day
                                  </option>
                                ))}
                              </Form.Select>
                            </div>
                          </Form.Group>

                          <Form.Group
                            controlId="days"
                            className="mb-3 col-6 col-md-12 col-lg-4"
                          >
                            <div className="position-relative">
                              <Form.Label>Surgery Experiance</Form.Label>
                              <Form.Select
                                name="yearsof_experience"
                                value={surgery.yearsof_experience}
                                onChange={selsurgery}
                              >
                                <option value={""} selected disabled>
                                  Select Experiance
                                </option>
                                {[
                                  "0+",
                                  "1+",
                                  "2+",
                                  "3+",
                                  "4+",
                                  "5+",
                                  "10+",
                                  "20+",
                                ].map((level) => (
                                  <option key={level} value={level}>
                                    {level} years
                                  </option>
                                ))}
                              </Form.Select>
                            </div>
                          </Form.Group>

                          <Form.Group
                            controlId="days"
                            className="mb-3 col-6 col-md-12 col-lg-4"
                          >
                            <div className="position-relative">
                              <Form.Label>completed Surgery</Form.Label>
                              <Form.Select
                                placeholder="Ex:- 18000"
                                name="completed_surgery"
                                value={surgery.completed_surgery}
                                onChange={selsurgery}
                              >
                                <option value={""} selected disabled>
                                  Select Completed Surgery
                                </option>
                                {[
                                  "10+",
                                  "20+",
                                  "30+",
                                  "40+",
                                  "50+",
                                  "100+",
                                  "200+",
                                  "300+",
                                  "500+",
                                  "1000+",
                                  "2000+",
                                  "5000+",
                                ].map((level) => (
                                  <option key={level} value={level}>
                                    {level}
                                  </option>
                                ))}
                              </Form.Select>
                            </div>
                          </Form.Group>
                        </Row>
                      </Col>
                    </Row>
                    <hr />

                    <div>
                      <Row>
                        <Col xs={12} md={8}>
                          <Form.Group
                            controlId="description"
                            className="mb-3 col-12"
                          >
                            <div className="position-relative">
                              <Form.Label>Description</Form.Label>
                              <Form.Control
                                as="textarea"
                                placeholder="Ex:- Cataract surgery involves removing ...."
                                name="description"
                                value={surgery.description}
                                onChange={selsurgery}
                                rows={4}
                              />
                            </div>
                          </Form.Group>
                        </Col>
                        <Col xs={12} md={4}>
                          <Row>
                            <Form.Group
                              controlId="general_price"
                              className="mb-3 col-6"
                            >
                              <div className="position-relative">
                                <Form.Label>General Ward Price</Form.Label>
                                <Form.Control
                                  placeholder="Ex:- 18000"
                                  name="general_price"
                                  value={surgery.general_price}
                                  onChange={selsurgery}
                                />
                              </div>
                            </Form.Group>

                            <Form.Group
                              controlId="semiprivate_price"
                              className="mb-3 col-6"
                            >
                              <div className="position-relative">
                                <Form.Label>Semiprivate Price</Form.Label>
                                <Form.Control
                                  placeholder="Ex:- 18000"
                                  name="semiprivate_price"
                                  value={surgery.semiprivate_price}
                                  onChange={selsurgery}
                                />
                              </div>
                            </Form.Group>

                            <Form.Group
                              controlId="private_price"
                              className="mb-3 col-6"
                            >
                              <div className="position-relative">
                                <Form.Label>Private Price</Form.Label>
                                <Form.Control
                                  placeholder="Ex:- 18000"
                                  name="private_price"
                                  value={surgery.private_price}
                                  onChange={selsurgery}
                                />
                              </div>
                            </Form.Group>

                            <Form.Group
                              controlId="delux_price"
                              className="mb-3 col-6"
                            >
                              <div className="position-relative">
                                <Form.Label>Delux Price</Form.Label>
                                <Form.Control
                                  placeholder="Ex:- 18000"
                                  name="delux_price"
                                  value={surgery.delux_price}
                                  onChange={selsurgery}
                                />
                              </div>
                            </Form.Group>
                          </Row>
                        </Col>
                      </Row>
                    </div>
                    <hr />
                    <Form.Group className="mb-4 col-12">
                      <div className="card shadow-sm">
                        <div className="card-header bg-light">
                          <h6 className="mb-0 fw-bold">
                            Included
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="d-flex mb-3">
                            <Form.Control
                              type="text"
                              value={inclusiveInput}
                              onChange={(e) =>
                                setInclusiveInput(e.target.value.replace(/,/g, ''))
                              }
                              placeholder="Type and press Enter to add item"
                              onKeyPress={(e) =>
                                e.key === "Enter" &&
                                (e.preventDefault(), handleAddInclusive())
                              }
                              onKeyDown={(e) => {
                                if (e.key === ',') {
                                  e.preventDefault();
                                }
                              }}
                              className="form-control"
                              style={{ fontSize: "0.95rem" }}
                            />
                            <Button
                              variant="success"
                              className="ms-2 px-4 d-flex align-items-center"
                              onClick={handleAddInclusive}
                            >
                              <FiPlus className="me-2 text-white" />{" "}
                              <div className="">Add</div>
                            </Button>
                          </div>
                          {inclusiveItems.length > 0 && (
                            <ul
                              className="list-group"
                              style={{ fontSize: "0.95rem" }}
                            >
                              {inclusiveItems.map((item, index) => (
                                <li
                                  key={index}
                                  className="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-2"
                                >
                                  <span>
                                    <FiChevronsRight className="me-2 text-success" />
                                    {item}
                                  </span>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveInclusive(index);
                                    }}
                                    className="rounded-circle"
                                    style={{
                                      width: "28px",
                                      height: "28px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <FiX className="text-white" />
                                  </Button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </Form.Group>

                    {/* Exclusive Section */}
                    <Form.Group className="mb-4 col-12">
                      <div className="card shadow-sm">
                        <div className="card-header bg-light">
                          <h6 className="mb-0 fw-bold">
                            <i className="fas fa-times-circle text-danger me-2"></i>
                            Excluded
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="d-flex mb-3">
                            <Form.Control
                              type="text"
                              value={exclusiveInput}
                              onChange={(e) =>
                                setExclusiveInput(e.target.value.replace(/,/g, ''))
                              }
                              placeholder="Type and press Enter to add item"
                              onKeyPress={(e) =>
                                e.key === "Enter" &&
                                (e.preventDefault(), handleAddExclusive())
                              }
                              onKeyDown={(e) => {
                                if (e.key === ',') {
                                  e.preventDefault();
                                }
                              }}
                              className="form-control"
                              style={{ fontSize: "0.95rem" }}
                            />
                            <Button
                              variant="danger"
                              className="ms-2 px-4 d-flex align-items-center"
                              onClick={handleAddExclusive}
                            >
                              <FiPlus className="me-2 text-white" />{" "}
                              <div className="">Add</div>
                            </Button>
                          </div>
                          {exclusiveItems.length > 0 && (
                            <ul
                              className="list-group"
                              style={{ fontSize: "0.95rem" }}
                            >
                              {exclusiveItems.map((item, index) => (
                                <li
                                  key={index}
                                  className="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-2"
                                >
                                  <span>
                                    <FiChevronsRight className="me-2 text-danger" />
                                    {item}
                                  </span>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveExclusive(index);
                                    }}
                                    className="rounded-circle"
                                    style={{
                                      width: "28px",
                                      height: "28px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <FiX className="text-white" />
                                  </Button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-4 col-12">
                      <div className="card shadow-sm">
                        <div className="card-header bg-light">
                          <h6 className="mb-0 fw-bold">
                            <i className="fas fa-list-check text-primary me-2"></i>
                            Additional Features
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="d-flex mb-3">
                            <Form.Control
                              type="text"
                              value={additionalInput}
                              onChange={(e) => setAdditionalInput(e.target.value.replace(/,/g, ''))}
                              placeholder="Type and press Enter to add item"
                              onKeyPress={(e) =>
                                e.key === "Enter" && (e.preventDefault(), handleAddAdditional())
                              }
                              onKeyDown={(e) => {
                                if (e.key === ',') {
                                  e.preventDefault();
                                }
                              }}
                              className="form-control"
                              style={{ fontSize: "0.95rem" }}
                            />
                            <Button
                              variant="primary"
                              className="ms-2 px-4 d-flex align-items-center"
                              onClick={handleAddAdditional}
                            >
                              <FiPlus className="me-2 text-white" />
                              <div className="">Add</div>
                            </Button>
                          </div>
                          {additionalItems.length > 0 && (
                            <ul className="list-group" style={{ fontSize: "0.95rem" }}>
                              {additionalItems.map((item, index) => (
                                <li
                                  key={index}
                                  className="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-2"
                                >
                                  <span>
                                    <FiChevronsRight className="me-2 text-primary" />
                                    {item}
                                  </span>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveAdditional(index);
                                    }}
                                    className="rounded-circle"
                                    style={{
                                      width: "28px",
                                      height: "28px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <FiX className="text-white" />
                                  </Button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </Form.Group>

                    <Form.Group className="col-auto mx-auto">
                      <Form.Control
                        type="button"
                        value={"Add Surgery Deatil"}
                        onClick={() => {
                          updateSurgeryWithLists();
                          addsurgery();
                        }}
                        className="theme_btn"
                      />
                    </Form.Group>
                  </Form>
                </div>
              </Col>
            </Row>
          </Modal.Body>
        </Modal>

        {/* view single surgery */}
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
                  <Modal.Title>Surgery Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <div className="p-2 rounded-3 border rounded surgery_model" style={{ background: 'var(--white)' }}>
                    <Row className="align-items-center">
                      <Col xs={12} md={8}>
                        <div className="d-flex align-items-start gap-4">
                          <div>
                            <img src={v?.surgery_photo} alt={`surgery photo of ${v?.name}`} />
                          </div>
                          <div>
                            <h5>{v?.name}</h5>
                            <span className="text-muted small">Surgery Type:</span>
                            <p className="fw-medium">{v?.surgerytype}</p>
                          </div>
                        </div>
                      </Col>
                      <Col xs={12} md={4}>
                        <Row className="g-0 justify-content-center">
                          <Col xs={6}>
                            <div className="text-center p-1 h-100">
                              <div>
                                <div className="rounded-circle d-flex mx-auto align-items-center overflow-hidden justify-content-center fw-bold" style={{ width: '40px', height: '40px', backgroundColor: '#d5E1EA', fontSize: '14px' }} >
                                  <svg width="21" height="21" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8.96001 0C5.62546 0 2.91455 2.71091 2.91455 6.04545C2.91455 9.31636 5.47273 11.9636 8.80728 12.0782C8.9091 12.0655 9.01091 12.0655 9.08728 12.0782C9.11273 12.0782 9.12546 12.0782 9.15091 12.0782C9.16364 12.0782 9.16364 12.0782 9.17637 12.0782C12.4346 11.9636 14.9927 9.31636 15.0055 6.04545C15.0055 2.71091 12.2946 0 8.96001 0Z" fill="#1C2A3A" />
                                    <path d="M15.4255 15.4639C11.8745 13.0967 6.08364 13.0967 2.50727 15.4639C0.890909 16.5457 0 18.0094 0 19.5748C0 21.1403 0.890909 22.5912 2.49455 23.6603C4.27636 24.8567 6.61818 25.4548 8.96 25.4548C11.3018 25.4548 13.6436 24.8567 15.4255 23.6603C17.0291 22.5785 17.92 21.1276 17.92 19.5494C17.9073 17.9839 17.0291 16.533 15.4255 15.4639Z" fill="#1C2A3A" />
                                    <path d="M22.947 6.79614C23.1507 9.26523 21.3943 11.4289 18.9634 11.7216C18.9507 11.7216 18.9507 11.7216 18.9379 11.7216H18.8997C18.8234 11.7216 18.747 11.7216 18.6834 11.747C17.4488 11.8107 16.3161 11.4161 15.4634 10.6907C16.7743 9.51977 17.5252 7.76341 17.3725 5.85432C17.2834 4.82341 16.927 3.88159 16.3925 3.07977C16.8761 2.83795 17.4361 2.68523 18.0088 2.63432C20.5034 2.41795 22.7307 4.27614 22.947 6.79614Z" fill="#1C2A3A" />
                                    <path d="M25.4929 18.5692C25.391 19.8038 24.6019 20.8729 23.2783 21.5983C22.0056 22.2983 20.4019 22.6292 18.811 22.5911C19.7274 21.7638 20.2619 20.7329 20.3638 19.6383C20.491 18.0602 19.7401 16.5456 18.2383 15.3365C17.3856 14.662 16.3929 14.1274 15.311 13.7329C18.1238 12.9183 21.6619 13.4656 23.8383 15.222C25.0092 16.1638 25.6074 17.3474 25.4929 18.5692Z" fill="#1C2A3A" />
                                  </svg>
                                </div>
                                <div className="d-flex flex-column mt-1">
                                  <span className="fw-bold">{v?.completed_surgery}</span>
                                  <small className="text-muted">Surgery Done</small>
                                </div>
                              </div>

                            </div>
                          </Col>
                          <Col xs={6}>
                            <div className="text-center p-1 h-100">
                              <div>
                                <div className="rounded-circle d-flex mx-auto align-items-center overflow-hidden justify-content-center fw-bold" style={{ width: '40px', height: '40px', backgroundColor: '#E2E7F2', fontSize: '14px' }} >
                                  <svg width="21" height="21" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M14.2418 5.09082H6.09636C5.76545 5.09082 5.44727 5.10355 5.14182 5.14173C1.71818 5.43446 0 7.45809 0 11.1872V16.2781C0 21.369 2.03636 22.3745 6.09636 22.3745H6.60545C6.88545 22.3745 7.25455 22.5654 7.42 22.7817L8.94727 24.8181C9.62182 25.7217 10.7164 25.7217 11.3909 24.8181L12.9182 22.7817C13.1091 22.5272 13.4145 22.3745 13.7327 22.3745H14.2418C17.9709 22.3745 19.9945 20.669 20.2873 17.2326C20.3255 16.9272 20.3382 16.609 20.3382 16.2781V11.1872C20.3382 7.12718 18.3018 5.09082 14.2418 5.09082ZM5.72727 15.2726C5.01455 15.2726 4.45455 14.6999 4.45455 13.9999C4.45455 13.2999 5.02727 12.7272 5.72727 12.7272C6.42727 12.7272 7 13.2999 7 13.9999C7 14.6999 6.42727 15.2726 5.72727 15.2726ZM10.1691 15.2726C9.45636 15.2726 8.89636 14.6999 8.89636 13.9999C8.89636 13.2999 9.46909 12.7272 10.1691 12.7272C10.8691 12.7272 11.4418 13.2999 11.4418 13.9999C11.4418 14.6999 10.8818 15.2726 10.1691 15.2726ZM14.6236 15.2726C13.9109 15.2726 13.3509 14.6999 13.3509 13.9999C13.3509 13.2999 13.9236 12.7272 14.6236 12.7272C15.3236 12.7272 15.8964 13.2999 15.8964 13.9999C15.8964 14.6999 15.3236 15.2726 14.6236 15.2726Z" fill="#3F5FAB" />
                                    <path d="M25.4292 6.09636V11.1873C25.4292 13.7327 24.6401 15.4636 23.0619 16.4182C22.6801 16.6473 22.2346 16.3418 22.2346 15.8964L22.2474 11.1873C22.2474 6.09636 19.3328 3.18182 14.2419 3.18182L6.491 3.19455C6.04555 3.19455 5.74009 2.74909 5.96918 2.36727C6.92373 0.789091 8.65464 0 11.1874 0H19.3328C23.3928 0 25.4292 2.03636 25.4292 6.09636Z" fill="#3F5FAB" />
                                  </svg>
                                </div>
                                <div className="d-flex flex-column mt-1">
                                  <span className="fw-bold">{v?.yearsof_experience}</span>
                                  <small className="text-muted">Surgery Experience</small>
                                </div>
                              </div>
                            </div>
                          </Col>
                          <Col xs={6}>
                            <div className="text-center p-1  h-100">
                              <div>
                                <div className="rounded-circle d-flex mx-auto align-items-center overflow-hidden justify-content-center fw-bold" style={{ width: '40px', height: '40px', backgroundColor: '#D8F3F1', fontSize: '14px' }} >
                                  <svg width="24" height="24" viewBox="0 0 18 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8.59091 16.5455C13.3355 16.5455 17.1818 12.8416 17.1818 8.27273C17.1818 3.70383 13.3355 0 8.59091 0C3.84628 0 0 3.70383 0 8.27273C0 12.8416 3.84628 16.5455 8.59091 16.5455Z" fill="#12A79D" />
                                    <path d="M13.4147 17.3212C13.8347 17.1048 14.3183 17.423 14.3183 17.8939V24.0667C14.3183 25.2121 13.5165 25.7721 12.5238 25.3012L9.11286 23.6848C8.82013 23.5576 8.36195 23.5576 8.06922 23.6848L4.65831 25.3012C3.66559 25.7594 2.86377 25.1994 2.86377 24.0539L2.88922 17.8939C2.88922 17.423 3.38559 17.1176 3.79286 17.3212C5.23104 18.0467 6.86013 18.4539 8.59104 18.4539C10.322 18.4539 11.9638 18.0467 13.4147 17.3212Z" fill="#12A79D" />
                                  </svg>
                                </div>
                                <div className="d-flex flex-column mt-1">
                                  <span className="fw-bold">{v?.days}</span>
                                  <small className="text-muted">Stays Days</small>
                                </div>
                              </div>
                            </div>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <hr />
                    <Row>
                      <Col xs={12} md={8}>
                        <h6>Description</h6>
                        <p className="text-muted">{v?.description}</p>
                      </Col>
                      <Col xs={12} md={4}>
                        <Row className="g-2">
                          <Col xs={6}>
                            <div className="bg-success-subtle p-2 rounded-3 text-center">
                              <span className="small text-muted">General Price</span>
                              <p className="fw-bold m-0">{v?.general_price}</p>
                            </div>
                          </Col>
                          <Col xs={6}>
                            <div className="bg-success-subtle p-2 rounded-3 text-center">
                              <span className="small text-muted">Semi-Private Price</span>
                              <p className="fw-bold m-0">{v?.semiprivate_price}</p>
                            </div>
                          </Col>
                          <Col xs={6}>
                            <div className="bg-success-subtle p-2 rounded-3 text-center">
                              <span className="small text-muted">Private Price</span>
                              <p className="fw-bold m-0">{v?.private_price}</p>
                            </div>
                          </Col>
                          <Col xs={6}>
                            <div className="bg-success-subtle p-2 rounded-3 text-center">
                              <span className="small text-muted">Delux Price</span>
                              <p className="fw-bold m-0">{v?.delux_price}</p>
                            </div>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <hr />
                    <div>
                      <h6>Additional Facility</h6>
                      <div className="d-flex flex-wrap gap-2">
                        {
                          v?.additional_features?.split(',')?.map((feature, index) => {

                            return (
                              <Badge
                                className={`me-1 bg-secondary-subtle text-dark fs-7 fw-normal px-3 py-2`}
                                key={index}
                              >
                                {feature}
                              </Badge>
                            );
                          })
                        }
                      </div>
                    </div>
                    <hr />
                    <Row>
                      <Col xs={12} md={6}>
                        <h6>Included</h6>
                        {v?.inclusive ? (
                          <ul className="list-unstyled mb-0">
                            {v.inclusive.split(', ').map((item, index) => (
                              <li key={index} className="mb-1">
                                <svg width="15" height="10" viewBox="0 0 15 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M1.16669 5.00016L5.33335 9.16683L13.6667 0.833496" stroke="#2E7D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>

                                <span className="ms-2 text-muted small">{item.trim()}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted mb-0">No inclusive items specified</p>
                        )}
                      </Col>
                      <Col xs={12} md={6}>
                        <h6>Excluded</h6>
                        {v?.exclusive ? (
                          <ul className="list-unstyled mb-0">
                            {v.exclusive.split(',').map((item, index) => (
                              <li key={index} className="mb-1">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M15 5L5 15" stroke="#D32F2F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M5 5L15 15" stroke="#D32F2F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>

                                <span className="ms-2 text-muted small">{item.trim()}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted mb-0">No exclusive items specified</p>
                        )}
                      </Col>
                    </Row>
                  </div>
                </Modal.Body>
              </Modal>
            );
          })}
        {/* update surgery */}
        {!edit_record ? (
          ""
        ) : (
          <Modal show={editshow} onHide={edithandleClose} centered size="xl">
            <Modal.Header closeButton>
              <Modal.Title>Update Surgery</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="bg-white border rounded p-3">
                <Form className="row register_doctor">
                  <Row>
                    <Col xs={6} lg={3} xl={2}>
                      <Form.Group controlId="edit_surgery_photo" className="mb-3 col-12 col-md-3">
                        {/* <Form.Label>Surgery Photo</Form.Label> */}
                        <input
                          id="edit_surgery_photo"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="d-none"
                        />
                        <div className="position-relative" style={{ width: 160, height: 160 }}>
                          <div className="bg-light overflow-hidden" style={{ width: '100%', height: '100%', borderRadius: 16 }}>
                            {(previewUrl || edit_record?.surgery_photo) ? (
                              <img
                                src={previewUrl || edit_record?.surgery_photo}
                                alt="Surgery"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                                No Image
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => document.getElementById('edit_surgery_photo').click()}
                            className="btn btn-primary btn-sm position-absolute d-flex align-items-center justify-content-center"
                            style={{ right: 6, bottom: 6, borderRadius: '50%', width: 32, height: 32 }}
                            aria-label="Change photo"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          {previewUrl && (
                            <button
                              type="button"
                              className="btn-close position-absolute"
                              style={{ top: 6, right: 46, backgroundColor: 'white', padding: 6, borderRadius: '50%' }}
                              onClick={removePreview}
                              aria-label="Remove preview"
                            ></button>
                          )}
                        </div>
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6} lg={9} xl={10}>
                      <Row>
                        <Form.Group controlId="surgerytypeid" className="mb-3 col-md-3">
                          <div className="position-relative">
                            <Form.Label>Speciality Name</Form.Label>
                            <Form.Select
                              name="surgerytypeid"
                              value={edit_record?.surgerytypeid || ""}
                              onChange={seditchange}
                            >
                              <option value="">Select Surgery Type</option>
                              {s_type?.map((v, i) => (
                                <option key={i} value={v._id}>
                                  {v.surgerytypename}
                                </option>
                              ))}
                            </Form.Select>
                          </div>
                        </Form.Group>
                        <Form.Group className="mb-3 col-md-3">
                          <div className="position-relative">
                            <Form.Label>Category</Form.Label>
                            <Form.Select
                              name="categoryname"
                              value={edit_record?.categoryname}
                              onChange={seleditsurgery}
                              disabled={!edit_record?.surgerytypeid}
                            >
                              <option value="">Select Category</option>
                              {category_list?.map((c, idx) => (
                                <option key={idx} value={c.categoryname}>
                                  {c.categoryname}
                                </option>
                              ))}
                            </Form.Select>
                          </div>
                        </Form.Group>
                        <Form.Group className="mb-3 col-12 col-md-6">
                          <Form.Label>Surgery Name</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter Surgery Name"
                            name="name"
                            value={edit_record?.name || ""}
                            onChange={seleditsurgery}
                          />
                        </Form.Group>
                        <Form.Group controlId="days" className="mb-3 col-4">
                          <div className="position-relative">
                            <Form.Label>Days Of Surgery</Form.Label>
                            <Form.Select
                              name="days"
                              value={edit_record.days}
                              onChange={seleditsurgery}
                            >
                              <option value={""} selected disabled>
                                Select Experiance
                              </option>
                              {[
                                1,
                                2,
                                3,
                                4,
                                5,
                                6,
                                7,
                                8,
                                9,
                                10,
                                "10+",
                                "15+",
                                "20+",
                                "25+",
                                "30+",
                                "45+",
                              ].map((level) => (
                                <option
                                  key={level}
                                  value={level}
                                  selected={edit_record.days === level ? true : false}
                                >
                                  {level} Days
                                </option>
                              ))}
                            </Form.Select>
                          </div>
                        </Form.Group>
                        <Form.Group
                          controlId="yearsof_experience"
                          className="mb-3 col-6 col-md-4"
                        >
                          <div className="position-relative">
                            <Form.Label>Surgery Experiance</Form.Label>
                            <Form.Select
                              name="yearsof_experience"
                              value={edit_record.yearsof_experience}
                              onChange={seleditsurgery}
                            >
                              <option value={""} selected disabled>
                                Select Experiance
                              </option>
                              {["0+", "1+", "2+", "3+", "4+", "5+", "10+", "20+"].map(
                                (level) => (
                                  <option
                                    key={level}
                                    value={level}
                                    selected={
                                      edit_record.yearsof_experience === level
                                        ? true
                                        : false
                                    }
                                  >
                                    {level} years
                                  </option>
                                )
                              )}
                            </Form.Select>
                          </div>
                        </Form.Group>
                        <Form.Group
                          controlId="completed_surgery"
                          className="mb-3 col-6 col-md-4"
                        >
                          <div className="position-relative">
                            <Form.Label>completed Surgery</Form.Label>
                            <Form.Select
                              name="completed_surgery"
                              value={edit_record.completed_surgery}
                              onChange={seleditsurgery}
                            >
                              <option value={""} selected disabled>
                                Select Completed Surgery
                              </option>
                              {[
                                "10+",
                                "20+",
                                "30+",
                                "40+",
                                "50+",
                                "100+",
                                "200+",
                                "300+",
                                "500+",
                                "1000+",
                                "2000+",
                                "5000+",
                              ].map((level) => (
                                <option
                                  key={level}
                                  value={level}
                                  selected={
                                    edit_record.completed_surgery === level
                                      ? true
                                      : false
                                  }
                                >
                                  {level}
                                </option>
                              ))}
                            </Form.Select>
                          </div>
                        </Form.Group>
                      </Row>
                    </Col>
                  </Row>
                  <hr />
                  <Row>
                    <Col xs={12} md={8}>
                      <Form.Group controlId="description" className="mb-3">
                        <div className="position-relative">
                          <Form.Label>Description</Form.Label>
                          <Form.Control
                            as="textarea"
                            placeholder="Ex:- Cataract surgery involves removing ...."
                            name="description"
                            value={edit_record.description}
                            onChange={seleditsurgery}
                            rows={4}
                          />
                        </div>
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={4}>
                      <Row>
                        <Form.Group controlId="general_price" className="mb-3 col-6">
                          <div className="position-relative">
                            <Form.Label>General Ward Price</Form.Label>
                            <Form.Control
                              placeholder="Ex:- 18000"
                              name="general_price"
                              value={edit_record.general_price}
                              onChange={seleditsurgery}
                            />
                          </div>
                        </Form.Group>

                        <Form.Group
                          controlId="semiprivate_price"
                          className="mb-3 col-6"
                        >
                          <div className="position-relative">
                            <Form.Label>Semiprivate Price</Form.Label>
                            <Form.Control
                              placeholder="Ex:- 18000"
                              name="semiprivate_price"
                              value={edit_record.semiprivate_price}
                              onChange={seleditsurgery}
                            />
                          </div>
                        </Form.Group>

                        <Form.Group controlId="private_price" className="mb-3 col-6">
                          <div className="position-relative">
                            <Form.Label>Private Price</Form.Label>
                            <Form.Control
                              placeholder="Ex:- 18000"
                              name="private_price"
                              value={edit_record.private_price}
                              onChange={seleditsurgery}
                            />
                          </div>
                        </Form.Group>

                        <Form.Group controlId="delux_price" className="mb-3 col-6">
                          <div className="position-relative">
                            <Form.Label>Delux Price</Form.Label>
                            <Form.Control
                              placeholder="Ex:- 18000"
                              name="delux_price"
                              value={edit_record.delux_price}
                              onChange={seleditsurgery}
                            />
                          </div>
                        </Form.Group>
                      </Row>
                    </Col>
                  </Row>


                  <div className="col-12">
                    <Form.Group className="mb-4">
                      <div className="card shadow-sm">
                        <div className="card-header bg-light">
                          <h6 className="mb-0 fw-bold">
                            <i className="fas fa-check-circle text-success me-2"></i>
                            Inclusive Items
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="d-flex mb-3">
                            <Form.Control
                              type="text"
                              value={inclusiveInput}
                              onChange={(e) => setInclusiveInput(e.target.value.replace(/,/g, ''))}
                              placeholder="Type and press Enter to add item"
                              onKeyPress={(e) =>
                                e.key === "Enter" &&
                                (e.preventDefault(), handleAddInclusive())
                              }
                              onKeyDown={(e) => {
                                if (e.key === ',') {
                                  e.preventDefault();
                                }
                              }}
                              className="form-control"
                              style={{ fontSize: "0.95rem" }}
                            />
                            <Button
                              variant="success"
                              className="ms-2 px-4 d-flex align-items-center"
                              onClick={handleAddInclusive}
                            >
                              <FiPlus className="me-2 text-white" />{" "}
                              <div className="">Add</div>
                            </Button>
                          </div>
                          <div style={{ maxHeight: "150px", overflowY: "auto" }}>
                            {inclusiveItems.length > 0 && (
                              <ul
                                className="list-group"
                                style={{ fontSize: "0.95rem" }}
                              >
                                {inclusiveItems.map((item, index) => (
                                  <li
                                    key={index}
                                    className="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-2"
                                  >
                                    <span>
                                      <FiChevronsRight className="me-2 text-success" />
                                      {item}
                                    </span>
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveInclusive(index);
                                      }}
                                      className="rounded-circle"
                                      style={{
                                        width: "28px",
                                        height: "28px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}
                                    >
                                      <FiX className="text-white" />
                                    </Button>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <div className="card shadow-sm">
                        <div className="card-header bg-light">
                          <h6 className="mb-0 fw-bold">
                            Exclusive Items
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="d-flex mb-3">
                            <Form.Control
                              type="text"
                              value={exclusiveInput}
                              onChange={(e) => setExclusiveInput(e.target.value.replace(/,/g, ''))}
                              placeholder="Type and press Enter to add item"
                              onKeyPress={(e) =>
                                e.key === "Enter" &&
                                (e.preventDefault(), handleAddExclusive())
                              }
                              onKeyDown={(e) => {
                                if (e.key === ',') {
                                  e.preventDefault();
                                }
                              }}
                              className="form-control"
                              style={{ fontSize: "0.95rem" }}
                            />
                            <Button
                              variant="danger"
                              className="ms-2 px-4 d-flex align-items-center"
                              onClick={handleAddExclusive}
                            >
                              <FiPlus className="me-2 text-white" />{" "}
                              <div className="">Add</div>
                            </Button>
                          </div>
                          <div style={{ maxHeight: "150px", overflowY: "auto" }}>
                            {exclusiveItems.length > 0 && (
                              <ul
                                className="list-group"
                                style={{ fontSize: "0.95rem" }}
                              >
                                {exclusiveItems.map((item, index) => (
                                  <li
                                    key={index}
                                    className="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-2"
                                  >
                                    <span>
                                      <FiChevronsRight className="me-2 text-danger" />
                                      {item}
                                    </span>
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveExclusive(index);
                                      }}
                                      className="rounded-circle"
                                      style={{
                                        width: "28px",
                                        height: "28px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}
                                    >
                                      <FiX className="text-white" />
                                    </Button>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    </Form.Group>
                  </div>

                  <Form.Group className="mb-4 col-12">
                    <div className="card shadow-sm">
                      <div className="card-header bg-light">
                        <h6 className="mb-0 fw-bold">
                          <i className="fas fa-list-check text-primary me-2"></i>
                          Additional Features
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="d-flex mb-3">
                          <Form.Control
                            type="text"
                            value={additionalInput}
                            onChange={(e) => setAdditionalInput(e.target.value.replace(/,/g, ''))}
                            placeholder="Type and press Enter to add item"
                            onKeyPress={(e) =>
                              e.key === "Enter" && (e.preventDefault(), handleAddAdditional())
                            }
                            onKeyDown={(e) => {
                              if (e.key === ',') {
                                e.preventDefault();
                              }
                            }}
                            className="form-control"
                            style={{ fontSize: "0.95rem" }}
                          />
                          <Button
                            variant="primary"
                            className="ms-2 px-4 d-flex align-items-center"
                            onClick={handleAddAdditional}
                          >
                            <FiPlus className="me-2 text-white" />
                            <div className="">Add</div>
                          </Button>
                        </div>
                        <div style={{ maxHeight: "150px", overflowY: "auto" }}>
                          {additionalItems.length > 0 && (
                            <ul className="list-group" style={{ fontSize: "0.95rem" }}>
                              {additionalItems.map((item, index) => (
                                <li
                                  key={index}
                                  className="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-2"
                                >
                                  <span>
                                    <FiChevronsRight className="me-2 text-primary" />
                                    {item}
                                  </span>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveAdditional(index);
                                    }}
                                    className="rounded-circle"
                                    style={{
                                      width: "28px",
                                      height: "28px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <FiX className="text-white" />
                                  </Button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  </Form.Group>



                  <Form.Group className="col-auto mx-auto">
                    <Form.Control
                      type="button"
                      value={"Update Surgery"}
                      onClick={() => {
                        updateSurgeryWithLists();
                        editsurgery();
                      }}
                      className="theme_btn"
                    />
                  </Form.Group>
                </Form>
              </div>
            </Modal.Body>
          </Modal>
        )}
      </Container>
      <ToastContainer />
      <FooterBar />
      {loading ? <Loader /> : ""}
    </>
  );
};

export default D_Surgery;
