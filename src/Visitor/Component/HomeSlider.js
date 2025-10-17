import React from 'react'
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
  return (
    <>
        <Slider {...settings}>
            {banner.map((item, index) => (
                <div key={index}>
                    <img src={item.path} alt={'banner title'+index} className='slider-img d-block' />
                </div>
            ))} 
        </Slider>
    </>
  )
}

export default HomeSlider