import React, { createContext, useContext, useState } from 'react';

// Context oluştur
const ProfilContext = createContext();

// Custom hook - componentlerin context'e erişimi için
export const useProfilContext = () => {
  const context = useContext(ProfilContext);
  if (!context) {
    throw new Error('useProfilContext must be used within ProfilProvider');
  }
  return context;
};

// Provider component
export const ProfilProvider = ({ children }) => {
  // Kişisel Bilgiler
  const [kisiselBilgiler, setKisiselBilgiler] = useState({
    adSoyad: 'Ahmet Yılmaz',
    email: 'ahmet.yilmaz@email.com',
    telefon: '+90 555 123 4567',
    adres: 'Atatürk Cad. No:123, Ankara',
    dogumTarihi: '1990-01-15',
    cinsiyet: 'Erkek',
    tcKimlik: '12345678901',
    meslek: 'Yazılım Geliştirici'
  });

  // Güvenlik Ayarları
  const [guvenlikAyarlari, setGuvenlikAyarlari] = useState({
    eskiSifre: '',
    yeniSifre: '',
    yeniSifreTekrar: '',
    ikiFactorAuth: false,
    emailBildirimleri: true,
    smsBildirimleri: false
  });

  // Bildirim Tercihleri
  const [bildirimTercihleri, setBildirimTercihleri] = useState({
    emailRandevu: true,
    emailRapor: true,
    emailTahlil: false,
    smsRandevu: true,
    smsRapor: false,
    smsTahlil: false,
    pushRandevu: true,
    pushRapor: true,
    pushTahlil: true
  });

  // Medikal Bilgiler
  const [medikalBilgiler, setMedikalBilgiler] = useState({
    kanGrubu: 'A Rh+',
    kronikHastaliklar: ['Astım', 'Migren'],
    alerjiler: ['Polen', 'Penicillin'],
    surekliIlaclar: ['Ventolin'],
    gecirdigiAmeliyatlar: [],
    aileTarihi: 'Diyabet (anne tarafı)'
  });

  // Helper functions - her bölüm için update fonksiyonu
  const updateKisiselBilgiler = (field, value) => {
    setKisiselBilgiler(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateGuvenlikAyarlari = (field, value) => {
    setGuvenlikAyarlari(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateBildirimTercihleri = (field, value) => {
    setBildirimTercihleri(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateMedikalBilgiler = (field, value) => {
    setMedikalBilgiler(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Toplu güncelleme fonksiyonları
  const resetKisiselBilgiler = () => {
    setKisiselBilgiler({
      adSoyad: 'Ahmet Yılmaz',
      email: 'ahmet.yilmaz@email.com',
      telefon: '+90 555 123 4567',
      adres: 'Atatürk Cad. No:123, Ankara',
      dogumTarihi: '1990-01-15',
      cinsiyet: 'Erkek',
      tcKimlik: '12345678901',
      meslek: 'Yazılım Geliştirici'
    });
  };

  const resetGuvenlikAyarlari = () => {
    setGuvenlikAyarlari({
      eskiSifre: '',
      yeniSifre: '',
      yeniSifreTekrar: '',
      ikiFactorAuth: false,
      emailBildirimleri: true,
      smsBildirimleri: false
    });
  };

  // Context value - tüm state'ler ve fonksiyonlar
  const value = {
    // States
    kisiselBilgiler,
    guvenlikAyarlari,
    bildirimTercihleri,
    medikalBilgiler,
    
    // Update functions
    updateKisiselBilgiler,
    updateGuvenlikAyarlari,
    updateBildirimTercihleri,
    updateMedikalBilgiler,
    
    // Reset functions
    resetKisiselBilgiler,
    resetGuvenlikAyarlari,
    
    // Direct setters (gerekirse kullanılabilir)
    setKisiselBilgiler,
    setGuvenlikAyarlari,
    setBildirimTercihleri,
    setMedikalBilgiler
  };

  return (
    <ProfilContext.Provider value={value}>
      {children}
    </ProfilContext.Provider>
  );
};
