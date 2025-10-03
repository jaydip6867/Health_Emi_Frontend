import React from 'react'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from 'react-slick';
import { Col } from 'react-bootstrap';

const DoctorTestimonial = () => {
    var doctor_testimonial = {
        dots: true,
        infinite: true,
        arrows: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
    };
    return (
        <>
            <Col md={{ span: 5, offset: 1 }} className="d-none d-lg-block">
                <Slider {...doctor_testimonial} className='slider_doctor'>
                    <div className='item text-center'>
                        <img src={require('./assets/doctor_testimonial_1.png')} />
                        <div className='doctor_testi_content'>
                            <h4>Thousands of Specialists</h4>
                            <p>Get medical advice and treatment service from Specialists doctor from any time</p>
                        </div>
                    </div>
                    <div className='item text-center'>
                        <img src={require('./assets/doctor_testimonial_2.png')} />
                        <div className='doctor_testi_content'>
                            <h4>Advice nearest Doctors</h4>
                            <p>Find the best doctor and make appointment near to your area or any others location</p>
                        </div>
                    </div>
                    <div className='item text-center'>
                        <img src={require('./assets/doctor_testimonial_3.png')} />
                        <div className='doctor_testi_content'>
                            <h4>Connect with doctor</h4>
                            <p>Consult your problem with doctors and easy to connected for your better treatment </p>
                        </div>
                    </div>

                </Slider>
            </Col>
        </>
    )
}

export default DoctorTestimonial