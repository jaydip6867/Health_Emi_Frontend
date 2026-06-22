import { useEffect, useState } from "react";
import { Container, Accordion } from "react-bootstrap";
import CryptoJS from "crypto-js";
import NavBar from "../Component/NavBar";
import FooterBar from "../Component/FooterBar";
import { SECRET_KEY, STORAGE_KEYS } from '../../config';

function TeleconsultationPolicy() {
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
        document.title = "HealthEasy EMI – Teleconsultation Terms & Conditions";
    }, []);

    return (
        <>
            <NavBar logindata={logdata} />
            
            {/* breadcrumb section */}
            <section className='breadcrumb_Sec'>
                <Container className='text-center'>
                    <h2>HealthEasy EMI Teleconsultation Terms & Conditions</h2>
                </Container>
            </section>
            
            <section className="py-5 bg-light">
                <Container>
                    <div className="p-4 bg-white border rounded shadow-sm">
                        <Accordion defaultActiveKey="0" className='faq-accordion'>
                            
                            <Accordion.Item eventKey="0">
                                <Accordion.Header><strong>1. Introduction</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>These Terms and Conditions ("Terms") govern the access and use of online medical teleconsultation services provided by Arogya Mantra Healthtech Private Limited, operating under the brand name "HealthEasy EMI" ("HealthEasy EMI", "Company", "we", "our", or "us"), through its website and mobile applications.</p>
                                    <p>By accessing or using the teleconsultation services, you agree to be legally bound by these Terms, our Privacy Policy, and any other policies published on the platform from time to time.</p>
                                    <p>If you do not agree with these Terms, please do not use the Services.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="1">
                                <Accordion.Header><strong>2. About the Service</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI provides a technology platform that enables patients to consult with qualified and registered medical practitioners ("Practitioners") through telecommunication technologies including text, audio, video, and digital communication channels.</p>
                                    <p>HealthEasy EMI itself does not provide medical advice, diagnosis, treatment, or prescriptions. Medical services are rendered solely by licensed Practitioners registered to practice medicine in India.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="2">
                                <Accordion.Header><strong>3. Eligibility</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>You may use the Services only if:</p>
                                    <ul>
                                        <li>You are at least 18 years of age; or</li>
                                        <li>You are acting through a parent, guardian, or authorized representative;</li>
                                        <li>You are legally competent to enter into a binding agreement under applicable law;</li>
                                        <li>You provide accurate and complete information during registration and consultation.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="3">
                                <Accordion.Header><strong>4. Practitioner Assignment</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI may assign a Practitioner through its technology platform based on factors including:</p>
                                    <ul>
                                        <li>Consultation category;</li>
                                        <li>Availability;</li>
                                        <li>Specialization;</li>
                                        <li>Medical condition disclosed;</li>
                                        <li>Appointment timing.</li>
                                    </ul>
                                    <p>Where available, Users may also select a Practitioner from the options displayed on the platform.</p>
                                    <p>HealthEasy EMI does not guarantee consultation with any specific Practitioner unless explicitly booked.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="4">
                                <Accordion.Header><strong>5. Nature and Limitations of Teleconsultation</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>The User acknowledges and agrees that:</p>
                                    <ul>
                                        <li>Teleconsultation is intended for non-emergency medical situations.</li>
                                        <li>Physical examination is not conducted during teleconsultation.</li>
                                        <li>Certain medical conditions may require in-person examination, diagnostic testing, hospitalization, or emergency treatment.</li>
                                        <li>Advice provided through teleconsultation is based solely on the information shared by the User.</li>
                                        <li>Diagnosis and treatment recommendations may change after physical examination.</li>
                                    </ul>
                                    <p>The User accepts all risks arising from limitations inherent in remote medical consultation.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="5">
                                <Accordion.Header><strong>6. Emergency Situations</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>The Services are not intended for:</p>
                                    <ul>
                                        <li>Medical emergencies;</li>
                                        <li>Life-threatening conditions;</li>
                                        <li>Severe injuries;</li>
                                        <li>Stroke symptoms;</li>
                                        <li>Heart attack symptoms;</li>
                                        <li>Breathing difficulties;</li>
                                        <li>Loss of consciousness;</li>
                                        <li>Psychiatric emergencies.</li>
                                    </ul>
                                    <p>In such situations, Users must immediately contact local emergency services or visit the nearest healthcare facility.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="6">
                                <Accordion.Header><strong>7. Prescriptions and Medical Advice</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Where permitted under applicable law and professional regulations:</p>
                                    <ul>
                                        <li>Practitioners may issue prescriptions electronically.</li>
                                        <li>Prescription issuance remains entirely at the Practitioner's professional discretion.</li>
                                        <li>Certain medicines may not be prescribed through teleconsultation as restricted by applicable Telemedicine Practice Guidelines.</li>
                                    </ul>
                                    <p>Users acknowledge that prescriptions generated through teleconsultation may require confirmation through physical examination where clinically necessary.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="7">
                                <Accordion.Header><strong>8. User Responsibilities</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Users agree to:</p>
                                    <ul>
                                        <li>Provide truthful, complete, and accurate information.</li>
                                        <li>Disclose relevant medical history.</li>
                                        <li>Share medical reports when requested.</li>
                                        <li>Follow medical advice responsibly.</li>
                                        <li>Seek physical consultation when advised by a Practitioner.</li>
                                    </ul>
                                    <p>Users shall not:</p>
                                    <ul>
                                        <li>Use abusive, threatening, defamatory, obscene, or offensive language.</li>
                                        <li>Harass Practitioners or support personnel.</li>
                                        <li>Upload unlawful, false, or misleading content.</li>
                                        <li>Attempt to obtain prescriptions for prohibited or restricted medicines unlawfully.</li>
                                        <li>Impersonate another individual.</li>
                                    </ul>
                                    <p>HealthEasy EMI reserves the right to suspend or terminate access for violations of these Terms.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="8">
                                <Accordion.Header><strong>9. Medical Records and Consultation Data</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>During the consultation process:</p>
                                    <ul>
                                        <li>Medical records;</li>
                                        <li>Consultation notes;</li>
                                        <li>Prescriptions;</li>
                                        <li>Images;</li>
                                        <li>Audio/video communications;</li>
                                        <li>Diagnostic reports</li>
                                    </ul>
                                    <p>may be stored within the User account for continuity of care, legal compliance, service quality improvement, and dispute resolution purposes.</p>
                                    <p>Such processing shall be governed by the Privacy Policy and applicable Indian laws.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="9">
                                <Accordion.Header><strong>10. Quality Assurance and Clinical Audit</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>The User expressly consents to HealthEasy EMI conducting quality assurance reviews and clinical audits of consultations for:</p>
                                    <ul>
                                        <li>Patient safety;</li>
                                        <li>Service quality improvement;</li>
                                        <li>Regulatory compliance;</li>
                                        <li>Practitioner performance evaluation.</li>
                                    </ul>
                                    <p>Such reviews may involve authorized medical and compliance personnel and shall be conducted subject to confidentiality obligations.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="10">
                                <Accordion.Header><strong>11. Privacy and Data Protection</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI processes personal and health-related information in accordance with:</p>
                                    <ul>
                                        <li>Applicable Indian laws;</li>
                                        <li>Digital Personal Data Protection Act, 2023;</li>
                                        <li>Information Technology Act, 2000;</li>
                                        <li>Privacy Policy published on the Platform.</li>
                                    </ul>
                                    <p>By using the Services, Users consent to the collection, processing, storage, and sharing of information strictly for purposes related to healthcare delivery, regulatory compliance, fraud prevention, customer support, and service improvement.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="11">
                                <Accordion.Header><strong>12. Fees and Payments</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Consultation fees shall be displayed before booking.</p>
                                    <p>Users agree to make payments through authorized payment channels available on the Platform.</p>
                                    <p>HealthEasy EMI shall not be responsible for payment failures arising from:</p>
                                    <ul>
                                        <li>Banking system failures;</li>
                                        <li>Network issues;</li>
                                        <li>Payment gateway interruptions;</li>
                                        <li>User errors.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="12">
                                <Accordion.Header><strong>13. Refund Policy</strong></Accordion.Header>
                                <Accordion.Body>
                                    <h6>Eligible Cases</h6>
                                    <ul>
                                        <li>The practitioner fails to join the consultation within the prescribed time.</li>
                                        <li>Consultation is interrupted due to technical issues attributable to the Platform.</li>
                                        <li>Consultation summary or prescription is not provided where clinically appropriate.</li>
                                        <li>Practitioner conduct is found to violate applicable professional standards after internal review.</li>
                                    </ul>
                                    <h6>Non-Refundable Cases</h6>
                                    <ul>
                                        <li>User dissatisfaction with medical opinion.</li>
                                        <li>User failure to follow instructions.</li>
                                        <li>User misconduct or abusive behavior.</li>
                                        <li>Consultation completed successfully.</li>
                                    </ul>
                                    <p>Refund requests must be raised within three (3) calendar days from the consultation date.</p>
                                    <p>Approved refunds shall generally be processed within seven (7) to ten (10) business days.</p>
                                    <p>HealthEasy EMI reserves the right to investigate all refund requests and make the final determination.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="13">
                                <Accordion.Header><strong>14. Intellectual Property</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>All content, trademarks, logos, software, designs, and platform materials remain the exclusive property of HealthEasy EMI or its licensors.</p>
                                    <p>Users shall not reproduce, distribute, modify, reverse engineer, or commercially exploit any part of the Platform without prior written consent.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="14">
                                <Accordion.Header><strong>15. Termination</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI may suspend, restrict, or terminate access to the Services without prior notice where:</p>
                                    <ul>
                                        <li>Fraud is suspected;</li>
                                        <li>Regulatory obligations require action;</li>
                                        <li>User conduct violates these Terms;</li>
                                        <li>Platform security is threatened.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="15">
                                <Accordion.Header><strong>16. Disclaimer</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>The Services are provided on an "as available" and "as is" basis.</p>
                                    <p>HealthEasy EMI does not guarantee:</p>
                                    <ul>
                                        <li>Any specific medical outcome;</li>
                                        <li>Recovery from illness;</li>
                                        <li>Accuracy of self-reported information provided by Users;</li>
                                        <li>Continuous availability of the Platform.</li>
                                    </ul>
                                    <p>Medical decisions remain the responsibility of the consulting Practitioner and the User.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="16">
                                <Accordion.Header><strong>17. Limitation of Liability</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>To the maximum extent permitted under applicable law, HealthEasy EMI, its directors, employees, affiliates, agents, contractors, and service providers shall not be liable for:</p>
                                    <ul>
                                        <li>Indirect damages;</li>
                                        <li>Consequential damages;</li>
                                        <li>Loss of profits;</li>
                                        <li>Loss of data;</li>
                                        <li>Medical complications arising from incomplete or inaccurate information provided by Users;</li>
                                        <li>Treatment outcomes;</li>
                                        <li>Service interruptions beyond reasonable control.</li>
                                    </ul>
                                    <p>Nothing in these Terms excludes liability that cannot be excluded under applicable law.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="17">
                                <Accordion.Header><strong>18. Indemnity</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>The User agrees to indemnify and hold harmless HealthEasy EMI, its directors, officers, employees, affiliates, and representatives against any claims, liabilities, losses, damages, costs, or expenses arising from:</p>
                                    <ul>
                                        <li>Violation of these Terms;</li>
                                        <li>Misuse of the Platform;</li>
                                        <li>Submission of false information;</li>
                                        <li>Violation of applicable laws.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="18">
                                <Accordion.Header><strong>19. Governing Law and Jurisdiction</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>These Terms shall be governed by and construed in accordance with the laws of India.</p>
                                    <p>Subject to applicable law, courts located at Latur, Maharashtra shall have exclusive jurisdiction over disputes arising out of or relating to these Terms, the Platform, or the Services.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="19">
                                <Accordion.Header><strong>20. Amendments</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI reserves the right to modify these Terms at any time.</p>
                                    <p>Updated versions shall be published on the Platform and shall become effective upon publication.</p>
                                    <p>Continued use of the Services constitutes acceptance of the revised Terms.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                        </Accordion>

                        {/* BOTTOM DISCLAIMER NOTE */}
                        <div className="mt-4 p-3 bg-light border rounded small text-muted">
                            <p>Teleconsultation services available through HealthEasy EMI are provided in accordance with applicable Indian laws, including the Telemedicine Practice Guidelines issued by the National Medical Commission (formerly Medical Council of India), the Information Technology Act, 2000, the Digital Personal Data Protection Act, 2023, and other applicable regulations. By using this platform, you agree to the Terms & Conditions and Privacy Policy.</p>
                        </div>

                    </div>
                </Container>
            </section>

            <FooterBar />
        </>
    );
}

export default TeleconsultationPolicy;