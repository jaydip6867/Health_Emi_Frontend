import React, { useEffect, useState } from 'react'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import axios from 'axios';
import { API_BASE_URL } from '../../config';

const HomeSlider = () => {
    var settings = {
        dots: false,
        infinite: true,
        arrows: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        pauseOnHover: true,
        cssEase: "linear"
    };
    const [banner, setBanner] = useState([]);
    useEffect(() => {
        axios.get(`${API_BASE_URL}/user/banner`)
            .then((res) => {
                // console.log(res.data.Data.banners);
                setBanner(res.data.Data.banners);
            })
            .catch((err) => {
                console.log(err);
            })
    }, [])
    return (
        <>
            <Slider {...settings}>
                {banner.map((item, index) => (
                    <div key={index}>
                        <img src={item.path} alt={'banner title' + index} className='slider-img d-block' />
                    </div>
                ))}
            </Slider>
        </>
    )
}

export default HomeSlider