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
  ListItemAvatar,
  ListItemText,
  Chip,
  Badge,
  IconButton,
  TextField,
  Button
} from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';
import SendIcon from '@mui/icons-material/Send';
import DraftsIcon from '@mui/icons-material/Drafts';
import DeleteIcon from '@mui/icons-material/Delete';
import ReplyIcon from '@mui/icons-material/Reply';

const Mesajlar = () => {
  return (
    <Grid container spacing={2}>
      {/* Gelen Kutusu Kartı */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <InboxIcon />
                </Avatar>
                <Typography variant="h5" component="h2">
                  Gelen Kutusu
                </Typography>
              </Box>
              <Badge badgeContent={3} color="error">
                <Chip label="Yeni" size="small" />
              </Badge>
            </Box>
            <Divider sx={{ my: 2 }} />
            <List>
              <ListItem 
                sx={{ bgcolor: 'action.hover', borderRadius: 1, mb: 1 }}
                secondaryAction={
                  <IconButton edge="end" size="small">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                }
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'success.main' }}>D</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" fontWeight="bold">
                        Dr. Mehmet Demir
                      </Typography>
                      <Chip label="Yeni" size="small" color="error" />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.primary">
                        Randevu Hatırlatması
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        25.11.2025 tarihli randevunuz için...
                      </Typography>
                    </>
                  }
                />
              </ListItem>

              <ListItem 
                sx={{ borderRadius: 1, mb: 1 }}
                secondaryAction={
                  <IconButton edge="end" size="small">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                }
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'info.main' }}>S</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Sistem Bildirimi"
                  secondary={
                    <>
                      <Typography variant="body2" color="text.primary">
                        Profil Güncellemesi
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Profiliniz başarıyla güncellendi...
                      </Typography>
                    </>
                  }
                />
              </ListItem>

              <ListItem 
                sx={{ borderRadius: 1, mb: 1 }}
                secondaryAction={
                  <IconButton edge="end" size="small">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                }
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>A</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Admin"
                  secondary={
                    <>
                      <Typography variant="body2" color="text.primary">
                        Hoş Geldiniz
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Sistemimize hoş geldiniz...
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Gönderilen Mesajlar Kartı */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                <SendIcon />
              </Avatar>
              <Typography variant="h5" component="h2">
                Gönderilen Mesajlar
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <List>
              <ListItem 
                sx={{ borderRadius: 1, mb: 1 }}
                secondaryAction={
                  <Box>
                    <IconButton edge="end" size="small" sx={{ mr: 1 }}>
                      <ReplyIcon fontSize="small" />
                    </IconButton>
                    <IconButton edge="end" size="small">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemAvatar>
                  <Avatar>
                    <DraftsIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Randevu Talebi"
                  secondary={
                    <>
                      <Typography variant="body2" color="text.primary">
                        Kardiyoloji Bölümü
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        20.11.2025 - Randevu talebiniz iletildi
                      </Typography>
                    </>
                  }
                />
              </ListItem>

              <ListItem 
                sx={{ borderRadius: 1, mb: 1 }}
                secondaryAction={
                  <Box>
                    <IconButton edge="end" size="small" sx={{ mr: 1 }}>
                      <ReplyIcon fontSize="small" />
                    </IconButton>
                    <IconButton edge="end" size="small">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemAvatar>
                  <Avatar>
                    <DraftsIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Bilgi Talebi"
                  secondary={
                    <>
                      <Typography variant="body2" color="text.primary">
                        Tahlil Sonuçları
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        15.11.2025 - Tahlil sonuçlarım hakkında
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Yeni Mesaj Oluştur Kartı */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                <SendIcon />
              </Avatar>
              <Typography variant="h5" component="h2">
                Yeni Mesaj Oluştur
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Alıcı"
                placeholder="Doktor veya departman seçin"
                margin="normal"
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Konu"
                placeholder="Mesaj konusu"
                margin="normal"
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Mesaj"
                placeholder="Mesajınızı yazın..."
                margin="normal"
                variant="outlined"
                multiline
                rows={6}
              />
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<SendIcon />}
                >
                  Gönder
                </Button>
                <Button variant="outlined">
                  Taslak Olarak Kaydet
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default Mesajlar;
