// src/components/modals/LoginModal.jsx
import React,{useState,useContext,useMemo} from 'react';
import {AppContext} from '../../context/AppContext';
import SignupModal from './SignupModal';
import ForgotPasswordModal from './ForgotPasswordModal';

function LoginModal({onLogin}) {
  const {API_BASE_URL}=useContext(AppContext);
  const baseUrl=useMemo(()=> (API_BASE_URL||'').replace(/\/+$/,''),[API_BASE_URL]);
  const [form,setForm]=useState({email:'',password:''});
  const [error,setError]=useState(''),[isSubmitting,setSubmitting]=useState(false);
  const [showSignup,setShowSignup]=useState(false),[showForgot,setShowForgot]=useState(false);

  const handleChange=e=>setForm(p=>({...p,[e.target.name]:e.target.value}));
  const readData=async res=>{
    const ct=res.headers.get('content-type')||'';
    if(ct.includes('application/json')){try{return await res.json();}catch{}}
    try{return await res.text();}catch{} return null;
  };

  const handleSubmit=async e=>{
    e.preventDefault(); if(isSubmitting) return;
    if(!form.email||!form.password){setError('Please fill in both fields.');return;}
    setError(''); setSubmitting(true);
    const url=`${baseUrl}/users/login`;
    const formBody=new URLSearchParams({email:form.email.trim(),password:form.password});
    const jsonBody=JSON.stringify({email:form.email.trim(),password:form.password});
    try{
      let res=await fetch(url,{method:'POST',credentials:'include',headers:{Accept:'application/json'},body:formBody});
      if(res.status===415){
        res=await fetch(url,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json',Accept:'application/json'},body:jsonBody});
      }
      const data=await readData(res);
      if(!res.ok){
        const msg=(data&&typeof data==='object'&&(data.error||data.message))||(typeof data==='string'&&data)||`Login failed (${res.status})`;
        setError(res.status===401?'Invalid email or password.':msg); return;
      }
      onLogin(data&&typeof data==='object'?data:{});
    }catch{setError('Network/CORS error. Please try again.');}
    finally{setSubmitting(false);}
  };

  return (
    <>
      <div className="login-screen">
        <div className="login-card">
          <h1>Login</h1><p className="login-subtitle">Please enter your credentials</p>
          <form onSubmit={handleSubmit}>
            <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required autoComplete="email" disabled={isSubmitting}/>
            <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required autoComplete="current-password" disabled={isSubmitting}/>
            <button type="submit" className="login-btn" disabled={isSubmitting}>{isSubmitting?'Logging in…':'Login'}</button>
            {error&&<p className="error-msg">{error}</p>}
          </form>
          <div className="login-links">
            <button className="link-button" onClick={()=>setShowForgot(true)} disabled={isSubmitting}>Forgot Password?</button>{' '}
            <button className="link-button" onClick={()=>setShowSignup(true)} disabled={isSubmitting}>Register New User</button>
          </div>
        </div>
      </div>
      {showForgot&&<ForgotPasswordModal isOpen={showForgot} onClose={()=>setShowForgot(false)}/>}
      {showSignup&&<SignupModal isOpen={showSignup} onSignup={u=>{onLogin(u);setShowSignup(false);}} onClose={()=>setShowSignup(false)}/>}
    </>
  );
}

export default LoginModal;
