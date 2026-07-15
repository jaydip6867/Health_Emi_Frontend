import { useEffect, useState } from "react";
import { Container, Accordion } from "react-bootstrap";
import CryptoJS from "crypto-js";
import NavBar from "../Component/NavBar";
import FooterBar from "../Component/FooterBar";
import { SECRET_KEY, STORAGE_KEYS } from '../../config';

function PrivacyPolicy() {
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
        document.title = "HealthEasy EMI – Privacy Policy";
    }, []);

    return (
        <>
            <NavBar logindata={logdata} />
            
            {/* breadcrumb section */}
            <section className='breadcrumb_Sec'>
                <Container className='text-center'>
                    <h2>Privacy Policy</h2>
                </Container>
            </section>
            
            <section className="py-5 bg-light">
                <Container>
                    <div className="p-4 bg-white border rounded shadow-sm">
                        <Accordion defaultActiveKey="0" className='faq-accordion'>
                            
                            <Accordion.Item eventKey="0">
                                <Accordion.Header><strong>1. Introduction</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Arogya Mantra Healthtech Private Limited, operating under the brand name "HealthEasy EMI" ("HealthEasy EMI", "Company", "we", "our", or "us"), respects your privacy and is committed to protecting your personal data.</p>
                                    <p>This Privacy Policy explains how we collect, use, store, process, share, disclose, retain, and protect information relating to users of our website, mobile applications, teleconsultation services, appointment booking services, healthcare financing services, and related offerings (collectively, the "Services").</p>
                                    <p>By accessing or using our Services, you acknowledge that you have read, understood, and agree to this Privacy Policy and our Terms & Conditions.</p>
                                    <p>If you do not agree with this Privacy Policy, please discontinue use of the Services.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="1">
                                <Accordion.Header><strong>2. Applicability</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>This Privacy Policy applies to:</p>
                                    <ul>
                                        <li>Patients and healthcare consumers;</li>
                                        <li>Registered medical practitioners;</li>
                                        <li>Clinics, hospitals, diagnostic centers, and healthcare establishments;</li>
                                        <li>Visitors to the HealthEasy EMI website;</li>
                                        <li>Users of mobile applications and digital platforms operated by HealthEasy EMI.</li>
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
                                        <li>Information Technology Rules, as applicable;</li>
                                        <li>Telemedicine Practice Guidelines;</li>
                                        <li>Other applicable healthcare, financial, and consumer protection regulations.</li>
                                    </ul>
                                    <p>By using our Services, you consent to the processing of your personal information for the purposes described in this Privacy Policy where consent is required under applicable law.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="3">
                                <Accordion.Header><strong>4. Information We Collect</strong></Accordion.Header>
                                <Accordion.Body>
                                    <h6>4.1 Personal Information</h6>
                                    <p>We may collect:</p>
                                    <ul>
                                        <li>Full name;</li>
                                        <li>Date of birth;</li>
                                        <li>Age;</li>
                                        <li>Gender;</li>
                                        <li>Residential address;</li>
                                        <li>Email address;</li>
                                        <li>Mobile number;</li>
                                        <li>Emergency contact details.</li>
                                    </ul>

                                    <h6>4.2 Identity Verification Information</h6>
                                    <p>Where applicable, we may collect:</p>
                                    <ul>
                                        <li>PAN details;</li>
                                        <li>Aadhaar details (where legally permitted);</li>
                                        <li>Government-issued identity documents;</li>
                                        <li>Healthcare professional registration information.</li>
                                    </ul>

                                    <h6>4.3 Healthcare Information</h6>
                                    <p>To provide healthcare-related services, we may collect:</p>
                                    <ul>
                                        <li>Medical history;</li>
                                        <li>Symptoms and diagnoses;</li>
                                        <li>Consultation records;</li>
                                        <li>Prescriptions;</li>
                                        <li>Diagnostic reports;</li>
                                        <li>Laboratory reports;</li>
                                        <li>Hospital records;</li>
                                        <li>Healthcare provider information.</li>
                                    </ul>

                                    <h6>4.4 Appointment and Consultation Information</h6>
                                    <p>We may collect:</p>
                                    <ul>
                                        <li>Appointment details;</li>
                                        <li>Teleconsultation records;</li>
                                        <li>Consultation summaries;</li>
                                        <li>Communication history;</li>
                                        <li>Follow-up information.</li>
                                    </ul>

                                    <h6>4.5 Financial Information</h6>
                                    <p>For healthcare financing and payment services, we may collect:</p>
                                    <ul>
                                        <li>Payment information;</li>
                                        <li>Transaction records;</li>
                                        <li>Bank account details where required;</li>
                                        <li>Insurance information where applicable.</li>
                                    </ul>
                                    <p>Payment card information is generally processed through authorized payment service providers and is not stored by HealthEasy EMI except where required for lawful business purposes.</p>

                                    <h6>4.6 Technical Information</h6>
                                    <p>We may automatically collect:</p>
                                    <ul>
                                        <li>Device information;</li>
                                        <li>IP address;</li>
                                        <li>Browser type;</li>
                                        <li>Operating system;</li>
                                        <li>Mobile device identifiers;</li>
                                        <li>Log files;</li>
                                        <li>Usage statistics;</li>
                                        <li>Session information.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="4">
                                <Accordion.Header><strong>5. How We Use Information</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>We may use personal information for the following purposes:</p>
                                    <h6>Service Delivery</h6>
                                    <ul>
                                        <li>Appointment booking;</li>
                                        <li>Teleconsultation services;</li>
                                        <li>Healthcare coordination;</li>
                                        <li>Healthcare financing facilitation;</li>
                                        <li>Customer support.</li>
                                    </ul>
                                    <h6>Identity Verification</h6>
                                    <ul>
                                        <li>User authentication;</li>
                                        <li>Fraud prevention;</li>
                                        <li>Security monitoring;</li>
                                        <li>Regulatory compliance.</li>
                                    </ul>
                                    <h6>Communication</h6>
                                    <ul>
                                        <li>Appointment reminders;</li>
                                        <li>Service notifications;</li>
                                        <li>Customer support communications;</li>
                                        <li>Transaction updates;</li>
                                        <li>Account-related notifications.</li>
                                    </ul>
                                    <h6>Product Improvement</h6>
                                    <ul>
                                        <li>Service enhancement;</li>
                                        <li>Platform analytics;</li>
                                        <li>User experience optimization;</li>
                                        <li>Research and statistical analysis.</li>
                                    </ul>
                                    <h6>Legal and Regulatory Compliance</h6>
                                    <ul>
                                        <li>Compliance with applicable laws;</li>
                                        <li>Dispute resolution;</li>
                                        <li>Enforcement of agreements;</li>
                                        <li>Audit and risk management.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="5">
                                <Accordion.Header><strong>6. Consent and Communication Preferences</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Where required by law, HealthEasy EMI seeks consent before sending marketing communications.</p>
                                    <p>Users may:</p>
                                    <ul>
                                        <li>Opt out of promotional communications;</li>
                                        <li>Withdraw marketing consent;</li>
                                        <li>Update communication preferences through account settings or customer support.</li>
                                    </ul>
                                    <p>Transactional and service-related communications may continue where necessary for service delivery, security, legal compliance, or account administration.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="6">
                                <Accordion.Header><strong>7. Sharing of Information</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI does not sell personal information.</p>
                                    <p>We may share information with:</p>
                                    <h6>Healthcare Providers</h6>
                                    <p>Including:</p>
                                    <ul>
                                        <li>Doctors;</li>
                                        <li>Clinics;</li>
                                        <li>Hospitals;</li>
                                        <li>Diagnostic centers;</li>
                                        <li>Healthcare establishments involved in providing healthcare services.</li>
                                    </ul>
                                    <h6>Service Providers</h6>
                                    <p>Authorized vendors assisting with:</p>
                                    <ul>
                                        <li>Technology infrastructure;</li>
                                        <li>Payment processing;</li>
                                        <li>Cloud hosting;</li>
                                        <li>Communication services;</li>
                                        <li>Customer support;</li>
                                        <li>Security services.</li>
                                    </ul>
                                    <h6>Lending and Financial Partners</h6>
                                    <p>Where users apply for healthcare financing, information may be shared with authorized lenders, financial institutions, and verification agencies subject to applicable consent and legal requirements.</p>
                                    <h6>Government Authorities</h6>
                                    <p>Where required by law, regulation, court order, or lawful governmental request.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="7">
                                <Accordion.Header><strong>8. Teleconsultation Data</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Teleconsultation interactions may involve:</p>
                                    <ul>
                                        <li>Text communications;</li>
                                        <li>Audio communications;</li>
                                        <li>Video consultations;</li>
                                        <li>Uploaded images;</li>
                                        <li>Medical documents;</li>
                                        <li>Prescriptions.</li>
                                    </ul>
                                    <p>Such information may be retained for:</p>
                                    <ul>
                                        <li>Continuity of care;</li>
                                        <li>Regulatory compliance;</li>
                                        <li>Quality assurance;</li>
                                        <li>Patient safety;</li>
                                        <li>Dispute resolution.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="8">
                                <Accordion.Header><strong>9. Cookies and Similar Technologies</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI uses cookies and similar technologies to:</p>
                                    <ul>
                                        <li>Maintain website functionality;</li>
                                        <li>Improve user experience;</li>
                                        <li>Analyze platform performance;</li>
                                        <li>Enhance security.</li>
                                    </ul>
                                    <p>Users may disable cookies through browser settings; however, certain website functions may become unavailable.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="9">
                                <Accordion.Header><strong>10. Data Retention</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>We retain information only for as long as reasonably necessary for:</p>
                                    <ul>
                                        <li>Service delivery;</li>
                                        <li>Healthcare continuity;</li>
                                        <li>Legal compliance;</li>
                                        <li>Regulatory obligations;</li>
                                        <li>Fraud prevention;</li>
                                        <li>Business operations.</li>
                                    </ul>
                                    <p>Following expiry of applicable retention periods, information may be securely deleted, anonymized, or aggregated.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="10">
                                <Accordion.Header><strong>11. Data Security</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI implements reasonable technical, administrative, and organizational safeguards designed to protect information from:</p>
                                    <ul>
                                        <li>Unauthorized access;</li>
                                        <li>Disclosure;</li>
                                        <li>Alteration;</li>
                                        <li>Loss;</li>
                                        <li>Misuse;</li>
                                        <li>Destruction.</li>
                                    </ul>
                                    <p>Despite our efforts, no internet-based transmission or storage system can be guaranteed to be completely secure.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="11">
                                <Accordion.Header><strong>12. Your Rights</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Subject to applicable law, users may have the right to:</p>
                                    <ul>
                                        <li>Access their personal information;</li>
                                        <li>Request correction of inaccurate information;</li>
                                        <li>Update profile information;</li>
                                        <li>Withdraw consent where applicable;</li>
                                        <li>Request deletion of information where legally permissible;</li>
                                        <li>Raise privacy-related grievances.</li>
                                    </ul>
                                    <p>Requests may be submitted to the contact details provided below.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="12">
                                <Accordion.Header><strong>13. Account Closure and Deletion Requests</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Users may request account closure by contacting our support team.</p>
                                    <p>Certain information may continue to be retained where required for:</p>
                                    <ul>
                                        <li>Legal compliance;</li>
                                        <li>Healthcare record obligations;</li>
                                        <li>Financial recordkeeping;</li>
                                        <li>Fraud prevention;</li>
                                        <li>Regulatory requirements.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="13">
                                <Accordion.Header><strong>14. Third-Party Websites</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Our Services may contain links to third-party websites or services.</p>
                                    <p>HealthEasy EMI is not responsible for the privacy practices, content, security, or policies of third-party websites.</p>
                                    <p>Users should independently review the privacy policies of such third parties.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="14">
                                <Accordion.Header><strong>15. Children's Privacy</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Our Services are not intended for individuals below eighteen (18) years of age acting independently.</p>
                                    <p>Parents or legal guardians may use the Services on behalf of minors where permitted by law.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="15">
                                <Accordion.Header><strong>16. International Access</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>The Services are intended primarily for users located in India.</p>
                                    <p>Users accessing the Services from outside India acknowledge that their information may be processed and stored in India in accordance with this Privacy Policy and applicable laws.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="16">
                                <Accordion.Header><strong>17. Changes to this Privacy Policy</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI may modify this Privacy Policy from time to time.</p>
                                    <p>Updated versions shall be posted on the website and become effective upon publication unless otherwise stated.</p>
                                    <p>Continued use of the Services after publication constitutes acceptance of the revised Privacy Policy.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="17">
                                <Accordion.Header><strong>18. Grievance and Privacy Contact</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>For privacy-related questions, concerns, requests, or complaints, please contact:</p>
                                    <p>Privacy Officer<br />
                                    Arogya Mantra Healthtech Private Limited<br />
                                    Email: privacy@healtheasyemi.com<br />
                                    Customer Support: support@healtheasyemi.com<br />
                                    Website: www.healtheasyemi.com</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="18">
                                <Accordion.Header><strong>19. Governing Law</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>This Privacy Policy shall be governed by and construed in accordance with the laws of India.</p>
                                    <p>Any disputes arising from this Privacy Policy shall be subject to the exclusive jurisdiction of the competent courts located at Latur, Maharashtra, India.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                        </Accordion>

                        {/* BOTTOM DISCLAIMER NOTE */}
                        <div className="mt-4 p-3 bg-light border rounded small text-muted">
                            <p>HealthEasy EMI is committed to protecting personal and health-related information through lawful, transparent, and secure processing practices. By using our Services, you acknowledge and agree to the collection and use of information as described in this Privacy Policy. Users may contact privacy@healtheasyemi.com for privacy-related requests or concerns.</p>
                        </div>

                    </div>
                </Container>
            </section>

            <FooterBar />
        </>
    );
}

export default PrivacyPolicy;