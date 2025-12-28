import React, { useState } from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Divider,
  Avatar,
  Chip,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Checkbox,
  ListItemButton,
  OutlinedInput
} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HistoryIcon from '@mui/icons-material/History';
import NoteIcon from '@mui/icons-material/Note';
import FolderIcon from '@mui/icons-material/Folder';
import EventIcon from '@mui/icons-material/Event';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const HastaMuayene = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedService, setSelectedService] = useState('');
  const [selectedPersonel, setSelectedPersonel] = useState('');
  const [services, setServices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointmentNotes, setAppointmentNotes] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [appointmentAmount, setAppointmentAmount] = useState('');
  const [activePatient, setActivePatient] = useState(null);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [noteText, setNoteText] = useState('');
  const [selectedViewers, setSelectedViewers] = useState([]);
  const [editingNote, setEditingNote] = useState(null);
  const [editNoteText, setEditNoteText] = useState('');
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentPreview, setDocumentPreview] = useState(null);
  const [documentPopup, setDocumentPopup] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [editServiceIds, setEditServiceIds] = useState([]);
  const [editServiceAmount, setEditServiceAmount] = useState('');
  const [editServiceNotes, setEditServiceNotes] = useState('');
  const fileInputRef = React.useRef(null);

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAppointment(null);
    setAppointmentNotes('');
    setSelectedServiceIds([]);
    setAppointmentAmount('');
  };

  const handleAcceptAppointment = () => {
    if (!appointmentNotes.trim()) {
      alert('Lütfen tedavi notları yazın!');
      return;
    }

    const noteEntry = {
      id: Date.now().toString(),
      text: appointmentNotes,
      author: currentUser?.username || 'Bilinmiyor',
      createdAt: new Date().toLocaleString('tr-TR')
    };

    // Hizmet geçmişi entry'si oluştur
    const serviceHistoryEntry = {
      id: Date.now().toString(),
      serviceIds: selectedServiceIds,
      services: selectedServiceIds.map(id => services.find(s => s.id === id)?.name).filter(Boolean),
      amount: parseFloat(appointmentAmount) || 0,
      employeeName: currentUser?.name || 'Bilinmiyor',
      date: selectedAppointment.date,
      time: selectedAppointment.timeSlot,
      notes: appointmentNotes,
      createdAt: new Date().toLocaleString('tr-TR')
    };

    const updated = appointments.map(apt => {
      if (apt.id === selectedAppointment.id) {
        const prevHistory = Array.isArray(apt.notesHistory) ? apt.notesHistory.slice() : [];
        const newHistory = [...prevHistory, noteEntry]; // old -> new
        const prevServiceHistory = Array.isArray(apt.serviceHistory) ? apt.serviceHistory.slice() : [];
        const newServiceHistory = [...prevServiceHistory, serviceHistoryEntry];
        
        return {
          ...apt,
          status: 'accepted',
          notes: appointmentNotes,
          notesHistory: newHistory,
          serviceHistory: newServiceHistory,
          serviceIds: selectedServiceIds,
          amount: parseFloat(appointmentAmount) || 0,
          acceptedAt: new Date().toLocaleString('tr-TR'),
          acceptedBy: currentUser?.name
        };
      }
      return apt;
    });

    setAppointments(updated);
    localStorage.setItem('appointments', JSON.stringify(updated));
    window.dispatchEvent(new Event('appointmentsUpdated'));

    const personelGelir = JSON.parse(localStorage.getItem('personelGelir') || '[]');
    const newGelir = {
      id: Date.now().toString(),
      appointmentId: selectedAppointment.id,
      employeeId: currentUser?.id,
      employeeName: currentUser?.name,
      patientName: selectedAppointment.name,
      patientPhone: selectedAppointment.phone,
      date: selectedAppointment.date,
      time: selectedAppointment.timeSlot,
      services: selectedServiceIds.map(id => services.find(s => s.id === id)?.name).filter(Boolean),
      notes: appointmentNotes,
      amount: parseFloat(appointmentAmount) || 0,
      createdAt: new Date().toLocaleString('tr-TR')
    };
    personelGelir.push(newGelir);
    localStorage.setItem('personelGelir', JSON.stringify(personelGelir));

    // Update active patient to reflect accepted appointment with notes/services
    const accepted = updated.find(apt => apt.id === selectedAppointment.id);
    setActivePatient(accepted || selectedAppointment);

    alert('Randevu kabul edildi ve kaydedildi.');
    handleCloseDialog();
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setEditServiceIds(service.serviceIds || []);
    setEditServiceAmount(service.amount || '');
    setEditServiceNotes(service.notes || '');
  };

  const handleUpdateService = () => {
    if (!editServiceIds.length) return alert('En az bir hizmet seçin.');
    if (!editServiceAmount) return alert('Tutar girin.');

    const updated = appointments.map(apt => {
      if (apt.id === activePatient.id) {
        const updatedServiceHistory = (apt.serviceHistory || []).map(s =>
          s.id === editingService.id ? {
            ...s,
            serviceIds: editServiceIds,
            services: editServiceIds.map(id => services.find(sv => sv.id === id)?.name).filter(Boolean),
            amount: parseFloat(editServiceAmount) || 0,
            notes: editServiceNotes,
            editedAt: new Date().toLocaleString('tr-TR'),
            editedBy: currentUser?.name
          } : s
        );
        return { ...apt, serviceHistory: updatedServiceHistory };
      }
      return apt;
    });

    setAppointments(updated);
    localStorage.setItem('appointments', JSON.stringify(updated));
    window.dispatchEvent(new Event('appointmentsUpdated'));
    
    const updatedPatient = updated.find(apt => apt.id === activePatient.id);
    setActivePatient(updatedPatient || activePatient);
    setEditingService(null);
    setEditServiceIds([]);
    setEditServiceAmount('');
    setEditServiceNotes('');
    alert('Hizmet güncellendi.');
  };

  const handleDeleteService = (serviceId) => {
    if (!window.confirm('Bu hizmet kaydını silmek istediğinizden emin misiniz?')) return;
    
    const updated = appointments.map(apt => {
      if (apt.id === activePatient.id) {
        const filteredServices = (apt.serviceHistory || []).filter(s => s.id !== serviceId);
        return { ...apt, serviceHistory: filteredServices };
      }
      return apt;
    });

    setAppointments(updated);
    localStorage.setItem('appointments', JSON.stringify(updated));
    window.dispatchEvent(new Event('appointmentsUpdated'));
    
    const updatedPatient = updated.find(apt => apt.id === activePatient.id);
    setActivePatient(updatedPatient || activePatient);
    alert('Hizmet kaydı silindi.');
  };

  const handleSaveNotes = () => {
    if (!activePatient) return alert('Bir hasta seçin.');
    if (!noteText.trim()) return alert('Kaydetmek için not girin.');

    const noteEntry = { 
      id: Date.now().toString(), 
      text: noteText, 
      author: currentUser?.username || 'Bilinmiyor', 
      createdAt: new Date().toLocaleString('tr-TR'),
      viewers: selectedViewers
    };

    const updated = appointments.map(apt => {
      if (apt.id === activePatient.id) {
        const prev = Array.isArray(apt.notesHistory) ? apt.notesHistory.slice() : [];
        return { ...apt, notesHistory: [...prev, noteEntry], notes: noteText };
      }
      return apt;
    });

    setAppointments(updated);
    localStorage.setItem('appointments', JSON.stringify(updated));
    window.dispatchEvent(new Event('appointmentsUpdated'));
    
    // Update activePatient with new note
    const updatedPatient = updated.find(apt => apt.id === activePatient.id);
    setActivePatient(updatedPatient || activePatient);
    setNoteText('');
    setSelectedViewers([]);
    alert('Not kaydedildi.');
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setEditNoteText(note.text);
  };

  const handleUpdateNote = () => {
    if (!editNoteText.trim()) return alert('Not boş olamaz.');
    
    const updated = appointments.map(apt => {
      if (apt.id === activePatient.id) {
        const updatedNotes = apt.notesHistory.map(n => 
          n.id === editingNote.id ? { ...n, text: editNoteText, editedAt: new Date().toLocaleString('tr-TR'), editedBy: currentUser?.name } : n
        );
        return { ...apt, notesHistory: updatedNotes };
      }
      return apt;
    });

    setAppointments(updated);
    localStorage.setItem('appointments', JSON.stringify(updated));
    window.dispatchEvent(new Event('appointmentsUpdated'));
    
    const updatedPatient = updated.find(apt => apt.id === activePatient.id);
    setActivePatient(updatedPatient || activePatient);
    setEditingNote(null);
    setEditNoteText('');
    alert('Not güncellendi.');
  };

  const handleDeleteNote = (noteId) => {
    if (!window.confirm('Bu notu silmek istediğinizden emin misiniz?')) return;
    
    const updated = appointments.map(apt => {
      if (apt.id === activePatient.id) {
        const filteredNotes = apt.notesHistory.filter(n => n.id !== noteId);
        return { ...apt, notesHistory: filteredNotes };
      }
      return apt;
    });

    setAppointments(updated);
    localStorage.setItem('appointments', JSON.stringify(updated));
    window.dispatchEvent(new Event('appointmentsUpdated'));
    
    const updatedPatient = updated.find(apt => apt.id === activePatient.id);
    setActivePatient(updatedPatient || activePatient);
    alert('Not silindi.');
  };

  const handleUploadDocument = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    if (!activePatient) return alert('Önce bir hasta seçin.');

    const file = files[0];
    const fileType = file.type;
    const fileName = file.name;
    const fileExt = fileName.split('.').pop().toLowerCase();

    // Check file type
    if (!['pdf', 'jpeg', 'jpg'].includes(fileExt) && 
        !['application/pdf', 'image/jpeg', 'image/jpg'].includes(fileType)) {
      alert('Sadece PDF, JPEG ve JPG formatları desteklenmektedir.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const newDoc = {
        id: Date.now().toString(),
        name: fileName,
        type: fileExt,
        size: (file.size / 1024).toFixed(2) + ' KB',
        uploadDate: new Date().toLocaleString('tr-TR'),
        data: e.target.result,
        mimeType: fileType
      };

      const updated = appointments.map(apt => {
        if (apt.id === activePatient.id) {
          const docs = Array.isArray(apt.documents) ? apt.documents.slice() : [];
          return { ...apt, documents: [...docs, newDoc] };
        }
        return apt;
      });

      setAppointments(updated);
      localStorage.setItem('appointments', JSON.stringify(updated));
      window.dispatchEvent(new Event('appointmentsUpdated'));

      const updatedPatient = updated.find(apt => apt.id === activePatient.id);
      setActivePatient(updatedPatient || activePatient);
      setDocuments(updatedPatient?.documents || []);
      alert('Doküman yüklendi.');
    };
    
    reader.readAsDataURL(file);
    event.target.value = null; // Reset input
  };

  const handleDocumentClick = (doc) => {
    setSelectedDocument(doc);
    setDocumentPreview(doc);
  };

  const handleDocumentDoubleClick = (doc) => {
    setDocumentPopup(doc);
  };

  const handleDeleteDocument = (docId) => {
    if (!window.confirm('Bu dokümanı silmek istediğinizden emin misiniz?')) return;
    
    const updated = appointments.map(apt => {
      if (apt.id === activePatient.id) {
        const filteredDocs = (apt.documents || []).filter(d => d.id !== docId);
        return { ...apt, documents: filteredDocs };
      }
      return apt;
    });

    setAppointments(updated);
    localStorage.setItem('appointments', JSON.stringify(updated));
    window.dispatchEvent(new Event('appointmentsUpdated'));
    
    const updatedPatient = updated.find(apt => apt.id === activePatient.id);
    setActivePatient(updatedPatient || activePatient);
    setDocuments(updatedPatient?.documents || []);
    setDocumentPreview(null);
    setSelectedDocument(null);
    alert('Doküman silindi.');
  };

  const handleEndExamination = () => {
    if (!activePatient) return;
    if (!window.confirm('Muayeneyi sonlandırmak istediğinizden emin misiniz?')) return;

    const updated = appointments.map(apt => {
      if (apt.id === activePatient.id) {
        return { ...apt, status: 'ended', endedAt: new Date().toLocaleString('tr-TR'), endedBy: currentUser?.name };
      }
      return apt;
    });

    setAppointments(updated);
    localStorage.setItem('appointments', JSON.stringify(updated));
    window.dispatchEvent(new Event('appointmentsUpdated'));
    
    setActivePatient(null);
    setTabValue(0);
    alert('Muayene sonlandırıldı.');
  };

  const handleReactivateExamination = (apt) => {
    const updated = appointments.map(a => {
      if (a.id === apt.id) {
        return { ...a, status: 'accepted' };
      }
      return a;
    });

    setAppointments(updated);
    localStorage.setItem('appointments', JSON.stringify(updated));
    window.dispatchEvent(new Event('appointmentsUpdated'));
    
    const reactivatedPatient = updated.find(a => a.id === apt.id);
    setActivePatient(reactivatedPatient);
    setSelectedAppointment(reactivatedPatient);
    setAppointmentNotes('');
    setSelectedServiceIds(reactivatedPatient?.serviceIds || []);
    setAppointmentAmount(reactivatedPatient?.amount || '');
    setTabValue(0);
    alert('Muayene tekrar aktif edildi.');
  };

  const handleFinishExam = () => {
    if (!selectedAppointment) return alert('Bir randevu seçin.');
    if (!window.confirm('Muayeneyi bitirmek istediğinizden emin misiniz?')) return;

    // If there's an unsaved note in the textarea, append it first
    if (appointmentNotes && appointmentNotes.trim()) {
      const noteEntry = { id: Date.now().toString(), text: appointmentNotes, author: currentUser?.username || 'Bilinmiyor', createdAt: new Date().toLocaleString('tr-TR') };
      const temp = appointments.map(apt => apt.id === selectedAppointment.id ? { ...apt, notesHistory: [...(apt.notesHistory || []), noteEntry], notes: appointmentNotes } : apt);
      setAppointments(temp);
      localStorage.setItem('appointments', JSON.stringify(temp));
      window.dispatchEvent(new Event('appointmentsUpdated'));

    }

    // Mark appointment as completed
    const updated = appointments.map(apt => apt.id === selectedAppointment.id ? { ...apt, status: 'completed', completedAt: new Date().toLocaleString('tr-TR'), completedBy: currentUser?.name } : apt);
    setAppointments(updated);
    localStorage.setItem('appointments', JSON.stringify(updated));
    window.dispatchEvent(new Event('appointmentsUpdated'));

    // Ensure a personelGelir exists for this appointment (create if missing)
    const personelGelir = JSON.parse(localStorage.getItem('personelGelir') || '[]');
    const exists = personelGelir.some(g => g.appointmentId && g.appointmentId === selectedAppointment.id);
    if (!exists) {
      const newGelir = {
        id: Date.now().toString(),
        appointmentId: selectedAppointment.id,
        employeeId: currentUser?.id,
        employeeName: currentUser?.name,
        patientName: selectedAppointment.name,
        patientPhone: selectedAppointment.phone,
        date: selectedAppointment.date,
        time: selectedAppointment.timeSlot,
        services: selectedServiceIds.map(id => services.find(s => s.id === id)?.name).filter(Boolean),
        notes: appointmentNotes || '',
        amount: parseFloat(appointmentAmount) || 0,
        createdAt: new Date().toLocaleString('tr-TR')
      };
      personelGelir.push(newGelir);
      localStorage.setItem('personelGelir', JSON.stringify(personelGelir));
    }

    // Clear active patient and close dialog
    setActivePatient(null);
    setSelectedAppointment(null);
    setAppointmentNotes('');
    setSelectedServiceIds([]);
    setAppointmentAmount('');
    setOpenDialog(false);
    alert('Muayene başarıyla tamamlandı ve kaydedildi.');
  };

  // LocalStorage'dan personelleri yükle
  React.useEffect(() => {
    const loadEmployees = () => {
      const storedEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
      setEmployees(storedEmployees);
    };
    loadEmployees();
  }, []);

  // Load services, appointments and current user
  React.useEffect(() => {
    const storedServices = JSON.parse(localStorage.getItem('services') || '[]');
    let storedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    // Normalize notes into notesHistory array (old -> new)
    storedAppointments = storedAppointments.map(apt => {
      if (!apt.notesHistory) {
        const history = [];
        if (apt.notes) {
          const createdDate = apt.acceptedAt || apt.createdAt || new Date().toLocaleString('tr-TR');
          history.push({ 
            id: Date.now().toString() + Math.random().toString(36).slice(2,6), 
            text: apt.notes, 
            author: apt.acceptedBy || apt.createdBy || 'Sistem', 
            createdAt: createdDate
          });
        }
        return { ...apt, notesHistory: history };
      }
      return apt;
    });
    const cur = JSON.parse(localStorage.getItem('currentUser') || 'null');
    setServices(storedServices);
    setAppointments(storedAppointments);
    setCurrentUser(cur);
  }, []);

  // Listen for global updates to user or appointments
  React.useEffect(() => {
    const onUsersUpdated = () => {
      setCurrentUser(JSON.parse(localStorage.getItem('currentUser') || 'null'));
      setAppointments(JSON.parse(localStorage.getItem('appointments') || '[]'));
    };
    const onStorageChange = (e) => {
      if (e.key === 'currentUser' || e.key === 'appointments') {
        setCurrentUser(JSON.parse(localStorage.getItem('currentUser') || 'null'));
        setAppointments(JSON.parse(localStorage.getItem('appointments') || '[]'));
      }
    };
    window.addEventListener('usersUpdated', onUsersUpdated);
    window.addEventListener('storage', onStorageChange);
    return () => {
      window.removeEventListener('usersUpdated', onUsersUpdated);
      window.removeEventListener('storage', onStorageChange);
    };
  }, []);

  // Load documents when active patient changes
  React.useEffect(() => {
    if (activePatient) {
      setDocuments(activePatient.documents || []);
    } else {
      setDocuments([]);
      setDocumentPreview(null);
      setSelectedDocument(null);
    }
  }, [activePatient]);

  const serviceTypes = {
    'Muayene': 8000,
    'Test': 5000,
    'Seans': 2000
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Grid container spacing={2}>
      {/* Arama ve Giriş Yapan Personel Bilgileri */}
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1 }}>
          <TextField
            fullWidth
            label="Ara (hasta adı / telefon)"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {currentUser ? (
            <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>{(currentUser.name || currentUser.username || 'U').slice(0,1)}</Avatar>
              <Box>
                <Typography fontWeight="bold">{currentUser.name || currentUser.username}</Typography>
                <Typography variant="caption" color="text.secondary">{currentUser.position || currentUser.role || 'Personel'} • {currentUser.username || ''}</Typography>
              </Box>
            </Paper>
          ) : (
            <Typography variant="body2" color="text.secondary">Henüz giriş yapılmamış.</Typography>
          )}
        </Box>
      </Grid>

      {/* Günlük Randevular */}
      {currentUser && (() => {
        const userAppointments = appointments.filter(apt => apt.employeeId === currentUser.id && apt.date === filterDate);
        const matchQuery = (apt) => {
          const q = searchQuery.toLowerCase();
          return !q || (apt.name || '').toLowerCase().includes(q) || (apt.phone || '').toLowerCase().includes(q);
        };
        // Tüm randevuları göster (pending, accepted, ended)
        const allAppointments = userAppointments.filter(apt => matchQuery(apt)).sort((a, b) => (a.timeSlot || '').localeCompare(b.timeSlot || ''));
        
        if (allAppointments.length === 0) return null;
        
        return (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 56, height: 56 }}>
                    <EventIcon fontSize="large" />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" component="h2" fontWeight="bold">
                      Günlük Randevular
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(filterDate).toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • {allAppointments.length} randevu
                    </Typography>
                  </Box>
                  <TextField
                    size="small"
                    label="Tarih"
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
                <Divider sx={{ my: 2 }} />
                
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'action.hover' }}>
                        <TableCell><strong>Saat</strong></TableCell>
                        <TableCell><strong>Hasta Adı</strong></TableCell>
                        <TableCell><strong>Telefon</strong></TableCell>
                        <TableCell><strong>Tür</strong></TableCell>
                        <TableCell><strong>Durum</strong></TableCell>
                        <TableCell align="center"><strong>İşlem</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {allAppointments.map(apt => (
                        <TableRow key={apt.id} hover>
                          <TableCell>{apt.timeSlot || '—'}</TableCell>
                          <TableCell>{apt.name}</TableCell>
                          <TableCell>{apt.phone || '—'}</TableCell>
                          <TableCell><Chip label={apt.appointmentType || 'Muayene'} size="small" /></TableCell>
                          <TableCell>
                            {apt.status === 'accepted' ? (
                              <Chip label="Kabul Edildi" size="small" color="success" />
                            ) : apt.status === 'ended' ? (
                              <Chip label="Sonlandırıldı" size="small" color="default" />
                            ) : apt.status === 'completed' ? (
                              <Chip label="Tamamlandı" size="small" color="primary" />
                            ) : (
                              <Chip label="Bekliyor" size="small" color="warning" />
                            )}
                          </TableCell>
                          <TableCell align="center">
                            {!apt.status || apt.status === 'pending' ? (
                              <Button size="small" variant="contained" color="primary" onClick={() => {
                                const updated = appointments.map(a => 
                                  a.id === apt.id 
                                    ? { ...a, status: 'accepted', acceptedAt: new Date().toLocaleString('tr-TR'), acceptedBy: currentUser?.name }
                                    : a
                                );
                                setAppointments(updated);
                                localStorage.setItem('appointments', JSON.stringify(updated));
                                window.dispatchEvent(new Event('appointmentsUpdated'));
                              }}>Hasta Kabul</Button>
                            ) : apt.status === 'accepted' ? (
                              <Button size="small" variant="outlined" onClick={() => {
                                setActivePatient(apt);
                                setSelectedAppointment(apt);
                                setAppointmentNotes('');
                                setSelectedServiceIds(apt.serviceIds || []);
                                setAppointmentAmount(apt.amount || '');
                                setTabValue(0);
                              }}>Detay</Button>
                            ) : apt.status === 'ended' ? (
                              <Button size="small" variant="contained" color="primary" onClick={() => handleReactivateExamination(apt)}>
                                Tekrar Aktif Et
                              </Button>
                            ) : (
                              <Chip label="Tamamlandı" size="small" color="primary" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        );
      })()}

      {/* Hasta Bilgileri (Sadece aktif hasta varsa) */}
      {activePatient && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2, width: 56, height: 56 }}>
                  <PersonIcon fontSize="large" />
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="h2" fontWeight="bold">
                    {activePatient.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Randevu: {new Date(activePatient.date).toLocaleDateString('tr-TR')} • {activePatient.timeSlot || '—'}
                  </Typography>
                </Box>
                <Chip label="Muayene Devam Ediyor" color="success" sx={{ mr: 2 }} />
                <Button 
                  variant="contained" 
                  color="error" 
                  size="small"
                  onClick={handleEndExamination}
                >
                  Sonlandır
                </Button>
              </Box>
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary">Ad Soyad</Typography>
                  <Typography variant="body1" fontWeight="bold">{activePatient.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary">Telefon</Typography>
                  <Typography variant="body1" fontWeight="bold">{activePatient.phone || '—'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary">E-posta</Typography>
                  <Typography variant="body1" fontWeight="bold">{activePatient.email || '—'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary">Randevu Türü</Typography>
                  <Typography variant="body1" fontWeight="bold">{activePatient.appointmentType || 'Muayene'}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      )}


      {/* Randevu Kabul Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Randevuyu Kabul Et</DialogTitle>
        <DialogContent>
          {selectedAppointment && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Hasta Adı</Typography>
                <Typography variant="body1">{selectedAppointment.name}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Telefon</Typography>
                <Typography variant="body1">{selectedAppointment.phone}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Tarih ve Saat</Typography>
                <Typography variant="body1">{new Date(selectedAppointment.date).toLocaleDateString('tr-TR')} {selectedAppointment.timeSlot}</Typography>
              </Box>

              <Divider />

              <FormControl fullWidth>
                <InputLabel>Hizmet Seçin (İsteğe Bağlı)</InputLabel>
                <Select
                  multiple
                  value={selectedServiceIds}
                  label="Hizmet Seçin (İsteğe Bağlı)"
                  onChange={(e) => setSelectedServiceIds(e.target.value)}
                >
                  {services.map((service) => (
                    <MenuItem key={service.id} value={service.id}>
                      {service.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField 
                fullWidth 
                label="Hasta Notları" 
                multiline 
                rows={4} 
                placeholder={selectedAppointment?.status === 'accepted' ? "Not yazın..." : "Hasta kabulü sonrası aktif olacak..."}
                value={appointmentNotes} 
                onChange={(e) => setAppointmentNotes(e.target.value)} 
                disabled={!selectedAppointment?.status || selectedAppointment?.status === 'pending'}
                helperText={(!selectedAppointment?.status || selectedAppointment?.status === 'pending') ? "Bu alan hasta kabulü sonrası aktif olacaktır." : ""}
              />
              <TextField fullWidth label="Toplam Tutar (TL)" type="number" inputProps={{ step: '0.01' }} value={appointmentAmount} onChange={(e) => setAppointmentAmount(e.target.value)} />

              {/* Not geçmişi (eski -> yeni) */}
              <Box>
                <Typography variant="subtitle2" sx={{ mt: 2 }}>Not Geçmişi</Typography>
                {(() => {
                  const aptLatest = appointments.find(a => a.id === selectedAppointment.id) || selectedAppointment;
                  const history = aptLatest?.notesHistory || [];
                  if (history.length === 0) return <Typography variant="body2" color="text.secondary">Henüz not eklenmemiş.</Typography>;
                  return (
                    <List sx={{ maxHeight: 160, overflow: 'auto' }}>
                      {history.map(note => (
                        <ListItem key={note.id} sx={{ py: 0.5 }}>
                          <ListItemText primary={note.text} secondary={`${note.author} • ${note.createdAt}`} />
                        </ListItem>
                      ))}
                    </List>
                  );
                })()}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button variant="outlined" onClick={handleSaveNotes}>Notları Kaydet</Button>
          <Button variant="contained" onClick={handleAcceptAppointment} sx={{ background: 'linear-gradient(90deg, #061161 0%, #780206 100%)' }}>Kabul Et ve Kaydet</Button>
          <Button variant="contained" color="success" onClick={handleFinishExam}>Muayeneyi Bitir</Button>
        </DialogActions>
      </Dialog>

      {/* Hizmet Ekleme Kartı */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <AddCircleIcon />
              </Avatar>
              <Typography variant="h5" component="h2" fontWeight="bold">
                Hizmet Ekleme
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            
            {!activePatient && (
              <Box sx={{ p: 3, bgcolor: 'warning.light', borderRadius: 1, mb: 2 }}>
                <Typography variant="body1" color="warning.dark" textAlign="center">
                  ⚠️ Hizmet eklemek için önce "Kabul Edilen Hastalar" listesinden bir hasta seçin veya hastanın detayına çift tıklayın.
                </Typography>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
              <FormControl sx={{ minWidth: 250 }}>
                <InputLabel>Personel Seç</InputLabel>
                <Select
                  value={selectedPersonel}
                  label="Personel Seç"
                  onChange={(e) => {
                    setSelectedPersonel(e.target.value);
                    setSelectedService(''); // Personel değiştiğinde hizmet seçimini sıfırla
                  }}
                >
                  <MenuItem value="">Seçiniz</MenuItem>
                  {(() => {
                    // Admin ve Sekreter tüm personeli görebilir, diğerleri sadece kendilerini
                    const isSekreter = currentUser && (currentUser.position === 'Sekreter' || currentUser.role === 'Sekreter');
                    const isAdmin = currentUser && (currentUser.position === 'Admin' || currentUser.role === 'Admin');
                    const filteredEmployees = (isAdmin || isSekreter) 
                      ? employees 
                      : employees.filter(emp => emp.id === currentUser?.id);
                    
                    return filteredEmployees.map((employee) => (
                      <MenuItem key={employee.id} value={employee.id}>
                        {employee.name} ({employee.position})
                      </MenuItem>
                    ));
                  })()}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 250 }} disabled={!selectedPersonel}>
                <InputLabel>Hizmet Türü</InputLabel>
                <Select
                  value={selectedService}
                  label="Hizmet Türü"
                  onChange={(e) => setSelectedService(e.target.value)}
                >
                  <MenuItem value="">Seçiniz</MenuItem>
                  {selectedPersonel && (() => {
                    const selectedEmp = employees.find(emp => emp.id === selectedPersonel);
                    const availableServices = [];
                    
                    if (selectedEmp) {
                      if (selectedEmp.muayenePrice) {
                        availableServices.push(
                          <MenuItem key="Muayene" value="Muayene">
                            Muayene - {Number(selectedEmp.muayenePrice).toLocaleString('tr-TR')} ₺
                          </MenuItem>
                        );
                      }
                      if (selectedEmp.testPrice) {
                        availableServices.push(
                          <MenuItem key="Test" value="Test">
                            Test - {Number(selectedEmp.testPrice).toLocaleString('tr-TR')} ₺
                          </MenuItem>
                        );
                      }
                      if (selectedEmp.seansPrice) {
                        availableServices.push(
                          <MenuItem key="Seans" value="Seans">
                            Seans - {Number(selectedEmp.seansPrice).toLocaleString('tr-TR')} ₺
                          </MenuItem>
                        );
                      }
                    }
                    
                    return availableServices.length > 0 ? availableServices : (
                      <MenuItem disabled>Bu personel için hizmet ücreti tanımlı değil</MenuItem>
                    );
                  })()}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                startIcon={<AddCircleIcon />}
                disabled={!selectedService || !selectedPersonel || !activePatient}
                onClick={() => {
                  if (!activePatient) {
                    alert('Lütfen önce bir hasta seçin.');
                    return;
                  }
                  if (selectedService && selectedPersonel) {
                    const selectedEmp = employees.find(emp => emp.id === selectedPersonel);
                    let servicePrice = serviceTypes[selectedService];
                    
                    // Personele özel fiyat kullan
                    if (selectedService === 'Muayene' && selectedEmp.muayenePrice) {
                      servicePrice = Number(selectedEmp.muayenePrice);
                    } else if (selectedService === 'Test' && selectedEmp.testPrice) {
                      servicePrice = Number(selectedEmp.testPrice);
                    } else if (selectedService === 'Seans' && selectedEmp.seansPrice) {
                      servicePrice = Number(selectedEmp.seansPrice);
                    }
                    
                    const now = new Date();
                    const newService = {
                      id: Date.now(),
                      name: selectedService,
                      personel: selectedEmp.name,
                      personelId: selectedEmp.id,
                      price: servicePrice,
                      date: new Date().toLocaleDateString('tr-TR'),
                      patientName: activePatient?.name || 'Belirtilmemiş',
                      patientPhone: activePatient?.phone || '-'
                    };
                    
                    // Hizmet geçmişi için entry oluştur
                    const serviceHistoryEntry = {
                      id: Date.now().toString(),
                      serviceIds: [],
                      services: [selectedService],
                      amount: servicePrice,
                      employeeName: selectedEmp.name,
                      date: now.toISOString().split('T')[0],
                      time: now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                      notes: `Manuel hizmet ekleme - ${selectedService}`,
                      createdAt: now.toLocaleString('tr-TR')
                    };
                    
                    // Hasta randevusunu güncelle - serviceHistory'ye ekle
                    const updatedAppointments = appointments.map(apt => {
                      if (apt.id === activePatient.id) {
                        const prevServiceHistory = Array.isArray(apt.serviceHistory) ? apt.serviceHistory.slice() : [];
                        return { ...apt, serviceHistory: [...prevServiceHistory, serviceHistoryEntry] };
                      }
                      return apt;
                    });
                    
                    setAppointments(updatedAppointments);
                    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
                    window.dispatchEvent(new Event('appointmentsUpdated'));
                    
                    // Active patient'i güncelle
                    const updatedPatient = updatedAppointments.find(apt => apt.id === activePatient.id);
                    setActivePatient(updatedPatient || activePatient);
                    
                    setServices([...services, newService]);
                    setSelectedService('');
                    setSelectedPersonel('');
                    
                    // Vezne'ye kaydet (localStorage)
                    const existingVezne = JSON.parse(localStorage.getItem('vezneServices') || '[]');
                    localStorage.setItem('vezneServices', JSON.stringify([...existingVezne, newService]));
                  }
                }}
              >
                Hizmet Ekle
              </Button>
            </Box>

              {services.length > 0 && (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell><strong>Hizmet</strong></TableCell>
                      <TableCell><strong>Personel</strong></TableCell>
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
                        <TableCell>{service.date}</TableCell>
                        <TableCell align="right">
                          {service.price.toLocaleString('tr-TR')} ₺
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => {
                              const updatedServices = services.filter(s => s.id !== service.id);
                              setServices(updatedServices);
                              
                              // Vezne'den sil
                              const existingVezne = JSON.parse(localStorage.getItem('vezneServices') || '[]');
                              const updatedVezne = existingVezne.filter(s => s.id !== service.id);
                              localStorage.setItem('vezneServices', JSON.stringify(updatedVezne));
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: 'primary.light' }}>
                      <TableCell colSpan={2}><strong>TOPLAM</strong></TableCell>
                      <TableCell align="right">
                        <strong>
                          {services.reduce((sum, s) => sum + s.price, 0).toLocaleString('tr-TR')} ₺
                        </strong>
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Sekmeli Kart - Sadece aktif hasta seçildiğinde göster */}
      {activePatient && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ mb: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                <Typography variant="body2" color="info.dark">
                  <strong>Aktif Hasta:</strong> {activePatient.name} • {activePatient.timeSlot} • {activePatient.appointmentType || 'Muayene'}
                </Typography>
              </Box>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  mb: 3
                }}
              >
                <Tab 
                  label="Hasta Notları" 
                  icon={<NoteIcon />}
                  iconPosition="start"
                />
                <Tab 
                  label="Dokümanlar" 
                  icon={<FolderIcon />}
                  iconPosition="start"
                />
                <Tab 
                  label="Ölçekler" 
                  icon={<AssessmentIcon />}
                  iconPosition="start"
                />
                <Tab 
                  label="Hizmet Geçmişi" 
                  icon={<HistoryIcon />}
                  iconPosition="start"
                />
              </Tabs>

            {/* Hasta Notları Sekmesi */}
            {tabValue === 0 && (
              <Box>
                <Box sx={{ mb: 3 }}>
                  {/* Not Görebilecek Personeller Seçimi */}
                  <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Bu notu kimlerin görebileceğini seçin
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => {
                          const eligibleEmployees = employees.filter(emp => 
                            emp.role !== 'Sekreter' && emp.role !== 'Muhasebe'
                          );
                          setSelectedViewers(eligibleEmployees.map(emp => emp.id));
                        }}
                      >
                        Tamamını Seç
                      </Button>
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => setSelectedViewers([])}
                      >
                        Hiç Birini Seçme
                      </Button>
                    </Box>
                    <FormControl fullWidth size="small">
                      <InputLabel>Personel Seçimi</InputLabel>
                      <Select
                        multiple
                        value={selectedViewers}
                        onChange={(e) => setSelectedViewers(e.target.value)}
                        input={<OutlinedInput label="Personel Seçimi" />}
                        renderValue={(selected) => {
                          const names = selected.map(id => {
                            const emp = employees.find(e => e.id === id);
                            return emp ? `${emp.name} (${emp.role})` : '';
                          }).filter(Boolean);
                          return names.length === 0 ? 'Seçim yapılmadı' : names.join(', ');
                        }}
                      >
                        {employees
                          .filter(emp => emp.role !== 'Sekreter' && emp.role !== 'Muhasebe')
                          .map((emp) => (
                            <MenuItem key={emp.id} value={emp.id}>
                              <Checkbox checked={selectedViewers.indexOf(emp.id) > -1} />
                              <ListItemText primary={`${emp.name} (${emp.role})`} />
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                    {selectedViewers.length > 0 && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {selectedViewers.length} personel seçildi
                      </Typography>
                    )}
                  </Paper>

                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Yeni Not Ekle"
                    variant="outlined"
                    placeholder="Hasta ile ilgili gözlemlerinizi ve notlarınızı buraya yazabilirsiniz..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                  />
                  <Button 
                    variant="contained" 
                    sx={{ mt: 2 }}
                    onClick={handleSaveNotes}
                    disabled={!noteText.trim()}
                  >
                    Not Kaydet
                  </Button>
                </Box>
                <Divider sx={{ my: 2 }} />
                
                {activePatient && activePatient.notesHistory && activePatient.notesHistory.length > 0 ? (
                  <List>
                    {activePatient.notesHistory.filter(note => note && note.id).map((note) => (
                      <ListItem 
                        key={note.id}
                        sx={{ 
                          bgcolor: 'action.hover', 
                          borderRadius: 1, 
                          mb: 2,
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.selected' }
                        }}
                        onClick={() => handleEditNote(note)}
                      >
                        <Box sx={{ display: 'flex', width: '100%', mb: 1, alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip 
                              label={note.author || 'Bilinmiyor'} 
                              size="small" 
                              color="secondary" 
                              icon={<PersonIcon />}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {note.createdAt || 'Tarih bilinmiyor'}
                              {note.editedAt && ` • Düzenlendi: ${note.editedAt}`}
                            </Typography>
                          </Box>
                          <Chip label={activePatient.appointmentType || 'Muayene'} size="small" color="primary" />
                        </Box>
                        <Typography variant="body2">
                          {note.text}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Henüz not eklenmemiş. Yukarıdaki alandan yeni not ekleyebilirsiniz.
                  </Typography>
                )}
                
                {/* Not Düzenleme Dialog */}
                <Dialog open={!!editingNote} onClose={() => setEditingNote(null)} maxWidth="sm" fullWidth>
                  <DialogTitle>Not Düzenle</DialogTitle>
                  <DialogContent>
                    <TextField
                      fullWidth
                      multiline
                      rows={6}
                      value={editNoteText}
                      onChange={(e) => setEditNoteText(e.target.value)}
                      variant="outlined"
                      sx={{ mt: 2 }}
                    />
                    {editingNote && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Oluşturan: {editingNote.author || 'Bilinmiyor'} • {editingNote.createdAt || 'Tarih bilinmiyor'}
                      </Typography>
                    )}
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => editingNote && handleDeleteNote(editingNote.id)} color="error">
                      Sil
                    </Button>
                    <Button onClick={() => setEditingNote(null)}>
                      İptal
                    </Button>
                    <Button onClick={handleUpdateNote} variant="contained">
                      Güncelle
                    </Button>
                  </DialogActions>
                </Dialog>

                {/* Hizmet Düzenleme Dialog */}
                <Dialog open={!!editingService} onClose={() => setEditingService(null)} maxWidth="sm" fullWidth>
                  <DialogTitle>Hizmet Düzenle</DialogTitle>
                  <DialogContent>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Hizmetler</InputLabel>
                      <Select
                        multiple
                        value={editServiceIds}
                        onChange={(e) => setEditServiceIds(e.target.value)}
                        label="Hizmetler"
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((id) => (
                              <Chip key={id} label={services.find(s => s.id === id)?.name} size="small" />
                            ))}
                          </Box>
                        )}
                      >
                        {services.map((service) => (
                          <MenuItem key={service.id} value={service.id}>
                            {service.name} - {service.price}₺
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField
                      fullWidth
                      label="Tutar (₺)"
                      type="number"
                      value={editServiceAmount}
                      onChange={(e) => setEditServiceAmount(e.target.value)}
                      margin="normal"
                    />

                    <TextField
                      fullWidth
                      label="Notlar"
                      multiline
                      rows={4}
                      value={editServiceNotes}
                      onChange={(e) => setEditServiceNotes(e.target.value)}
                      margin="normal"
                    />

                    {editingService && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Oluşturan: {editingService.employeeName} • {editingService.createdAt}
                        {editingService.editedAt && ` • Düzenlenme: ${editingService.editedAt}`}
                      </Typography>
                    )}
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setEditingService(null)}>
                      İptal
                    </Button>
                    <Button onClick={handleUpdateService} variant="contained">
                      Güncelle
                    </Button>
                  </DialogActions>
                </Dialog>
              </Box>
            )}

            {/* Dokümanlar Sekmesi */}
            {tabValue === 1 && (
              <Box>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept=".pdf,.jpg,.jpeg,application/pdf,image/jpeg"
                  onChange={handleFileChange}
                />
                <Button 
                  variant="contained" 
                  startIcon={<DescriptionIcon />}
                  sx={{ mb: 3 }}
                  onClick={handleUploadDocument}
                >
                  Doküman Ekle
                </Button>
                
                <Grid container spacing={2}>
                  {/* Doküman Listesi */}
                  <Grid item xs={12} md={documentPreview ? 7 : 12}>
                    {documents && documents.length > 0 ? (
                      <List>
                        {documents.map((doc) => (
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
                              secondary={`${doc.uploadDate} • ${doc.type.toUpperCase()} • ${doc.size}`}
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
                        Henüz doküman yüklenmemiş. "Doküman Ekle" butonunu kullanarak yeni doküman yükleyebilirsiniz.
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
                                style={{ maxWidth: '100%', maxHeight: '350px', objectFit: 'contain' }}
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
                
                {/* Doküman Pop-up Dialog */}
                <Dialog 
                  open={!!documentPopup} 
                  onClose={() => setDocumentPopup(null)} 
                  maxWidth="lg" 
                  fullWidth
                >
                  <DialogTitle>
                    {documentPopup?.name}
                    <Typography variant="caption" display="block" color="text.secondary">
                      {documentPopup?.uploadDate} • {documentPopup?.type.toUpperCase()} • {documentPopup?.size}
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
                    <Button onClick={() => setDocumentPopup(null)}>
                      Kapat
                    </Button>
                  </DialogActions>
                </Dialog>
              </Box>
            )}

            {/* Ölçekler Sekmesi */}
            {tabValue === 2 && (
              <Box>
                <Button 
                  variant="contained" 
                  startIcon={<AssessmentIcon />}
                  sx={{ mb: 3 }}
                  onClick={() => {
                    if (!activePatient) {
                      alert('Lütfen önce bir hasta seçin!');
                      return;
                    }
                    
                    // Hasta bilgilerini hazırla
                    const patients = JSON.parse(localStorage.getItem('patients') || '[]');
                    const patientInfo = patients.find(p => 
                      p.name === activePatient.name || 
                      p.tcNo === activePatient.patientTcNo ||
                      p.code === activePatient.patientCode
                    );
                    
                    const patientData = patientInfo || {
                      id: activePatient.id,
                      code: activePatient.patientCode || activePatient.code,
                      name: activePatient.name || activePatient.patientName,
                      tcNo: activePatient.patientTcNo || activePatient.tcNo || '',
                      phone: activePatient.patientPhone || activePatient.phone || '',
                      birthDate: activePatient.birthDate || ''
                    };
                    
                    console.log('Sending patient data:', patientData);
                    
                    // Hasta bilgilerini gönder
                    const patientEvent = new CustomEvent('selectPatientForScale', {
                      detail: patientData
                    });
                    window.dispatchEvent(patientEvent);
                    
                    // Ölçek Yönetimi sekmesine geç
                    setTimeout(() => {
                      const event = new CustomEvent('navigateToMenu', { 
                        detail: 'Ölçek Yönetimi' 
                      });
                      window.dispatchEvent(event);
                    }, 100);
                  }}
                >
                  Yeni Ölçek Gönder
                </Button>
                
                {(() => {
                  const institutionData = JSON.parse(localStorage.getItem('olcekInstitution') || 'null');
                  const allApplications = JSON.parse(localStorage.getItem('olcekApplications') || '[]');
                  const allScales = JSON.parse(localStorage.getItem('olcekScales') || '[]');
                  const patients = JSON.parse(localStorage.getItem('patients') || '[]');
                  
                  console.log('=== ÖLÇEK DEBUG ===');
                  console.log('Active Patient:', activePatient);
                  console.log('All Applications:', allApplications);
                  console.log('All Scales:', allScales);
                  
                  // Aktif hastanın bilgilerini bul - daha esnek eşleştirme
                  const patientInfo = patients.find(p => 
                    p.name === activePatient.name || 
                    p.name === activePatient.patientName ||
                    p.tcNo === activePatient.patientTcNo ||
                    p.tcNo === activePatient.tcNo ||
                    p.code === activePatient.patientCode ||
                    p.code === activePatient.code
                  );
                  
                  console.log('Patient Info:', patientInfo);
                  
                  // Tüm olası hasta ID'lerini topla
                  const possibleIds = [
                    patientInfo?.code,
                    patientInfo?.id,
                    patientInfo?.tcNo,
                    activePatient.name,
                    activePatient.patientName,
                    activePatient.patientCode,
                    activePatient.code,
                    activePatient.patientTcNo,
                    activePatient.tcNo
                  ].filter(id => id); // boş olanları filtrele
                  
                  console.log('Possible IDs:', possibleIds);
                  
                  // Bu hastaya ait tüm ölçek uygulamalarını bul (tamamlanmış VE bekleyen)
                  const patientApps = allApplications.filter(app => 
                    possibleIds.includes(app.patientId)
                  );
                  
                  console.log('Patient Apps:', patientApps);
                  
                  // Tamamlanmış ölçekleri grupla
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
                        lastDate: app.completedDate,
                        lastScore: app.totalScore
                      };
                    }
                    scaleGroups[app.scaleId].count++;
                    if (new Date(app.completedDate) > new Date(scaleGroups[app.scaleId].lastDate)) {
                      scaleGroups[app.scaleId].lastDate = app.completedDate;
                      scaleGroups[app.scaleId].lastScore = app.totalScore;
                    }
                  });
                  
                  const scales = Object.values(scaleGroups);
                  console.log('Grouped Scales:', scales);
                  
                  return (
                    <Box>
                      {/* İstenen Ölçekler */}
                      {pendingApps.length > 0 && (
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="h6" gutterBottom color="primary">
                            İstenen Ölçekler
                          </Typography>
                          <Grid container spacing={2}>
                            {pendingApps.map((app) => {
                              const scale = allScales.find(s => s.id === app.scaleId);
                              return (
                                <Grid item xs={12} md={6} key={app.id}>
                                  <Paper elevation={2} sx={{ p: 2, borderLeft: '4px solid', borderColor: 'warning.main' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                      <AssessmentIcon color="warning" sx={{ mr: 1 }} />
                                      <Typography variant="h6">
                                        {app.scaleName || scale?.name || 'Bilinmeyen Ölçek'}
                                      </Typography>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                      Gönderilme: {new Date(app.date).toLocaleString('tr-TR')}
                                    </Typography>
                                    <Chip 
                                      label="Bekliyor" 
                                      color="warning" 
                                      size="small" 
                                      sx={{ mt: 1 }}
                                    />
                                  </Paper>
                                </Grid>
                              );
                            })}
                          </Grid>
                        </Box>
                      )}
                      
                      {/* Tamamlanmış Ölçekler */}
                      {scales.length > 0 ? (
                        <Box>
                          <Typography variant="h6" gutterBottom color="success.main">
                            Yapılanlar
                          </Typography>
                          <Grid container spacing={2}>
                            {scales.map((scale) => (
                              <Grid item xs={12} md={6} key={scale.scaleId}>
                                <Paper elevation={2} sx={{ p: 2, borderLeft: '4px solid', borderColor: 'success.main' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <AssessmentIcon color="success" sx={{ mr: 1 }} />
                                    <Typography variant="h6">
                                      {scale.scaleName}
                                    </Typography>
                                  </Box>
                                  <Typography variant="caption" color="text.secondary">
                                    Son Uygulama: {new Date(scale.lastDate).toLocaleString('tr-TR')}
                                  </Typography>
                                  <Divider sx={{ my: 1 }} />
                                  <Box sx={{ mt: 2 }}>
                                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                      <Chip 
                                        label={`${scale.count} kez dolduruldu`} 
                                        color="info" 
                                        size="small" 
                                      />
                                      {scale.lastScore !== undefined && (
                                        <Chip 
                                          label={`Son Puan: ${scale.lastScore}`} 
                                          color="primary" 
                                          size="small" 
                                        />
                                      )}
                                    </Box>
                                  </Box>
                                </Paper>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      ) : pendingApps.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <Typography variant="body2" color="text.secondary">
                            Bu hasta için henüz ölçek bulunmamaktadır.
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Yukarıdaki "Yeni Ölçek Gönder" butonu ile ölçek gönderebilirsiniz.
                          </Typography>
                        </Box>
                      ) : null}
                    </Box>
                  );
                })()}
              </Box>
            )}

            {/* Hizmet Geçmişi Sekmesi */}
            {tabValue === 3 && (
              <Box>
                {activePatient && activePatient.serviceHistory && activePatient.serviceHistory.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                          <TableCell><strong>Tarih & Saat</strong></TableCell>
                          <TableCell><strong>Hizmetler</strong></TableCell>
                          <TableCell><strong>Personel</strong></TableCell>
                          <TableCell><strong>Tutar</strong></TableCell>
                          <TableCell><strong>Notlar</strong></TableCell>
                          <TableCell align="center"><strong>İşlemler</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {activePatient.serviceHistory.map((service) => (
                          <TableRow key={service.id} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">
                                {new Date(service.date).toLocaleDateString('tr-TR')}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {service.time}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {service.services && service.services.length > 0 ? (
                                <Box>
                                  {service.services.map((svc, idx) => (
                                    <Chip key={idx} label={svc} size="small" sx={{ mr: 0.5, mb: 0.5 }} color="primary" />
                                  ))}
                                </Box>
                              ) : (
                                <Typography variant="body2" color="text.secondary">-</Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{service.employeeName || 'Bilinmiyor'}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold" color="success.main">
                                {service.amount ? `${service.amount.toLocaleString('tr-TR')} ₺` : '-'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {service.notes || '-'}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEditService(service)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteService(service.id)}
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
                      {activePatient ? 'Bu hasta için henüz hizmet kaydı bulunmuyor.' : 'Hizmet geçmişini görmek için bir hasta seçin.'}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
};

export default HastaMuayene;
