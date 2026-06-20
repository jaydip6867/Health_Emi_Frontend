import { useEffect, useState } from "react";
import FooterBar from "../Component/FooterBar";
import { useNavigate } from "react-router-dom";
import { SECRET_KEY, STORAGE_KEYS } from '../../config';
import CryptoJS from "crypto-js";
import NavBar from "../Component/NavBar";
import { Container, Accordion } from "react-bootstrap";

function HealthCookiePolicy() {
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
        document.title = "HealthEasy EMI – Cookie Policy";
    }, []);

    return (
        <>
            <NavBar logindata={logdata} />
            {/* breadcrumb section */}
            <section className='breadcrumb_Sec'>
                <Container className='text-center '>
                    <h2>HealthEasy EMI Ambulance Services – Cookie Policy</h2>
                </Container>
            </section>
            
            <section className="py-5">
                <Container>
                    <div className="p-3 border rounded">
                        <Accordion defaultActiveKey="0" className='faq-accordion'>
                            
                            <Accordion.Item eventKey="0">
                                <Accordion.Header>1. Introduction</Accordion.Header>
                                <Accordion.Body>
                                    <p>This Cookie Policy explains how Arogya Mantra Healthtech Private Limited, operating under the brand name HealthEasy EMI Ambulance Services ("HealthEasy EMI", "Company", "we", "our", or "us"), uses cookies, software development kits (SDKs), pixels, device identifiers, and similar technologies when you access or use our website, mobile applications, ambulance booking platform, customer portals, and related digital services (collectively, the "Platform")[cite: 691]. This Policy should be read together with our Privacy Policy and Terms & Conditions[cite: 692]. By continuing to access or use our Platform, you consent to the use of cookies and similar technologies as described in this Policy, subject to your preferences and applicable law[cite: 693].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="1">
                                <Accordion.Header>2. What Are Cookies?</Accordion.Header>
                                <Accordion.Body>
                                    <p>Cookies are small text files stored on your computer, smartphone, tablet, or other device when you visit a website or use an application[cite: 704, 705]. Cookies help websites and applications[cite: 704, 705]:</p>
                                    <ul>
                                        <li>Recognize returning users; [cite: 704, 705]</li>
                                        <li>Remember user preferences; [cite: 704, 705]</li>
                                        <li>Improve platform functionality; [cite: 704, 705]</li>
                                        <li>Enable secure transactions; [cite: 704, 705]</li>
                                        <li>Analyze usage patterns; [cite: 704, 705]</li>
                                        <li>Enhance overall user experience. [cite: 704, 705]</li>
                                    </ul>
                                    <p>Cookies do not generally contain information that directly identifies an individual user; however, information stored in cookies may be linked to personal information held by HealthEasy EMI[cite: 704, 705].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="2">
                                <Accordion.Header>3. Types of Cookies We Use</Accordion.Header>
                                <Accordion.Body>
                                    <h5>3.1 Essential Cookies</h5>
                                    <p>These cookies are necessary for the operation of the Platform and cannot be disabled through our systems[cite: 706, 707]. They enable critical functions such as[cite: 706, 707]:</p>
                                    <ul>
                                        <li>User authentication; [cite: 706, 707]</li>
                                        <li>Account login; [cite: 706, 707]</li>
                                        <li>Session management; [cite: 706, 707]</li>
                                        <li>Ambulance booking workflows; [cite: 706, 707]</li>
                                        <li>Payment processing; [cite: 706, 707]</li>
                                        <li>Security monitoring; [cite: 706, 707]</li>
                                        <li>Fraud prevention; [cite: 706, 707]</li>
                                        <li>System stability. [cite: 706, 707]</li>
                                    </ul>
                                    <p>Without these cookies, certain Services may not function properly[cite: 706, 707].</p>

                                    <h5>3.2 Performance and Analytics Cookies</h5>
                                    <p>These cookies help us understand how users interact with the Platform and assist us in improving our Services[cite: 718, 719]. Information collected may include[cite: 718, 719]:</p>
                                    <ul>
                                        <li>Pages visited; [cite: 718, 719]</li>
                                        <li>Session duration; [cite: 718, 719]</li>
                                        <li>User navigation patterns; [cite: 718, 719]</li>
                                        <li>Click activity; [cite: 718, 719]</li>
                                        <li>Device information; [cite: 718, 719]</li>
                                        <li>Browser information; [cite: 718, 719]</li>
                                        <li>Application performance data; [cite: 718, 719]</li>
                                        <li>Error logs and crash reports. [cite: 718, 719]</li>
                                    </ul>
                                    <p>Analytics information is generally aggregated and used to improve service quality[cite: 718, 719].</p>

                                    <h5>3.3 Functional and Preference Cookies</h5>
                                    <p>These cookies allow the Platform to remember choices made by users and provide enhanced functionality[cite: 730, 731]. Examples include[cite: 730, 731]:</p>
                                    <ul>
                                        <li>Preferred language; [cite: 730, 731]</li>
                                        <li>Saved locations; [cite: 730, 731]</li>
                                        <li>Frequently used addresses; [cite: 730, 731]</li>
                                        <li>Recent ambulance bookings; [cite: 730, 731]</li>
                                        <li>Accessibility preferences; [cite: 730, 731]</li>
                                        <li>User interface settings. [cite: 730, 731]</li>
                                    </ul>

                                    <h5>3.4 Location and GPS Technologies</h5>
                                    <p>Because ambulance services depend on accurate location information, HealthEasy EMI may use device permissions, GPS technologies, and location-related cookies or identifiers to[cite: 739, 740]:</p>
                                    <ul>
                                        <li>Detect pickup locations; [cite: 739, 740]</li>
                                        <li>Display nearby ambulance availability; [cite: 739, 740]</li>
                                        <li>Estimate ambulance arrival times; [cite: 739, 740]</li>
                                        <li>Enable live ambulance tracking; [cite: 739, 740]</li>
                                        <li>Improve route optimization; [cite: 739, 740]</li>
                                        <li>Facilitate emergency transportation. [cite: 739, 740]</li>
                                    </ul>
                                    <p>Disabling location permissions may significantly affect Platform functionality and ambulance booking capabilities[cite: 739, 740].</p>

                                    <h5>3.5 Marketing and Communication Cookies</h5>
                                    <p>Subject to applicable consent requirements, these technologies may be used to[cite: 748, 749]:</p>
                                    <ul>
                                        <li>Deliver relevant service updates; [cite: 748, 749]</li>
                                        <li>Measure campaign effectiveness; [cite: 748, 749]</li>
                                        <li>Send promotional communications; [cite: 748, 749]</li>
                                        <li>Improve customer engagement; [cite: 748, 749]</li>
                                        <li>Analyze communication performance. [cite: 748, 749]</li>
                                    </ul>
                                    <p>HealthEasy EMI does not sell personal information to advertisers[cite: 748, 749]. Users may withdraw marketing consent at any time[cite: 748, 749].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="3">
                                <Accordion.Header>4. Similar Technologies</Accordion.Header>
                                <Accordion.Body>
                                    <p>In addition to cookies, we may use[cite: 757, 758]:</p>
                                    <ul>
                                        <li>Software Development Kits (SDKs); [cite: 757, 758]</li>
                                        <li>Web beacons; [cite: 757, 758]</li>
                                        <li>Tracking pixels; [cite: 757, 758]</li>
                                        <li>Device identifiers; [cite: 757, 758]</li>
                                        <li>Local storage technologies; [cite: 757, 758]</li>
                                        <li>Mobile application analytics tools. [cite: 757, 758]</li>
                                    </ul>
                                    <p>These technologies help improve security, performance, service delivery, and user experience[cite: 757, 758].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="4">
                                <Accordion.Header>5. Third-Party Technologies</Accordion.Header>
                                <Accordion.Body>
                                    <p>Certain third-party providers integrated into our Platform may use cookies or similar technologies[cite: 766, 767]. Examples may include[cite: 766, 767]:</p>
                                    <ul>
                                        <li>Mapping and navigation services; [cite: 766, 767]</li>
                                        <li>Payment gateway providers; [cite: 766, 767]</li>
                                        <li>Cloud service providers; [cite: 766, 767]</li>
                                        <li>Analytics providers; [cite: 766, 767]</li>
                                        <li>Communication service providers; [cite: 766, 767]</li>
                                        <li>Customer support platforms. [cite: 766, 767]</li>
                                    </ul>
                                    <p>Examples include[cite: 775, 776]:</p>
                                    <ul>
                                        <li>Google Maps; [cite: 775, 776]</li>
                                        <li>Google Analytics; [cite: 775, 776]</li>
                                        <li>Firebase; [cite: 775, 776]</li>
                                        <li>Razorpay; [cite: 775, 776]</li>
                                        <li>Paytm; [cite: 775, 776]</li>
                                        <li>Other authorized service providers. [cite: 775, 776]</li>
                                    </ul>
                                    <p>HealthEasy EMI does not control third-party cookie practices and recommends reviewing the privacy policies of such providers[cite: 775, 776].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="5">
                                <Accordion.Header>6. Managing Cookie Preferences</Accordion.Header>
                                <Accordion.Body>
                                    <p>Users may manage cookies through[cite: 783, 784]:</p>
                                    <h6>Browser Controls</h6>
                                    <p>Most web browsers allow users to[cite: 785, 786]:</p>
                                    <ul>
                                        <li>Block cookies; [cite: 785, 786]</li>
                                        <li>Delete cookies; [cite: 785, 786]</li>
                                        <li>Receive notifications when cookies are used; [cite: 785, 786]</li>
                                        <li>Restrict certain categories of cookies. [cite: 785, 786]</li>
                                    </ul>
                                    <p>Browser settings can generally be accessed through privacy or security preferences[cite: 785, 786].</p>

                                    <h6>Mobile Device Controls</h6>
                                    <p>Users may control[cite: 792, 793]:</p>
                                    <ul>
                                        <li>Location permissions; [cite: 792, 793]</li>
                                        <li>Advertising identifiers; [cite: 792, 793]</li>
                                        <li>Tracking permissions; [cite: 792, 793]</li>
                                        <li>App-level data access [cite: 792, 793]</li>
                                    </ul>
                                    <p>through Android or iOS device settings[cite: 792, 793].</p>

                                    <h6>Withdrawal of Consent</h6>
                                    <p>Where consent is required for certain categories of cookies, users may withdraw such consent at any time[cite: 799, 800]. Withdrawal of consent may affect the availability or performance of certain Platform features[cite: 799, 800].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="6">
                                <Accordion.Header>7. Consequences of Disabling Cookies</Accordion.Header>
                                <Accordion.Body>
                                    <p>Disabling certain cookies may result in[cite: 802, 803]:</p>
                                    <ul>
                                        <li>Inability to log in; [cite: 802, 803]</li>
                                        <li>Reduced platform functionality; [cite: 802, 803]</li>
                                        <li>Interrupted booking processes; [cite: 802, 803]</li>
                                        <li>Inaccurate ambulance tracking; [cite: 802, 803]</li>
                                        <li>Loss of saved preferences; [cite: 802, 803]</li>
                                        <li>Payment processing issues. [cite: 802, 803]</li>
                                    </ul>
                                    <p>Essential cookies cannot be disabled where necessary for secure operation of the Platform[cite: 802, 803].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="7">
                                <Accordion.Header>8. Data Protection and Security</Accordion.Header>
                                <Accordion.Body>
                                    <p>Information collected through cookies and similar technologies is protected in accordance with our Privacy Policy and applicable Indian laws[cite: 811, 812]. HealthEasy EMI implements reasonable technical and organizational safeguards designed to protect information collected through cookies from unauthorized access, disclosure, alteration, or misuse[cite: 811, 813].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="8">
                                <Accordion.Header>9. Retention of Cookie Data</Accordion.Header>
                                <Accordion.Body>
                                    <p>Cookie-related information is retained only for as long as necessary to[cite: 814, 815]:</p>
                                    <ul>
                                        <li>Operate the Platform; [cite: 814, 815]</li>
                                        <li>Fulfill legitimate business purposes; [cite: 814, 815]</li>
                                        <li>Meet legal obligations; [cite: 814, 815]</li>
                                        <li>Resolve disputes; [cite: 814, 815]</li>
                                        <li>Improve Services. [cite: 814, 815]</li>
                                    </ul>
                                    <p>Retention periods vary depending on the type of cookie or technology used[cite: 814, 821].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="9">
                                <Accordion.Header>10. Updates to This Cookie Policy</Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI reserves the right to update, amend, or modify this Cookie Policy at any time[cite: 822, 823]. Updated versions shall be posted on the Platform with a revised "Last Updated" date[cite: 822, 824]. Continued use of the Platform following publication of updates constitutes acceptance of the revised Policy[cite: 822, 825].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="10">
                                <Accordion.Header>11. Contact Information</Accordion.Header>
                                <Accordion.Body>
                                    <p>For questions regarding this Cookie Policy or our data practices, please contact[cite: 826, 827]:</p>
                                    <p>HealthEasy EMI Ambulance Services Arogya Mantra Healthtech Private Limited<br />
                                    Support Email: support@healtheasyemi.com<br />
                                    Privacy Email: privacy@healtheasyemi.com<br />
                                    Registered Office: Office no.23, 3rd Floor, Aston Plaza, Narhe Ambegaon Rd, above Star Bazaar, Ambegaon Budruk, Pune, Maharashtra 411046 [cite: 828, 829, 830, 831]</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="11">
                                <Accordion.Header>12. Governing Law and Jurisdiction</Accordion.Header>
                                <Accordion.Body>
                                    <p>This Cookie Policy shall be governed by and interpreted in accordance with the laws of India[cite: 832, 833]. Any dispute arising out of or relating to this Policy shall be subject to the exclusive jurisdiction of the competent courts located at Pune, Maharashtra, India[cite: 832, 834].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="12">
                                <Accordion.Header>13. Cookie Notice Summary</Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI uses cookies, device identifiers, GPS technologies, and analytics tools to provide ambulance booking, location tracking, payment processing, platform security, and user experience enhancements[cite: 835]. You may manage cookie preferences through your browser or device settings[cite: 835, 836]. Please review our Cookie Policy and Privacy Policy for further details[cite: 835, 837].</p>
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

export default HealthCookiePolicy;