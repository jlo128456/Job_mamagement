export default function ForgotPasswordModal() {
  return (
    <div className="modal">
      <h2>Forgot Password</h2>
      <form>
        <input type="email" placeholder="Email" required />
        <button type="submit">Send Reset Link</button>
      </form>
    </div>
  );
}