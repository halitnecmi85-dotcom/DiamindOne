import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Divider
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';

const AdminDashboard = ({ currentUser, institution, onLogout }) => {
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [scales, setScales] = useState([]);
  const [applications, setApplications] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openScaleDialog, setOpenScaleDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    name: '',
    role: 'doktor'
  });
  const [newScale, setNewScale] = useState({
    name: '',
    description: '',
    questions: []
  });

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [institution]);

  const loadData = () => {
    // Kullanıcıları yükle (sadece kendi kurumundaki)
    const allUsers = JSON.parse(localStorage.getItem('olcekUsers') || '[]');
    const institutionUsers = allUsers.filter(u => u.institutionId === institution.id);
    setUsers(institutionUsers);

    // Ölçekleri yükle
    const allScales = JSON.parse(localStorage.getItem('olcekScales') || '[]');
    const institutionScales = allScales.filter(s => s.institutionId === institution.id);
    setScales(institutionScales);

    // Uygulamaları yükle
    const allApplications = JSON.parse(localStorage.getItem('olcekApplications') || '[]');
    const institutionApplications = allApplications.filter(a => a.institutionId === institution.id);
    setApplications(institutionApplications);

    // Hastaları yükle
    const patients = JSON.parse(localStorage.getItem('olcekPatients') || '[]');
    const institutionPatients = patients.filter(p => p.institutionId === institution.id);
    setAllPatients(institutionPatients);
  };

  const handleExportAllData = () => {
    // Tüm kurum verilerini topla
    const exportData = {
      institution: {
        name: institution.name,
        license: institution.license,
        exportDate: new Date().toISOString()
      },
      users: users,
      scales: scales,
      applications: applications,
      patients: allPatients,
      statistics: {
        totalUsers: users.length,
        totalDoctors: users.filter(u => u.role === 'doktor').length,
        totalPatients: users.filter(u => u.role === 'hasta').length,
        totalScales: scales.length,
        totalApplications: applications.length,
        completedApplications: applications.filter(a => a.status === 'completed').length,
        pendingApplications: applications.filter(a => a.status === 'pending').length
      }
    };

    // JSON formatında indir
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${institution.name.replace(/\s+/g, '_')}_Veriler_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    alert('Tüm kurum verileri başarıyla indirildi!');
  };

  const handleAddUser = () => {
    if (!newUser.username || !newUser.password || !newUser.name) {
      alert('Lütfen tüm alanları doldurun!');
      return;
    }

    const allUsers = JSON.parse(localStorage.getItem('olcekUsers') || '[]');
    
    // Kullanıcı adı kontrolü
    if (allUsers.some(u => u.username === newUser.username)) {
      alert('Bu kullanıcı adı zaten kullanılıyor!');
      return;
    }

    const user = {
      id: Date.now().toString(),
      ...newUser,
      institutionId: institution.id,
      createdAt: new Date().toISOString()
    };

    allUsers.push(user);
    localStorage.setItem('olcekUsers', JSON.stringify(allUsers));
    
    setOpenUserDialog(false);
    setNewUser({ username: '', password: '', name: '', role: 'doktor' });
    loadData();
  };

  const handleDeleteUser = (userId) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) {
      return;
    }

    const allUsers = JSON.parse(localStorage.getItem('olcekUsers') || '[]');
    const filteredUsers = allUsers.filter(u => u.id !== userId);
    localStorage.setItem('olcekUsers', JSON.stringify(filteredUsers));
    loadData();
  };

  const handleAddScale = () => {
    if (!newScale.name || !newScale.description) {
      alert('Lütfen ölçek adı ve açıklaması girin!');
      return;
    }

    const allScales = JSON.parse(localStorage.getItem('olcekScales') || '[]');
    
    const scale = {
      id: Date.now().toString(),
      ...newScale,
      institutionId: institution.id,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString()
    };

    allScales.push(scale);
    localStorage.setItem('olcekScales', JSON.stringify(allScales));
    
    setOpenScaleDialog(false);
    setNewScale({ name: '', description: '', questions: [] });
    loadData();
  };

  return (
    <Box>
      {/* Header */}
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <BusinessIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {institution.name} - Admin Paneli
          </Typography>
          <Chip 
            label={currentUser.name} 
            color="secondary" 
            sx={{ mr: 2 }}
            avatar={<Avatar>{currentUser.name.charAt(0)}</Avatar>}
          />
          <IconButton color="inherit" onClick={onLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab icon={<PeopleIcon />} label="Kullanıcı Yönetimi" />
          <Tab icon={<AssessmentIcon />} label="Ölçek Yönetimi" />
          <Tab icon={<DescriptionIcon />} label="Uygulamalar" />
          <Tab icon={<DownloadIcon />} label="Veri Yönetimi" />
          <Tab icon={<SettingsIcon />} label="Kurum Ayarları" />
        </Tabs>
      </Box>

      {/* Kullanıcı Yönetimi Sekmesi */}
      {tabValue === 0 && (
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5" fontWeight="bold">
              Kullanıcı Yönetimi
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<PersonAddIcon />}
              onClick={() => setOpenUserDialog(true)}
            >
              Yeni Kullanıcı Ekle
            </Button>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h3" color="primary" fontWeight="bold">
                    {users.filter(u => u.role === 'admin').length}
                  </Typography>
                  <Typography color="text.secondary">
                    Admin Yönetici
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h3" color="success.main" fontWeight="bold">
                    {users.filter(u => u.role === 'doktor').length}
                  </Typography>
                  <Typography color="text.secondary">
                    Doktor
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h3" color="info.main" fontWeight="bold">
                    {users.filter(u => u.role === 'hasta').length}
                  </Typography>
                  <Typography color="text.secondary">
                    Hasta
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Kullanıcı Adı</strong></TableCell>
                  <TableCell><strong>Ad Soyad</strong></TableCell>
                  <TableCell><strong>Rol</strong></TableCell>
                  <TableCell><strong>Oluşturma Tarihi</strong></TableCell>
                  <TableCell><strong>İşlemler</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role === 'admin' ? 'Admin' : user.role === 'doktor' ? 'Doktor' : 'Hasta'}
                        color={user.role === 'admin' ? 'error' : user.role === 'doktor' ? 'primary' : 'info'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : '-'}
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.id === currentUser.id}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Ölçek Yönetimi Sekmesi */}
      {tabValue === 1 && (
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5" fontWeight="bold">
              Ölçek Yönetimi
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AssessmentIcon />}
              onClick={() => setOpenScaleDialog(true)}
            >
              Yeni Ölçek Ekle
            </Button>
          </Box>

          <Grid container spacing={3}>
            {scales.map((scale) => (
              <Grid item xs={12} md={6} key={scale.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {scale.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {scale.description}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Oluşturulma: {new Date(scale.createdAt).toLocaleDateString('tr-TR')}
                      </Typography>
                      <Box>
                        <Button size="small" variant="outlined" sx={{ mr: 1 }}>
                          Düzenle
                        </Button>
                        <Button size="small" variant="outlined" color="error">
                          Sil
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            
            {scales.length === 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <AssessmentIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Henüz ölçek eklenmemiş
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Yeni bir ölçek eklemek için yukarıdaki butona tıklayın
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Box>
      )}

      {/* Uygulamalar Sekmesi */}
      {tabValue === 2 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Ölçek Uygulamaları
          </Typography>
          
          <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Hasta</strong></TableCell>
                  <TableCell><strong>Doktor</strong></TableCell>
                  <TableCell><strong>Ölçek</strong></TableCell>
                  <TableCell><strong>Tarih</strong></TableCell>
                  <TableCell><strong>Durum</strong></TableCell>
                  <TableCell><strong>Sonuç</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>{app.patientName}</TableCell>
                    <TableCell>{app.doctorName}</TableCell>
                    <TableCell>{app.scaleName}</TableCell>
                    <TableCell>{new Date(app.date).toLocaleDateString('tr-TR')}</TableCell>
                    <TableCell>
                      <Chip 
                        label={app.status === 'completed' ? 'Tamamlandı' : 'Bekliyor'}
                        color={app.status === 'completed' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {app.status === 'completed' ? (
                        <Button size="small" variant="outlined">
                          Görüntüle
                        </Button>
                      ) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
                {applications.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="text.secondary">
                        Henüz uygulama bulunmuyor
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Veri Yönetimi Sekmesi */}
      {tabValue === 3 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Veri Yönetimi ve Toplu Raporlama
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h3" color="primary" fontWeight="bold">
                    {applications.length}
                  </Typography>
                  <Typography color="text.secondary">
                    Toplam Uygulama
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h3" color="success.main" fontWeight="bold">
                    {applications.filter(a => a.status === 'completed').length}
                  </Typography>
                  <Typography color="text.secondary">
                    Tamamlanan Uygulama
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h3" color="info.main" fontWeight="bold">
                    {allPatients.length}
                  </Typography>
                  <Typography color="text.secondary">
                    Toplam Hasta Kaydı
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Toplu Veri İndirme
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary" paragraph>
                Kurum genelindeki tüm verileri tek bir dosya olarak indirebilirsiniz. 
                Bu dosya kullanıcılar, ölçekler, uygulamalar ve hasta kayıtlarını içerir.
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                startIcon={<DownloadIcon />}
                onClick={handleExportAllData}
              >
                Tüm Verileri İndir (JSON)
              </Button>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Veri İstatistikleri
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Kullanıcılar
                    </Typography>
                    <Typography variant="body2">
                      • Toplam: {users.length}
                    </Typography>
                    <Typography variant="body2">
                      • Admin: {users.filter(u => u.role === 'admin').length}
                    </Typography>
                    <Typography variant="body2">
                      • Doktor: {users.filter(u => u.role === 'doktor').length}
                    </Typography>
                    <Typography variant="body2">
                      • Hasta: {users.filter(u => u.role === 'hasta').length}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Ölçek & Uygulamalar
                    </Typography>
                    <Typography variant="body2">
                      • Tanımlı Ölçek: {scales.length}
                    </Typography>
                    <Typography variant="body2">
                      • Bekleyen: {applications.filter(a => a.status === 'pending').length}
                    </Typography>
                    <Typography variant="body2">
                      • Devam Eden: {applications.filter(a => a.status === 'in-progress').length}
                    </Typography>
                    <Typography variant="body2">
                      • Tamamlanan: {applications.filter(a => a.status === 'completed').length}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Kurum Ayarları Sekmesi */}
      {tabValue === 4 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Kurum Bilgileri
          </Typography>
          
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Kurum Adı
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {institution.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Lisans Numarası
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {institution.license}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Lisans Durumu
                  </Typography>
                  <Chip 
                    label={institution.active ? 'Aktif' : 'Pasif'}
                    color={institution.active ? 'success' : 'error'}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Lisans Bitiş Tarihi
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {new Date(institution.expiryDate).toLocaleDateString('tr-TR')}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Yeni Kullanıcı Dialog */}
      <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Yeni Kullanıcı Ekle</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Kullanıcı Adı"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Şifre"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Ad Soyad"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth>
              <InputLabel>Rol</InputLabel>
              <Select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                label="Rol"
              >
                <MenuItem value="admin">Admin Yönetici</MenuItem>
                <MenuItem value="doktor">Doktor</MenuItem>
                <MenuItem value="hasta">Hasta</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUserDialog(false)}>İptal</Button>
          <Button onClick={handleAddUser} variant="contained">Ekle</Button>
        </DialogActions>
      </Dialog>

      {/* Yeni Ölçek Dialog */}
      <Dialog open={openScaleDialog} onClose={() => setOpenScaleDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Yeni Ölçek Ekle</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Ölçek Adı"
              value={newScale.name}
              onChange={(e) => setNewScale({ ...newScale, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Açıklama"
              multiline
              rows={3}
              value={newScale.description}
              onChange={(e) => setNewScale({ ...newScale, description: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenScaleDialog(false)}>İptal</Button>
          <Button onClick={handleAddScale} variant="contained">Ekle</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
