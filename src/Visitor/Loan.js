import React, { useState, useEffect, useRef } from 'react';
import './css/loan.css'; import { LuSparkles, LuWandSparkles } from "react-icons/lu";
import { FaCalculator } from 'react-icons/fa';
import { BsCheckCircle, BsCreditCard } from 'react-icons/bs';
import { FiFileText } from 'react-icons/fi';
import { SECRET_KEY, STORAGE_KEYS } from '../config'
import { Link, useNavigate } from 'react-router-dom';
import CryptoJS from "crypto-js";
import NavBar from './Component/NavBar';
import FooterBar from './Component/FooterBar';
import { Col, Container, Row } from "react-bootstrap";

const HealthEasy = () => {

  var navigate = useNavigate();

  const [token, settoken] = useState(null)
  const [logdata, setlogdata] = useState(null)

  useEffect(() => {
    var pgetlocaldata = localStorage.getItem(STORAGE_KEYS.PATIENT);
    var dgetlocaldata = localStorage.getItem(STORAGE_KEYS.DOCTOR);
    if (pgetlocaldata != null) {
      const bytes = CryptoJS.AES.decrypt(pgetlocaldata, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      var data = JSON.parse(decrypted);
      setlogdata(data.userData);
    }
    else if (dgetlocaldata != null) {
      const bytes = CryptoJS.AES.decrypt(dgetlocaldata, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      var data = JSON.parse(decrypted);
      setlogdata(data.doctorData);
    }
    if (data) {
      settoken(`Bearer ${data.accessToken}`)
    }
  }, [navigate])
  // EMI Calculator State
  const [principal, setPrincipal] = useState(200000);
  const [rate, setRate] = useState(12);
  const [months, setMonths] = useState(12);
  const [emi, setEmi] = useState(0);

  // Calculate EMI
  useEffect(() => {
    const p = principal;
    const r = rate / 12 / 100; // Monthly interest rate
    const n = months;
    if (r === 0) {
      setEmi(p / n);
    } else {
      const emiCalc = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      setEmi(emiCalc);
    }
  }, [principal, rate, months]);

  const steps = [
    {
      id: 1,
      icon: <FiFileText size={40} />,
      title: "Apply Online",
      description:
        "Fill out a simple application form with your basic details and loan requirements.",
      color: "#6EA8FE",
    },
    {
      id: 2,
      icon: <BsCheckCircle size={40} />,
      title: "Instant Approval",
      description:
        "Get instant approval within 10 minutes. Upload minimal documents for verification.",
      color: "#4ADE80",
    },
    {
      id: 3,
      icon: <BsCreditCard size={40} />,
      title: "Receive Funds",
      description:
        "Money credited directly to your bank account. Start your treatment without delays.",
      color: "#A855F7",
    },
  ];

  const sectionRef = useRef(null);

  const handleScroll = () => {
    sectionRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <div className="health-easy-app">

      <NavBar logindata={logdata} />
      {/* Navbar */}
      {/* <nav className="navbar">
        <div className="logo">
          <span className="logo-icon">H</span> HealthEasy
        </div>
        <div className="nav-links">
          <a href="#products">Loan Products</a>
          <a href="#doctors">Find Doctors</a>
          <a href="#ambulance">Ambulance</a>
          <a href="#calculator">EMI Calculator</a>
        </div>
        <button className="btn-gradient">Apply for Loan →</button>
      </nav> */}

      {/* Hero Section */}
      <header className="hero-section">
        <Container>
          <Row className='g-4'>
            <div className="hero-content col-12 col-md-6">
              <div className="badge"><LuWandSparkles /> India's Trusted Healthcare Financing Platform</div>
              <h1>Medical Care Made <span className="highlight">Affordable & Easy</span></h1>
              <p>Get instant approval for your medical expenses with flexible EMI options. From surgeries to dental care, finance your healthcare with zero hassle.</p>
              <div className="hero-actions">
                <a className="btn-gradient" href='/apply-loan'>Get Your Loan Now →</a>
                <button className="btn-outline" onClick={handleScroll}>Calculate EMI</button>
              </div>
              <div className="hero-stats">
                <div><strong>10 min</strong><span>Quick Approval</span></div>
                <div><strong>12%*</strong><span>Starting Rate</span></div>
                <div><strong>₹10L</strong><span>Loan Amount</span></div>
              </div>
            </div>
            <div className="hero-image col-12 col-md-6">
              {/* Placeholder for the laptop/stethoscope image */}
              <div className="image-placeholder"></div>
              <div className="floating-badge ms-5 ms-lg-0"><img src={require('./assets/icon/hero right.png')} alt='Hero Right Icon' />
                <div>
                  <h6 className='mb-0'>Instant Approval</h6>
                  <span>10,000+ patients helped</span>
                </div>
              </div>
            </div>
          </Row>
        </Container>
      </header>

      {/* Products Section */}
      <section className="products-section" id="products">
        <h2>Our Healthcare Loan Products</h2>
        <p className="subtitle">One solution for all your medical financing needs. Quick, safe, and simple. Finance your healthcare anytime, anywhere.</p>

        <div className="cards-grid">
          <div className="product-card">
            {/* <div className="icon blue"></div> */}
            <img src={require('./assets/icon/Surgical Procedures.png')} alt='Surgical Procedure icon' className='mb-3' />
            <h3>Surgical Procedures</h3>
            <p>Finance major and minor surgeries with flexible EMI options. Get instant approval for planned procedures.</p>
            <Link href="/apply-loan">Apply Now →</Link>
          </div>
          <div className="product-card">
            {/* <div className="icon red"></div> */}
            <img src={require('./assets/icon/Hospital Bills.png')} alt='Hospital Bills icon' className='mb-3' />
            <h3>Hospital Bills</h3>
            <p>Cover unexpected hospital expenses instantly. Quick disbursement for emergency medical bills.</p>
            <Link href="/apply-loan">Apply Now →</Link>
          </div>
          <div className="product-card">
            {/* <div className="icon purple"></div> */}
            <img src={require('./assets/icon/Medical Treatment.png')} alt='Medical Treatment icon' className='mb-3' />
            <h3>Medical Treatment</h3>
            <p>Finance ongoing treatments and therapies. Affordable EMIs for chemotherapy, dialysis, and more.</p>
            <Link href="/apply-loan">Apply Now →</Link>
          </div>
          <div className="product-card">
            {/* <div className="icon green"></div> */}
            <img src={require('./assets/icon/Dental Care.png')} alt='Dental Care icon' className='mb-3' />
            <h3>Dental Care</h3>
            <p>Make dental treatments affordable. From root canals to cosmetic dentistry, we've got you covered.</p>
            <a href="#/apply-loan">Apply Now →</a>
          </div>
        </div>
      </section>

      <section className="products-section">
        <div className="container">
          <h2 className="loan-title">How to Get Your Medical Loan</h2>

          <p className="loan-subtitle">
            Simple, fast, and transparent process. Get your healthcare loan in
            just 3 easy steps.
          </p>

          <div className="steps-wrapper">
            {steps.map((step) => (
              <div className="step-card" key={step.id}>
                <div
                  className="icon-wrapper"
                  style={{ backgroundColor: step.color }}
                >
                  {step.icon}

                  <span className="step-number">{step.id}</span>
                </div>

                <h3>{step.title}</h3>

                <p>{step.description}</p>
              </div>
            ))}
          </div>

          {/* <div className="cta">
            <p>Ready to get started?</p>
            <a href="/">Calculate your EMI now →</a>
          </div> */}
        </div>
      </section>

      {/* EMI Calculator Section */}
      <section className="calculator-section" ref={sectionRef} >
        <div className="calc-header">
          <div className="icon-large purple"><FaCalculator /></div>
          <h2>EMI Calculator</h2>
          <p>Calculate your monthly installments and plan your medical expenses better</p>
        </div>

        <Container className="calc-container">
          <Row className='g-4'>
            <Col xs={12} md={6}>
              <div className="calc-inputs">
                <h3>Loan Details</h3>

                <div className="input-group">
                  <div className="label-row">
                    <label>Loan Amount</label>
                    <span className="value blue">₹{principal.toLocaleString()}</span>
                  </div>
                  <input type="range" min="10000" max="1000000" step="10000" value={principal} onChange={(e) => setPrincipal(Number(e.target.value))} />
                  <div className="range-labels"><span>₹10K</span><span>₹10L</span></div>
                </div>

                <div className="input-group">
                  <div className="label-row">
                    <label>Interest Rate (per annum)</label>
                    <span className="value purple">{rate}%</span>
                  </div>
                  <input type="range" min="8" max="24" step="0.5" value={rate} onChange={(e) => setRate(Number(e.target.value))} />
                  <div className="range-labels"><span>8%</span><span>24%</span></div>
                </div>

                <div className="input-group">
                  <div className="label-row">
                    <label>Loan Tenure</label>
                    <span className="value green">{months} months</span>
                  </div>
                  <input type="range" min="3" max="60" step="1" value={months} onChange={(e) => setMonths(Number(e.target.value))} />
                  <div className="range-labels"><span>3 months</span><span>60 months</span></div>
                </div>
              </div>
            </Col>
            <Col xs={12} md={6}>
              <div className="calc-result ">
                <h3>Your Monthly Installment</h3>
                <div className="emi-amount">₹{Math.round(emi).toLocaleString()}</div>
                <p>Calculated based on {rate}% interest over {months} months.</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
      <FooterBar />
    </div>
  );
};

export default HealthEasy;