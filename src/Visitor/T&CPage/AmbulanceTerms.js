import { useEffect, useState } from "react";
import { Container, Accordion } from "react-bootstrap";
import CryptoJS from "crypto-js";
import NavBar from "../Component/NavBar";
import FooterBar from "../Component/FooterBar";
import { SECRET_KEY, STORAGE_KEYS } from '../../config';

function AmbulanceTerms() {
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
        document.title = "HealthEasy EMI – Ambulance Terms & Conditions";
    }, []);

    return (
        <>
            <NavBar logindata={logdata} />
            
            {/* breadcrumb section */}
            <section className='breadcrumb_Sec'>
                <Container className='text-center'>
                    <h2>HealthEasy EMI Ambulance Services – Terms & Conditions</h2>
                </Container>
            </section>
            
            <section className="py-5 bg-light">
                <Container>
                    <div className="p-4 bg-white border rounded shadow-sm">
                        <Accordion defaultActiveKey="0" className='faq-accordion'>
                            
                            <Accordion.Item eventKey="0">
                                <Accordion.Header><strong>1. Introduction</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>These Terms and Conditions ("Terms") govern the access and use of ambulance booking, medical transportation, emergency coordination, and related services offered through the HealthEasy EMI platform.</p>
                                    <p>The platform is operated by:</p>
                                    <p>Arogya Mantra Healthtech Private Limited operating under the brand name HealthEasy EMI Ambulance Services ("HealthEasy EMI", "Company", "we", "our", or "us").</p>
                                    <p>By accessing, registering on, or using the website, mobile application, call center, or any related service offered by HealthEasy EMI (collectively, the "Platform"), you agree to be legally bound by these Terms.</p>
                                    <p>If you do not agree with these Terms, you must discontinue use of the Platform immediately.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="1">
                                <Accordion.Header><strong>2. Definitions</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>For the purpose of these Terms:</p>
                                    <p>"User", "Customer", "You", or "Your" means any individual, patient, caregiver, attendant, organization, or authorized representative using the Platform.</p>
                                    <p>"Ambulance Partner" means an independent ambulance operator, ambulance service provider, driver, paramedic, emergency medical technician, healthcare institution, or transportation provider registered on the Platform.</p>
                                    <p>"Patient" means the individual receiving transportation or medical support services.</p>
                                    <p>"Booking" means a request submitted through the Platform for ambulance transportation services.</p>
                                    <p>"Services" means ambulance discovery, booking facilitation, dispatch coordination, route tracking, payment facilitation, customer support, and related technology-enabled services.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="2">
                                <Accordion.Header><strong>3. Nature of Services</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI operates a technology platform that facilitates connections between Users and independent Ambulance Partners.</p>
                                    <p>Unless expressly stated otherwise:</p>
                                    <ul>
                                        <li>HealthEasy EMI does not own ambulances.</li>
                                        <li>HealthEasy EMI does not employ ambulance drivers.</li>
                                        <li>HealthEasy EMI does not provide medical diagnosis or treatment.</li>
                                        <li>HealthEasy EMI does not guarantee ambulance availability.</li>
                                    </ul>
                                    <p>The Platform facilitates:</p>
                                    <ul>
                                        <li>Emergency ambulance booking;</li>
                                        <li>Non-emergency medical transportation;</li>
                                        <li>ICU ambulance coordination;</li>
                                        <li>Advanced Life Support (ALS) ambulance bookings;</li>
                                        <li>Basic Life Support (BLS) ambulance bookings;</li>
                                        <li>Mortuary and hearse vehicle bookings;</li>
                                        <li>Intercity patient transportation;</li>
                                        <li>GPS tracking and dispatch coordination;</li>
                                        <li>Customer support services.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="3">
                                <Accordion.Header><strong>4. Eligibility</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Users must:</p>
                                    <ul>
                                        <li>Be at least eighteen (18) years of age; or</li>
                                        <li>Use the Platform through a parent, guardian, caregiver, or authorized representative.</li>
                                    </ul>
                                    <p>By using the Platform, you represent that:</p>
                                    <ul>
                                        <li>All information provided is accurate;</li>
                                        <li>You have authority to make bookings on behalf of the patient where applicable;</li>
                                        <li>Your use complies with applicable laws.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="4">
                                <Accordion.Header><strong>5. Booking Process</strong></Accordion.Header>
                                <Accordion.Body>
                                    <h6>5.1 Booking Request</h6>
                                    <p>Users may place bookings through:</p>
                                    <ul>
                                        <li>Website;</li>
                                        <li>Mobile application;</li>
                                        <li>Telephone support;</li>
                                        <li>Authorized HealthEasy EMI channels.</li>
                                    </ul>
                                    
                                    <h6>5.2 Confirmation</h6>
                                    <p>A booking is confirmed only after:</p>
                                    <ul>
                                        <li>An Ambulance Partner accepts the request; and</li>
                                        <li>Confirmation is communicated through the Platform.</li>
                                    </ul>
                                    
                                    <h6>5.3 Estimated Arrival Time</h6>
                                    <p>Arrival times are estimates only and may be affected by:</p>
                                    <ul>
                                        <li>Traffic conditions;</li>
                                        <li>Weather conditions;</li>
                                        <li>Road closures;</li>
                                        <li>Vehicle availability;</li>
                                        <li>Public emergencies;</li>
                                        <li>Network interruptions.</li>
                                    </ul>
                                    <p>HealthEasy EMI does not guarantee arrival within any specified timeframe.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="5">
                                <Accordion.Header><strong>6. User Responsibilities</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Users agree to:</p>
                                    <ul>
                                        <li>Provide accurate pickup and destination information;</li>
                                        <li>Provide accurate patient information;</li>
                                        <li>Cooperate with ambulance personnel;</li>
                                        <li>Follow safety instructions;</li>
                                        <li>Ensure lawful use of the Services;</li>
                                        <li>Maintain respectful behavior.</li>
                                    </ul>
                                    <p>Users shall not:</p>
                                    <ul>
                                        <li>Make fraudulent bookings;</li>
                                        <li>Misuse emergency resources;</li>
                                        <li>Provide false information;</li>
                                        <li>Engage in abusive, threatening, discriminatory, or unlawful conduct.</li>
                                    </ul>
                                    <p>HealthEasy EMI reserves the right to suspend accounts involved in misuse.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="6">
                                <Accordion.Header><strong>7. Ambulance Partner Responsibilities</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Ambulance Partners are solely responsible for:</p>
                                    <ul>
                                        <li>Maintaining valid registrations and permits;</li>
                                        <li>Vehicle fitness and compliance;</li>
                                        <li>Staffing qualified personnel;</li>
                                        <li>Compliance with healthcare and transport regulations;</li>
                                        <li>Insurance coverage;</li>
                                        <li>Medical equipment maintenance.</li>
                                    </ul>
                                    <p>HealthEasy EMI may undertake onboarding verification but does not independently supervise or control day-to-day ambulance operations.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="7">
                                <Accordion.Header><strong>8. Pricing and Payments</strong></Accordion.Header>
                                <Accordion.Body>
                                    <h6>8.1 Charges</h6>
                                    <p>Charges may include:</p>
                                    <ul>
                                        <li>Base fare;</li>
                                        <li>Distance charges;</li>
                                        <li>Time-based charges;</li>
                                        <li>Waiting charges;</li>
                                        <li>Toll charges;</li>
                                        <li>Parking charges;</li>
                                        <li>Interstate permit fees;</li>
                                        <li>Applicable taxes.</li>
                                    </ul>
                                    
                                    <h6>8.2 Payment Methods</h6>
                                    <p>Payments may be made through:</p>
                                    <ul>
                                        <li>UPI;</li>
                                        <li>Credit cards;</li>
                                        <li>Debit cards;</li>
                                        <li>Net banking;</li>
                                        <li>Wallets;</li>
                                        <li>Cash (where permitted);</li>
                                        <li>Healthcare financing or EMI options.</li>
                                    </ul>
                                    
                                    <h6>8.3 Financing and EMI</h6>
                                    <p>Where healthcare financing or EMI options are offered:</p>
                                    <ul>
                                        <li>Additional financing terms shall apply;</li>
                                        <li>Approval remains subject to lender eligibility criteria;</li>
                                        <li>HealthEasy EMI may act as a Loan Service Provider (LSP) where applicable.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="8">
                                <Accordion.Header><strong>9. Cancellation and Refund Policy</strong></Accordion.Header>
                                <Accordion.Body>
                                    <h6>User Cancellation</h6>
                                    <p>Users may cancel bookings subject to applicable cancellation charges.</p>
                                    <p>Cancellation charges may depend on:</p>
                                    <ul>
                                        <li>Time elapsed after booking;</li>
                                        <li>Ambulance dispatch status;</li>
                                        <li>Distance already travelled by the ambulance.</li>
                                    </ul>
                                    
                                    <h6>No-Show</h6>
                                    <p>Where:</p>
                                    <ul>
                                        <li>The ambulance arrives at the designated location; and</li>
                                        <li>The patient or representative fails to utilize the service,</li>
                                    </ul>
                                    <p>the booking may be treated as a No-Show and charges may apply.</p>
                                    
                                    <h6>Refunds</h6>
                                    <p>Approved refunds will generally be processed within seven (7) to ten (10) business days.</p>
                                    <p>Refund timelines may vary depending upon banking and payment partners.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="9">
                                <Accordion.Header><strong>10. Emergency Services Disclaimer</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI is not a substitute for government emergency response services such as:</p>
                                    <ul>
                                        <li>108 Emergency Ambulance Services;</li>
                                        <li>112 Emergency Response Support System.</li>
                                    </ul>
                                    <p>Users experiencing life-threatening emergencies are advised to immediately contact local emergency services where available.</p>
                                    <p>HealthEasy EMI does not guarantee immediate ambulance availability.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="10">
                                <Accordion.Header><strong>11. Medical Disclaimer</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI does not provide:</p>
                                    <ul>
                                        <li>Medical diagnosis;</li>
                                        <li>Medical advice;</li>
                                        <li>Medical prescriptions;</li>
                                        <li>Clinical treatment.</li>
                                    </ul>
                                    <p>Any medical assistance provided during transportation is the sole responsibility of the Ambulance Partner and associated healthcare personnel.</p>
                                    <p>HealthEasy EMI shall not be responsible for medical decisions or treatment outcomes.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="11">
                                <Accordion.Header><strong>12. Limitation of Liability</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>To the maximum extent permitted by law:</p>
                                    <p>HealthEasy EMI shall not be liable for:</p>
                                    <ul>
                                        <li>Medical outcomes;</li>
                                        <li>Delays caused by external circumstances;</li>
                                        <li>Traffic conditions;</li>
                                        <li>Natural disasters;</li>
                                        <li>Network outages;</li>
                                        <li>Actions or omissions of Ambulance Partners;</li>
                                        <li>Loss of profits;</li>
                                        <li>Indirect or consequential damages.</li>
                                    </ul>
                                    <p>In no event shall the aggregate liability of HealthEasy EMI exceed:</p>
                                    <p>the total amount paid by the User for the specific booking giving rise to the claim or INR 5,000, whichever is lower.</p>
                                    <p>Nothing in these Terms excludes liability that cannot be excluded under applicable law.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="12">
                                <Accordion.Header><strong>13. Indemnity</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Users agree to indemnify and hold harmless HealthEasy EMI, its affiliates, directors, officers, employees, agents, and service providers from any claims, losses, liabilities, damages, costs, or expenses arising from:</p>
                                    <ul>
                                        <li>Breach of these Terms;</li>
                                        <li>Misuse of the Platform;</li>
                                        <li>Violation of applicable laws;</li>
                                        <li>False information submitted by Users.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="13">
                                <Accordion.Header><strong>14. Privacy and Data Protection</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Use of the Services is subject to the HealthEasy EMI Ambulance Privacy Policy.</p>
                                    <p>Users consent to the collection, processing, storage, and sharing of information necessary for:</p>
                                    <ul>
                                        <li>Ambulance dispatch;</li>
                                        <li>Emergency coordination;</li>
                                        <li>Payment processing;</li>
                                        <li>Regulatory compliance.</li>
                                    </ul>
                                    <p>In emergency situations, relevant information may be shared with hospitals, healthcare providers, emergency responders, and Ambulance Partners.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="14">
                                <Accordion.Header><strong>15. Intellectual Property</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>All intellectual property rights relating to:</p>
                                    <ul>
                                        <li>HealthEasy EMI;</li>
                                        <li>Platform software;</li>
                                        <li>Logos;</li>
                                        <li>Trademarks;</li>
                                        <li>Content;</li>
                                        <li>Databases;</li>
                                    </ul>
                                    <p>remain the exclusive property of Arogya Mantra Healthtech Private Limited or its licensors.</p>
                                    <p>No rights are granted except those expressly stated herein.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="15">
                                <Accordion.Header><strong>16. Suspension and Termination</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI may suspend or terminate access to the Platform without prior notice where:</p>
                                    <ul>
                                        <li>Fraud is suspected;</li>
                                        <li>Abuse is reported;</li>
                                        <li>Legal violations occur;</li>
                                        <li>User conduct threatens platform integrity or safety.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="16">
                                <Accordion.Header><strong>17. Force Majeure</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI shall not be liable for failure or delay caused by circumstances beyond reasonable control, including:</p>
                                    <ul>
                                        <li>Natural disasters;</li>
                                        <li>Epidemics or pandemics;</li>
                                        <li>Government restrictions;</li>
                                        <li>Civil disturbances;</li>
                                        <li>Network failures;</li>
                                        <li>Strikes;</li>
                                        <li>Transportation disruptions.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="17">
                                <Accordion.Header><strong>18. Amendments</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI may modify these Terms from time to time.</p>
                                    <p>Updated versions shall be published on the Platform and become effective immediately upon publication.</p>
                                    <p>Continued use of the Services constitutes acceptance of the revised Terms.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="18">
                                <Accordion.Header><strong>19. Governing Law and Jurisdiction</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>These Terms shall be governed by and construed in accordance with the laws of India.</p>
                                    <p>Any dispute arising out of or relating to these Terms or the Services shall be subject to the exclusive jurisdiction of the competent courts at Pune, Maharashtra, India.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="19">
                                <Accordion.Header><strong>20. Contact Information</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI Ambulance Services<br />
                                    Arogya Mantra Healthtech Private Limited<br />
                                    Email: support@healtheasyemi.com<br />
                                    Customer Support: +91-8855919195<br />
                                    Website: https://www.healtheasyemi.com<br />
                                    Registered Office: Office no.23, 3rd Floor, Aston Plaza, Narhe Ambegaon Rd, above Star Bazaar, Ambegaon Budruk, Pune, Maharashtra 411046</p>
                                </Accordion.Body>
                            </Accordion.Item>

                        </Accordion>

                        {/* BOTTOM DISCLAIMER NOTE */}
                        <div className="mt-4 p-3 bg-light border rounded small text-muted">
                            <p>Ambulance Services Disclaimer: HealthEasy EMI is a technology platform that facilitates ambulance discovery, booking, dispatch coordination, and transportation support through independent ambulance service providers. HealthEasy EMI does not provide medical diagnosis or treatment and does not guarantee ambulance availability or response times. In case of life-threatening emergencies, users should immediately contact government emergency services such as 108 or 112. Use of ambulance services is subject to applicable Terms & Conditions and Privacy Policy.</p>
                        </div>

                    </div>
                </Container>
            </section>

            <FooterBar />
        </>
    );
}

export default AmbulanceTerms;