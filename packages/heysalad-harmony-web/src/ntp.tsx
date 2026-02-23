import React from 'react';
import ReactDOM from 'react-dom/client';
import NTPDashboard from './pages/NTPDashboard';
import './index.css';

/**
 * Standalone entry point for New Tab Page (NTP)
 * HeySalad Inc. - Yumi Browser
 *
 * This file creates a minimal React app with just the NTP dashboard
 * without authentication, routing, or other dependencies.
 */

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <NTPDashboard />
  </React.StrictMode>
);
