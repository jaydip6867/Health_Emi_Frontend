import React from 'react'
import { Button, Col, Container, Image, Row } from 'react-bootstrap';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import Slider from 'react-slick';

const testimonials = [
    {
        id: 1,
        name: 'John Anderson',
        title: 'CEO at Innovate Solutions',
        image: 'https://i.imgur.com/fOKUDUJ.jpg', // Clear face image
        quote:
            'Their attention to detail and creative design approach transformed our website into a visually stunning and highly functional platform. We’ve seen a 30% increase in traffic since the relaunch. I highly recommend them to anyone seeking professional web design services!',
    },
    {
        id: 2,
        name: 'Sara Williams',
        title: 'Marketing Director at BeamTech',
        image: 'https://randomuser.me/api/portraits/women/44.jpg',
        quote:
            'Innovate Solutions delivered beyond our expectations. The interface is slick, user-friendly and traffic has just skyrocketed. A 30% increase in visits speaks volumes about their excellent work.',
    },
    {
        id: 3,
        name: 'Michael Lee',
        title: 'Product Manager at NexGen Corp',
        image: 'https://randomuser.me/api/portraits/men/32.jpg',
        quote:
            'A very creative design team that focuses on functionality and aesthetics equally. Our project workflow and client engagement have improved drastically since their redesign.',
    },
];

// Custom arrows for slick slider
const NextArrow = (props) => {
    const { onClick } = props;
    return (
        <Button
            variant="primary"
            onClick={onClick}
            className="d-flex align-items-center justify-content-center btn-next"
            style={{ width: '40px', height: '40px', borderRadius: '50%' }}
            aria-label="Next testimonial"
        >
            <FaArrowRight />
        </Button>
    );
};

const PrevArrow = (props) => {
    const { onClick } = props;
    return (
        <Button
            variant="light"
            onClick={onClick}
            className="d-flex align-items-center justify-content-center btn-prev"
            style={{ width: '40px', height: '40px', borderRadius: '50%' }}
            aria-label="Previous testimonial"
        >
            <FaArrowLeft />
        </Button>
    );
};
const Testimonial = () => {
    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1.5, // Show 1.5 slides to show half of the next slide
        slidesToScroll: 1,
        centerMode: true,
        centerPadding: '0px',
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        adaptiveHeight: true,
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1, // On smaller screens just show 1 fully
                    centerMode: false,
                    slidesToScroll: 1,
                },
            },
        ],
    };
    return (
        <>
            <Container>
                <Row className="testimonial-bg py-5 radius-20 g-4 align-items-center">

                    {/* Testimonials Slider */}
                    <Col md={8} className=''>
                        <Slider {...settings}>
                            {testimonials.map(({ id, name, title, image, quote }) => (
                                <div key={id}>
                                    <div
                                        className="p-4 shadow-sm rounded bg-white mx-2"
                                        aria-label={`Testimonial from ${name}, ${title}`}
                                    >
                                        <Row className="align-items-center mb-3">
                                            <Col xs="auto">
                                                <Image
                                                    src={image}
                                                    roundedCircle
                                                    alt={`${name}`}
                                                    width={64}
                                                    height={64}
                                                    style={{ objectFit: 'cover' }}
                                                />
                                            </Col>
                                            <Col>
                                                <h5 className="mb-0 text-primary fw-bold">{name}</h5>
                                                <small className="text-secondary">{title}</small>
                                            </Col>
                                        </Row>
                                        <p className="mb-0" style={{ color: '#444' }}>
                                            "{quote}"
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </Slider>
                    </Col>

                    {/* Title and Controls */}
                    <Col md={4} className="mb-4 mb-md-0 pe-md-5 order-first order-md-last">
                        <div className='sec_head'>
                            <span className='fs-6'>Testimonial</span>
                            <p className='h2'>Client’s Success <br />Stories</p>
                        </div>
                    </Col>
                </Row>

                {/* Optional subtle background shapes for styling */}
                <div
                    style={{
                        position: 'absolute',
                        left: '-100px',
                        bottom: '-100px',
                        width: '300px',
                        height: '300px',
                        borderRadius: '50%',
                        backgroundColor: '#cce5ff',
                        opacity: 0.3,
                        zIndex: 0,
                    }}
                    aria-hidden="true"
                ></div>
            </Container>
        </>
    )
}

export default Testimonial
