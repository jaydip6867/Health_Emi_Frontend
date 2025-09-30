import { City, Country, State } from 'country-state-city';
import axios from 'axios'
import { useEffect, useState } from 'react';
import { Button, Col, Container, Form, InputGroup, Row } from 'react-bootstrap';

import { FiMapPin, FiSearch } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import Loader from '../../Loader';

const SearchBox = () => {
    const [loading, setloading] = useState(false)
    const [cities, setCities] = useState([]);
    useEffect(() => {
        document.title = "Health Easy EMI - Keep Life Healthy"
        getcitiesname();
        setloading(true)
        getsuggestion();
    }, []);

    // find location 

    function getcitiesname() {
        const india = Country.getCountryByCode("IN");
        const states = State.getStatesOfCountry(india.isoCode);
        const allCities = states.flatMap((state) =>
            City.getCitiesOfState(india.isoCode, state.isoCode)
        );
        setCities(allCities);
    }

    const [searchinputcity, setsearchinputcity] = useState('')
    const [recordlist, setreclist] = useState([])
    const [inputValue, setInputValue] = useState('');
    const [showList, setShowList] = useState(false);
    const getsuggestion = async (n) => {

        await axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/user/suggestions',
            data: {
                "search": n,
                "city": searchinputcity
            }
        }).then((res) => {
            // console.log('suggestions = ',res.data.Data)
            setreclist(res.data.Data)
        }).catch(function (error) {
            console.log(error);
        }).finally(() => {
            setloading(false)
        });
    }

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        setShowList(true);
        getsuggestion(e.target.value)
    };

    const handleSelectItem = (item) => {
        setInputValue(item);
        setShowList(false);
    };
    return (
        <>
            <section className='py-5'>
                <Container>
                    <Row className='justify-content-center searchbox'>
                        <Col xs={12} md={10} lg={8}>
                            <div
                                className='p-3 p-md-4 rounded-4 shadow-sm'
                                style={{
                                    background: 'linear-gradient(135deg, #eef7ff 0%, #ffffff 60%)',
                                    border: '1px solid rgba(0,0,0,0.06)'
                                }}
                            >
                                <InputGroup className='align-items-stretch'>
                                    <div className='position-relative d-flex align-items-center' style={{ maxWidth: 180 }}>
                                        <FiMapPin className='position-absolute' style={{ left: 12, color: '#6b7280' }} />
                                        <Form.Select
                                            className='rounded-pill ps-5 pe-4 py-2 border-0'
                                            value={searchinputcity}
                                            onChange={(e) => setsearchinputcity(e.target.value)}
                                            onFocus={() => setShowList(true)}
                                            name='city'
                                            style={{ background: '#f3f4f6' }}
                                        >
                                            <option>Location</option>
                                            {
                                                cities && cities.map((city, vi) => (
                                                    <option key={vi} value={city.name}>{city.name}</option>
                                                ))
                                            }
                                        </Form.Select>
                                    </div>

                                    <div className='flex-grow-1 position-relative mx-2'>
                                        <FiSearch className='position-absolute' style={{ left: 12, top: 14, color: '#6b7280' }} />
                                        <Form.Control
                                            placeholder='Search doctor & Surgery here'
                                            autoComplete="off"
                                            value={inputValue}
                                            onChange={handleInputChange}
                                            onFocus={() => setShowList(true)}
                                            onBlur={() => setTimeout(() => setShowList(false), 50)}
                                            name='name'
                                            className='rounded-pill ps-5 py-2'
                                            style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}
                                        />
                                        {showList && (
                                            <ul style={{
                                                position: 'absolute',
                                                top: '42px',
                                                width: '100%',
                                                border: '1px solid #e5e7eb',
                                                backgroundColor: 'white',
                                                listStyle: 'none',
                                                padding: '6px',
                                                margin: '0',
                                                maxHeight: '350px',
                                                overflowY: 'auto',
                                                zIndex: 10,
                                                borderRadius: '14px',
                                                boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
                                            }}>
                                                {recordlist.length === 0 ? (
                                                    <p className='p-2 m-0 text-muted'>No Record Found</p>
                                                ) : (
                                                    recordlist.map((item, index) => (
                                                        <li
                                                            key={index}
                                                            onClick={() => handleSelectItem(item.name)}
                                                            style={{
                                                                padding: '10px 8px',
                                                                cursor: 'pointer',
                                                                borderBottom: '1px solid #f3f4f6',
                                                                borderRadius: '10px'
                                                            }}
                                                            onMouseDown={(e) => e.preventDefault()} // Prevent input blur before click
                                                            onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                        >
                                                            {item.type === 'surgery' ? (
                                                                <Link to={`/surgery/${encodeURIComponent(btoa(item.id))}`} className='text-decoration-none d-flex justify-content-between px-2'>
                                                                    <span>{item.name}</span>
                                                                    <span className='text-muted small'>{item.type}</span>
                                                                </Link>
                                                            ) : (
                                                                <Link to={`/doctorprofile/${encodeURIComponent(btoa(item.id))}`} className='text-decoration-none d-flex justify-content-between px-2'>
                                                                    <span>{item.name}</span>
                                                                    <span className='text-muted small'>{item.type}</span>
                                                                </Link>
                                                            )}
                                                        </li>
                                                    ))
                                                )}
                                            </ul>
                                        )}
                                    </div>

                                    <div className='d-flex'>
                                        <Button
                                            variant='primary'
                                            className='rounded-pill px-4'
                                            onClick={() => { setShowList(true); getsuggestion(inputValue) }}
                                        >
                                            Search
                                        </Button>
                                    </div>
                                </InputGroup>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {loading ? <Loader /> : ''}
        </>
    )

}

export default SearchBox