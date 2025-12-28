import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
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
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';

const Vezne = () => {
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('currentUser') || 'null'));
  const [services, setServices] = useState([]);
  const [paidServices, setPaidServices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedServiceForPayment, setSelectedServiceForPayment] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [selectedPersonel, setSelectedPersonel] = useState('');
  const [personelPercentage, setPersonelPercentage] = useState(0);
  
  // Bugünün tarihini al (YYYY-MM-DD formatında)
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const [startDate, setStartDate] = useState(getTodayDate());
  const [endDate, setEndDate] = useState(getTodayDate());
  const [filteredStartDate, setFilteredStartDate] = useState(getTodayDate());
  const [filteredEndDate, setFilteredEndDate] = useState(getTodayDate());
  const [selectedPersonelFilter, setSelectedPersonelFilter] = useState('');

  useEffect(() => {
    // LocalStorage'dan hizmetleri ve personelleri yükle
    const loadServices = () => {
      let vezneServices = JSON.parse(localStorage.getItem('vezneServices') || '[]');
      let paid = JSON.parse(localStorage.getItem('paidServices') || '[]');
      const storedEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
      
      // Eski verileri migrate et - patientName yoksa ekle
      let needsUpdate = false;
      vezneServices = vezneServices.map(service => {
        if (!service.patientName) {
          needsUpdate = true;
          return { ...service, patientName: 'Belirtilmemiş', patientPhone: '-' };
        }
        return service;
      });
      
      if (needsUpdate) {
        localStorage.setItem('vezneServices', JSON.stringify(vezneServices));
      }
      
      // Tahsil edilen hizmetleri de migrate et
      let paidNeedsUpdate = false;
      paid = paid.map(service => {
        if (!service.patientName) {
          paidNeedsUpdate = true;
          return { ...service, patientName: 'Belirtilmemiş', patientPhone: '-' };
        }
        return service;
      });
      
      if (paidNeedsUpdate) {
        localStorage.setItem('paidServices', JSON.stringify(paid));
      }
      
      setServices(vezneServices);
      setPaidServices(paid);
      setEmployees(storedEmployees);
      
      // CurrentUser'i güncelle
      const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
      if (user) setCurrentUser(user);
    };

    loadServices();
    
    // Kullanıcı rolüne göre varsayılan personel filtresi
    if (currentUser && selectedPersonelFilter === '') {
      const userRole = (currentUser.role || currentUser.position || '')?.toLowerCase();
      // Terapist, vezne ve admin dışındaki personeller sadece kendilerini görebilir
      if (userRole !== 'vezne' && userRole !== 'admin' && userRole !== 'muhasebe' && userRole !== 'muhasebeci') {
        // Terapist ve diğer personel için sadece kendisi
        // Employee listesinden kullanıcının adını bul
        const storedEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
        const currentEmployee = storedEmployees.find(emp => 
          emp.username === currentUser.username || emp.id === currentUser.id
        );
        const filterName = currentEmployee ? currentEmployee.name : (currentUser.name || currentUser.username);
        setSelectedPersonelFilter(filterName);
      }
    }
    
    // LocalStorage değişikliklerini dinle
    const interval = setInterval(loadServices, 1000);
    return () => clearInterval(interval);
  }, [currentUser, selectedPersonelFilter]);

  const handleOpenPaymentModal = (serviceId) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setSelectedServiceForPayment(service);
      setDiscount(0);
      // Eğer hizmete zaten personel atanmışsa onu seç
      const assignedPersonel = service.personel || '';
      setSelectedPersonel(assignedPersonel);
      
      // Personel seçiliyse, hizmet ayarlarından default yüzdeyi yükle
      if (assignedPersonel) {
        const serviceSettings = JSON.parse(localStorage.getItem('employeeServiceSettings') || '{}');
        const employee = employees.find(emp => emp.name === assignedPersonel);
        if (employee && serviceSettings[employee.id]) {
          const settings = serviceSettings[employee.id];
          let defaultPercentage = 0;
          
          // Hizmet türüne göre yüzde belirle
          const serviceName = service.name.toLowerCase();
          if (serviceName.includes('muayene')) {
            defaultPercentage = settings.muayenePercentage || settings.generalPercentage || 0;
          } else if (serviceName.includes('test')) {
            defaultPercentage = settings.testPercentage || settings.generalPercentage || 0;
          } else if (serviceName.includes('seans')) {
            defaultPercentage = settings.seansPercentage || settings.generalPercentage || 0;
          } else {
            defaultPercentage = settings.generalPercentage || 0;
          }
          
          setPersonelPercentage(Number(defaultPercentage));
        } else {
          setPersonelPercentage(0);
        }
      } else {
        setPersonelPercentage(0);
      }
      
      setOpenModal(true);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedServiceForPayment(null);
    setDiscount(0);
    setSelectedPersonel('');
    setPersonelPercentage(0);
  };

  const handleConfirmPayment = () => {
    if (selectedServiceForPayment) {
      const discountedPrice = selectedServiceForPayment.price - discount;
      const personelAmount = (discountedPrice * personelPercentage) / 100;
      const clinicAmount = discountedPrice - personelAmount;

      // Tahsil edilen hizmeti kaydet
      const paidService = {
        ...selectedServiceForPayment,
        paidDate: new Date().toLocaleDateString('tr-TR'),
        originalPrice: selectedServiceForPayment.price,
        discount: discount,
        finalPrice: discountedPrice,
        personel: selectedPersonel,
        personelPercentage: personelPercentage,
        personelAmount: personelAmount,
        clinicAmount: clinicAmount
      };
      
      const updatedPaid = [...paidServices, paidService];
      setPaidServices(updatedPaid);
      localStorage.setItem('paidServices', JSON.stringify(updatedPaid));
      
      // Bekleyenlerden çıkar
      const updatedServices = services.filter(s => s.id !== selectedServiceForPayment.id);
      setServices(updatedServices);
      localStorage.setItem('vezneServices', JSON.stringify(updatedServices));

      // Personel gelirini kaydet
      if (selectedPersonel && personelAmount > 0) {
        const personelIncomes = JSON.parse(localStorage.getItem('personelIncomes') || '[]');
        personelIncomes.push({
          id: Date.now(),
          personel: selectedPersonel,
          service: selectedServiceForPayment.name,
          amount: personelAmount,
          date: new Date().toLocaleString('tr-TR')
        });
        localStorage.setItem('personelIncomes', JSON.stringify(personelIncomes));
      }

      handleCloseModal();
    }
  };

  const handleDeleteService = (serviceId) => {
    const updatedServices = services.filter(s => s.id !== serviceId);
    setServices(updatedServices);
    localStorage.setItem('vezneServices', JSON.stringify(updatedServices));
  };

  const handleDeletePaidService = (serviceId) => {
    const updatedPaid = paidServices.filter(s => s.id !== serviceId);
    setPaidServices(updatedPaid);
    localStorage.setItem('paidServices', JSON.stringify(updatedPaid));
  };

  const totalPending = services.reduce((sum, s) => sum + s.price, 0);
  const totalPaid = paidServices.reduce((sum, s) => sum + s.price, 0);

  return (
    <Grid container spacing={2}>
      {/* Özet Kartları */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                <PendingIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Bekleyen Tahsilat
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="warning.main">
                  {totalPending.toLocaleString('tr-TR')} ₺
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <CheckCircleIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Tahsil Edilen
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="success.main">
                  {totalPaid.toLocaleString('tr-TR')} ₺
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <AccountBalanceWalletIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Toplam Ciro
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="primary.main">
                  {(totalPending + totalPaid).toLocaleString('tr-TR')} ₺
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Tahsil Edilecek Hizmetler */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2, width: 56, height: 56 }}>
                <PendingIcon fontSize="large" />
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="h2" fontWeight="bold">
                  Tahsil Edilecek Hizmetler
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Bekleyen ödemeler listesi
                </Typography>
              </Box>
              <Chip 
                label={`${services.length} Hizmet`} 
                color="warning" 
              />
            </Box>
            <Divider sx={{ my: 2 }} />

            {services.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell><strong>Hizmet</strong></TableCell>
                      <TableCell><strong>Personel</strong></TableCell>
                      <TableCell><strong>Hasta</strong></TableCell>
                      <TableCell><strong>Tarih</strong></TableCell>
                      <TableCell align="right"><strong>Tutar</strong></TableCell>
                      <TableCell align="center"><strong>İşlem</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>{service.name}</TableCell>
                        <TableCell>{service.personel || '-'}</TableCell>
                        <TableCell>{service.patientName || 'Belirtilmemiş'}</TableCell>
                        <TableCell>{service.date}</TableCell>
                        <TableCell align="right">
                          <Typography variant="body1" fontWeight="bold" color="warning.main">
                            {service.price.toLocaleString('tr-TR')} ₺
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {(() => {
                            const userRole = (currentUser?.role || currentUser?.position || '')?.toLowerCase();
                            const canCollect = userRole === 'admin' || userRole === 'muhasebe' || userRole === 'muhasebeci';
                            return (
                              <>
                                <Button
                                  variant="contained"
                                  color="success"
                                  size="small"
                                  startIcon={<CheckCircleIcon />}
                                  onClick={() => handleOpenPaymentModal(service.id)}
                                  sx={{ mr: 1 }}
                                  disabled={!canCollect}
                                  title={!canCollect ? 'Tahsilat yetkisi yalnızca admin ve muhasebe personelindedir' : ''}
                                >
                                  Tahsil Et
                                </Button>
                                {canCollect && (
                                  <IconButton
                                    color="error"
                                    size="small"
                                    onClick={() => handleDeleteService(service.id)}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                )}
                              </>
                            );
                          })()}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: 'warning.light' }}>
                      <TableCell colSpan={3}><strong>TOPLAM</strong></TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" fontWeight="bold">
                          {totalPending.toLocaleString('tr-TR')} ₺
                        </Typography>
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  Tahsil edilecek hizmet bulunmamaktadır.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Tahsil Edilen Hizmetler */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 2, width: 56, height: 56 }}>
                <CheckCircleIcon fontSize="large" />
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="h2" fontWeight="bold">
                  Tahsil Edilen Hizmetler
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tamamlanan ödemeler
                </Typography>
              </Box>
              
              {/* Personel Filtresi */}
              {currentUser && (() => {
                const userRole = (currentUser.role || currentUser.position || '')?.toLowerCase();
                return userRole === 'vezne' || userRole === 'admin' || userRole === 'muhasebe' || userRole === 'muhasebeci';
              })() && (
                <FormControl size="small" sx={{ minWidth: 200, mr: 2 }}>
                  <InputLabel>Personel Filtresi</InputLabel>
                  <Select
                    value={selectedPersonelFilter}
                    onChange={(e) => setSelectedPersonelFilter(e.target.value)}
                    label="Personel Filtresi"
                  >
                    <MenuItem value="">Tüm Personel</MenuItem>
                    {(() => {
                      const userRole = (currentUser.role || currentUser.position || '')?.toLowerCase();
                      return userRole === 'muhasebe' || userRole === 'muhasebeci' || userRole === 'admin';
                    })() && (
                      <MenuItem value="Tüm Klinik">Tüm Klinik</MenuItem>
                    )}
                    {employees.map((emp) => (
                      <MenuItem key={emp.id} value={emp.name}>
                        {emp.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              
              <Chip 
                label={`${paidServices.filter(service => {
                  // Personel filtresi
                  if (selectedPersonelFilter && selectedPersonelFilter !== 'Tüm Klinik') {
                    if (service.personel !== selectedPersonelFilter) return false;
                  }
                  
                  // Tarih filtresi
                  if (!filteredStartDate && !filteredEndDate) return true;
                  
                  // paidDate format: "20.12.2025" veya "20.12.2025 14:30:45"
                  const dateStr = service.paidDate.split(' ')[0]; // Saat varsa saat kısmını at
                  const dateParts = dateStr.split('.');
                  if (dateParts.length !== 3) return true;
                  
                  const serviceDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
                  serviceDate.setHours(0, 0, 0, 0);
                  
                  if (filteredStartDate && filteredEndDate) {
                    const start = new Date(filteredStartDate);
                    start.setHours(0, 0, 0, 0);
                    const end = new Date(filteredEndDate);
                    end.setHours(23, 59, 59, 999);
                    return serviceDate >= start && serviceDate <= end;
                  }
                  if (filteredStartDate) {
                    const start = new Date(filteredStartDate);
                    start.setHours(0, 0, 0, 0);
                    return serviceDate >= start;
                  }
                  if (filteredEndDate) {
                    const end = new Date(filteredEndDate);
                    end.setHours(23, 59, 59, 999);
                    return serviceDate <= end;
                  }
                  return true;
                }).length} Hizmet`} 
                color="success" 
              />
            </Box>
            
            {/* Tarih Aralığı Filtresi */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
              <TextField
                label="Başlangıç Tarihi"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
                sx={{ flex: 1 }}
              />
              <TextField
                label="Bitiş Tarihi"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
                sx={{ flex: 1 }}
              />
              <Button
                variant="contained"
                onClick={() => {
                  setFilteredStartDate(startDate);
                  setFilteredEndDate(endDate);
                }}
                color="primary"
              >
                Listele
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setFilteredStartDate('');
                  setFilteredEndDate('');
                }}
                size="small"
              >
                Temizle
              </Button>
              <Button
                variant="contained"
                startIcon={<PrintIcon />}
                onClick={() => {
                  const filteredData = paidServices.filter(service => {
                    // Personel filtresi
                    if (selectedPersonelFilter && selectedPersonelFilter !== 'Tüm Klinik') {
                      if (service.personel !== selectedPersonelFilter) return false;
                    }
                    
                    // Tarih filtresi
                    if (!filteredStartDate && !filteredEndDate) return true;
                    
                    const dateStr = service.paidDate.split(' ')[0];
                    const dateParts = dateStr.split('.');
                    if (dateParts.length !== 3) return true;
                    
                    const serviceDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
                    serviceDate.setHours(0, 0, 0, 0);
                    
                    if (filteredStartDate && filteredEndDate) {
                      const start = new Date(filteredStartDate);
                      start.setHours(0, 0, 0, 0);
                      const end = new Date(filteredEndDate);
                      end.setHours(23, 59, 59, 999);
                      return serviceDate >= start && serviceDate <= end;
                    }
                    if (filteredStartDate) {
                      const start = new Date(filteredStartDate);
                      start.setHours(0, 0, 0, 0);
                      return serviceDate >= start;
                    }
                    if (filteredEndDate) {
                      const end = new Date(filteredEndDate);
                      end.setHours(23, 59, 59, 999);
                      return serviceDate <= end;
                    }
                    return true;
                  });
                  const totalFiltered = filteredData.reduce((sum, s) => sum + s.price, 0);
                  let printContent = `<html><head><title>Tahsilat Dökümü</title><style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { text-align: center; color: #2e7d32; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #2e7d32; color: white; }
                    .total { background-color: #c8e6c9; font-weight: bold; }
                  </style></head><body>
                  <h1>Tahsilat Dökümü</h1>
                  <p><strong>Tarih Aralığı:</strong> ${filteredStartDate || 'Başlangıç yok'} - ${filteredEndDate || 'Bitiş yok'}</p>
                  <p><strong>Toplam Hizmet:</strong> ${filteredData.length}</p>
                  <table>
                  <thead><tr><th>Hizmet</th><th>Personel</th><th>Hasta</th><th>Hizmet Tarihi</th><th>Tahsil Tarihi</th><th>Tutar</th></tr></thead>
                  <tbody>`;
                  filteredData.forEach(service => {
                    printContent += `<tr>
                      <td>${service.name}</td>
                      <td>${service.personel || '-'}</td>
                      <td>${service.patientName || 'Belirtilmemiş'}</td>
                      <td>${service.date}</td>
                      <td>${service.paidDate}</td>
                      <td>${service.price.toLocaleString('tr-TR')} ₺</td>
                    </tr>`;
                  });
                  printContent += `<tr class="total"><td colspan="5">TOPLAM</td><td>${totalFiltered.toLocaleString('tr-TR')} ₺</td></tr>`;
                  printContent += `</tbody></table></body></html>`;
                  const printWindow = window.open('', '', 'height=600,width=800');
                  printWindow.document.write(printContent);
                  printWindow.document.close();
                  printWindow.print();
                }}
                color="success"
              >
                Döküm Al
              </Button>
            </Box>
            
            <Divider sx={{ my: 2 }} />

            {paidServices.filter(service => {
              // Personel filtresi
              if (selectedPersonelFilter && selectedPersonelFilter !== 'Tüm Klinik') {
                if (service.personel !== selectedPersonelFilter) return false;
              }
              
              // Tarih filtresi
              if (!filteredStartDate && !filteredEndDate) return true;
              
              const dateStr = service.paidDate.split(' ')[0];
              const dateParts = dateStr.split('.');
              if (dateParts.length !== 3) return true;
              
              const serviceDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
              serviceDate.setHours(0, 0, 0, 0);
              
              if (filteredStartDate && filteredEndDate) {
                const start = new Date(filteredStartDate);
                start.setHours(0, 0, 0, 0);
                const end = new Date(filteredEndDate);
                end.setHours(23, 59, 59, 999);
                return serviceDate >= start && serviceDate <= end;
              }
              if (filteredStartDate) {
                const start = new Date(filteredStartDate);
                start.setHours(0, 0, 0, 0);
                return serviceDate >= start;
              }
              if (filteredEndDate) {
                const end = new Date(filteredEndDate);
                end.setHours(23, 59, 59, 999);
                return serviceDate <= end;
              }
              return true;
            }).length > 0 ? (
              <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell><strong>Hizmet</strong></TableCell>
                      <TableCell><strong>Personel</strong></TableCell>
                      <TableCell><strong>Hasta</strong></TableCell>
                      <TableCell><strong>Hizmet Tarihi</strong></TableCell>
                      <TableCell><strong>Tahsil Tarihi</strong></TableCell>
                      <TableCell align="right"><strong>Tutar</strong></TableCell>
                      <TableCell align="right"><strong>Personel Payı</strong></TableCell>
                      <TableCell align="right"><strong>Kurum Payı</strong></TableCell>
                      <TableCell align="center"><strong>İşlem</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paidServices.filter(service => {
                      // Personel filtresi
                      if (selectedPersonelFilter && selectedPersonelFilter !== 'Tüm Klinik') {
                        if (service.personel !== selectedPersonelFilter) return false;
                      }
                      
                      // Tarih filtresi
                      if (!filteredStartDate && !filteredEndDate) return true;
                      
                      const dateStr = service.paidDate.split(' ')[0];
                      const dateParts = dateStr.split('.');
                      if (dateParts.length !== 3) return true;
                      
                      const serviceDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
                      serviceDate.setHours(0, 0, 0, 0);
                      
                      if (filteredStartDate && filteredEndDate) {
                        const start = new Date(filteredStartDate);
                        start.setHours(0, 0, 0, 0);
                        const end = new Date(filteredEndDate);
                        end.setHours(23, 59, 59, 999);
                        return serviceDate >= start && serviceDate <= end;
                      }
                      if (filteredStartDate) {
                        const start = new Date(filteredStartDate);
                        start.setHours(0, 0, 0, 0);
                        return serviceDate >= start;
                      }
                      if (filteredEndDate) {
                        const end = new Date(filteredEndDate);
                        end.setHours(23, 59, 59, 999);
                        return serviceDate <= end;
                      }
                      return true;
                    }).map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>{service.name}</TableCell>
                        <TableCell>{service.personel || '-'}</TableCell>
                        <TableCell>{service.patientName || 'Belirtilmemiş'}</TableCell>
                        <TableCell>{service.date}</TableCell>
                        <TableCell>{service.paidDate}</TableCell>
                        <TableCell align="right">
                          <Typography variant="body1" fontWeight="bold" color="success.main">
                            {(service.finalPrice || service.price).toLocaleString('tr-TR')} ₺
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="primary.main">
                            {(service.personelAmount || 0).toLocaleString('tr-TR')} ₺
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="info.main">
                            {(service.clinicAmount || (service.finalPrice || service.price)).toLocaleString('tr-TR')} ₺
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleDeletePaidService(service.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: 'success.light' }}>
                      <TableCell colSpan={5}><strong>TOPLAM MİKTAR</strong></TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" fontWeight="bold">
                          {paidServices.filter(service => {
                            // Personel filtresi
                            if (selectedPersonelFilter && selectedPersonelFilter !== 'Tüm Klinik') {
                              if (service.personel !== selectedPersonelFilter) return false;
                            }
                            
                            // Tarih filtresi
                            if (!filteredStartDate && !filteredEndDate) return true;
                            
                            const dateStr = service.paidDate.split(' ')[0];
                            const dateParts = dateStr.split('.');
                            if (dateParts.length !== 3) return true;
                            
                            const serviceDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
                            serviceDate.setHours(0, 0, 0, 0);
                            
                            if (filteredStartDate && filteredEndDate) {
                              const start = new Date(filteredStartDate);
                              start.setHours(0, 0, 0, 0);
                              const end = new Date(filteredEndDate);
                              end.setHours(23, 59, 59, 999);
                              return serviceDate >= start && serviceDate <= end;
                            }
                            if (filteredStartDate) {
                              const start = new Date(filteredStartDate);
                              start.setHours(0, 0, 0, 0);
                              return serviceDate >= start;
                            }
                            if (filteredEndDate) {
                              const end = new Date(filteredEndDate);
                              end.setHours(23, 59, 59, 999);
                              return serviceDate <= end;
                            }
                            return true;
                          }).reduce((sum, s) => sum + (s.finalPrice || s.price), 0).toLocaleString('tr-TR')} ₺
                        </Typography>
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                    <TableRow sx={{ bgcolor: 'primary.light' }}>
                      <TableCell colSpan={5}><strong>PERSONEL PAYI</strong></TableCell>
                      <TableCell></TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" fontWeight="bold" color="primary.dark">
                          {paidServices.filter(service => {
                            // Personel filtresi
                            if (selectedPersonelFilter && selectedPersonelFilter !== 'Tüm Klinik') {
                              if (service.personel !== selectedPersonelFilter) return false;
                            }
                            
                            // Tarih filtresi
                            if (!filteredStartDate && !filteredEndDate) return true;
                            
                            const dateStr = service.paidDate.split(' ')[0];
                            const dateParts = dateStr.split('.');
                            if (dateParts.length !== 3) return true;
                            
                            const serviceDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
                            serviceDate.setHours(0, 0, 0, 0);
                            
                            if (filteredStartDate && filteredEndDate) {
                              const start = new Date(filteredStartDate);
                              start.setHours(0, 0, 0, 0);
                              const end = new Date(filteredEndDate);
                              end.setHours(23, 59, 59, 999);
                              return serviceDate >= start && serviceDate <= end;
                            }
                            if (filteredStartDate) {
                              const start = new Date(filteredStartDate);
                              start.setHours(0, 0, 0, 0);
                              return serviceDate >= start;
                            }
                            if (filteredEndDate) {
                              const end = new Date(filteredEndDate);
                              end.setHours(23, 59, 59, 999);
                              return serviceDate <= end;
                            }
                            return true;
                          }).reduce((sum, s) => sum + (s.personelAmount || 0), 0).toLocaleString('tr-TR')} ₺
                        </Typography>
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                    <TableRow sx={{ bgcolor: 'info.light' }}>
                      <TableCell colSpan={5}><strong>KURUM PAYI</strong></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" fontWeight="bold" color="info.dark">
                          {paidServices.filter(service => {
                            // Personel filtresi
                            if (selectedPersonelFilter && selectedPersonelFilter !== 'Tüm Klinik') {
                              if (service.personel !== selectedPersonelFilter) return false;
                            }
                            
                            // Tarih filtresi
                            if (!filteredStartDate && !filteredEndDate) return true;
                            
                            const dateStr = service.paidDate.split(' ')[0];
                            const dateParts = dateStr.split('.');
                            if (dateParts.length !== 3) return true;
                            
                            const serviceDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
                            serviceDate.setHours(0, 0, 0, 0);
                            
                            if (filteredStartDate && filteredEndDate) {
                              const start = new Date(filteredStartDate);
                              start.setHours(0, 0, 0, 0);
                              const end = new Date(filteredEndDate);
                              end.setHours(23, 59, 59, 999);
                              return serviceDate >= start && serviceDate <= end;
                            }
                            if (filteredStartDate) {
                              const start = new Date(filteredStartDate);
                              start.setHours(0, 0, 0, 0);
                              return serviceDate >= start;
                            }
                            if (filteredEndDate) {
                              const end = new Date(filteredEndDate);
                              end.setHours(23, 59, 59, 999);
                              return serviceDate <= end;
                            }
                            return true;
                          }).reduce((sum, s) => sum + (s.clinicAmount || (s.finalPrice || s.price)), 0).toLocaleString('tr-TR')} ₺
                        </Typography>
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  Henüz tahsil edilen hizmet bulunmamaktadır.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Tahsilat Modalı */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Tahsilat İşlemi
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedServiceForPayment && (
            <Box sx={{ pt: 2 }}>
              <Paper sx={{ p: 2, mb: 3, bgcolor: 'action.hover' }}>
                <Typography variant="body2" color="text.secondary">
                  Hizmet
                </Typography>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {selectedServiceForPayment.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hasta: {selectedServiceForPayment.patientName || 'Belirtilmemiş'}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="h5" color="primary.main" fontWeight="bold">
                  {selectedServiceForPayment.price.toLocaleString('tr-TR')} ₺
                </Typography>
              </Paper>

              <TextField
                fullWidth
                label="İndirim Tutarı"
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Math.max(0, Math.min(selectedServiceForPayment.price, Number(e.target.value))))}
                InputProps={{
                  endAdornment: <InputAdornment position="end">₺</InputAdornment>,
                }}
                sx={{ mb: 2 }}
              />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Personel Seçimi</InputLabel>
                <Select
                  value={selectedPersonel}
                  label="Personel Seçimi"
                  onChange={(e) => {
                    const newPersonel = e.target.value;
                    setSelectedPersonel(newPersonel);
                    
                    // Personel seçildiğinde hizmet ayarlarından default yüzdeyi yükle
                    if (newPersonel && selectedServiceForPayment) {
                      const serviceSettings = JSON.parse(localStorage.getItem('employeeServiceSettings') || '{}');
                      const employee = employees.find(emp => emp.name === newPersonel);
                      if (employee && serviceSettings[employee.id]) {
                        const settings = serviceSettings[employee.id];
                        let defaultPercentage = 0;
                        
                        // Hizmet türüne göre yüzde belirle
                        const serviceName = selectedServiceForPayment.name.toLowerCase();
                        if (serviceName.includes('muayene')) {
                          defaultPercentage = settings.muayenePercentage || settings.generalPercentage || 0;
                        } else if (serviceName.includes('test')) {
                          defaultPercentage = settings.testPercentage || settings.generalPercentage || 0;
                        } else if (serviceName.includes('seans')) {
                          defaultPercentage = settings.seansPercentage || settings.generalPercentage || 0;
                        } else {
                          defaultPercentage = settings.generalPercentage || 0;
                        }
                        
                        setPersonelPercentage(Number(defaultPercentage));
                      } else {
                        setPersonelPercentage(0);
                      }
                    } else {
                      setPersonelPercentage(0);
                    }
                  }}
                >
                  <MenuItem value="">Seçiniz</MenuItem>
                  {employees.map((employee) => (
                    <MenuItem key={employee.id} value={employee.name}>
                      {employee.name} ({employee.position})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Personel Yüzdesi"
                type="number"
                value={personelPercentage}
                onChange={(e) => setPersonelPercentage(Math.max(0, Math.min(100, Number(e.target.value))))}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                disabled={!selectedPersonel}
                sx={{ mb: 3 }}
              />

              <Paper sx={{ p: 2, bgcolor: 'success.light' }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Orijinal Tutar
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedServiceForPayment.price.toLocaleString('tr-TR')} ₺
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      İndirim
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" color="error">
                      -{discount.toLocaleString('tr-TR')} ₺
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Net Tutar
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="success.main">
                      {(selectedServiceForPayment.price - discount).toLocaleString('tr-TR')} ₺
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Personel Payı ({personelPercentage}%)
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="primary.main">
                      {(((selectedServiceForPayment.price - discount) * personelPercentage) / 100).toLocaleString('tr-TR')} ₺
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Klinik Payı
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="info.main">
                      {((selectedServiceForPayment.price - discount) - (((selectedServiceForPayment.price - discount) * personelPercentage) / 100)).toLocaleString('tr-TR')} ₺
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>
            İptal
          </Button>
          <Button 
            onClick={handleConfirmPayment} 
            variant="contained" 
            color="success"
            startIcon={<CheckCircleIcon />}
          >
            Tahsil Et
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default Vezne;
