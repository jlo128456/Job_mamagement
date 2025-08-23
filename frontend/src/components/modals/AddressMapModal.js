// map function to open map modal (uses a portal)
import React from "react";
import { createPortal } from "react-dom";

function AddressMapModal({ address, onClose }) {
  if (!address) return null;
  const src = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

  const node = (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginBottom: 8 }}>Location</h3>
        <p style={{ margin: "0 0 12px 0", opacity: 0.8 }}>{address}</p>
        <div style={{ width: "100%", height: 360 }}>
          <iframe
            title="map"
            src={src}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <button style={{ marginTop: 12 }} onClick={onClose}>Close</button>
      </div>
    </div>
  );

  // render outside the table to avoid hydration/DOM nesting errors
  const target = document.getElementById("modal-root") || document.body;
  return createPortal(node, target);
}

export default AddressMapModal;
