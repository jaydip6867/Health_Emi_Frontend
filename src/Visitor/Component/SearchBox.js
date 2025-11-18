import { City, Country, State } from 'country-state-city';
import axios from 'axios'
import { useEffect, useState } from 'react';
import { Col, Container, Form, Row } from 'react-bootstrap';

import { FiMapPin, FiSearch } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import Loader from '../../Loader';

const SearchBox = () => {
    const [loading, setloading] = useState(false)
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const selectedStateName = states.find(st => st.isoCode === selectedState)?.name || '';
    useEffect(() => {
        document.title = "Health Easy EMI - Keep Life Healthy"
        // load states of India initially
        const india = Country.getCountryByCode("IN");
        const s = State.getStatesOfCountry(india.isoCode);
        setStates(s);
        setloading(true)
        getsuggestion();
    }, []);

    // when state changes, load its cities
    const loadCitiesForState = (stateIso) => {
        const india = Country.getCountryByCode("IN");
        const c = City.getCitiesOfState(india.isoCode, stateIso) || [];
        setCities(c);
    }

    const [recordlist, setreclist] = useState([])
    const [inputValue, setInputValue] = useState('');
    const [showList, setShowList] = useState(false);
    const getsuggestion = async (n) => {

        await axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/user/suggestions',
            data: {
                "search": n,
                "state": selectedStateName,
                "city": selectedCity
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
            <Container>
                <Row className='justify-content-center'>
                    <Col xs={12} md={10} lg={8}>
                        <div className='px-2 py-1'>
                            <div className='d-md-flex searchbox align-items-center position-relative'>
                                <div className='d-flex align-items-center position-relative selectsize'>
                                    <FiMapPin className='position-absolute' style={{ left: 12}} />
                                    <Form.Select
                                        className='ps-5 pe-4 py-2 bg-transparent border-0'
                                        value={selectedState}
                                        onChange={(e) => {
                                            const iso = e.target.value;
                                            setSelectedState(iso);
                                            setSelectedCity('');
                                            loadCitiesForState(iso);
                                            if (inputValue && inputValue.trim().length > 0) {
                                                getsuggestion(inputValue);
                                            }
                                        }}
                                        onFocus={() => setShowList(false)}
                                        name='state'
                                        style={{ background: 'transparent'}}
                                    >
                                        <option value=''>State</option>
                                        {states && states.map((st) => (
                                            <option key={st.isoCode} value={st.isoCode}>{st.name}</option>
                                        ))}
                                    </Form.Select>
                                </div>
                                <div className='d-flex g-0 align-items-center'>
                                    <div className='mx-md-2 line_search_bar'></div>
                                    <div className='d-flex align-items-center w-100 position-relative selectsize'>
                                        <FiMapPin className='position-absolute' style={{ left: 12}} />
                                        <Form.Select
                                            className='ps-5 pe-4 py-2 bg-transparent border-0'
                                            value={selectedCity}
                                            onChange={(e) => {
                                                const v = e.target.value;
                                                setSelectedCity(v);
                                                if (inputValue && inputValue.trim().length > 0) {
                                                    getsuggestion(inputValue);
                                                }
                                            }}
                                            onFocus={() => setShowList(false)}
                                            name='city'
                                            disabled={!selectedState}
                                            style={{ background: 'transparent'}}
                                        >
                                            <option value=''>City</option>
                                            {cities && cities.map((city) => (
                                                <option key={city.name} value={city.name}>{city.name}</option>
                                            ))}
                                        </Form.Select>
                                    </div>
                                    <div className='mx-md-2 line_search_bar'></div>
                                </div>
                                <div className='flex-grow-1'>
                                    <div className='position-relative'>
                                        <FiSearch className='position-absolute' style={{ left: 12, top: 12}} />
                                    <Form.Control
                                        placeholder='Search doctor & Surgery here'
                                        autoComplete="off"
                                        value={inputValue}
                                        onChange={handleInputChange}
                                        onFocus={() => setShowList(true)}
                                        onBlur={() => setTimeout(() => setShowList(false), 50)}
                                        name='name'
                                        className='bg-transparent ps-5 py-2 border-0'
                                        style={{ outline: 'none' }}
                                    />
                                    </div>
                                    {showList && (
                                        <ul style={{
                                            position: 'absolute',
                                            top: '42px',
                                            left: 0,
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
                                                            <Link to={`/surgery/${encodeURIComponent(btoa(item?.name))}`} className='text-decoration-none d-flex justify-content-between px-2'>
                                                                <span>{item?.name}</span>
                                                                <span className='text-muted small'>{item?.type}</span>
                                                            </Link>
                                                        ) : (
                                                            <Link to={`/doctorprofile/${encodeURIComponent(btoa(item?.id))}`} className='text-decoration-none d-flex justify-content-between px-2'>
                                                                <span>{item?.name}</span>
                                                                <span className='text-muted small'>{item?.type}</span>
                                                            </Link>
                                                        )}
                                                    </li>
                                                ))
                                            )}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>

            {loading ? <Loader /> : ''}
        </>
    )

}

export default SearchBox