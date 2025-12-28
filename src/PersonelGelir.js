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
  Tabs,
  Tab
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

const PersonelGelir = () => {
  const [tabValue, setTabValue] = useState(0);
  const [personelIncomes, setPersonelIncomes] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    // LocalStorage'dan personel gelirlerini ve çalışanları yükle
    const loadIncomes = () => {
      const incomes = JSON.parse(localStorage.getItem('personelIncomes') || '[]');
      const storedEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
      setPersonelIncomes(incomes);
      setEmployees(storedEmployees);
    };

    loadIncomes();
    
    // LocalStorage değişikliklerini dinle
    const interval = setInterval(loadIncomes, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Sistemdeki personelleri pozisyonlarına göre ayır
  const doctors = employees.filter(emp => emp.position === 'Hekim').map(emp => emp.name);
  const therapists = employees.filter(emp => emp.position === 'Terapist').map(emp => emp.name);

  const getDoctorIncomes = () => {
    return personelIncomes.filter(income => doctors.includes(income.personel));
  };

  const getTherapistIncomes = () => {
    return personelIncomes.filter(income => therapists.includes(income.personel));
  };

  const calculateTotal = (incomes) => {
    return incomes.reduce((sum, income) => sum + income.amount, 0);
  };

  const renderIncomeTable = (incomes, title) => {
    const totalIncome = calculateTotal(incomes);

    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 56, height: 56 }}>
              {title === 'Hekim' ? <LocalHospitalIcon fontSize="large" /> : <MedicalServicesIcon fontSize="large" />}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h5" component="h2" fontWeight="bold">
                {title} Gelirleri
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Toplam: {totalIncome.toLocaleString('tr-TR')} ₺
              </Typography>
            </Box>
            <Chip 
              label={`${incomes.length} İşlem`} 
              color="primary" 
            />
          </Box>
          <Divider sx={{ my: 2 }} />

          {incomes.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell><strong>Personel</strong></TableCell>
                    <TableCell><strong>Hizmet</strong></TableCell>
                    <TableCell><strong>Tarih</strong></TableCell>
                    <TableCell align="right"><strong>Gelir</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {incomes.map((income) => (
                    <TableRow key={income.id}>
                      <TableCell>{income.personel}</TableCell>
                      <TableCell>{income.service}</TableCell>
                      <TableCell>{income.date}</TableCell>
                      <TableCell align="right">
                        <Typography variant="body1" fontWeight="bold" color="success.main">
                          {income.amount.toLocaleString('tr-TR')} ₺
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ bgcolor: 'success.light' }}>
                    <TableCell colSpan={3}><strong>TOPLAM GELİR</strong></TableCell>
                    <TableCell align="right">
                      <Typography variant="h6" fontWeight="bold">
                        {totalIncome.toLocaleString('tr-TR')} ₺
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Henüz gelir kaydı bulunmamaktadır.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  // Personel bazında özet
  const getPersonelSummary = () => {
    const summary = {};
    personelIncomes.forEach(income => {
      if (!summary[income.personel]) {
        summary[income.personel] = {
          name: income.personel,
          total: 0,
          count: 0,
          type: doctors.includes(income.personel) ? 'Hekim' : 'Terapist'
        };
      }
      summary[income.personel].total += income.amount;
      summary[income.personel].count += 1;
    });
    return Object.values(summary);
  };

  const doctorIncomes = getDoctorIncomes();
  const therapistIncomes = getTherapistIncomes();
  const personelSummary = getPersonelSummary();

  return (
    <Grid container spacing={2}>
      {/* Genel Özet Kartları */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <LocalHospitalIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Hekim Gelirleri
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="primary.main">
                  {calculateTotal(doctorIncomes).toLocaleString('tr-TR')} ₺
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
                <MedicalServicesIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Terapist Gelirleri
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="success.main">
                  {calculateTotal(therapistIncomes).toLocaleString('tr-TR')} ₺
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
              <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                <PeopleIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Toplam Personel Geliri
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="info.main">
                  {(calculateTotal(doctorIncomes) + calculateTotal(therapistIncomes)).toLocaleString('tr-TR')} ₺
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Personel Özet Tablosu */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'secondary.main', mr: 2, width: 56, height: 56 }}>
                <PeopleIcon fontSize="large" />
              </Avatar>
              <Typography variant="h5" component="h2" fontWeight="bold">
                Personel Bazında Özet
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />

            {personelSummary.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell><strong>Personel Adı</strong></TableCell>
                      <TableCell><strong>Pozisyon</strong></TableCell>
                      <TableCell align="center"><strong>İşlem Sayısı</strong></TableCell>
                      <TableCell align="right"><strong>Toplam Gelir</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {personelSummary.map((person) => (
                      <TableRow key={person.name}>
                        <TableCell>{person.name}</TableCell>
                        <TableCell>
                          <Chip 
                            label={person.type} 
                            size="small" 
                            color={person.type === 'Hekim' ? 'primary' : 'success'}
                          />
                        </TableCell>
                        <TableCell align="center">{person.count}</TableCell>
                        <TableCell align="right">
                          <Typography variant="body1" fontWeight="bold" color="success.main">
                            {person.total.toLocaleString('tr-TR')} ₺
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  Henüz personel gelir kaydı bulunmamaktadır.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Sekmeli Detay Tabloları */}
      <Grid item xs={12}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Hekim Detayları" />
            <Tab label="Terapist Detayları" />
          </Tabs>
        </Box>

        {tabValue === 0 && renderIncomeTable(doctorIncomes, 'Hekim')}
        {tabValue === 1 && renderIncomeTable(therapistIncomes, 'Terapist')}
      </Grid>
    </Grid>
  );
};

export default PersonelGelir;
