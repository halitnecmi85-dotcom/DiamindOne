import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Button,
  Divider,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Paper,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar
} from '@mui/material';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const Randevu = () => {
  const [employees, setEmployees] = useState([]);
  const [patients, setPatients] = useState([]);
  const [schedules, setSchedules] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });
  
  const [openAppointmentDialog, setOpenAppointmentDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [appointmentForm, setAppointmentForm] = useState({
    name: '',
    phone: '',
    email: '',
    tcNo: '',
    birthDate: '',
    gender: '',
    notes: '',
    appointmentType: 'Muayene',
    recurringPattern: '',
    recurringCount: 1
  });
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const daysOfWeek = [
    'Pazartesi',
    'Salı',
    'Çarşamba',
    'Perşembe',
    'Cuma',
    'Cumartesi',
    'Pazar'
  ];

  useEffect(() => {
    const loadData = () => {
      const storedEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
      const storedSchedules = JSON.parse(localStorage.getItem('employeeSchedules') || '{}');
      const storedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      const storedPatients = JSON.parse(localStorage.getItem('patients') || '[]');
      setEmployees(storedEmployees);
      setSchedules(storedSchedules);
      setAppointments(storedAppointments);
      setPatients(storedPatients);
    };
    loadData();

    const onAppointmentsUpdated = () => {
      const storedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      setAppointments(storedAppointments);
    };
    
    const onPatientsUpdated = () => {
      const storedPatients = JSON.parse(localStorage.getItem('patients') || '[]');
      setPatients(storedPatients);
    };
    
    window.addEventListener('appointmentsUpdated', onAppointmentsUpdated);
    window.addEventListener('patientsUpdated', onPatientsUpdated);
    
    return () => {
      window.removeEventListener('appointmentsUpdated', onAppointmentsUpdated);
      window.removeEventListener('patientsUpdated', onPatientsUpdated);
    };
  }, []);

  const handlePatientInfoChange = (e) => {
    const { name, value } = e.target;
    setAppointmentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const getTimeSlots = (startTime, endTime, slotDuration, lunchStart, lunchEnd) => {
    const slots = [];
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    let current = startH * 60 + startM;
    const end = endH * 60 + endM;

    let lunchStartMin = null;
    let lunchEndMin = null;
    if (lunchStart && lunchEnd) {
      const [lsH, lsM] = lunchStart.split(':').map(Number);
      const [leH, leM] = lunchEnd.split(':').map(Number);
      lunchStartMin = lsH * 60 + lsM;
      lunchEndMin = leH * 60 + leM;
    }

    while (current < end) {
      const hh = Math.floor(current / 60);
      const mm = current % 60;
      const timeStr = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
      
      const isDuringLunch = lunchStartMin !== null && lunchEndMin !== null && current >= lunchStartMin && current < lunchEndMin;
      
      slots.push({ time: timeStr, isDuringLunch });
      current += slotDuration;
    }
    return slots;
  };

  const handleSlotClick = (date, time, dayOfWeek) => {
    const dateStr = date.toISOString().split('T')[0];
    const daySchedule = schedules[selectedEmployee]?.find(sch => sch.dayOfWeek === dayOfWeek);
    
    if (!daySchedule) {
      setSnackbar({
        open: true,
        message: 'Bu gün için çalışma saati tanımlanmamış.',
        severity: 'warning'
      });
      return;
    }

    if (daySchedule.lunchBreakStart && daySchedule.lunchBreakEnd) {
      const [slotH, slotM] = time.split(':').map(Number);
      const [lsH, lsM] = daySchedule.lunchBreakStart.split(':').map(Number);
      const [leH, leM] = daySchedule.lunchBreakEnd.split(':').map(Number);
      const slotMin = slotH * 60 + slotM;
      const lunchStartMin = lsH * 60 + lsM;
      const lunchEndMin = leH * 60 + leM;
      
      if (slotMin >= lunchStartMin && slotMin < lunchEndMin) {
        setSnackbar({
          open: true,
          message: 'Öğle arası süresince randevu verilemez.',
          severity: 'warning'
        });
        return;
      }
    }

    const isBooked = appointments.some(apt => apt.employeeId === selectedEmployee && apt.date === dateStr && apt.timeSlot === time);
    if (isBooked) {
      setSnackbar({
        open: true,
        message: 'Bu saat dilimi zaten dolu.',
        severity: 'warning'
      });
      return;
    }

    setSelectedSlot({ date: dateStr, time, dayOfWeek });
    setAppointmentForm({ 
      name: '', 
      phone: '', 
      email: '',
      tcNo: '',
      birthDate: '',
      gender: '',
      notes: '',
      appointmentType: 'Muayene',
      recurringPattern: '',
      recurringCount: 1
    });
    setOpenAppointmentDialog(true);
  };

  const handleCreateAppointment = () => {
    if (!appointmentForm.name || !appointmentForm.phone) {
      setSnackbar({
        open: true,
        message: 'Hasta adı ve telefon zorunludur.',
        severity: 'error'
      });
      return;
    }

    const existingPatient = patients.find(p => 
      p.phone === appointmentForm.phone || 
      (appointmentForm.tcNo && p.tcNo === appointmentForm.tcNo)
    );

    if (!existingPatient) {
      const newPatient = {
        id: Date.now(),
        name: appointmentForm.name,
        phone: appointmentForm.phone,
        email: appointmentForm.email,
        tcNo: appointmentForm.tcNo,
        birthDate: appointmentForm.birthDate,
        gender: appointmentForm.gender,
        notes: appointmentForm.notes
      };
      const updatedPatients = [...patients, newPatient];
      setPatients(updatedPatients);
      localStorage.setItem('patients', JSON.stringify(updatedPatients));
      window.dispatchEvent(new Event('patientsUpdated'));
    }

    const selectedEmployeeData = employees.find(emp => emp.id === selectedEmployee);
    const newAppointments = [];
    const recurringSeriesId = Date.now().toString() + Math.random();
    const count = appointmentForm.recurringPattern ? parseInt(appointmentForm.recurringCount) || 1 : 1;

    for (let i = 0; i < count; i++) {
      let appointmentDate = new Date(selectedSlot.date);
      
      if (appointmentForm.recurringPattern && i > 0) {
        switch (appointmentForm.recurringPattern) {
          case 'Haftada 1':
            appointmentDate.setDate(appointmentDate.getDate() + (i * 7));
            break;
          case '2 Haftada 1':
            appointmentDate.setDate(appointmentDate.getDate() + (i * 14));
            break;
          case '3 Haftada 1':
            appointmentDate.setDate(appointmentDate.getDate() + (i * 21));
            break;
          case 'Ayda 1':
            appointmentDate.setMonth(appointmentDate.getMonth() + i);
            break;
        }
      }

      const dateStr = appointmentDate.toISOString().split('T')[0];
      const dayName = daysOfWeek[appointmentDate.getDay() === 0 ? 6 : appointmentDate.getDay() - 1];

      const isBooked = appointments.some(apt => 
        apt.employeeId === selectedEmployee && 
        apt.date === dateStr && 
        apt.timeSlot === selectedSlot.time
      );

      if (!isBooked) {
        newAppointments.push({
          id: Date.now().toString() + '_' + i + '_' + Math.random(),
          employeeId: selectedEmployee,
          employeeName: selectedEmployeeData?.name,
          name: appointmentForm.name,
          phone: appointmentForm.phone,
          date: dateStr,
          dayOfWeek: dayName,
          timeSlot: selectedSlot.time,
          notes: appointmentForm.notes,
          appointmentType: appointmentForm.appointmentType || 'Muayene',
          recurringPattern: appointmentForm.recurringPattern || '',
          recurringSeriesId: appointmentForm.recurringPattern ? recurringSeriesId : null,
          status: 'pending',
          createdAt: new Date().toLocaleString('tr-TR')
        });
      }
    }

    if (newAppointments.length === 0) {
      setSnackbar({
        open: true,
        message: 'Seçilen slot(lar) zaten dolu.',
        severity: 'warning'
      });
      return;
    }

    const updatedAppointments = [...appointments, ...newAppointments];
    setAppointments(updatedAppointments);
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    window.dispatchEvent(new Event('appointmentsUpdated'));

    setOpenAppointmentDialog(false);
    setAppointmentForm({ 
      name: '', 
      phone: '', 
      email: '',
      tcNo: '',
      birthDate: '',
      gender: '',
      notes: '',
      appointmentType: 'Muayene', 
      recurringPattern: '', 
      recurringCount: 1 
    });
    
    setSnackbar({
      open: true,
      message: `${newAppointments.length} randevu başarıyla oluşturuldu${!existingPatient ? ' ve hasta sisteme kaydedildi' : ''}.`,
      severity: 'success'
    });
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentWeekStart(newDate);
  };

  const weekDays = getWeekDays();

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 56, height: 56 }}>
                <EventIcon fontSize="large" />
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="h2" fontWeight="bold">
                  Randevu Yönetimi
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Personel seçin ve randevu oluşturun
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />

            <FormControl fullWidth>
              <InputLabel>Personel Seçin</InputLabel>
              <Select
                value={selectedEmployee}
                label="Personel Seçin"
                onChange={(e) => setSelectedEmployee(e.target.value)}
              >
                <MenuItem value="">Seçiniz</MenuItem>
                {employees.map((employee) => (
                  <MenuItem key={employee.id} value={employee.id}>
                    {employee.name} ({employee.position})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </CardContent>
        </Card>
      </Grid>

      {selectedEmployee && schedules[selectedEmployee] && schedules[selectedEmployee].length > 0 && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                    <CalendarMonthIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold">
                    {employees.find(emp => emp.id === selectedEmployee)?.name} - Haftalık Randevu Takvimi
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" variant="outlined" onClick={() => navigateWeek(-1)}>← Önceki Hafta</Button>
                  <Button size="small" variant="outlined" onClick={() => navigateWeek(1)}>Sonraki Hafta →</Button>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />

              <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 600, overflow: 'auto' }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ bgcolor: 'background.paper', minWidth: 80, fontWeight: 'bold' }}>Saat</TableCell>
                      {weekDays.map((date, idx) => {
                        const dayName = daysOfWeek[date.getDay() === 0 ? 6 : date.getDay() - 1];
                        return (
                          <TableCell key={idx} align="center" sx={{ bgcolor: 'background.paper', minWidth: 120 }}>
                            <Typography variant="body2" fontWeight="bold">{dayName}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                            </Typography>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(() => {
                      const allSlots = new Set();
                      weekDays.forEach((date) => {
                        const dayName = daysOfWeek[date.getDay() === 0 ? 6 : date.getDay() - 1];
                        const daySchedule = schedules[selectedEmployee]?.find(sch => sch.dayOfWeek === dayName);
                        if (daySchedule) {
                          const slots = getTimeSlots(daySchedule.startTime, daySchedule.endTime, daySchedule.slotDuration, daySchedule.lunchBreakStart, daySchedule.lunchBreakEnd);
                          slots.forEach(slot => allSlots.add(slot.time));
                        }
                      });
                      const sortedSlots = Array.from(allSlots).sort();

                      return sortedSlots.map((timeSlot) => (
                        <TableRow key={timeSlot}>
                          <TableCell sx={{ fontWeight: 'bold', bgcolor: 'action.hover' }}>{timeSlot}</TableCell>
                          {weekDays.map((date, idx) => {
                            const dayName = daysOfWeek[date.getDay() === 0 ? 6 : date.getDay() - 1];
                            const dateStr = date.toISOString().split('T')[0];
                            const daySchedule = schedules[selectedEmployee]?.find(sch => sch.dayOfWeek === dayName);
                            
                            if (!daySchedule) {
                              return <TableCell key={idx} sx={{ bgcolor: 'grey.100' }}></TableCell>;
                            }

                            const slots = getTimeSlots(daySchedule.startTime, daySchedule.endTime, daySchedule.slotDuration, daySchedule.lunchBreakStart, daySchedule.lunchBreakEnd);
                            const slotExists = slots.find(s => s.time === timeSlot);
                            
                            if (!slotExists) {
                              return <TableCell key={idx} sx={{ bgcolor: 'grey.100' }}></TableCell>;
                            }

                            const isDuringLunch = slotExists.isDuringLunch;
                            const appointment = appointments.find(apt => apt.employeeId === selectedEmployee && apt.date === dateStr && apt.timeSlot === timeSlot);

                            if (isDuringLunch) {
                              return (
                                <TableCell key={idx} sx={{ bgcolor: 'warning.light', textAlign: 'center' }}>
                                  <Typography variant="caption" color="text.secondary">Öğle Arası</Typography>
                                </TableCell>
                              );
                            }

                            if (appointment) {
                              const appointmentColors = {
                                'muayene': 'rgba(25, 118, 210, 0.2)',
                                'seans': 'rgba(46, 125, 50, 0.2)',
                                'test': 'rgba(237, 108, 2, 0.2)',
                                'toplantı': 'rgba(123, 31, 162, 0.2)'
                              };
                              const bgColor = appointmentColors[appointment.appointmentType?.toLocaleLowerCase('tr-TR')] || 'success.light';
                              
                              return (
                                <TableCell key={idx} sx={{ bgcolor: bgColor, p: 0.5, cursor: 'pointer' }}>
                                  <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="caption" fontWeight="bold" sx={{ display: 'block', lineHeight: 1.2 }}>
                                      {appointment.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                      {appointment.phone}
                                    </Typography>
                                  </Box>
                                </TableCell>
                              );
                            }

                            const scheduleColors = {
                              'muayene': 'rgba(25, 118, 210, 0.05)',
                              'seans': 'rgba(46, 125, 50, 0.05)',
                              'test': 'rgba(237, 108, 2, 0.05)',
                              'toplantı': 'rgba(123, 31, 162, 0.05)'
                            };
                            const slotBgColor = scheduleColors[daySchedule.appointmentType?.toLocaleLowerCase('tr-TR')] || 'background.paper';

                            return (
                              <TableCell 
                                key={idx} 
                                sx={{ 
                                  bgcolor: slotBgColor, 
                                  cursor: 'pointer',
                                  '&:hover': { 
                                    bgcolor: daySchedule.appointmentType?.toLocaleLowerCase('tr-TR') === 'muayene' ? 'rgba(25, 118, 210, 0.15)' :
                                              daySchedule.appointmentType?.toLocaleLowerCase('tr-TR') === 'seans' ? 'rgba(46, 125, 50, 0.15)' :
                                              daySchedule.appointmentType?.toLocaleLowerCase('tr-TR') === 'test' ? 'rgba(237, 108, 2, 0.15)' :
                                              daySchedule.appointmentType?.toLocaleLowerCase('tr-TR') === 'toplantı' ? 'rgba(123, 31, 162, 0.15)' :
                                              'primary.light'
                                  }
                                }}
                                onClick={() => handleSlotClick(date, timeSlot, dayName)}
                              >
                                <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block' }}>
                                  +
                                </Typography>
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ));
                    })()}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 20, height: 20, bgcolor: 'rgba(25, 118, 210, 0.2)', border: '1px solid rgba(25, 118, 210, 0.5)' }}></Box>
                  <Typography variant="caption">Muayene</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 20, height: 20, bgcolor: 'rgba(46, 125, 50, 0.2)', border: '1px solid rgba(46, 125, 50, 0.5)' }}></Box>
                  <Typography variant="caption">Seans</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 20, height: 20, bgcolor: 'rgba(237, 108, 2, 0.2)', border: '1px solid rgba(237, 108, 2, 0.5)' }}></Box>
                  <Typography variant="caption">Test</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 20, height: 20, bgcolor: 'rgba(123, 31, 162, 0.2)', border: '1px solid rgba(123, 31, 162, 0.5)' }}></Box>
                  <Typography variant="caption">Toplantı</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 20, height: 20, bgcolor: 'warning.light', border: '1px solid orange' }}></Box>
                  <Typography variant="caption">Öğle Arası</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}

      {selectedEmployee && (!schedules[selectedEmployee] || schedules[selectedEmployee].length === 0) && (
        <Grid item xs={12}>
          <Alert severity="warning">
            Seçilen personel için çalışma takvimi tanımlanmamış. Lütfen önce Takvimim menüsünden çalışma saatlerini ekleyin.
          </Alert>
        </Grid>
      )}

      <Dialog open={openAppointmentDialog} onClose={() => setOpenAppointmentDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Yeni Randevu Oluştur</DialogTitle>
        <DialogContent>
          {selectedSlot && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Personel:</strong> {employees.find(emp => emp.id === selectedEmployee)?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Tarih:</strong> {new Date(selectedSlot.date).toLocaleDateString('tr-TR')} ({selectedSlot.dayOfWeek})
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                <strong>Saat:</strong> {selectedSlot.time}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Hasta Bilgileri
              </Typography>

              <FormControl fullWidth margin="normal">
                <InputLabel>Kayıtlı Hasta Seç</InputLabel>
                <Select
                  value=""
                  label="Kayıtlı Hasta Seç"
                  onChange={(e) => {
                    const selectedPatient = patients.find(p => p.id === e.target.value);
                    if (selectedPatient) {
                      setAppointmentForm(prev => ({
                        ...prev,
                        name: selectedPatient.name,
                        phone: selectedPatient.phone || '',
                        email: selectedPatient.email || '',
                        tcNo: selectedPatient.tcNo || '',
                        birthDate: selectedPatient.birthDate || '',
                        gender: selectedPatient.gender || ''
                      }));
                    }
                  }}
                >
                  <MenuItem value="">Manuel Giriş</MenuItem>
                  {patients.map((patient) => (
                    <MenuItem key={patient.id} value={patient.id}>
                      {patient.name} - {patient.phone}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Hasta Adı *"
                    name="name"
                    value={appointmentForm.name}
                    onChange={handlePatientInfoChange}
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Telefon *"
                    name="phone"
                    value={appointmentForm.phone}
                    onChange={handlePatientInfoChange}
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="TC Kimlik No"
                    name="tcNo"
                    value={appointmentForm.tcNo}
                    onChange={handlePatientInfoChange}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="E-posta"
                    name="email"
                    type="email"
                    value={appointmentForm.email}
                    onChange={handlePatientInfoChange}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Doğum Tarihi"
                    name="birthDate"
                    type="date"
                    value={appointmentForm.birthDate}
                    onChange={handlePatientInfoChange}
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Cinsiyet</InputLabel>
                    <Select
                      name="gender"
                      value={appointmentForm.gender}
                      label="Cinsiyet"
                      onChange={(e) => setAppointmentForm(prev => ({ ...prev, gender: e.target.value }))}
                    >
                      <MenuItem value="">Seçiniz</MenuItem>
                      <MenuItem value="Erkek">Erkek</MenuItem>
                      <MenuItem value="Kız">Kız</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Randevu Detayları
              </Typography>

              <FormControl fullWidth margin="normal">
                <InputLabel>Randevu Türü</InputLabel>
                <Select
                  name="appointmentType"
                  value={appointmentForm.appointmentType}
                  label="Randevu Türü"
                  onChange={(e) => setAppointmentForm(prev => ({ ...prev, appointmentType: e.target.value }))}
                >
                  <MenuItem value="Muayene">Muayene</MenuItem>
                  <MenuItem value="Seans">Seans</MenuItem>
                  <MenuItem value="Test">Test</MenuItem>
                  <MenuItem value="Toplantı">Toplantı</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel>Tekrar Düzeni</InputLabel>
                <Select
                  name="recurringPattern"
                  value={appointmentForm.recurringPattern}
                  label="Tekrar Düzeni"
                  onChange={(e) => setAppointmentForm(prev => ({ ...prev, recurringPattern: e.target.value }))}
                >
                  <MenuItem value="">Tekrar Yok</MenuItem>
                  <MenuItem value="Haftada 1">Haftada 1</MenuItem>
                  <MenuItem value="2 Haftada 1">2 Haftada 1</MenuItem>
                  <MenuItem value="3 Haftada 1">3 Haftada 1</MenuItem>
                  <MenuItem value="Ayda 1">Ayda 1</MenuItem>
                </Select>
              </FormControl>

              {appointmentForm.recurringPattern && (
                <TextField
                  fullWidth
                  label="Tekrar Sayısı"
                  type="number"
                  name="recurringCount"
                  value={appointmentForm.recurringCount}
                  onChange={(e) => setAppointmentForm(prev => ({ ...prev, recurringCount: Math.max(1, parseInt(e.target.value) || 1) }))}
                  margin="normal"
                  inputProps={{ min: 1, max: 52 }}
                  helperText="Kaç kez tekrar edeceğini belirtin (1-52 arası)"
                />
              )}

              <TextField
                fullWidth
                label="Notlar (İsteğe Bağlı)"
                name="notes"
                value={appointmentForm.notes}
                onChange={handlePatientInfoChange}
                margin="normal"
                multiline
                rows={3}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAppointmentDialog(false)}>İptal</Button>
          <Button onClick={handleCreateAppointment} variant="contained" color="primary">
            Randevu Oluştur
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

export default Randevu;
