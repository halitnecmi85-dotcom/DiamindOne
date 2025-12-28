import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  InputBase,
  Box,
  alpha,
  styled,
  Typography,
  Avatar,
  Menu,
  MenuItem
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  maxWidth: '600px',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    paddingRight: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '55ch',
      '&:focus': {
        width: '65ch',
      },
    },
  },
}));

const CustomAppBar = ({ onMenuClick }) => {
  const [searchValue, setSearchValue] = useState('');

  const handleMenuClick = () => {
    console.log('Hamburger menü tıklandı');
    if (onMenuClick) {
      onMenuClick();
    }
  };

  const handleSettingsClick = () => {
    setAnchorEl(settingsButtonRef.current);
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const settingsButtonRef = React.useRef(null);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('currentUser') || 'null'));

  React.useEffect(() => {
    const onUsersUpdated = () => setUser(JSON.parse(localStorage.getItem('currentUser') || 'null'));
    window.addEventListener('usersUpdated', onUsersUpdated);
    return () => window.removeEventListener('usersUpdated', onUsersUpdated);
  }, []);

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    if (!window.confirm('Çıkış yapmak istediğinizden emin misiniz?')) return;
    localStorage.setItem('isLoggedIn', 'false');
    localStorage.removeItem('currentUser');
    window.dispatchEvent(new Event('usersUpdated'));
    // Navigate to login
    window.location.href = '/login';
  };

  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
    console.log('Arama:', event.target.value);
  };

  const handleClearSearch = () => {
    setSearchValue('');
    console.log('Arama temizlendi');
  };

  return (
    <AppBar 
      position="static"
      sx={{
        background: 'linear-gradient(90deg, #061161 0%, #780206 100%)',
      }}
    >
      <Toolbar>
        {/* Sol taraf - Hamburger Menu Icon */}
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={handleMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        {/* Orta - Search Input */}
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Ara…"
              inputProps={{ 'aria-label': 'search' }}
              value={searchValue}
              onChange={handleSearchChange}
            />
            {searchValue && (
              <IconButton
                size="small"
                onClick={handleClearSearch}
                sx={{
                  position: 'absolute',
                  right: 4,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'inherit',
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </Search>
        </Box>

        {/* Sağ taraf - Kullanıcı adı ve Ayarlar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
          <Avatar sx={{ width: 32, height: 32 }}>
            {user && (user.name || user.username || 'U').slice(0,1)}
          </Avatar>
          <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>{user ? (user.name || user.username) : 'Giriş Yok'}</Typography>
          <IconButton
            size="large"
            edge="end"
            color="inherit"
            aria-label="settings"
            onClick={handleSettingsClick}
            ref={settingsButtonRef}
          >
            <SettingsIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
            <MenuItem disabled>{user ? (user.name || user.username) : 'Giriş Yok'}</MenuItem>
            <MenuItem onClick={handleLogout}>Çıkış Yap</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default CustomAppBar;
