import React, { useState, useEffect } from 'react';
import { Box, Container } from '@mui/material';
import OlcekLogin from './components/OlcekLogin';
import AdminDashboard from './components/AdminDashboard';
import DoktorEkrani from './components/DoktorEkrani';
import HastaEkrani from './components/HastaEkrani';

const OlcekYonetim = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'admin', 'doktor', 'hasta'
  const [institution, setInstitution] = useState(null);

  useEffect(() => {
    // localStorage'dan kullanıcı bilgilerini kontrol et
    const storedUser = localStorage.getItem('olcekCurrentUser');
    const storedInstitution = localStorage.getItem('olcekInstitution');
    
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setCurrentUser(userData);
      setUserRole(userData.role);
      
      if (storedInstitution) {
        setInstitution(JSON.parse(storedInstitution));
      }
    }
  }, []);

  const handleLogin = (user, institutionData) => {
    setCurrentUser(user);
    setUserRole(user.role);
    setInstitution(institutionData);
    
    localStorage.setItem('olcekCurrentUser', JSON.stringify(user));
    localStorage.setItem('olcekInstitution', JSON.stringify(institutionData));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserRole(null);
    setInstitution(null);
    
    localStorage.removeItem('olcekCurrentUser');
    localStorage.removeItem('olcekInstitution');
  };

  // Giriş yapılmamışsa login ekranını göster
  if (!currentUser || !userRole) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}>
        <OlcekLogin onLogin={handleLogin} />
      </Box>
    );
  }

  // Rol bazlı ekran gösterimi
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {userRole === 'admin' && (
          <AdminDashboard 
            currentUser={currentUser}
            institution={institution}
            onLogout={handleLogout}
          />
        )}
        
        {userRole === 'doktor' && (
          <DoktorEkrani 
            currentUser={currentUser}
            institution={institution}
            onLogout={handleLogout}
          />
        )}
        
        {userRole === 'hasta' && (
          <HastaEkrani 
            currentUser={currentUser}
            institution={institution}
            onLogout={handleLogout}
          />
        )}
      </Container>
    </Box>
  );
};

export default OlcekYonetim;
