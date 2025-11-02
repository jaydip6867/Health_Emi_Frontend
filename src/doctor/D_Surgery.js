import React, { useEffect, useState } from "react";
import Loader from "../Loader";
import DoctorSidebar from "./DoctorSidebar";
import DoctorNav from "./DoctorNav";
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
import { FiChevronsRight, FiPlus, FiX } from "react-icons/fi";
import { FaCheck } from "react-icons/fa";

const D_Surgery = () => {
  const SECRET_KEY = "health-emi";
  var navigate = useNavigate();
  const [loading, setloading] = useState(false);

  const [doctor, setdoctor] = useState(null);
  const [token, settoken] = useState(null);


  // State for inclusive/exclusive inputs
  const [inclusiveInput, setInclusiveInput] = useState("");
  const [exclusiveInput, setExclusiveInput] = useState("");
  const [inclusiveItems, setInclusiveItems] = useState([]);
  const [exclusiveItems, setExclusiveItems] = useState([]);

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
    }));
  };

  var surgeryobj = {
    name: "",
    price: "",
    days: "",
    additional_features: "",
    description: "",
    surgerytypeid: "",
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

  const selsurgery = (e) => {
    const { name, value } = e.target;
    setsurgery((surgery) => ({
      ...surgery,
      [name]: value,
    }));
  };

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
      setdoctor(data?.doctorData);
      settoken(`Bearer ${data?.accessToken}`);
    }
  }, [navigate]);

  useEffect(() => {
    if (token) {
      getsurgery();
      getspeciality();
      // getdoctorcategory()
    }
  }, [token]);

  function getsurgery() {
    setloading(true);
    axios({
      method: "post",
      url: "https://healtheasy-o25g.onrender.com/doctor/surgeries/list",
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
        "https://healtheasy-o25g.onrender.com/user/upload",
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
        surgery_photo: photoUrl,
      };

      const response = await axios({
        method: "post",
        url: "https://healtheasy-o25g.onrender.com/doctor/surgeries/save",
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
          url: "https://healtheasy-o25g.onrender.com/doctor/surgeries/remove",
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

    // Initialize inclusive and exclusive items from the existing surgery data
    const ed_incl_items = surgeryobj.inclusive
      ? surgeryobj.inclusive.split(",").map((item) => item.trim())
      : [];
    const ed_excl_items = surgeryobj.exclusive
      ? surgeryobj.exclusive.split(",").map((item) => item.trim())
      : [];

    setInclusiveItems(ed_incl_items);
    setExclusiveItems(ed_excl_items);
    // setSelectededitinclItems(ed_incl_items);
    // setSelectededitexclItems(ed_excl_items);

    seteditrecord(surgeryobj);
    edithandleShow();
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
          "https://healtheasy-o25g.onrender.com/user/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: token,
            },
          }
        );

        if (uploadResponse.data?.url) {
          photoUrl = uploadResponse.data.url;
        }
      }

      // Prepare the surgery data with proper formatting
      const editsurgerydata = {
        ...edit_record,
        surgery_photo: photoUrl,
        // Use the selected items if available, otherwise fallback to existing values
        inclusive: formatItems(inclusiveItems),
        exclusive: formatItems(exclusiveItems),
      };

      const response = await axios({
        method: "post",
        url: "https://healtheasy-o25g.onrender.com/doctor/surgeries/save",
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
      url: "https://healtheasy-o25g.onrender.com/doctor/surgerytypes/list",
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
    seteditrecord({ ...edit_record, surgerytypeid: id });
    // setsname(s_name.surgerytypename)
    // var d_data = d_category.filter((v, i) => {
    //     return v.surgerytypeid?._id === id
    // })
    // setdselcat(d_data);
    // console.log('edit change', s_name)
  };


  const renderTooltip = (label) => (props) => (
    <Tooltip id="button-tooltip" {...props}>
      {label} Surgery
    </Tooltip>
  );

  // Custom table styles
  const customTableStyles = {
    table: {
      style: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
      },
    },
    headCells: {
      style: {
        fontSize: '14px',
        fontWeight: '600',
        backgroundColor: '#F9FAFB',
        color: '#374151',
        borderBottom: '1px solid #E5E7EB',
        paddingTop: '16px',
        paddingBottom: '16px',
        paddingLeft: '16px',
        paddingRight: '16px',
      },
    },
    rows: {
      style: {
        borderBottom: '1px solid #F3F4F6',
        '&:hover': {
          backgroundColor: '#F9FAFB',
          cursor: 'pointer'
        },
        '&:last-child': {
          borderBottom: 'none'
        }
      },
    },
    cells: {
      style: {
        paddingTop: '16px',
        paddingBottom: '16px',
        paddingLeft: '16px',
        paddingRight: '16px',
        fontSize: '14px',
        color: '#374151'
      },
    },
    pagination: {
      style: {
        borderTop: '1px solid #E5E7EB',
        backgroundColor: '#F9FAFB'
      }
    }
  };
  // table data
  const columns = [
    {
      name: "No",
      selector: (row, index) => index + 1,
      width: "80px",
    },
    {
      name: "Surgery Name",
      selector: (row) => row.name,
      cell: (row) => (
        <div className="d-flex align-items-center flex-wrap gap-3">
          <div
            className="rounded-circle d-flex align-items-center overflow-hidden justify-content-center text-white fw-bold"
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#6366F1',
              fontSize: '14px'
            }}
          >
            <img src={row.surgery_photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <span className="fw-medium" style={{ color: '#111827' }}>{row.name}</span>
        </div>
      ),
    },
    {
      name: "Surgery Type",
      selector: (row) => row?.surgerytypeid?.surgerytypename || '',
      cell: (row) => row?.surgerytypeid?.surgerytypename,
    },
    {
      name: "Days Of Surgery",
      selector: (row) => `${row?.days || ''}`,
      cell: (row) => row?.days + ' Days',
    },
    {
      name: "Experiance",
      selector: (row) => `${row?.yearsof_experience || ''}`,
      cell: (row) => row?.yearsof_experience + ' Years',
    }, {
      name: 'Action',
      cell: row => (
        <div className="d-flex align-items-center gap-1">
          <OverlayTrigger placement="top" overlay={renderTooltip('Edit')}>
            <button
              className="btn btn-sm p-1"
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                color: '#10B981',
                borderRadius: '6px'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#F0FDF4'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              onClick={() => btnedit(row._id)}
            >
              <MdOutlineEditCalendar size={18} />
            </button>
          </OverlayTrigger>

          <OverlayTrigger placement="top" overlay={renderTooltip('Delete')}>
            <button
              className="btn btn-sm p-1"
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                color: '#EF4444',
                borderRadius: '6px'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#FEF2F2'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              onClick={() => deletesurgery(row._id)}
            >
              <MdDeleteOutline size={18} />
            </button>
          </OverlayTrigger>

          <OverlayTrigger placement="top" overlay={renderTooltip('View Details')}>
            <button
              className="btn btn-sm p-1"
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                color: '#6366F1',
                borderRadius: '6px'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#F3F4F6'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
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
      <Container fluid className="p-0 panel">
        <Row className="g-0">
          <DoctorSidebar />
          <Col xs={12} md={9} lg={10} className="p-3">
            <DoctorNav doctorname={doctor && doctor.name} />

            <div className="bg-white rounded p-3 shadow ">
              <Row className="mt-2 mb-3 justify-content-between">
                <Col xs={"auto"}>
                  <h4>My Surgeries</h4>
                </Col>
                <Col xs={"auto"}>
                  <Button variant="primary" onClick={handlesurShow}>
                    Add Surgery
                  </Button>
                </Col>
              </Row>
              <SmartDataTable
                columns={columns}
                data={surgerylist ? surgerylist : ""}
                pagination customStyles={customTableStyles}
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
                <div className="bg-white rounded p-3 shadow">
                  <Form className="row register_doctor">
                    <Form.Group controlId="type" className="mb-3 col-md-4">
                      <div className="position-relative">
                        <Form.Label>Speciality Name</Form.Label>
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
                    {/* <Form.Group controlId="type" className='mb-3 col-md-3'>
                                            <div className='position-relative'>
                                                <Form.Label>Doctor Category</Form.Label>
                                                <Form.Select name="doctorcategory" value={surgery.doctorcategory} onChange={selsurgery}>
                                                    <option value={''} selected disabled>Doctor Category</option>
                                                    {d_sel_cat?.map((v, i) => {
                                                        return (<option key={i} value={v._id}>{v.categoryname}</option>)
                                                    })}
                                                </Form.Select>
                                            </div>
                                        </Form.Group> */}
                    <Form.Group className="mb-3 col-12 col-md-8">
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
                      controlId="surgery_photo"
                      className="mb-3 col-12 col-md-3"
                    >
                      <Form.Label>Surgery Photo</Form.Label>
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="mb-2"
                      />
                      {previewUrl && (
                        <div
                          className="mt-2 position-relative"
                          style={{ display: "inline-block" }}
                        >
                          <img
                            src={previewUrl}
                            alt="Preview"
                            style={{ maxWidth: "200px", maxHeight: "200px" }}
                            className="img-thumbnail"
                          />
                          <button
                            type="button"
                            className="btn-close position-absolute"
                            style={{
                              top: "5px",
                              right: "5px",
                              backgroundColor: "white",
                              padding: "5px",
                            }}
                            onClick={removePreview}
                            aria-label="Remove preview"
                          ></button>
                        </div>
                      )}
                    </Form.Group>

                    <Form.Group
                      controlId="days"
                      className="mb-3 col-6 col-md-3"
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
                      className="mb-3 col-6 col-md-3"
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
                      className="mb-3 col-6 col-md-3"
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

                    <Form.Group
                      controlId="general_price"
                      className="mb-3 col-6 col-md-3"
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
                      className="mb-3 col-6 col-md-3"
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
                      className="mb-3 col-6 col-md-3"
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
                      className="mb-3 col-6 col-md-3"
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

                    {/* <Form.Group controlId="additional_features" className='mb-3 col-md-3'>
                                            <div className='position-relative'>
                                                <Form.Label>Features</Form.Label>
                                                <Form.Select placeholder="Ex:- 18000" name="specialty" value={surgery.specialty} onChange={selsurgery}>
                                                    <option value={''} selected disabled>Select Feature</option>
                                                    {['General', 'Semi Private', 'Private', 'Delux'].map((v) => (
                                                        <option key={v} value={v}>
                                                            {v}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </div>
                                        </Form.Group> */}

                    {/* Inclusive Section */}
                    <Form.Group className="mb-4 col-12">
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
                            Exclusive Items
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

                    <Form.Group
                      controlId="additional_features"
                      className="mb-3 col-12 col-md-6"
                    >
                      <div className="position-relative">
                        <Form.Label>additional_features</Form.Label>
                        <Form.Control
                          placeholder="Ex:- Blade-free laser option, intraocular lens implant"
                          name="additional_features"
                          value={surgery.additional_features}
                          onChange={selsurgery}
                        />
                      </div>
                    </Form.Group>

                    <Form.Group
                      controlId="description"
                      className="mb-3 col-12 col-md-6"
                    >
                      <div className="position-relative">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                          as="textarea"
                          placeholder="Ex:- Cataract surgery involves removing ...."
                          name="description"
                          value={surgery.description}
                          onChange={selsurgery}
                        />
                      </div>
                    </Form.Group>

                    <Form.Group className="col-12">
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
                  <Modal.Title>Surgery Detail</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Row className="g-3">
                    <Col xs={12} md={6}>
                      <Card className="mb-3 border-light">
                        <Card.Body>
                          <Card.Title className="label_head">Surgery Information</Card.Title>
                          <Row>
                            <Col xs={12}>
                              <div className='label_box'>
                                <span className="label_title">Surgery Name:</span>
                                <p>{v?.name}</p>
                              </div>
                            </Col>
                            <Col xs={12}>
                              <div className='label_box'>
                                <span className="label_title">Surgery Type:</span>
                                <p>{v?.surgerytypeid?.surgerytypename || 'Not Specified'}</p>
                              </div>
                            </Col>
                            <Col xs={6}>
                              <div className='label_box'>
                                <span className="label_title">Days of Surgery:</span>
                                <p>{v?.days} Days</p>
                              </div>
                            </Col>
                            <Col xs={6}>
                              <div className='label_box'>
                                <span className="label_title">Experience:</span>
                                <p>{v?.yearsof_experience} Years</p>
                              </div>
                            </Col>
                            <Col xs={12}>
                              <div className='label_box'>
                                <span className="label_title">Completed Surgeries:</span>
                                <p>{v?.completed_surgery}</p>
                              </div>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                      <Card className="mb-3 border-light">
                        <Card.Body>
                          <Card.Title className="label_head">Surgery Photo</Card.Title>
                          <div className='label_box text-center'>
                            {v?.surgery_photo ? (
                              <img
                                src={v?.surgery_photo}
                                alt="Surgery Photo"
                                style={{ maxWidth: "100%", maxHeight: "200px", objectFit: "cover" }}
                                className="img-thumbnail rounded"
                              />
                            ) : (
                              <div className="text-muted">No photo available</div>
                            )}
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col xs={12} md={6}>
                      <Card className="mb-3 border-light">
                        <Card.Body>
                          <Card.Title className="label_head">Pricing Information</Card.Title>
                          <Row>
                            <Col xs={6}>
                              <div className='label_box'>
                                <span className="label_title">General Ward:</span>
                                <p>₹{v?.general_price}</p>
                              </div>
                            </Col>
                            <Col xs={6}>
                              <div className='label_box'>
                                <span className="label_title">Semi-Private:</span>
                                <p>₹{v?.semiprivate_price}</p>
                              </div>
                            </Col>
                            <Col xs={6}>
                              <div className='label_box'>
                                <span className="label_title">Private:</span>
                                <p>₹{v?.private_price}</p>
                              </div>
                            </Col>
                            <Col xs={6}>
                              <div className='label_box'>
                                <span className="label_title">Deluxe:</span>
                                <p>₹{v?.delux_price}</p>
                              </div>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>

                      <Card className="mb-3 border-light">
                        <Card.Body>
                          <Card.Title className="label_head">Features & Description</Card.Title>
                          <Row>
                            <Col xs={12}>
                              <div className='label_box mb-3'>
                                <span className="label_title">Additional Features:</span>
                                <div className="d-flex flex-wrap gap-2">

                                  {
                                    v?.additional_features?.split(',')?.map((feature, index) => {

                                      return (
                                        <Badge
                                          className={`me-1 bg-success-subtle text-success fs-7 fw-normal px-3 py-2 rounded-pill`}
                                          key={index}
                                        >
                                          {feature}
                                        </Badge>
                                      );
                                    })
                                  }

                                </div>
                              </div>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>

                      <Card className="mb-4 border-light">
                        <Card.Body>
                          <Card.Title className="label_head">Description</Card.Title>
                          <Row>
                            <Col xs={12}>
                              <div className='label_box'>
                                <p>{v?.description || 'No description available'}</p>
                              </div>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col xs={12} md={6}>
                      <Card className="mb-4 border-light">
                        <Card.Body>
                          <Card.Title className="label_head">Inclusive Items</Card.Title>
                          <div className='label_box'>
                            {v?.inclusive ? (
                              <ul className="list-unstyled mb-0">
                                {v.inclusive.split(', ').map((item, index) => (
                                  <li key={index} className="mb-1">
                                    <svg width="15" height="10" viewBox="0 0 15 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M1.16669 5.00016L5.33335 9.16683L13.6667 0.833496" stroke="#2E7D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>

                                    <span className="ms-2">{item.trim()}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-muted mb-0">No inclusive items specified</p>
                            )}
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col xs={12} md={6}>
                      <Card className="mb-4 border-light">
                        <Card.Body>
                          <Card.Title className="label_head">Exclusive Items</Card.Title>
                          <div className='label_box'>
                            {v?.exclusive ? (
                              <ul className="list-unstyled mb-0">
                                {v.exclusive.split(',').map((item, index) => (
                                  <li key={index} className="mb-1">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M15 5L5 15" stroke="#D32F2F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                      <path d="M5 5L15 15" stroke="#D32F2F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>

                                    <span className="ms-2">{item.trim()}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-muted mb-0">No exclusive items specified</p>
                            )}
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
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
              <Form className="row register_doctor">
                <Form.Group controlId="surgerytypeid" className="mb-3 col-md-3">
                  <div className="position-relative">
                    <Form.Label>SPeciality Name</Form.Label>
                    <Form.Select
                      name="surgerytypeid"
                      value={s_type_name}
                      onChange={seditchange}
                    >
                      <option value={""}>
                        Select Surgery Type
                      </option>
                      {s_type?.map((v, i) => {
                        return (
                          <option
                            key={i}
                            value={v._id}
                            selected={
                              edit_record.surgerytypeid === v._id ? true : false
                            }
                          >
                            {v.surgerytypename}
                          </option>
                        );
                      })}
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
                <div className="col-12">
                  <Form.Group
                    controlId="edit_surgery_photo"
                    className="mb-3 col-12 col-md-3"
                  >
                    <Form.Label>Surgery Photo</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="mb-2"
                    />
                    {previewUrl ? (
                      <div
                        className="mt-2 position-relative"
                        style={{ display: "inline-block" }}
                      >
                        <img
                          src={previewUrl}
                          alt="New Preview"
                          style={{ maxWidth: "200px", maxHeight: "200px" }}
                          className="img-thumbnail"
                        />
                        <button
                          type="button"
                          className="btn-close position-absolute"
                          style={{
                            top: "5px",
                            right: "5px",
                            backgroundColor: "white",
                            padding: "5px",
                          }}
                          onClick={removePreview}
                          aria-label="Remove preview"
                        ></button>
                      </div>
                    ) : edit_record?.surgery_photo ? (
                      <div
                        className="mt-2 position-relative"
                        style={{ display: "inline-block" }}
                      >
                        <img
                          src={edit_record.surgery_photo}
                          alt="Current Surgery"
                          style={{ maxWidth: "200px", maxHeight: "200px" }}
                          className="img-thumbnail"
                        />
                      </div>
                    ) : null}
                  </Form.Group>
                </div>

                <Form.Group controlId="days" className="mb-3 col-3">
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
                  className="mb-3 col-6 col-md-3"
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

                <Form.Group controlId="general_price" className="mb-3 col-3">
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
                  className="mb-3 col-3"
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

                <Form.Group controlId="private_price" className="mb-3 col-3">
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

                <Form.Group controlId="delux_price" className="mb-3 col-3">
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

                <Form.Group
                  controlId="completed_surgery"
                  className="mb-3 col-6 col-md-3"
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
                          <i className="fas fa-times-circle text-danger me-2"></i>
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

                <Form.Group
                  controlId="additional_features"
                  className="mb-3 col-6"
                >
                  <div className="position-relative">
                    <Form.Label>additional_features</Form.Label>
                    <Form.Control
                      placeholder="Ex:- Blade-free laser option, intraocular lens implant"
                      name="additional_features"
                      value={edit_record.additional_features}
                      onChange={seleditsurgery}
                    />
                  </div>
                </Form.Group>

                <Form.Group controlId="description" className="mb-3 col-6">
                  <div className="position-relative">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      placeholder="Ex:- Cataract surgery involves removing ...."
                      name="description"
                      value={edit_record.description}
                      onChange={seleditsurgery}
                    />
                  </div>
                </Form.Group>

                <Form.Group className="mb-3 col-12">
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
            </Modal.Body>
          </Modal>
        )}
      </Container>
      <ToastContainer />
      {loading ? <Loader /> : ""}
    </>
  );
};

export default D_Surgery;
