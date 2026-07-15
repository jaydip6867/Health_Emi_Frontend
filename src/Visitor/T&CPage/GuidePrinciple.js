import { useEffect, useState } from "react";
import FooterBar from "../Component/FooterBar";
import { useNavigate } from "react-router-dom";
import { SECRET_KEY, STORAGE_KEYS } from '../../config'
import CryptoJS from "crypto-js";
import NavBar from "../Component/NavBar";
import { Container, Accordion } from "react-bootstrap";

function GuidePrinciple() {
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
        document.title = "Healtheasy EMI – Information System on Medicines and Medicinal Products"
    }, [])
    return (
        <>
            <NavBar logindata={logdata} />
            {/* breadcrumb section */}
            <section className='breadcrumb_Sec'>
                <Container className='text-center '>
                    <h2>Healtheasy EMI – Information System on Medicines and Medicinal Products</h2>
                </Container>
            </section>
            <section className="py-5">
                <Container>
                    <div className="p-3 border rounded">
                        <Accordion defaultActiveKey="0" className='faq-accordion'>
                            <Accordion.Item eventKey="0">
                                <Accordion.Header>1. Data Privacy, Confidentiality, and Security</Accordion.Header>
                                <Accordion.Body>
                                    <p>At Healtheasy EMI, we place the highest importance on protecting data privacy, confidentiality, and security. We ensure that no personal information—whether from patients, doctors, or healthcare establishments—is collected, shared, or used without prior consent. This approach empowers our users to have complete control over their data at all times.</p>
                                    <strong>For Patients</strong>
                                    <p>In accordance with our Privacy Policy, Healtheasy EMI seeks explicit consent before sending any promotional communications or updates. Patients can modify or withdraw their communication preferences at any time through their account settings or by contacting support.</p>
                                    <strong>For Healthcare Establishments</strong>
                                    <p>Only the treating doctor—not Healtheasy EMI—may initiate communication with their walk-in patients.
                                        As per our privacy standards, doctors are required to obtain patient consent before sending any Healtheasy EMI-related information or messages
                                    </p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="1">
                                <Accordion.Header>2. Connecting Patients with the Right Doctors</Accordion.Header>
                                <Accordion.Body>
                                    <p>Healtheasy EMI uses a fully automated, unbiased algorithm to help patients connect with the most appropriate medical professionals and healthcare establishments.</p>
                                    <strong>Our Matching Process Is Guided by Four Core Factors:</strong>
                                    <ul>
                                        <li>The patient’s proximity to the healthcare establishment</li>
                                        <li>Doctor availability and consultation timings</li>
                                        <li>Medical relevance and suitability</li>
                                        <li>Patient preferences based on verified patient feedback</li>
                                    </ul>
                                    <p>While the algorithm operates consistently across both Prime and Basic listings, the results may vary based on each patient’s individual needs—such as instant booking availability, confirmed appointments, and shorter wait times.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="2">
                                <Accordion.Header>3. Verified Listings of Registered Medical Practitioners (RMPs)</Accordion.Header>
                                <Accordion.Body>
                                    <p>To uphold trust and transparency, Healtheasy EMI ensures that only verified Registered Medical Practitioners (RMPs) are listed on the platform.</p>
                                    <strong>Verification Process Includes:</strong>
                                    <ul className="list_disc">
                                        <li>Validation of academic degrees with the respective medical council</li>
                                        <li>Confirmation of the doctor’s Medical Registration Number through national, state, or AYUSH council registries</li>

                                    </ul>
                                    <p>New practitioners are continually added to the platform, and our verification process remains ongoing and dynamic to maintain accuracy and compliance.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="2">
                                <Accordion.Header>4. Specialty Mapping and Qualification Verification</Accordion.Header>
                                <Accordion.Body>
                                    <p>Healtheasy EMI maintains a structured and verified database that maps each doctor’s specialization to their corresponding qualifications and certifications. This ensures that every listed area of expertise is supported by verified credentials.</p>
                                    <strong>Our Approach:</strong>
                                    <ul className="list_disc">
                                        <li>The platform allows qualified doctors to suggest new degrees or specializations for inclusion.</li>
                                        <li>All submissions are reviewed by an expert panel of senior doctors and academic professionals before publication</li>
                                        <li>Doctors may also request edits to existing qualification data, which are thoroughly vetted prior to approval.</li>
                                    </ul>
                                    <p>This transparent and collaborative process ensures that our listings reflect accurate and verified medical expertise.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="2">
                                <Accordion.Header>5. Verified Patient Stories for Informed Healthcare Decisions</Accordion.Header>
                                <Accordion.Body>
                                    <p>Healtheasy EMI is committed to empowering patients through authentic, unbiased, and verified patient experiences.</p>
                                    <strong>How We Ensure Credibility:</strong>
                                    <ul className="list_disc">
                                        <li>Every patient story undergoes strict moderation to confirm authenticity and factual accuracy.</li>
                                        <li>We do not publish:
                                            <ul className="list_circle">
                                                <li>Promotional comments from friends, relatives, or affiliates of the doctor or clinic</li>
                                                <li>Testimonials questioning the accuracy of diagnoses or treatments, as these require expert medical review</li>
                                                <li>Comments submitted by individuals other than the patient without verified consent</li>
                                            </ul>
                                        </li>
                                    </ul>
                                    <p>Healtheasy EMI also maintains a no-deletion policy for published reviews—negative or positive—unless they violate our content or moderation guidelines. <br/>
                                        This commitment ensures transparency, fairness, and accountability across our healthcare ecosystem.
                                    </p>
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
export default GuidePrinciple