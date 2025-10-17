import React, { useEffect } from 'react'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import axios from 'axios';

const HomeSlider = () => {
    var settings = {
        dots: false,
        infinite: true,
        arrows: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
      };

      useEffect(() => {
        // axios
      }, [])
  return (
    <>
        <Slider {...settings}>
            <div>
                <img src={require("../assets/banner/banner1.jpg")} alt="" />
            </div>
            <div>
                <img src={require("../assets/banner/banner2.jpg")} alt="" />
            </div>
            <div>
                <img src={require("../assets/banner/banner3.jpg")} alt="" />
            </div>  
        </Slider>
    </>
  )
}

export default HomeSlider