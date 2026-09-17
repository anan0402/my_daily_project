import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Box from '@mui/material/Box'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { environment } from '@/utils/environment'

import Text from '@/components/atoms/Text/Text'
import CustomButton from '@/components/atoms/CustomButton/CustomButton'
import CustomAutocompleteSearchBox from '@/components/atoms/CustomAutocompleteSearchBox'
import CustomAvatar from '@/components/atoms/CustomAvatar/CustomAvatar'
import PawIcon from '@/components/atoms/PawIcon'
import ConfirmDialog from '@/components/molecules/ConfirmDialog/ConfirmDialog'
import { useSearch } from '@/hooks/useSearch'
import './AppHeader.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUser,
  faCog,
  faQuestionCircle,
  faSignOutAlt,
  faChevronRight,
  faSearch,
  faUsers,
} from '@fortawesome/free-solid-svg-icons'
import Divider from '@mui/material/Divider'
import ListItemIcon from '@mui/material/ListItemIcon'
import IconButton from '@mui/material/IconButton'
import { selectCurrentUser } from '@/redux/userSlice/userSlice'
import { logoutUserAPI } from '../../../redux/userSlice/userSlice'
import { toggleSidebar } from '@/redux/sidebarSlice/sidebarSlice'
import { getAvatarSrc } from '../../../utils/funtion'


function AppHeader({ showSidebar = false }) {
  const [anchorEl, setAnchorEl] = useState(null)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [openSearchDrawer, setOpenSearchDrawer] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const currentUser = useSelector(selectCurrentUser)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { data: searchResults, isLoading } = useSearch(searchQuery)


  const handleOpen = (e) => setAnchorEl(e.currentTarget)
  const handleClose = () => setAnchorEl(null)

  const handleLogout = () => {
    handleClose()
    setOpenConfirm(true)
  }

  const handleConfirmLogout = () => {
    setOpenConfirm(false)
    // TODO: Call logout API
    dispatch(logoutUserAPI())
  }

  const handleLogin = () => {
    navigate('/login')
  }

  const handleSignUp = () => {
    navigate('/signup')
  }

  const handleProfile = () => {
    handleClose()
    navigate(`/profile/${currentUser?._id}`)
  }


  const handleSearchSelect = (selectedItem) => {
    console.log('Selected item:', selectedItem)
    setOpenSearchDrawer(false)
    if (selectedItem?._id) {
      navigate(`/profile/${selectedItem._id}`)
    }
  }

  const handleToggleSearchDrawer = () => {
    setOpenSearchDrawer(!openSearchDrawer)
  }

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar())
  }

  const renderSearchOption = (props, option) => {
    const { key, ...otherProps } = props
    return (
      <li key={key} {...otherProps}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
          <CustomAvatar
            src={getAvatarSrc(option?.avatar)}
            size="small"
            fallback={option?.username?.[0]}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Text sx={{ fontWeight: 500, fontSize: '14px' }}>
              {option?.username}
            </Text>
          </Box>
        </Box>
      </li>
    )
  }


  return (
    <AppBar position="static" className="app-header">
      <Toolbar className="app-tool-bar">
        <div className="app-header-left">
          <Text variant="h6" className="app-header-title" >
            <div className="app-header-icon" onClick={() => navigate(`/`)}>
              <PawIcon size={24} />
            </div>
            <div className="search-box-desktop" onClick={() => navigate(`/`)}>Daily days</div>
          </Text>
          {currentUser && <>
            <div className="search-box-desktop">
              <CustomAutocompleteSearchBox
                options={searchResults}
                loading={isLoading}
                onQueryChange={setSearchQuery}
                onSelect={handleSearchSelect}
                placeholder="Search..."
                getOptionLabel={(option) => option?.username || ''}
                renderOption={renderSearchOption}
              />
            </div>
            <IconButton
              className="search-icon-mobile"
              onClick={handleToggleSearchDrawer}
              sx={{ color: 'var(--color-fg)' }}
            >
              <FontAwesomeIcon icon={faSearch} />
            </IconButton>
          </>
          }
        </div>

        <Box className="app-header-spacer" />



        <Box sx={{ width: '24px' }} />
        {currentUser ? (
          <>
            <div className="app-header-right">
              {showSidebar && (
                <IconButton
                  onClick={handleToggleSidebar}
                  className="sidebar-toggle-button"
                  sx={{ color: 'var(--color-fg)' }}
                >
                  <FontAwesomeIcon icon={faUsers} />
                </IconButton>
              )}
              <CustomAvatar
                src={getAvatarSrc(currentUser?.avatar || currentUser?.picture)}
                onClick={handleOpen}
                fallback={currentUser?.username?.[0] || currentUser?.name?.[0]}
              />
            </div>
            {Boolean(anchorEl) &&
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                className="app-menu-item"
              >
                <Box className="menu-header">
                  <CustomAvatar
                    src={getAvatarSrc(currentUser?.avatar || currentUser?.picture)}
                    size="small"
                    fallback={currentUser?.username?.[0] || currentUser?.name?.[0]}
                  />
                  <Box className="menu-header-info">
                    <Text className="menu-header-name">
                      {currentUser?.username || currentUser?.name}
                    </Text>
                    <Text className="menu-header-plan">Free</Text>
                  </Box>
                  <FontAwesomeIcon icon={faChevronRight} className="menu-header-arrow" />
                </Box>

                <Divider />

                <MenuItem onClick={handleProfile}>
                  <ListItemIcon>
                    <FontAwesomeIcon icon={faUser} className="menu-icon" />
                  </ListItemIcon>
                  Profile
                  <FontAwesomeIcon icon={faChevronRight} className="menu-item-arrow" />
                </MenuItem>

                <MenuItem onClick={handleClose}>
                  <ListItemIcon>
                    <FontAwesomeIcon icon={faCog} className="menu-icon" />
                  </ListItemIcon>
                  Settings
                </MenuItem>

                <MenuItem onClick={handleClose}>
                  <ListItemIcon>
                    <FontAwesomeIcon icon={faQuestionCircle} className="menu-icon" />
                  </ListItemIcon>
                  Help
                  <FontAwesomeIcon icon={faChevronRight} className="menu-item-arrow" />
                </MenuItem>

                <Divider />

                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <FontAwesomeIcon icon={faSignOutAlt} className="menu-icon" />
                  </ListItemIcon>
                  Log out
                </MenuItem>
              </Menu>}
          </>
        ) : (
          <Box className="auth-buttons">
            <CustomButton
              variable="outline"
              onClick={handleLogin}
              className="auth-button-login"
            >
              Login
            </CustomButton>
            <CustomButton
              variable="primary"
              onClick={handleSignUp}
              className="auth-button-signup"
            >
              Sign Up
            </CustomButton>
          </Box>
        )}
        <ConfirmDialog
          open={openConfirm}
          title="Confirm logout"
          message="Are you sure you want to log out?"
          confirmText="Log out"
          cancelText="Cancel"
          onConfirm={handleConfirmLogout}
          onCancel={() => setOpenConfirm(false)}
        />
      </Toolbar>

      <>
        {openSearchDrawer && (
          <Box className="search-drawer-backdrop" onClick={() => setOpenSearchDrawer(false)} />
        )}
        <Box className={`search-drawer ${openSearchDrawer ? 'search-drawer-open' : ''}`}>
          <Box className="search-drawer-content">
            <Box className="search-drawer-header">
              <Text variant="h6" className="search-drawer-title">
                Search
              </Text>
            </Box>
            <Box className="search-drawer-body">
              <CustomAutocompleteSearchBox
                options={searchResults}
                loading={isLoading}
                onQueryChange={setSearchQuery}
                onSelect={handleSearchSelect}
                placeholder="Search..."
                getOptionLabel={(option) => option?.username || ''}
                renderOption={renderSearchOption}
                sx={{ width: '100%' }}
              />
            </Box>
          </Box>
        </Box>
      </>
    </AppBar>
  )
}

export default AppHeader

