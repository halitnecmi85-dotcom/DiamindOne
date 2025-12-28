import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, Button, FormControl, InputLabel, Alert } from '@mui/material';


const RolYonetimi = () => {
  const [employees, setEmployees] = useState([]);
  const [roles] = useState(['Admin', 'Hekim', 'Terapist', 'Sekreter', 'Muhasebeci', 'Bireysel Destek']);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = () => {
    const stored = JSON.parse(localStorage.getItem('employees') || '[]');
    setEmployees(stored);
  };

  const handleRoleChange = (id, newRole) => {
    const updated = employees.map(emp => emp.id === id ? { ...emp, position: newRole } : emp);
    setEmployees(updated);
  };

  const handleSave = (id) => {
    const updatedEmployees = employees;
    localStorage.setItem('employees', JSON.stringify(updatedEmployees));
    setMessage('Rol güncellendi.');
    // Dispatch an event so App.js can refresh if current user changed
    window.dispatchEvent(new CustomEvent('usersUpdated', { detail: { id } }));

    setTimeout(() => setMessage(''), 2500);
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant="h5" component="h2" fontWeight="bold">Rol Yönetimi</Typography>
                <Typography variant="body2" color="text.secondary">Personellerin rollerini/yetkilerini düzenleyin</Typography>
              </Box>
            </Box>
            {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

            {employees.length === 0 ? (
              <Alert severity="info">Henüz personel kaydı bulunmamaktadır.</Alert>
            ) : (
              <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Ad</strong></TableCell>
                    <TableCell><strong>Pozisyon</strong></TableCell>
                    <TableCell><strong>Kullanıcı Adı</strong></TableCell>
                    <TableCell align="center"><strong>İşlem</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employees.map(emp => (
                    <TableRow key={emp.id} hover>
                      <TableCell>{emp.name}</TableCell>
                      <TableCell>
                        <FormControl fullWidth size="small">
                          <InputLabel>Pozisyon</InputLabel>
                          <Select
                            value={emp.position || ''}
                            label="Pozisyon"
                            onChange={(e) => handleRoleChange(emp.id, e.target.value)}
                          >
                            {roles.map(role => (
                              <MenuItem key={role} value={role}>{role}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>{emp.username || '—'}</TableCell>
                      <TableCell align="center"><Button variant="contained" size="small" onClick={() => handleSave(emp.id)}>Kaydet</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </TableContainer>
            )}

          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default RolYonetimi;
