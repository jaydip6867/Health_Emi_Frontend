import React from 'react'
import { Col, Card } from 'react-bootstrap'
import { IoCalendarOutline } from "react-icons/io5";
import { Link } from 'react-router-dom';

const BlogBox = ({ item, index }) => {
    function FormattedDate({ isoString }) {
        const formatted = new Date(isoString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });

        return <div>{formatted}</div>;
    }
    return (
        <>
            <Col key={index} xl={3} lg={4} sm={6} xs={12}>
                <Card className='rounded-4 overflow-hidden blog h-100'>
                    <Card.Img variant="top" src={item.image} />
                    <Card.Body>
                        <div className='d-flex justify-content-between blog_box'>
                            <div className='d-flex align-items-center gap-1'>
                                <img src={item?.createdBy?.profile_pic}></img>
                                <span>Dr. {item?.createdBy?.name}</span>
                            </div>
                            <div className='d-flex align-items-center gap-1'>
                                <IoCalendarOutline />
                                <FormattedDate isoString={item.createdAt} />
                            </div>
                        </div>
                        <Link to={`/blog/${item._id}`} className='stretched-link'></Link>
                        <Card.Title>{item.title}</Card.Title>
                        <Card.Text>{item.description}</Card.Text>
                    </Card.Body>
                </Card>
            </Col>
        </>
    )
}

export default BlogBox