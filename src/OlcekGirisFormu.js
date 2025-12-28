import React, { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Typography,
  Paper,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Alert,
} from '@mui/material';
import {
  ArrowBack,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

const steps = ['Ölçek Bilgileri', 'Ölçek Özellikleri', 'Sorular', 'Puan Hesaplama'];

const OlcekGirisFormu = ({ onBack, onSave }) => {
  const [activeStep, setActiveStep] = useState(0);
  
  // Adım 1: Ölçek Bilgileri
  const [scaleName, setScaleName] = useState('');
  const [scaleDescription, setScaleDescription] = useState('');
  
  // Adım 2: Ölçek Özellikleri
  const [scaleType, setScaleType] = useState('basic'); // basic, cutoff, subscales
  const [cutoffScore, setCutoffScore] = useState('');
  const [subscales, setSubscales] = useState([]);
  const [newSubscaleName, setNewSubscaleName] = useState('');
  
  // Adım 3: Sorular
  const [questions, setQuestions] = useState([]);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionName, setQuestionName] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState('multiple'); // multiple, linear
  const [options, setOptions] = useState([{ text: '', score: '' }]);
  const [linearMin, setLinearMin] = useState(1);
  const [linearMax, setLinearMax] = useState(5);
  const [linearMinLabel, setLinearMinLabel] = useState('');
  const [linearMaxLabel, setLinearMaxLabel] = useState('');
  
  // Adım 4: Puan Hesaplama
  const [scoringRules, setScoringRules] = useState({
    totalScore: { formula: 'sum', description: '' },
    subscaleScoring: []
  });

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleAddSubscale = () => {
    if (newSubscaleName.trim()) {
      setSubscales([...subscales, { id: Date.now(), name: newSubscaleName }]);
      setNewSubscaleName('');
    }
  };

  const handleRemoveSubscale = (id) => {
    setSubscales(subscales.filter(sub => sub.id !== id));
  };

  const handleAddOption = () => {
    setOptions([...options, { text: '', score: '' }]);
  };

  const handleRemoveOption = (index) => {
    if (options.length > 1) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...options];
    newOptions[index][field] = value;
    setOptions(newOptions);
  };

  const handleSaveQuestion = () => {
    const question = {
      id: editingQuestion ? editingQuestion.id : Date.now(),
      name: questionName,
      text: questionText,
      type: questionType,
      ...(questionType === 'multiple' 
        ? { options: options.filter(opt => opt.text.trim()) }
        : { 
            min: linearMin, 
            max: linearMax,
            minLabel: linearMinLabel,
            maxLabel: linearMaxLabel,
            options: Array.from({ length: linearMax - linearMin + 1 }, (_, i) => ({
              text: linearMinLabel && linearMaxLabel && (i === 0 || i === linearMax - linearMin) 
                ? (i === 0 ? linearMinLabel : linearMaxLabel) 
                : '',
              score: linearMin + i
            }))
          }
      )
    };

    if (editingQuestion) {
      setQuestions(questions.map(q => q.id === editingQuestion.id ? question : q));
    } else {
      setQuestions([...questions, question]);
    }

    // Reset form
    setEditingQuestion(null);
    setQuestionName('');
    setQuestionText('');
    setQuestionType('multiple');
    setOptions([{ text: '', score: '' }]);
    setLinearMin(1);
    setLinearMax(5);
    setLinearMinLabel('');
    setLinearMaxLabel('');
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setQuestionName(question.name);
    setQuestionText(question.text);
    setQuestionType(question.type);
    
    if (question.type === 'multiple') {
      setOptions(question.options);
    } else {
      setLinearMin(question.min);
      setLinearMax(question.max);
      setLinearMinLabel(question.minLabel || '');
      setLinearMaxLabel(question.maxLabel || '');
    }
  };

  const handleDeleteQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleSaveScale = () => {
    const currentUser = JSON.parse(localStorage.getItem('olcekCurrentUser') || '{}');
    const institution = JSON.parse(localStorage.getItem('olcekInstitution') || '{}');
    
    const scale = {
      id: Date.now(),
      name: scaleName,
      description: scaleDescription,
      type: scaleType,
      cutoffScore: scaleType !== 'basic' ? cutoffScore : null,
      subscales: scaleType === 'subscales' ? subscales : [],
      questions: questions,
      scoringRules: scoringRules,
      institutionId: institution.id,
      createdBy: currentUser.name || 'Admin',
      createdAt: new Date().toISOString()
    };

    // localStorage'a kaydet
    const scales = JSON.parse(localStorage.getItem('olcekScales') || '[]');
    scales.push(scale);
    localStorage.setItem('olcekScales', JSON.stringify(scales));

    if (onSave) {
      onSave(scale);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Ölçek Bilgileri
            </Typography>
            <TextField
              fullWidth
              label="Ölçeğin Adı"
              value={scaleName}
              onChange={(e) => setScaleName(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Ölçeğin Açıklaması"
              value={scaleDescription}
              onChange={(e) => setScaleDescription(e.target.value)}
              margin="normal"
              multiline
              rows={4}
            />
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Ölçek Özellikleri
            </Typography>
            <FormControl component="fieldset" margin="normal">
              <FormLabel component="legend">Ölçek Tipi</FormLabel>
              <RadioGroup
                value={scaleType}
                onChange={(e) => setScaleType(e.target.value)}
              >
                <FormControlLabel
                  value="basic"
                  control={<Radio />}
                  label="Sadece toplam skoru olan ölçekler"
                />
                <FormControlLabel
                  value="cutoff"
                  control={<Radio />}
                  label="Toplam skoru ve kesme puanı olan ölçekler"
                />
                <FormControlLabel
                  value="subscales"
                  control={<Radio />}
                  label="Toplam skoru, kesme puanı ve alt ölçekleri olan ölçekler"
                />
              </RadioGroup>
            </FormControl>

            {(scaleType === 'cutoff' || scaleType === 'subscales') && (
              <TextField
                fullWidth
                label="Kesme Puanı"
                type="number"
                value={cutoffScore}
                onChange={(e) => setCutoffScore(e.target.value)}
                margin="normal"
              />
            )}

            {scaleType === 'subscales' && (
              <Box mt={3}>
                <Typography variant="subtitle1" gutterBottom>
                  Alt Ölçekler
                </Typography>
                <Box display="flex" gap={1} mb={2}>
                  <TextField
                    label="Alt Ölçek İsmi"
                    value={newSubscaleName}
                    onChange={(e) => setNewSubscaleName(e.target.value)}
                    size="small"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSubscale()}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddSubscale}
                    startIcon={<AddIcon />}
                  >
                    Ekle
                  </Button>
                </Box>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {subscales.map((sub) => (
                    <Chip
                      key={sub.id}
                      label={sub.name}
                      onDelete={() => handleRemoveSubscale(sub.id)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Sorular
            </Typography>

            {/* Soru Listesi */}
            <Box mb={3}>
              {questions.map((question, index) => (
                <Card key={question.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="start">
                      <Box flex={1}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Soru {index + 1}: {question.name}
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 1 }}>
                          {question.text}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          Tip: {question.type === 'multiple' ? 'Çoktan Seçmeli' : 'Doğrusal Ölçek'}
                        </Typography>
                        {question.type === 'multiple' && (
                          <Box mt={1}>
                            {question.options.map((opt, i) => (
                              <Typography key={i} variant="body2" color="text.secondary">
                                {String.fromCharCode(97 + i)}) {opt.text} - Puan: {opt.score}
                              </Typography>
                            ))}
                          </Box>
                        )}
                        {question.type === 'linear' && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Ölçek: {question.min} - {question.max}
                            {question.minLabel && ` (${question.minLabel} - ${question.maxLabel})`}
                          </Typography>
                        )}
                      </Box>
                      <Box>
                        <IconButton
                          size="small"
                          onClick={() => handleEditQuestion(question)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteQuestion(question.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Soru Ekleme/Düzenleme Formu */}
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {editingQuestion ? 'Soruyu Düzenle' : 'Yeni Soru Ekle'}
              </Typography>

              <TextField
                fullWidth
                label="Sorunun İsmi"
                value={questionName}
                onChange={(e) => setQuestionName(e.target.value)}
                margin="normal"
                placeholder="Örn: Soru 1, Madde A"
              />

              <TextField
                fullWidth
                label="Sorunun Metni"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                margin="normal"
                multiline
                rows={2}
                placeholder="Soruyu buraya yazın..."
              />

              <FormControl fullWidth margin="normal">
                <FormLabel>Soru Tipi</FormLabel>
                <RadioGroup
                  row
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value)}
                >
                  <FormControlLabel
                    value="multiple"
                    control={<Radio />}
                    label="Çoktan Seçmeli"
                  />
                  <FormControlLabel
                    value="linear"
                    control={<Radio />}
                    label="Doğrusal Ölçek"
                  />
                </RadioGroup>
              </FormControl>

              {questionType === 'multiple' && (
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Seçenekler
                  </Typography>
                  {options.map((option, index) => (
                    <Box key={index} display="flex" gap={1} mb={1} alignItems="center">
                      <Typography variant="body2" sx={{ minWidth: 30 }}>
                        {String.fromCharCode(97 + index)})
                      </Typography>
                      <TextField
                        label="Şık Metni"
                        value={option.text}
                        onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                        size="small"
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        label="Puan"
                        type="number"
                        value={option.score}
                        onChange={(e) => handleOptionChange(index, 'score', e.target.value)}
                        size="small"
                        sx={{ width: 100 }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveOption(index)}
                        disabled={options.length === 1}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                  <Button
                    startIcon={<AddIcon />}
                    onClick={handleAddOption}
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    Şık Ekle
                  </Button>
                </Box>
              )}

              {questionType === 'linear' && (
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Doğrusal Ölçek Ayarları
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Minimum Değer"
                        type="number"
                        value={linearMin}
                        onChange={(e) => setLinearMin(parseInt(e.target.value))}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Maksimum Değer"
                        type="number"
                        value={linearMax}
                        onChange={(e) => setLinearMax(parseInt(e.target.value))}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Minimum Etiket (Opsiyonel)"
                        value={linearMinLabel}
                        onChange={(e) => setLinearMinLabel(e.target.value)}
                        size="small"
                        placeholder="Örn: Asla"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Maksimum Etiket (Opsiyonel)"
                        value={linearMaxLabel}
                        onChange={(e) => setLinearMaxLabel(e.target.value)}
                        size="small"
                        placeholder="Örn: Her zaman"
                      />
                    </Grid>
                  </Grid>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Doğrusal ölçekte sayılar hasta formunda görünmeyecek, sadece etiketler gösterilecektir.
                  </Alert>
                </Box>
              )}

              <Box mt={3} display="flex" gap={2}>
                <Button
                  variant="contained"
                  onClick={handleSaveQuestion}
                  disabled={!questionName || !questionText}
                >
                  {editingQuestion ? 'Güncelle' : 'Soruyu Ekle'}
                </Button>
                {editingQuestion && (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setEditingQuestion(null);
                      setQuestionName('');
                      setQuestionText('');
                      setOptions([{ text: '', score: '' }]);
                    }}
                  >
                    İptal
                  </Button>
                )}
              </Box>
            </Paper>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Puan Hesaplama
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              Ölçek soruları girildikten sonra puanlama kurallarını belirleyin.
            </Alert>

            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Toplam Skor Hesaplama
              </Typography>
              <FormControl fullWidth margin="normal">
                <FormLabel>Hesaplama Yöntemi</FormLabel>
                <RadioGroup
                  value={scoringRules.totalScore.formula}
                  onChange={(e) => setScoringRules({
                    ...scoringRules,
                    totalScore: { ...scoringRules.totalScore, formula: e.target.value }
                  })}
                >
                  <FormControlLabel
                    value="sum"
                    control={<Radio />}
                    label="Tüm soruların puanlarının toplamı"
                  />
                  <FormControlLabel
                    value="average"
                    control={<Radio />}
                    label="Tüm soruların puanlarının ortalaması"
                  />
                </RadioGroup>
              </FormControl>
              <TextField
                fullWidth
                label="Açıklama (Opsiyonel)"
                value={scoringRules.totalScore.description}
                onChange={(e) => setScoringRules({
                  ...scoringRules,
                  totalScore: { ...scoringRules.totalScore, description: e.target.value }
                })}
                margin="normal"
                multiline
                rows={2}
                placeholder="Puanlama hakkında not ekleyin..."
              />
            </Paper>

            {scaleType === 'subscales' && subscales.length > 0 && (
              <Paper elevation={1} sx={{ p: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Alt Ölçek Puanlama
                </Typography>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Her alt ölçek için hangi soruların dahil edileceğini belirtmelisiniz.
                </Alert>
                {subscales.map((subscale) => (
                  <Box key={subscale.id} sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {subscale.name}
                    </Typography>
                    <TextField
                      fullWidth
                      label="Dahil Edilecek Sorular"
                      placeholder="Örn: 1,2,3,5,7"
                      size="small"
                      helperText="Soru numaralarını virgülle ayırarak girin"
                    />
                  </Box>
                ))}
              </Paper>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={onBack} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5">
          Ölçek Giriş Formu
        </Typography>
      </Box>

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Content */}
      <Box sx={{ minHeight: 400 }}>
        {renderStepContent()}
      </Box>

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Geri
        </Button>
        <Box>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSaveScale}
              disabled={!scaleName || questions.length === 0}
            >
              Ölçeği Kaydet
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={
                (activeStep === 0 && !scaleName) ||
                (activeStep === 2 && questions.length === 0)
              }
            >
              İleri
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default OlcekGirisFormu;
