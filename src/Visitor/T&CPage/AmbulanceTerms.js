import { useEffect, useState } from "react";
import FooterBar from "../Component/FooterBar";
import { useNavigate } from "react-router-dom";
import { SECRET_KEY, STORAGE_KEYS } from '../../config';
import CryptoJS from "crypto-js";
import NavBar from "../Component/NavBar";
import { Container, Accordion } from "react-bootstrap";

function AmbulanceTerms() {
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
        document.title = "HealthEasy EMI – Ambulance Services Terms & Conditions";
    }, []);

    return (
        <>
            <NavBar logindata={logdata} />
            {/* breadcrumb section */}
            <section className='breadcrumb_Sec'>
                <Container className='text-center '>
                    <h2>HealthEasy EMI Ambulance Services – Terms & Conditions</h2>
                </Container>
            </section>
            
            <section className="py-5">
                <Container>
                    <div className="p-3 border rounded">
                        <Accordion defaultActiveKey="0" className='faq-accordion'>
                            
                            <Accordion.Item eventKey="0">
                                <Accordion.Header>1. Introduction</Accordion.Header>
                                <Accordion.Body>
                                    <p>These Terms and Conditions ("Terms") govern the access and use of ambulance booking, medical transportation, emergency coordination, and related services offered through the HealthEasy EMI platform[cite: 840]. The platform is operated by: Arogya Mantra Healthtech Private Limited operating under the brand name HealthEasy EMI Ambulance Services ("HealthEasy EMI", "Company", "we", "our", or "us")[cite: 841, 842]. By accessing, registering on, or using the website, mobile application, call center, or any related service offered by HealthEasy EMI (collectively, the "Platform"), you agree to be legally bound by these Terms[cite: 843]. If you do not agree with these Terms, you must discontinue use of the Platform immediately[cite: 844].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="1">
                                <Accordion.Header>2. Definitions</Accordion.Header>
                                <Accordion.Body>
                                    <p>For the purpose of these Terms[cite: 845]:</p>
                                    <ul>
                                        <li><strong>"User", "Customer", "You", or "Your"</strong> means any individual, patient, caregiver, attendant, organization, or authorized representative using the Platform[cite: 847].</li>
                                        <li><strong>"Ambulance Partner"</strong> means an independent ambulance operator, ambulance service provider, driver, paramedic, emergency medical technician, healthcare institution, or transportation provider registered on the Platform[cite: 848].</li>
                                        <li><strong>"Patient"</strong> means the individual receiving transportation or medical support services[cite: 849].</li>
                                        <li><strong>"Booking"</strong> means a request submitted through the Platform for ambulance transportation services[cite: 850].</li>
                                        <li><strong>"Services"</strong> means ambulance discovery, booking facilitation, dispatch coordination, route tracking, payment facilitation, customer support, and related technology-enabled services[cite: 851].</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="2">
                                <Accordion.Header>3. Nature of Services</Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI operates a technology platform that facilitates connections between Users and independent Ambulance Partners[cite: 853]. Unless expressly stated otherwise, HealthEasy EMI does not own ambulances [cite: 854, 855], HealthEasy EMI does not employ ambulance drivers [cite: 856], HealthEasy EMI does not provide medical diagnosis or treatment [cite: 857], and HealthEasy EMI does not guarantee ambulance availability[cite: 858].</p>
                                    <p>The Platform facilitates[cite: 859]:</p>
                                    <ul>
                                        <li>Emergency ambulance booking[cite: 860];</li>
                                        <li>Non-emergency medical transportation[cite: 861];</li>
                                        <li>ICU ambulance coordination[cite: 862];</li>
                                        <li>Advanced Life Support (ALS) ambulance bookings[cite: 863];</li>
                                        <li>Basic Life Support (BLS) ambulance bookings[cite: 864];</li>
                                        <li>Mortuary and hearse vehicle bookings[cite: 865];</li>
                                        <li>Intercity patient transportation[cite: 866];</li>
                                        <li>GPS tracking and dispatch coordination[cite: 867];</li>
                                        <li>Customer support services[cite: 868].</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="3">
                                <Accordion.Header>4. Eligibility</Accordion.Header>
                                <Accordion.Body>
                                    <p>Users must be at least eighteen (18) years of age [cite: 870, 871]; or use the Platform through a parent, guardian, caregiver, or authorized representative[cite: 872]. By using the Platform, you represent that all information provided is accurate [cite: 873, 874]; you have authority to make bookings on behalf of the patient where applicable [cite: 875]; and your use complies with applicable laws[cite: 876].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="4">
                                <Accordion.Header>5. Booking Process</Accordion.Header>
                                <Accordion.Body>
                                    <h5>5.1 Booking Request</h5>
                                    <p>Users may place bookings through the Website, mobile application, telephone support, or authorized HealthEasy EMI channels[cite: 878, 879, 880, 881, 882, 883].</p>
                                    
                                    <h5>5.2 Confirmation</h5>
                                    <p>A booking is confirmed only after an Ambulance Partner accepts the request [cite: 885, 886]; and confirmation is communicated through the Platform[cite: 887].</p>
                                    
                                    <h5>5.3 Estimated Arrival Time</h5>
                                    <p>Arrival times are estimates only and may be affected by traffic conditions, weather conditions, road closures, vehicle availability, public emergencies, and network interruptions[cite: 888, 889, 890, 891, 892, 893, 894, 895]. HealthEasy EMI does not guarantee arrival within any specified timeframe[cite: 896].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="5">
                                <Accordion.Header>6. User Responsibilities</Accordion.Header>
                                <Accordion.Body>
                                    <p>Users agree to[cite: 897]:</p>
                                    <ul>
                                        <li>Provide accurate pickup and destination information[cite: 899];</li>
                                        <li>Provide accurate patient information[cite: 900];</li>
                                        <li>Cooperate with ambulance personnel[cite: 901];</li>
                                        <li>Follow safety instructions[cite: 902];</li>
                                        <li>Ensure lawful use of the Services[cite: 903];</li>
                                        <li>Maintain respectful behavior[cite: 904].</li>
                                    </ul>
                                    <p>Users shall not make fraudulent bookings [cite: 905, 906], misuse emergency resources [cite: 907], provide false information [cite: 908], or engage in abusive, threatening, discriminatory, or unlawful conduct[cite: 909]. HealthEasy EMI reserves the right to suspend accounts involved in misuse[cite: 910].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="6">
                                <Accordion.Header>7. Ambulance Partner Responsibilities</Accordion.Header>
                                <Accordion.Body>
                                    <p>Ambulance Partners are solely responsible for maintaining valid registrations and permits [cite: 911, 913], vehicle fitness and compliance [cite: 914], staffing qualified personnel [cite: 915], compliance with healthcare and transport regulations [cite: 916], insurance coverage [cite: 917], and medical equipment maintenance[cite: 918]. HealthEasy EMI may undertake onboarding verification but does not independently supervise or control day-to-day ambulance operations[cite: 919].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="7">
                                <Accordion.Header>8. Pricing and Payments</Accordion.Header>
                                <Accordion.Body>
                                    <h5>8.1 Charges</h5>
                                    <p>Charges may include base fare, distance charges, time-based charges, waiting charges, toll charges, parking charges, interstate permit fees, and applicable taxes[cite: 921, 922, 923, 924, 925, 926, 927, 928, 929, 930].</p>
                                    
                                    <h5>8.2 Payment Methods</h5>
                                    <p>Payments may be made through UPI, credit cards, debit cards, net banking, wallets, cash (where permitted), or healthcare financing or EMI options[cite: 931, 932, 933, 934, 935, 936, 937, 938, 939].</p>
                                    
                                    <h5>8.3 Financing and EMI</h5>
                                    <p>Where healthcare financing or EMI options are offered, additional financing terms shall apply [cite: 940, 941, 942]; approval remains subject to lender eligibility criteria [cite: 943]; and HealthEasy EMI may act as a Loan Service Provider (LSP) where applicable[cite: 944].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="8">
                                <Accordion.Header>9. Cancellation and Refund Policy</Accordion.Header>
                                <Accordion.Body>
                                    <h6>User Cancellation</h6>
                                    <p>Users may cancel bookings subject to applicable cancellation charges[cite: 946, 947]. Cancellation charges may depend on the time elapsed after booking, ambulance dispatch status, and distance already travelled by the ambulance[cite: 948, 949, 950, 951].</p>
                                    
                                    <h6>No-Show</h6>
                                    <p>Where the ambulance arrives at the designated location and the patient or representative fails to utilize the service, the booking may be treated as a No-Show and charges may apply[cite: 952, 953, 954, 955, 956].</p>
                                    
                                    <h6>Refunds</h6>
                                    <p>Approved refunds will generally be processed within seven (7) to ten (10) business days[cite: 957, 958]. Refund timelines may vary depending upon banking and payment partners[cite: 959].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="9">
                                <Accordion.Header>10. Emergency Services & Medical Disclaimers</Accordion.Header>
                                <Accordion.Body>
                                    <p><strong>Emergency Services Disclaimer:</strong> HealthEasy EMI is not a substitute for government emergency response services such as 108 Emergency Ambulance Services or 112 Emergency Response Support System[cite: 960, 961, 962, 963]. Users experiencing life-threatening emergencies are advised to immediately contact local emergency services where available[cite: 964]. HealthEasy EMI does not guarantee immediate ambulance availability[cite: 965].</p>
                                    <p><strong>Medical Disclaimer:</strong> HealthEasy EMI does not provide medical diagnosis, medical advice, medical prescriptions, or clinical treatment[cite: 966, 967, 968, 969, 970, 971]. Any medical assistance provided during transportation is the sole responsibility of the Ambulance Partner and associated healthcare personnel[cite: 972]. HealthEasy EMI shall not be responsible for medical decisions or treatment outcomes[cite: 973].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="10">
                                <Accordion.Header>11. Limitation of Liability</Accordion.Header>
                                <Accordion.Body>
                                    <p>To the maximum extent permitted by law, HealthEasy EMI shall not be liable for medical outcomes, delays caused by external circumstances, traffic conditions, natural disasters, network outages, actions or omissions of Ambulance Partners, loss of profits, or indirect or consequential damages[cite: 974, 975, 976, 977, 978, 979, 980, 981, 982, 983, 984]. In no event shall the aggregate liability of HealthEasy EMI exceed the total amount paid by the User for the specific booking giving rise to the claim or INR 5,000, whichever is lower[cite: 985, 986]. Nothing in these Terms excludes liability that cannot be excluded under applicable law[cite: 987].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="11">
                                <Accordion.Header>12. Indemnity</Accordion.Header>
                                <Accordion.Body>
                                    <p>Users agree to indemnify and hold harmless HealthEasy EMI, its affiliates, directors, officers, employees, agents, and service providers from any claims, losses, liabilities, damages, costs, or expenses arising from breach of these Terms, misuse of the Platform, violation of applicable laws, or false information submitted by Users[cite: 988, 989, 990, 991, 992, 993].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="12">
                                <Accordion.Header>13. Privacy and Data Protection</Accordion.Header>
                                <Accordion.Body>
                                    <p>Use of the Services is subject to the HealthEasy EMI Ambulance Privacy Policy[cite: 994, 995]. Users consent to the collection, processing, storage, and sharing of information necessary for ambulance dispatch, emergency coordination, payment processing, and regulatory compliance[cite: 996, 997, 998, 999, 1000]. In emergency situations, relevant information may be shared with hospitals, healthcare providers, emergency responders, and Ambulance Partners[cite: 1001].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="13">
                                <Accordion.Header>14. Intellectual Property</Accordion.Header>
                                <Accordion.Body>
                                    <p>All intellectual property rights relating to HealthEasy EMI, Platform software, logos, trademarks, content, and databases remain the exclusive property of Arogya Mantra Healthtech Private Limited or its licensors[cite: 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010]. No rights are granted except those expressly stated herein[cite: 1011].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="14">
                                <Accordion.Header>15. Suspension, Termination & Force Majeure</Accordion.Header>
                                <Accordion.Body>
                                    <p><strong>Suspension and Termination:</strong> HealthEasy EMI may suspend or terminate access to the Platform without prior notice where fraud is suspected, abuse is reported, legal violations occur, or user conduct threatens platform integrity or safety[cite: 1012, 1013, 1014, 1015, 1016, 1017].</p>
                                    <p><strong>Force Majeure:</strong> HealthEasy EMI shall not be liable for failure or delay caused by circumstances beyond reasonable control, including natural disasters, epidemics or pandemics, government restrictions, civil disturbances, network failures, strikes, and transportation disruptions[cite: 1018, 1019, 1020, 1021, 1022, 1023, 1024, 1025, 1026].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="15">
                                <Accordion.Header>16. Amendments, Governing Law and Jurisdiction</Accordion.Header>
                                <Accordion.Body>
                                    <p><strong>Amendments:</strong> HealthEasy EMI may modify these Terms from time to time[cite: 1027, 1028]. Updated versions shall be published on the Platform and become effective immediately upon publication[cite: 1029]. Continued use of the Services constitutes acceptance of the revised Terms[cite: 1030].</p>
                                    <p><strong>Governing Law and Jurisdiction:</strong> These Terms shall be governed by and construed in accordance with the laws of India[cite: 1031, 1032]. Any dispute arising out of or relating to these Terms or the Services shall be subject to the exclusive jurisdiction of the competent courts at Pune, Maharashtra, India[cite: 1033].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="16">
                                <Accordion.Header>17. Contact Information & Final Summary Disclaimer</Accordion.Header>
                                <Accordion.Body>
                                    <p><strong>Contact Information:</strong> HealthEasy EMI Ambulance Services Arogya Mantra Healthtech Private Limited [cite: 1034, 1035]<br />
                                    Email: support@healtheasyemi.com | Customer Support: +91-8855919195 | Website: https://www.healtheasyemi.com [cite: 1036]<br />
                                    Registered Office: Office no.23, 3rd Floor, Aston Plaza, Narhe Ambegaon Rd, above Star Bazaar, Ambegaon Budruk, Pune, Maharashtra 411046 [cite: 1037]</p>
                                    
                                    <hr />
                                    
                                    <p><strong>Ambulance Services Disclaimer:</strong> HealthEasy EMI is a technology platform that facilitates ambulance discovery, booking, dispatch coordination, and transportation support through independent ambulance service providers[cite: 1038]. HealthEasy EMI does not provide medical diagnosis or treatment and does not guarantee ambulance availability or response times[cite: 1039]. In case of life-threatening emergencies, users should immediately contact government emergency services such as 108 or 112. Use of ambulance services is subject to applicable Terms & Conditions and Privacy Policy[cite: 1040].</p>
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

export default AmbulanceTerms;