import { useEffect, useState } from "react";
import FooterBar from "../Component/FooterBar";
import { useNavigate } from "react-router-dom";
import { SECRET_KEY, STORAGE_KEYS } from '../../config'
import CryptoJS from "crypto-js";
import NavBar from "../Component/NavBar";
import { Container, Accordion } from "react-bootstrap";

function DoctorTerm() {
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
        document.title = "About Health Easy EMI - Doctor Terms & Conditions"
    }, [])
    return (
        <>
            <NavBar logindata={logdata} />
            {/* breadcrumb section */}
            <section className='breadcrumb_Sec'>
                <Container className='text-center '>
                    <h2>Doctor Terms & Conditions</h2>
                </Container>
            </section>
            <section className="py-5">
                <Container>
                    <div className="p-3 border rounded">
                        <p>Arogya Mantra Healthtech Private Limited (“Healtheasy EMI”) offers online medical teleconsultation
                            services via its medical practitioners (“Practitioners”) in accordance with the terms and conditions
                            set forth below. The brand name ‘Healtheasy EMI’ provides these services (“Services”) through its
                            website at https://www.healtheasyemi.com/consult and the mobile application ‘Healtheasy EMI’
                            (collectively referred to as the “Website”).</p>
                        <Accordion defaultActiveKey="0" className='faq-accordion'>
                            <Accordion.Item eventKey="0">
                                <Accordion.Header>1. NATURE AND APPLICABILITY OF TERMS</Accordion.Header>
                                <Accordion.Body>
                                    <p>Please read these Terms and Conditions (“Terms”) and the Privacy Policy available at
                                        https://www.healtheasyemi.com/company/privacy carefully before accessing the Website or
                                        availing the Services.</p>
                                    <p>These Terms and the Privacy Policy together constitute a legally binding agreement
                                        (“Agreement”) between the User (“you”) and Healtheasy EMI.</p>
                                    <div className="ps-3">
                                        <h6>This Agreement applies to:</h6>
                                        <ul className="list_disc">
                                            <li>A patient, or their representative/affiliate seeking healthcare services
                                                including consultation with Practitioners via the Website (“End-User”, “you”, or
                                                “User”), or</li>
                                            <li>Any other user accessing the Website.</li>
                                        </ul>
                                    </div>
                                    <p>These Services may change from time to time at the sole discretion of Healtheasy EMI, and
                                        the then-current Agreement will apply to the User.</p>
                                    <p>Healtheasy EMI reserves the right to modify or terminate any part of this Agreement at
                                        any time. Continued use of the Website or Services constitutes acceptance of the updated
                                        Terms. If you do not agree to any part of the Agreement, do not use the Website or
                                        Services.</p>
                                    <div className="ps-3">
                                        <h6>This Agreement is in compliance with and governed by the laws of India, including:
                                        </h6>
                                        <ul className="list_disc">
                                            <li>The Indian Contract Act, 1872</li>
                                            <li>The Information Technology Act, 2000</li>
                                            <li>Telemedicine Guidelines under the Indian Medical Council (Professional Conduct,
                                                Etiquette and Ethics Regulation, 2002)</li>
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
                                                <p>“Consult” refers to the online medical consultation service provided by
                                                    Healtheasy EMI that enables Users to consult with registered Practitioners.
                                                    The Practitioner is assigned via an automated algorithm based on various
                                                    parameters (such as consultation time, health condition, etc.) or selected
                                                    by the User through the platform’s search feature.</p>
                                            </li>
                                            <li>
                                                <h6>B. User Terms</h6>
                                                <p>By using the Consult service, the User explicitly acknowledges and agrees to
                                                    the following:</p>
                                                <div className="ps-3">
                                                    <ul className="list_number ps-3">
                                                        <li>Practitioners may be assigned via system-generated algorithms or
                                                            selected manually by Users.</li>
                                                        <li>Prescriptions issued online are based on limited input and do not
                                                            replace an in-person diagnosis. They should not be considered
                                                            conclusive.</li>
                                                        <li>Users agree to:
                                                            <ul className="list_disc ps-3">
                                                                <li>Continue treatment with their existing doctor</li>
                                                                <li>Use the service only for non-emergency conditions</li>
                                                                <li>Maintain records of their past treatments and test results
                                                                </li>
                                                                <li>Consult their doctor before modifying or stopping any
                                                                    treatment</li>
                                                            </ul>
                                                        </li>
                                                        <li>Users understand that Practitioners do not perform physical
                                                            examinations, which may affect the accuracy of diagnosis.</li>
                                                        <li>The service does not substitute the need for physical consultations,
                                                            especially for critical or location-specific conditions.</li>
                                                        <li>Practitioners may upload prescriptions or health records on the
                                                            User’s account post-consultation. However, issuance of prescriptions
                                                            for Users outside India is at the Practitioner’s discretion.</li>
                                                        <li>Users agree that their consultations may be audited for quality
                                                            control, training, and improvement. This may include access to
                                                            personal and sensitive information.</li>
                                                        <li>Users must only ask medical questions related to their condition.
                                                        </li>
                                                        <li>Abusive language or behavior will lead to immediate termination of
                                                            the service without refund.</li>
                                                        <li>Users may share relevant images or videos only when necessary and
                                                            comfortable.</li>
                                                        <li>Communication with Practitioners must only happen through the
                                                            Website.</li>
                                                        <li>Users must share any required medical reports or documentation
                                                            promptly.</li>
                                                        <li>One paid consultation is valid for one User only.</li>
                                                        <li>Users must not request restricted medications. These include:
                                                            <ul className="ps-3 list_disc">
                                                                <li>MTP-related drugs</li>
                                                                <li>Schedule X drugs, opioids, sedatives, hypnotics, or 4th-gen
                                                                    antibiotics</li>
                                                            </ul>
                                                        </li>
                                                        <li>If such medication is required, Users must consult in person with a
                                                            doctor.</li>
                                                        <li>Users must provide accurate medical information and must not misuse
                                                            the platform.</li>
                                                        <li>Users agree that consultations are governed by Indian law and
                                                            jurisdiction, and they are responsible for verifying the legality of
                                                            consulting Indian doctors while outside India.</li>
                                                        <li>Users agree to indemnify Healtheasy EMI and its associates for any
                                                            losses arising due to misuse or breach of Terms.</li>
                                                        <li>All payments are processed via the platform’s secure payment
                                                            gateway. In case of issues, Users can reach out via online chat
                                                            support: Chat Support</li>
                                                    </ul>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="2">
                                <Accordion.Header>3. Refund Policy</Accordion.Header>
                                <Accordion.Body>
                                    Refunds may be granted in the following cases:
                                    <div className="ps-4">
                                        <ul className="list_number">
                                            <li>If the Practitioner violates applicable laws, subject to internal investigation.
                                            </li>
                                            <li>No refund is allowed if cancellation is due to abusive behavior</li>
                                            <li>Refunds are not applicable for queries that are personal or non-medical.</li>
                                            <li>If a Practitioner fails to respond within 15 minutes of the scheduled
                                                consultation, or remains unresponsive for 20 minutes, the User is eligible for a
                                                refund.</li>
                                            <li>If no consultation summary or prescription is provided, the User may request a
                                                refund.</li>
                                            <li>If a Practitioner ends the consultation abruptly or unreasonably quickly, a
                                                refund may be considered.</li>
                                            <li>Multiple unreasonable cancellations by a User may lead to permanent suspension
                                            </li>
                                            <li>Refund requests must be raised within 3 days of consultation</li>
                                            <li>Refunds can be requested via online chat support.</li>
                                            <li>Refunds, if approved, will be processed within 7 working days</li>
                                            <li>Refund claims will undergo detailed review. Final decision rests with Healtheasy
                                                EMI</li>
                                        </ul>
                                    </div>
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="3">
                                <Accordion.Header>4. TERMINATION</Accordion.Header>
                                <Accordion.Body>
                                    HEALTHEASY EMI reserves the right to suspend or terminate services provided through the Website and under this Agreement, with or without notice at any time, and to exercise any other remedy available under law.
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="4">
                                <Accordion.Header>LIMITATION OF LIABILITY</Accordion.Header>
                                <Accordion.Body>
                                    In no event, including but not limited to negligence, shall HEALTHEASY EMI, or any of its directors, officers, employees, agents or service providers, affiliates and group companies (collectively, the “Protected Entities”) be liable for any direct, indirect, special, incidental, consequential, exemplary or punitive damages arising from, or directly or indirectly related to, the use of, or the inability to use, the Website or the content, materials and functions related thereto, the Services, User’s provision of information via the Website, , even if such Protected Entity has been advised of the possibility of such damages. In no event shall the Protected Entities be liable for:
                                    <ul className="list_disc">
                                        <li>any content posted, transmitted, exchanged or received by or on behalf of any User or other person on or through the Website;</li>
                                        <li>any unauthorized access to or alteration of your transmissions or data</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="5">
                                <Accordion.Header>5. SEVERABILITY</Accordion.Header>
                                <Accordion.Body>
                                    If any provision of the Agreement is invalid as per applicable law, held by a court of competent jurisdiction or arbitral tribunal to be unenforceable under applicable law, then such provision shall be excluded from this Agreement and the remainder of the Agreement shall be interpreted as if such provision were so excluded and shall be enforceable in accordance with its terms; provided however that, in such event, the Agreement shall be interpreted so as to give effect, to the greatest extent consistent with and permitted by applicable law, to the meaning and intention of the excluded provision as determined by such court of competent jurisdiction or arbitral tribunal.
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="6">
                                <Accordion.Header>6. WAIVER</Accordion.Header>
                                <Accordion.Body>
                                    No provision of this Agreement shall be deemed to be waived and no breach excused, unless such waiver or consent shall be in writing and signed by HEALTHEASY EMI. Any consent by HEALTHEASY EMI to, or a waiver by HEALTHEASY EMI of any breach by you, whether expressed or implied, shall not constitute consent to, waiver of, or excuse for any other different or subsequent breach.
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="7">
                                <Accordion.Header>7. APPLICABLE LAW AND DISPUTE SETTLEMENT</Accordion.Header>
                                <Accordion.Body>
                                    The parties agree that this Agreement and any contractual obligation between HEALTHEASY EMI and User will be governed by the laws of India.
                                    The courts at Latur shall have exclusive jurisdiction over any disputes arising out of or in relation to this Agreement, User’s use of the Website or the Services or the information to which it gives access.
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>
                    </div>
                </Container>
            </section>

            <FooterBar />
        </>
    )
}
export default DoctorTerm