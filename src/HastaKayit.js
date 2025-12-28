import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Avatar,
  TextField,
  Button,
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
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SearchIcon from '@mui/icons-material/Search';

const HastaKayit = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPatient, setCurrentPatient] = useState({
    id: '',
    name: '',
    tcNo: '',
    birthDate: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    motherName: '',
    motherPhone: '',
    motherEmail: '',
    fatherName: '',
    fatherPhone: '',
    fatherEmail: '',
    parentName: '',
    parentPhone: '',
    notes: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    // Filter patients based on search term
    if (searchTerm.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient => 
        patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.tcNo?.includes(searchTerm) ||
        patient.phone?.includes(searchTerm) ||
        patient.motherName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.fatherName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.parentName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  }, [searchTerm, patients]);

  const loadPatients = () => {
    const storedPatients = JSON.parse(localStorage.getItem('patients') || '[]');
    setPatients(storedPatients);
    setFilteredPatients(storedPatients);
  };

  const handleOpenDialog = () => {
    setEditMode(false);
    setCurrentPatient({
      id: '',
      name: '',
      tcNo: '',
      birthDate: '',
      gender: '',
      phone: '',
      email: '',
      address: '',
      motherName: '',
      motherPhone: '',
      motherEmail: '',
      fatherName: '',
      fatherPhone: '',
      fatherEmail: '',
      parentName: '',
      parentPhone: '',
      notes: ''
    });
    setOpenDialog(true);
  };

  const handleEditPatient = (patient) => {
    setEditMode(true);
    setCurrentPatient(patient);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentPatient({
      id: '',
      name: '',
      tcNo: '',
      birthDate: '',
      gender: '',
      phone: '',
      email: '',
      address: '',
      motherName: '',
      motherPhone: '',
      motherEmail: '',
      fatherName: '',
      fatherPhone: '',
      fatherEmail: '',
      parentName: '',
      parentPhone: '',
      notes: ''
    });
  };

  const handleInputChange = (field, value) => {
    setCurrentPatient({ ...currentPatient, [field]: value });
  };

  const handleSavePatient = () => {
    if (!currentPatient.name || !currentPatient.phone) {
      setSnackbar({
        open: true,
        message: 'Ad Soyad ve Telefon alanları zorunludur!',
        severity: 'error'
      });
      return;
    }

    let updatedPatients;
    if (editMode) {
      updatedPatients = patients.map(p => p.id === currentPatient.id ? currentPatient : p);
      setSnackbar({
        open: true,
        message: 'Hasta bilgileri başarıyla güncellendi!',
        severity: 'success'
      });
    } else {
      const newPatient = {
        ...currentPatient,
        id: Date.now()
      };
      updatedPatients = [...patients, newPatient];
      setSnackbar({
        open: true,
        message: 'Hasta başarıyla kaydedildi!',
        severity: 'success'
      });
    }

    localStorage.setItem('patients', JSON.stringify(updatedPatients));
    setPatients(updatedPatients);
    window.dispatchEvent(new Event('patientsUpdated'));
    handleCloseDialog();
  };

  const handleDeletePatient = (id) => {
    if (window.confirm('Bu hastayı silmek istediğinizden emin misiniz?')) {
      const updatedPatients = patients.filter(p => p.id !== id);
      localStorage.setItem('patients', JSON.stringify(updatedPatients));
      setPatients(updatedPatients);
      window.dispatchEvent(new Event('patientsUpdated'));
      setSnackbar({
        open: true,
        message: 'Hasta kaydı silindi!',
        severity: 'info'
      });
    }
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return '-';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 56, height: 56 }}>
                  <LocalHospitalIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="h2" fontWeight="bold">
                    Hasta Kayıt Sistemi
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Toplam {patients.length} hasta kayıtlı
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
                Yeni Hasta Ekle
              </Button>
            </Box>
            
            {/* Arama Bölümü */}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                placeholder="Hasta adı, TC No, telefon veya veli adına göre ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'background.paper',
                  }
                }}
              />
              {searchTerm && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {filteredPatients.length} hasta bulundu
                </Typography>
              )}
            </Box>
            
            <Divider sx={{ my: 2 }} />

            {filteredPatients.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell><strong>Ad Soyad</strong></TableCell>
                      <TableCell><strong>TC No</strong></TableCell>
                      <TableCell><strong>Doğum Tarihi</strong></TableCell>
                      <TableCell><strong>Yaş</strong></TableCell>
                      <TableCell><strong>Cinsiyet</strong></TableCell>
                      <TableCell><strong>Telefon</strong></TableCell>
                      <TableCell><strong>Veli</strong></TableCell>
                      <TableCell align="center"><strong>İşlemler</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredPatients.map((patient) => (
                      <TableRow key={patient.id} hover>
                        <TableCell>{patient.name}</TableCell>
                        <TableCell>{patient.tcNo || '-'}</TableCell>
                        <TableCell>{patient.birthDate ? new Date(patient.birthDate).toLocaleDateString('tr-TR') : '-'}</TableCell>
                        <TableCell>{calculateAge(patient.birthDate)}</TableCell>
                        <TableCell>{patient.gender || '-'}</TableCell>
                        <TableCell>{patient.phone}</TableCell>
                        <TableCell>
                          {patient.motherName && patient.fatherName ? (
                            <Box>
                              <Typography variant="caption" display="block">Anne: {patient.motherName}</Typography>
                              <Typography variant="caption" display="block">Baba: {patient.fatherName}</Typography>
                            </Box>
                          ) : (patient.motherName || patient.fatherName || patient.parentName || '-')}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => handleEditPatient(patient)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleDeletePatient(patient.id)}
                          >
                            <DeleteIcon />
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
                  Henüz hasta kaydı bulunmamaktadır.
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<PersonAddIcon />}
                  onClick={handleOpenDialog}
                  sx={{ mt: 2 }}
                >
                  İlk Hastayı Ekle
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Hasta Ekleme/Düzenleme Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            {editMode ? 'Hasta Bilgilerini Düzenle' : 'Yeni Hasta Ekle'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Hasta Bilgileri
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Ad Soyad *"
                  value={currentPatient.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="TC Kimlik No"
                  value={currentPatient.tcNo}
                  onChange={(e) => handleInputChange('tcNo', e.target.value)}
                  margin="normal"
                  inputProps={{ maxLength: 11 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Doğum Tarihi"
                  type="date"
                  value={currentPatient.birthDate}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Cinsiyet</InputLabel>
                  <Select
                    value={currentPatient.gender}
                    label="Cinsiyet"
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                  >
                    <MenuItem value="">Seçiniz</MenuItem>
                    <MenuItem value="Erkek">Erkek</MenuItem>
                    <MenuItem value="Kız">Kız</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Telefon *"
                  value={currentPatient.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="E-posta"
                  type="email"
                  value={currentPatient.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Adres"
                  value={currentPatient.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  margin="normal"
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Anne Bilgileri
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Anne Ad Soyad"
                  value={currentPatient.motherName}
                  onChange={(e) => handleInputChange('motherName', e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Anne Telefon"
                  value={currentPatient.motherPhone}
                  onChange={(e) => handleInputChange('motherPhone', e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Anne E-posta"
                  type="email"
                  value={currentPatient.motherEmail}
                  onChange={(e) => handleInputChange('motherEmail', e.target.value)}
                  margin="normal"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Baba Bilgileri
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Baba Ad Soyad"
                  value={currentPatient.fatherName}
                  onChange={(e) => handleInputChange('fatherName', e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Baba Telefon"
                  value={currentPatient.fatherPhone}
                  onChange={(e) => handleInputChange('fatherPhone', e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Baba E-posta"
                  type="email"
                  value={currentPatient.fatherEmail}
                  onChange={(e) => handleInputChange('fatherEmail', e.target.value)}
                  margin="normal"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <TextField
              fullWidth
              label="Notlar"
              value={currentPatient.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              margin="normal"
              multiline
              rows={3}
              placeholder="Hasta hakkında notlar..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            İptal
          </Button>
          <Button
            onClick={handleSavePatient}
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default HastaKayit;
