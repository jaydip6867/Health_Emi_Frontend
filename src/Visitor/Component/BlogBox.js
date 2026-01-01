import React, { useState } from 'react'
import { Col, Card, Carousel } from 'react-bootstrap'
import { IoCalendarOutline } from "react-icons/io5";
import { Link } from 'react-router-dom';

const BlogBox = ({ item, index }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    function FormattedDate({ isoString }) {
        const formatted = new Date(isoString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
        return <div>{formatted}</div>;
    }

    const handleSelect = (selectedIndex, e) => {
        setActiveIndex(selectedIndex);
    };

    // Ensure item.image is an array
    const images = Array.isArray(item.image) && item.image.length > 0 
        ? item.image 
        : item?.image != '' ? [item?.image] : [require('../assets/blog_thumb.jpg')];

    return (
        <Col key={index} xl={3} lg={4} sm={6} xs={12}>
            <Card className='rounded-4 overflow-hidden blog h-100'>
                <div className="position-relative">
                    <Carousel 
                        activeIndex={activeIndex} 
                        onSelect={handleSelect}
                        indicators={images.length > 1}
                        controls={false}
                        className="blog-carousel"
                    >
                        {images.map((img, imgIndex) => (
                            <Carousel.Item key={imgIndex}>
                                <img
                                    className="d-block w-100"
                                    src={img}
                                    alt={`Blog image ${imgIndex + 1}`}
                                    style={{ 
                                        height: '200px', 
                                        objectFit: 'cover',
                                        width: '100%'
                                    }}
                                />
                            </Carousel.Item>
                        ))}
                    </Carousel>
                    {images.length > 1 && (
                        <div className="position-absolute bottom-0 end-0 m-2">
                            <span className="badge bg-dark bg-opacity-50">
                                {activeIndex + 1} / {images.length}
                            </span>
                        </div>
                    )}
                </div>
                <Card.Body>
                    <div className='d-flex justify-content-between blog_box'>
                        <div className='d-flex align-items-center gap-1'>
                            <img 
                                src={item?.createdBy?.profile_pic || require('../assets/profile_icon_img.png')} 
                                alt={`Dr. ${item?.createdBy?.name}`}
                                className="rounded-circle"
                                style={{ width: '30px', height: '30px', objectFit: 'cover' }}
                            />
                            <span className="truncate-8">Dr. {item?.createdBy?.name}</span>
                        </div>
                        <div className='d-flex align-items-center  gap-1'>
                            <IoCalendarOutline className=''/>
                            <FormattedDate isoString={item.createdAt} />
                        </div>
                    </div>
                    <Link to={`/blog/${item._id}`} title={item.title} className='stretched-link d-inline'></Link>
                    <Card.Title className="text-truncate" title={item.title}>{item.title}</Card.Title>
                    <Card.Text className="truncate-2">{item.description}</Card.Text>
                </Card.Body>
            </Card>
        </Col>
    )
}

export default BlogBox;