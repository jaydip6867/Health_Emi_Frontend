import React from 'react'

const A_Doctors = () => {
    const SECRET_KEY = "health-emi";
    var navigate = useNavigate();
    const [loading, setloading] = useState(false)

    const [admindata, setadmin] = useState(null)
    const [token, settoken] = useState(null)
    useEffect(() => {
        var getlocaldata = localStorage.getItem('healthadmincredit');
        if (getlocaldata != null) {
            const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            var data = JSON.parse(decrypted);
        }
        if (!data) {
            navigate('/healthadmin')
        }
        else {
            setadmin(data.userData);
            settoken(`Bearer ${data.accessToken}`)
        }
    }, [navigate])
    return (
        <>
            <Container fluid className='p-0 panel'>
                <Row className='g-0'>
                    <A_Sidebar />
                    <Col xs={12} sm={9} lg={10} className='p-3'>
                        <A_Nav patientname={admindata?.name} />
                        <div className='bg-white rounded p-3 shadow '>
                            <Row className='mt-2 mb-3 justify-content-between'>
                                <Col xs={'auto'}>
                                    <h4>Doctor List</h4>
                                </Col>
                                <Col xs={'auto'}>
                                    {/* <Button variant='primary' onClick={handleDCshow}>Add Surgery Type</Button> */}
                                </Col>
                            </Row>
                        </div>
                    </Col>
                </Row>

            </Container>
            <ToastContainer />
            {loading ? <Loader /> : ''}
        </>
    )
}

export default A_Doctors
