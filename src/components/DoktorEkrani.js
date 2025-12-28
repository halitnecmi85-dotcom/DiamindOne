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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  Drawer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PersonIcon from '@mui/icons-material/Person';
import SendIcon from '@mui/icons-material/Send';
import HistoryIcon from '@mui/icons-material/History';
import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteIcon from '@mui/icons-material/Delete';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DoktorEkrani = ({ currentUser, institution, onLogout }) => {
  const [selectedMenu, setSelectedMenu] = useState('Ana Sayfa');
  const [patientCode, setPatientCode] = useState('');
  const [isPatientActive, setIsPatientActive] = useState(false);
  const [availableForms, setAvailableForms] = useState([]);
  const [requestedForms, setRequestedForms] = useState([]);
  const [completedForms, setCompletedForms] = useState([]);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [draggedForm, setDraggedForm] = useState(null);
  const [applications, setApplications] = useState([]);
  
  // Sonuç gösterimi için state'ler
  const [openResultDialog, setOpenResultDialog] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [zoomDialogOpen, setZoomDialogOpen] = useState(false);
  const [zoomColumn, setZoomColumn] = useState(null);
  const [selectedHistoryTest, setSelectedHistoryTest] = useState(null);

  // İlk menü öğesini seç
  React.useEffect(() => {
    setSelectedMenu('Anasayfa');
  }, []);

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [institution]);

  const loadData = () => {
    // Formları yükle (sadece kendi kurumundaki)
    const allScales = JSON.parse(localStorage.getItem('olcekScales') || '[]');
    const institutionScales = allScales.filter(s => s.institutionId === institution.id);
    setAvailableForms(institutionScales);

    // Uygulamaları yükle
    const allApplications = JSON.parse(localStorage.getItem('olcekApplications') || '[]');
    const doctorApplications = allApplications.filter(
      a => a.institutionId === institution.id && a.doctorId === currentUser.id
    );
    setApplications(doctorApplications);
  };

  const generatePatientCode = () => {
    // Benzersiz hasta kodu oluştur
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const code = `H${timestamp}${random}`;
    
    setPatientCode(code);
  };

  const handleConfirmPatientCode = () => {
    if (!patientCode.trim()) {
      alert('Lütfen hasta kodu girin veya "Yeni Hasta" butonuna tıklayın!');
      return;
    }

    // Hasta kodunu kontrol et veya yeni hasta oluştur
    const allPatients = JSON.parse(localStorage.getItem('olcekPatients') || '[]');
    let patient = allPatients.find(p => p.code === patientCode && p.institutionId === institution.id);

    if (!patient) {
      // Yeni hasta oluştur
      patient = {
        id: Date.now().toString(),
        code: patientCode,
        institutionId: institution.id,
        doctorId: currentUser.id,
        doctorName: currentUser.name,
        createdAt: new Date().toISOString(),
        requestedForms: [],
        completedForms: []
      };

      allPatients.push(patient);
      localStorage.setItem('olcekPatients', JSON.stringify(allPatients));
    }

    setCurrentPatient(patient);
    setRequestedForms(patient.requestedForms || []);
    setCompletedForms(patient.completedForms || []);
    setIsPatientActive(true);
  };

  const handleFormDoubleClick = (form) => {
    if (!isPatientActive) {
      alert('Önce hasta kodu onaylamalısınız!');
      return;
    }

    // Formu istenen formlara ekle
    if (!requestedForms.find(f => f.id === form.id)) {
      const newRequestedForms = [...requestedForms, { ...form, requestedAt: new Date().toISOString() }];
      setRequestedForms(newRequestedForms);
      
      // Hasta kaydını güncelle
      updatePatientForms(newRequestedForms, completedForms);
    }
  };

  const handleDragStart = (e, form) => {
    setDraggedForm(form);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    
    if (!isPatientActive) {
      alert('Önce hasta kodu onaylamalısınız!');
      return;
    }

    if (draggedForm && !requestedForms.find(f => f.id === draggedForm.id)) {
      const newRequestedForms = [...requestedForms, { ...draggedForm, requestedAt: new Date().toISOString() }];
      setRequestedForms(newRequestedForms);
      updatePatientForms(newRequestedForms, completedForms);
    }
    
    setDraggedForm(null);
  };

  const updatePatientForms = (requested, completed) => {
    const allPatients = JSON.parse(localStorage.getItem('olcekPatients') || '[]');
    const updatedPatients = allPatients.map(p => 
      p.code === patientCode && p.institutionId === institution.id
        ? { ...p, requestedForms: requested, completedForms: completed }
        : p
    );
    localStorage.setItem('olcekPatients', JSON.stringify(updatedPatients));
  };

  const handleRemoveRequestedForm = (formId) => {
    const newRequestedForms = requestedForms.filter(f => f.id !== formId);
    setRequestedForms(newRequestedForms);
    updatePatientForms(newRequestedForms, completedForms);
  };

  const handleResetPatient = () => {
    setPatientCode('');
    setIsPatientActive(false);
    setCurrentPatient(null);
    setRequestedForms([]);
    setCompletedForms([]);
  };

  const handleShowResult = (form) => {
    // Tamamlanmış form için tüm uygulamaları bul (hasta kodu ile)
    const allApplications = JSON.parse(localStorage.getItem('olcekApplications') || '[]');
    const patientApplications = allApplications.filter(
      app => app.patientId === currentPatient.code && 
             app.scaleId === form.id &&
             app.institutionId === institution.id
    );

    setSelectedResult({
      form: form,
      applications: patientApplications.sort((a, b) => new Date(b.date) - new Date(a.date)),
      currentApplication: patientApplications[0] // En son test
    });
    setSelectedHistoryTest(patientApplications[0]);
    setOpenResultDialog(true);
  };

  const handleZoomColumn = (columnType) => {
    setZoomColumn(columnType);
    setZoomDialogOpen(true);
  };

  const renderFormAnswers = (application) => {
    if (!application || !application.answers) return null;

    return (
      <Box>
        {application.answers.map((answer, index) => (
          <Box key={index} sx={{ mb: 2, p: 2, bgcolor: '#f9f9f9', borderRadius: 1 }}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              {index + 1}. {answer.question}
            </Typography>
            <Typography variant="body2" color="primary">
              ✓ Cevap: {answer.answer}
            </Typography>
            {answer.score !== undefined && (
              <Typography variant="caption" color="text.secondary">
                Puan: {answer.score}
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    );
  };

  const renderResultsTable = () => {
    if (!selectedResult) return null;

    const cutoffScore = selectedResult.form.cutoffScore || 0;

    return (
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Tarih</strong></TableCell>
              <TableCell><strong>Puan</strong></TableCell>
              <TableCell><strong>Kesme Puanı: {cutoffScore}</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {selectedResult.applications.map((app) => {
              const isAbnormal = app.totalScore > cutoffScore;
              return (
                <TableRow 
                  key={app.id}
                  sx={{ 
                    cursor: 'pointer',
                    bgcolor: selectedHistoryTest?.id === app.id ? '#e3f2fd' : 'inherit',
                    '&:hover': { bgcolor: '#f5f5f5' }
                  }}
                  onClick={() => setSelectedHistoryTest(app)}
                >
                  <TableCell>{new Date(app.date).toLocaleDateString('tr-TR')}</TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      fontWeight="bold"
                      color={isAbnormal ? 'error' : 'inherit'}
                    >
                      {app.totalScore}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {isAbnormal && <Chip label="Anormal" color="error" size="small" />}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderChart = () => {
    if (!selectedResult || !selectedResult.applications.length) return null;

    const chartData = selectedResult.applications
      .map(app => ({
        date: new Date(app.date).toLocaleDateString('tr-TR'),
        puan: app.totalScore,
        timestamp: new Date(app.date).getTime()
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis label={{ value: 'Şiddet (Puan)', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="puan" 
            stroke="#8884d8" 
            strokeWidth={2}
            dot={{ r: 5 }}
            activeDot={{ r: 8 }}
            name="Puan"
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  // Menü öğeleri (Fotoğrafa göre)
  const menuItems = [
    { text: 'Anasayfa', icon: <HomeIcon /> },
    { text: 'Uygulanmış Testler', icon: <AssessmentIcon /> },
    { text: 'Kurum Yönetimi', icon: <PersonAddIcon />, submenu: ['Şimdilikler', 'Kullanıcılar'], adminOnly: true },
    { text: 'Kurum Raporları', icon: <AssessmentIcon />, submenu: ['Kurum Kullanım Tst', 'Kullanıcı Kullanımı', 'Hastalar', 'Uygulanmış Testler'], adminOnly: true },
    { text: 'Yardım', icon: <HistoryIcon /> },
    { text: 'Kişisel Ayarlar', icon: <PersonIcon /> }
  ];

  const filteredMenuItems = menuItems.filter(item => !item.adminOnly || currentUser.role === 'admin');

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sol Sidebar - Menü (Sütun 1) */}
      <Drawer
        variant="permanent"
        sx={{
          width: 260,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 260,
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ p: 2, bgcolor: '#1976d2', color: 'white' }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
            PQU
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', opacity: 0.9 }}>
            {institution.name}
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', opacity: 0.8 }}>
            {currentUser.name}
          </Typography>
        </Box>
        <Divider />
        <List sx={{ flexGrow: 1 }}>
          {filteredMenuItems.map((item) => (
            <React.Fragment key={item.text}>
              <ListItem disablePadding>
                <ListItemButton
                  selected={selectedMenu === item.text}
                  onClick={() => setSelectedMenu(item.text)}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    primaryTypographyProps={{ 
                      fontSize: '0.95rem',
                      fontWeight: selectedMenu === item.text ? 600 : 400
                    }}
                  />
                </ListItemButton>
              </ListItem>
              {item.submenu && (
                <List component="div" disablePadding>
                  {item.submenu.map((subitem) => (
                    <ListItem key={subitem} disablePadding>
                      <ListItemButton sx={{ pl: 6 }}>
                        <ListItemText 
                          primary={`↳ ${subitem}`}
                          primaryTypographyProps={{ 
                            fontSize: '0.85rem',
                            color: 'text.secondary'
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              )}
            </React.Fragment>
          ))}
        </List>
        <Divider />
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={onLogout}>
              <ListItemIcon sx={{ minWidth: 40 }}><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Çıkış" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      {/* Ana İçerik Alanı */}
      <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {/* Header */}
        <AppBar position="static" elevation={1} sx={{ bgcolor: 'white', color: 'text.primary' }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              PQU - Psikolojik Ölçek Uygulaması
            </Typography>
            <Chip 
              label={currentUser.role === 'admin' ? 'Yönetici' : 'Kullanıcı'} 
              color={currentUser.role === 'admin' ? 'error' : 'primary'}
              size="small"
              sx={{ mr: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              {selectedMenu}
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Anasayfa İçeriği */}
        {selectedMenu === 'Anasayfa' && (
          <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
            <Grid container spacing={0} sx={{ height: '100%' }}>
              {/* Orta Sütun: Formlar */}
              <Grid item xs={12} md={5} sx={{ borderRight: '2px solid #e0e0e0' }}>
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ p: 2, bgcolor: '#1976d2', color: 'white' }}>
                    <Typography variant="h6" fontWeight="bold">
                      Formlar
                    </Typography>
                  </Box>
                  <List sx={{ flexGrow: 1, overflow: 'auto', bgcolor: 'white' }}>
                    {availableForms.map((form, index) => (
                      <ListItem
                        key={form.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, form)}
                        onDoubleClick={() => handleFormDoubleClick(form)}
                        sx={{
                          cursor: 'grab',
                          '&:hover': {
                            bgcolor: '#f5f5f5'
                          },
                          borderBottom: '1px solid #e0e0e0',
                          py: 2
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="body1">
                              {index + 1}) {form.name}
                            </Typography>
                          }
                          secondary={form.description}
                        />
                        <IconButton size="small">
                          <DragIndicatorIcon />
                        </IconButton>
                      </ListItem>
                    ))}
                    {availableForms.length === 0 && (
                      <Box sx={{ p: 4, textAlign: 'center' }}>
                        <DescriptionIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                        <Typography color="text.secondary">
                          Henüz form eklenmemiş
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          Yönetici tarafından form eklenebilir
                        </Typography>
                      </Box>
                    )}
                  </List>
                </Box>
              </Grid>

              {/* Sağ Sütun: Hasta Kodları (Query) */}
              <Grid item xs={12} md={7}>
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'white' }}>
                  {/* Başlık */}
                  <Box sx={{ p: 2, bgcolor: '#1976d2', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6" fontWeight="bold">
                      Hasta Kodları - Query
                    </Typography>
                  </Box>

                  {/* Hasta Kodu Giriş Alanı */}
                  <Box sx={{ p: 3, borderBottom: '2px solid #e0e0e0' }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={5}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Hasta Kodu"
                          value={patientCode}
                          onChange={(e) => setPatientCode(e.target.value)}
                          disabled={isPatientActive}
                          placeholder="Hasta kodu girin"
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Button
                          fullWidth
                          size="small"
                          variant="outlined"
                          onClick={generatePatientCode}
                          disabled={isPatientActive}
                        >
                          Yeni Hasta
                        </Button>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        {!isPatientActive ? (
                          <Button
                            fullWidth
                            size="small"
                            variant="contained"
                            onClick={handleConfirmPatientCode}
                          >
                            Onayla
                          </Button>
                        ) : (
                          <Button
                            fullWidth
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={handleResetPatient}
                          >
                            Sıfırla
                          </Button>
                        )}
                      </Grid>
                    </Grid>
                    {isPatientActive && currentPatient && (
                      <Box sx={{ mt: 2, p: 1.5, bgcolor: '#e8f5e9', borderRadius: 1 }}>
                        <Typography variant="body2" color="success.dark">
                          ✓ Hasta Kodu: <strong>{currentPatient.code}</strong>
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* İki Sütun: İstenecekler ve Yapılanlar */}
                  <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
                    {/* Sol: İstenecekler */}
                    <Box 
                      sx={{ 
                        width: '50%', 
                        borderRight: '1px solid #e0e0e0',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      <Box sx={{ p: 1.5, bgcolor: '#fff3e0', borderBottom: '1px solid #e0e0e0' }}>
                        <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                          İstenecekler
                        </Typography>
                      </Box>
                      <List sx={{ flexGrow: 1, overflow: 'auto', p: 0 }}>
                        {requestedForms.map((form) => (
                          <ListItem
                            key={form.id}
                            secondaryAction={
                              <IconButton edge="end" size="small" onClick={() => handleRemoveRequestedForm(form.id)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            }
                            sx={{ 
                              borderBottom: '1px solid #f0f0f0',
                              '&:hover': { bgcolor: '#fafafa' }
                            }}
                          >
                            <ListItemText
                              primary={<Typography variant="body2">{form.name}</Typography>}
                              secondary={
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(form.requestedAt).toLocaleDateString('tr-TR')}
                                </Typography>
                              }
                            />
                          </ListItem>
                        ))}
                        {requestedForms.length === 0 && (
                          <Box sx={{ p: 3, textAlign: 'center' }}>
                            {isPatientActive ? (
                              <>
                                <SendIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                                <Typography variant="body2" color="text.secondary">
                                  Henüz form eklenmedi
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Formları sürükleyip buraya bırakın
                                </Typography>
                              </>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                Hasta kodu onaylanmalı
                              </Typography>
                            )}
                          </Box>
                        )}
                      </List>
                    </Box>

                    {/* Sağ: Yapılanlar */}
                    <Box sx={{ width: '50%', display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ p: 1.5, bgcolor: '#e8f5e9', borderBottom: '1px solid #e0e0e0' }}>
                        <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                          Yapılanlar
                        </Typography>
                      </Box>
                      <List sx={{ flexGrow: 1, overflow: 'auto', p: 0 }}>
                        {completedForms.map((form) => (
                          <ListItem
                            key={form.id}
                            sx={{ 
                              borderBottom: '1px solid #f0f0f0',
                              '&:hover': { bgcolor: '#fafafa' }
                            }}
                          >
                            <ListItemText
                              primary={<Typography variant="body2">{form.name}</Typography>}
                              secondary={
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(form.completedAt).toLocaleDateString('tr-TR')}
                                </Typography>
                              }
                            />
                            <Button 
                              size="small" 
                              variant="outlined" 
                              color="primary"
                              onClick={() => handleShowResult(form)}
                            >
                              Sonuç Göster
                            </Button>
                          </ListItem>
                        ))}
                        {completedForms.length === 0 && (
                          <Box sx={{ p: 3, textAlign: 'center' }}>
                            <CheckCircleIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              Tamamlanmış form yok
                            </Typography>
                          </Box>
                        )}
                      </List>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Uygulanmış Testler */}
        {selectedMenu === 'Uygulanmış Testler' && (
          <Box sx={{ p: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Uygulanmış Testler
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Hasta Kodu</strong></TableCell>
                        <TableCell><strong>Test Adı</strong></TableCell>
                        <TableCell><strong>Tarih</strong></TableCell>
                        <TableCell><strong>Durum</strong></TableCell>
                        <TableCell><strong>İşlem</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {applications.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell>{app.patientId}</TableCell>
                          <TableCell>{app.scaleName}</TableCell>
                          <TableCell>
                            {new Date(app.date).toLocaleDateString('tr-TR')}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={
                                app.status === 'completed' ? 'Tamamlandı' : 
                                app.status === 'in-progress' ? 'Devam Ediyor' :
                                'Bekliyor'
                              }
                              color={
                                app.status === 'completed' ? 'success' : 
                                app.status === 'in-progress' ? 'info' :
                                'warning'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {app.status === 'completed' && (
                              <Button size="small" variant="outlined">
                                Sonuçları Gör
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {applications.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            <Box sx={{ py: 4 }}>
                              <AssessmentIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                              <Typography color="text.secondary">
                                Henüz uygulanmış test bulunmuyor
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Kurum Raporları (Sadece Admin) */}
        {selectedMenu === 'Kurum Raporları' && currentUser.role === 'admin' && (
          <Box sx={{ p: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Kurum Raporları
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Button variant="contained" startIcon={<AssessmentIcon />} sx={{ mr: 2 }}>
                  Toplu Veri İndir (Excel)
                </Button>
                <Button variant="outlined" startIcon={<AssessmentIcon />}>
                  PDF Rapor Oluştur
                </Button>
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    Kurum genelindeki tüm verileri indirebilir ve raporlayabilirsiniz.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Kurum Yönetimi (Sadece Admin) */}
        {selectedMenu === 'Kurum Yönetimi' && currentUser.role === 'admin' && (
          <Box sx={{ p: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Kurum Yönetimi
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Typography variant="body1" color="text.secondary">
                  Kurum ayarları ve yönetim paneli buraya eklenecek.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Yardım */}
        {selectedMenu === 'Yardım' && (
          <Box sx={{ p: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Yardım
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Typography variant="body1" paragraph>
                  <strong>Nasıl Kullanılır?</strong>
                </Typography>
                <Typography variant="body2" paragraph>
                  1. Sol menüden "Anasayfa"yı seçin
                </Typography>
                <Typography variant="body2" paragraph>
                  2. Sağ üstten hasta kodu girin veya "Yeni Hasta" ile kod oluşturun
                </Typography>
                <Typography variant="body2" paragraph>
                  3. "Onayla" butonuna tıklayın
                </Typography>
                <Typography variant="body2" paragraph>
                  4. Ortadaki formları sürükleyip "İstenecekler" bölümüne bırakın
                </Typography>
                <Typography variant="body2" paragraph>
                  5. Hasta formu doldurduğunda "Yapılanlar" bölümünde görünecektir
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Kişisel Ayarlar */}
        {selectedMenu === 'Kişisel Ayarlar' && (
          <Box sx={{ p: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Kişisel Ayarlar
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Kullanıcı Adı"
                      value={currentUser.username}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Ad Soyad"
                      value={currentUser.name}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Rol"
                      value={currentUser.role === 'admin' ? 'Yönetici' : currentUser.role === 'doktor' ? 'Doktor' : 'Kullanıcı'}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Kurum"
                      value={institution.name}
                      disabled
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        )}


      </Box>

      {/* Sonuç Gösterme Dialog */}
      <Dialog 
        open={openResultDialog} 
        onClose={() => setOpenResultDialog(false)}
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {selectedResult?.form.name} - Test Sonuçları
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Hasta Kodu: {currentPatient?.code}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* 1. Sütun: Doldurulan Form */}
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Form Cevapları
                    </Typography>
                    <IconButton size="small" onClick={() => handleZoomColumn('form')}>
                      <ZoomInIcon />
                    </IconButton>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {selectedHistoryTest && renderFormAnswers(selectedHistoryTest)}
                  </Box>
                  {selectedHistoryTest && (
                    <Box sx={{ mt: 2, p: 1.5, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                      <Typography variant="body2">
                        <strong>Toplam Puan:</strong> {selectedHistoryTest.totalScore}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Tarih: {new Date(selectedHistoryTest.date).toLocaleDateString('tr-TR')}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* 2. Sütun: Sonuçlar Tablosu */}
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Test Geçmişi
                    </Typography>
                    <IconButton size="small" onClick={() => handleZoomColumn('table')}>
                      <ZoomInIcon />
                    </IconButton>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {renderResultsTable()}
                  </Box>
                  <Box sx={{ mt: 2, p: 1.5, bgcolor: '#fff3e0', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      💡 Tablodaki bir teste tıklayarak o tarihteki cevapları görebilirsiniz.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* 3. Sütun: Grafik */}
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Grafik Görünümü
                    </Typography>
                    <IconButton size="small" onClick={() => handleZoomColumn('chart')}>
                      <ZoomInIcon />
                    </IconButton>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  {renderChart()}
                  <Box sx={{ mt: 2, p: 1.5, bgcolor: '#e8f5e9', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      📊 Grafikte hastanın zaman içindeki gelişimi görülmektedir.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenResultDialog(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>

      {/* Büyütme Dialog */}
      <Dialog
        open={zoomDialogOpen}
        onClose={() => setZoomDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {zoomColumn === 'form' && 'Form Cevapları - Detaylı Görünüm'}
          {zoomColumn === 'table' && 'Test Geçmişi - Detaylı Görünüm'}
          {zoomColumn === 'chart' && 'Grafik - Detaylı Görünüm'}
        </DialogTitle>
        <DialogContent>
          {zoomColumn === 'form' && (
            <Box sx={{ p: 2 }}>
              {selectedHistoryTest && renderFormAnswers(selectedHistoryTest)}
              {selectedHistoryTest && (
                <Box sx={{ mt: 3, p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                  <Typography variant="h6">
                    <strong>Toplam Puan:</strong> {selectedHistoryTest.totalScore}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tarih: {new Date(selectedHistoryTest.date).toLocaleDateString('tr-TR')}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
          
          {zoomColumn === 'table' && (
            <Box sx={{ p: 2 }}>
              {renderResultsTable()}
              <Box sx={{ mt: 3, p: 2, bgcolor: '#fff3e0', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  💡 Tablodaki bir teste tıklayarak o tarihteki cevapları sol tarafta görebilirsiniz.
                </Typography>
              </Box>
            </Box>
          )}
          
          {zoomColumn === 'chart' && (
            <Box sx={{ p: 2, height: 500 }}>
              {renderChart()}
              <Box sx={{ mt: 3, p: 2, bgcolor: '#e8f5e9', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  📊 Bu grafikte hastanın zaman içindeki test puanlarındaki değişim görülmektedir.
                  Y ekseni puanları, X ekseni ise tarihleri göstermektedir.
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setZoomDialogOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default DoktorEkrani;
