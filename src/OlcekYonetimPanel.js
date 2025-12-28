import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import AddIcon from '@mui/icons-material/Add';
import TabletIcon from '@mui/icons-material/Tablet';
import SmsIcon from '@mui/icons-material/Sms';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import OlcekOlustur from './OlcekOlustur';

const OlcekYonetimPanel = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isPatientActive, setIsPatientActive] = useState(false);
  const [availableForms, setAvailableForms] = useState([]);
  const [requestedForms, setRequestedForms] = useState([]);
  const [completedForms, setCompletedForms] = useState([]);
  const [draggedForm, setDraggedForm] = useState(null);
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [newFormName, setNewFormName] = useState('');
  const [newFormType, setNewFormType] = useState('');
  const [showScaleInput, setShowScaleInput] = useState(false);
  
  // Gönderme seçenekleri dialog
  const [openSendDialog, setOpenSendDialog] = useState(false);
  const [selectedFormToSend, setSelectedFormToSend] = useState(null);
  const [sendMethod, setSendMethod] = useState('tablet');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  
  // Form doldurma dialog
  const [openFillFormDialog, setOpenFillFormDialog] = useState(false);
  const [fillFormData, setFillFormData] = useState(null);
  const [formAnswers, setFormAnswers] = useState({});
  
  // Ölçek düzenleme
  const [editingScale, setEditingScale] = useState(null);
  
  // Sonuç gösterme dialog
  const [openResultDialog, setOpenResultDialog] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [zoomDialogOpen, setZoomDialogOpen] = useState(false);
  const [zoomColumn, setZoomColumn] = useState(null);
  const [selectedHistoryTest, setSelectedHistoryTest] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  const institutionData = JSON.parse(localStorage.getItem('olcekInstitution') || 'null');

  useEffect(() => {
    if (!institutionData) {
      // Demo kurum oluştur
      const demoInstitution = {
        id: 'inst1',
        name: 'Demo Klinik',
        licenseExpiry: '2025-12-31'
      };
      localStorage.setItem('olcekInstitution', JSON.stringify(demoInstitution));
    }
    loadData();

    // Hasta seçimi event'ini dinle
    const handleSelectPatient = (event) => {
      const patient = event.detail;
      console.log('Received patient data:', patient);
      if (patient && patient.name) {
        setSelectedPatient(patient);
        setIsPatientActive(true);
        setSearchQuery(''); // Aramayı temizle
        
        // Bu hastaya ait kayıtlı formları yükle
        loadPatientForms(patient);
      }
    };

    window.addEventListener('selectPatientForScale', handleSelectPatient);
    
    return () => {
      window.removeEventListener('selectPatientForScale', handleSelectPatient);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Hasta arama filtresi
    if (searchQuery.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tcNo?.includes(searchQuery) ||
        p.phone?.includes(searchQuery)
      );
      setFilteredPatients(filtered);
    }
  }, [searchQuery, patients]);

  const loadData = () => {
    const institution = JSON.parse(localStorage.getItem('olcekInstitution') || '{}');
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    // Bugünün tarihini al
    const today = new Date().toISOString().split('T')[0];
    
    // Hastaları yükle
    const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    
    console.log('All appointments:', allAppointments.length);
    console.log('Today:', today);
    console.log('First appointment object keys:', allAppointments[0] ? Object.keys(allAppointments[0]) : 'No appointments');
    console.log('First appointment full object:', allAppointments[0]);
    
    // Accepted olan randevuları filtrele
    const acceptedAppointments = allAppointments.filter(apt => {
      return apt.status === 'accepted';
    });
    
    console.log('Accepted appointments:', acceptedAppointments);
    
    // Benzersiz hastaları çıkar - farklı field isimleri dene
    const uniquePatientsMap = new Map();
    acceptedAppointments.forEach(apt => {
      const patientName = apt.patientName || apt.patient || apt.name || apt.patientInfo?.name;
      
      if (patientName && !uniquePatientsMap.has(patientName)) {
        uniquePatientsMap.set(patientName, {
          id: apt.id || Date.now().toString(),
          name: patientName,
          tcNo: apt.patientTcNo || apt.tcNo || apt.patientInfo?.tcNo || '',
          phone: apt.patientPhone || apt.phone || apt.patientInfo?.phone || '',
          birthDate: apt.birthDate || apt.patientInfo?.birthDate || '',
          timeSlot: apt.timeSlot || '',
          date: apt.date || ''
        });
      }
    });
    
    const patientsList = Array.from(uniquePatientsMap.values())
      .sort((a, b) => {
        // Bugünküler önce
        const aIsToday = a.date === today;
        const bIsToday = b.date === today;
        if (aIsToday && !bIsToday) return -1;
        if (!aIsToday && bIsToday) return 1;
        // Sonra saat sırasına göre
        return (a.timeSlot || '').localeCompare(b.timeSlot || '');
      });
    
    console.log('Final patients list:', patientsList);
    
    setPatients(patientsList);
    setFilteredPatients(patientsList);
    
    // Demo formlar
    const allScales = JSON.parse(localStorage.getItem('olcekScales') || '[]');
    if (allScales.length === 0) {
      const demoScales = [
        { id: '1', name: 'Beck Depresyon Ölçeği', institutionId: institution.id || 'inst1', questions: [] },
        { id: '2', name: 'Beck Anksiyete Ölçeği', institutionId: institution.id || 'inst1', questions: [] },
        { id: '3', name: 'SCL-90', institutionId: institution.id || 'inst1', questions: [] },
        { id: '4', name: 'Kısa Semptom Envanteri', institutionId: institution.id || 'inst1', questions: [] }
      ];
      localStorage.setItem('olcekScales', JSON.stringify(demoScales));
      setAvailableForms(demoScales);
    } else {
      const institutionScales = allScales.filter(s => s.institutionId === (institution.id || 'inst1'));
      setAvailableForms(institutionScales);
    }
  };

  const loadPatientForms = (patient) => {
    if (!patient || !patient.code) {
      setRequestedForms([]);
      setCompletedForms([]);
      return;
    }
    
    // localStorage'dan bu hastaya ait olcekApplications'ları çek
    const allApplications = JSON.parse(localStorage.getItem('olcekApplications') || '[]');
    const allScales = JSON.parse(localStorage.getItem('olcekScales') || '[]');
    
    // Tüm olası hasta ID'lerini topla
    const possibleIds = [
      patient.code,
      patient.id,
      patient.tcNo,
      patient.name
    ].filter(id => id);
    
    // Bu hastaya ait uygulamaları filtrele
    const patientApplications = allApplications.filter(app =>
      possibleIds.includes(app.patientId) &&
      app.institutionId === institutionData.id
    );
    
    console.log('Loading patient forms:', { patient, patientApplications });
    
    // Pending olanları "İstenecekler"e ekle
    const pending = patientApplications
      .filter(app => app.status === 'pending')
      .map(app => {
        const scale = allScales.find(s => s.id === app.scaleId);
        return scale || { id: app.scaleId, name: app.scaleName || 'Bilinmeyen Ölçek' };
      });
    
    // Completed olanları "Yapılanlar"a ekle (unique)
    const completed = [];
    const completedIds = new Set();
    patientApplications
      .filter(app => app.status === 'completed')
      .forEach(app => {
        if (!completedIds.has(app.scaleId)) {
          completedIds.add(app.scaleId);
          const scale = allScales.find(s => s.id === app.scaleId);
          completed.push(scale || { id: app.scaleId, name: app.scaleName || 'Bilinmeyen Ölçek' });
        }
      });
    
    setRequestedForms(pending);
    setCompletedForms(completed);
  };

  const handlePatientDoubleClick = (patient) => {
    setSelectedPatient(patient);
    setIsPatientActive(true);
    loadPatientForms(patient);
  };

  const handleResetPatient = () => {
    setSelectedPatient(null);
    setIsPatientActive(false);
    setRequestedForms([]);
    setCompletedForms([]);
  };

  const handleFormDoubleClick = (form) => {
    if (!isPatientActive) {
      alert('Önce hasta kodunu onaylayın!');
      return;
    }
    if (!requestedForms.find(f => f.id === form.id)) {
      const newRequested = [...requestedForms, form];
      setRequestedForms(newRequested);
      
      // localStorage'a kaydet - pending olarak
      createPendingApplication(form);
    }
  };

  const handleDragStart = (e, form) => {
    if (!isPatientActive) {
      e.preventDefault();
      alert('Önce hasta kodunu onaylayın!');
      return;
    }
    setDraggedForm(form);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetList) => {
    e.preventDefault();
    if (!draggedForm) return;

    if (targetList === 'requested') {
      if (!requestedForms.find(f => f.id === draggedForm.id)) {
        const newRequested = [...requestedForms, draggedForm];
        setRequestedForms(newRequested);
        
        // localStorage'a kaydet - pending olarak
        createPendingApplication(draggedForm);
      }
    }
    setDraggedForm(null);
  };

  const createPendingApplication = (form) => {
    if (!selectedPatient) return;
    
    const allApplications = JSON.parse(localStorage.getItem('olcekApplications') || '[]');
    
    // Bu form için zaten pending bir uygulama var mı kontrol et
    const existingPending = allApplications.find(app =>
      app.patientId === selectedPatient.code &&
      app.scaleId === form.id &&
      app.status === 'pending' &&
      app.institutionId === institutionData.id
    );
    
    if (existingPending) return; // Zaten var
    
    const newApplication = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      patientId: selectedPatient.code || selectedPatient.id,
      scaleId: form.id,
      scaleName: form.name,
      institutionId: institutionData.id,
      status: 'pending',
      date: new Date().toISOString(),
      sentBy: currentUser?.name || 'Admin'
    };
    
    allApplications.push(newApplication);
    localStorage.setItem('olcekApplications', JSON.stringify(allApplications));
    console.log('Created pending application:', newApplication);
  };

  const handleRemoveFromRequested = (formId) => {
    const newRequested = requestedForms.filter(f => f.id !== formId);
    setRequestedForms(newRequested);
    
    // localStorage'dan da sil
    if (selectedPatient) {
      const allApplications = JSON.parse(localStorage.getItem('olcekApplications') || '[]');
      const filtered = allApplications.filter(app =>
        !(app.patientId === selectedPatient.code &&
          app.scaleId === formId &&
          app.status === 'pending' &&
          app.institutionId === institutionData.id)
      );
      localStorage.setItem('olcekApplications', JSON.stringify(filtered));
    }
  };

  const handleSendForms = () => {
    if (requestedForms.length === 0) {
      alert('Lütfen en az bir form seçin!');
      return;
    }

    if (!selectedPatient) {
      alert('Lütfen bir hasta seçin!');
      return;
    }

    const institution = JSON.parse(localStorage.getItem('olcekInstitution') || '{}');
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const allApplications = JSON.parse(localStorage.getItem('olcekApplications') || '[]');

    requestedForms.forEach(form => {
      const application = {
        id: Date.now().toString() + Math.random(),
        institutionId: institution.id || 'inst1',
        doctorId: user.id || 'user1',
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        patientCode: selectedPatient.tcNo || selectedPatient.id,
        scaleId: form.id,
        scaleName: form.name,
        status: 'pending',
        date: new Date().toISOString(),
        link: `${window.location.origin}/#/olcek-yonetim?patient=${selectedPatient.id}&scale=${form.id}`
      };
      allApplications.push(application);
    });

    localStorage.setItem('olcekApplications', JSON.stringify(allApplications));
    
    setCompletedForms([...completedForms, ...requestedForms]);
    setRequestedForms([]);
    alert(`${selectedPatient.name} için ${requestedForms.length} form başarıyla gönderildi!`);
  };

  // Gönderme dialogunu aç
  const handleOpenSendDialog = (form) => {
    // LocalStorage'dan tam scale verisini yükle (questions dahil)
    const allScales = JSON.parse(localStorage.getItem('olcekScales') || '[]');
    const fullScale = allScales.find(s => s.id === form.id) || form;
    
    setSelectedFormToSend(fullScale);
    setOpenSendDialog(true);
    setSendMethod('tablet');
    setPhoneNumber('');
    setEmail('');
  };

  // Gönderme dialogunu kapat
  const handleCloseSendDialog = () => {
    setOpenSendDialog(false);
    setSelectedFormToSend(null);
    setSendMethod('tablet');
    setPhoneNumber('');
    setEmail('');
  };

  // Formu gönder
  const handleSendForm = () => {
    if (!selectedPatient || !selectedFormToSend) {
      alert('Lütfen hasta seçin ve form belirleyin!');
      return;
    }

    const institution = JSON.parse(localStorage.getItem('olcekInstitution') || '{}');
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const allApplications = JSON.parse(localStorage.getItem('olcekApplications') || '[]');

    const application = {
      id: Date.now().toString() + Math.random(),
      institutionId: institution.id || 'inst1',
      doctorId: user.id || 'user1',
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      patientCode: selectedPatient.tcNo || selectedPatient.id,
      scaleId: selectedFormToSend.id,
      scaleName: selectedFormToSend.name,
      status: 'pending',
      date: new Date().toISOString(),
      sendMethod: sendMethod,
      phoneNumber: phoneNumber,
      email: email,
      link: `${window.location.origin}/#/olcek-yonetim?patient=${selectedPatient.id}&scale=${selectedFormToSend.id}`
    };

    allApplications.push(application);
    localStorage.setItem('olcekApplications', JSON.stringify(allApplications));

    // Formu isteneceklerden yapılanlara taşı
    setRequestedForms(requestedForms.filter(f => f.id !== selectedFormToSend.id));
    setCompletedForms([...completedForms, selectedFormToSend]);

    // Gönderme yöntemine göre işlem
    switch (sendMethod) {
      case 'tablet':
        alert(`${selectedFormToSend.name} tablete gönderildi. Hasta kodu: ${selectedPatient.tcNo || selectedPatient.id}`);
        break;
      case 'sms':
        alert(`${selectedFormToSend.name} SMS ile ${phoneNumber} numarasına gönderildi.`);
        break;
      case 'whatsapp':
        alert(`${selectedFormToSend.name} WhatsApp ile ${phoneNumber} numarasına gönderildi.`);
        break;
      case 'email':
        alert(`${selectedFormToSend.name} ${email} adresine email ile gönderildi.`);
        break;
      case 'open':
        // Dialog içinde formu aç - tam scale verisini localStorage'dan yükle
        const allScales = JSON.parse(localStorage.getItem('olcekScales') || '[]');
        const fullScale = allScales.find(s => s.id === selectedFormToSend.id) || selectedFormToSend;
        
        setFillFormData({
          application: application,
          scale: fullScale
        });
        setFormAnswers({});
        setOpenFillFormDialog(true);
        break;
      default:
        break;
    }

    handleCloseSendDialog();
  };

  const handleCreateForm = () => {
    if (!newFormName.trim()) {
      alert('Lütfen form adı girin!');
      return;
    }
    if (!newFormType) {
      alert('Lütfen form tipi seçin!');
      return;
    }

    const institution = JSON.parse(localStorage.getItem('olcekInstitution') || '{}');
    const allScales = JSON.parse(localStorage.getItem('olcekScales') || '[]');

    const newForm = {
      id: Date.now().toString(),
      name: newFormName,
      type: newFormType,
      institutionId: institution.id || 'inst1',
      createdBy: currentUser?.name || 'Admin',
      createdAt: new Date().toISOString(),
      questions: []
    };

    allScales.push(newForm);
    localStorage.setItem('olcekScales', JSON.stringify(allScales));

    setAvailableForms([...availableForms, newForm]);
    setOpenFormDialog(false);
    setNewFormName('');
    setNewFormType('');
    alert('Form başarıyla oluşturuldu!');
  };

  // Ölçek giriş formunu göster/gizle
  const handleSaveScale = (scale) => {
    if (editingScale) {
      // Düzenleme modu - mevcut ölçeği güncelle
      const allScales = JSON.parse(localStorage.getItem('olcekScales') || '[]');
      const updatedScales = allScales.map(s => s.id === editingScale.id ? { ...scale, id: editingScale.id } : s);
      localStorage.setItem('olcekScales', JSON.stringify(updatedScales));
      
      const updatedAvailableForms = availableForms.map(f => f.id === editingScale.id ? { ...scale, id: editingScale.id } : f);
      setAvailableForms(updatedAvailableForms);
      setEditingScale(null);
      alert('Ölçek başarıyla güncellendi!');
    } else {
      // Yeni ekleme
      setAvailableForms([...availableForms, scale]);
      alert('Ölçek başarıyla kaydedildi!');
    }
    setShowScaleInput(false);
  };

  const handleEditScale = (scale) => {
    // LocalStorage'dan tam scale verisini yükle
    const allScales = JSON.parse(localStorage.getItem('olcekScales') || '[]');
    const fullScale = allScales.find(s => s.id === scale.id) || scale;
    setEditingScale(fullScale);
    setShowScaleInput(true);
  };

  const handleDeleteScale = (scaleId) => {
    if (!window.confirm('Bu ölçeği silmek istediğinizden emin misiniz?')) return;
    
    const allScales = JSON.parse(localStorage.getItem('olcekScales') || '[]');
    const updatedScales = allScales.filter(s => s.id !== scaleId);
    localStorage.setItem('olcekScales', JSON.stringify(updatedScales));
    
    setAvailableForms(availableForms.filter(f => f.id !== scaleId));
    alert('Ölçek silindi.');
  };

  const handleShowResult = (form) => {
    if (!selectedPatient) return;
    
    // Bu hasta ve forma ait tüm uygulamaları getir
    const allApplications = JSON.parse(localStorage.getItem('olcekApplications') || '[]');
    
    console.log('All applications:', allApplications);
    console.log('Looking for:', {
      patientId: selectedPatient.code,
      scaleId: form.id,
      institutionId: institutionData?.id
    });
    
    const patientApplications = allApplications.filter(
      app => {
        const matchPatient = app.patientId === selectedPatient.code || app.patientId === selectedPatient.id || app.patientId === selectedPatient.tcNo;
        const matchScale = app.scaleId === form.id;
        const matchStatus = app.status === 'completed';
        const matchInstitution = !institutionData || app.institutionId === institutionData.id;
        
        console.log('Checking app:', app.id, { matchPatient, matchScale, matchStatus, matchInstitution });
        
        return matchPatient && matchScale && matchStatus && matchInstitution;
      }
    ).sort((a, b) => new Date(b.completedDate) - new Date(a.completedDate));
    
    console.log('Filtered applications:', patientApplications);
    
    if (patientApplications.length === 0) {
      alert('Bu form için henüz tamamlanmış test bulunmuyor.');
      return;
    }
    
    setSelectedResult({ form, applications: patientApplications });
    setSelectedHistoryTest(patientApplications[0]);
    setOpenResultDialog(true);
  };

  const handleZoomColumn = (columnType) => {
    setZoomColumn(columnType);
    setZoomDialogOpen(true);
  };

  const renderFormAnswers = (application) => {
    if (!application || !application.answers) {
      return <Typography color="text.secondary">Cevap bulunamadı</Typography>;
    }

    const scale = selectedResult.form;
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
    if (!selectedResult || !selectedResult.applications) return null;

    const scale = selectedResult.form;
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
            {selectedResult.applications.map((app, idx) => {
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
    if (!selectedResult || !selectedResult.applications) return null;

    const chartData = selectedResult.applications
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

  const handleSaveFillForm = () => {
    if (!fillFormData) return;

    // Cevapları kontrol et
    const scale = fillFormData.scale;
    const unansweredQuestions = (scale.questions || []).filter((q, idx) => !formAnswers[idx]);
    
    if (unansweredQuestions.length > 0) {
      if (!window.confirm(`${unansweredQuestions.length} soru cevaplanmadı. Yine de kaydetmek istiyor musunuz?`)) {
        return;
      }
    }

    // Toplam puanı hesapla
    let totalScore = 0;
    (scale.questions || []).forEach((question, idx) => {
      const answer = formAnswers[idx];
      if (answer !== undefined && answer !== null && answer !== '') {
        // Seçeneklerden puanı bul
        if (question.options && Array.isArray(question.options)) {
          const option = question.options.find(opt => {
            if (typeof opt === 'object') {
              return String(opt.score) === String(answer) || String(opt.value) === String(answer);
            }
            return String(opt) === String(answer);
          });
          
          if (option && typeof option === 'object' && option.score !== undefined) {
            totalScore += Number(option.score);
          } else if (typeof option === 'number') {
            totalScore += option;
          } else if (!isNaN(Number(answer))) {
            totalScore += Number(answer);
          }
        } else if (!isNaN(Number(answer))) {
          totalScore += Number(answer);
        }
      }
    });

    // Application'ı güncelle - completed olarak işaretle
    const allApplications = JSON.parse(localStorage.getItem('olcekApplications') || '[]');
    const updatedApplications = allApplications.map(app => {
      if (app.id === fillFormData.application.id) {
        return {
          ...app,
          status: 'completed',
          completedDate: new Date().toISOString(),
          answers: formAnswers,
          totalScore: totalScore
        };
      }
      return app;
    });
    localStorage.setItem('olcekApplications', JSON.stringify(updatedApplications));

    // Formu yapılanlara taşı
    setRequestedForms(requestedForms.filter(f => f.id !== selectedFormToSend.id));
    setCompletedForms([...completedForms, selectedFormToSend]);

    alert(`${scale.name} başarıyla kaydedildi!`);
    setOpenFillFormDialog(false);
    setFillFormData(null);
    setFormAnswers({});
    handleCloseSendDialog();
  };

  if (showScaleInput) {
    return (
      <OlcekOlustur 
        onBack={() => {
          setShowScaleInput(false);
          setEditingScale(null);
        }}
        onSave={handleSaveScale}
        editingScale={editingScale}
      />
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AssessmentIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
              <Typography variant="h4">Ölçek Yönetimi</Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setShowScaleInput(true)}
              sx={{ fontWeight: 'bold' }}
            >
              Ölçek Gir
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Alert severity="info" sx={{ mb: 2 }}>
            Hastalara psikolojik ölçekler göndermek için bu paneli kullanın.
          </Alert>

          {/* Hasta Seçimi Bölümü */}
          <Card variant="outlined" sx={{ mb: 3, bgcolor: isPatientActive ? 'success.light' : 'grey.100' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Hasta Seçimi
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Hasta Ara"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={isPatientActive}
                    placeholder="Ad, TC No veya Telefon ile ara..."
                  />
                  
                  {!isPatientActive && (
                    <Box sx={{ 
                      mt: 2, 
                      maxHeight: 300, 
                      overflow: 'auto',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1
                    }}>
                      <List dense>
                        {filteredPatients.length === 0 ? (
                          <ListItem>
                            <ListItemText 
                              primary="Hasta bulunamadı" 
                              secondary="Hasta Muayene sayfasından hasta ekleyin"
                            />
                          </ListItem>
                        ) : (
                          filteredPatients.map((patient) => (
                            <ListItem
                              key={patient.id}
                              button
                              onDoubleClick={() => handlePatientDoubleClick(patient)}
                              sx={{
                                '&:hover': { bgcolor: 'action.hover' },
                                borderBottom: '1px solid',
                                borderColor: 'divider'
                              }}
                            >
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {patient.timeSlot && (
                                      <Chip 
                                        label={patient.timeSlot} 
                                        size="small" 
                                        color="info"
                                        sx={{ minWidth: 60 }}
                                      />
                                    )}
                                    <Typography>{patient.name}</Typography>
                                  </Box>
                                }
                                secondary={`TC: ${patient.tcNo || 'Yok'} | Tel: ${patient.phone || 'Yok'}`}
                              />
                              <Chip label="Çift Tıkla" size="small" color="primary" />
                            </ListItem>
                          ))
                        )}
                      </List>
                    </Box>
                  )}
                </Grid>
                
                <Grid item xs={12} md={6}>
                  {isPatientActive && selectedPatient ? (
                    <Box>
                      <Alert severity="success" sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Seçili Hasta
                        </Typography>
                        <Typography variant="body2">
                          <strong>Ad Soyad:</strong> {selectedPatient.name}
                        </Typography>
                        <Typography variant="body2">
                          <strong>TC No:</strong> {selectedPatient.tcNo || 'Belirtilmemiş'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Telefon:</strong> {selectedPatient.phone || 'Belirtilmemiş'}
                        </Typography>
                      </Alert>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={handleResetPatient}
                        fullWidth
                      >
                        Farklı Hasta Seç
                      </Button>
                    </Box>
                  ) : (
                    <Alert severity="info">
                      <Typography variant="body2">
                        Hasta listesinden bir hastayı <strong>çift tıklayarak</strong> seçin.
                      </Typography>
                    </Alert>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Ana Grid Layout */}
          <Grid container spacing={3}>
            {/* Sol: Formlar */}
            <Grid item xs={12} md={5}>
              <Card variant="outlined" sx={{ height: '500px', overflow: 'auto' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssessmentIcon /> Mevcut Formlar
                  </Typography>
                  <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                    Çift tıklayın veya sağ tarafa sürükleyin
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <List>
                    {availableForms.filter(form => form && form.id).map((form) => (
                      <ListItem
                        key={form.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, form)}
                        onDoubleClick={() => handleFormDoubleClick(form)}
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          mb: 1,
                          cursor: 'grab',
                          '&:hover': { bgcolor: 'action.hover' },
                          '&:active': { cursor: 'grabbing' },
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <DragIndicatorIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <ListItemText primary={form.name} />
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditScale(form);
                          }}
                          sx={{ ml: 1 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteScale(form.id);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </ListItem>
                    ))}
                  </List>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenFormDialog(true)}
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    Yeni Form Oluştur
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Sağ: İstenecekler ve Yapılanlar */}
            <Grid item xs={12} md={7}>
              <Grid container spacing={2}>
                {/* İstenecekler */}
                <Grid item xs={12} md={6}>
                  <Card
                    variant="outlined"
                    sx={{ height: '500px', overflow: 'auto', bgcolor: 'grey.50' }}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'requested')}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary">
                        İstenecekler
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <List>
                        {requestedForms.filter(form => form && form.id).map((form) => (
                          <ListItem
                            key={form.id}
                            sx={{
                              border: '1px solid',
                              borderColor: 'primary.main',
                              borderRadius: 1,
                              mb: 1,
                              bgcolor: 'white',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'stretch'
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                              <ListItemText primary={form.name} />
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveFromRequested(form.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                            <Button
                              fullWidth
                              size="small"
                              variant="contained"
                              startIcon={<SendIcon />}
                              onClick={() => handleOpenSendDialog(form)}
                              sx={{ mt: 1 }}
                              disabled={!selectedPatient}
                            >
                              Gönder
                            </Button>
                          </ListItem>
                        ))}
                        {requestedForms.length === 0 && (
                          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
                            Form eklemek için sol taraftan sürükleyin veya çift tıklayın
                          </Typography>
                        )}
                      </List>
                      {requestedForms.length > 1 && (
                        <Button
                          fullWidth
                          variant="contained"
                          color="secondary"
                          startIcon={<SendIcon />}
                          onClick={handleSendForms}
                          sx={{ mt: 2 }}
                          disabled={!selectedPatient}
                        >
                          Tümünü Gönder ({requestedForms.length})
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Yapılanlar */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ height: '500px', overflow: 'auto', bgcolor: 'grey.50' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="success.main">
                        Yapılanlar
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <List>
                        {(() => {
                          // Formları grupla ve say
                          const formCounts = {};
                          completedForms.filter(form => form && form.id).forEach(form => {
                            if (!formCounts[form.id]) {
                              formCounts[form.id] = { form, count: 0 };
                            }
                            formCounts[form.id].count++;
                          });
                          
                          return Object.values(formCounts).map(({ form, count }) => (
                            <ListItem
                              key={form.id}
                              sx={{
                                border: '1px solid',
                                borderColor: 'success.main',
                                borderRadius: 1,
                                mb: 1,
                                bgcolor: 'white',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                            >
                              <ListItemText
                                primary={form.name}
                                secondary={
                                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                    <Chip label="Gönderildi" color="success" size="small" />
                                    <Chip label={`${count} kez dolduruldu`} color="info" size="small" />
                                  </Box>
                                }
                              />
                              <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                onClick={() => handleShowResult(form)}
                                sx={{ ml: 2 }}
                              >
                                Sonuç Göster
                              </Button>
                            </ListItem>
                          ));
                        })()}
                        {completedForms.length === 0 && (
                          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
                            Gönderilen formlar burada görünecek
                          </Typography>
                        )}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Gönderme Seçenekleri Dialog */}
      <Dialog open={openSendDialog} onClose={handleCloseSendDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Form Gönderme Seçenekleri
          {selectedFormToSend && (
            <Typography variant="body2" color="text.secondary">
              {selectedFormToSend.name}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Gönderim Yöntemi Seçin</FormLabel>
              <RadioGroup
                value={sendMethod}
                onChange={(e) => setSendMethod(e.target.value)}
              >
                <FormControlLabel
                  value="tablet"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TabletIcon />
                      <Box>
                        <Typography variant="body1">Tablete Gönder</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Hasta tabletten kendi kodunu girip formu dolduracak
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="sms"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SmsIcon />
                      <Box>
                        <Typography variant="body1">SMS ile Link Gönder</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Hastanın telefon numarasına SMS gönderilir
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="whatsapp"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WhatsAppIcon />
                      <Box>
                        <Typography variant="body1">WhatsApp Mesajı</Typography>
                        <Typography variant="caption" color="text.secondary">
                          WhatsApp üzerinden link gönderilir
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="email"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon />
                      <Box>
                        <Typography variant="body1">Email Gönder</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Email adresine form linki gönderilir
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="open"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <OpenInNewIcon />
                      <Box>
                        <Typography variant="body1">Formu Aç</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Doktor formu kendisi dolduracak
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>

            {/* Telefon numarası girişi (SMS ve WhatsApp için) */}
            {(sendMethod === 'sms' || sendMethod === 'whatsapp') && (
              <TextField
                fullWidth
                label="Telefon Numarası"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="05XX XXX XX XX"
                sx={{ mt: 3 }}
                helperText="Telefon numarasını başında 0 ile girin"
              />
            )}

            {/* Email adresi girişi */}
            {sendMethod === 'email' && (
              <TextField
                fullWidth
                label="Email Adresi"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                sx={{ mt: 3 }}
                helperText="Geçerli bir email adresi girin"
              />
            )}

            {sendMethod === 'tablet' && (
              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  Hasta Kodu: <strong>{selectedPatient?.tcNo || selectedPatient?.id}</strong>
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Hasta bu kodu tablette girerek formları görebilir.
                </Typography>
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSendDialog}>İptal</Button>
          <Button 
            onClick={handleSendForm} 
            variant="contained"
            disabled={
              (sendMethod === 'sms' || sendMethod === 'whatsapp') && !phoneNumber ||
              sendMethod === 'email' && !email
            }
          >
            {sendMethod === 'open' ? 'Aç' : 'Gönder'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Form Doldurma Dialog */}
      <Dialog 
        open={openFillFormDialog} 
        onClose={() => setOpenFillFormDialog(false)} 
        maxWidth="md" 
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          {fillFormData?.scale.name || 'Form Doldur'}
          <Typography variant="caption" display="block" color="text.secondary">
            Hasta: {selectedPatient?.name} • TC: {selectedPatient?.tcNo}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ pt: 1 }}>
            {fillFormData && fillFormData.scale.questions && fillFormData.scale.questions.length > 0 ? (
              fillFormData.scale.questions.map((question, qIndex) => (
                <Card key={qIndex} sx={{ mb: 3, p: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                    {qIndex + 1}. {question.text}
                  </Typography>

                  {question.type === 'likert' && (
                    <RadioGroup
                      value={formAnswers[qIndex] !== undefined ? String(formAnswers[qIndex]) : ''}
                      onChange={(e) => {
                        const newAnswers = { ...formAnswers };
                        newAnswers[qIndex] = e.target.value;
                        setFormAnswers(newAnswers);
                      }}
                    >
                      {question.options?.map((option, oIndex) => {
                        const isObject = typeof option === 'object' && option !== null;
                        const optionValue = isObject ? (option.score !== undefined ? option.score : option.value || option.text || oIndex) : option;
                        const optionLabel = isObject ? (option.text || option.label || option.value || option) : option;
                        
                        return (
                          <FormControlLabel
                            key={oIndex}
                            value={String(optionValue)}
                            control={<Radio />}
                            label={String(optionLabel)}
                          />
                        );
                      })}
                    </RadioGroup>
                  )}

                  {question.type === 'multiple' && (
                    <RadioGroup
                      value={formAnswers[qIndex] !== undefined ? String(formAnswers[qIndex]) : ''}
                      onChange={(e) => {
                        const newAnswers = { ...formAnswers };
                        newAnswers[qIndex] = e.target.value;
                        setFormAnswers(newAnswers);
                      }}
                    >
                      {question.options?.map((option, oIndex) => {
                        const isObject = typeof option === 'object' && option !== null;
                        const optionValue = isObject ? (option.score !== undefined ? option.score : option.value || option.text || oIndex) : option;
                        const optionLabel = isObject ? (option.text || option.label || option.value || option) : option;
                        
                        return (
                          <FormControlLabel
                            key={oIndex}
                            value={String(optionValue)}
                            control={<Radio />}
                            label={String(optionLabel)}
                          />
                        );
                      })}
                    </RadioGroup>
                  )}

                  {question.type === 'openended' && (
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      value={formAnswers[qIndex] || ''}
                      onChange={(e) => {
                        const newAnswers = { ...formAnswers };
                        newAnswers[qIndex] = e.target.value;
                        setFormAnswers(newAnswers);
                      }}
                      placeholder="Cevabınızı buraya yazın..."
                      variant="outlined"
                    />
                  )}
                </Card>
              ))
            ) : (
              <Alert severity="warning">
                Bu formda henüz soru bulunmamaktadır.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFillFormDialog(false)}>İptal</Button>
          <Button onClick={handleSaveFillForm} variant="contained" color="primary">
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Form Oluşturma Dialog */}
      <Dialog open={openFormDialog} onClose={() => setOpenFormDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Yeni Form Oluştur</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Form Adı"
              value={newFormName}
              onChange={(e) => setNewFormName(e.target.value)}
              placeholder="Örn: Beck Depresyon Ölçeği"
              sx={{ mb: 3 }}
            />
            
            <FormControl fullWidth>
              <InputLabel>Form Tipi</InputLabel>
              <Select
                value={newFormType}
                onChange={(e) => setNewFormType(e.target.value)}
                label="Form Tipi"
              >
                <MenuItem value="likert">Likert Ölçeği (1-5 Puanlama)</MenuItem>
                <MenuItem value="multiple">Çoktan Seçmeli</MenuItem>
                <MenuItem value="openended">Açık Uçlu Sorular</MenuItem>
              </Select>
            </FormControl>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              Form oluşturulduktan sonra soru ekleme ekranına yönlendirileceksiniz.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFormDialog(false)}>İptal</Button>
          <Button onClick={handleCreateForm} variant="contained">
            Oluştur
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sonuç Göster Dialog */}
      <Dialog
        open={openResultDialog}
        onClose={() => setOpenResultDialog(false)}
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle>
          Test Sonuçları - {selectedResult?.form?.name}
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
          <Button onClick={() => setOpenResultDialog(false)} variant="contained">
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
    </Box>
  );
};

export default OlcekYonetimPanel;
