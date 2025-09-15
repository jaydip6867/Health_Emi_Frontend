import React, { useState } from "react";
import {
    Container,
    Row,
    Col,
    Card,
    Image,
    Button,
    ButtonGroup,
    ToggleButton,
    ListGroup,
    Form,
    Badge,
} from "react-bootstrap";
import {
    BsPeopleFill,
    BsTelephoneFill,
    BsAwardFill,
    BsCalendarCheckFill,
    BsCurrencyRupee,
    BsCheckCircleFill,
    BsTruck,
    BsStars,
    BsArrowLeft,
    BsArrowRight,
} from "react-icons/bs";
import NavBar from "./Component/NavBar";
import FooterBar from "./Component/FooterBar";

const consultationTypes = [
    { id: "clinic", label: "Clinic Visit", price: 1200, icon: BsCalendarCheckFill },
    { id: "home", label: "Home Visit", price: 1500, icon: BsCalendarCheckFill },
    { id: "eopd", label: "EOPD", price: 1800, icon: BsCalendarCheckFill },
];

const dates = [
    { id: "15/07", label: "15/07" },
    { id: "16/07", label: "16/07" },
    { id: "17/07", label: "17/07" },
];

const hours = [
    { label: "09.00 AM", disabled: false },
    { label: "09.30 AM", disabled: false },
    { label: "10.00 AM", disabled: false },
    { label: "10.30 AM", disabled: false },
    { label: "11.00 AM", disabled: false },
    { label: "11.30 AM", disabled: false },
    { label: "3.00 PM", disabled: false },
    { label: "3.30 PM", disabled: true },
    { label: "4.00 PM", disabled: false },
    { label: "4.30 PM", disabled: false },
    { label: "5.00 PM", disabled: false },
    { label: "5.30 PM", disabled: false },
];

const surgeries = [
    {
        id: 1,
        name: "Surgery Name",
        type: "Surgery Type",
        days: "Days of Surgery",
        img:
            "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
        id: 2,
        name: "Surgery Name",
        type: "Surgery Type",
        days: "Days of Surgery",
        img:
            "https://randomuser.me/api/portraits/women/47.jpg",
    },
    {
        id: 3,
        name: "Surgery Name",
        type: "Surgery Type",
        days: "Days of Surgery",
        img:
            "https://randomuser.me/api/portraits/men/56.jpg",
    },
    {
        id: 4,
        name: "Surgery Name",
        type: "Surgery Type",
        days: "Days of Surgery",
        img:
            "https://randomuser.me/api/portraits/women/50.jpg",
    },
    {
        id: 5,
        name: "Surgery Name",
        type: "Surgery Type",
        days: "Days of Surgery",
        img:
            "https://randomuser.me/api/portraits/women/15.jpg",
    },
    {
        id: 6,
        name: "Surgery Name",
        type: "Surgery Type",
        days: "Days of Surgery",
        img:
            "https://randomuser.me/api/portraits/men/12.jpg",
    },
];

const hospitals = [
    {
        id: 1,
        name: "PP Savani Hospital",
        address: "Varachha Road, Near Kapodara Police Station, Surat.",
    },
    {
        id: 2,
        name: "PP Savani Hospital",
        address: "Varachha Road, Near Kapodara Police Station, Surat.",
    },
];

export default function DoctorProfile() {
    const [consultationType, setConsultationType] = useState("clinic");
    const [selectedDate, setSelectedDate] = useState("16/07");
    const [selectedHour, setSelectedHour] = useState("10.00 AM");

    const IconWithText = ({ icon: Icon, title, value, color }) => (
        <div className="d-flex align-items-center gap-2">
            <div
                className="d-flex justify-content-center align-items-center rounded-circle"
                style={{
                    backgroundColor: color,
                    width: 40,
                    height: 40,
                    fontSize: 20,
                    color: "white",
                }}
            >
                <Icon />
            </div>
            <div className="text-center">
                <div className="fw-bold" style={{ fontSize: 14 }}>
                    {value}
                </div>
                <div style={{ fontSize: 12, color: "#6c757d" }}>{title}</div>
            </div>
        </div>
    );

    return (
        <>
            <NavBar />
            <Container className="p-4">
                {/* Header Card */}
                <Card className="mb-4 shadow-sm rounded-3">
                    <Card.Body>
                        <Row className="align-items-center">
                            <Col xs="auto">
                                <Image
                                    src="https://randomuser.me/api/portraits/men/75.jpg"
                                    roundedCircle
                                    width={130}
                                    height={130}
                                    alt="doctor"
                                />
                            </Col>
                            <Col md={5}>
                                <h5 className="mb-0 fw-bold">Dr. Jaydeep Thummar</h5>
                                <small className="text-muted">Cardiologist (MBBS)</small>
                                <hr className="my-2" />
                                <div className="d-flex flex-column gap-1" style={{ fontSize: 13 }}>
                                    <div>
                                        <i className="bi bi-building"></i> Golden Cardiology Center
                                    </div>
                                    <div>
                                        <i className="bi bi-envelope"></i> cdmi.design3@gmail.com
                                    </div>
                                    <div>
                                        <i className="bi bi-telephone"></i> 8596748596
                                    </div>
                                </div>
                            </Col>
                            <Col md={5}>
                                <Row>
                                    <Col xs={6} className="mb-3">
                                        <IconWithText
                                            icon={BsTelephoneFill}
                                            value="2,000+"
                                            title="Consultant"
                                            color="#344D67"
                                        />
                                    </Col>
                                    <Col xs={6} className="mb-3">
                                        <IconWithText
                                            icon={BsCheckCircleFill}
                                            value="6"
                                            title="Surgeries"
                                            color="#687B9F"
                                        />
                                    </Col>
                                    <Col xs={6}>
                                        <IconWithText
                                            icon={BsAwardFill}
                                            value="10+ Years"
                                            title="Experience"
                                            color="#72B686"
                                        />
                                    </Col>
                                    <Col xs={6}>
                                        <IconWithText
                                            icon={BsStars}
                                            value="5"
                                            title="Rating"
                                            color="#FDAD40"
                                        />
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                <Row>
                    {/* Left side content */}
                    <Col lg={7}>
                        {/* About me */}
                        <Card className="mb-4 rounded-3" style={{ backgroundColor: "#f8f9fa" }}>
                            <Card.Body>
                                <h6 className="fw-bold mb-3">About me</h6>
                                <Card.Text
                                    style={{
                                        fontSize: 14,
                                        color: "#495057",
                                        maxHeight: 108,
                                        overflow: "hidden",
                                    }}
                                >
                                    Dr. David Patel, a dedicated cardiologist, brings a wealth of experience
                                    to Golden Gate Cardiology Center in Golden Gate, CA.Dr. David Patel, a dedicated cardiologist,
                                    brings a wealth of experience to Golden Gate Cardiology Center in Golden Gate, CA.Dr. David Patel,
                                    a dedicated cardiologist, brings a wealth of experience to Golden Gate Cardiology Center in Golden
                                    Gate, CA.Dr. David Patel, a dedicated cardiologist, brings a wealth of experience to Golden Gate
                                    Cardiology Center in Golden Gate, CA.{" "}
                                    <a href="#!" style={{ textDecoration: "none" }}>
                                        view more
                                    </a>
                                </Card.Text>
                            </Card.Body>
                        </Card>

                        {/* Surgeries */}
                        <h6 className="fw-bold mb-3">Surgeries</h6>
                        <Row xs={1} md={2} className="g-3 mb-4">
                            {surgeries.map(({ id, name, type, days, img }) => (
                                <Col key={id}>
                                    <Card className="h-100 rounded-3">
                                        <Row className="g-0 align-items-center">
                                            <Col xs={4}>
                                                <Image
                                                    rounded
                                                    fluid
                                                    src={img}
                                                    alt="surgery"
                                                    style={{ objectFit: "cover", height: "100%" }}
                                                />
                                            </Col>
                                            <Col xs={8}>
                                                <Card.Body className="py-2 px-3">
                                                    <Card.Title className="mb-1" style={{ fontSize: 15 }}>
                                                        <b>{name}</b>
                                                    </Card.Title>
                                                    <Card.Subtitle className="text-muted" style={{ fontSize: 13 }}>
                                                        {type}
                                                    </Card.Subtitle>
                                                    <Card.Text className="text-muted mb-0" style={{ fontSize: 13 }}>
                                                        {days}
                                                    </Card.Text>
                                                </Card.Body>
                                            </Col>
                                        </Row>
                                    </Card>
                                </Col>
                            ))}
                        </Row>

                        {/* Hospitals */}
                        <h6 className="fw-bold mb-3">Hospitals</h6>
                        <Row xs={1} md={2} className="mb-4">
                            {hospitals.map(({ id, name, address }) => (
                                <Col key={id}>
                                    <Card className="p-3 rounded-3 border-1 border-light shadow-none mb-3">
                                        <h6 className="mb-1 fw-semibold">{name}</h6>
                                        <small className="text-muted">{address}</small>
                                    </Card>
                                </Col>
                            ))}
                        </Row>

                        {/* Reviews */}
                        <h6 className="fw-bold mb-3">Reviews</h6>
                        <Card className="p-3 rounded-3 border-1 border-light shadow-none">
                            <Row className="align-items-center g-3 mb-2">
                                <Col xs="auto">
                                    <Image
                                        roundedCircle
                                        src="https://randomuser.me/api/portraits/women/68.jpg"
                                        alt="reviewer"
                                        width={40}
                                        height={40}
                                    />
                                </Col>
                                <Col>
                                    <div className="d-flex align-items-center gap-2">
                                        <b>Bharti patel</b>
                                        <Badge bg="info" pill className="text-white" style={{ fontSize: 12 }}>
                                            Verified
                                        </Badge>
                                    </div>
                                    <div className="d-flex align-items-center gap-1" style={{ fontSize: 13, color: "#FDAD40" }}>
                                        <BsStars />
                                        <BsStars />
                                        <BsStars />
                                        <BsStars />
                                        <BsStars />
                                        <span className="ms-1" style={{ color: "#000", fontWeight: "600" }}>
                                            5.0
                                        </span>
                                    </div>
                                </Col>
                            </Row>
                            <Card.Subtitle className="mb-1" style={{ fontWeight: "600" }}>
                                Visit For Root Canal Treatment
                            </Card.Subtitle>
                            <Card.Text style={{ fontSize: 14, color: "#555" }}>
                                I had a lot of pain in my tooth which got resolved in just one sitting. Earlier I have had a bad
                                experience with dentists but after getting my treatment done here I have overcome my fears. The doctor
                                is very good in her work and also explained how to take care of my teeth after treatment.
                            </Card.Text>
                        </Card>
                    </Col>

                    {/* Right side consultation box */}
                    <Col lg={5}>
                        <Card className="shadow-sm rounded-3">
                            <Card.Body>
                                <h6 className="fw-bold mb-3">Select Consultation Type</h6>
                                <ButtonGroup className="mb-4 w-100 gap-3 justify-content-center">
                                    {consultationTypes.map(({ id, label, price, icon: Icon }) => (
                                        <Button
                                            variant={consultationType === id ? "light" : "outline-secondary"}
                                            key={id}
                                            className="d-flex flex-column align-items-center p-3 rounded-3"
                                            onClick={() => setConsultationType(id)}
                                            style={{
                                                borderWidth: consultationType === id ? 2 : 1,
                                                minWidth: 100,
                                                color: consultationType === id ? "#2154AF" : "#6C757D",
                                            }}
                                        >
                                            <Icon
                                                size={24}
                                                style={{
                                                    marginBottom: 5,
                                                    color: consultationType === id ? "#2154AF" : "#6C757D",
                                                }}
                                            />
                                            <div style={{ fontSize: 14, fontWeight: "600" }}>{label}</div>
                                            <small style={{ fontSize: 11, color: "#6c757d" }}>₹ {price}</small>
                                        </Button>
                                    ))}
                                </ButtonGroup>

                                {/* Book Consultation */}
                                <div>
                                    <Button
                                        variant="light"
                                        className="d-flex align-items-center gap-2 mb-3 px-0"
                                        style={{ fontWeight: "600", fontSize: 14 }}
                                        onClick={() => alert("Go back action")}
                                    >
                                        <BsArrowLeft size={20} />
                                        Back
                                    </Button>

                                    <h6 className="fw-bold mb-3">Book Consultation</h6>

                                    {/* Select Date */}
                                    <div className="mb-3">
                                        <Form.Label className="fw-semibold mb-2">Select Date</Form.Label>
                                        <ButtonGroup className="w-100 d-flex gap-2">
                                            <Button
                                                variant="outline-secondary"
                                                onClick={() => alert("Prev")}
                                                className="d-flex align-items-center"
                                            >
                                                <BsArrowLeft />
                                            </Button>
                                            {dates.map(({ id, label }) => (
                                                <ToggleButton
                                                    key={id}
                                                    type="radio"
                                                    variant={selectedDate === id ? "dark" : "outline-secondary"}
                                                    name="date"
                                                    value={id}
                                                    checked={selectedDate === id}
                                                    onChange={(e) => setSelectedDate(e.currentTarget.value)}
                                                    className="flex-fill"
                                                >
                                                    {label}
                                                </ToggleButton>
                                            ))}
                                            <Button
                                                variant="outline-secondary"
                                                onClick={() => alert("Next")}
                                                className="d-flex align-items-center"
                                            >
                                                <BsArrowRight />
                                            </Button>
                                        </ButtonGroup>
                                    </div>

                                    {/* Select Hour */}
                                    <div className="mb-4">
                                        <Form.Label className="fw-semibold mb-2">Select Hour</Form.Label>
                                        <ButtonGroup className="w-100 d-flex flex-wrap gap-2">
                                            {hours.map(({ label, disabled }) => (
                                                <ToggleButton
                                                    key={label}
                                                    type="radio"
                                                    variant={
                                                        selectedHour === label ? "dark" : disabled ? "outline-secondary" : "outline-dark"
                                                    }
                                                    name="hour"
                                                    value={label}
                                                    checked={selectedHour === label}
                                                    disabled={disabled}
                                                    onChange={(e) => setSelectedHour(e.currentTarget.value)}
                                                    className="px-3 py-2 rounded-2"
                                                    style={{ fontSize: 13, minWidth: 80 }}
                                                >
                                                    {label}
                                                </ToggleButton>
                                            ))}
                                        </ButtonGroup>
                                    </div>

                                    <Button
                                        variant="dark"
                                        className="w-100 py-2 fw-semibold"
                                        onClick={() =>
                                            alert(
                                                `Booked consultation on ${selectedDate} at ${selectedHour} (${consultationType.toUpperCase()})`
                                            )
                                        }
                                    >
                                        Book Consultation
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
            <FooterBar />
        </>
    );
}