import { useEffect, useState } from "react";
import FooterBar from "./Component/FooterBar";
import { useNavigate } from "react-router-dom";
import { SECRET_KEY, STORAGE_KEYS } from '../config'
import CryptoJS from "crypto-js";
import NavBar from "./Component/NavBar";
import { Container, Row, Col, Nav, Accordion } from "react-bootstrap";

function Terms() {
    var navigate = useNavigate();

    const [logdata, setlogdata] = useState(null)
    const [token, settoken] = useState(null)

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

    useEffect(() => {
        document.title = "About Health Easy EMI - Our Terms & Conditions"
    }, [])

    const [activeTab, setActiveTab] = useState('Doctor T&C')

    return (
        <>
            <NavBar logindata={logdata} />
            {/* breadcrumb section */}
            <section className='breadcrumb_Sec'>
                <Container className='text-center '>
                    <h2>Terms & Conditions</h2>
                </Container>
            </section>

            {/* faq section */}
            <section className='spacer-y'>
                <Container>
                    <Row className='justify-content-center'>
                        <Col lg={12}>
                            <Nav variant="pills" className="faq-tabs gap-2 mb-4" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                                <Nav.Item>
                                    <Nav.Link className='d-block text-nowrap' eventKey="Doctor T&C">Doctor T&C</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link className='d-block text-nowrap' eventKey="Doctor Telemedicine T&C">Doctor Telemedicine T&C</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link className='d-block text-nowrap' eventKey="Healthcare Financing & EMI">Healthcare Financing & EMI</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link className='d-block text-nowrap' eventKey="Ambulance & Emergency Services">Ambulance & Emergency Services</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link className='d-block text-nowrap' eventKey="For Hospitals, Clinics & Partners">For Hospitals, Clinics & Partners</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link className='d-block text-nowrap' eventKey="Data Security & Support">Data Security & Support</Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Col>
                        <Col lg={12}>
                            {activeTab === 'Doctor T&C' && (
                                <div className="p-3 border rounded-4">
                                    <p>Arogya mantra Private Limited (“Healtheasy emi”) is providing online medical teleconsultation services through its medical practitioners (“Practitioner”) as per the terms and conditions mentioned below. the brand name ‘Healtheasy emi’ provides the said Services (as defined below) through https://www.healtheasy emi.com/consult and the mobile application ‘Healtheasy emi’ (together, “Website”). </p>
                                    <Accordion defaultActiveKey="0" className='faq-accordion'>
                                        <Accordion.Item eventKey="0">
                                            <Accordion.Header>1. NATURE AND APPLICABILITY OF TERMS:</Accordion.Header>
                                            <Accordion.Body>
                                                <p>Please carefully go through these terms and conditions (“Terms”) and the privacy policy available at https://www.healtheasy emi.com/company/privacy (“Privacy Policy”) before you decide to access the Website or avail the services from HEALTHEASY EMI. These Terms and the Privacy Policy together constitute a legal agreement (“Agreement”) between you and HEALTHEASY EMI in relation to the Services (as defined below).</p>
                                                <div className="ps-3 pb-2">
                                                    <h6>The Agreement applies to:</h6>
                                                    <ul className="list_disc">
                                                        <li>- A patient, his/her representatives or affiliates, seeking healthcare services including searching for Practitioners through the Website (“End-User”, “you” or “User”); or</li>
                                                        <li>- Otherwise, a user of the Website (“you” or “User”).</li>
                                                    </ul>
                                                </div>
                                                <p>This Agreement applies to online medical teleconsultation services provided by HEALTHEASY EMI through its Practioners on the Website (“Services”). The Services may change from time to time, at the sole discretion of HEALTHEASY EMI, and the Agreement at the time will apply to you for availing the Services.
                                                    HEALTHEASY EMI reserves the right to modify or terminate any portion of the Agreement for any reason and at any time. You should read the Agreement at regular intervals. Your continued use of the Services following any such modification constitutes your agreement to follow and be bound by the Agreement so modified. If you do not agree with any part of the Agreement, please do not use the Website or avail any Services.
                                                </p>
                                                <div className="ps-3">
                                                    <h6>The Agreement is published in compliance of, and is governed by the provisions of Indian law, including but not limited to:</h6>
                                                    <ul className="list_disc">
                                                        <li>the Indian Contract Act, 1872</li>
                                                        <li>the (Indian) Information Technology Act, 2000</li>
                                                        <li>the Telemedicine Guidelines part of the Indian Medical Council (Professional Conduct, Etiquette and Ethics Regulation, 2002</li>
                                                    </ul>
                                                </div>
                                            </Accordion.Body>
                                        </Accordion.Item>
                                        <Accordion.Item eventKey="1">
                                            <Accordion.Header>2. DOCTOR CONSULT</Accordion.Header>
                                            <Accordion.Body>
                                                <div className="ps-3">
                                                    <ul>
                                                        <li>
                                                            <h6>A.	Definition:</h6>
                                                            <p>Consult is a Service provided by HEALTHEASY EMI that allows Users to seek medical consultation by communicating with its registered Practitioners on the Website/ platform. The Practitioner is assigned by HEALTHEASY EMI based on multiple parameters such as date and time of consultation request placed by the user, health problems etc. via the system’s algorithm/software-program that identifies the most relevant Practitioner, or the Users may also choose the Practitioner through search options made available on the Website/platform. The scope of this feature as detailed herein is collectively referred to as "Consult".</p>
                                                        </li>
                                                        <li>
                                                            <h6>B.	Terms for Users:</h6>
                                                            <p>The Users expressly understand, acknowledge and agree to the following set forth herein below:</p>
                                                            <div className="ps-3">
                                                                <ul className="list_roman">
                                                                    <li>HEALTHEASY EMI assigns its Practitioners through the system’s algorithm/software-program, which identifies the most relevant Practitioner. In some cases, the Users can choose the Practitioner of choice through the search options made available on the Website / platform.</li>
                                                                    <li>In case any prescription is being provided to the User by the Practitioner, the same is being provided basis the online consultation, however it may vary when examined in person, hence, in no event shall the prescription provided by Practitioners be relied upon as a final and conclusive solution.</li>
                                                                    <li>The Users agree to use the advice from Practitioner on the Website subject to:
                                                                        <ul className="list_disc">
                                                                            <li>an ongoing treatment with their medical practitioner;</li>
                                                                            <li>a condition which does not require emergency treatment, physical examination or medical attention;</li>
                                                                            <li>medical history available as records with them for reference;</li>
                                                                            <li>a record of physical examination and report thereof with them, generated through their local medical practitioner;</li>
                                                                            <li>consultation with their medical practitioner before abandoning or modifying their ongoing treatment.</li>
                                                                        </ul>
                                                                    </li>
                                                                    <li>The User agrees that by using Consult, the Practitioners will not be conducting physical examination of the Users, hence, they may not have or be able to gain important information that is usually obtained through a physical examination. User acknowledges and agrees that he/she is aware of this limitation and agrees to assume the complete risk of this limitation.</li>
                                                                    <li>The User understands that Consult shall not form a substitute for treatment that otherwise needs physical examination/immediate consultation. Further, the User understands that the advice provided by the Practitioner is based on general medical conditions and practices prevalent in India, and to the best of his knowledge and ability, and not for conditions which are territory specific i.e., for regions other than India, irrespective of location where the User is procuring medical services or engaging in communication with the Practitioner.</li>
                                                                    <li>During the consultation and thereafter, the Practitioner may upload the prescription/health records of the User on the account of the User on the Website for access by the User. However, it is expressly clarified that for Users who are not located within India and using Consult, the Practitioner may or may not issue a prescription, at his sole discretion.</li>
                                                                    <li>The User hereby agrees to HEALTHEASY EMI's medical team carrying out an audit of his/her consultations with the Practitioner for the purpose of improving treatment quality, user experience, and other related processes. The User acknowledges that the subject matter of audit may include texts, messages, photographs, reports, audio or video recordings or any other material exchanged between the User and the Practitioner which could inter alia include User's personal information, including sensitive personal information. This personal information will be processed in accordance with Privacy Policy.</li>
                                                                    <li>User shall refrain from raising any personal queries or seeking advice from Practitioner which are not related to a specific disease / medicine/medical condition.</li>
                                                                    <li>Users shall not use abusive language with the Practitioner. In the event of an abuse from the User is reported by a Practitioner, HEALTHEASY EMI reserves the right to terminate the Service and shall not provide such Services in future. HEALTHEASY EMI is not responsible for honouring any refund request towards his/her consultation paid to HEALTHEASY EMI.</li>
                                                                    <li>Users may share images or videos of the affected areas of their body parts with the Practitioner only if it is absolutely necessary for diagnosing his/her condition and if he/she is personally comfortable in sharing such images or videos.</li>
                                                                    <li>Users shall ensure that any interaction/communication with the Practitioners, including sharing images or videos of the body parts, shall be only through the Website. The Users shall not rely on any other external modes of communication for interacting/communicating with the Practitioners.</li>
                                                                    <li>Users shall be prepared to share all relevant documents or reports to the Practitioner promptly upon request.</li>
                                                                    <li>For every paid consultation, the Users shall not obtain consultation for more than one User. In the event, the Users attempt to obtain consultation for more than one User through a single paid consultation, such consultations will not be addressed by the relevant Practitioner.
                                                                        <br /><b>The restricted drugs are as follows:</b>
                                                                        <div className="ps-3">
                                                                            <ul className="list_disc">
                                                                                <li>Medication for Medical Termination Pregnancy (MTP)</li>
                                                                                <li>Drugs under the following pharmaceutical classifications such as; sedatives, hypnotics, opioids, schedule X drugs, or fourth generation antibiotics.</li>
                                                                            </ul>
                                                                        </div>
                                                                    </li>
                                                                    <li>If restricted drugs are indicated for treatment or management of a disease or condition by a Practitioner, the User shall physically visit the Practitioner of their choice to confirm the requirements/necessity for prescribing such restricted drugs.</li>
                                                                    <li>User understands and agrees to provide accurate information and will not use the Services for any acts that are considered to be illegal in nature.</li>
                                                                    <li>The User agrees and understands that the transaction with the Practitioner and HEALTHEASY EMI are subject to jurisdiction of Indian laws and that any claim, dispute or difference arising from it shall be subject to the jurisdiction provision as contained in the Terms and Conditions hereunder, at all times. The User further agrees and understands that the Practitioner is a medical practitioner who is licensed to practice medicine in India and the onus is on the User to determine if he/she is eligible to consult with the Practitioners via the Website. It is expressly clarified that at no point in time can it be construed that the Practitioner is practicing medicine in a territory other than India, irrespective of where the User is located and procures medical services or engages in communication with the Practitioner, in any manner whatsoever.</li>
                                                                    <li>The User shall indemnify and hold harmless HEALTHEASY EMI and its affiliates, subsidiaries, directors, officers, employees and agents from and against any and all claims, proceedings, penalties, damages, loss, liability, actions, costs and expenses (including but not limited to court fees and attorney fees) arising due to or in relation to the use of Website by the User, by breach of the Terms or violation of any law, rules or regulations by the User, or due to such other actions, omissions or commissions of the User that gave rise to the claim.</li>
                                                                    <li>The User shall make payment using the payment gateway to make payments online, solely at User's discretion. Should there be any issues with regard to the payment not reaching the HEALTHEASY EMI account, the User may contact HEALTHEASY EMI's support team via online chat: https://www.healtheasy emi.com/consult/direct/chat-support.</li>
                                                                </ul>
                                                            </div>
                                                        </li>
                                                        <li>
                                                            <h6>C.	Refund policy for Users:</h6>
                                                            <div className="ps-3">
                                                                <ul className="list_roman">
                                                                    <li>In the event it is proved that the Practitioners have acted in contravention of any applicable laws, HEALTHEASY EMI shall provide complete refund to the User, subject to investigation undertaken by HEALTHEASY EMI.</li>
                                                                    <li>If the cancellation is due to the abusive nature of the User, such User shall not be eligible for any refund and HEALTHEASY EMI shall be entitled to take any legal action, depending upon the gravity of the matter.</li>
                                                                    <li>User shall refrain from raising any personal queries or seek advice which are not related to a specific disease / medicine/medical condition. In the event the User raises any such personal queries or seek advice, HEALTHEASY EMI reserves the right to terminate the consultation of such Users and further, such Users will not be entitled to any refund.</li>
                                                                    <li>In case a Practitioner does not respond to a paid consultation within Twenty (20) minutes from the time of starting a consultation/appointment or does not respond for more than fifteen (15) minutes during an active consultation, the User shall have the right to request for a refund and any amounts paid by the User with respect to the such consultations will be refunded.</li>
                                                                    <li>In case a Practitioner does not provide a consultation summary prescription for a particular consultation, then the User shall have the right to request for a refund and any amounts paid by the User with respect to such consultations will be refunded. Refunds will not be provided if the Practitioner has provided a consultation summary prescription to the User.</li>
                                                                    <li>In case a Practitioner is unreasonably abrupt or quick to complete a particular consultation, then the User shall have the right to request for a refund. HEALTHEASY EMI shall provide complete refund to the User, subject to investigation undertaken by HEALTHEASY EMI.</li>
                                                                    <li>HEALTHEASY EMI reserves the right to permanently block Users from future Services in the event HEALTHEASY EMI receives multiple cancellation request from such Users for reasons which do not form part of the cancellation policy of HEALTHEASY EMI.</li>
                                                                    <li>Users are allowed a period of three (3) days to flag any consultation as inadequate, and request for a refund. No refund requests shall be considered thereafter.</li>
                                                                    <li>Users can request a refund by contacting HEALTHEASY EMI’s online chat support: https://www.healtheasy emi.com/consult/direct/chat-support</li>
                                                                    <li>HEALTHEASY EMI shall check the details and process the refund where applicable, solely at its discretion. After a refund request is processed, the money will be refunded to the User in seven (7) working days from the day refund has been approved by HEALTHEASY EMI.</li>
                                                                    <li>In the event a User raises any concerns regarding the inappropriateness of a particular consultation on the Consult platform, the User agrees that the refund or any other outcome for any such concerns raised by the User will be subject to a detailed review of the said concerns by HEALTHEASY EMI as per HEALTHEASY EMI’s internal policies.</li>
                                                                    <li>In all matters related to refund and settlement under this Agreement, HEALTHEASY EMI shall decide so at its sole and absolute discretion after detailed review of the matter and taking into account all the involved parties’ information. The decision of HEALTHEASY EMI shall be final in this regard.</li>
                                                                </ul>
                                                            </div>
                                                        </li>
                                                        <li>
                                                            <h6>D.	Express Disclaimers:</h6>
                                                            <div className="ps-3">
                                                                <ul className="list_roman">
                                                                    <li>Consult is intended for general purposes only and is not meant to be used in emergencies/serious illnesses requiring physical consultation. Further, if the Practitioner adjudges that a physical examination would be required and advises ‘in-person consultation’, it is the sole responsibility of the User, to book an appointment for physical examination or/and in-person consultation whether the same is with the Practitioner listed on the Website or otherwise. In case of any negligence on the part of the User in acting on the same and the condition of the User deteriorates, HEALTHEASY EMI shall not be held liable.</li>
                                                                    <li>Consult is a mode available to Users to assist them to obtain consultation from Practitioners and does not intend to replace the physical consultation with a medical practitioner.</li>
                                                                </ul>
                                                            </div>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </Accordion.Body>
                                        </Accordion.Item>
                                        <Accordion.Item eventKey="2">
                                            <Accordion.Header>3.	TERMINATION</Accordion.Header>
                                            <Accordion.Body>
                                                HEALTHEASY EMI reserves the right to suspend or terminate services provided through the Website and under this Agreement, with or without notice at any time, and to exercise any other remedy available under law.
                                            </Accordion.Body>
                                        </Accordion.Item>
                                        <Accordion.Item eventKey="3">
                                            <Accordion.Header>4.	LIMITATION OF LIABILITY</Accordion.Header>
                                            <Accordion.Body>
                                                In no event, including but not limited to negligence, shall HEALTHEASY EMI, or any of its directors, officers, employees, agents or service providers, affiliates and group companies (collectively, the “Protected Entities”) be liable for any direct, indirect, special, incidental, consequential, exemplary or punitive damages arising from, or directly or indirectly related to, the use of, or the inability to use, the Website or the content, materials and functions related thereto, the Services, User’s provision of information via the Website, , even if such Protected Entity has been advised of the possibility of such damages. In no event shall the Protected Entities be liable for:
                                                <div className="ps-3">
                                                    <ul className="list_disc">
                                                        <li>any content posted, transmitted, exchanged or received by or on behalf of any User or other person on or through the Website;</li>
                                                        <li>any unauthorized access to or alteration of your transmissions or data</li>
                                                    </ul>
                                                </div>
                                            </Accordion.Body>
                                        </Accordion.Item>
                                        <Accordion.Item eventKey="4">
                                            <Accordion.Header>5.	SEVERABILITY</Accordion.Header>
                                            <Accordion.Body>
                                                If any provision of the Agreement is invalid as per applicable law, held by a court of competent jurisdiction or arbitral tribunal to be unenforceable under applicable law, then such provision shall be excluded from this Agreement and the remainder of the Agreement shall be interpreted as if such provision were so excluded and shall be enforceable in accordance with its terms; provided however that, in such event, the Agreement shall be interpreted so as to give effect, to the greatest extent consistent with and permitted by applicable law, to the meaning and intention of the excluded provision as determined by such court of competent jurisdiction or arbitral tribunal.
                                            </Accordion.Body>
                                        </Accordion.Item>
                                        <Accordion.Item eventKey="5">
                                            <Accordion.Header>6.	WAIVER</Accordion.Header>
                                            <Accordion.Body>
                                                No provision of this Agreement shall be deemed to be waived and no breach excused, unless such waiver or consent shall be in writing and signed by HEALTHEASY EMI. Any consent by HEALTHEASY EMI to, or a waiver by HEALTHEASY EMI of any breach by you, whether expressed or implied, shall not constitute consent to, waiver of, or excuse for any other different or subsequent breach.
                                            </Accordion.Body>
                                        </Accordion.Item>
                                        <Accordion.Item eventKey="6">
                                            <Accordion.Header>7.	APPLICABLE LAW AND DISPUTE SETTLEMENT</Accordion.Header>
                                            <Accordion.Body>
                                                The parties agree that this Agreement and any contractual obligation between HEALTHEASY EMI and User will be governed by the laws of India.
                                                The courts at Latur shall have exclusive jurisdiction over any disputes arising out of or in relation to this Agreement, User’s use of the Website or the Services or the information to which it gives access.

                                            </Accordion.Body>
                                        </Accordion.Item>
                                    </Accordion>
                                </div>
                            )}
                            {activeTab === 'Doctor Telemedicine T&C' && (
                                <div className="p-3 border rounded">
                                    <p>Arogya Mantra Healthtech Private Limited (“Healtheasy EMI”) offers online medical teleconsultation services via its medical practitioners (“Practitioners”) in accordance with the terms and conditions set forth below. The brand name ‘Healtheasy EMI’ provides these services (“Services”) through its website at https://www.healtheasyemi.com/consult and the mobile application ‘Healtheasy EMI’ (collectively referred to as the “Website”).</p>
                                    <Accordion defaultActiveKey="0" className='faq-accordion'>
                                        <Accordion.Item eventKey="0">
                                            <Accordion.Header>1. NATURE AND APPLICABILITY OF TERMS</Accordion.Header>
                                            <Accordion.Body>
                                                <p>Please read these Terms and Conditions (“Terms”) and the Privacy Policy available at https://www.healtheasyemi.com/company/privacy carefully before accessing the Website or availing the Services.</p>
                                                <p>These Terms and the Privacy Policy together constitute a legally binding agreement (“Agreement”) between the User (“you”) and Healtheasy EMI.</p>
                                                <div className="ps-3">
                                                    <h6>This Agreement applies to:</h6>
                                                    <ul className="list_disc">
                                                        <li>A patient, or their representative/affiliate seeking healthcare services including consultation with Practitioners via the Website (“End-User”, “you”, or “User”), or</li>
                                                        <li>Any other user accessing the Website.</li>
                                                    </ul>
                                                </div>
                                                <p>These Services may change from time to time at the sole discretion of Healtheasy EMI, and the then-current Agreement will apply to the User.</p>
                                                <p>Healtheasy EMI reserves the right to modify or terminate any part of this Agreement at any time. Continued use of the Website or Services constitutes acceptance of the updated Terms. If you do not agree to any part of the Agreement, do not use the Website or Services.</p>
                                                <div className="ps-3">
                                                    <h6>This Agreement is in compliance with and governed by the laws of India, including:</h6>
                                                    <ul className="list_disc">
                                                        <li>The Indian Contract Act, 1872</li>
                                                        <li>The Information Technology Act, 2000</li>
                                                        <li>Telemedicine Guidelines under the Indian Medical Council (Professional Conduct, Etiquette and Ethics Regulation, 2002)</li>
                                                    </ul>
                                                </div>
                                            </Accordion.Body>
                                        </Accordion.Item>
                                        <Accordion.Item eventKey="1">
                                            <Accordion.Header>2. DOCTOR CONSULT</Accordion.Header>
                                            <Accordion.Body>
                                                <div className="ps-3">
                                                    <ul>
                                                        <li>
                                                            <h6>A. Definition</h6>
                                                            <p>“Consult” refers to the online medical consultation service provided by Healtheasy EMI that enables Users to consult with registered Practitioners. The Practitioner is assigned via an automated algorithm based on various parameters (such as consultation time, health condition, etc.) or selected by the User through the platform’s search feature.</p>
                                                        </li>
                                                        <li>
                                                            <h6>B. User Terms</h6>
                                                            <p>By using the Consult service, the User explicitly acknowledges and agrees to the following:</p>
                                                            <div className="ps-3">
                                                                <ul className="list_number">
                                                                    <li>Practitioners may be assigned via system-generated algorithms or selected manually by Users.</li>
                                                                    <li>Prescriptions issued online are based on limited input and do not replace an in-person diagnosis. They should not be considered conclusive.</li>
                                                                </ul>
                                                            </div>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </Accordion.Body>
                                        </Accordion.Item>
                                        <Accordion.Item eventKey="2">
                                            <Accordion.Header>What types of treatments and surgeries are available?</Accordion.Header>
                                            <Accordion.Body>
                                                We cover most major and elective surgeries, including cardiology, orthopedics, neurology, oncology, gynecology, and general surgery. AYUSH and wellness options are also available.
                                            </Accordion.Body>
                                        </Accordion.Item>
                                        <Accordion.Item eventKey="3">
                                            <Accordion.Header>Are there hidden charges or commissions?</Accordion.Header>
                                            <Accordion.Body>
                                                No. Health Easy EMI maintains a 100% transparent pricing model. All charges, EMIs, and partner hospital fees are disclosed before confirmation.
                                            </Accordion.Body>
                                        </Accordion.Item>
                                        <Accordion.Item eventKey="4">
                                            <Accordion.Header>Can I track my treatment progress or documents online?</Accordion.Header>
                                            <Accordion.Body>
                                                Yes. Our cloud-based health management system allows you to track appointments, payments, reports, and discharge summaries in one secure dashboard.
                                            </Accordion.Body>
                                        </Accordion.Item>
                                    </Accordion>
                                </div>
                            )}
                            {activeTab === 'Healthcare Financing & EMI' && (
                                <Accordion defaultActiveKey="0" className='faq-accordion'>
                                    <Accordion.Item eventKey="0">
                                        <Accordion.Header>How does the EMI option work?</Accordion.Header>
                                        <Accordion.Body>
                                            We collaborate with banks and fintech partners to convert your medical bills into easy monthly EMIs. The approval process is quick, paperless, and patient-friendly.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="1">
                                        <Accordion.Header>What documents are required for EMI approval?</Accordion.Header>
                                        <Accordion.Body>
                                            Typically, Aadhaar, PAN, income proof, and hospital estimate are required. Our support team assists you throughout the process.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="2">
                                        <Accordion.Header>What is the maximum loan or EMI limit available?</Accordion.Header>
                                        <Accordion.Body>
                                            It depends on the treatment cost and financial eligibility, usually ranging from ₹10,000 to ₹10 lakhs.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="3">
                                        <Accordion.Header>How long does EMI approval take?</Accordion.Header>
                                        <Accordion.Body>
                                            Most EMI approvals are processed within 30 minutes to 2 hours, depending on partner verification.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="4">
                                        <Accordion.Header>Can I get EMI options for all hospitals?</Accordion.Header>
                                        <Accordion.Body>
                                            Yes, but we recommend choosing partner hospitals for the fastest processing and best offers.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="5">
                                        <Accordion.Header>Are EMIs interest-free?</Accordion.Header>
                                        <Accordion.Body>
                                            Many of our partner plans are 0% interest. Others have minimal interest rates, depending on the financial provider.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="6">
                                        <Accordion.Header>What if I miss an EMI payment?</Accordion.Header>
                                        <Accordion.Body>
                                            You’ll receive reminders. Missed payments may attract minimal late fees as per the partner’s policy. We help in rescheduling if needed.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                            )}
                            {activeTab === 'Ambulance & Emergency Services' && (
                                <Accordion defaultActiveKey="0" className='faq-accordion'>
                                    <Accordion.Item eventKey="0">
                                        <Accordion.Header>How can I book an ambulance instantly?</Accordion.Header>
                                        <Accordion.Body>
                                            You can book an ambulance through our app or call our 24×7 helpline. GPS-enabled ambulances ensure the nearest vehicle is dispatched to you.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="1">
                                        <Accordion.Header>What ambulance types are available?</Accordion.Header>
                                        <Accordion.Body>
                                            <ul className='ps-4' style={{ listStyleType: "disc" }}>
                                                <li>BLS (Basic Life Support)</li>
                                                <li>ALS (Advanced Life Support)</li>
                                                <li>ICU on Wheels</li>
                                                <li>Neonatal/Pediatric Ambulance</li>
                                                <li>Mortuary Ambulance</li>
                                            </ul>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="2">
                                        <Accordion.Header>Can I track my ambulance in real-time?</Accordion.Header>
                                        <Accordion.Body>
                                            Yes. Our app provides real-time GPS tracking, estimated arrival time, and driver contact details.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="3">
                                        <Accordion.Header>Do you provide intercity or hospital transfer services?</Accordion.Header>
                                        <Accordion.Body>
                                            Yes. We arrange long-distance and intercity transfers with medical staff, oxygen, and equipment as required.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="4">
                                        <Accordion.Header>What if no ambulance is available nearby?</Accordion.Header>
                                        <Accordion.Body>
                                            Our system automatically connects to partner networks to locate the nearest available ambulance and ensures minimal wait time.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                            )}
                            {activeTab === 'For Hospitals, Clinics & Partners' && (
                                <Accordion defaultActiveKey="0" className='faq-accordion'>
                                    <Accordion.Item eventKey="0">
                                        <Accordion.Header>Can hospitals partner with Health Easy EMI?</Accordion.Header>
                                        <Accordion.Body>
                                            Yes. Hospitals can subscribe or list with us to receive patient leads, promote packages, and offer EMI-enabled services.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="1">
                                        <Accordion.Header>What are the benefits of partnering with Health Easy EMI?</Accordion.Header>
                                        <Accordion.Body>
                                            <ul className='ps-4' style={{ listStyleType: 'disc' }}>
                                                <li>Increased patient inflow</li>
                                                <li>Faster payment via EMI financing</li>
                                                <li>Brand visibility across digital platforms</li>
                                                <li>24 X 7 Ambulance integration</li>
                                                <li>Data analytics & Marketing Supports </li>
                                            </ul>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="2">
                                        <Accordion.Header>Do you work with insurance companies?</Accordion.Header>
                                        <Accordion.Body>
                                            Yes, we collaborate with insurance providers for policy-linked treatments and cashless claim facilitation.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="3">
                                        <Accordion.Header>How can corporate companies use your services?</Accordion.Header>
                                        <Accordion.Body>
                                            We offer employee healthcare tie-ups, on-site ambulance standby, and EMI-based treatment plans for workforce wellness.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="4">
                                        <Accordion.Header>How can diagnostic labs or pharmacies collaborate?</Accordion.Header>
                                        <Accordion.Body>
                                            We partner with diagnostic centers, labs, and pharmacies for bulk pricing, referrals, and commission-based collaborations.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                            )}
                            {activeTab === 'Data Security & Support' && (
                                <Accordion defaultActiveKey="0" className='faq-accordion'>
                                    <Accordion.Item eventKey="0">
                                        <Accordion.Header>Is my personal and medical data safe?</Accordion.Header>
                                        <Accordion.Body>
                                            Yes. We follow strict data privacy protocols, encrypted cloud storage, and comply with Indian data protection guidelines.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="1">
                                        <Accordion.Header>What if I face an issue with my booking or payment?</Accordion.Header>
                                        <Accordion.Body>
                                            You can contact our support team 24×7 through chat, call, or email for instant resolution.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="2">
                                        <Accordion.Header>How can I reach Health Easy EMI for support or partnership?</Accordion.Header>
                                        <Accordion.Body>

                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                            )}
                        </Col>
                    </Row>
                </Container>
            </section>
            <FooterBar />
        </>
    );
}
export default Terms;