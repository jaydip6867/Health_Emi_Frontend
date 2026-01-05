import { useEffect, useState } from "react";
import FooterBar from "../Component/FooterBar";
import { useNavigate } from "react-router-dom";
import { SECRET_KEY, STORAGE_KEYS } from '../../config'
import CryptoJS from "crypto-js";
import NavBar from "../Component/NavBar";
import { Container, Accordion } from "react-bootstrap";

function MedicinePolicy
() {
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
                                <Accordion.Header>Overview</Accordion.Header>
                                <Accordion.Body>
                                    <p>The Healtheasy EMI Information System serves as a comprehensive reference source for information related to medicines and medicinal products. This feature focuses on delivering key data required for understanding such products, including but not limited to:</p>
                                    <ul>
                                        <li>The composition and ingredients used in the manufacture of medicines and medicinal products.</li>
                                        <li>Potential side effects associated with their use.</li>
                                        <li>Available alternatives for specific types or categories of medicines.</li>
                                        <li>Common symptoms and the generally prescribed medicines or products for such conditions.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="1">
                                <Accordion.Header>1. For Users</Accordion.Header>
                                <Accordion.Body>
                                    <p>a. You acknowledge that the information provided through this feature is intended for informational purposes only and should not be construed as a substitute for professional medical advice. Treatment decisions must always be made in consultation with a qualified healthcare provider. Please note that medicinal information may vary significantly across regions and countries. The content provided here is tailored for users in India and may not be applicable elsewhere. Healtheasy EMI provides this information on an “as is” basis and does not intend to replace medical consultation.</p>
                                    <p>b. While we have made commercially reasonable efforts to source information from credible and reliable third-party databases and open-source platforms, Healtheasy EMI does not guarantee the accuracy, completeness, or timeliness of the information. We disclaim all responsibility for any errors, omissions, or discrepancies and the consequences that may arise from reliance on such content. The inclusion or exclusion of any medicine or product should not be interpreted as an endorsement or rejection by Healtheasy EMI.</p>
                                    <p>c. This feature is not an invitation or recommendation to self-medicate. Users are strongly advised to consult a licensed healthcare professional before taking or discontinuing any medication or medicinal product based on the information provided here.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="2">
                                <Accordion.Header>2. For Healthcare Practitioners</Accordion.Header>
                                <Accordion.Body>
                                    <p>a. Practitioners acknowledge and agree that Healtheasy EMI makes no warranties or representations regarding the accuracy, validity, or legitimacy of the content provided via this feature.</p>
                                    <p>b. This feature is intended solely as an information resource and not as a substitute for clinical judgment or a formal prescription database. Practitioners must apply their professional discretion while using the information for any diagnostic or treatment decisions.</p>
                                    <p>c. Healtheasy EMI does not guarantee that the information provided will meet individual practitioner requirements or expectations, nor does it assure the reliability, completeness, or timeliness of such data. Healtheasy EMI shall not be held liable for any errors or discrepancies that may occur.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="2">
                                <Accordion.Header>3. Disclaimer</Accordion.Header>
                                <Accordion.Body>
                                    <p>a. The information shared through this feature, including details on dietary supplements and other medicinal products, has not been reviewed or approved by the Drug Controller General of India or any other statutory authority.</p>s
                                    <p>b. THE INFORMATION IS PROVIDED “AS IS” AND “AS AVAILABLE”, WITHOUT ANY WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. Healtheasy EMI explicitly disclaims all warranties, including but not limited to merchantability, fitness for a particular purpose, non-infringement, security, accuracy, and completeness. Healtheasy EMI assumes no liability for any loss, injury, or consequences, including death, resulting from the use of or reliance on the information provided.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="2">
                                <Accordion.Header>4. Limitation of Liability</Accordion.Header>
                                <Accordion.Body>
                                    <p>Under no circumstances shall Healtheasy EMI be held liable for any indirect, incidental, consequential, special, punitive, or exemplary damages—including but not limited to loss of data, business interruptions, or loss of profits—regardless of the form of action or legal theory. The total cumulative liability of Healtheasy EMI, for any and all claims arising under these terms, shall not exceed INR 1000 (Indian Rupees One Thousand only).</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="2">
                                <Accordion.Header>4. Limitation of Liability</Accordion.Header>
                                <Accordion.Body>
                                    <p>Under no circumstances shall Healtheasy EMI be held liable for any indirect, incidental, consequential, special, punitive, or exemplary damages—including but not limited to loss of data, business interruptions, or loss of profits—regardless of the form of action or legal theory. The total cumulative liability of Healtheasy EMI, for any and all claims arising under these terms, shall not exceed INR 1000 (Indian Rupees One Thousand only).</p>
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
export default MedicinePolicy
