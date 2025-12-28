import React from 'react';
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
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import FeaturedPlayListIcon from '@mui/icons-material/FeaturedPlayList';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CodeIcon from '@mui/icons-material/Code';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import DevicesIcon from '@mui/icons-material/Devices';

const Hakkinda = () => {
  return (
    <Grid container spacing={2}>
      {/* Uygulama Hakkında Kartı */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 56, height: 56 }}>
                <InfoIcon fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h5" component="h2">
                  Uygulama Hakkında
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Modern Sağlık Yönetim Sistemi
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body1" paragraph>
              Bu uygulama, hasta bilgilerini ve randevu yönetimini kolaylaştırmak için 
              geliştirilmiş modern bir sağlık yönetim sistemidir. React.js ve Material-UI 
              framework'ü kullanılarak oluşturulmuştur.
            </Typography>
            <Typography variant="body1" paragraph>
              Sistem, kullanıcı dostu arayüzü ve güvenli veri yönetimi ile hasta ve sağlık 
              personeli arasında etkili iletişim sağlar. Tüm veriler güvenli bir şekilde 
              saklanır ve yalnızca yetkili kullanıcılar tarafından erişilebilir.
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Teknik Detaylar
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                <Chip icon={<CodeIcon />} label="React.js 18.2" color="primary" />
                <Chip icon={<CodeIcon />} label="Material-UI 5.14" color="primary" />
                <Chip icon={<SecurityIcon />} label="Güvenli" color="success" />
                <Chip icon={<DevicesIcon />} label="Responsive" color="info" />
              </Box>
            </Box>
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Versiyon:</strong> 1.0.0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Son Güncelleme:</strong> 5 Aralık 2025
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Lisans:</strong> © 2025 Tüm Hakları Saklıdır
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Özellikler Kartı */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <FeaturedPlayListIcon />
              </Avatar>
              <Typography variant="h5" component="h2">
                Özellikler
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Hasta Yönetimi" 
                  secondary="Detaylı hasta bilgileri"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Randevu Sistemi" 
                  secondary="Geçmiş ve gelecek randevular"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Mesajlaşma" 
                  secondary="Doktor-hasta iletişimi"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Profil Yönetimi" 
                  secondary="Kişisel bilgi güncellemeleri"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <SpeedIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Hızlı Erişim" 
                  secondary="Kolay navigasyon"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <SecurityIcon color="error" />
                </ListItemIcon>
                <ListItemText 
                  primary="Güvenlik" 
                  secondary="Veri koruma ve şifreleme"
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* İletişim ve Destek Kartı */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                <ContactSupportIcon />
              </Avatar>
              <Typography variant="h5" component="h2">
                İletişim ve Destek
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Teknik Destek
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Teknik sorunlarınız için destek ekibimizle iletişime geçebilirsiniz.
                  </Typography>
                  <Typography variant="body2">
                    <strong>E-posta:</strong> destek@saglik.com
                  </Typography>
                  <Typography variant="body2">
                    <strong>Telefon:</strong> +90 312 123 4567
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Çalışma Saatleri
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Destek ekibimiz aşağıdaki saatlerde hizmetinizdedir.
                  </Typography>
                  <Typography variant="body2">
                    <strong>Hafta İçi:</strong> 08:00 - 18:00
                  </Typography>
                  <Typography variant="body2">
                    <strong>Hafta Sonu:</strong> 09:00 - 17:00
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Acil Durumlar
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Acil durumlarda 7/24 hizmet verilmektedir.
                  </Typography>
                  <Typography variant="body2">
                    <strong>Acil Hat:</strong> +90 312 911 0000
                  </Typography>
                  <Typography variant="body2">
                    <strong>WhatsApp:</strong> +90 555 911 0000
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default Hakkinda;
