// ui/modal.js
/**
 * openModal
 *  - id: string        ⇒ the element ID to assign to your modal container
 *  - contentHtml: html ⇒ inner markup of your modal (should include a close button)
 * Returns the modal element so you can wire up event listeners.
 */
export function openModal(id, contentHtml) {
  // Remove any existing modal with the same ID
  const old = document.getElementById(id);
  if (old) old.remove();

  // Create backdrop/container
  const modal = document.createElement('div');
  modal.id = id;
  modal.classList.add('modal');           // expects your CSS to define .modal { display: none; /* … */ }
  modal.style.display = 'flex';           // show it immediately as a flexbox

  // Create content wrapper
  const wrapper = document.createElement('div');
  wrapper.classList.add('modal-content'); // expects .modal-content { /* styling */ }
  wrapper.innerHTML = contentHtml;

  modal.appendChild(wrapper);
  document.body.appendChild(modal);

  // Click outside content closes modal
  modal.addEventListener('click', e => {
    if (e.target === modal) modal.remove();
  });

  return modal;
}

/**
 * closeModal
 *  - id: string ⇒ removes the modal container if present
 */
export function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.remove();
}
