import { useEffect, useState } from "react";
import FooterBar from "../Component/FooterBar";
import { useNavigate } from "react-router-dom";
import { SECRET_KEY, STORAGE_KEYS } from '../../config'
import CryptoJS from "crypto-js";
import NavBar from "../Component/NavBar";
import { Container, Accordion } from "react-bootstrap";

function PrivacyPolicy() {
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
        document.title = "Patient No-Show (PNS) Policy"
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
                        <p>Arogya Mantra Healthtech Private Limited (“we”, “our”, or “Healtheasy EMI”, including its affiliates) is the author and publisher of the internet resource www.healtheasyemi.com (“Website”) as well as the software, services, and applications under the brand name Healtheasy EMI, including but not limited to the mobile application “Healtheasy EMI”.
                            <br /><br />
                            This Privacy Policy explains how we collect, use, share, disclose, and protect personal information of users (“you”, “your”, or “Users”) of our services, including Practitioners (as defined in the Terms of Use), End-Users, and visitors to the Website.
                            <br /><br />
                            By accessing or using our Services, or by providing your information to us, you are deemed to have read, understood, and agreed to this Privacy Policy and our Terms of Use. You also consent to the collection, use, and disclosure of your information as described herein.
                            <br /><br />
                            If you do not agree with this Privacy Policy at any time, please discontinue using our Services and refrain from sharing any information with us. If you use the Services on behalf of another individual or an organization (such as your child or employer), you represent that you are authorized to accept this Privacy Policy and consent to our use of such individual’s or entity’s information as stated herein.
                        </p>
                        <Accordion defaultActiveKey="0" className='faq-accordion'>
                            <Accordion.Item eventKey="0">
                                <Accordion.Header>1. Why This Privacy Policy</Accordion.Header>
                                <Accordion.Body>
                                    <p>This Privacy Policy is published in accordance with:</p>
                                    <ul className="list_disc">
                                        <li>Section 43A of the Information Technology Act, 2000</li>
                                        <li>Regulation 4 of the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 (“SPI Rules”)</li>
                                        <li>Regulation 3(1) of the Information Technology (Intermediaries Guidelines) Rules, 2011.</li>
                                    </ul>
                                    <p>This document outlines:</p>
                                    <ul className="list_disc">
                                        <li>The types of information collected from Users, including Personal Information and Sensitive Personal Data or Information;</li>
                                        <li>The purpose, means, and method of collection, usage, processing, retention, and destruction of such information; and</li>
                                        <li>How and to whom Healtheasy EMI will disclose such information.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="1">
                                <Accordion.Header>2. Collection of Personal Information</Accordion.Header>
                                <Accordion.Body>
                                    <p>Certain Services require us to know who you are to serve you effectively. When you access or interact with our Services—through the Website, App, email, or phone—we may ask you to voluntarily provide information that personally identifies you.</p>
                                    <p>You hereby consent to our collection of such information. This may include (but is not limited to):</p>
                                    <ul className="list_disc">
                                        <li>Contact information such as your email address and phone number</li>
                                        <li>Demographic information such as your gender, date of birth, and postal code</li>
                                        <li>Data regarding your use of our Services and appointment history;</li>
                                        <li>Insurance details such as your insurance carrier and policy information</li>
                                        <li>Information voluntarily shared by you through email, letters, or uploads, including images and other documents</li>
                                        <li>Data shared by Practitioners relating to treatment you have received</li>
                                    </ul>
                                    <p>The information collected may qualify as Personal Information or Sensitive Personal Data or Information under the SPI Rules.</p>
                                    <ul className="list_disc">
                                        <li><strong>Personal Information</strong> means any data that relates to a natural person, which either directly or indirectly, in combination with other information, can identify that person.</li>
                                        <li><strong>Sensitive Personal Data or Information</strong> includes information related to:</li>
                                        <ul className="list_disc">
                                            <li>Passwords</li>
                                            <li>Financial details such as bank account or card information</li>
                                            <li>Physical, physiological, and mental health condition</li>
                                            <li>Sexual orientation</li>
                                            <li>Medical records and history;</li>
                                            <li>Biometric Data</li>
                                            <li>Information received under lawful contract</li>
                                            <li>Visitor details provided at registration; and</li>
                                            <li>Call data records</li>
                                        </ul>
                                    </ul>
                                    <p>Healtheasy EMI may freely use, collect, and disclose information that is publicly available without your consent.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="2">
                                <Accordion.Header>3. Privacy Statements</Accordion.Header>
                                <Accordion.Body>

                                    <table className="table table-bordered privacy-table">
                                        <tbody>

                                            {/* 3.1 */}
                                            <tr>
                                                <th colSpan="2" className="table-heading">3.1 For All Users</th>
                                            </tr>

                                            <tr>
                                                <td className="section-title">3.1.1 Acceptance</td>
                                                <td>
                                                    By using our Services, you agree to our Terms of Use and this Privacy
                                                    Policy. If you disagree, you must immediately discontinue use of the
                                                    Services.
                                                </td>
                                            </tr>

                                            <tr>
                                                <td className="section-title">3.1.2 Information Required</td>
                                                <td>
                                                    An indicative list of information we may collect to enable your use
                                                    of the Services is included in the Schedule annexed to this Policy.
                                                </td>
                                            </tr>

                                            <tr>
                                                <td className="section-title">3.1.3 Voluntary Disclosure and Use</td>
                                                <td>
                                                    <p>All information you provide is voluntary. Healtheasy EMI may use
                                                        your Personal or Sensitive Information for:</p>

                                                    <ul className="list_disc">
                                                        <li>Providing Services</li>
                                                        <li>Commercial or analytical purposes in anonymized form</li>
                                                        <li>Communication and feedback collection</li>
                                                        <li>Debugging or resolving support issues</li>
                                                        <li>Completing pending transactions</li>
                                                    </ul>

                                                    <p>We may use your information to:</p>
                                                    <ul className="list_disc">
                                                        <li>Identify you</li>
                                                        <li>Publish necessary details on the Website</li>
                                                        <li>Offer new products or services</li>
                                                        <li>Request feedback</li>
                                                        <li>Analyze usage for improvement</li>
                                                        <li>Conduct research and analytics</li>
                                                        <li>Process payments via third-party providers</li>
                                                    </ul>

                                                    <p>
                                                        By verifying your contact details, you consent to receive calls,
                                                        SMS, or emails (including promotional), even if registered on
                                                        DND/NCPR lists.
                                                    </p>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td className="section-title">3.1.4 Consent</td>
                                                <td>
                                                    Collection, use, or disclosure of Sensitive Personal Data requires
                                                    your explicit consent. By affirming this Policy, you grant such
                                                    consent.
                                                </td>
                                            </tr>

                                            <tr>
                                                <td className="section-title">3.1.5 Third-Party Content</td>
                                                <td>
                                                    Healtheasy EMI does not control third-party services and disclaims
                                                    liability arising from such interactions.
                                                </td>
                                            </tr>

                                            <tr>
                                                <td className="section-title">3.1.6 Data Accuracy</td>
                                                <td>
                                                    You are responsible for maintaining accurate data. Corrections can
                                                    be made via your account or by emailing
                                                    privacy@healtheasyemi.com.
                                                </td>
                                            </tr>

                                            <tr>
                                                <td className="section-title">3.1.7 Account Deletion</td>
                                                <td>
                                                    To cancel your account or withdraw consent, email
                                                    support@healtheasyemi.com. Data may be retained as required by law
                                                    and anonymized thereafter.
                                                </td>
                                            </tr>

                                            <tr>
                                                <td className="section-title">3.1.8 Opt-Out</td>
                                                <td>
                                                    You may opt out of marketing communications by contacting
                                                    support@healtheasyemi.com.
                                                </td>
                                            </tr>

                                            <tr>
                                                <td className="section-title">3.1.9 Payments</td>
                                                <td>
                                                    Limited payment data is collected and processed securely via
                                                    authorized payment gateways.
                                                </td>
                                            </tr>

                                            <tr>
                                                <td className="section-title">3.1.10 Technical Data</td>
                                                <td>
                                                    We automatically collect IP address, browser type, device details,
                                                    and usage patterns for service improvement.
                                                </td>
                                            </tr>

                                            <tr>
                                                <td className="section-title">3.1.11 Cookies</td>
                                                <td>
                                                    Temporary cookies are used for analytics and administration. Disabling
                                                    cookies may affect functionality.
                                                </td>
                                            </tr>

                                            <tr>
                                                <td className="section-title">3.1.12 Account Registration</td>
                                                <td>
                                                    Some features require registration, including name, contact, email,
                                                    and financial details.
                                                </td>
                                            </tr>

                                            <tr>
                                                <td className="section-title">3.1.13 External Links</td>
                                                <td>
                                                    We are not responsible for privacy practices of third-party websites.
                                                </td>
                                            </tr>

                                            <tr>
                                                <td className="section-title">3.1.14 User-Generated Content</td>
                                                <td>
                                                    Users posting public content do so at their own risk.
                                                </td>
                                            </tr>

                                            <tr>
                                                <td className="section-title">3.1.15 Third-Party Data Sources</td>
                                                <td>
                                                    We do not collect data from external sources unless legally permitted.
                                                </td>
                                            </tr>

                                            <tr>
                                                <td className="section-title">3.1.16 No-Spam Policy</td>
                                                <td>
                                                    We do not sell or rent your email address without consent.
                                                </td>
                                            </tr>

                                            <tr>
                                                <td className="section-title">3.1.17 Security Practices</td>
                                                <td>
                                                    Global security standards are implemented, though absolute security
                                                    cannot be guaranteed.
                                                </td>
                                            </tr>

                                            <tr>
                                                <td className="section-title">3.1.18 Data Protection Measures</td>
                                                <td>
                                                    We maintain technical, operational, and physical safeguards based on
                                                    data sensitivity.
                                                </td>
                                            </tr>

                                            <tr>
                                                <td className="section-title">3.1.19 Legal Disclosure</td>
                                                <td>
                                                    Information may be disclosed to comply with legal obligations or
                                                    protect rights and safety.
                                                </td>
                                            </tr>

                                            {/* 3.2 */}
                                            <tr>
                                                <th colSpan="2" className="table-heading">3.2 Practitioners Note</th>
                                            </tr>

                                            <tr>
                                                <td className="section-title">3.2.5</td>
                                                <td>
                                                    Practitioner data is collected during registration, used for listings,
                                                    services, analysis, and may include non-registered practitioners with
                                                    consent.
                                                </td>
                                            </tr>

                                            {/* 3.3 */}
                                            <tr>
                                                <th colSpan="2" className="table-heading">3.3 End-Users Note</th>
                                            </tr>

                                            <tr>
                                                <td className="section-title">3.3.1 – 3.3.11</td>
                                                <td>
                                                    End-User data is collected with consent, used for service delivery,
                                                    research, communication, surveys, quality assurance, and secure
                                                    transfers during restructuring.
                                                </td>
                                            </tr>

                                            {/* 3.4 */}
                                            <tr>
                                                <th colSpan="2" className="table-heading">3.4 Casual Visitors Note</th>
                                            </tr>

                                            <tr>
                                                <td className="section-title">3.4.1 – 3.4.4</td>
                                                <td>
                                                    No sensitive data is automatically collected. Visitors submitting
                                                    information are treated as Users under this Policy.
                                                </td>
                                            </tr>

                                        </tbody>
                                    </table>

                                </Accordion.Body>
                            </Accordion.Item>


                            <Accordion.Item eventKey="3">
                                <Accordion.Header>4. Confidentiality and Security</Accordion.Header>
                                <Accordion.Body>
                                    <p>All personal data is stored securely in electronic or physical form.</p>
                                    <p>4.2 No administrator has access to your password. Protect your login credentials at all times.</p>
                                    <p>4.3 Access to data is limited to authorized personnel under confidentiality obligations.</p>
                                    <p>4.4 Records may be shared with medical authorities or practitioners when required.</p>
                                    <p>4.5 Healtheasy EMI is not responsible for breaches outside its reasonable control (e.g., hacking, internet failure).</p>
                                </Accordion.Body>
                            </Accordion.Item>


                            <Accordion.Item eventKey="4">
                                <Accordion.Header>5. Changes to Privacy Policy</Accordion.Header>
                                <Accordion.Body>
                                    <p>Healtheasy EMI may modify this Policy at any time. Updates will be posted on the Website. Continued use after such changes constitutes acceptance of the revised Policy.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="5">
                                <Accordion.Header>6. Children’s and Minor’s Privacy</Accordion.Header>
                                <Accordion.Body>
                                    <p>Our Services are not intended for minors under 18. Parents and guardians are encouraged to monitor online activity. If a child’s data has been shared, please contact us for removal.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="6">
                                <Accordion.Header>7. Consent</Accordion.Header>
                                <Accordion.Body>
                                    <p>By using the Website or Services, you consent to the terms of this Privacy Policy and authorize Healtheasy EMI to use your data as described.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="7">
                                <Accordion.Header>8. Contact Information</Accordion.Header>
                                <Accordion.Body>
                                    <p>For any privacy-related questions, please contact our <strong>Data Protection Officer</strong>:</p>
                                    <p><strong>Name:</strong> Balaji Kharte</p>
                                    <p><strong>Company:</strong> Healtheasy EMI – Arogya Mantra Healthtech Pvt. Ltd.</p>
                                    <p><strong>Email:</strong> privacy@healtheasyemi.com</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="8">
                                <Accordion.Header>Schedule: Indicative List of Information</Accordion.Header>
                                <Accordion.Body>
                                    <div>
                                        <strong>1. End-Users (Registered Accounts):</strong>
                                        <p>Name, mobile number, email address, and health data for appointment bookings.</p>
                                    </div>
                                    <div>
                                        <strong>2. Guest End-Users:</strong>
                                        <p>Mobile number and minimal information for booking confirmation.</p>
                                    </div>
                                    <div>
                                        <strong>3. Practitioners (Registered):</strong>
                                        <p>Name, contact details, and professional credentials.</p>
                                    </div>
                                    <div>
                                        <strong>4. Practitioners (Unregistered):</strong>
                                        <p>Basic contact details collected through Healtheasy EMI representatives.</p>
                                    </div>
                                    <div>
                                        <strong>5. Practitioners using Healtheasy EMI Reach:</strong>
                                        <p>Name, mobile number, email, and related registration details.</p>
                                    </div>
                                    <div>
                                        <strong>6. End-Users and Practitioners using Consult Platform:</strong>
                                        <p>Information such as name, contact, and consultation details.</p>
                                    </div>
                                    <div>
                                        <strong>7. Assured Services Users:</strong>
                                        <p>Medical data shared solely for service delivery purposes.</p>
                                    </div>
                                    
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
export default PrivacyPolicy