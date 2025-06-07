import React from 'react';

const TechView = () => (
  <div id="techView" className="d-none">
    <h2>Technician Dashboard</h2>
    <p>View and update your assigned jobs.</p>
    <table>
      <thead>
        <tr>
          <th>Work Order</th>
          <th>Customer Name</th>
          <th>Require Date</th>
          <th>Status</th>
          <th>Logged Time</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody id="techJobList"></tbody>
    </table>
  </div>
);

export default TechView;