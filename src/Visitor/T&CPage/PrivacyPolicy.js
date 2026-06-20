import { useEffect, useState } from "react";
import FooterBar from "../Component/FooterBar";
import { useNavigate } from "react-router-dom";
import { SECRET_KEY, STORAGE_KEYS } from '../../config';
import CryptoJS from "crypto-js";
import NavBar from "../Component/NavBar";
import { Container, Accordion } from "react-bootstrap";

function PrivacyPolicy() {
    const navigate = useNavigate();

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
                <Container className='text-center '>
                    <h2>Privacy Policy</h2>
                </Container>
            </section>
            
            <section className="py-5">
                <Container>
                    <div className="p-3 border rounded">
                        <Accordion defaultActiveKey="0" className='faq-accordion'>
                            
                            <Accordion.Item eventKey="0">
                                <Accordion.Header>1. Introduction</Accordion.Header>
                                <Accordion.Body>
                                    <p>Arogya Mantra Healthtech Private Limited, operating under the brand name "HealthEasy EMI" ("HealthEasy EMI", "Company", "we", "our", or "us"), respects your privacy and is committed to protecting your personal data[cite: 177].</p>
                                    <p>This Privacy Policy explains how we collect, use, store, process, share, disclose, retain, and protect information relating to users of our website, mobile applications, teleconsultation services, appointment booking services, healthcare financing services, and related offerings (collectively, the "Services")[cite: 178].</p>
                                    <p>By accessing or using our Services, you acknowledge that you have read, understood, and agree to this Privacy Policy and our Terms & Conditions[cite: 179]. If you do not agree with this Privacy Policy, please discontinue use of the Services[cite: 180].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="1">
                                <Accordion.Header>2. Applicability</Accordion.Header>
                                <Accordion.Body>
                                    <p>This Privacy Policy applies to[cite: 181]:</p>
                                    <ul>
                                        <li>Patients and healthcare consumers[cite: 183];</li>
                                        <li>Registered medical practitioners[cite: 184];</li>
                                        <li>Clinics, hospitals, diagnostic centers, and healthcare establishments[cite: 185];</li>
                                        <li>Visitors to the HealthEasy EMI website[cite: 186];</li>
                                        <li>Users of mobile applications and digital platforms operated by HealthEasy EMI[cite: 187].</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="2">
                                <Accordion.Header>3. Legal Basis for Processing</Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI processes personal data in accordance with applicable Indian laws, including[cite: 189]:</p>
                                    <ul>
                                        <li>Digital Personal Data Protection Act, 2023[cite: 190];</li>
                                        <li>Information Technology Act, 2000[cite: 191];</li>
                                        <li>Information Technology Rules, as applicable[cite: 192];</li>
                                        <li>Telemedicine Practice Guidelines[cite: 193];</li>
                                        <li>Other applicable healthcare, financial, and consumer protection regulations[cite: 194].</li>
                                    </ul>
                                    <p>By using our Services, you consent to the processing of your personal information for the purposes described in this Privacy Policy where consent is required under applicable law[cite: 195].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="3">
                                <Accordion.Header>4. Information We Collect</Accordion.Header>
                                <Accordion.Body>
                                    <h5>4.1 Personal Information [cite: 197]</h5>
                                    <p>We may collect[cite: 198]:</p>
                                    <ul>
                                        <li>Full name[cite: 199];</li>
                                        <li>Date of birth[cite: 200];</li>
                                        <li>Age[cite: 201];</li>
                                        <li>Gender[cite: 202];</li>
                                        <li>Residential address[cite: 203];</li>
                                        <li>Email address[cite: 204];</li>
                                        <li>Mobile number[cite: 205];</li>
                                        <li>Emergency contact details[cite: 206].</li>
                                    </ul>

                                    <h5>4.2 Identity Verification Information [cite: 207]</h5>
                                    <p>Where applicable, we may collect[cite: 208]:</p>
                                    <ul>
                                        <li>PAN details[cite: 209];</li>
                                        <li>Aadhaar details (where legally permitted)[cite: 210];</li>
                                        <li>Government-issued identity documents[cite: 211];</li>
                                        <li>Healthcare professional registration information[cite: 212].</li>
                                    </ul>

                                    <h5>4.3 Healthcare Information [cite: 213]</h5>
                                    <p>To provide healthcare-related services, we may collect[cite: 214]:</p>
                                    <ul>
                                        <li>Medical history[cite: 215];</li>
                                        <li>Symptoms and diagnoses[cite: 216];</li>
                                        <li>Consultation records[cite: 217];</li>
                                        <li>Prescriptions[cite: 218];</li>
                                        <li>Diagnostic reports[cite: 219];</li>
                                        <li>Laboratory reports[cite: 220];</li>
                                        <li>Hospital records[cite: 221];</li>
                                        <li>Healthcare provider information[cite: 222].</li>
                                    </ul>

                                    <h5>4.4 Appointment and Consultation Information [cite: 223]</h5>
                                    <p>We may collect[cite: 224]:</p>
                                    <ul>
                                        <li>Appointment details[cite: 225];</li>
                                        <li>Teleconsultation records[cite: 226];</li>
                                        <li>Consultation summaries[cite: 227];</li>
                                        <li>Communication history[cite: 228];</li>
                                        <li>Follow-up information[cite: 229].</li>
                                    </ul>

                                    <h5>4.5 Financial Information [cite: 230]</h5>
                                    <p>For healthcare financing and payment services, we may collect[cite: 231]:</p>
                                    <ul>
                                        <li>Payment information[cite: 232];</li>
                                        <li>Transaction records[cite: 233];</li>
                                        <li>Bank account details where required[cite: 234];</li>
                                        <li>Insurance information where applicable[cite: 235].</li>
                                    </ul>
                                    <p>Payment card information is generally processed through authorized payment service providers and is not stored by HealthEasy EMI except where required for lawful business purposes[cite: 236].</p>

                                    <h5>4.6 Technical Information [cite: 237]</h5>
                                    <p>We may automatically collect[cite: 238]:</p>
                                    <ul>
                                        <li>Device information[cite: 239];</li>
                                        <li>IP address[cite: 240];</li>
                                        <li>Browser type[cite: 241];</li>
                                        <li>Operating system[cite: 242];</li>
                                        <li>Mobile device identifiers[cite: 243];</li>
                                        <li>Log files[cite: 244];</li>
                                        <li>Usage statistics[cite: 245];</li>
                                        <li>Session information[cite: 246].</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="4">
                                <Accordion.Header>5. How We Use Information</Accordion.Header>
                                <Accordion.Body>
                                    <p>We may use personal information for the following purposes[cite: 248]:</p>
                                    
                                    <h6>Service Delivery [cite: 249]</h6>
                                    <ul>
                                        <li>Appointment booking[cite: 250];</li>
                                        <li>Teleconsultation services[cite: 251];</li>
                                        <li>Healthcare coordination[cite: 252];</li>
                                        <li>Healthcare financing facilitation[cite: 253];</li>
                                        <li>Customer support[cite: 254].</li>
                                    </ul>

                                    <h6>Identity Verification [cite: 255]</h6>
                                    <ul>
                                        <li>User authentication[cite: 256];</li>
                                        <li>Fraud prevention[cite: 257];</li>
                                        <li>Security monitoring[cite: 258];</li>
                                        <li>Regulatory compliance[cite: 259].</li>
                                    </ul>

                                    <h6>Communication [cite: 260]</h6>
                                    <ul>
                                        <li>Appointment reminders[cite: 261];</li>
                                        <li>Service notifications[cite: 262];</li>
                                        <li>Customer support communications[cite: 263];</li>
                                        <li>Transaction updates[cite: 264];</li>
                                        <li>Account-related notifications[cite: 265].</li>
                                    </ul>

                                    <h6>Product Improvement [cite: 266]</h6>
                                    <ul>
                                        <li>Service enhancement[cite: 267];</li>
                                        <li>Platform analytics[cite: 268];</li>
                                        <li>User experience optimization[cite: 269];</li>
                                        <li>Research and statistical analysis[cite: 270].</li>
                                    </ul>

                                    <h6>Legal and Regulatory Compliance [cite: 271]</h6>
                                    <ul>
                                        <li>Compliance with applicable laws[cite: 272];</li>
                                        <li>Dispute resolution[cite: 273];</li>
                                        <li>Enforcement of agreements[cite: 274];</li>
                                        <li>Audit and risk management[cite: 275].</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="5">
                                <Accordion.Header>6. Consent and Communication Preferences</Accordion.Header>
                                <Accordion.Body>
                                    <p>Where required by law, HealthEasy EMI seeks consent before sending marketing communications[cite: 277]. Users may[cite: 278]:</p>
                                    <ul>
                                        <li>Opt out of promotional communications[cite: 279];</li>
                                        <li>Withdraw marketing consent[cite: 280];</li>
                                        <li>Update communication preferences through account settings or customer support[cite: 281].</li>
                                    </ul>
                                    <p>Transactional and service-related communications may continue where necessary for service delivery, security, legal compliance, or account administration[cite: 282].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="6">
                                <Accordion.Header>7. Sharing of Information</Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI does not sell personal information[cite: 284]. We may share information with[cite: 285]:</p>
                                    
                                    <h6>Healthcare Providers [cite: 286]</h6>
                                    <p>Including[cite: 287]:</p>
                                    <ul>
                                        <li>Doctors[cite: 288];</li>
                                        <li>Clinics[cite: 289];</li>
                                        <li>Hospitals[cite: 290];</li>
                                        <li>Diagnostic centers[cite: 291];</li>
                                        <li>Healthcare establishments involved in providing healthcare services[cite: 292].</li>
                                    </ul>

                                    <h6>Service Providers [cite: 293]</h6>
                                    <p>Authorized vendors assisting with[cite: 294]:</p>
                                    <ul>
                                        <li>Technology infrastructure[cite: 295];</li>
                                        <li>Payment processing[cite: 296];</li>
                                        <li>Cloud hosting[cite: 297];</li>
                                        <li>Communication services[cite: 298];</li>
                                        <li>Customer support[cite: 299];</li>
                                        <li>Security services[cite: 300].</li>
                                    </ul>

                                    <h6>Lending and Financial Partners [cite: 301]</h6>
                                    <p>Where users apply for healthcare financing, information may be shared with authorized lenders, financial institutions, and verification agencies subject to applicable consent and legal requirements[cite: 302].</p>

                                    <h6>Government Authorities [cite: 303]</h6>
                                    <p>Where required by law, regulation, court order, or lawful governmental request[cite: 304].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="7">
                                <Accordion.Header>8. Teleconsultation Data</Accordion.Header>
                                <Accordion.Body>
                                    <p>Teleconsultation interactions may involve[cite: 305]:</p>
                                    <ul>
                                        <li>Text communications[cite: 307];</li>
                                        <li>Audio communications[cite: 308];</li>
                                        <li>Video consultations[cite: 309];</li>
                                        <li>Uploaded images[cite: 310];</li>
                                        <li>Medical documents[cite: 311];</li>
                                        <li>Prescriptions[cite: 312].</li>
                                    </ul>
                                    <p>Such information may be retained for[cite: 313]:</p>
                                    <ul>
                                        <li>Continuity of care[cite: 314];</li>
                                        <li>Regulatory compliance[cite: 315];</li>
                                        <li>Quality assurance[cite: 316];</li>
                                        <li>Patient safety[cite: 317];</li>
                                        <li>Dispute resolution[cite: 318].</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="8">
                                <Accordion.Header>9. Cookies and Similar Technologies</Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI uses cookies and similar technologies to[cite: 320]:</p>
                                    <ul>
                                        <li>Maintain website functionality[cite: 321];</li>
                                        <li>Improve user experience[cite: 322];</li>
                                        <li>Analyze platform performance[cite: 323];</li>
                                        <li>Enhance security[cite: 324].</li>
                                    </ul>
                                    <p>Users may disable cookies through browser settings; however, certain website functions may become unavailable[cite: 325].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="9">
                                <Accordion.Header>10. Data Retention</Accordion.Header>
                                <Accordion.Body>
                                    <p>We retain information only for as long as reasonably necessary for[cite: 327]:</p>
                                    <ul>
                                        <li>Service delivery[cite: 328];</li>
                                        <li>Healthcare continuity[cite: 329];</li>
                                        <li>Legal compliance[cite: 330];</li>
                                        <li>Regulatory obligations[cite: 331];</li>
                                        <li>Fraud prevention[cite: 332];</li>
                                        <li>Business operations[cite: 333].</li>
                                    </ul>
                                    <p>Following expiry of applicable retention periods, information may be securely deleted, anonymized, or aggregated[cite: 334].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="10">
                                <Accordion.Header>11. Data Security</Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI implements reasonable technical, administrative, and organizational safeguards designed to protect information from[cite: 335]:</p>
                                    <ul>
                                        <li>Unauthorized access[cite: 337];</li>
                                        <li>Disclosure[cite: 338];</li>
                                        <li>Alteration[cite: 339];</li>
                                        <li>Loss[cite: 340];</li>
                                        <li>Misuse[cite: 341];</li>
                                        <li>Destruction[cite: 342].</li>
                                    </ul>
                                    <p>Despite our efforts, no internet-based transmission or storage system can be guaranteed to be completely secure[cite: 343].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="11">
                                <Accordion.Header>12. Your Rights</Accordion.Header>
                                <Accordion.Body>
                                    <p>Subject to applicable law, users may have the right to[cite: 345]:</p>
                                    <ul>
                                        <li>Access their personal information[cite: 346];</li>
                                        <li>Request correction of inaccurate information[cite: 347];</li>
                                        <li>Update profile information[cite: 348];</li>
                                        <li>Withdraw consent where applicable[cite: 349];</li>
                                        <li>Request deletion of information where legally permissible[cite: 350];</li>
                                        <li>Raise privacy-related grievances[cite: 351].</li>
                                    </ul>
                                    <p>Requests may be submitted to the contact details provided below[cite: 352].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="12">
                                <Accordion.Header>13. Account Closure and Deletion Requests</Accordion.Header>
                                <Accordion.Body>
                                    <p>Users may request account closure by contacting our support team[cite: 354]. Certain information may continue to be retained where required for[cite: 355]:</p>
                                    <ul>
                                        <li>Legal compliance[cite: 356];</li>
                                        <li>Healthcare record obligations[cite: 357];</li>
                                        <li>Financial recordkeeping[cite: 358];</li>
                                        <li>Fraud prevention[cite: 359];</li>
                                        <li>Regulatory requirements[cite: 360].</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="13">
                                <Accordion.Header>14. Third-Party Websites</Accordion.Header>
                                <Accordion.Body>
                                    <p>Our Services may contain links to third-party websites or services[cite: 362]. HealthEasy EMI is not responsible for the privacy practices, content, security, or policies of third-party websites[cite: 363]. Users should independently review the privacy policies of such third parties[cite: 364].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="14">
                                <Accordion.Header>15. Children's Privacy</Accordion.Header>
                                <Accordion.Body>
                                    <p>Our Services are not intended for individuals below eighteen (18) years of age acting independently[cite: 366]. Parents or legal guardians may use the Services on behalf of minors where permitted by law[cite: 367].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="15">
                                <Accordion.Header>16. International Access</Accordion.Header>
                                <Accordion.Body>
                                    <p>The Services are intended primarily for users located in India[cite: 369]. Users accessing the Services from outside India acknowledge that their information may be processed and stored in India in accordance with this Privacy Policy and applicable laws[cite: 370].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="16">
                                <Accordion.Header>17. Changes to this Privacy Policy</Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI may modify this Privacy Policy from time to time[cite: 371]. Updated versions shall be posted on the website and become effective upon publication unless otherwise stated[cite: 373]. Continued use of the Services after publication constitutes acceptance of the revised Privacy Policy[cite: 374].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="17">
                                <Accordion.Header>18. Grievance and Privacy Contact</Accordion.Header>
                                <Accordion.Body>
                                    <p>For privacy-related questions, concerns, requests, or complaints, please contact[cite: 376]:</p>
                                    <p>Privacy Officer Arogya Mantra Healthtech Private Limited [cite: 377]<br />
                                    Email: privacy@healtheasyemi.com [cite: 378]<br />
                                    Customer Support: support@healtheasyemi.com [cite: 379]<br />
                                    Website: www.healtheasyemi.com [cite: 380]</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="18">
                                <Accordion.Header>19. Governing Law</Accordion.Header>
                                <Accordion.Body>
                                    <p>This Privacy Policy shall be governed by and construed in accordance with the laws of India[cite: 382]. Any disputes arising from this Privacy Policy shall be subject to the exclusive jurisdiction of the competent courts located at Latur, Maharashtra, India[cite: 383].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="19">
                                <Accordion.Header>20. Additional Commitments & Acknowledgments</Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI is committed to protecting personal and health-related information through lawful, transparent, and secure processing practices[cite: 384]. By using our Services, you acknowledge and agree to the collection and use of information as described in this Privacy Policy[cite: 385]. Users may contact privacy@healtheasyemi.com for privacy-related requests or concerns[cite: 386].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                        </Accordion>
                    </div>
                </Container>
            </section>

            <FooterBar />
        </>
    );
}

export default PrivacyPolicy;