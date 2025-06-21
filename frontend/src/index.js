
import ReactDOM from 'react-dom/client';
import App from './App';

//  Corrected CSS paths assuming styles are in src/styles/
import './styles/style-layout.css';
import './styles/style-form-fields.css';
import './styles/style-modal.css';
import './styles/style-logout.css';
import './styles/style-login.css';
import './styles/style-utility.css';
import './styles/style-modal-responive.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);