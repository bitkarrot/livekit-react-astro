import React, { useState } from 'react';

const WidgetPopup = ({ nipEntity }) => {
  const [isOpen, setIsOpen] = useState(false);

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <button onClick={togglePopup}>
        {isOpen ? 'Close Widget' : 'Open Widget'}
      </button>

      {isOpen && (
        <div style={popupStyle}>
          <div style={overlayStyle} onClick={togglePopup} />
          <div style={contentStyle}>
            <button onClick={togglePopup} style={closeButtonStyle}>X</button>
            <div>
              <script src={`https://njump.me/embed/${nipEntity}`} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles for the popup
const popupStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const overlayStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
};

const contentStyle = {
  position: 'relative',
  background: 'white',
  padding: '20px',
  borderRadius: '8px',
  zIndex: 1001,
};

const closeButtonStyle = {
  position: 'absolute',
  top: '10px',
  right: '10px',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
};

export default WidgetPopup;
