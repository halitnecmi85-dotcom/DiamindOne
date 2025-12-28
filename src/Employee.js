import React, { useState, useEffect } from 'react';
import bcrypt from 'bcryptjs';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  TextField,
  Button,
  Divider,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import PersonIcon from '@mui/icons-material/Person';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

const Employee = () => {
  const [employees, setEmployees] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState({
    id: '',
    name: '',
    position: '',
    username: '',
    password: '',
    phone: '',
    email: '',
    startDate: '',
    salary: '',
    muayenePrice: '',
    testPrice: '',
    seansPrice: ''
  });
  
  // Hizmet ayarları için state
  const [openServiceDialog, setOpenServiceDialog] = useState(false);
  const [currentServiceSettings, setCurrentServiceSettings] = useState({
    employeeId: '',
    employeeName: '',
    salary: '',
    muayenePrice: '',
    muayenePercentage: '',
    testPrice: '',
    testPercentage: '',
    seansPrice: '',
    seansPercentage: '',
    generalPercentage: '',
    customServices: [] // {serviceName, price, percentage}
  });

  useEffect(() => {
    // LocalStorage'dan personel listesini yükle
    const loadEmployees = () => {
      const storedEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
      setEmployees(storedEmployees);
    };
    loadEmployees();
  }, []);

  const positionOptions = [
    { value: 'Hekim', label: 'Doktor', icon: <LocalHospitalIcon /> },
    { value: 'Terapist', label: 'Terapist', icon: <MedicalServicesIcon /> },
    { value: 'Bireysel Destek', label: 'Bireysel Destek Ekibi', icon: <SupportAgentIcon /> },
    { value: 'Sekreter', label: 'Sekreter', icon: <PersonIcon /> },
    { value: 'Muhasebeci', label: 'Muhasebeci', icon: <AccountBalanceIcon /> }
  ];

  const handleOpenDialog = () => {
    setEditMode(false);
    setCurrentEmployee({
      id: '',
      name: '',
      position: '',
      phone: '',
      email: '',
      startDate: new Date().toISOString().split('T')[0],
      username: '',
      password: '',
      salary: '',
      muayenePrice: '',
      testPrice: '',
      seansPrice: ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentEmployee({
      id: '',
      name: '',
      position: '',
      username: '',
      password: '',
      phone: '',
      email: '',
      startDate: '',
      salary: '',
      muayenePrice: '',
      testPrice: '',
      seansPrice: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentEmployee(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveEmployee = () => {
    if (!currentEmployee.name || !currentEmployee.position) {
      alert('Lütfen en az ad ve pozisyon bilgilerini doldurun!');
      return;
    }

    // Validate unique username if provided
    if (currentEmployee.username && (employees.some(emp => emp.username === currentEmployee.username && emp.id !== currentEmployee.id))) {
      alert('Bu kullanıcı adı zaten kullanılıyor. Lütfen farklı bir kullanıcı adı seçin.');
      return;
    }

    let updatedEmployees;
    if (editMode) {
      // Düzenleme modu
      updatedEmployees = employees.map(emp => {
        if (emp.id !== currentEmployee.id) return emp;
        // If provided a new password (non-empty), hash it; otherwise keep old hashed password
        const hashedPassword = currentEmployee.password ? bcrypt.hashSync(currentEmployee.password, 8) : emp.password || '';
        return { ...currentEmployee, password: hashedPassword };
      });
    } else {
      // Yeni ekleme modu
      const newEmployee = {
        ...currentEmployee,
        id: Date.now().toString(),
        username: currentEmployee.username || '',
        password: currentEmployee.password ? bcrypt.hashSync(currentEmployee.password, 8) : ''
      };
      updatedEmployees = [...employees, newEmployee];
    }

    setEmployees(updatedEmployees);
    localStorage.setItem('employees', JSON.stringify(updatedEmployees));
    handleCloseDialog();
  };

  const handleEditEmployee = (employee) => {
    setEditMode(true);
    setCurrentEmployee(employee);
    setOpenDialog(true);
  };

  const handleDeleteEmployee = (id) => {
    if (window.confirm('Bu personeli silmek istediğinizden emin misiniz?')) {
      const updatedEmployees = employees.filter(emp => emp.id !== id);
      setEmployees(updatedEmployees);
      localStorage.setItem('employees', JSON.stringify(updatedEmployees));
      
      // Hizmet ayarlarını da sil
      const serviceSettings = JSON.parse(localStorage.getItem('employeeServiceSettings') || '{}');
      delete serviceSettings[id];
      localStorage.setItem('employeeServiceSettings', JSON.stringify(serviceSettings));
    }
  };
  
  // Hizmet ayarları fonksiyonları
  const handleOpenServiceSettings = (employee) => {
    const serviceSettings = JSON.parse(localStorage.getItem('employeeServiceSettings') || '{}');
    const settings = serviceSettings[employee.id] || {
      employeeId: employee.id,
      employeeName: employee.name,
      salary: employee.salary || '',
      muayenePrice: '',
      muayenePercentage: '',
      testPrice: '',
      testPercentage: '',
      seansPrice: '',
      seansPercentage: '',
      generalPercentage: '',
      customServices: []
    };
    setCurrentServiceSettings(settings);
    setOpenServiceDialog(true);
  };
  
  const handleCloseServiceDialog = () => {
    setOpenServiceDialog(false);
  };
  
  const handleServiceSettingsChange = (field, value) => {
    setCurrentServiceSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSaveServiceSettings = () => {
    const serviceSettings = JSON.parse(localStorage.getItem('employeeServiceSettings') || '{}');
    serviceSettings[currentServiceSettings.employeeId] = currentServiceSettings;
    localStorage.setItem('employeeServiceSettings', JSON.stringify(serviceSettings));
    alert('Hizmet ayarları kaydedildi!');
    setOpenServiceDialog(false);
  };

  const getPositionIcon = (position) => {
    const option = positionOptions.find(opt => opt.value === position);
    return option ? option.icon : <PersonIcon />;
  };

  const getPositionColor = (position) => {
    const colors = {
      'Hekim': 'primary',
      'Terapist': 'success',
      'Bireysel Destek': 'info',
      'Sekreter': 'warning',
      'Muhasebeci': 'secondary'
    };
    return colors[position] || 'default';
  };

  const getEmployeeCount = (position) => {
    return employees.filter(emp => emp.position === position).length;
  };

  return (
    <Grid container spacing={2}>
      {/* Özet Kartları */}
      <Grid item xs={12} md={2.4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 1, width: 40, height: 40 }}>
                <LocalHospitalIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Doktorlar
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {getEmployeeCount('Hekim')}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={2.4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 1, width: 40, height: 40 }}>
                <MedicalServicesIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Terapistler
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {getEmployeeCount('Terapist')}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={2.4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar sx={{ bgcolor: 'info.main', mr: 1, width: 40, height: 40 }}>
                <SupportAgentIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Destek Ekibi
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {getEmployeeCount('Bireysel Destek')}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={2.4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar sx={{ bgcolor: 'warning.main', mr: 1, width: 40, height: 40 }}>
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Sekreterler
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {getEmployeeCount('Sekreter')}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={2.4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar sx={{ bgcolor: 'secondary.main', mr: 1, width: 40, height: 40 }}>
                <AccountBalanceIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Muhasebeciler
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {getEmployeeCount('Muhasebeci')}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Personel Listesi */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 56, height: 56 }}>
                  <PersonAddIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="h2" fontWeight="bold">
                    Personel Yönetimi
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Toplam {employees.length} Personel
                  </Typography>
                </Box>
              </Box>
              <Button 
                variant="contained" 
                startIcon={<PersonAddIcon />}
                onClick={handleOpenDialog}
                sx={{
                  background: 'linear-gradient(90deg, #061161 0%, #780206 100%)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #050d4d 0%, #5f0105 100%)',
                  }
                }}
              >
                Yeni Personel Ekle
              </Button>
            </Box>
            <Divider sx={{ my: 2 }} />

            {employees.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell><strong>Ad Soyad</strong></TableCell>
                      <TableCell><strong>Pozisyon</strong></TableCell>
                      <TableCell><strong>Telefon</strong></TableCell>
                      <TableCell><strong>E-posta</strong></TableCell>
                      <TableCell><strong>İşe Başlama</strong></TableCell>
                      <TableCell align="right"><strong>Maaş</strong></TableCell>
                      <TableCell align="center"><strong>İşlemler</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {employees.map((employee) => (
                      <TableRow key={employee.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 1, width: 32, height: 32, bgcolor: getPositionColor(employee.position) + '.light' }}>
                              {getPositionIcon(employee.position)}
                            </Avatar>
                            {employee.name}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={employee.position} 
                            size="small" 
                            color={getPositionColor(employee.position)}
                          />
                        </TableCell>
                        <TableCell>{employee.phone || '-'}</TableCell>
                        <TableCell>{employee.email || '-'}</TableCell>
                        <TableCell>{employee.startDate || '-'}</TableCell>
                        <TableCell align="right">
                          {employee.salary ? `${Number(employee.salary).toLocaleString('tr-TR')} ₺` : '-'}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleEditEmployee(employee)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDeleteEmployee(employee.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  Henüz personel kaydı bulunmamaktadır.
                </Typography>
                <Button 
                  variant="outlined" 
                  startIcon={<PersonAddIcon />}
                  onClick={handleOpenDialog}
                  sx={{ mt: 2 }}
                >
                  İlk Personeli Ekle
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
      
      {/* Personel Hizmet Ayarları */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2, width: 56, height: 56 }}>
                  <AccountBalanceIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="h2" fontWeight="bold">
                    Personel Hizmet Ayarları
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Personel ücretleri ve yüzde ayarları
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            
            {employees.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell><strong>Ad Soyad</strong></TableCell>
                      <TableCell><strong>Pozisyon</strong></TableCell>
                      <TableCell align="right"><strong>Maaş</strong></TableCell>
                      <TableCell align="center"><strong>İşlemler</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {employees.map((employee) => (
                      <TableRow key={employee.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 1, width: 32, height: 32, bgcolor: getPositionColor(employee.position) + '.light' }}>
                              {getPositionIcon(employee.position)}
                            </Avatar>
                            {employee.name}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={employee.position} 
                            size="small" 
                            color={getPositionColor(employee.position)}
                          />
                        </TableCell>
                        <TableCell align="right">
                          {employee.salary ? `${Number(employee.salary).toLocaleString('tr-TR')} ₺` : '-'}
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => handleOpenServiceSettings(employee)}
                          >
                            Ayarları Düzenle
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  Henüz personel kaydı bulunmamaktadır.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
      
      {/* Hizmet Ayarları Dialog */}
      <Dialog open={openServiceDialog} onClose={handleCloseServiceDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Hizmet Ayarları - {currentServiceSettings.employeeName}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Genel Bilgiler
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Maaş"
                  type="number"
                  value={currentServiceSettings.salary}
                  onChange={(e) => handleServiceSettingsChange('salary', e.target.value)}
                  margin="normal"
                  InputProps={{ endAdornment: '₺' }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Genel Hizmet Yüzdes"
                  type="number"
                  value={currentServiceSettings.generalPercentage}
                  onChange={(e) => handleServiceSettingsChange('generalPercentage', e.target.value)}
                  margin="normal"
                  InputProps={{ endAdornment: '%' }}
                  helperText="Tüm hizmetler için varsayılan yüzde"
                />
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Hizmet Bazında Ayarlar
            </Typography>
            
            {/* Muayene */}
            <Typography variant="subtitle2" color="primary" sx={{ mt: 2, mb: 1 }}>
              Muayene
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Muayene Ücreti"
                  type="number"
                  value={currentServiceSettings.muayenePrice}
                  onChange={(e) => handleServiceSettingsChange('muayenePrice', e.target.value)}
                  InputProps={{ endAdornment: '₺' }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Muayene Yüzdes"
                  type="number"
                  value={currentServiceSettings.muayenePercentage}
                  onChange={(e) => handleServiceSettingsChange('muayenePercentage', e.target.value)}
                  InputProps={{ endAdornment: '%' }}
                />
              </Grid>
            </Grid>
            
            {/* Test */}
            <Typography variant="subtitle2" color="success" sx={{ mt: 2, mb: 1 }}>
              Test
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Test Ücreti"
                  type="number"
                  value={currentServiceSettings.testPrice}
                  onChange={(e) => handleServiceSettingsChange('testPrice', e.target.value)}
                  InputProps={{ endAdornment: '₺' }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Test Yüzdes"
                  type="number"
                  value={currentServiceSettings.testPercentage}
                  onChange={(e) => handleServiceSettingsChange('testPercentage', e.target.value)}
                  InputProps={{ endAdornment: '%' }}
                />
              </Grid>
            </Grid>
            
            {/* Seans */}
            <Typography variant="subtitle2" color="secondary" sx={{ mt: 2, mb: 1 }}>
              Seans
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Seans Ücreti"
                  type="number"
                  value={currentServiceSettings.seansPrice}
                  onChange={(e) => handleServiceSettingsChange('seansPrice', e.target.value)}
                  InputProps={{ endAdornment: '₺' }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Seans Yüzdes"
                  type="number"
                  value={currentServiceSettings.seansPercentage}
                  onChange={(e) => handleServiceSettingsChange('seansPercentage', e.target.value)}
                  InputProps={{ endAdornment: '%' }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseServiceDialog}>
            İptal
          </Button>
          <Button 
            onClick={handleSaveServiceSettings} 
            variant="contained"
            sx={{
              background: 'linear-gradient(90deg, #061161 0%, #780206 100%)',
              '&:hover': {
                background: 'linear-gradient(90deg, #050d4d 0%, #5f0105 100%)',
              }
            }}
          >
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Personel Ekleme/Düzenleme Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editMode ? 'Personel Düzenle' : 'Yeni Personel Ekle'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Ad Soyad"
              name="name"
              value={currentEmployee.name}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Pozisyon</InputLabel>
              <Select
                name="position"
                value={currentEmployee.position}
                onChange={handleInputChange}
                label="Pozisyon"
              >
                {positionOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {option.icon}
                      <Typography sx={{ ml: 1 }}>{option.label}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Telefon"
              name="phone"
              value={currentEmployee.phone}
              onChange={handleInputChange}
              margin="normal"
              placeholder="555 123 45 67"
            />

            <TextField
              fullWidth
              label="E-posta"
              name="email"
              type="email"
              value={currentEmployee.email}
              onChange={handleInputChange}
              margin="normal"
              placeholder="ornek@email.com"
            />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Kullanıcı Adı (Opsiyonel)"
                  name="username"
                  value={currentEmployee.username}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Şifre (Opsiyonel)"
                  name="password"
                  type="password"
                  value={currentEmployee.password}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="İşe Başlama Tarihi"
              name="startDate"
              type="date"
              value={currentEmployee.startDate}
              onChange={handleInputChange}
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />

            <TextField
              fullWidth
              label="Maaş"
              name="salary"
              type="number"
              value={currentEmployee.salary}
              onChange={handleInputChange}
              margin="normal"
              placeholder="0"
              InputProps={{
                endAdornment: <Typography>₺</Typography>,
              }}
            />

            <Divider sx={{ my: 2 }}>
              <Chip label="Hizmet Ücretleri" />
            </Divider>

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Muayene Ücreti"
                  name="muayenePrice"
                  type="number"
                  value={currentEmployee.muayenePrice}
                  onChange={handleInputChange}
                  margin="normal"
                  placeholder="0"
                  InputProps={{
                    endAdornment: <Typography>₺</Typography>,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Test Ücreti"
                  name="testPrice"
                  type="number"
                  value={currentEmployee.testPrice}
                  onChange={handleInputChange}
                  margin="normal"
                  placeholder="0"
                  InputProps={{
                    endAdornment: <Typography>₺</Typography>,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Seans Ücreti"
                  name="seansPrice"
                  type="number"
                  value={currentEmployee.seansPrice}
                  onChange={handleInputChange}
                  margin="normal"
                  placeholder="0"
                  InputProps={{
                    endAdornment: <Typography>₺</Typography>,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Kullanıcı Adı (Opsiyonel)"
                  name="username"
                  value={currentEmployee.username}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Şifre (Opsiyonel)"
                  name="password"
                  type="password"
                  value={currentEmployee.password}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            İptal
          </Button>
          <Button 
            onClick={handleSaveEmployee} 
            variant="contained"
            sx={{
              background: 'linear-gradient(90deg, #061161 0%, #780206 100%)',
              '&:hover': {
                background: 'linear-gradient(90deg, #050d4d 0%, #5f0105 100%)',
              }
            }}
          >
            {editMode ? 'Güncelle' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default Employee;
