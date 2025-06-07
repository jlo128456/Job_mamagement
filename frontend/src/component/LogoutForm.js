import React from 'react';

const LogoutForm = () => (
  <form id="logout-form" action="/logout" method="POST">
    <input type="hidden" name="_token" id="logout-token" />
    <button type="submit">Logout</button>
  </form>
);

export default LogoutForm;