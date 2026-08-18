import { useEffect, useState } from "react";
import Loader from "../Loader";
import FooterBar from "./Component/FooterBar";
import NavBar from "./Component/NavBar";
import { Link, useNavigate, useParams } from "react-router-dom";
import CryptoJS from "crypto-js";
import axios from "axios";
import { Container, Row, Col, Carousel } from "react-bootstrap";
import { IoCalendarOutline } from "react-icons/io5";
import { BsClock } from "react-icons/bs";
import BlogBox from "./Component/BlogBox";
import Swal from "sweetalert2";
import { API_BASE_URL, SECRET_KEY, STORAGE_KEYS } from "../config";
import {
  MdOutlineModeComment,
  MdThumbUpAlt,
  MdThumbUpOffAlt,
} from "react-icons/md";

// ADD THESE IMPORTS
import {
  FaFacebookF,
  FaLinkedinIn,
  FaWhatsapp,
  FaXTwitter,
} from "react-icons/fa6";

const BlogDetail = () => {
  var navigate = useNavigate();
  const { id } = useParams();

  const [loading, setloading] = useState(false);

  const [token, settoken] = useState(null);
  const [blog, setblog] = useState(null);
  const [bloglist, setbloglist] = useState(null);
  const [logdata, setlogdata] = useState(null);
  const [comment, setcomment] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    var pgetlocaldata = localStorage.getItem(STORAGE_KEYS.PATIENT);
    var dgetlocaldata = localStorage.getItem(STORAGE_KEYS.DOCTOR);
    var data = null;

    if (pgetlocaldata != null) {
      const bytes = CryptoJS.AES.decrypt(pgetlocaldata, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      data = JSON.parse(decrypted);
      setlogdata(data.userData);
    } else if (dgetlocaldata != null) {
      const bytes = CryptoJS.AES.decrypt(dgetlocaldata, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      data = JSON.parse(decrypted);
      setlogdata(data.doctorData);
    }

    if (data) {
      settoken(`Bearer ${data.accessToken}`);
    }

    getblogdetail();
    getblog();
  }, [navigate]);

  function getblogdetail() {
    setloading(true);

    axios({
      method: "post",
      url: `${API_BASE_URL}/user/blogs/getone`,
      headers: {
        Authorization: token,
      },
      data: {
        blogid: id,
      },
    })
      .then((res) => {
        setblog(res.data.Data);
      })
      .catch(function (error) { })
      .finally(() => {
        setloading(false);
      });
  }

  function FormattedDate({ isoString }) {
    const formatted = new Date(isoString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return <div>{formatted}</div>;
  }

  function getblog() {
    setloading(true);

    axios({
      method: "post",
      url: `${API_BASE_URL}/user/blogs`,
      headers: {
        Authorization: token,
      },
      data: {
        page: 1,
        limit: 4,
        search: "",
      },
    })
      .then((res) => {
        setbloglist(res.data.Data.docs);
      })
      .catch(function (error) { })
      .finally(() => {
        setloading(false);
      });
  }

  function likeblog(blogid) {
    if (logdata.logintype === "patient") {
      setloading(true);

      axios({
        method: "post",
        url: `${API_BASE_URL}/user/blogs/like`,
        headers: {
          Authorization: token,
        },
        data: {
          blogid: blogid,
        },
      })
        .then((res) => {
          getblogdetail();

          Swal.fire({
            icon: "success",
            title: "Blog Liked",
          });
        })
        .catch(function (error) { })
        .finally(() => {
          setloading(false);
        });
    } else {
      Swal.fire({
        icon: "info",
        title: "Patient Login",
        text: "please login to patient for like this blog",
      });
    }
  }

  function sendcomment() {
    if (logdata?.logintype !== "patient") {
      Swal.fire({
        icon: "info",
        title: "Patient Login",
        text: "please login to patient for comment on this blog",
      });
      return;
    }

    const already = blog?.allcomments?.some(
      (c) => c?.userid?._id === logdata?._id
    );

    if (already) {
      Swal.fire({
        icon: "info",
        title: "Comment already added",
        text: "you can add only one comment on this blog",
      });
      return;
    }

    if (!comment.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Enter comment",
      });
      return;
    }

    setloading(true);

    axios({
      method: "post",
      url: `${API_BASE_URL}/user/blogs/comment`,
      headers: {
        Authorization: token,
      },
      data: {
        blogid: id,
        message: comment.trim(),
      },
    })
      .then((res) => {
        setcomment("");
        getblogdetail();

        Swal.fire({
          icon: "success",
          title: "Comment added",
        });
      })
      .catch(function (error) { })
      .finally(() => {
        setloading(false);
      });
  }

  const handleSelect = (selectedIndex, e) => {
    setActiveIndex(selectedIndex);
  };

  // =========================================================
  // SHARE BLOG FUNCTION
  // =========================================================

  const shareBlog = (platform) => {
    const shareUrl = blog?.url || window.location.href;

    const shareTitle =
      blog?.meta_title ||
      blog?.title ||
      "Check out this blog";

    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(shareTitle);

    let url = "";

    switch (platform) {
      case "whatsapp":
        url = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
        break;

      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;

      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
        break;

      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;

      default:
        return;
    }

    window.open(
      url,
      "_blank",
      "width=650,height=550,noopener,noreferrer"
    );
  };

  const images =
    Array.isArray(blog?.image) && blog?.image.length > 0
      ? blog?.image
      : blog?.image != ""
        ? [blog?.image]
        : [require("../Visitor/assets/blog_thumb.jpg")];

  return (
    <>
      <NavBar logindata={logdata} />

      {/* breadcrumb section */}
      <section className="breadcrumb_Sec">
        <Container className="text-center">
          <h2>Blog Detail</h2>
        </Container>
      </section>

      {/* blog detail */}
      <section className="py-5">
        <Container>
          <Row>
            <Col xs={12} md={6}>
              <Carousel
                activeIndex={activeIndex}
                onSelect={handleSelect}
                indicators={images.length > 1}
                controls={images.length > 1}
                className="blog-carousel"
              >
                {images.map((img, imgIndex) => (
                  <Carousel.Item key={imgIndex}>
                    <img
                      className="d-block img-fluid w-100"
                      src={img}
                      alt={`Blog image ${imgIndex + 1}`}
                      style={{
                        height: "400px",
                        objectFit: "cover",
                        width: "100%",
                      }}
                    />
                  </Carousel.Item>
                ))}
              </Carousel>
            </Col>

            <Col xs={12} md={6} className="blog">
              {/* Blog Title */}
              <h2 className="blog-detail-title">{blog?.title}</h2>

              {/* Author + Date */}
              <div className="blog-detail-meta">
                <Link
                  to={`/doctorprofile/${encodeURIComponent(
                    btoa(blog?.createdBy?._id)
                  )}`}
                  className="blog-author"
                >
                  <img
                    src={
                      blog?.createdBy?.profile_pic ||
                      require("./assets/profile_icon_img.png")
                    }
                    alt={`${blog?.createdBy?.name} profile`}
                  />

                  <div>
                    <span className="author-label">Written by</span>
                    <strong>Dr. {blog?.createdBy?.name}</strong>
                  </div>
                </Link>

                <div className="blog-date">
                  <IoCalendarOutline />
                  <FormattedDate isoString={blog?.createdAt} />
                </div>
              </div>

              {/* Expiry */}
              {blog?.expirydate && (
                <div className="blog-expiry">
                  <div className="expiry-icon">
                    <BsClock />
                  </div>

                  <div>
                    <span>Available Until</span>
                    <strong>{blog?.expirydate}</strong>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="blog-description">
                <p>{blog?.description}</p>
              </div>

              {/* Tags */}
              {blog?.tags?.length > 0 && (
                <div className="blog-tags">
                  {blog.tags.map((tag, index) => (
                    <span key={index}>#{tag}</span>
                  ))}
                </div>
              )}

              {/* Like / Comment */}
              <div className="blog-actions">
                <button
                  type="button"
                  className={`blog-action ${blog?.is_like ? "liked" : ""
                    }`}
                  onClick={() => !blog?.is_like && likeblog(blog?._id)}
                >
                  {blog?.is_like ? (
                    <MdThumbUpAlt />
                  ) : (
                    <MdThumbUpOffAlt />
                  )}

                  <span>{blog?.totalLike || 0}</span>
                </button>

                <div className="blog-action">
                  <MdOutlineModeComment />
                  <span>{blog?.totalComment || 0}</span>
                </div>
              </div>

              {/* Read Original Article */}
              {blog?.url && (
                <a
                  href={blog.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="read-article-btn"
                >
                  Read Full Article
                  <span>↗</span>
                </a>
              )}

              {/* Share */}
              <div className="blog-share-box">
                <div className="share-content">
                  <div className="share-text">
                    <h5>Share this blog</h5>
                    <p>Share this article with your friends</p>
                  </div>

                  <div className="blog-share-buttons">
                    <button
                      type="button"
                      className="share-social-btn whatsapp"
                      onClick={() => shareBlog("whatsapp")}
                    >
                      <FaWhatsapp />
                    </button>

                    <button
                      type="button"
                      className="share-social-btn facebook"
                      onClick={() => shareBlog("facebook")}
                    >
                      <FaFacebookF />
                    </button>

                    <button
                      type="button"
                      className="share-social-btn twitter"
                      onClick={() => shareBlog("twitter")}
                    >
                      <FaXTwitter />
                    </button>

                    <button
                      type="button"
                      className="share-social-btn linkedin"
                      onClick={() => shareBlog("linkedin")}
                    >
                      <FaLinkedinIn />
                    </button>
                  </div>
                </div>
              </div>

              {/* Comment Input */}
              <div className="blog_message d-flex align-items-center gap-2 mt-4">
                <input
                  type="text"
                  placeholder="Write your comment..."
                  value={comment}
                  className="form-control"
                  onChange={(e) => setcomment(e.target.value)}
                />

                <button
                  className="btn btn_gradient btn-primary"
                  onClick={sendcomment}
                >
                  Send
                </button>
              </div>

              {/* Comments */}
              <div className="blog_comment_list">
                {blog?.allcomments?.map((item, index) => (
                  <div key={index} className="blog-comment">
                    <div className="comment-header">
                      <div className="comment-user">
                        <img
                          src={
                            item?.userid?.profile_pic ||
                            require("./assets/profile_icon_img.png")
                          }
                          alt={`${item?.userid?.name} profile`}
                        />

                        <div>
                          <strong>{item?.userid?.name}</strong>
                          <span>
                            <FormattedDate isoString={item?.createdAt} />
                          </span>
                        </div>
                      </div>
                    </div>

                    <p>{item?.message}</p>
                  </div>
                ))}
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Related Blogs */}
      <hr />
      {/* blog list */}
      <section className="py-5">
        <Container>
          <Row className="g-4">
            {bloglist?.map((item, index) => (
              <BlogBox item={item} index={index} key={index} />
            ))}
          </Row>
        </Container>
      </section>

      {loading && <Loader />}

      <FooterBar />
    </>
  );
};

export default BlogDetail;