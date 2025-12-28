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
  TextField,
  Chip,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormLabel,
  RadioGroup,
  Radio
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

const MyCalendar = () => {
  const [employees, setEmployees] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [schedules, setSchedules] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [openEditAppointmentDialog, setOpenEditAppointmentDialog] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', notes: '', appointmentType: 'Muayene' });
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState({
    id: '',
    dayOfWeek: '',
    selectedDays: [],
    startTime: '',
    endTime: '',
    slotDuration: 30,
    lunchBreakStart: '',
    lunchBreakEnd: '',
    appointmentType: 'muayene'
  });
  const [openAppointmentDialog, setOpenAppointmentDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [appointmentForm, setAppointmentForm] = useState({
    name: '',
    phone: '',
    notes: '',
    appointmentType: 'Muayene',
    recurringPattern: '',
    recurringCount: 1
  });
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
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
    // LocalStorage'dan personelleri ve takvimleri yükle
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

  const handleOpenDialog = () => {
    setEditMode(false);
    setCurrentSchedule({
      id: '',
      dayOfWeek: '',
      selectedDays: [],
      startTime: '',
      endTime: '',
      slotDuration: 30,
      lunchBreakStart: '',
      lunchBreakEnd: '',
      appointmentType: 'muayene'
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentSchedule({
      id: '',
      dayOfWeek: '',
      selectedDays: [],
      startTime: '',
      endTime: '',
      slotDuration: 30,
      lunchBreakStart: '',
      lunchBreakEnd: '',
      appointmentType: 'muayene'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentSchedule(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveSchedule = () => {
    // Çoklu gün seçimi için
    const daysToSave = currentSchedule.selectedDays.length > 0 
      ? currentSchedule.selectedDays 
      : (currentSchedule.dayOfWeek ? [currentSchedule.dayOfWeek] : []);
    
    if (!selectedEmployee || daysToSave.length === 0 || !currentSchedule.startTime || !currentSchedule.endTime) {
      alert('Lütfen en az bir gün seçin ve tüm saatleri doldurun!');
      return;
    }

    // Validate that startTime < endTime and duration > 0
    const [sH, sM] = currentSchedule.startTime.split(':').map(Number);
    const [eH, eM] = currentSchedule.endTime.split(':').map(Number);
    const startMinutes = sH * 60 + sM;
    const endMinutes = eH * 60 + eM;
    if (endMinutes <= startMinutes) {
      alert('Bitiş saati başlangıç saatinden sonra olmalıdır. Lütfen saatleri düzeltin.');
      return;
    }
    const duration = Number(currentSchedule.slotDuration) || 0;
    if (duration <= 0) {
      alert('Randevu süresi geçerli bir sayı olmalıdır.');
      return;
    }

    const updatedSchedules = { ...schedules };
    if (!updatedSchedules[selectedEmployee]) {
      updatedSchedules[selectedEmployee] = [];
    }

    if (editMode) {
      // Düzenleme
      updatedSchedules[selectedEmployee] = updatedSchedules[selectedEmployee].map(sch =>
        sch.id === currentSchedule.id ? { 
          ...currentSchedule, 
          dayOfWeek: String(currentSchedule.dayOfWeek).trim(), 
          slotDuration: Number(currentSchedule.slotDuration),
          appointmentType: currentSchedule.appointmentType || 'muayene'
        } : sch
      );
    } else {
      // Yeni ekleme - her seçili gün için ayrı kayıt
      daysToSave.forEach(day => {
        const newSchedule = {
          ...currentSchedule,
          id: Date.now().toString() + Math.random(),
          dayOfWeek: String(day).trim(),
          slotDuration: Number(currentSchedule.slotDuration),
          appointmentType: currentSchedule.appointmentType || 'muayene'
        };
        updatedSchedules[selectedEmployee].push(newSchedule);
      });
    }

    setSchedules(updatedSchedules);
    localStorage.setItem('employeeSchedules', JSON.stringify(updatedSchedules));
    
    // Form state'ini temizle
    setCurrentSchedule({
      id: '',
      dayOfWeek: '',
      selectedDays: [],
      startTime: '',
      endTime: '',
      slotDuration: 30,
      lunchBreakStart: '',
      lunchBreakEnd: '',
      appointmentType: 'muayene'
    });
    setOpenDialog(false);
  };

  const handleEditSchedule = (schedule) => {
    setEditMode(true);
    setCurrentSchedule(schedule);
    setOpenDialog(true);
  };

  const handleDeleteSchedule = (scheduleId) => {
    if (window.confirm('Bu çalışma saatini silmek istediğinizden emin misiniz?')) {
      const updatedSchedules = { ...schedules };
      updatedSchedules[selectedEmployee] = updatedSchedules[selectedEmployee].filter(
        sch => sch.id !== scheduleId
      );
      setSchedules(updatedSchedules);
      localStorage.setItem('employeeSchedules', JSON.stringify(updatedSchedules));
    }
  };

  const getCurrentEmployeeSchedules = () => {
    if (!selectedEmployee || !schedules[selectedEmployee]) {
      return [];
    }
    return schedules[selectedEmployee].sort((a, b) => {
      const dayOrder = daysOfWeek.indexOf(a.dayOfWeek) - daysOfWeek.indexOf(b.dayOfWeek);
      if (dayOrder !== 0) return dayOrder;
      return a.startTime.localeCompare(b.startTime);
    });
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
      
      // Check if this slot is during lunch break
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
      alert('Bu gün için çalışma saati tanımlanmamış.');
      return;
    }

    // Check if slot is during lunch break
    if (daySchedule.lunchBreakStart && daySchedule.lunchBreakEnd) {
      const [slotH, slotM] = time.split(':').map(Number);
      const [lsH, lsM] = daySchedule.lunchBreakStart.split(':').map(Number);
      const [leH, leM] = daySchedule.lunchBreakEnd.split(':').map(Number);
      const slotMin = slotH * 60 + slotM;
      const lunchStartMin = lsH * 60 + lsM;
      const lunchEndMin = leH * 60 + leM;
      
      if (slotMin >= lunchStartMin && slotMin < lunchEndMin) {
        alert('Öğle arası süresince randevu verilemez.');
        return;
      }
    }

    // Check if already booked
    const isBooked = appointments.some(apt => apt.employeeId === selectedEmployee && apt.date === dateStr && apt.timeSlot === time);
    if (isBooked) {
      alert('Bu saat dilimi zaten dolu.');
      return;
    }

    setSelectedSlot({ date: dateStr, time, dayOfWeek });
    setAppointmentForm({ name: '', phone: '', notes: '' });
    setOpenAppointmentDialog(true);
  };

  const handleCreateAppointment = () => {
    if (!appointmentForm.name || !appointmentForm.phone) {
      alert('Hasta adı ve telefon zorunludur.');
      return;
    }

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

      // Check if slot is already booked
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
      alert('Seçilen slot(lar) zaten dolu.');
      return;
    }

    const updatedAppointments = [...appointments, ...newAppointments];
    setAppointments(updatedAppointments);
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
    window.dispatchEvent(new Event('appointmentsUpdated'));

    setOpenAppointmentDialog(false);
    setAppointmentForm({ name: '', phone: '', notes: '', appointmentType: 'Muayene', recurringPattern: '', recurringCount: 1 });
    alert(`${newAppointments.length} randevu başarıyla oluşturuldu.`);
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentWeekStart(newDate);
  };

  const selectedEmployeeData = employees.find(emp => emp.id === selectedEmployee);
  const currentSchedules = getCurrentEmployeeSchedules();
  const weekDays = getWeekDays();

  return (
    <Grid container spacing={2}>
      {/* Personel Seçimi Kartı */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 56, height: 56 }}>
                <CalendarMonthIcon fontSize="large" />
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="h2" fontWeight="bold">
                  Personel Takvim Yönetimi
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Personel çalışma saatlerini tanımlayın
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

      {/* Takvim Yönetimi */}
      {selectedEmployee && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                    <EventAvailableIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {selectedEmployeeData?.name} - Çalışma Takvimi
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {currentSchedules.length} Çalışma Saati Tanımlı
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
                  Çalışma Saati Ekle
                </Button>
              </Box>
              <Divider sx={{ my: 2 }} />

              {currentSchedules.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'action.hover' }}>
                        <TableCell><strong>Gün</strong></TableCell>
                        <TableCell><strong>Saat Tipi</strong></TableCell>
                        <TableCell><strong>Başlangıç Saati</strong></TableCell>
                        <TableCell><strong>Bitiş Saati</strong></TableCell>
                        <TableCell><strong>Öğle Arası</strong></TableCell>
                        <TableCell><strong>Randevu Süresi</strong></TableCell>
                        <TableCell align="center"><strong>İşlemler</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currentSchedules.map((schedule) => {
                        const typeColors = {
                          'muayene': 'primary',
                          'seans': 'success',
                          'test': 'warning',
                          'toplantı': 'secondary'
                        };
                        const typeLabels = {
                          'muayene': 'Muayene',
                          'seans': 'Seans',
                          'test': 'Test',
                          'toplantı': 'Toplantı'
                        };
                        const appointmentType = schedule.appointmentType?.toLocaleLowerCase('tr-TR') || 'muayene';
                        
                        return (
                        <TableRow key={schedule.id} hover>
                          <TableCell>
                            <Chip label={schedule.dayOfWeek} color="primary" size="small" />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={typeLabels[appointmentType] || 'Muayene'} 
                              color={typeColors[appointmentType] || 'primary'} 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>{schedule.startTime}</TableCell>
                          <TableCell>{schedule.endTime}</TableCell>
                          <TableCell>
                            {schedule.lunchBreakStart && schedule.lunchBreakEnd ? (
                              <Typography variant="body2">{schedule.lunchBreakStart} - {schedule.lunchBreakEnd}</Typography>
                            ) : (
                              <Typography variant="body2" color="text.secondary">—</Typography>
                            )}
                          </TableCell>
                          <TableCell>{schedule.slotDuration} dakika</TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleEditSchedule(schedule)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteSchedule(schedule.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    Bu personel için henüz çalışma saati tanımlanmamış.
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleOpenDialog}
                    sx={{ mt: 2 }}
                  >
                    İlk Çalışma Saatini Ekle
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Haftalık Randevu Takvimi */}
      {selectedEmployee && currentSchedules.length > 0 && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                    <CalendarMonthIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold">
                    Haftalık Randevu Takvimi
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
                      // Get all unique time slots across all days
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
                              // Color coding based on appointment type
                              const appointmentColors = {
                                'muayene': 'rgba(25, 118, 210, 0.2)', // blue
                                'seans': 'rgba(46, 125, 50, 0.2)', // green
                                'test': 'rgba(237, 108, 2, 0.2)', // orange
                                'toplantı': 'rgba(123, 31, 162, 0.2)' // purple
                              };
                              const bgColor = appointmentColors[appointment.appointmentType?.toLocaleLowerCase('tr-TR')] || 'success.light';
                              
                              return (
                                <TableCell key={idx} sx={{ bgcolor: bgColor, p: 0.5, cursor: 'pointer' }} onClick={() => {
                                  setEditingAppointment(appointment);
                                  setEditForm({
                                    name: appointment.name || '',
                                    phone: appointment.phone || '',
                                    notes: appointment.notes || '',
                                    appointmentType: appointment.appointmentType || 'Muayene'
                                  });
                                  setOpenEditAppointmentDialog(true);
                                }}>
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

                            // Color coding for empty slots based on schedule appointment type
                            const scheduleColors = {
                              'muayene': 'rgba(25, 118, 210, 0.05)', // light blue
                              'seans': 'rgba(46, 125, 50, 0.05)', // light green
                              'test': 'rgba(237, 108, 2, 0.05)', // light orange
                              'toplantı': 'rgba(123, 31, 162, 0.05)' // light purple
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
              
              {/* Renk Açıklaması */}
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

      {/* Randevu Oluşturma Dialog */}
      <Dialog open={openAppointmentDialog} onClose={() => setOpenAppointmentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Yeni Randevu Oluştur</DialogTitle>
        <DialogContent>
          {selectedSlot && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Personel:</strong> {selectedEmployeeData?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Tarih:</strong> {new Date(selectedSlot.date).toLocaleDateString('tr-TR')} ({selectedSlot.dayOfWeek})
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                <strong>Saat:</strong> {selectedSlot.time}
              </Typography>

              <FormControl fullWidth margin="normal">
                <InputLabel>Randevu Türü</InputLabel>
                <Select
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
                        phone: selectedPatient.phone || selectedPatient.parentPhone || ''
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

              <TextField
                fullWidth
                label="Hasta Adı"
                value={appointmentForm.name}
                onChange={(e) => setAppointmentForm(prev => ({ ...prev, name: e.target.value }))}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Telefon"
                value={appointmentForm.phone}
                onChange={(e) => setAppointmentForm(prev => ({ ...prev, phone: e.target.value }))}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Notlar (İsteğe Bağlı)"
                value={appointmentForm.notes}
                onChange={(e) => setAppointmentForm(prev => ({ ...prev, notes: e.target.value }))}
                margin="normal"
                multiline
                rows={3}
              />

              <FormControl fullWidth margin="normal">
                <InputLabel>Tekrar Düzeni</InputLabel>
                <Select
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
                  value={appointmentForm.recurringCount}
                  onChange={(e) => setAppointmentForm(prev => ({ ...prev, recurringCount: Math.max(1, parseInt(e.target.value) || 1) }))}
                  margin="normal"
                  inputProps={{ min: 1, max: 52 }}
                  helperText="Kaç kez tekrar edeceğini belirtin (1-52 arası)"
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAppointmentDialog(false)}>İptal</Button>
          <Button onClick={handleCreateAppointment} variant="contained" color="primary">Randevu Oluştur</Button>
        </DialogActions>
      </Dialog>

      {/* Randevu Düzenleme Dialog */}
      <Dialog open={openEditAppointmentDialog} onClose={() => setOpenEditAppointmentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Randevuyu Düzenle</DialogTitle>
        <DialogContent>
          {editingAppointment && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Personel:</strong> {employees.find(e => e.id === editingAppointment.employeeId)?.name || ''}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Tarih:</strong> {new Date(editingAppointment.date).toLocaleDateString('tr-TR')} ({editingAppointment.dayOfWeek})
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                <strong>Saat:</strong> {editingAppointment.timeSlot}
              </Typography>

              <FormControl fullWidth margin="normal">
                <InputLabel>Randevu Türü</InputLabel>
                <Select
                  value={editForm.appointmentType}
                  label="Randevu Türü"
                  onChange={(e) => setEditForm(prev => ({ ...prev, appointmentType: e.target.value }))}
                >
                  <MenuItem value="Muayene">Muayene</MenuItem>
                  <MenuItem value="Seans">Seans</MenuItem>
                  <MenuItem value="Test">Test</MenuItem>
                  <MenuItem value="Toplantı">Toplantı</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Hasta Adı"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Telefon"
                value={editForm.phone}
                onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Notlar"
                value={editForm.notes}
                onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                margin="normal"
                multiline
                rows={3}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            color="error" 
            variant="outlined"
            onClick={() => {
              if (!editingAppointment) return;
              if (!window.confirm('Bu randevuyu silmek istiyor musunuz?')) return;
              const updated = appointments.filter(a => a.id !== editingAppointment.id);
              setAppointments(updated);
              localStorage.setItem('appointments', JSON.stringify(updated));
              window.dispatchEvent(new Event('appointmentsUpdated'));
              setOpenEditAppointmentDialog(false);
              alert('Randevu silindi.');
            }}
          >
            Bu Randevuyu Sil
          </Button>
          {editingAppointment && editingAppointment.recurringSeriesId && (
            <Button 
              color="error" 
              variant="contained"
              onClick={() => {
                if (!editingAppointment) return;
                if (!window.confirm('Bu seriye ait TÜM tekrarlayan randevuları silmek istiyor musunuz?')) return;
                const updated = appointments.filter(a => a.recurringSeriesId !== editingAppointment.recurringSeriesId);
                const deletedCount = appointments.length - updated.length;
                setAppointments(updated);
                localStorage.setItem('appointments', JSON.stringify(updated));
                window.dispatchEvent(new Event('appointmentsUpdated'));
                setOpenEditAppointmentDialog(false);
                alert(`${deletedCount} randevu silindi.`);
              }}
            >
              Tüm Tekrarlayanları Sil
            </Button>
          )}
          <Box sx={{ flex: 1 }} />
          <Button onClick={() => setOpenEditAppointmentDialog(false)}>İptal</Button>
          <Button variant="contained" onClick={() => {
            if (!editingAppointment) return;
            const updated = appointments.map(a => a.id === editingAppointment.id ? {
              ...a,
              name: editForm.name,
              phone: editForm.phone,
              notes: editForm.notes,
              appointmentType: editForm.appointmentType
            } : a);
            setAppointments(updated);
            localStorage.setItem('appointments', JSON.stringify(updated));
            window.dispatchEvent(new Event('appointmentsUpdated'));
            setOpenEditAppointmentDialog(false);
            alert('Randevu güncellendi.');
          }}>Kaydet</Button>
        </DialogActions>
      </Dialog>

      {/* Çalışma Saati Ekleme/Düzenleme Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editMode ? 'Çalışma Saatini Düzenle' : 'Yeni Çalışma Saati Ekle'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {!editMode && (
              <FormControl component="fieldset" margin="normal" required fullWidth>
                <FormLabel component="legend" sx={{ mb: 1 }}>Günler Seçin (Çoklu Seçim)</FormLabel>
                <FormGroup>
                  {daysOfWeek.map((day) => (
                    <FormControlLabel
                      key={day}
                      control={
                        <Checkbox 
                          checked={currentSchedule.selectedDays.includes(day)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setCurrentSchedule(prev => ({
                              ...prev,
                              selectedDays: checked 
                                ? [...prev.selectedDays, day]
                                : prev.selectedDays.filter(d => d !== day)
                            }));
                          }}
                        />
                      }
                      label={day}
                    />
                  ))}
                </FormGroup>
              </FormControl>
            )}

            {editMode && (
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Gün</InputLabel>
                <Select
                  name="dayOfWeek"
                  value={currentSchedule.dayOfWeek}
                  onChange={handleInputChange}
                  label="Gün"
                >
                  {daysOfWeek.map((day) => (
                    <MenuItem key={day} value={day}>
                      {day}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <FormControl component="fieldset" margin="normal" required fullWidth>
              <FormLabel component="legend" sx={{ mb: 1 }}>Saat Tipi</FormLabel>
              <RadioGroup
                row
                name="appointmentType"
                value={currentSchedule.appointmentType}
                onChange={handleInputChange}
              >
                <FormControlLabel value="muayene" control={<Radio />} label="Muayene" />
                <FormControlLabel value="seans" control={<Radio />} label="Seans" />
                <FormControlLabel value="test" control={<Radio />} label="Test" />
                <FormControlLabel value="toplantı" control={<Radio />} label="Toplantı" />
              </RadioGroup>
            </FormControl>

            <TextField
              fullWidth
              label="Başlangıç Saati"
              name="startTime"
              type="time"
              value={currentSchedule.startTime}
              onChange={handleInputChange}
              margin="normal"
              required
              InputLabelProps={{
                shrink: true,
              }}
            />

            <TextField
              fullWidth
              label="Bitiş Saati"
              name="endTime"
              type="time"
              value={currentSchedule.endTime}
              onChange={handleInputChange}
              margin="normal"
              required
              InputLabelProps={{
                shrink: true,
              }}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Randevu Süresi</InputLabel>
              <Select
                name="slotDuration"
                value={currentSchedule.slotDuration}
                onChange={handleInputChange}
                label="Randevu Süresi"
              >
                <MenuItem value={15}>15 Dakika</MenuItem>
                <MenuItem value={20}>20 Dakika</MenuItem>
                <MenuItem value={30}>30 Dakika</MenuItem>
                <MenuItem value={45}>45 Dakika</MenuItem>
                <MenuItem value={60}>60 Dakika</MenuItem>
              </Select>
            </FormControl>

            <Divider sx={{ my: 2 }}>
              <Chip label="Öğle Arası (İsteğe Bağlı)" size="small" />
            </Divider>

            <TextField
              fullWidth
              label="Öğle Arası Başlangıç"
              name="lunchBreakStart"
              type="time"
              value={currentSchedule.lunchBreakStart || ''}
              onChange={handleInputChange}
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              helperText="Öğle arası süresince randevu alınamaz"
            />

            <TextField
              fullWidth
              label="Öğle Arası Bitiş"
              name="lunchBreakEnd"
              type="time"
              value={currentSchedule.lunchBreakEnd || ''}
              onChange={handleInputChange}
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />

            
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            İptal
          </Button>
          <Button
            onClick={handleSaveSchedule}
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
    </Grid>
  );
};

export default MyCalendar;
