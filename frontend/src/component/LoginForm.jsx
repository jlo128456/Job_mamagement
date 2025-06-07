import React from 'react';

const LoginForm = () => (
  <form id="login-form" action="/login" method="POST">
    <input type="email" name="email" placeholder="Email" required />
    <input type="password" name="password" placeholder="Password" required />
    <button type="submit">Login</button>
  </form>
);

export default LoginForm;