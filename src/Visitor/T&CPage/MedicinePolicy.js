import { useEffect, useState } from "react";
import FooterBar from "../Component/FooterBar";
import { useNavigate } from "react-router-dom";
import { SECRET_KEY, STORAGE_KEYS } from '../../config';
import CryptoJS from "crypto-js";
import NavBar from "../Component/NavBar";
import { Container, Accordion } from "react-bootstrap";

function MedicinePolicy() {
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
        document.title = "HealthEasy EMI – Medicine Information & Medicinal Products Reference Policy";
    }, []);

    return (
        <>
            <NavBar logindata={logdata} />
            {/* breadcrumb section */}
            <section className='breadcrumb_Sec'>
                <Container className='text-center '>
                    <h2>Medicine Information & Medicinal Products Reference Policy</h2>
                </Container>
            </section>
            
            <section className="py-5">
                <Container>
                    <div className="p-3 border rounded">
                        <Accordion defaultActiveKey="0" className='faq-accordion'>
                            
                            <Accordion.Item eventKey="0">
                                <Accordion.Header>1. Introduction</Accordion.Header>
                                <Accordion.Body>
                                    <p>The HealthEasy EMI Medicine Information System ("Medicine Information Service") is an informational feature made available through the HealthEasy EMI platform to assist users in accessing general information relating to medicines, medicinal products, healthcare products, and related therapeutic information[cite: 389]. This feature is intended solely for educational and informational purposes and should not be considered medical advice, diagnosis, treatment, prescription guidance, or a substitute for consultation with a qualified healthcare professional[cite: 390]. By accessing or using this feature, you acknowledge and agree to the terms of this Policy.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="1">
                                <Accordion.Header>2. Scope of Information</Accordion.Header>
                                <Accordion.Body>
                                    <p>The Medicine Information Service may provide information relating to:</p>
                                    <ul>
                                        <li>Drug compositions and active ingredients; [cite: 394]</li>
                                        <li>Generic and brand-name medicines; [cite: 395]</li>
                                        <li>Therapeutic uses and indications; [cite: 396]</li>
                                        <li>Dosage forms and strengths; [cite: 397]</li>
                                        <li>Common side effects and adverse reactions; [cite: 398]</li>
                                        <li>Drug interactions; [cite: 399]</li>
                                        <li>Contraindications and precautions; [cite: 400]</li>
                                        <li>Alternative medicines or therapeutic options; [cite: 401]</li>
                                        <li>Health conditions and commonly prescribed treatment categories; [cite: 402]</li>
                                        <li>Product pricing information where available; [cite: 403]</li>
                                        <li>Manufacturer and product information; [cite: 404]</li>
                                        <li>Publicly available pharmaceutical and healthcare information. [cite: 405]</li>
                                    </ul>
                                    <p>The information made available through this feature is intended for users located in India and may not be applicable in other jurisdictions. [cite: 406]</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="2">
                                <Accordion.Header>3. Information Sources</Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI may obtain medicine-related information from:</p>
                                    <ul>
                                        <li>Publicly available databases; [cite: 409]</li>
                                        <li>Pharmaceutical reference databases; [cite: 410]</li>
                                        <li>Government publications; [cite: 411]</li>
                                        <li>Healthcare information providers; [cite: 412]</li>
                                        <li>Drug formularies; [cite: 413]</li>
                                        <li>Regulatory resources; [cite: 414]</li>
                                        <li>Third-party content providers; [cite: 415]</li>
                                        <li>Scientific literature and publicly available healthcare resources. [cite: 416]</li>
                                    </ul>
                                    <p>While HealthEasy EMI endeavors to use commercially reasonable efforts to source information from reliable references, we do not independently verify all information contained in such sources. [cite: 417]</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="3">
                                <Accordion.Header>4. Important Notice for Users</Accordion.Header>
                                <Accordion.Body>
                                    <h5>4.1 Informational Purpose Only</h5>
                                    <p>The Medicine Information Service is provided solely for general informational and educational purposes[cite: 420]. Information available through this feature:</p>
                                    <ul>
                                        <li>Does not constitute medical advice; [cite: 422]</li>
                                        <li>Does not create a doctor-patient relationship; [cite: 423]</li>
                                        <li>Does not constitute a prescription; [cite: 424]</li>
                                        <li>Does not replace consultation with a registered medical practitioner; [cite: 425]</li>
                                        <li>Does not guarantee treatment outcomes. [cite: 426]</li>
                                    </ul>
                                    <p>Users should always seek professional medical advice from a qualified healthcare practitioner before:</p>
                                    <ul>
                                        <li>Starting any medication; [cite: 428]</li>
                                        <li>Stopping any medication; [cite: 429]</li>
                                        <li>Changing dosage; [cite: 430]</li>
                                        <li>Combining medicines; [cite: 431]</li>
                                        <li>Making healthcare decisions. [cite: 432]</li>
                                    </ul>
                                    
                                    <h5>4.2 No Self-Medication</h5>
                                    <p>HealthEasy EMI does not encourage, recommend, or endorse self-medication[cite: 434]. Users are strongly advised not to rely solely on information available through this feature when making healthcare decisions[cite: 435].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="4">
                                <Accordion.Header>5. Important Notice for Healthcare Professionals</Accordion.Header>
                                <Accordion.Body>
                                    <p>Healthcare professionals accessing this feature acknowledge that:</p>
                                    <ul>
                                        <li>The information provided is intended as a supplementary informational resource only. [cite: 438]</li>
                                        <li>Clinical decisions must be based on professional judgment, patient assessment, current medical evidence, applicable regulations, and relevant treatment guidelines. [cite: 439]</li>
                                        <li>HealthEasy EMI does not represent or warrant that the information is complete, accurate, current, or suitable for any particular clinical purpose. [cite: 440]</li>
                                        <li>Healthcare professionals remain solely responsible for all diagnostic, prescribing, and treatment decisions. [cite: 441]</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="5">
                                <Accordion.Header>6. Drug Information Accuracy Disclaimer</Accordion.Header>
                                <Accordion.Body>
                                    <p>Medicine-related information changes frequently due to:</p>
                                    <ul>
                                        <li>New clinical research; [cite: 444]</li>
                                        <li>Regulatory updates; [cite: 445]</li>
                                        <li>Safety advisories; [cite: 446]</li>
                                        <li>Product recalls; [cite: 447]</li>
                                        <li>Revised treatment guidelines; [cite: 448]</li>
                                        <li>Manufacturer updates. [cite: 449]</li>
                                    </ul>
                                    <p>Accordingly, HealthEasy EMI does not warrant that any information displayed through this feature is:</p>
                                    <ul>
                                        <li>Accurate; [cite: 451]</li>
                                        <li>Complete; [cite: 452]</li>
                                        <li>Up-to-date; [cite: 453]</li>
                                        <li>Error-free; [cite: 454]</li>
                                        <li>Suitable for a particular purpose. [cite: 455]</li>
                                    </ul>
                                    <p>Users should independently verify information with healthcare professionals and authoritative sources before acting upon it. [cite: 456]</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="6">
                                <Accordion.Header>7. No Regulatory Approval Representation</Accordion.Header>
                                <Accordion.Body>
                                    <p>Information presented through this feature should not be interpreted as:</p>
                                    <ul>
                                        <li>Approval by the Government of India; [cite: 459]</li>
                                        <li>Approval by the Central Drugs Standard Control Organisation (CDSCO); [cite: 460]</li>
                                        <li>Approval by the Drug Controller General of India (DCGI); [cite: 461]</li>
                                        <li>Approval by the Ministry of Health and Family Welfare; [cite: 462]</li>
                                        <li>Certification of safety, efficacy, quality, or suitability. [cite: 463]</li>
                                    </ul>
                                    <p>The inclusion of any medicine, product, supplement, manufacturer, or healthcare product on the platform does not constitute endorsement, recommendation, certification, or approval by HealthEasy EMI. [cite: 464]</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="7">
                                <Accordion.Header>8. Pricing and Availability Information</Accordion.Header>
                                <Accordion.Body>
                                    <p>Where medicine prices, discounts, availability, or product-related commercial information are displayed:</p>
                                    <ul>
                                        <li>Such information is indicative only; [cite: 467]</li>
                                        <li>Availability may vary by location; [cite: 468]</li>
                                        <li>Prices may change without notice; [cite: 469]</li>
                                        <li>Product availability cannot be guaranteed. [cite: 470]</li>
                                    </ul>
                                    <p>Users should verify current pricing and availability directly with pharmacies, healthcare providers, or authorized sellers. [cite: 471]</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="8">
                                <Accordion.Header>9. Third-Party Content and External Links</Accordion.Header>
                                <Accordion.Body>
                                    <p>The Medicine Information Service may contain:</p>
                                    <ul>
                                        <li>Third-party content; [cite: 474]</li>
                                        <li>External references; [cite: 475]</li>
                                        <li>Links to third-party websites; [cite: 476]</li>
                                        <li>Pharmaceutical information sources; [cite: 477]</li>
                                        <li>Advertisements or sponsored content. [cite: 478]</li>
                                    </ul>
                                    <p>HealthEasy EMI does not control or endorse third-party content and is not responsible for:</p>
                                    <ul>
                                        <li>Accuracy; [cite: 480]</li>
                                        <li>Reliability; [cite: 481]</li>
                                        <li>Availability; [cite: 482]</li>
                                        <li>Security; [cite: 483]</li>
                                        <li>Privacy practices; [cite: 484]</li>
                                        <li>Regulatory compliance of third-party websites or services. [cite: 485]</li>
                                    </ul>
                                    <p>Accessing third-party resources is entirely at the user's own risk. [cite: 486]</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="9">
                                <Accordion.Header>10. Intellectual Property</Accordion.Header>
                                <Accordion.Body>
                                    <p>The Medicine Information Service may contain proprietary databases, content, software, trademarks, and intellectual property belonging to HealthEasy EMI or third-party licensors[cite: 488]. Users shall not:</p>
                                    <ul>
                                        <li>Reproduce; [cite: 490]</li>
                                        <li>Redistribute; [cite: 491]</li>
                                        <li>Scrape; [cite: 492]</li>
                                        <li>Copy; [cite: 493]</li>
                                        <li>Reverse engineer; [cite: 494]</li>
                                        <li>Commercially exploit [cite: 495]</li>
                                    </ul>
                                    <p>any content available through this feature without prior written authorization[cite: 496].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="10">
                                <Accordion.Header>11. Limitation of Liability</Accordion.Header>
                                <Accordion.Body>
                                    <p>To the fullest extent permitted under applicable law:</p>
                                    <p>HealthEasy EMI, its affiliates, directors, officers, employees, agents, licensors, contractors, consultants, and representatives shall not be liable for any:</p>
                                    <ul>
                                        <li>Direct loss arising from self-medication; [cite: 500]</li>
                                        <li>Incorrect healthcare decisions; [cite: 501]</li>
                                        <li>Treatment outcomes; [cite: 502]</li>
                                        <li>Adverse drug reactions; [cite: 503]</li>
                                        <li>Medical complications; [cite: 504]</li>
                                        <li>Loss of data; [cite: 505]</li>
                                        <li>Business interruption; [cite: 506]</li>
                                        <li>Loss of profits; [cite: 507]</li>
                                        <li>Indirect, incidental, consequential, punitive, or special damages. [cite: 508]</li>
                                    </ul>
                                    <p>This applies regardless of whether HealthEasy EMI has been advised of the possibility of such damages[cite: 509]. In any event, HealthEasy EMI's aggregate liability arising out of or relating to this feature shall not exceed INR 1,000 (Indian Rupees One Thousand only) or the amount paid by the user to access the relevant service, whichever is lower[cite: 510]. Nothing in this Policy excludes liability that cannot be excluded under applicable law[cite: 511].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="11">
                                <Accordion.Header>12. Indemnity</Accordion.Header>
                                <Accordion.Body>
                                    <p>Users agree to indemnify, defend, and hold harmless HealthEasy EMI, its affiliates, directors, officers, employees, agents, consultants, licensors, and representatives from and against any claims, losses, liabilities, damages, costs, expenses, penalties, or legal proceedings arising from:</p>
                                    <ul>
                                        <li>Use of the Medicine Information Service; [cite: 514]</li>
                                        <li>Reliance on information provided through the feature; [cite: 515]</li>
                                        <li>Violation of applicable laws; [cite: 516]</li>
                                        <li>Breach of this Policy; [cite: 517]</li>
                                        <li>Misuse of healthcare information. [cite: 518]</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="12">
                                <Accordion.Header>13. Updates and Modifications</Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI reserves the right to modify, update, suspend, restrict, or discontinue this feature or this Policy at any time without prior notice[cite: 520]. Updated versions shall become effective immediately upon publication on the platform[cite: 521]. Continued use of the feature constitutes acceptance of the revised Policy[cite: 522].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="13">
                                <Accordion.Header>14. Governing Law and Jurisdiction</Accordion.Header>
                                <Accordion.Body>
                                    <p>This Policy shall be governed by and construed in accordance with the laws of India[cite: 524]. Any dispute arising out of or relating to this Policy shall be subject to the exclusive jurisdiction of the competent courts located at Latur, Maharashtra, India[cite: 525].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="14">
                                <Accordion.Header>15. Contact Information & Final Medical Disclaimer</Accordion.Header>
                                <Accordion.Body>
                                    <p>For questions relating to this Policy, please contact:</p>
                                    <p>HealthEasy EMI Arogya Mantra Healthtech Private Limited<br />
                                    Website: www.healtheasyemi.com<br />
                                    Support Email: support@healtheasyemi.com<br />
                                    Privacy Email: privacy@healtheasyemi.com<br />
                                    Grievance Email: grievance@healtheasyemi.com [cite: 528, 529, 530, 531, 532]</p>
                                    
                                    <hr />
                                    
                                    <p><strong>Final Medical Disclaimer:</strong> The information provided through the HealthEasy EMI Medicine Information Service is for informational and educational purposes only and should not be relied upon as medical advice, diagnosis, treatment, or prescribing guidance[cite: 534]. Always consult a qualified healthcare professional before starting, stopping, or modifying any medication or treatment[cite: 535]. HealthEasy EMI does not endorse any medicine, medicinal product, healthcare product, manufacturer, or treatment and shall not be responsible for healthcare decisions made based on information available through this feature[cite: 536].</p>
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

export default MedicinePolicy;