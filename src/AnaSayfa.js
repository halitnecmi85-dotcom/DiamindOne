import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Avatar
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import MailIcon from '@mui/icons-material/Mail';
import InfoIcon from '@mui/icons-material/Info';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import EventIcon from '@mui/icons-material/Event';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';

const AnaSayfa = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    setCurrentUser(user);
  }, []);

  const getMenuItems = () => {
    if (!currentUser) return [];
    
    const roleNormalized = String(currentUser.position || currentUser.role || '').toLowerCase();
    
    const allMenuItems = [
      { text: 'Hasta Kayıt', icon: <LocalHospitalIcon />, color: 'error.main' },
      { text: 'Hasta Ara', icon: <PersonSearchIcon />, color: 'info.main' },
      { text: 'Randevu', icon: <EventIcon />, color: 'primary.main' },
      { text: 'Randevu Yönetimi', icon: <EventIcon />, color: 'secondary.main' },
      { text: 'Hizmet Yönetimi', icon: <WorkIcon />, color: 'success.main' },
      { text: 'Takvimim', icon: <CalendarMonthIcon />, color: 'warning.main' },
      { text: 'Hasta Muayene', icon: <AddCircleIcon />, color: 'error.main' },
      { text: 'Ölçek Yönetimi', icon: <AssessmentIcon />, color: 'info.main' },
      { text: 'Vezne', icon: <AccountBalanceWalletIcon />, color: 'success.main' },
      { text: 'Personel Gelir', icon: <PeopleIcon />, color: 'primary.main', adminOnly: true },
      { text: 'Personel Ekle', icon: <WorkIcon />, color: 'secondary.main', adminOnly: true },
      { text: 'Rol Yönetimi', icon: <PeopleIcon />, color: 'warning.main', adminOnly: true },
      { text: 'Profil', icon: <PersonIcon />, color: 'info.main' },
      { text: 'Mesajlar', icon: <MailIcon />, color: 'error.main' },
      { text: 'Hakkında', icon: <InfoIcon />, color: 'success.main' }
    ];

    return allMenuItems.filter(item => {
      // Admin-only menus
      if (item.adminOnly && roleNormalized !== 'admin') return false;
      
      // Hide Hasta Muayene for Sekreter and Muhasebeci
      if ((roleNormalized === 'sekreter' || roleNormalized === 'muhasebeci') && item.text === 'Hasta Muayene') {
        return false;
      }
      
      return true;
    });
  };

  const menuItems = getMenuItems();

  const handleCardClick = (menuText) => {
    // Trigger menu click event - App.js will handle the navigation
    window.dispatchEvent(new CustomEvent('menuClick', { detail: { menuText } }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom sx={{ mb: 4 }}>
        Hoş Geldiniz, {currentUser?.username || 'Kullanıcı'}
      </Typography>
      
      <Grid container spacing={3}>
        {menuItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6
                },
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
              onClick={() => handleCardClick(item.text)}
            >
              <CardContent sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                p: 4,
                flex: 1
              }}>
                <Avatar 
                  sx={{ 
                    bgcolor: item.color,
                    width: 80, 
                    height: 80, 
                    mb: 2
                  }}
                >
                  {React.cloneElement(item.icon, { sx: { fontSize: 48 } })}
                </Avatar>
                <Typography 
                  variant="h6" 
                  component="h2" 
                  fontWeight="bold"
                  textAlign="center"
                >
                  {item.text}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AnaSayfa;
