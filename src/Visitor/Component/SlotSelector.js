import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const SlotSelector = () => {
  const [selectedSlots, setSelectedSlots] = useState([]);

  const generateSlots = () => {
    const slots = [];
    let startHour = 12;
    let startMin = 0;

    for (let i = 0; i < 8; i++) {
      const endMin = (startMin + 30) % 60;
      const endHour = startMin + 30 >= 60 ? startHour + 1 : startHour;

      const formatTime = (hour, min) => {
        const suffix = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 === 0 ? 12 : hour % 12;
        const displayMin = min.toString().padStart(2, '0');
        return `${displayHour}:${displayMin} ${suffix}`;
      };

      const startTime = formatTime(startHour, startMin);
      const endTime = formatTime(endHour, endMin);

      slots.push({ id: i, label: `${startTime} - ${endTime}` });

      startHour = endHour;
      startMin = endMin;
    }

    return slots;
  };

  const slots = generateSlots();

  const toggleSlot = (id) => {
    if (selectedSlots.includes(id)) {
      setSelectedSlots(selectedSlots.filter((slotId) => slotId !== id));
    } else {
      if (selectedSlots.length < 4) {
        setSelectedSlots([...selectedSlots, id]);
      }
    }
  };

  const handleSubmit = () => {
    const selectedLabels = slots
      .filter((slot) => selectedSlots.includes(slot.id))
      .map((slot) => slot.label);
    alert('Selected Slots:\n' + selectedLabels.join('\n'));
  };

  return (
    <div className="container my-4">
      <h4>Select up to 4 Time Slots</h4>
      <div className="d-flex flex-wrap gap-2 my-3">
        {slots.map((slot) => (
          <button
            key={slot.id}
            className={`btn slot-btn ${
              selectedSlots.includes(slot.id) ? 'btn-primary' : 'btn-outline-primary'
            }`}
            onClick={() => toggleSlot(slot.id)}
          >
            {slot.label}
          </button>
        ))}
      </div>

      <button className="btn btn-success mt-3" onClick={handleSubmit}>
        Submit
      </button>
    </div>
  );
};

export default SlotSelector;
