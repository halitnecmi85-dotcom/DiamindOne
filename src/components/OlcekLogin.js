import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
  Avatar
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import BusinessIcon from '@mui/icons-material/Business';

const OlcekLogin = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [error, setError] = useState('');
  const [institutions, setInstitutions] = useState([]);

  useEffect(() => {
    // localStorage'dan kurumları yükle veya demo data oluştur
    const storedInstitutions = localStorage.getItem('olcekInstitutions');
    
    if (!storedInstitutions) {
      const demoInstitutions = [
        {
          id: '1',
          name: 'Diamond Psikoloji Merkezi',
          license: 'DMD-2025-001',
          active: true,
          expiryDate: '2025-12-31'
        },
        {
          id: '2',
          name: 'Merkez Psikoloji Kliniği',
          license: 'MRK-2025-002',
          active: true,
          expiryDate: '2025-12-31'
        }
      ];
      
      localStorage.setItem('olcekInstitutions', JSON.stringify(demoInstitutions));
      setInstitutions(demoInstitutions);
    } else {
      setInstitutions(JSON.parse(storedInstitutions));
    }

    // Demo kullanıcılar oluştur
    const storedUsers = localStorage.getItem('olcekUsers');
    if (!storedUsers) {
      const demoUsers = [
        {
          id: '1',
          username: 'admin',
          password: 'admin123',
          name: 'Admin Yönetici',
          role: 'admin',
          institutionId: '1'
        },
        {
          id: '2',
          username: 'doktor1',
          password: 'doktor123',
          name: 'Dr. Ahmet Yılmaz',
          role: 'doktor',
          institutionId: '1'
        },
        {
          id: '3',
          username: 'hasta1',
          password: 'hasta123',
          name: 'Elif Demir',
          role: 'hasta',
          institutionId: '1'
        }
      ];
      
      localStorage.setItem('olcekUsers', JSON.stringify(demoUsers));
    }
  }, []);

  const handleLogin = () => {
    setError('');

    if (!username || !password || !selectedInstitution) {
      setError('Lütfen tüm alanları doldurun!');
      return;
    }

    // Kullanıcı doğrulama
    const users = JSON.parse(localStorage.getItem('olcekUsers') || '[]');
    const user = users.find(
      u => u.username === username && 
           u.password === password && 
           u.institutionId === selectedInstitution
    );

    if (!user) {
      setError('Kullanıcı adı, şifre veya kurum bilgisi hatalı!');
      return;
    }

    // Kurum lisans kontrolü
    const institution = institutions.find(i => i.id === selectedInstitution);
    
    if (!institution) {
      setError('Kurum bulunamadı!');
      return;
    }

    if (!institution.active) {
      setError('Kurum lisansı aktif değil!');
      return;
    }

    const expiryDate = new Date(institution.expiryDate);
    const today = new Date();
    
    if (expiryDate < today) {
      setError('Kurum lisansının süresi dolmuş!');
      return;
    }

    // Başarılı giriş
    onLogin(user, institution);
  };

  return (
    <Card sx={{ maxWidth: 450, width: '100%', boxShadow: 6 }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
            <LockOutlinedIcon fontSize="large" />
          </Avatar>
          <Typography component="h1" variant="h5" fontWeight="bold">
            Ölçek Yönetim Sistemi
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Kurum Bazlı Psikolojik Ölçek Uygulaması
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Kurum Seçin</InputLabel>
          <Select
            value={selectedInstitution}
            onChange={(e) => setSelectedInstitution(e.target.value)}
            label="Kurum Seçin"
            startAdornment={<BusinessIcon sx={{ mr: 1, color: 'action.active' }} />}
          >
            {institutions.map((inst) => (
              <MenuItem key={inst.id} value={inst.id}>
                {inst.name} {!inst.active && '(Pasif)'}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Kullanıcı Adı"
          variant="outlined"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          sx={{ mb: 2 }}
          autoComplete="username"
        />

        <TextField
          fullWidth
          label="Şifre"
          type="password"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 3 }}
          autoComplete="current-password"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleLogin();
            }
          }}
        />

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleLogin}
          sx={{ mb: 2, py: 1.5 }}
        >
          Giriş Yap
        </Button>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            <strong>Demo Hesaplar:</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            Admin: admin / admin123
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            Doktor: doktor1 / doktor123
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            Hasta: hasta1 / hasta123
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default OlcekLogin;
