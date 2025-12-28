import React, { useEffect, useState } from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  LinearProgress,
  Paper
} from '@mui/material';
import FaceIcon from '@mui/icons-material/Face';
import EventIcon from '@mui/icons-material/Event';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

const Portal = () => {
  const [todays, setTodays] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const loadTodays = () => {
      const stored = JSON.parse(localStorage.getItem('appointments') || '[]');
      const today = new Date().toISOString().split('T')[0];
      const filtered = stored.filter(apt => apt.date === today).sort((a, b) => (a.timeSlot || '').localeCompare(b.timeSlot || ''));
      setTodays(filtered);
    };

    const loadEmployees = () => {
      const storedEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
      setEmployees(storedEmployees);
    };

    loadTodays();
    loadEmployees();
    
    window.addEventListener('appointmentsUpdated', loadTodays);
    window.addEventListener('usersUpdated', loadEmployees);
    
    return () => {
      window.removeEventListener('appointmentsUpdated', loadTodays);
      window.removeEventListener('usersUpdated', loadEmployees);
    };
  }, []);

  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getPositionColor = (position) => {
    const colors = {
      'admin': 'error',
      'hekim': 'primary',
      'psikolog': 'info',
      'terapist': 'success',
      'sekreter': 'warning',
      'muhasebe': 'secondary',
      'muhasebeci': 'secondary'
    };
    return colors[position?.toLowerCase()] || 'default';
  };

  return (
    <Grid container spacing={2}>
      {/* Genel İstatistikler Kartı */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 56, height: 56 }}>
                <FaceIcon fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
                  Diamind
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Çocuk ve Ergen Psikiyatri Kliniği
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={2} sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd', border: '1px solid #90caf9' }}>
                  <Typography variant="h4" color="#1565c0" fontWeight="bold">
                    248
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bu Ayki Randevu
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={2} sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9', border: '1px solid #81c784' }}>
                  <Typography variant="h4" color="#2e7d32" fontWeight="bold">
                    189
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tamamlanan
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={2} sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0', border: '1px solid #ffb74d' }}>
                  <Typography variant="h4" color="#e65100" fontWeight="bold">
                    42
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bekleyen
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={2} sx={{ p: 2, textAlign: 'center', bgcolor: '#ffebee', border: '1px solid #ef5350' }}>
                  <Typography variant="h4" color="#c62828" fontWeight="bold">
                    17
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    İptal Edilen
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Klinik Çalışanları Kartı */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                <PeopleIcon />
              </Avatar>
              <Typography variant="h5" component="h2">
                Klinik Çalışanlarımız
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <List>
              {employees.length > 0 ? (
                employees.map((employee) => (
                  <ListItem 
                    key={employee.id}
                    sx={{ 
                      bgcolor: 'action.hover', 
                      borderRadius: 1, 
                      mb: 1 
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: `${getPositionColor(employee.position)}.main` }}>
                        {getInitials(employee.name)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body1" fontWeight="bold">
                          {employee.name}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.primary">
                            {employee.position} {employee.email ? `• ${employee.email}` : ''}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {employee.phone || 'Telefon bilgisi yok'}
                          </Typography>
                        </>
                      }
                    />
                    <Chip 
                      label={employee.position} 
                      size="small" 
                      color={getPositionColor(employee.position)}
                    />
                  </ListItem>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                  Henüz personel kaydı bulunmamaktadır.
                </Typography>
              )}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Departman Bazlı Randevu Dağılımı Kartı */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <LocalHospitalIcon />
              </Avatar>
              <Typography variant="h5" component="h2">
                Departman Randevu Dağılımı
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mt: 2 }}>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" fontWeight="bold">
                    Psikiyatri
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    82 randevu (33%)
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={82} 
                  sx={{ height: 8, borderRadius: 1 }}
                  color="primary"
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" fontWeight="bold">
                    Terapist
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    68 randevu (27%)
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={68} 
                  sx={{ height: 8, borderRadius: 1 }}
                  color="success"
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" fontWeight="bold">
                    Hareket Eğitimi
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    54 randevu (22%)
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={54} 
                  sx={{ height: 8, borderRadius: 1 }}
                  color="warning"
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" fontWeight="bold">
                    Oyun Terapisi
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    32 randevu (13%)
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={32} 
                  sx={{ height: 8, borderRadius: 1 }}
                  color="info"
                />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" fontWeight="bold">
                    Diğer Hizmetler
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    12 randevu (5%)
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={12} 
                  sx={{ height: 8, borderRadius: 1 }}
                  color="error"
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Haftalık Performans Kartı */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                <TrendingUpIcon />
              </Avatar>
              <Typography variant="h5" component="h2">
                Bu Hafta Performans Özeti
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <PeopleIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h5" fontWeight="bold">
                    156
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Toplam Hasta
                  </Typography>
                  <Chip 
                    label="+12% bu hafta" 
                    size="small" 
                    color="success" 
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <EventIcon sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h5" fontWeight="bold">
                    42
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Günlük Ortalama
                  </Typography>
                  <Chip 
                    label="+5% artış" 
                    size="small" 
                    color="success" 
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <LocalHospitalIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                  <Typography variant="h5" fontWeight="bold">
                    94%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tamamlanma Oranı
                  </Typography>
                  <Chip 
                    label="Hedef: 90%" 
                    size="small" 
                    color="success" 
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <TrendingUpIcon sx={{ fontSize: 48, color: 'info.main', mb: 1 }} />
                  <Typography variant="h5" fontWeight="bold">
                    4.8
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Memnuniyet Puanı
                  </Typography>
                  <Chip 
                    label="5 üzerinden" 
                    size="small" 
                    color="info" 
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      {/* Bugünkü Randevular */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <EventIcon />
              </Avatar>
              <Typography variant="h5" component="h2">
                Bugünkü Randevular
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <List>
              {todays.length === 0 ? (
                <Typography variant="body2" color="text.secondary">Bugün için randevu bulunmamaktadır.</Typography>
              ) : (
                todays.map(apt => (
                  <ListItem key={apt.id} sx={{ mb: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'secondary.main' }}>{(apt.name||'')[0] || 'H'}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography variant="body1" fontWeight="bold">{apt.timeSlot} — {apt.name}</Typography>}
                      secondary={<Typography variant="body2" color="text.secondary">{apt.employeeName || '—'} • {apt.phone || ''}</Typography>}
                    />
                    <Box sx={{ ml: 2 }}>
                      <Chip label={apt.status ? apt.status.charAt(0).toUpperCase() + apt.status.slice(1) : 'Bekleyen'} size="small" />
                    </Box>
                  </ListItem>
                ))
              )}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default Portal;
