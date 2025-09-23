import { City, Country, State } from 'country-state-city';
import axios from 'axios'
import { useEffect, useState } from 'react';
import { Col, Container, Form, InputGroup, Row } from 'react-bootstrap';
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
                        <Col xs={12} md={7}>
                            <InputGroup>
                                <div className='position-relative'>
                                    <FiMapPin className='position-absolute icon' />
                                    <Form.Select className='frm-select city' value={searchinputcity} onChange={(e) => setsearchinputcity(e.target.value)} onFocus={() => setShowList(true)} name='city' style={{ 'maxWidth': '150px' }}>
                                        <option>Location</option>
                                        {
                                            cities && cities.map((city, vi) => {
                                                return (<option key={vi} value={city.name} >{city.name}</option>)
                                            })
                                        }
                                    </Form.Select>
                                </div>

                                <div className='flex-grow-1 position-relative'>
                                    <FiSearch className='position-absolute icon' />
                                    <Form.Control placeholder='Search doctor & Surgery here ' autoComplete="off" value={inputValue} onChange={handleInputChange} onFocus={() => setShowList(true)} onBlur={() => setTimeout(() => setShowList(false), 50)} name='name' />
                                    {showList && (
                                        <ul style={{
                                            position: 'absolute',
                                            top: '40px',
                                            width: '100%',
                                            border: '1px solid #221a1aff',
                                            backgroundColor: 'white',
                                            listStyle: 'none',
                                            padding: '0',
                                            margin: '0',
                                            maxHeight: '350px',
                                            overflowY: 'auto',
                                            zIndex: 10
                                        }}>
                                            { recordlist.length === 0 ? <p className='p-2 m-0'>No Record Found</p> : recordlist.map((item, index) => (
                                                <li
                                                    key={index}
                                                    onClick={() => handleSelectItem(item.name)}
                                                    style={{
                                                        padding: '8px',
                                                        cursor: 'pointer',
                                                        borderBottom: '1px solid #eee'
                                                    }}
                                                    onMouseDown={(e) => e.preventDefault()} // Prevent input blur before click
                                                >
                                                    {item.type === 'surgery' ? <Link to={`/surgery/${encodeURIComponent(btoa(item.id))}`} className='text-decoration-none d-flex justify-content-between px-3'><span>{item.name}</span> <span className='text-muted'>{item.type}</span> </Link> : <Link to={`/doctorprofile/${encodeURIComponent(btoa(item.id))}`} className='text-decoration-none d-flex justify-content-between px-3'><span>{item.name}</span> <span className='text-muted'>{item.type}</span></Link>}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                {/* <Button variant="primary" id="button-addon2">
                  Search
                </Button> */}
                            </InputGroup>
                        </Col>
                    </Row>
                </Container>
            </section>

            {loading ? <Loader /> : ''}
        </>
    )

}

export default SearchBox