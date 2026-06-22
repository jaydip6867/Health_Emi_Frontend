import { useEffect, useState } from "react";
import { Container, Accordion } from "react-bootstrap";
import CryptoJS from "crypto-js";
import NavBar from "../Component/NavBar";
import FooterBar from "../Component/FooterBar";
import { SECRET_KEY, STORAGE_KEYS } from '../../config';

function MedicinePolicy() {
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
                <Container className='text-center'>
                    <h2>Medicine Information & Medicinal Products Reference Policy</h2>
                </Container>
            </section>
            
            <section className="py-5 bg-light">
                <Container>
                    <div className="p-4 bg-white border rounded shadow-sm">
                        <Accordion defaultActiveKey="0" className='faq-accordion'>
                            
                            <Accordion.Item eventKey="0">
                                <Accordion.Header><strong>1. Introduction</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>The HealthEasy EMI Medicine Information System ("Medicine Information Service") is an informational feature made available through the HealthEasy EMI platform to assist users in accessing general information relating to medicines, medicinal products, healthcare products, and related therapeutic information.</p>
                                    <p>This feature is intended solely for educational and informational purposes and should not be considered medical advice, diagnosis, treatment, prescription guidance, or a substitute for consultation with a qualified healthcare professional.</p>
                                    <p>By accessing or using this feature, you acknowledge and agree to the terms of this Policy.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="1">
                                <Accordion.Header><strong>2. Scope of Information</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>The Medicine Information Service may provide information relating to:</p>
                                    <ul>
                                        <li>Drug compositions and active ingredients;</li>
                                        <li>Generic and brand-name medicines;</li>
                                        <li>Therapeutic uses and indications;</li>
                                        <li>Dosage forms and strengths;</li>
                                        <li>Common side effects and adverse reactions;</li>
                                        <li>Drug interactions;</li>
                                        <li>Contraindications and precautions;</li>
                                        <li>Alternative medicines or therapeutic options;</li>
                                        <li>Health conditions and commonly prescribed treatment categories;</li>
                                        <li>Product pricing information where available;</li>
                                        <li>Manufacturer and product information;</li>
                                        <li>Publicly available pharmaceutical and healthcare information.</li>
                                    </ul>
                                    <p>The information made available through this feature is intended for users located in India and may not be applicable in other jurisdictions.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="2">
                                <Accordion.Header><strong>3. Information Sources</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI may obtain medicine-related information from:</p>
                                    <ul>
                                        <li>Publicly available databases;</li>
                                        <li>Pharmaceutical reference databases;</li>
                                        <li>Government publications;</li>
                                        <li>Healthcare information providers;</li>
                                        <li>Drug formularies;</li>
                                        <li>Regulatory resources;</li>
                                        <li>Third-party content providers;</li>
                                        <li>Scientific literature and publicly available healthcare resources.</li>
                                    </ul>
                                    <p>While HealthEasy EMI endeavors to use commercially reasonable efforts to source information from reliable references, we do not independently verify all information contained in such sources.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="3">
                                <Accordion.Header><strong>4. Important Notice for Users</strong></Accordion.Header>
                                <Accordion.Body>
                                    <h6>4.1 Informational Purpose Only</h6>
                                    <p>The Medicine Information Service is provided solely for general informational and educational purposes.</p>
                                    <p>Information available through this feature:</p>
                                    <ul>
                                        <li>Does not constitute medical advice;</li>
                                        <li>Does not create a doctor-patient relationship;</li>
                                        <li>Does not constitute a prescription;</li>
                                        <li>Does not replace consultation with a registered medical practitioner;</li>
                                        <li>Does not guarantee treatment outcomes.</li>
                                    </ul>
                                    <p>Users should always seek professional medical advice from a qualified healthcare practitioner before:</p>
                                    <ul>
                                        <li>Starting any medication;</li>
                                        <li>Stopping any medication;</li>
                                        <li>Changing dosage;</li>
                                        <li>Combining medicines;</li>
                                        <li>Making healthcare decisions.</li>
                                    </ul>
                                    
                                    <h6>4.2 No Self-Medication</h6>
                                    <p>HealthEasy EMI does not encourage, recommend, or endorse self-medication.</p>
                                    <p>Users are strongly advised not to rely solely on information available through this feature when making healthcare decisions.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="4">
                                <Accordion.Header><strong>5. Important Notice for Healthcare Professionals</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Healthcare professionals accessing this feature acknowledge that:</p>
                                    <ul>
                                        <li>The information provided is intended as a supplementary informational resource only.</li>
                                        <li>Clinical decisions must be based on professional judgment, patient assessment, current medical evidence, applicable regulations, and relevant treatment guidelines.</li>
                                        <li>HealthEasy EMI does not represent or warrant that the information is complete, accurate, current, or suitable for any particular clinical purpose.</li>
                                    </ul>
                                    <p>Healthcare professionals remain solely responsible for all diagnostic, prescribing, and treatment decisions.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="5">
                                <Accordion.Header><strong>6. Drug Information Accuracy Disclaimer</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Medicine-related information changes frequently due to:</p>
                                    <ul>
                                        <li>New clinical research;</li>
                                        <li>Regulatory updates;</li>
                                        <li>Safety advisories;</li>
                                        <li>Product recalls;</li>
                                        <li>Revised treatment guidelines;</li>
                                        <li>Manufacturer updates.</li>
                                    </ul>
                                    <p>Accordingly, HealthEasy EMI does not warrant that any information displayed through this feature is:</p>
                                    <ul>
                                        <li>Accurate;</li>
                                        <li>Complete;</li>
                                        <li>Up-to-date;</li>
                                        <li>Error-free;</li>
                                        <li>Suitable for a particular purpose.</li>
                                    </ul>
                                    <p>Users should independently verify information with healthcare professionals and authoritative sources before acting upon it.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="6">
                                <Accordion.Header><strong>7. No Regulatory Approval Representation</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Information presented through this feature should not be interpreted as:</p>
                                    <ul>
                                        <li>Approval by the Government of India;</li>
                                        <li>Approval by the Central Drugs Standard Control Organisation (CDSCO);</li>
                                        <li>Approval by the Drug Controller General of India (DCGI);</li>
                                        <li>Approval by the Ministry of Health and Family Welfare;</li>
                                        <li>Certification of safety, efficacy, quality, or suitability.</li>
                                    </ul>
                                    <p>The inclusion of any medicine, product, supplement, manufacturer, or healthcare product on the platform does not constitute endorsement, recommendation, certification, or approval by HealthEasy EMI.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="7">
                                <Accordion.Header><strong>8. Pricing and Availability Information</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Where medicine prices, discounts, availability, or product-related commercial information are displayed:</p>
                                    <ul>
                                        <li>Such information is indicative only;</li>
                                        <li>Availability may vary by location;</li>
                                        <li>Prices may change without notice;</li>
                                        <li>Product availability cannot be guaranteed.</li>
                                    </ul>
                                    <p>Users should verify current pricing and availability directly with pharmacies, healthcare providers, or authorized sellers.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="8">
                                <Accordion.Header><strong>9. Third-Party Content and External Links</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>The Medicine Information Service may contain:</p>
                                    <ul>
                                        <li>Third-party content;</li>
                                        <li>External references;</li>
                                        <li>Links to third-party websites;</li>
                                        <li>Pharmaceutical information sources;</li>
                                        <li>Advertisements or sponsored content.</li>
                                    </ul>
                                    <p>HealthEasy EMI does not control or endorse third-party content and is not responsible for:</p>
                                    <ul>
                                        <li>Accuracy;</li>
                                        <li>Reliability;</li>
                                        <li>Availability;</li>
                                        <li>Security;</li>
                                        <li>Privacy practices;</li>
                                        <li>Regulatory compliance of third-party websites or services.</li>
                                    </ul>
                                    <p>Accessing third-party resources is entirely at the user's own risk.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="9">
                                <Accordion.Header><strong>10. Intellectual Property</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>The Medicine Information Service may contain proprietary databases, content, software, trademarks, and intellectual property belonging to HealthEasy EMI or third-party licensors.</p>
                                    <p>Users shall not:</p>
                                    <ul>
                                        <li>Reproduce;</li>
                                        <li>Redistribute;</li>
                                        <li>Scrape;</li>
                                        <li>Copy;</li>
                                        <li>Reverse engineer;</li>
                                        <li>Commercially exploit</li>
                                    </ul>
                                    <p>any content available through this feature without prior written authorization.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="10">
                                <Accordion.Header><strong>11. Limitation of Liability</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>To the fullest extent permitted under applicable law:</p>
                                    <p>HealthEasy EMI, its affiliates, directors, officers, employees, agents, licensors, contractors, consultants, and representatives shall not be liable for any:</p>
                                    <ul>
                                        <li>Direct loss arising from self-medication;</li>
                                        <li>Incorrect healthcare decisions;</li>
                                        <li>Treatment outcomes;</li>
                                        <li>Adverse drug reactions;</li>
                                        <li>Medical complications;</li>
                                        <li>Loss of data;</li>
                                        <li>Business interruption;</li>
                                        <li>Loss of profits;</li>
                                        <li>Indirect, incidental, consequential, punitive, or special damages.</li>
                                    </ul>
                                    <p>This applies regardless of whether HealthEasy EMI has been advised of the possibility of such damages.</p>
                                    <p>In any event, HealthEasy EMI's aggregate liability arising out of or relating to this feature shall not exceed INR 1,000 (Indian Rupees One Thousand only) or the amount paid by the user to access the relevant service, whichever is lower.</p>
                                    <p>Nothing in this Policy excludes liability that cannot be excluded under applicable law.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="11">
                                <Accordion.Header><strong>12. Indemnity</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Users agree to indemnify, defend, and hold harmless HealthEasy EMI, its affiliates, directors, officers, employees, agents, consultants, licensors, and representatives from and against any claims, losses, liabilities, damages, costs, expenses, penalties, or legal proceedings arising from:</p>
                                    <ul>
                                        <li>Use of the Medicine Information Service;</li>
                                        <li>Reliance on information provided through the feature;</li>
                                        <li>Violation of applicable laws;</li>
                                        <li>Breach of this Policy;</li>
                                        <li>Misuse of healthcare information.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="12">
                                <Accordion.Header><strong>13. Updates and Modifications</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI reserves the right to modify, update, suspend, restrict, or discontinue this feature or this Policy at any time without prior notice.</p>
                                    <p>Updated versions shall become effective immediately upon publication on the platform.</p>
                                    <p>Continued use of the feature constitutes acceptance of the revised Policy.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="13">
                                <Accordion.Header><strong>14. Governing Law and Jurisdiction</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>This Policy shall be governed by and construed in accordance with the laws of India.</p>
                                    <p>Any dispute arising out of or relating to this Policy shall be subject to the exclusive jurisdiction of the competent courts located at Latur, Maharashtra, India.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="14">
                                <Accordion.Header><strong>15. Contact Information</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>For questions relating to this Policy, please contact:</p>
                                    <p>HealthEasy EMI<br />
                                    Arogya Mantra Healthtech Private Limited<br />
                                    Website: www.healtheasyemi.com<br />
                                    Support Email: support@healtheasyemi.com<br />
                                    Privacy Email: privacy@healtheasyemi.com<br />
                                    Grievance Email: grievance@healtheasyemi.com</p>
                                </Accordion.Body>
                            </Accordion.Item>

                        </Accordion>

                        {/* BOTTOM DISCLAIMER NOTE */}
                        <div className="mt-4 p-3 bg-light border rounded small text-muted">
                            <p>Final Medical Disclaimer: The information provided through the HealthEasy EMI Medicine Information Service is for informational and educational purposes only and should not be relied upon as medical advice, diagnosis, treatment, or prescribing guidance. Always consult a qualified healthcare professional before starting, stopping, or modifying any medication or treatment. HealthEasy EMI does not endorse any medicine, medicinal product, healthcare product, manufacturer, or treatment and shall not be responsible for healthcare decisions made based on information available through this feature.</p>
                        </div>

                    </div>
                </Container>
            </section>

            <FooterBar />
        </>
    );
}

export default MedicinePolicy;