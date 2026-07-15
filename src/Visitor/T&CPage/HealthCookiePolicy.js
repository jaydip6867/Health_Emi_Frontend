import { useEffect, useState } from "react";
import { Container, Accordion } from "react-bootstrap";
import CryptoJS from "crypto-js";
import NavBar from "../Component/NavBar";
import FooterBar from "../Component/FooterBar";
import { SECRET_KEY, STORAGE_KEYS } from '../../config';

function HealthCookiePolicy() {
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
        document.title = "HealthEasy EMI – Ambulance Cookie Policy";
    }, []);

    return (
        <>
            <NavBar logindata={logdata} />
            
            {/* breadcrumb section */}
            <section className='breadcrumb_Sec'>
                <Container className='text-center'>
                    <h2>HealthEasy EMI Ambulance Services – Cookie Policy</h2>
                </Container>
            </section>
            
            <section className="py-5 bg-light">
                <Container>
                    <div className="p-4 bg-white border rounded shadow-sm">
                        <Accordion defaultActiveKey="0" className='faq-accordion'>
                            
                            <Accordion.Item eventKey="0">
                                <Accordion.Header><strong>1. Introduction</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>This Cookie Policy explains how Arogya Mantra Healthtech Private Limited, operating under the brand name HealthEasy EMI Ambulance Services ("HealthEasy EMI", "Company", "we", "our", or "us"), uses cookies, software development kits (SDKs), pixels, device identifiers, and similar technologies when you access or use our website, mobile applications, ambulance booking platform, customer portals, and related digital services (collectively, the "Platform").</p>
                                    <p>This Policy should be read together with our Privacy Policy and Terms & Conditions.</p>
                                    <p>By continuing to access or use our Platform, you consent to the use of cookies and similar technologies as described in this Policy, subject to your preferences and applicable law.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="1">
                                <Accordion.Header><strong>2. What Are Cookies?</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Cookies are small text files stored on your computer, smartphone, tablet, or other device when you visit a website or use an application.</p>
                                    <p>Cookies help websites and applications:</p>
                                    <ul>
                                        <li>Recognize returning users;</li>
                                        <li>Remember user preferences;</li>
                                        <li>Improve platform functionality;</li>
                                        <li>Enable secure transactions;</li>
                                        <li>Analyze usage patterns;</li>
                                        <li>Enhance overall user experience.</li>
                                    </ul>
                                    <p>Cookies do not generally contain information that directly identifies an individual user; however, information stored in cookies may be linked to personal information held by HealthEasy EMI.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="2">
                                <Accordion.Header><strong>3. Types of Cookies We Use</strong></Accordion.Header>
                                <Accordion.Body>
                                    <h6>3.1 Essential Cookies</h6>
                                    <p>These cookies are necessary for the operation of the Platform and cannot be disabled through our systems.</p>
                                    <p>They enable critical functions such as:</p>
                                    <ul>
                                        <li>User authentication;</li>
                                        <li>Account login;</li>
                                        <li>Session management;</li>
                                        <li>Ambulance booking workflows;</li>
                                        <li>Payment processing;</li>
                                        <li>Security monitoring;</li>
                                        <li>Fraud prevention;</li>
                                        <li>System stability.</li>
                                    </ul>
                                    <p>Without these cookies, certain Services may not function properly.</p>

                                    <h6>3.2 Performance and Analytics Cookies</h6>
                                    <p>These cookies help us understand how users interact with the Platform and assist us in improving our Services.</p>
                                    <p>Information collected may include:</p>
                                    <ul>
                                        <li>Pages visited;</li>
                                        <li>Session duration;</li>
                                        <li>User navigation patterns;</li>
                                        <li>Click activity;</li>
                                        <li>Device information;</li>
                                        <li>Browser information;</li>
                                        <li>Application performance data;</li>
                                        <li>Error logs and crash reports.</li>
                                    </ul>
                                    <p>Analytics information is generally aggregated and used to improve service quality.</p>

                                    <h6>3.3 Functional and Preference Cookies</h6>
                                    <p>These cookies allow the Platform to remember choices made by users and provide enhanced functionality.</p>
                                    <p>Examples include:</p>
                                    <ul>
                                        <li>Preferred language;</li>
                                        <li>Saved locations;</li>
                                        <li>Frequently used addresses;</li>
                                        <li>Recent ambulance bookings;</li>
                                        <li>Accessibility preferences;</li>
                                        <li>User interface settings.</li>
                                    </ul>

                                    <h6>3.4 Location and GPS Technologies</h6>
                                    <p>Because ambulance services depend on accurate location information, HealthEasy EMI may use device permissions, GPS technologies, and location-related cookies or identifiers to:</p>
                                    <ul>
                                        <li>Detect pickup locations;</li>
                                        <li>Display nearby ambulance availability;</li>
                                        <li>Estimate ambulance arrival times;</li>
                                        <li>Enable live ambulance tracking;</li>
                                        <li>Improve route optimization;</li>
                                        <li>Facilitate emergency transportation.</li>
                                    </ul>
                                    <p>Disabling location permissions may significantly affect Platform functionality and ambulance booking capabilities.</p>

                                    <h6>3.5 Marketing and Communication Cookies</h6>
                                    <p>Subject to applicable consent requirements, these technologies may be used to:</p>
                                    <ul>
                                        <li>Deliver relevant service updates;</li>
                                        <li>Measure campaign effectiveness;</li>
                                        <li>Send promotional communications;</li>
                                        <li>Improve customer engagement;</li>
                                        <li>Analyze communication performance.</li>
                                    </ul>
                                    <p>HealthEasy EMI does not sell personal information to advertisers.</p>
                                    <p>Users may withdraw marketing consent at any time.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="3">
                                <Accordion.Header><strong>4. Similar Technologies</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>In addition to cookies, we may use:</p>
                                    <ul>
                                        <li>Software Development Kits (SDKs);</li>
                                        <li>Web beacons;</li>
                                        <li>Tracking pixels;</li>
                                        <li>Device identifiers;</li>
                                        <li>Local storage technologies;</li>
                                        <li>Mobile application analytics tools.</li>
                                    </ul>
                                    <p>These technologies help improve security, performance, service delivery, and user experience.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="4">
                                <Accordion.Header><strong>5. Third-Party Technologies</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Certain third-party providers integrated into our Platform may use cookies or similar technologies.</p>
                                    <p>Examples may include:</p>
                                    <ul>
                                        <li>Mapping and navigation services;</li>
                                        <li>Payment gateway providers;</li>
                                        <li>Cloud service providers;</li>
                                        <li>Analytics providers;</li>
                                        <li>Communication service providers;</li>
                                        <li>Customer support platforms.</li>
                                    </ul>
                                    <p>Examples include:</p>
                                    <ul>
                                        <li>Google Maps;</li>
                                        <li>Google Analytics;</li>
                                        <li>Firebase;</li>
                                        <li>Razorpay;</li>
                                        <li>Paytm;</li>
                                        <li>Other authorized service providers.</li>
                                    </ul>
                                    <p>HealthEasy EMI does not control third-party cookie practices and recommends reviewing the privacy policies of such providers.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="5">
                                <Accordion.Header><strong>6. Managing Cookie Preferences</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Users may manage cookies through:</p>
                                    <h6>Browser Controls</h6>
                                    <p>Most web browsers allow users to:</p>
                                    <ul>
                                        <li>Block cookies;</li>
                                        <li>Delete cookies;</li>
                                        <li>Receive notifications when cookies are used;</li>
                                        <li>Restrict certain categories of cookies.</li>
                                    </ul>
                                    <p>Browser settings can generally be accessed through privacy or security preferences.</p>
                                    
                                    <h6>Mobile Device Controls</h6>
                                    <p>Users may control:</p>
                                    <ul>
                                        <li>Location permissions;</li>
                                        <li>Advertising identifiers;</li>
                                        <li>Tracking permissions;</li>
                                        <li>App-level data access through Android or iOS device settings.</li>
                                    </ul>
                                    
                                    <h6>Withdrawal of Consent</h6>
                                    <p>Where consent is required for certain categories of cookies, users may withdraw such consent at any time.</p>
                                    <p>Withdrawal of consent may affect the availability or performance of certain Platform features.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="6">
                                <Accordion.Header><strong>7. Consequences of Disabling Cookies</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Disabling certain cookies may result in:</p>
                                    <ul>
                                        <li>Inability to log in;</li>
                                        <li>Reduced platform functionality;</li>
                                        <li>Interrupted booking processes;</li>
                                        <li>Inaccurate ambulance tracking;</li>
                                        <li>Loss of saved preferences;</li>
                                        <li>Payment processing issues.</li>
                                    </ul>
                                    <p>Essential cookies cannot be disabled where necessary for secure operation of the Platform.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="7">
                                <Accordion.Header><strong>8. Data Protection and Security</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Information collected through cookies and similar technologies is protected in accordance with our Privacy Policy and applicable Indian laws.</p>
                                    <p>HealthEasy EMI implements reasonable technical and organizational safeguards designed to protect information collected through cookies from unauthorized access, disclosure, alteration, or misuse.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="8">
                                <Accordion.Header><strong>9. Retention of Cookie Data</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Cookie-related information is retained only for as long as necessary to:</p>
                                    <ul>
                                        <li>Operate the Platform;</li>
                                        <li>Fulfill legitimate business purposes;</li>
                                        <li>Meet legal obligations;</li>
                                        <li>Resolve disputes;</li>
                                        <li>Improve Services.</li>
                                    </ul>
                                    <p>Retention periods vary depending on the type of cookie or technology used.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="9">
                                <Accordion.Header><strong>10. Updates to This Cookie Policy</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI reserves the right to update, amend, or modify this Cookie Policy at any time.</p>
                                    <p>Updated versions shall be posted on the Platform with a revised "Last Updated" date.</p>
                                    <p>Continued use of the Platform following publication of updates constitutes acceptance of the revised Policy.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="10">
                                <Accordion.Header><strong>11. Contact Information</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>For questions regarding this Cookie Policy or our data practices, please contact:</p>
                                    <p>HealthEasy EMI Ambulance Services<br />
                                    Arogya Mantra Healthtech Private Limited<br />
                                    Support Email: support@healtheasyemi.com<br />
                                    Privacy Email: privacy@healtheasyemi.com<br />
                                    Registered Office: Office no.23, 3rd Floor, Aston Plaza, Narhe Ambegaon Rd, above Star Bazaar, Ambegaon Budruk, Pune, Maharashtra 411046</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="11">
                                <Accordion.Header><strong>12. Governing Law and Jurisdiction</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>This Cookie Policy shall be governed by and interpreted in accordance with the laws of India.</p>
                                    <p>Any dispute arising out of or relating to this Policy shall be subject to the exclusive jurisdiction of the competent courts located at Pune, Maharashtra, India.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                        </Accordion>

                        {/* BOTTOM DISCLAIMER NOTE */}
                        <div className="mt-4 p-3 bg-light border rounded small text-muted">
                            <p>Cookie Notice: HealthEasy EMI uses cookies, device identifiers, GPS technologies, and analytics tools to provide ambulance booking, location tracking, payment processing, platform security, and user experience enhancements. You may manage cookie preferences through your browser or device settings. Please review our Cookie Policy and Privacy Policy for further details.</p>
                        </div>

                    </div>
                </Container>
            </section>

            <FooterBar />
        </>
    );
}

export default HealthCookiePolicy;