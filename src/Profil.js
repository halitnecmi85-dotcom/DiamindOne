import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Divider,
  Avatar,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SecurityIcon from '@mui/icons-material/Security';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import bcrypt from 'bcryptjs';

const Profil = () => {
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('currentUser') || 'null'));
  const [employees, setEmployees] = useState([]);
  const [employeeData, setEmployeeData] = useState({
    id: '',
    name: '',
    username: '',
    email: '',
    phone: '',
    address: '',
    position: '',
    salary: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const storedEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
    setEmployees(storedEmployees);
    
    if (currentUser) {
      const employee = storedEmployees.find(emp => emp.username === currentUser.username);
      if (employee) {
        setEmployeeData({
          id: employee.id,
          name: employee.name || '',
          username: employee.username || '',
          email: employee.email || '',
          phone: employee.phone || '',
          address: employee.address || '',
          position: employee.position || '',
          salary: employee.salary || ''
        });
      }
    }
  }, [currentUser]);

  const handleUpdateProfile = () => {
    const updatedEmployees = employees.map(emp => {
      if (emp.id === employeeData.id) {
        return {
          ...emp,
          name: employeeData.name,
          email: employeeData.email,
          phone: employeeData.phone,
          address: employeeData.address
        };
      }
      return emp;
    });

    localStorage.setItem('employees', JSON.stringify(updatedEmployees));
    setEmployees(updatedEmployees);
    setEditMode(false);
    setSnackbar({
      open: true,
      message: 'Profil bilgileriniz başarıyla güncellendi!',
      severity: 'success'
    });
  };

  const handleChangePassword = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setSnackbar({
        open: true,
        message: 'Tüm şifre alanlarını doldurun!',
        severity: 'error'
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSnackbar({
        open: true,
        message: 'Yeni şifreler eşleşmiyor!',
        severity: 'error'
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setSnackbar({
        open: true,
        message: 'Şifre en az 6 karakter olmalıdır!',
        severity: 'error'
      });
      return;
    }

    const employee = employees.find(emp => emp.id === employeeData.id);
    if (!employee) {
      setSnackbar({
        open: true,
        message: 'Kullanıcı bulunamadı!',
        severity: 'error'
      });
      return;
    }

    // Mevcut şifreyi kontrol et
    const isCurrentPasswordValid = bcrypt.compareSync(passwordData.currentPassword, employee.password);
    if (!isCurrentPasswordValid) {
      setSnackbar({
        open: true,
        message: 'Mevcut şifre hatalı!',
        severity: 'error'
      });
      return;
    }

    // Yeni şifreyi hashle ve güncelle
    const hashedPassword = bcrypt.hashSync(passwordData.newPassword, 10);
    const updatedEmployees = employees.map(emp => {
      if (emp.id === employeeData.id) {
        return { ...emp, password: hashedPassword };
      }
      return emp;
    });

    localStorage.setItem('employees', JSON.stringify(updatedEmployees));
    setEmployees(updatedEmployees);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setSnackbar({
      open: true,
      message: 'Şifreniz başarıyla değiştirildi!',
      severity: 'success'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Grid container spacing={2}>
      {/* Kişisel Bilgiler Kartı */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 56, height: 56 }}>
                  <AccountCircleIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="h2">
                    Kişisel Bilgiler
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Profil bilgilerinizi görüntüleyin ve güncelleyin
                  </Typography>
                </Box>
              </Box>
              {!editMode && (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setEditMode(true)}
                  size="small"
                >
                  Düzenle
                </Button>
              )}
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Ad Soyad"
                value={employeeData.name}
                onChange={(e) => setEmployeeData({ ...employeeData, name: e.target.value })}
                margin="normal"
                variant="outlined"
                disabled={!editMode}
              />
              <TextField
                fullWidth
                label="Kullanıcı Adı"
                value={employeeData.username}
                margin="normal"
                variant="outlined"
                disabled
                helperText="Kullanıcı adı değiştirilemez"
              />
              <TextField
                fullWidth
                label="Pozisyon"
                value={employeeData.position}
                margin="normal"
                variant="outlined"
                disabled
                helperText="Pozisyon yönetici tarafından değiştirilebilir"
              />
              <TextField
                fullWidth
                label="E-posta"
                value={employeeData.email}
                onChange={(e) => setEmployeeData({ ...employeeData, email: e.target.value })}
                margin="normal"
                variant="outlined"
                type="email"
                disabled={!editMode}
              />
              <TextField
                fullWidth
                label="Telefon"
                value={employeeData.phone}
                onChange={(e) => setEmployeeData({ ...employeeData, phone: e.target.value })}
                margin="normal"
                variant="outlined"
                disabled={!editMode}
              />
              <TextField
                fullWidth
                label="Adres"
                value={employeeData.address}
                onChange={(e) => setEmployeeData({ ...employeeData, address: e.target.value })}
                margin="normal"
                variant="outlined"
                multiline
                rows={2}
                disabled={!editMode}
              />
              {employeeData.salary && (
                <TextField
                  fullWidth
                  label="Maaş"
                  value={Number(employeeData.salary).toLocaleString('tr-TR') + ' ₺'}
                  margin="normal"
                  variant="outlined"
                  disabled
                  helperText="Maaş bilgisi yönetici tarafından belirlenir"
                />
              )}
              {editMode && (
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  <Button 
                    variant="contained" 
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleUpdateProfile}
                  >
                    Kaydet
                  </Button>
                  <Button 
                    variant="outlined"
                    onClick={() => {
                      setEditMode(false);
                      // Değişiklikleri geri al
                      const employee = employees.find(emp => emp.username === currentUser.username);
                      if (employee) {
                        setEmployeeData({
                          id: employee.id,
                          name: employee.name || '',
                          username: employee.username || '',
                          email: employee.email || '',
                          phone: employee.phone || '',
                          address: employee.address || '',
                          position: employee.position || '',
                          salary: employee.salary || ''
                        });
                      }
                    }}
                  >
                    İptal
                  </Button>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Güvenlik Ayarları Kartı */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'error.main', mr: 2, width: 56, height: 56 }}>
                <SecurityIcon fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h5" component="h2">
                  Güvenlik Ayarları
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Şifrenizi değiştirin
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Mevcut Şifre"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                margin="normal"
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Yeni Şifre"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                margin="normal"
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Yeni Şifre (Tekrar)"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                margin="normal"
                variant="outlined"
              />
              <Box sx={{ mt: 2, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
                <Typography variant="body2" color="info.dark">
                  <strong>Şifre Gereksinimleri:</strong>
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  • En az 6 karakter uzunluğunda olmalı
                </Typography>
                <Typography variant="caption" display="block">
                  • Güvenliğiniz için güçlü bir şifre kullanın
                </Typography>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Button 
                  variant="contained" 
                  color="error" 
                  fullWidth
                  startIcon={<SecurityIcon />}
                  onClick={handleChangePassword}
                >
                  Şifreyi Değiştir
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default Profil;
