import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div style={layoutContainer}>
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} isMobile={isMobile} />
      
      <div 
        style={{
          ...mainContentStyle,
          marginLeft: isMobile ? '0' : '260px',
          width: isMobile ? '100%' : 'calc(100% - 260px)'
        }}
      >
        <Navbar onToggleSidebar={toggleSidebar} />
        
        <main style={contentArea}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const layoutContainer = {
  display: 'flex',
  minHeight: '100vh',
  width: '100%'
};

const mainContentStyle = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  transition: 'margin-left 0.3s ease-in-out, width 0.3s ease-in-out',
  backgroundColor: 'var(--bg-color)'
};

const contentArea = {
  flex: 1,
  padding: '30px 24px',
  overflowY: 'auto'
};

export default Layout;
