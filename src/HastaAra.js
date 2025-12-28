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
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import AssessmentIcon from '@mui/icons-material/Assessment';
import NoteIcon from '@mui/icons-material/Note';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const HastaAra = () => {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [documentPreview, setDocumentPreview] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentPopup, setDocumentPopup] = useState(null);
  
  // Ölçek sonuç gösterme için state'ler
  const [selectedScaleResult, setSelectedScaleResult] = useState(null);
  const [openScaleResultDialog, setOpenScaleResultDialog] = useState(false);
  const [zoomDialogOpen, setZoomDialogOpen] = useState(false);
  const [zoomColumn, setZoomColumn] = useState(null);
  const [selectedHistoryTest, setSelectedHistoryTest] = useState(null);

  useEffect(() => {
    loadData();
    
    const onPatientsUpdated = () => loadData();
    const onAppointmentsUpdated = () => loadData();
    
    window.addEventListener('patientsUpdated', onPatientsUpdated);
    window.addEventListener('appointmentsUpdated', onAppointmentsUpdated);
    
    return () => {
      window.removeEventListener('patientsUpdated', onPatientsUpdated);
      window.removeEventListener('appointmentsUpdated', onAppointmentsUpdated);
    };
  }, []);

  const loadData = () => {
    const storedPatients = JSON.parse(localStorage.getItem('patients') || '[]');
    const storedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    setPatients(storedPatients);
    setAppointments(storedAppointments);
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

  const filteredPatients = patients.filter(patient => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      patient.name?.toLowerCase().includes(query) ||
      patient.tcNo?.toLowerCase().includes(query) ||
      patient.phone?.toLowerCase().includes(query) ||
      patient.parentName?.toLowerCase().includes(query) ||
      patient.parentPhone?.toLowerCase().includes(query)
    );
  });

  const handleOpenPatientFile = (patient) => {
    setSelectedPatient(patient);
    setTabValue(0);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPatient(null);
    setTabValue(0);
    setDocumentPreview(null);
    setSelectedDocument(null);
    setDocumentPopup(null);
  };

  const getPatientAppointments = (patientName) => {
    return appointments.filter(apt => apt.name === patientName);
  };

  const getPatientNotes = (patientName) => {
    const patientAppts = appointments.filter(apt => apt.name === patientName);
    const notes = [];
    patientAppts.forEach(apt => {
      if (apt.notesHistory && Array.isArray(apt.notesHistory)) {
        apt.notesHistory.forEach(note => {
          notes.push({
            ...note,
            appointmentDate: apt.date,
            appointmentTime: apt.timeSlot
          });
        });
      }
    });
    return notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const getPatientDocuments = (patientName) => {
    const patientAppts = appointments.filter(apt => apt.name === patientName);
    const docs = [];
    patientAppts.forEach(apt => {
      if (apt.documents && Array.isArray(apt.documents)) {
        apt.documents.forEach(doc => {
          docs.push({
            ...doc,
            appointmentDate: apt.date
          });
        });
      }
    });
    return docs.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
  };

  const getPatientScales = (patientName) => {
    const patientAppts = appointments.filter(apt => apt.name === patientName);
    const scales = [];
    patientAppts.forEach(apt => {
      if (apt.scaleResults && Array.isArray(apt.scaleResults)) {
        apt.scaleResults.forEach(scale => {
          scales.push({
            ...scale,
            appointmentDate: apt.date
          });
        });
      }
    });
    return scales.sort((a, b) => new Date(b.completedDate || b.date) - new Date(a.completedDate || a.date));
  };

  const handleDocumentClick = (doc) => {
    setSelectedDocument(doc);
    setDocumentPreview(doc);
  };

  const handleDocumentDoubleClick = (doc) => {
    setDocumentPopup(doc);
  };

  const handleDownloadDocument = (doc) => {
    if (doc.data) {
      const link = document.createElement('a');
      link.href = doc.data;
      link.download = doc.name;
      link.click();
    }
  };

  const handleDeleteNote = (noteId) => {
    if (window.confirm('Bu notu silmek istediğinizden emin misiniz?')) {
      const updatedAppointments = appointments.map(apt => {
        if (apt.name === selectedPatient.name && apt.notesHistory) {
          return {
            ...apt,
            notesHistory: apt.notesHistory.filter(note => note.id !== noteId)
          };
        }
        return apt;
      });
      localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
      setAppointments(updatedAppointments);
      window.dispatchEvent(new Event('appointmentsUpdated'));
    }
  };

  const handleShowScaleResult = (scaleId) => {
    if (!selectedPatient) return;
    
    const institutionData = JSON.parse(localStorage.getItem('olcekInstitution') || 'null');
    const allApplications = JSON.parse(localStorage.getItem('olcekApplications') || '[]');
    const allScales = JSON.parse(localStorage.getItem('olcekScales') || '[]');
    
    const scale = allScales.find(s => s.id === scaleId);
    if (!scale) {
      alert('Ölçek bilgisi bulunamadı.');
      return;
    }
    
    const patientApplications = allApplications.filter(
      app => {
        const matchPatient = app.patientId === selectedPatient.code || app.patientId === selectedPatient.id || app.patientId === selectedPatient.tcNo;
        const matchScale = app.scaleId === scaleId;
        const matchStatus = app.status === 'completed';
        const matchInstitution = !institutionData || app.institutionId === institutionData.id;
        
        return matchPatient && matchScale && matchStatus && matchInstitution;
      }
    ).sort((a, b) => new Date(b.completedDate) - new Date(a.completedDate));
    
    if (patientApplications.length === 0) {
      alert('Bu ölçek için tamamlanmış test bulunmuyor.');
      return;
    }
    
    setSelectedScaleResult({ scale, applications: patientApplications });
    setSelectedHistoryTest(patientApplications[0]);
    setOpenScaleResultDialog(true);
  };

  const handleZoomColumn = (columnType) => {
    setZoomColumn(columnType);
    setZoomDialogOpen(true);
  };

  const renderFormAnswers = (application) => {
    if (!application || !application.answers) {
      return <Typography color="text.secondary">Cevap bulunamadı</Typography>;
    }

    const scale = selectedScaleResult.scale;
    const questions = scale.questions || [];

    return (
      <Box>
        {questions.map((question, idx) => {
          const answer = application.answers[idx];
          return (
            <Box key={idx} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                {idx + 1}. {question.text}
              </Typography>
              <Typography variant="body2" color="primary">
                Cevap: {answer !== undefined ? answer : 'Cevaplanmadı'}
                {question.options && question.options[answer] && (
                  <> - {question.options[answer].text}</>
                )}
              </Typography>
              {question.options && question.options[answer] && question.options[answer].score !== undefined && (
                <Typography variant="caption" color="text.secondary">
                  Puan: {question.options[answer].score}
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>
    );
  };

  const renderResultsTable = () => {
    if (!selectedScaleResult || !selectedScaleResult.applications) return null;

    const scale = selectedScaleResult.scale;
    const cutoffScore = scale.cutoffScore || 0;

    return (
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Tarih</strong></TableCell>
              <TableCell><strong>Puan</strong></TableCell>
              <TableCell><strong>Durum</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {selectedScaleResult.applications.map((app, idx) => {
              const isAbnormal = cutoffScore > 0 && app.totalScore >= cutoffScore;
              return (
                <TableRow 
                  key={idx}
                  hover
                  onClick={() => setSelectedHistoryTest(app)}
                  sx={{ 
                    cursor: 'pointer',
                    bgcolor: selectedHistoryTest?.id === app.id ? 'action.selected' : 'inherit'
                  }}
                >
                  <TableCell>{new Date(app.completedDate).toLocaleDateString('tr-TR')}</TableCell>
                  <TableCell sx={{ color: isAbnormal ? 'error.main' : 'inherit', fontWeight: isAbnormal ? 'bold' : 'normal' }}>
                    {app.totalScore}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={isAbnormal ? 'Anormal' : 'Normal'} 
                      color={isAbnormal ? 'error' : 'success'} 
                      size="small"
                    />
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
    if (!selectedScaleResult || !selectedScaleResult.applications) return null;

    const chartData = selectedScaleResult.applications
      .map(app => ({
        date: new Date(app.completedDate).toLocaleDateString('tr-TR'),
        puan: app.totalScore,
        timestamp: new Date(app.completedDate).getTime()
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
          <Line type="monotone" dataKey="puan" stroke="#8884d8" strokeWidth={2} dot={{ r: 5 }} name="Puan" />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const handleDeleteDocument = (docId) => {
    if (window.confirm('Bu dokümanı silmek istediğinizden emin misiniz?')) {
      const updatedAppointments = appointments.map(apt => {
        if (apt.name === selectedPatient.name && apt.documents) {
          return {
            ...apt,
            documents: apt.documents.filter(doc => doc.id !== docId)
          };
        }
        return apt;
      });
      localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
      setAppointments(updatedAppointments);
      window.dispatchEvent(new Event('appointmentsUpdated'));
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2, width: 56, height: 56 }}>
                  <PersonSearchIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="h2" fontWeight="bold">
                    Hasta Arama ve Dosyalar
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {filteredPatients.length} hasta bulundu
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />

            {/* Arama Alanı */}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                placeholder="Hasta adı, TC No, telefon veya veli bilgisi ile ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ bgcolor: 'background.paper' }}
              />
            </Box>

            {/* Hasta Listesi */}
            {filteredPatients.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell><strong>Ad Soyad</strong></TableCell>
                      <TableCell><strong>TC No</strong></TableCell>
                      <TableCell><strong>Yaş</strong></TableCell>
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
                        <TableCell>{calculateAge(patient.birthDate)}</TableCell>
                        <TableCell>{patient.phone}</TableCell>
                        <TableCell>{patient.parentName || '-'}</TableCell>
                        <TableCell align="center">
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<FolderOpenIcon />}
                            onClick={() => handleOpenPatientFile(patient)}
                            sx={{
                              background: 'linear-gradient(90deg, #061161 0%, #780206 100%)',
                              '&:hover': {
                                background: 'linear-gradient(90deg, #050d4d 0%, #5f0105 100%)',
                              }
                            }}
                          >
                            Dosya Görüntüle
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
                  {searchQuery ? 'Arama kriterlerine uygun hasta bulunamadı.' : 'Henüz hasta kaydı bulunmamaktadır.'}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Hasta Dosyası Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: { height: '90vh' }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">
              {selectedPatient?.name} - Hasta Dosyası
            </Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedPatient && (
            <Box>
              {/* Hasta Bilgileri */}
              <Paper sx={{ p: 2, mb: 2, bgcolor: 'action.hover' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">TC No</Typography>
                    <Typography variant="body1" fontWeight="bold">{selectedPatient.tcNo || '-'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Doğum Tarihi</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedPatient.birthDate ? new Date(selectedPatient.birthDate).toLocaleDateString('tr-TR') : '-'} 
                      ({calculateAge(selectedPatient.birthDate)} yaş)
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Cinsiyet</Typography>
                    <Typography variant="body1" fontWeight="bold">{selectedPatient.gender || '-'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Telefon</Typography>
                    <Typography variant="body1" fontWeight="bold">{selectedPatient.phone}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Veli Adı</Typography>
                    <Typography variant="body1" fontWeight="bold">{selectedPatient.parentName || '-'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Veli Telefon</Typography>
                    <Typography variant="body1" fontWeight="bold">{selectedPatient.parentPhone || '-'}</Typography>
                  </Grid>
                  {selectedPatient.address && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Adres</Typography>
                      <Typography variant="body1" fontWeight="bold">{selectedPatient.address}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>

              {/* Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                  <Tab 
                    icon={<NoteIcon />} 
                    label="Muayene Notları" 
                    iconPosition="start"
                  />
                  <Tab 
                    icon={<DescriptionIcon />} 
                    label="Dokümanlar" 
                    iconPosition="start"
                  />
                  <Tab 
                    icon={<AssessmentIcon />} 
                    label="Ölçekler" 
                    iconPosition="start"
                  />
                </Tabs>
              </Box>

              {/* Muayene Notları */}
              {tabValue === 0 && (
                <Box>
                  {getPatientNotes(selectedPatient.name).length > 0 ? (
                    <List>
                      {getPatientNotes(selectedPatient.name).map((note) => (
                        <Paper key={note.id} sx={{ p: 2, mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">
                                  {note.createdAt || new Date(note.date).toLocaleString('tr-TR')}
                                </Typography>
                                <Chip 
                                  label={note.author || 'Bilinmiyor'} 
                                  size="small" 
                                  color="primary" 
                                  variant="outlined"
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                Randevu: {note.appointmentDate} - {note.appointmentTime}
                              </Typography>
                            </Box>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDeleteNote(note.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                          <Typography variant="body1">{note.text}</Typography>
                        </Paper>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Henüz muayene notu bulunmamaktadır.
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              {/* Dokümanlar */}
              {tabValue === 1 && (
                <Box>
                  <Grid container spacing={2}>
                    {/* Doküman Listesi */}
                    <Grid item xs={12} md={documentPreview ? 7 : 12}>
                      {getPatientDocuments(selectedPatient.name).length > 0 ? (
                        <List>
                          {getPatientDocuments(selectedPatient.name).map((doc) => (
                            <ListItem
                              key={doc.id}
                              sx={{
                                bgcolor: selectedDocument?.id === doc.id ? 'action.selected' : 'action.hover',
                                borderRadius: 1,
                                mb: 1,
                                cursor: 'pointer',
                                '&:hover': {
                                  bgcolor: 'action.focus'
                                }
                              }}
                              onClick={() => handleDocumentClick(doc)}
                              onDoubleClick={() => handleDocumentDoubleClick(doc)}
                            >
                              <ListItemIcon>
                                <DescriptionIcon color={doc.type === 'pdf' ? 'error' : 'primary'} />
                              </ListItemIcon>
                              <ListItemText
                                primary={doc.name}
                                secondary={`${new Date(doc.uploadDate).toLocaleString('tr-TR')} • ${doc.type?.toUpperCase()} • ${doc.size || ''}`}
                              />
                              <IconButton
                                size="small"
                                color="error"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteDocument(doc.id);
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                          Henüz doküman bulunmamaktadır.
                        </Typography>
                      )}
                    </Grid>

                    {/* Önizleme Paneli */}
                    {documentPreview && (
                      <Grid item xs={12} md={5}>
                        <Paper elevation={3} sx={{ p: 2, height: '100%', minHeight: 400 }}>
                          <Typography variant="h6" gutterBottom>
                            Önizleme
                          </Typography>
                          <Divider sx={{ mb: 2 }} />
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="subtitle2" gutterBottom>
                              {documentPreview.name}
                            </Typography>
                            {documentPreview.type === 'pdf' ? (
                              <Box>
                                <iframe
                                  src={documentPreview.data}
                                  title="PDF Önizleme"
                                  style={{ width: '100%', height: '350px', border: 'none' }}
                                />
                                <Button
                                  variant="outlined"
                                  size="small"
                                  sx={{ mt: 2 }}
                                  onClick={() => handleDocumentDoubleClick(documentPreview)}
                                >
                                  Tam Ekranda Aç
                                </Button>
                              </Box>
                            ) : (
                              <Box>
                                <img
                                  src={documentPreview.data}
                                  alt={documentPreview.name}
                                  style={{ maxWidth: '100%', maxHeight: '350px', objectFit: 'contain', cursor: 'pointer' }}
                                  onClick={() => handleDocumentDoubleClick(documentPreview)}
                                />
                                <Button
                                  variant="outlined"
                                  size="small"
                                  sx={{ mt: 2 }}
                                  onClick={() => handleDocumentDoubleClick(documentPreview)}
                                >
                                  Tam Ekranda Aç
                                </Button>
                              </Box>
                            )}
                          </Box>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>

                  {/* Doküman Tam Ekran Dialog */}
                  <Dialog
                    open={!!documentPopup}
                    onClose={() => setDocumentPopup(null)}
                    maxWidth="lg"
                    fullWidth
                  >
                    <DialogTitle>
                      {documentPopup?.name}
                      <Typography variant="caption" display="block" color="text.secondary">
                        {documentPopup?.uploadDate} • {documentPopup?.type?.toUpperCase()} • {documentPopup?.size}
                      </Typography>
                    </DialogTitle>
                    <DialogContent>
                      <Box sx={{ textAlign: 'center', minHeight: 500 }}>
                        {documentPopup?.type === 'pdf' ? (
                          <iframe
                            src={documentPopup.data}
                            title="PDF Görüntüleyici"
                            style={{ width: '100%', height: '600px', border: 'none' }}
                          />
                        ) : (
                          <img
                            src={documentPopup?.data}
                            alt={documentPopup?.name}
                            style={{ maxWidth: '100%', maxHeight: '600px', objectFit: 'contain' }}
                          />
                        )}
                      </Box>
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={() => handleDownloadDocument(documentPopup)}>
                        İndir
                      </Button>
                      <Button onClick={() => setDocumentPopup(null)}>
                        Kapat
                      </Button>
                    </DialogActions>
                  </Dialog>
                </Box>
              )}

              {/* Ölçekler */}
              {tabValue === 2 && (
                <Box>
                  {(() => {
                    const institutionData = JSON.parse(localStorage.getItem('olcekInstitution') || 'null');
                    const allApplications = JSON.parse(localStorage.getItem('olcekApplications') || '[]');
                    const allScales = JSON.parse(localStorage.getItem('olcekScales') || '[]');
                    
                    console.log('=== HASTA ARA ÖLÇEK DEBUG ===');
                    console.log('Selected Patient:', selectedPatient);
                    console.log('All Applications:', allApplications);
                    
                    // Tüm olası hasta ID'lerini topla
                    const possibleIds = [
                      selectedPatient.code,
                      selectedPatient.id,
                      selectedPatient.tcNo,
                      selectedPatient.name
                    ].filter(id => id);
                    
                    console.log('Possible IDs:', possibleIds);
                    
                    // Bu hastaya ait tüm ölçek uygulamalarını bul
                    const patientApps = allApplications.filter(app => 
                      possibleIds.includes(app.patientId)
                    );
                    
                    console.log('Patient Apps:', patientApps);
                    
                    // Tamamlanmış ve bekleyen ölçekleri ayır
                    const completedApps = patientApps.filter(app => app.status === 'completed');
                    const pendingApps = patientApps.filter(app => app.status === 'pending');
                    
                    console.log('Completed:', completedApps);
                    console.log('Pending:', pendingApps);
                    
                    // Tamamlanmış ölçekleri grupla ve say
                    const scaleGroups = {};
                    completedApps.forEach(app => {
                      if (!scaleGroups[app.scaleId]) {
                        const scale = allScales.find(s => s.id === app.scaleId);
                        scaleGroups[app.scaleId] = {
                          scaleId: app.scaleId,
                          scaleName: app.scaleName || scale?.name || 'Bilinmeyen Ölçek',
                          count: 0,
                          lastDate: app.completedDate
                        };
                      }
                      scaleGroups[app.scaleId].count++;
                      if (new Date(app.completedDate) > new Date(scaleGroups[app.scaleId].lastDate)) {
                        scaleGroups[app.scaleId].lastDate = app.completedDate;
                      }
                    });
                    
                    const scales = Object.values(scaleGroups);
                    
                    return (
                      <Box>
                        {/* İstenen Ölçekler */}
                        {pendingApps.length > 0 && (
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" gutterBottom color="primary">
                              İstenen Ölçekler
                            </Typography>
                            <List>
                              {pendingApps.map((app) => {
                                const scale = allScales.find(s => s.id === app.scaleId);
                                return (
                                  <Paper key={app.id} sx={{ p: 2, mb: 2, borderLeft: '4px solid', borderColor: 'warning.main' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                      <AssessmentIcon color="warning" sx={{ mr: 1 }} />
                                      <Typography variant="h6">
                                        {app.scaleName || scale?.name || 'Bilinmeyen Ölçek'}
                                      </Typography>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                      Gönderilme: {new Date(app.date).toLocaleString('tr-TR')}
                                    </Typography>
                                    <Box sx={{ mt: 1 }}>
                                      <Chip 
                                        label="Bekliyor" 
                                        color="warning" 
                                        size="small" 
                                      />
                                    </Box>
                                  </Paper>
                                );
                              })}
                            </List>
                          </Box>
                        )}
                        
                        {/* Yapılanlar */}
                        {scales.length > 0 ? (
                          <Box>
                            <Typography variant="h6" gutterBottom color="success.main">
                              Yapılanlar
                            </Typography>
                            <List>
                              {scales.map((scale) => (
                                <Paper key={scale.scaleId} sx={{ p: 2, mb: 2, borderLeft: '4px solid', borderColor: 'success.main' }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box sx={{ flex: 1 }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <AssessmentIcon color="success" sx={{ mr: 1 }} />
                                        <Typography variant="h6">{scale.scaleName}</Typography>
                                      </Box>
                                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                        <Chip 
                                          label={`${scale.count} kez dolduruldu`} 
                                          color="info" 
                                          size="small" 
                                        />
                                        <Chip 
                                          label={`Son: ${new Date(scale.lastDate).toLocaleDateString('tr-TR')}`} 
                                          color="default" 
                                          size="small" 
                                        />
                                      </Box>
                                    </Box>
                                    <Button
                                      variant="contained"
                                      color="primary"
                                      size="small"
                                      onClick={() => handleShowScaleResult(scale.scaleId)}
                                    >
                                      Sonuç Göster
                                    </Button>
                                  </Box>
                                </Paper>
                              ))}
                            </List>
                          </Box>
                        ) : pendingApps.length === 0 ? (
                          <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="body2" color="text.secondary">
                              Henüz ölçek bulunmamaktadır.
                            </Typography>
                          </Box>
                        ) : null}
                      </Box>
                    );
                  })()}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Kapat</Button>
        </DialogActions>
      </Dialog>

      {/* Ölçek Sonuç Göster Dialog */}
      <Dialog
        open={openScaleResultDialog}
        onClose={() => setOpenScaleResultDialog(false)}
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle>
          Test Sonuçları - {selectedScaleResult?.scale?.name}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* 1. Sütun - Form Cevapları */}
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Form Cevapları</Typography>
                    <IconButton onClick={() => handleZoomColumn('answers')} size="small" color="primary">
                      <ZoomInIcon />
                    </IconButton>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {selectedHistoryTest && renderFormAnswers(selectedHistoryTest)}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* 2. Sütun - Test Geçmişi */}
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Test Geçmişi</Typography>
                    <IconButton onClick={() => handleZoomColumn('history')} size="small" color="primary">
                      <ZoomInIcon />
                    </IconButton>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {renderResultsTable()}
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                    * Tablodaki bir satıra tıklayarak o testin cevaplarını görüntüleyebilirsiniz.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* 3. Sütun - Grafik */}
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Grafik</Typography>
                    <IconButton onClick={() => handleZoomColumn('chart')} size="small" color="primary">
                      <ZoomInIcon />
                    </IconButton>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ height: 400 }}>
                    {renderChart()}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenScaleResultDialog(false)} variant="contained">
            Kapat
          </Button>
        </DialogActions>
      </Dialog>

      {/* Zoom Dialog */}
      <Dialog
        open={zoomDialogOpen}
        onClose={() => setZoomDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {zoomColumn === 'answers' && 'Form Cevapları (Büyütülmüş)'}
          {zoomColumn === 'history' && 'Test Geçmişi (Büyütülmüş)'}
          {zoomColumn === 'chart' && 'Grafik (Büyütülmüş)'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {zoomColumn === 'answers' && selectedHistoryTest && (
              <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
                {renderFormAnswers(selectedHistoryTest)}
              </Box>
            )}
            {zoomColumn === 'history' && (
              <Box>
                {renderResultsTable()}
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  * Tablodaki bir satıra tıklayarak o testin cevaplarını görüntüleyebilirsiniz.
                </Typography>
              </Box>
            )}
            {zoomColumn === 'chart' && (
              <Box sx={{ height: 500 }}>
                {renderChart()}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setZoomDialogOpen(false)} variant="contained">
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default HastaAra;
