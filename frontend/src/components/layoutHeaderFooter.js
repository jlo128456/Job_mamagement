import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/style-layout.css'; // Or wherever your layout styles are

function LayoutHeaderFooter() {
  return (
    <>
      <header className="main-header">
        <div className="logo">Job Manager</div>
        <nav>
          <Link to="/admin">Admin</Link>
          <Link to="/contractor">Contractor</Link>
          <Link to="/technician">Technician</Link>
        </nav>
      </header>

      <footer className="main-footer">
        <p>&copy; {new Date().getFullYear()} PA Digital. All rights reserved.</p>
      </footer>
    </>
  );
}

export default LayoutHeaderFooter;
