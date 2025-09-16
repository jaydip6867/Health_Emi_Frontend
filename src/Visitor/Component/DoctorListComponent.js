import { Button, Card, Col, Row } from "react-bootstrap"
import { MdArrowOutward, MdLocationOn } from "react-icons/md"
import { PiStethoscopeBold } from "react-icons/pi"
import { Link } from "react-router-dom"

const DoctorListComponents = ({ details }) => {
    // console.log(details)
    return (
        <>
            <Card
                text="secondary"
                className="p-4 my-3 rounded-4 doctor_card"
            >
                <Row className="g-3">
                    <Col xs={12} md={2}>
                        <div style={{ Width: "100", height: "auto", borderRadius: "15px" }}>
                            <img
                                src={details?.profile_pic} // Use a relevant doctor image URL or local path here
                                alt={`Dr. ${details?.name}`}
                                className="rounded-3 img-fluid"
                            />
                        </div>
                    </Col>
                    <Col xs={12} md={7}>
                        <Card.Body className="p-0">
                            <Card.Title>
                                <h4 className="mb-1 text-dark">Dr. {details?.name}</h4>
                            </Card.Title>
                            <hr/>
                            <Card.Text className="mb-1 fs-6">
                                <PiStethoscopeBold className="text-dark me-2" />
                                {details?.specialty}
                            </Card.Text>
                            <Card.Text className="fs-7" style={{ lineHeight: 1.2 }}>
                                <MdLocationOn className="text-dark me-2" />
                                {details?.city}, {details?.state}, {details?.country}, {details?.pincode}
                            </Card.Text>
                        </Card.Body>
                    </Col>
                    <Col xs={12} md={'auto'} className=" d-flex align-items-center  ms-auto">
                        <Button
                            variant="light"
                            className="d-flex align-items-center gap-5"
                            style={{ borderRadius: "20px", whiteSpace: "nowrap" }}
                        >
                            See More <span style={{ width: 30, height: 30 }} className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white"><MdArrowOutward size={20} /></span>
                        </Button>
                    </Col>
                    <Link to={`/doctorprofile/${encodeURIComponent(btoa(details._id))}`} className="m-0 stretched-link"></Link>
                </Row>
            </Card>
        </>
    )
}

export default DoctorListComponents