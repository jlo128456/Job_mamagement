// src/components/modals/AddressMapModal.js
import React from "react";
import { createPortal } from "react-dom";

function AddressMapModal({ address, name, onClose }) {
  const query = (address || name || "").trim();
  const src = query ? `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed` : null;
  const mapsUrl = query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : "#";

  const node = (
    <div className="modal-overlay overlay-opaque" onClick={onClose}>
      <div
        className="modal-container map-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Map location"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="modal-title">Location</h3>
          <button className="modal-close" aria-label="Close" onClick={onClose}>×</button>
        </div>

        <p className="modal-subtitle">
          {address || (name ? `No address on file — searching “${name}”.` : "No address available.")}
        </p>

        {src ? (
          <div className="map-wrapper">
            <iframe
              title="Google Map"
              src={src}
              className="map-iframe"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        ) : (
          <div className="map-placeholder">Add a customer address to view a map.</div>
        )}

        <div className="modal-actions">
          {query && (
            <a className="btn" href={mapsUrl} target="_blank" rel="noopener noreferrer">
              Open in Google Maps
            </a>
          )}
          <button className="btn close-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );

  return createPortal(node, document.getElementById("modal-root") || document.body);
}

export default AddressMapModal;
