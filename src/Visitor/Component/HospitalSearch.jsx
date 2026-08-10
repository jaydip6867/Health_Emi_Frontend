import React, { useEffect, useRef, useState } from "react";
import { Col, Container, Form, Row } from "react-bootstrap";
import { FiSearch } from "react-icons/fi";

const HospitalSearch = React.forwardRef(({ onSearch }, ref) => {
  const [inputValue, setInputValue] = useState("");
  const debounceTimerRef = useRef(null);

  React.useImperativeHandle(ref, () => ({
    resetFilters: () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      setInputValue("");
      onSearch?.("");
    },
  }));

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      onSearch?.(value.trim());
    }, 300);
  };

  return (
    <Container>
      <Row className="justify-content-center position-relative" style={{ zIndex: 100 }}>
        <Col xs={12} md={10} lg={8}>
          <div className="px-2 py-1">
            <div className="d-md-flex searchbox align-items-center position-relative">
              <div className="flex-grow-1">
                <div className="position-relative">
                  <FiSearch className="position-absolute" style={{ left: 12, top: 12 }} />
                  <Form.Control
                    placeholder="Search Hospital"
                    autoComplete="off"
                    value={inputValue}
                    onChange={handleInputChange}
                    className="bg-transparent ps-5 py-2 border-0"
                  />
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
});

export default HospitalSearch;
