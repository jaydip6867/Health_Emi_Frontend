import React, { useEffect, useState } from 'react'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { FaAngleLeft , FaAngleRight } from "react-icons/fa";


const HomeSlider = () => {
    const PrevArrow = (props) => {
        const { onClick } = props;
        return (
          <button type="button" className="slick-prev slick-arrow" onClick={onClick} aria-label="Previous">
            <FaAngleLeft />
          </button>
        );
      };
      const NextArrow = (props) => {
        const { onClick } = props;
        return (
          <button type="button" className="slick-next slick-arrow" onClick={onClick} aria-label="Next">
            <FaAngleRight />
          </button>
        );
      };
    var settings = {
        dots: true,
  infinite: true,
  arrows: true,
  prevArrow: <PrevArrow />,
  nextArrow: <NextArrow />,
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
                // console.log(err);
            })
    }, [])
    return (
        <>
            <Slider {...settings} className='home_slider'>
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