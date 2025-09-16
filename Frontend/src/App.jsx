
import React from 'react';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';

function App() {
  return (
    <div className="app">
      <Header />
      <div className="app-body">
        <Sidebar />
        <MainContent />
      </div>
    </div>
  );
}

export default App;

import './App.css'
import LoginPage from './LoginPage'

function App() {
  return (
    <div className="App">
      <LoginPage />
    </div>
  )
}

export default App

