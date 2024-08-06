import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RoutesApp from './routes';
import AuthProvider from './contexts/AuthContext';
import InstallmentsPaidProvider from './contexts/InstallmentsPaid';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <InstallmentsPaidProvider>
            <RoutesApp />
          </InstallmentsPaidProvider>
          
        </AuthProvider>
        <ToastContainer
          position="bottom-center"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          limit={1}
        />
      </BrowserRouter>
    </div>
  );
}

export default App;
