import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { 
  CssBaseline, 
  Typography, 
  Box, 
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
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
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import CustomAppBar from './components/CustomAppBar';
import HastaKayit from './HastaKayit';
import HastaAra from './HastaAra';
import AnaSayfa from './AnaSayfa';
import Profil from './Profil';
import Mesajlar from './Mesajlar';
import Hakkinda from './Hakkinda';
import Portal from './Portal';
import HastaMuayene from './HastaMuayene';
import Vezne from './Vezne';
import PersonelGelir from './PersonelGelir';
import Employee from './Employee';
import Randevu from './Randevu';
import MyCalendar from './MyCalendar';
import HizmetYonetimi from './HizmetYonetimi';
import Login from './Login';
import bcrypt from 'bcryptjs';
import { ProfilProvider } from './contexts/ProfilContext';
import RolYonetimi from './RolYonetimi';
import OlcekYonetim from './OlcekYonetim';
import OlcekYonetimPanel from './OlcekYonetimPanel';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function MainApp() {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState('Ana Sayfa');
  const [tabValue, setTabValue] = useState(0);
  const [openTabs, setOpenTabs] = useState(['Portal', 'Anasayfa']);
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('currentUser') || 'null'));

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleMenuClick = useCallback((menuText) => {
    setSelectedMenu(menuText);
    
    // "Ana Sayfa" ve "Anasayfa" aynı tab olarak değerlendir
    const normalizedMenuText = menuText === 'Ana Sayfa' ? 'Anasayfa' : menuText;
    
    // Tab'ı ekle (eğer yoksa)
    if (!openTabs.includes(normalizedMenuText)) {
      setOpenTabs([...openTabs, normalizedMenuText]);
    }
    
    // Tıklanan menüye göre tab'ı seç
    const tabIndex = openTabs.indexOf(normalizedMenuText);
    if (tabIndex !== -1) {
      setTabValue(tabIndex);
    } else {
      setTabValue(openTabs.length); // Yeni eklenen tab'ı seç
    }
  }, [currentUser, openTabs]);

  const handleLogout = () => {
    if (window.confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
      localStorage.setItem('isLoggedIn', 'false');
      localStorage.removeItem('currentUser');
      setCurrentUser(null);
      window.dispatchEvent(new Event('usersUpdated'));
      navigate('/login');
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSelectedMenu(openTabs[newValue]);
  };

  // Update currentUser state from localStorage when app mounts or when login changes
  useEffect(() => {
    const cur = JSON.parse(localStorage.getItem('currentUser') || 'null');
    setCurrentUser(cur);
  }, []);

  // If users are updated (by other components), reload currentUser from localStorage
  useEffect(() => {
    const onUsersUpdated = () => {
      const cur = JSON.parse(localStorage.getItem('currentUser') || 'null');
      setCurrentUser(cur);
    };
    
    // Listen for menu click events from AnaSayfa cards
    const onMenuClick = (event) => {
      if (event.detail && event.detail.menuText) {
        handleMenuClick(event.detail.menuText);
      }
    };

    window.addEventListener('usersUpdated', onUsersUpdated);
    window.addEventListener('menuClick', onMenuClick);
    return () => {
      window.removeEventListener('usersUpdated', onUsersUpdated);
      window.removeEventListener('menuClick', onMenuClick);
    };
  }, [handleMenuClick]);

  // Listen for external navigation events (e.g., from components requesting a menu change)
  useEffect(() => {
    const onNavigateToMenu = (e) => {
      const menu = e.detail;
      if (menu) {
        handleMenuClick(menu);
      }
    };
    window.addEventListener('navigateToMenu', onNavigateToMenu);
    return () => window.removeEventListener('navigateToMenu', onNavigateToMenu);
  }, [openTabs, selectedMenu, handleMenuClick]);

  const handleCloseTab = (event, tabToClose) => {
    event.stopPropagation();
    
    // Portal tab'ı kapatılamaz
    if (tabToClose === 'Portal') {
      return;
    }
    
    const tabIndex = openTabs.indexOf(tabToClose);
    const newTabs = openTabs.filter(tab => tab !== tabToClose);
    setOpenTabs(newTabs);
    
    // Kapatılan tab seçili ise, başka bir tab'a geç
    if (openTabs[tabValue] === tabToClose) {
      const newIndex = tabIndex > 0 ? tabIndex - 1 : 0;
      setTabValue(newIndex);
      setSelectedMenu(newTabs[newIndex]);
    } else if (tabIndex < tabValue) {
      setTabValue(tabValue - 1);
    }
  };

  const menuItems = [
    { text: 'Ana Sayfa', icon: <HomeIcon /> },
    { text: 'Hasta Kayıt', icon: <LocalHospitalIcon /> },
    { text: 'Hasta Ara', icon: <PersonSearchIcon /> },
    { text: 'Randevu', icon: <EventIcon /> },
    { text: 'Hizmet Yönetimi', icon: <WorkIcon /> },
    { text: 'Takvimim', icon: <CalendarMonthIcon /> },
    { text: 'Hasta Muayene', icon: <AddCircleIcon /> },
    { text: 'Ölçek Yönetimi', icon: <AssessmentIcon /> },
    { text: 'Vezne', icon: <AccountBalanceWalletIcon /> },
    { text: 'Personel Gelir', icon: <PeopleIcon /> },
    { text: 'Personel Ekle', icon: <WorkIcon /> },
    { text: 'Rol Yönetimi', icon: <PeopleIcon /> },
    { text: 'Profil', icon: <PersonIcon /> },
    { text: 'Mesajlar', icon: <MailIcon /> },
    { text: 'Hakkında', icon: <InfoIcon /> }
  ];

  // currentUser state: read from localStorage
  // already declared above

  // Apply role-based visibility for menu items
  const visibleMenuItems = menuItems.filter(item => {
    // Hide admin-only menus if no user is logged in
    if (!currentUser) return item.text !== 'Rol Yönetimi';
    const roleNormalized = String(currentUser.position || currentUser.role || '').toLowerCase();
    
    // Admin-only menus
    if (roleNormalized !== 'admin') {
      if (item.text === 'Rol Yönetimi') return false;
      if (item.text === 'Personel Gelir') return false;
      if (item.text === 'Personel Ekle') return false;
    }
    
    // Hide Hasta Muayene for Sekreter and Muhasebeci
    if (roleNormalized === 'sekreter' || roleNormalized === 'muhasebeci') {
      if (item.text === 'Hasta Muayene') return false;
    }
    
    return true;
  });

  return (
    <ThemeProvider theme={theme}>
      <ProfilProvider>
        <CssBaseline />
        <div className="App" style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <CustomAppBar onMenuClick={toggleDrawer} />
        
        {/* Tab Bar */}
        <Box sx={{ 
          width: '100%', 
          background: 'linear-gradient(90deg, #061161 0%, #780206 100%)',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            textColor="inherit"
            TabIndicatorProps={{
              style: {
                backgroundColor: '#fdd835',
                height: '4px',
              }
            }}
            sx={{
              '& .MuiTab-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                '&.Mui-selected': {
                  color: 'white',
                },
              },
            }}
          >
            {openTabs.map((tab, index) => (
              <Tab 
                key={tab}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {tab}
                    {tab !== 'Portal' && (
                      <Box
                        component="span"
                        onClick={(e) => handleCloseTab(e, tab)}
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'inherit',
                          padding: '2px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          },
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </Box>
                    )}
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Box>
        
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={toggleDrawer}
          variant="persistent"
          sx={{
            '& .MuiDrawer-paper': {
              width: 250,
              top: '112px',
              height: 'calc(100% - 112px)',
              boxSizing: 'border-box',
              overflowX: 'hidden',
              position: 'absolute',
            },
          }}
          ModalProps={{
            keepMounted: true,
            hideBackdop: true,
          }}
        >
          <Box 
            sx={{ width: 250, overflowX: 'hidden' }}
            role="presentation"
          >
            <List>
              {visibleMenuItems.map((item, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemButton 
                    selected={selectedMenu === item.text}
                    onClick={() => handleMenuClick(item.text)}
                    sx={{
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(0, 0, 0, 0.08)',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.12)',
                        },
                      },
                    }}
                  >
                    <ListItemIcon>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              ))}
              <Divider />
              <ListItem disablePadding>
                <ListItemButton onClick={handleLogout} sx={{ '&:hover': { backgroundColor: 'rgba(255, 0, 0, 0.06)' } }}>
                  <ListItemIcon>
                    <LogoutIcon sx={{ color: 'error.main' }} />
                  </ListItemIcon>
                  <ListItemText primary="Çıkış" sx={{ color: 'error.main' }} />
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        </Drawer>

        <Box 
          sx={{ 
            flexGrow: 1,
            p: 1, 
            //border: '1px solid red' ,          
            backgroundColor:'#f5f5f5',
            marginLeft: drawerOpen ? '250px' : 0,
            transition: 'margin-left 0.3s',
            pt: '16px'
          }}
        >
          {selectedMenu === 'Ana Sayfa' && <AnaSayfa />}
          {selectedMenu === 'Anasayfa' && <AnaSayfa />}
          {selectedMenu === 'Portal' && <Portal />}
          {selectedMenu === 'Hasta Kayıt' && <HastaKayit />}
          {selectedMenu === 'Hasta Ara' && <HastaAra />}
          {selectedMenu === 'Randevu' && <Randevu />}
          {selectedMenu === 'Hizmet Yönetimi' && <HizmetYonetimi />}
          {selectedMenu === 'Takvimim' && <MyCalendar />}
          {selectedMenu === 'Hasta Muayene' && (() => {
            const roleNormalized = String(currentUser?.position || currentUser?.role || '').toLowerCase();
            if (roleNormalized === 'sekreter' || roleNormalized === 'muhasebeci') {
              return <Box sx={{ p: 3 }}><Typography variant="h6" color="error">Bu sayfayı görüntüleme yetkiniz yok.</Typography></Box>;
            }
            return <HastaMuayene />;
          })()}
          {selectedMenu === 'Ölçek Yönetimi' && <OlcekYonetimPanel />}
          {selectedMenu === 'Vezne' && <Vezne />}
          {selectedMenu === 'Personel Gelir' && (
            currentUser && (currentUser.position || currentUser.role || '').toLowerCase() === 'admin' ? (
              <PersonelGelir />
            ) : (
              <Box sx={{ p: 3 }}><Typography variant="h6" color="error">Bu sayfayı görüntüleme yetkiniz yok.</Typography></Box>
            )
          )}
          {selectedMenu === 'Personel Ekle' && (
            currentUser && (currentUser.position || currentUser.role || '').toLowerCase() === 'admin' ? (
              <Employee />
            ) : (
              <Box sx={{ p: 3 }}><Typography variant="h6" color="error">Bu sayfayı görüntüleme yetkiniz yok.</Typography></Box>
            )
          )}
                    {selectedMenu === 'Rol Yönetimi' && (currentUser && currentUser.position && currentUser.position.toLowerCase() === 'admin' ? <RolYonetimi /> : (
                      <Box sx={{ p: 3 }}><Typography variant="h6" color="error">Bu sayfayı görüntüleme yetkiniz yok.</Typography></Box>
                    ))}
          {selectedMenu === 'Profil' && <Profil />}
          {selectedMenu === 'Mesajlar' && <Mesajlar />}
          {selectedMenu === 'Hakkında' && <Hakkinda />}
        </Box>
      </div>
      </ProfilProvider>
    </ThemeProvider>
  );
}

// Protected Route - Login kontrolü
function ProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

// Login Wrapper - Login sonrası yönlendirme
function LoginWrapper() {
  const navigate = useNavigate();

  const handleLogin = ({ username, password }) => {
    // Admin credentials
    if (username === 'admin' && password === '1234') {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('currentUser', JSON.stringify({ id: 'admin', username: 'admin', position: 'admin', role: 'admin' }));
      window.dispatchEvent(new Event('usersUpdated'));
      navigate('/');
      return;
    }

    // Check employee credentials from localStorage
    const employees = JSON.parse(localStorage.getItem('employees') || '[]');
    const matched = employees.find(emp => emp.username === username);
    if (matched) {
      // If password is hashed (bcrypt starts with $2), compare using bcrypt
      const isHashed = typeof matched.password === 'string' && matched.password.startsWith('$2');
      const validPassword = isHashed ? bcrypt.compareSync(password, matched.password) : matched.password === password;
      if (!validPassword) {
        alert('Kullanıcı adı veya şifre hatalı!');
        return;
      }
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('currentUser', JSON.stringify({ id: matched.id, username: matched.username, position: matched.position, role: matched.position }));
      window.dispatchEvent(new Event('usersUpdated'));
      navigate('/');
      return;
    }

    alert('Kullanıcı adı veya şifre hatalı!');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Login onLogin={handleLogin} />
    </ThemeProvider>
  );
}

// Ana App component - Router yapısı
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginWrapper />} />
        <Route path="/olcek-yonetim" element={<OlcekYonetim />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainApp />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
