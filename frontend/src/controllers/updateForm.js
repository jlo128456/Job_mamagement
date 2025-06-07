// controllers/updateForm.js
import { fetchJob, fetchMachines, putJob } from '../services/jobService.js';
import { openModal, closeModal } from '../ui/modal.js';
import { showDashboard } from '../dashboard/index.js';
import { G }  from '../globals.js';

export async function showUpdateJobForm(id) {
  try {
    const [job, machines] = await Promise.all([fetchJob(id), fetchMachines()]);
    // hide main views
    [G.adminView, G.contractorView, G.techView].forEach(v => v && (v.style.display = 'none'));

    // helpers to build HTML
    const mkOpts = list => list.map(([v,t,sel]) => `<option value="${v}"${sel? ' selected':''}>${t}</option>`).join('');
    const inputDefs = [
      ['customerName','customer_name','text'], ['contactName','contact_name','text'],
      ['travelTime','travel_time','number'],    ['labourTime','labour_time','number'],
      ['note_count','note_count','number'],     ['completionDate','completion_date','date']
    ];
    const inputs = inputDefs.map(([id,k,type]) => 
      `<div><label>${id.replace(/([A-Z])/,' $1')}</label>
         <input id="${id}" type="${type}" value="${job[k]||''}" required>
       </div>`).join('');

    const statusOpts = mkOpts(
      ['Pending','Pending', job.status==='Pending'],
      ['In Progress','In Progress', job.status==='In Progress'],
      ['Completed - Pending Approval','Completed - Pending Approval', job.status==='Completed - Pending Approval']
    );
    const statusField = G.currentUserRole==='contractor'
      ? `<input type="hidden" id="jobStatus" value="Completed">`
      : `<select id="jobStatus">${statusOpts}</select>`;

    const wpOpts = mkOpts(
      ['Routine Maintenance','Routine Maintenance'], 
      ['Software Update','Software Update'],
      ['Parts Replacement','Parts Replacement'],
      ['Hardware Repair','Hardware Repair'],
      ['System Calibration','System Calibration']
    );

    const machineOpts = mkOpts(...machines.map(m => [
      m.machineId, `${m.machineType} – ${m.model}`, m.machineId===job.machineId
    ]));

    const existingEntries = (job.machines||[]).map(mid => {
      const m = machines.find(x => x.machineId===mid);
      return m? `
        <div class="machine-entry" data-id="${m.machineId}">
          <strong>${m.machineType} – ${m.model}</strong>
          <textarea class="machine-notes" placeholder="Notes"></textarea>
          <input class="machine-parts" placeholder="Parts Used">
          <button class="remove-machine" type="button">Remove</button>
        </div>` : '';
    }).join('');

    const checklistItems = [
      ['checkScrews','noMissingScrews','No Missing Screws'],
      ['checkSoftwareUpdated','softwareUpdated','Software Updated'],
      ['checkTested','tested','Tested'],
      ['checkApproved','approvedByManagement','Approved by Management']
    ].map(([id,key,label]) => 
      `<label><input type="checkbox" id="${id}"${job.checklist?.[key]?' checked':''}> ${label}</label>`
    ).join('');

    // assemble modal inner HTML
    const html = `
      <button id="closeBtn" class="close-button">×</button>
      <h3>Update #${job.work_order}</h3>
      <form id="form">
        ${inputs}
        <div>
          <label>Work Performed</label>
          <select id="wpSel"><option value="">Common Work</option>${wpOpts}</select>
          <textarea id="workPerformed" rows="3" required>${job.work_performed||''}</textarea>
        </div>
        <div>
          <label>Select Machine</label>
          <select id="machineSel"><option value="">Select</option>${machineOpts}</select>
          <button id="addMachine" type="button">Add</button>
        </div>
        <div id="machineList">${existingEntries}</div>
        <div><label>Status</label>${statusField}</div>
        <div><label>Checklist</label>${checklistItems}</div>
        <div>
          <label>Signature</label>
          <canvas id="sig" width="400" height="150"></canvas>
          <button id="clearSig" type="button">Clear</button>
        </div>
        <button type="submit">Save</button>
      </form>
      <button id="backBtn">Back</button>
    `;

    const modal = openModal('updModal', html);
    const $ = modal.querySelector.bind(modal);

    // close & back
    $('#closeBtn').onclick = () => (closeModal('updModal'), showDashboard(G.currentUserRole));
    $('#backBtn').onclick   = $('#closeBtn').onclick;

    // work-performed dropdown → textarea
    $('#wpSel').onchange = e => {
      $('#workPerformed').value += e.target.value + '\n';
      e.target.value = '';
    };

    // signature pad
    const canvas = $('#sig'), ctx = canvas.getContext('2d');
    let drawing = false;
    if (job.signature) {
      const img = new Image();
      img.src = job.signature;
      img.onload = () => ctx.drawImage(img, 0, 0);
    }
    canvas.onmousedown = e => (drawing = true, ctx.beginPath(), ctx.moveTo(e.offsetX, e.offsetY));
    canvas.onmouseup   = () => drawing = false;
    canvas.onmousemove = e => drawing && (ctx.lineWidth = 2, ctx.lineCap = 'round', ctx.strokeStyle = '#000', ctx.lineTo(e.offsetX, e.offsetY), ctx.stroke());
    $('#clearSig').onclick = () => ctx.clearRect(0, 0, canvas.width, canvas.height);

    // add/remove machines
    $('#addMachine').onclick = () => {
      const sel = $('#machineSel');
      if (!sel.value) return alert('Select a machine');
      if (modal.querySelector(`[data-id="${sel.value}"]`)) return;
      const div = document.createElement('div');
      div.className = 'machine-entry';
      div.dataset.id = sel.value;
      div.innerHTML = `
        <strong>${sel.selectedOptions[0].text}</strong>
        <textarea class="machine-notes" placeholder="Notes"></textarea>
        <input class="machine-parts" placeholder="Parts Used">
        <button class="remove-machine" type="button">Remove</button>
      `;
      $('#machineList').append(div);
    };
    $('#machineList').onclick = e => {
      if (e.target.classList.contains('remove-machine')) e.target.closest('.machine-entry').remove();
    };

    // form submit
    $('#form').onsubmit = async e => {
      e.preventDefault();
      // status mapping for contractors
      let newStatus = $('#jobStatus').value, contStatus = newStatus;
      if (G.currentUserRole === 'contractor' && newStatus === 'Completed') {
        newStatus = 'Completed - Pending Approval';
        contStatus = 'Completed';
      }
      const machinesData = Array.from(modal.querySelectorAll('.machine-entry')).map(div => ({
        id: div.dataset.id,
        notes: div.querySelector('.machine-notes').value,
        partsUsed: div.querySelector('.machine-parts').value
      }));
      const updated = {
        ...job,
        customer_name:  $('#customerName').value.trim(),
        contact_name:   $('#contactName').value.trim(),
        travel_time:    +$('#travelTime').value,
        labour_time:    +$('#labourTime').value,
        note_count:     +$('#note_count').value,
        work_performed: $('#workPerformed').value.trim(),
        status:         newStatus,
        contractor_status: contStatus,
        completion_date:   $('#completionDate').value,
        checklist: {
          noMissingScrews:      $('#checkScrews').checked,
          softwareUpdated:      $('#checkSoftwareUpdated').checked,
          tested:               $('#checkTested').checked,
          approvedByManagement: $('#checkApproved').checked
        },
        signature: canvas.toDataURL(),
        machines:  machinesData
      };
      try {
        await putJob(job.id, updated);
        alert('Job updated & sent for approval');
        $('#closeBtn').onclick();
      } catch {
        alert('Failed to update');
      }
    };

  } catch {
    alert('Failed to load job data');
  }
}

