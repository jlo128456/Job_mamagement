import './style/style-base.css';
import './style/style-login.css';
import './style/style-logout.css';
import './style/style-form-fields.css';
import './style/style-layout.css';
import './style/style-modal.css';
import './style/style-responsive.css';
import './style/style-utility.css';

import Header from './components/Header';
import Footer from './components/Footer';
import LoginForm from './components/LoginForm';
import AdminView from './components/AdminView';
import ContractorView from './components/ContractorView';
import TechView from './components/TechView';
import CreateJobModal from './components/CreateJobModal';
import SignupModal from './components/SignupModal';
import ForgotPasswordModal from './components/ForgotPasswordModal';

function App() {
  return (
    <>
      <Header />

      <main>
        <LoginForm />
        <AdminView />
        <ContractorView />
        <TechView />
        <CreateJobModal />
      </main>

      <SignupModal />
      <ForgotPasswordModal />
      <Footer />
    </>
  );
}

export default App;
