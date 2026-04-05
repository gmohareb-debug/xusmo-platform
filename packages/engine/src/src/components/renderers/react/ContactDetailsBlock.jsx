import React from "react";

export function ContactDetailsBlock({ address, phone, email, hours }) {
  return (
    <div className="contact-details-block">
      {address && (
        <div className="contact-details-item">
          <span className="contact-details-label">Address</span>
          <span className="contact-details-value">{address}</span>
        </div>
      )}
      {phone && (
        <div className="contact-details-item">
          <span className="contact-details-label">Phone</span>
          <a href={`tel:${phone}`} className="contact-details-value contact-details-link">
            {phone}
          </a>
        </div>
      )}
      {email && (
        <div className="contact-details-item">
          <span className="contact-details-label">Email</span>
          <a href={`mailto:${email}`} className="contact-details-value contact-details-link">
            {email}
          </a>
        </div>
      )}
      {hours && (
        <div className="contact-details-item">
          <span className="contact-details-label">Hours</span>
          <span className="contact-details-value">{hours}</span>
        </div>
      )}
    </div>
  );
}
