import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Paper,
  Chip,
  Avatar,
  Divider,
  List,
  LinearProgress,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Alert
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';

const HastaEkrani = ({ currentUser, institution, onLogout }) => {
  const [pendingApplications, setPendingApplications] = useState([]);
  const [completedApplications, setCompletedApplications] = useState([]);
  const [activeApplication, setActiveApplication] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [scaleQuestions, setScaleQuestions] = useState([]);

  useEffect(() => {
    loadApplications();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, institution]);

  const loadApplications = () => {
    // Kendi uygulamalarını yükle
    const allApplications = JSON.parse(localStorage.getItem('olcekApplications') || '[]');
    const myApplications = allApplications.filter(
      a => a.institutionId === institution.id && a.patientId === currentUser.id
    );

    setPendingApplications(myApplications.filter(a => a.status === 'pending' || a.status === 'in-progress'));
    setCompletedApplications(myApplications.filter(a => a.status === 'completed'));
  };

  const handleStartApplication = (app) => {
    // Demo sorular - Gerçek uygulamada ölçeğe göre yüklenecek
    const demoQuestions = [
      {
        id: 1,
        text: "Son bir ay içinde kendinizi ne sıklıkla huzursuz hissettiniz?",
        type: "scale",
        options: ["Hiçbir zaman", "Nadiren", "Bazen", "Sıklıkla", "Her zaman"]
      },
      {
        id: 2,
        text: "Günlük aktivitelerinizi tamamlamakta zorluk çekiyor musunuz?",
        type: "scale",
        options: ["Hiçbir zaman", "Nadiren", "Bazen", "Sıklıkla", "Her zaman"]
      },
      {
        id: 3,
        text: "Konsantre olmakta güçlük çekiyor musunuz?",
        type: "scale",
        options: ["Hiçbir zaman", "Nadiren", "Bazen", "Sıklıkla", "Her zaman"]
      },
      {
        id: 4,
        text: "Uyku düzeniniz nasıl?",
        type: "scale",
        options: ["Çok iyi", "İyi", "Orta", "Kötü", "Çok kötü"]
      },
      {
        id: 5,
        text: "Sosyal ilişkilerinizden memnun musunuz?",
        type: "scale",
        options: ["Çok memnunum", "Memnunum", "Kısmen", "Memnun değilim", "Hiç memnun değilim"]
      },
      {
        id: 6,
        text: "Eklemek istediğiniz notlar:",
        type: "text"
      }
    ];

    setScaleQuestions(demoQuestions);
    setActiveApplication(app);
    setCurrentQuestion(0);
    setAnswers({});

    // Uygulamayı başlat olarak işaretle
    const allApplications = JSON.parse(localStorage.getItem('olcekApplications') || '[]');
    const updatedApplications = allApplications.map(a => 
      a.id === app.id ? { ...a, status: 'in-progress', startedAt: new Date().toISOString() } : a
    );
    localStorage.setItem('olcekApplications', JSON.stringify(updatedApplications));
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer
    });
  };

  const handleNext = () => {
    if (currentQuestion < scaleQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    if (!window.confirm('Ölçeği tamamlamak istediğinize emin misiniz?')) {
      return;
    }

    // Uygulamayı tamamla
    const allApplications = JSON.parse(localStorage.getItem('olcekApplications') || '[]');
    const updatedApplications = allApplications.map(a => 
      a.id === activeApplication.id ? {
        ...a,
        status: 'completed',
        completedAt: new Date().toISOString(),
        answers: answers
      } : a
    );
    localStorage.setItem('olcekApplications', JSON.stringify(updatedApplications));

    alert('Ölçek başarıyla tamamlandı! Doktorunuz sonuçları görebilecek.');
    
    setActiveApplication(null);
    setScaleQuestions([]);
    setCurrentQuestion(0);
    setAnswers({});
    loadApplications();
  };

  const handleCancelApplication = () => {
    if (window.confirm('Ölçek doldurma işlemini iptal etmek istediğinize emin misiniz? İlerlemeniz kaydedilmeyecek.')) {
      setActiveApplication(null);
      setScaleQuestions([]);
      setCurrentQuestion(0);
      setAnswers({});
      loadApplications();
    }
  };

  // Eğer aktif bir uygulama varsa, soru formunu göster
  if (activeApplication) {
    const question = scaleQuestions[currentQuestion];
    const progress = ((currentQuestion + 1) / scaleQuestions.length) * 100;
    const isLastQuestion = currentQuestion === scaleQuestions.length - 1;
    const isAnswered = answers[question.id] !== undefined && answers[question.id] !== '';

    return (
      <Box>
        <AppBar position="static" elevation={2}>
          <Toolbar>
            <AssessmentIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {activeApplication.scaleName}
            </Typography>
            <Chip 
              label={`${currentQuestion + 1} / ${scaleQuestions.length}`}
              color="secondary" 
              sx={{ mr: 2 }}
            />
          </Toolbar>
        </AppBar>

        <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, px: 2 }}>
          <Card>
            <CardContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  İlerleme
                </Typography>
                <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  %{Math.round(progress)} tamamlandı
                </Typography>
              </Box>

              <Stepper activeStep={currentQuestion} sx={{ mb: 4 }}>
                {scaleQuestions.map((q, index) => (
                  <Step key={q.id}>
                    <StepLabel>{index + 1}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              <Divider sx={{ mb: 3 }} />

              <Typography variant="h6" gutterBottom>
                Soru {currentQuestion + 1}
              </Typography>
              
              <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem' }}>
                {question.text}
              </Typography>

              {question.type === 'scale' && (
                <FormControl component="fieldset" fullWidth>
                  <RadioGroup
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  >
                    {question.options.map((option, index) => (
                      <FormControlLabel
                        key={index}
                        value={option}
                        control={<Radio />}
                        label={option}
                        sx={{
                          mb: 1,
                          p: 2,
                          border: '1px solid #e0e0e0',
                          borderRadius: 1,
                          '&:hover': {
                            bgcolor: '#f5f5f5'
                          }
                        }}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              )}

              {question.type === 'text' && (
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Düşüncelerinizi buraya yazabilirsiniz..."
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  variant="outlined"
                />
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={handleCancelApplication}
                >
                  İptal Et
                </Button>
                
                <Box>
                  <Button
                    variant="outlined"
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    sx={{ mr: 1 }}
                  >
                    Önceki
                  </Button>
                  
                  {!isLastQuestion ? (
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={question.type === 'scale' && !isAnswered}
                    >
                      Sonraki
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handleSubmit}
                      startIcon={<CheckCircleIcon />}
                    >
                      Tamamla
                    </Button>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    );
  }

  // Ana hasta ekranı
  return (
    <Box>
      {/* Header */}
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <PersonIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Hasta Paneli - {institution.name}
          </Typography>
          <Chip 
            label={currentUser.name} 
            color="secondary" 
            sx={{ mr: 2 }}
            avatar={<Avatar>{currentUser.name.charAt(0)}</Avatar>}
          />
          <IconButton color="inherit" onClick={onLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, px: 2 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Hoş Geldiniz, {currentUser.name}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Size atanan ölçekleri doldurabilir ve tamamladığınız ölçekleri görüntüleyebilirsiniz.
        </Typography>

        {/* Bekleyen Uygulamalar */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Doldurmanız Gereken Ölçekler
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {pendingApplications.length > 0 ? (
              <List>
                {pendingApplications.map((app) => (
                  <Paper key={app.id} elevation={2} sx={{ mb: 2, p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {app.scaleName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Doktor: {app.doctorName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Atanma Tarihi: {new Date(app.date).toLocaleDateString('tr-TR')}
                        </Typography>
                        {app.status === 'in-progress' && (
                          <Chip 
                            label="Doldurulmaya Başlandı" 
                            color="info" 
                            size="small" 
                            sx={{ mt: 1 }}
                          />
                        )}
                      </Box>
                      <Button
                        variant="contained"
                        onClick={() => handleStartApplication(app)}
                        startIcon={<AssessmentIcon />}
                      >
                        {app.status === 'in-progress' ? 'Devam Et' : 'Başla'}
                      </Button>
                    </Box>
                  </Paper>
                ))}
              </List>
            ) : (
              <Alert severity="info">
                Şu anda doldurmanız gereken bir ölçek bulunmuyor.
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Tamamlanan Uygulamalar */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Tamamladığınız Ölçekler
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {completedApplications.length > 0 ? (
              <List>
                {completedApplications.map((app) => (
                  <Paper key={app.id} elevation={1} sx={{ mb: 2, p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                          <Typography variant="h6">
                            {app.scaleName}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Doktor: {app.doctorName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Tamamlanma Tarihi: {new Date(app.completedAt).toLocaleDateString('tr-TR')}
                        </Typography>
                      </Box>
                      <Chip label="Tamamlandı" color="success" />
                    </Box>
                  </Paper>
                ))}
              </List>
            ) : (
              <Alert severity="info">
                Henüz tamamlanmış bir ölçek bulunmuyor.
              </Alert>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default HastaEkrani;
