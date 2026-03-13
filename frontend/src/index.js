import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import LandingPage from './LandingPage';
import About from './About';
import Syllabus from './Syllabus';
import Practice from './Practice';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/syllabus" element={<Syllabus />} />
        <Route path="/practice" element={<Practice />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
