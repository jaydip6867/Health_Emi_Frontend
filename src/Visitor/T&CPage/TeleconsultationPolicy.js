import { useEffect, useState } from "react";
import FooterBar from "../Component/FooterBar";
import { useNavigate } from "react-router-dom";
import { SECRET_KEY, STORAGE_KEYS } from '../../config';
import CryptoJS from "crypto-js";
import NavBar from "../Component/NavBar";
import { Container, Accordion } from "react-bootstrap";

function TeleconsultationPolicy() {
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
        document.title = "HealthEasy EMI – Teleconsultation Terms & Conditions";
    }, []);

    return (
        <>
            <NavBar logindata={logdata} />
            {/* breadcrumb section */}
            <section className='breadcrumb_Sec'>
                <Container className='text-center '>
                    <h2>HealthEasy EMI Teleconsultation Terms & Conditions</h2>
                </Container>
            </section>
            
            <section className="py-5">
                <Container>
                    <div className="p-3 border rounded">
                        <Accordion defaultActiveKey="0" className='faq-accordion'>
                            
                            <Accordion.Item eventKey="0">
                                <Accordion.Header>1. Introduction</Accordion.Header>
                                <Accordion.Body>
                                    <p>These Terms and Conditions ("Terms") govern the access and use of online medical teleconsultation services provided by Arogya Mantra Healthtech Private Limited, operating under the brand name "HealthEasy EMI" ("HealthEasy EMI", "Company", "we", "our", or "us"), through its website and mobile applications[cite: 539]. By accessing or using the teleconsultation services, you agree to be legally bound by these Terms, our Privacy Policy, and any other policies published on the platform from time to time[cite: 540]. If you do not agree with these Terms, please do not use the Services[cite: 541].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="1">
                                <Accordion.Header>2. About the Service</Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI provides a technology platform that enables patients to consult with qualified and registered medical practitioners ("Practitioners") through telecommunication technologies including text, audio, video, and digital communication channels[cite: 543]. HealthEasy EMI itself does not provide medical advice, diagnosis, treatment, or prescriptions[cite: 544]. Medical services are rendered solely by licensed Practitioners registered to practice medicine in India[cite: 545].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="2">
                                <Accordion.Header>3. Eligibility</Accordion.Header>
                                <Accordion.Body>
                                    <p>You may use the Services only if:</p>
                                    <ul>
                                        <li>You are at least 18 years of age; or [cite: 548]</li>
                                        <li>You are acting through a parent, guardian, or authorized representative; [cite: 549]</li>
                                        <li>You are legally competent to enter into a binding agreement under applicable law; [cite: 550]</li>
                                        <li>You provide accurate and complete information during registration and consultation[cite: 551].</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="3">
                                <Accordion.Header>4. Practitioner Assignment</Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI may assign a Practitioner through its technology platform based on factors including:</p>
                                    <ul>
                                        <li>Consultation category; [cite: 554]</li>
                                        <li>Availability; [cite: 555]</li>
                                        <li>Specialization; [cite: 556]</li>
                                        <li>Medical condition disclosed; [cite: 557]</li>
                                        <li>Appointment timing[cite: 558].</li>
                                    </ul>
                                    <p>Where available, Users may also select a Practitioner from the options displayed on the platform[cite: 559]. HealthEasy EMI does not guarantee consultation with any specific Practitioner unless explicitly booked[cite: 560].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="4">
                                <Accordion.Header>5. Nature and Limitations of Teleconsultation</Accordion.Header>
                                <Accordion.Body>
                                    <p>The User acknowledges and agrees that:</p>
                                    <ul>
                                        <li>Teleconsultation is intended for non-emergency medical situations[cite: 563].</li>
                                        <li>Physical examination is not conducted during teleconsultation[cite: 564].</li>
                                        <li>Certain medical conditions may require in-person examination, diagnostic testing, hospitalization, or emergency treatment[cite: 565].</li>
                                        <li>Advice provided through teleconsultation is based solely on the information shared by the User[cite: 566].</li>
                                        <li>Diagnosis and treatment recommendations may change after physical examination[cite: 567].</li>
                                        <li>The User accepts all risks arising from limitations inherent in remote medical consultation[cite: 568].</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="5">
                                <Accordion.Header>6. Emergency Situations</Accordion.Header>
                                <Accordion.Body>
                                    <p>The Services are not intended for:</p>
                                    <ul>
                                        <li>Medical emergencies; [cite: 571]</li>
                                        <li>Life-threatening conditions; [cite: 572]</li>
                                        <li>Severe injuries; [cite: 573]</li>
                                        <li>Stroke symptoms; [cite: 574]</li>
                                        <li>Heart attack symptoms; [cite: 575]</li>
                                        <li>Breathing difficulties; [cite: 576]</li>
                                        <li>Loss of consciousness; [cite: 577]</li>
                                        <li>Psychiatric emergencies[cite: 578].</li>
                                    </ul>
                                    <p>In such situations, Users must immediately contact local emergency services or visit the nearest healthcare facility[cite: 579].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="6">
                                <Accordion.Header>7. Prescriptions and Medical Advice</Accordion.Header>
                                <Accordion.Body>
                                    <p>Where permitted under applicable law and professional regulations:</p>
                                    <ul>
                                        <li>Practitioners may issue prescriptions electronically[cite: 582].</li>
                                        <li>Prescription issuance remains entirely at the Practitioner's professional discretion[cite: 583].</li>
                                        <li>Certain medicines may not be prescribed through teleconsultation as restricted by applicable Telemedicine Practice Guidelines[cite: 584].</li>
                                        <li>Users acknowledge that prescriptions generated through teleconsultation may require confirmation through physical examination where clinically necessary[cite: 585].</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="7">
                                <Accordion.Header>8. User Responsibilities</Accordion.Header>
                                <Accordion.Body>
                                    <p>Users agree to:</p>
                                    <ul>
                                        <li>Provide truthful, complete, and accurate information[cite: 587].</li>
                                        <li>Disclose relevant medical history[cite: 588].</li>
                                        <li>Share medical reports when requested[cite: 589].</li>
                                        <li>Follow medical advice responsibly[cite: 590].</li>
                                        <li>Seek physical consultation when advised by a Practitioner[cite: 591].</li>
                                    </ul>
                                    <p>Users shall not:</p>
                                    <ul>
                                        <li>Use abusive, threatening, defamatory, obscene, or offensive language[cite: 594].</li>
                                        <li>Harass Practitioners or support personnel[cite: 595].</li>
                                        <li>Upload unlawful, false, or misleading content[cite: 596].</li>
                                        <li>Attempt to obtain prescriptions for prohibited or restricted medicines unlawfully[cite: 597].</li>
                                        <li>Impersonate another individual[cite: 598].</li>
                                    </ul>
                                    <p>HealthEasy EMI reserves the right to suspend or terminate access for violations of these Terms[cite: 599].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="8">
                                <Accordion.Header>9. Medical Records and Consultation Data</Accordion.Header>
                                <Accordion.Body>
                                    <p>During the consultation process, medical records, consultation notes, prescriptions, images, audio/video communications, and diagnostic reports may be stored within the User account for continuity of care, legal compliance, service quality improvement, and dispute resolution purposes[cite: 601, 602, 603, 604, 605, 606, 607, 608]. Such processing shall be governed by the Privacy Policy and applicable Indian laws[cite: 609].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="9">
                                <Accordion.Header>10. Quality Assurance and Clinical Audit</Accordion.Header>
                                <Accordion.Body>
                                    <p>The User expressly consents to HealthEasy EMI conducting quality assurance reviews and clinical audits of consultations for:</p>
                                    <ul>
                                        <li>Patient safety; [cite: 612]</li>
                                        <li>Service quality improvement; [cite: 613]</li>
                                        <li>Regulatory compliance; [cite: 614]</li>
                                        <li>Practitioner performance evaluation[cite: 615].</li>
                                    </ul>
                                    <p>Such reviews may involve authorized medical and compliance personnel and shall be conducted subject to confidentiality obligations[cite: 616].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="10">
                                <Accordion.Header>11. Privacy and Data Protection</Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI processes personal and health-related information in accordance with:</p>
                                    <ul>
                                        <li>Applicable Indian laws; [cite: 619]</li>
                                        <li>Digital Personal Data Protection Act, 2023; [cite: 620]</li>
                                        <li>Information Technology Act, 2000; [cite: 621]</li>
                                        <li>Privacy Policy published on the Platform[cite: 622].</li>
                                    </ul>
                                    <p>By using the Services, Users consent to the collection, processing, storage, and sharing of information strictly for purposes related to healthcare delivery, regulatory compliance, fraud prevention, customer support, and service improvement[cite: 623].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="11">
                                <Accordion.Header>12. Fees and Payments</Accordion.Header>
                                <Accordion.Body>
                                    <p>Consultation fees shall be displayed before booking[cite: 625]. Users agree to make payments through authorized payment channels available on the Platform[cite: 626]. HealthEasy EMI shall not be responsible for payment failures arising from:</p>
                                    <ul>
                                        <li>Banking system failures; [cite: 627]</li>
                                        <li>Network issues; [cite: 628]</li>
                                        <li>Payment gateway interruptions; [cite: 629]</li>
                                        <li>User errors[cite: 631].</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="12">
                                <Accordion.Header>13. Refund Policy</Accordion.Header>
                                <Accordion.Body>
                                    <p>Refund requests may be considered under the following circumstances:</p>
                                    <h6>Eligible Cases</h6>
                                    <ul>
                                        <li>The practitioner fails to join the consultation within the prescribed time[cite: 635].</li>
                                        <li>Consultation is interrupted due to technical issues attributable to the Platform[cite: 636].</li>
                                        <li>Consultation summary or prescription is not provided where clinically appropriate[cite: 637].</li>
                                        <li>Practitioner conduct is found to violate applicable professional standards after internal review[cite: 638].</li>
                                    </ul>
                                    <h6>Non-Refundable Cases</h6>
                                    <ul>
                                        <li>User dissatisfaction with medical opinion[cite: 640].</li>
                                        <li>User failure to follow instructions[cite: 641].</li>
                                        <li>User misconduct or abusive behavior[cite: 642].</li>
                                        <li>Consultation completed successfully[cite: 643].</li>
                                    </ul>
                                    <p>Refund requests must be raised within three (3) calendar days from the consultation date[cite: 644]. Approved refunds shall generally be processed within seven (7) to ten (10) business days[cite: 645]. HealthEasy EMI reserves the right to investigate all refund requests and make the final determination[cite: 646].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="13">
                                <Accordion.Header>14. Intellectual Property</Accordion.Header>
                                <Accordion.Body>
                                    <p>All content, trademarks, logos, software, designs, and platform materials remain the exclusive property of HealthEasy EMI or its licensors[cite: 648]. Users shall not reproduce, distribute, modify, reverse engineer, or commercially exploit any part of the Platform without prior written consent[cite: 649].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="14">
                                <Accordion.Header>15. Termination</Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI may suspend, restrict, or terminate access to the Services without prior notice where:</p>
                                    <ul>
                                        <li>Fraud is suspected; [cite: 652]</li>
                                        <li>Regulatory obligations require action; [cite: 653]</li>
                                        <li>User conduct violates these Terms; [cite: 654]</li>
                                        <li>Platform security is threatened[cite: 655].</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="15">
                                <Accordion.Header>16. Disclaimer</Accordion.Header>
                                <Accordion.Body>
                                    <p>The Services are provided on an "as available" and "as is" basis[cite: 657]. HealthEasy EMI does not guarantee:</p>
                                    <ul>
                                        <li>Any specific medical outcome; [cite: 659]</li>
                                        <li>Recovery from illness; [cite: 660]</li>
                                        <li>Accuracy of self-reported information provided by Users; [cite: 661]</li>
                                        <li>Continuous availability of the Platform[cite: 662].</li>
                                    </ul>
                                    <p>Medical decisions remain the responsibility of the consulting Practitioner and the User[cite: 663].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="16">
                                <Accordion.Header>17. Limitation of Liability</Accordion.Header>
                                <Accordion.Body>
                                    <p>To the maximum extent permitted under applicable law, HealthEasy EMI, its directors, employees, affiliates, agents, contractors, and service providers shall not be liable for:</p>
                                    <ul>
                                        <li>Indirect damages; [cite: 666]</li>
                                        <li>Consequential damages; [cite: 667]</li>
                                        <li>Loss of profits; [cite: 668]</li>
                                        <li>Loss of data; [cite: 669]</li>
                                        <li>Medical complications arising from incomplete or inaccurate information provided by Users; [cite: 670]</li>
                                        <li>Treatment outcomes; [cite: 671]</li>
                                        <li>Service interruptions beyond reasonable control[cite: 672].</li>
                                    </ul>
                                    <p>Nothing in these Terms excludes liability that cannot be excluded under applicable law[cite: 673].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="17">
                                <Accordion.Header>18. Indemnity</Accordion.Header>
                                <Accordion.Body>
                                    <p>The User agrees to indemnify and hold harmless HealthEasy EMI, its directors, officers, employees, affiliates, and representatives against any claims, liabilities, losses, damages, costs, or expenses arising from:</p>
                                    <ul>
                                        <li>Violation of these Terms; [cite: 676]</li>
                                        <li>Misuse of the Platform; [cite: 677]</li>
                                        <li>Submission of false information; [cite: 678]</li>
                                        <li>Violation of applicable laws[cite: 679].</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="18">
                                <Accordion.Header>19. Governing Law, Jurisdiction & Amendments</Accordion.Header>
                                <Accordion.Body>
                                    <p><strong>Governing Law and Jurisdiction:</strong> These Terms shall be governed by and construed in accordance with the laws of India[cite: 681]. Subject to applicable law, courts located at Latur, Maharashtra shall have exclusive jurisdiction over disputes arising out of or relating to these Terms, the Platform, or the Services[cite: 682].</p>
                                    <p><strong>Amendments:</strong> HealthEasy EMI reserves the right to modify these Terms at any time[cite: 684]. Updated versions shall be published on the Platform and shall become effective upon publication[cite: 685]. Continued use of the Services constitutes acceptance of the revised Terms[cite: 686].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="19">
                                <Accordion.Header>20. Regulatory Compliance Declaration</Accordion.Header>
                                <Accordion.Body>
                                    <p>Teleconsultation services available through HealthEasy EMI are provided in accordance with applicable Indian laws, including the Telemedicine Practice Guidelines issued by the National Medical Commission (formerly Medical Council of India), the Information Technology Act, 2000, the Digital Personal Data Protection Act, 2023, and other applicable regulations[cite: 687]. By using this platform, you agree to the Terms & Conditions and Privacy Policy[cite: 688].</p>
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

export default TeleconsultationPolicy;