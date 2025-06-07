import React from 'react';

const CreateJobModal = () => (
  <div id="createJobModal" className="modal hidden">
    <div className="modal-content">
      <h2>Create Job</h2>
      <form id="createJobForm">
        <input type="text" name="work_order" placeholder="Work Order" required />
        <input type="text" name="customer_name" placeholder="Customer Name" required />
        <button type="submit">Create Job</button>
      </form>
    </div>
  </div>
);

export default CreateJobModal;