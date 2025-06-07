import React from 'react';

const AdminView = () => (
  <div id="adminView" className="d-none">
    <h2>Admin Dashboard</h2>
    <p>Manage all jobs and users.</p>
    <table>
      <thead>
        <tr>
          <th>Work Order</th>
          <th>Customer</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody id="adminJobList"></tbody>
    </table>
  </div>
);

export default AdminView;