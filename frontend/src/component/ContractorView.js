import React from 'react';

const ContractorView = () => (
  <div id="contractorView" className="d-none">
    <h2>Contractor Dashboard</h2>
    <p>View your assigned jobs.</p>
    <table>
      <thead>
        <tr>
          <th>Work Order</th>
          <th>Customer</th>
          <th>Required Date</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody id="contractorJobList"></tbody>
    </table>
  </div>
);

export default ContractorView;