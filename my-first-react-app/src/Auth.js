import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';  // Import CSS file for styling


export default function Auth({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const toggleForm = () => {
    setIsLogin(prev => !prev);
    setName('');
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const endpoint = isLogin ? 'login' : 'signup';
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await fetch(`http://localhost:5000/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        onAuth({ token: data.token, userId: data.userId, name: data.name, email: data.email });
        navigate('/');
      } else {
        setError(data.error || `${isLogin ? 'Login' : 'Signup'} failed`);
      }
    } catch (err) {
      setError('Failed to connect to server');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-card">
          <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
          {error && <p className="error-msg">{error}</p>}
          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />}
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
          </form>
          <p className="toggle-text">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button onClick={toggleForm} className="toggle-btn">{isLogin ? 'Sign Up' : 'Login'}</button>
          </p>
        </div>
  
        {/* Image Section */}
        <div className="auth-image">
          <img src="/images/photo7.jpg" alt="Login Visual" />
        </div>
      </div>
    </div>
  );
  
}
