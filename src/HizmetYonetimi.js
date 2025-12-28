import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Avatar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const HizmetYonetimi = () => {
  const [services, setServices] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentService, setCurrentService] = useState({
    id: '',
    name: '',
    description: '',
    amount: ''
  });

  useEffect(() => {
    const loadServices = () => {
      const storedServices = JSON.parse(localStorage.getItem('services') || '[]');
      setServices(storedServices);
    };
    loadServices();
  }, []);

  const handleOpenDialog = () => {
    setEditMode(false);
    setCurrentService({
      id: '',
      name: '',
      description: '',
      amount: ''
    });
    setOpenDialog(true);
  };

  const handleEditService = (service) => {
    setEditMode(true);
    setCurrentService(service);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentService({
      id: '',
      name: '',
      description: '',
      amount: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentService(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveService = () => {
    if (!currentService.name || !currentService.amount) {
      alert('Lütfen hizmet adı ve fiyatını girin!');
      return;
    }

    let updatedServices;
    if (editMode) {
      updatedServices = services.map(s => s.id === currentService.id ? currentService : s);
    } else {
      const newService = {
        ...currentService,
        id: Date.now().toString()
      };
      updatedServices = [...services, newService];
    }

    setServices(updatedServices);
    localStorage.setItem('services', JSON.stringify(updatedServices));
    handleCloseDialog();
  };

  const handleDeleteService = (serviceId) => {
    if (window.confirm('Bu hizmeti silmek istediğinizden emin misiniz?')) {
      const updatedServices = services.filter(s => s.id !== serviceId);
      setServices(updatedServices);
      localStorage.setItem('services', JSON.stringify(updatedServices));
    }
  };

  return (
    <Grid container spacing={2}>
      {/* Başlık Kartı */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 56, height: 56 }}>
                  <ShoppingCartIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="h2" fontWeight="bold">
                    Hizmet Yönetimi
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tedavi ve hizmetleri tanımlayın
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenDialog}
                sx={{
                  background: 'linear-gradient(90deg, #061161 0%, #780206 100%)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #050d4d 0%, #5f0105 100%)',
                  }
                }}
              >
                Hizmet Ekle
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Hizmetler Tablosu */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            {services.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell><strong>Hizmet Adı</strong></TableCell>
                      <TableCell><strong>Açıklama</strong></TableCell>
                      <TableCell align="right"><strong>Fiyat (TL)</strong></TableCell>
                      <TableCell align="center"><strong>İşlemler</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {services.map((service) => (
                      <TableRow key={service.id} hover>
                        <TableCell>{service.name}</TableCell>
                        <TableCell>{service.description || '-'}</TableCell>
                        <TableCell align="right">{parseFloat(service.amount).toFixed(2)}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleEditService(service)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteService(service.id)}
                            color="error"
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
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                Henüz hizmet eklenmemiş.
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Hizmet Ekle/Düzenle Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Hizmeti Düzenle' : 'Yeni Hizmet Ekle'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Hizmet Adı"
              name="name"
              value={currentService.name}
              onChange={handleInputChange}
              placeholder="örn: Konsültasyon, Fizik Terapi"
            />
            <TextField
              fullWidth
              label="Açıklama"
              name="description"
              value={currentService.description}
              onChange={handleInputChange}
              multiline
              rows={2}
              placeholder="Hizmet hakkında kısa açıklama (isteğe bağlı)"
            />
            <TextField
              fullWidth
              label="Fiyat (TL)"
              name="amount"
              type="number"
              inputProps={{ step: '0.01' }}
              value={currentService.amount}
              onChange={handleInputChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button
            variant="contained"
            onClick={handleSaveService}
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
    </Grid>
  );
};

export default HizmetYonetimi;
