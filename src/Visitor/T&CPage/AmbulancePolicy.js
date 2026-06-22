import { useEffect, useState } from "react";
import { Container, Accordion } from "react-bootstrap";
import CryptoJS from "crypto-js";
import NavBar from "../Component/NavBar";
import FooterBar from "../Component/FooterBar";
import { SECRET_KEY, STORAGE_KEYS } from '../../config';

function AmbulancePolicy() {
    const [logdata, setlogdata] = useState(null);
    const [token, settoken] = useState(null);

    useEffect(() => {
        const pgetlocaldata = localStorage.getItem(STORAGE_KEYS.PATIENT);
        const dgetlocaldata = localStorage.getItem(STORAGE_KEYS.DOCTOR);
        let data = null;

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

        if (data && data.accessToken) {
            settoken(`Bearer ${data.accessToken}`);
        }
    }, []);

    useEffect(() => {
        document.title = "HealthEasy EMI – Ambulance Privacy Policy";
    }, []);

    return (
        <>
            <NavBar logindata={logdata} />
            
            {/* breadcrumb section */}
            <section className='breadcrumb_Sec'>
                <Container className='text-center'>
                    <h2>HealthEasy EMI Ambulance Services – Privacy Policy</h2>
                </Container>
            </section>
            
            <section className="py-5 bg-light">
                <Container>
                    <div className="p-4 bg-white border rounded shadow-sm">
                        <Accordion defaultActiveKey="0" className='faq-accordion'>
                            
                            <Accordion.Item eventKey="0">
                                <Accordion.Header><strong>1. Introduction</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Arogya Mantra Healthtech Private Limited, operating under the brand name "HealthEasy EMI Ambulance Services" ("HealthEasy EMI", "Company", "we", "our", or "us"), is committed to protecting the privacy, confidentiality, and security of personal information entrusted to us.</p>
                                    <p>This Privacy Policy describes how we collect, use, process, store, disclose, transfer, and protect personal information when you access or use our ambulance booking platform, website, mobile applications, call center services, emergency response coordination services, and related healthcare transportation services (collectively, the "Services").</p>
                                    <p>By accessing or using the Services, you acknowledge that you have read, understood, and agreed to this Privacy Policy.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="1">
                                <Accordion.Header><strong>2. Applicability</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>This Privacy Policy applies to:</p>
                                    <ul>
                                        <li>Patients;</li>
                                        <li>Family members, attendants, and caregivers;</li>
                                        <li>Ambulance service users;</li>
                                        <li>Ambulance operators and drivers;</li>
                                        <li>Hospitals and healthcare facilities;</li>
                                        <li>Visitors to our website and mobile applications;</li>
                                        <li>Individuals interacting with our customer support services.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="2">
                                <Accordion.Header><strong>3. Legal Basis for Processing</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI processes personal data in accordance with applicable Indian laws, including:</p>
                                    <ul>
                                        <li>Digital Personal Data Protection Act, 2023;</li>
                                        <li>Information Technology Act, 2000;</li>
                                        <li>Applicable healthcare and emergency service regulations;</li>
                                        <li>Consumer protection laws;</li>
                                        <li>Payment and financial regulations where applicable.</li>
                                    </ul>
                                    <p>By using the Services, you consent to the collection and processing of information as described in this Privacy Policy where such consent is required under applicable law.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="3">
                                <Accordion.Header><strong>4. Information We Collect</strong></Accordion.Header>
                                <Accordion.Body>
                                    <h6>4.1 Personal Information</h6>
                                    <p>We may collect:</p>
                                    <ul>
                                        <li>Full name;</li>
                                        <li>Mobile number;</li>
                                        <li>Email address;</li>
                                        <li>Date of birth;</li>
                                        <li>Age;</li>
                                        <li>Gender;</li>
                                        <li>Residential address;</li>
                                        <li>Emergency contact information;</li>
                                        <li>Profile information.</li>
                                    </ul>

                                    <h6>4.2 Ambulance Booking Information</h6>
                                    <p>We may collect:</p>
                                    <ul>
                                        <li>Pickup location;</li>
                                        <li>Destination location;</li>
                                        <li>Preferred hospital or healthcare facility;</li>
                                        <li>Booking date and time;</li>
                                        <li>Ambulance category requested;</li>
                                        <li>Transport requirements;</li>
                                        <li>Patient transport preferences.</li>
                                    </ul>

                                    <h6>4.3 Health and Medical Information</h6>
                                    <p>To facilitate ambulance and healthcare transportation services, we may collect:</p>
                                    <ul>
                                        <li>Patient name and age;</li>
                                        <li>Medical condition information;</li>
                                        <li>Injury details;</li>
                                        <li>Diagnosis information voluntarily provided;</li>
                                        <li>Treating doctor details;</li>
                                        <li>Hospital information;</li>
                                        <li>Special medical requirements;</li>
                                        <li>Oxygen requirements;</li>
                                        <li>Ventilator requirements;</li>
                                        <li>ICU transport requirements;</li>
                                        <li>Isolation or infectious disease precautions;</li>
                                        <li>Emergency medical information.</li>
                                    </ul>

                                    <h6>4.4 Location Information</h6>
                                    <p>We may collect:</p>
                                    <ul>
                                        <li>Real-time device location;</li>
                                        <li>Pickup location;</li>
                                        <li>Ambulance tracking information;</li>
                                        <li>GPS coordinates;</li>
                                        <li>Route and navigation information.</li>
                                    </ul>
                                    <p>Location information is collected only where necessary to facilitate transportation services, tracking, emergency coordination, safety, and operational efficiency.</p>

                                    <h6>4.5 Payment and Financing Information</h6>
                                    <p>Where applicable, we may collect:</p>
                                    <ul>
                                        <li>Transaction details;</li>
                                        <li>Payment records;</li>
                                        <li>Billing information;</li>
                                        <li>UPI transaction details;</li>
                                        <li>Bank details required for refunds;</li>
                                        <li>Healthcare financing or EMI-related information.</li>
                                    </ul>
                                    <p>Payment card information is generally processed by authorized payment service providers and not stored directly by HealthEasy EMI except where required by law.</p>

                                    <h6>4.6 Technical Information</h6>
                                    <p>We may automatically collect:</p>
                                    <ul>
                                        <li>Device identifiers;</li>
                                        <li>IP addresses;</li>
                                        <li>Browser information;</li>
                                        <li>Operating system information;</li>
                                        <li>Application logs;</li>
                                        <li>Usage analytics;</li>
                                        <li>Crash reports;</li>
                                        <li>Session information.</li>
                                    </ul>

                                    <h6>4.7 Communications and Support Information</h6>
                                    <p>We may collect:</p>
                                    <ul>
                                        <li>Customer support interactions;</li>
                                        <li>Chat messages;</li>
                                        <li>Service requests;</li>
                                        <li>Complaint information;</li>
                                        <li>Call recordings where legally permitted;</li>
                                        <li>User feedback and ratings.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="4">
                                <Accordion.Header><strong>5. How We Use Information</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>We may use information for the following purposes:</p>
                                    <h6>Service Delivery</h6>
                                    <ul>
                                        <li>Ambulance booking and dispatch;</li>
                                        <li>Real-time ambulance tracking;</li>
                                        <li>Emergency response coordination;</li>
                                        <li>Hospital coordination;</li>
                                        <li>Patient transportation management.</li>
                                    </ul>
                                    <h6>Communication</h6>
                                    <ul>
                                        <li>Booking confirmations;</li>
                                        <li>Arrival notifications;</li>
                                        <li>Status updates;</li>
                                        <li>Emergency alerts;</li>
                                        <li>Customer support responses.</li>
                                    </ul>
                                    <h6>Payment Processing</h6>
                                    <ul>
                                        <li>Processing payments;</li>
                                        <li>EMI and healthcare financing facilitation;</li>
                                        <li>Refund processing;</li>
                                        <li>Fraud prevention.</li>
                                    </ul>
                                    <h6>Platform Improvement</h6>
                                    <ul>
                                        <li>Service analytics;</li>
                                        <li>Performance monitoring;</li>
                                        <li>Product development;</li>
                                        <li>User experience enhancement.</li>
                                    </ul>
                                    <h6>Safety and Emergency Response</h6>
                                    <ul>
                                        <li>Coordinating emergency transportation;</li>
                                        <li>Assisting ambulance providers;</li>
                                        <li>Facilitating communication between patients, caregivers, hospitals, and ambulance operators.</li>
                                    </ul>
                                    <h6>Legal Compliance</h6>
                                    <ul>
                                        <li>Regulatory compliance;</li>
                                        <li>Recordkeeping obligations;</li>
                                        <li>Law enforcement requests;</li>
                                        <li>Dispute resolution.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="5">
                                <Accordion.Header><strong>6. Sharing of Information</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI does not sell personal information.</p>
                                    <p>We may share information only where necessary for service delivery or legal compliance.</p>
                                    <h6>Ambulance Service Providers</h6>
                                    <p>We may share relevant information with ambulance operators and transportation partners, including:</p>
                                    <ul>
                                        <li>Patient details;</li>
                                        <li>Pickup and destination information;</li>
                                        <li>Emergency requirements;</li>
                                        <li>Medical transport requirements.</li>
                                    </ul>
                                    <h6>Hospitals and Healthcare Facilities</h6>
                                    <p>Information may be shared with receiving hospitals, healthcare facilities, emergency departments, and medical personnel where required for patient care and transportation coordination.</p>
                                    <h6>Payment and Financial Partners</h6>
                                    <p>Where payment, financing, or EMI services are used, information may be shared with:</p>
                                    <ul>
                                        <li>Banks;</li>
                                        <li>Payment gateways;</li>
                                        <li>Financial institutions;</li>
                                        <li>Lending partners;</li>
                                        <li>Verification agencies.</li>
                                    </ul>
                                    <h6>Service Providers</h6>
                                    <p>We may engage authorized service providers for:</p>
                                    <ul>
                                        <li>Cloud hosting;</li>
                                        <li>Communication services;</li>
                                        <li>GPS and mapping services;</li>
                                        <li>Customer support;</li>
                                        <li>Technology infrastructure;</li>
                                        <li>Analytics.</li>
                                    </ul>
                                    <h6>Legal and Regulatory Authorities</h6>
                                    <p>We may disclose information where required by:</p>
                                    <ul>
                                        <li>Applicable law;</li>
                                        <li>Court orders;</li>
                                        <li>Regulatory authorities;</li>
                                        <li>Emergency response requirements;</li>
                                        <li>Protection of public safety.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="6">
                                <Accordion.Header><strong>7. Emergency Situations</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>In emergency situations involving risk to life, serious injury, public health concerns, or urgent medical care requirements, HealthEasy EMI may process and share relevant information without additional consent to the extent permitted by applicable law and necessary for protecting life and health.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="7">
                                <Accordion.Header><strong>8. Marketing Communications</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Where legally required, HealthEasy EMI will obtain consent before sending promotional communications.</p>
                                    <p>Users may opt out of marketing communications at any time.</p>
                                    <p>Operational communications relating to bookings, emergencies, payments, safety, and service delivery may continue notwithstanding marketing preferences.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="8">
                                <Accordion.Header><strong>9. Cookies and Similar Technologies</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI uses cookies, SDKs, device identifiers, and related technologies to:</p>
                                    <ul>
                                        <li>Enable platform functionality;</li>
                                        <li>Improve user experience;</li>
                                        <li>Analyze usage patterns;</li>
                                        <li>Maintain account sessions;</li>
                                        <li>Enhance security.</li>
                                    </ul>
                                    <p>Users may disable cookies through browser or device settings, although certain features may become unavailable.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="9">
                                <Accordion.Header><strong>10. Data Security</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI implements reasonable technical, administrative, and organizational safeguards designed to protect personal information, including:</p>
                                    <ul>
                                        <li>Encryption measures;</li>
                                        <li>Access controls;</li>
                                        <li>Authentication systems;</li>
                                        <li>Security monitoring;</li>
                                        <li>Audit logging;</li>
                                        <li>Secure infrastructure.</li>
                                    </ul>
                                    <p>However, no system can guarantee absolute security.</p>
                                    <p>Users are responsible for maintaining the confidentiality of their account credentials.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="10">
                                <Accordion.Header><strong>11. Data Retention</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>We retain information only for as long as reasonably necessary for:</p>
                                    <ul>
                                        <li>Service delivery;</li>
                                        <li>Emergency response documentation;</li>
                                        <li>Legal obligations;</li>
                                        <li>Regulatory compliance;</li>
                                        <li>Dispute resolution;</li>
                                        <li>Fraud prevention;</li>
                                        <li>Business operations.</li>
                                    </ul>
                                    <p>Following expiration of retention requirements, information may be securely deleted, anonymized, or aggregated.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="11">
                                <Accordion.Header><strong>12. Your Rights</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Subject to applicable law, users may have the right to:</p>
                                    <ul>
                                        <li>Access personal information;</li>
                                        <li>Correct inaccurate information;</li>
                                        <li>Update account information;</li>
                                        <li>Withdraw consent where applicable;</li>
                                        <li>Request account deletion;</li>
                                        <li>Request information regarding processing activities;</li>
                                        <li>Raise privacy-related complaints.</li>
                                    </ul>
                                    <p>Requests may be submitted using the contact information below.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="12">
                                <Accordion.Header><strong>13. Children's Privacy</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>The Services are not intended for independent use by individuals below eighteen (18) years of age.</p>
                                    <p>Parents, guardians, caregivers, or authorized representatives may use the Services on behalf of minors where legally permitted.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="13">
                                <Accordion.Header><strong>14. International Transfers</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Where information is processed, stored, or accessed outside India, HealthEasy EMI shall implement appropriate safeguards consistent with applicable law and contractual obligations.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="14">
                                <Accordion.Header><strong>15. Policy Updates</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI may modify this Privacy Policy from time to time.</p>
                                    <p>Updated versions shall be published on the platform and become effective upon publication unless otherwise stated.</p>
                                    <p>Continued use of the Services after publication constitutes acceptance of the revised Privacy Policy.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="15">
                                <Accordion.Header><strong>16. Contact Information and Grievance Officer</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>For privacy-related questions, requests, or complaints, please contact:</p>
                                    <p>HealthEasy EMI Ambulance Services<br />
                                    Arogya Mantra Healthtech Private Limited<br />
                                    Support Email: support@healtheasyemi.com<br />
                                    Privacy Email: privacy@healtheasyemi.com<br />
                                    Registered Office: Office no.23, 3rd Floor, Aston Plaza, Narhe Ambegaon Rd, above Star Bazaar, Ambegaon Budruk, Pune, Maharashtra 411046</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="16">
                                <Accordion.Header><strong>17. Governing Law and Jurisdiction</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>This Privacy Policy shall be governed by and construed in accordance with the laws of India.</p>
                                    <p>Any disputes arising from or relating to this Privacy Policy shall be subject to the exclusive jurisdiction of the competent courts located at Latur, Maharashtra, India.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                        </Accordion>

                        {/* BOTTOM DISCLAIMER NOTE */}
                        <div className="mt-4 p-3 bg-light border rounded small text-muted">
                            <p>Privacy Notice: HealthEasy EMI Ambulance Services processes personal, health, location, and emergency-response information solely for ambulance booking, patient transportation, healthcare coordination, safety, legal compliance, and related service delivery purposes. By using our Services, you consent to the processing of information as described in our Privacy Policy. In life-threatening emergencies, certain information may be shared with ambulance operators, hospitals, and emergency responders to facilitate urgent medical care.</p>
                        </div>

                    </div>
                </Container>
            </section>

            <FooterBar />
        </>
    );
}

export default AmbulancePolicy;