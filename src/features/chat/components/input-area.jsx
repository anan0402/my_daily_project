import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import InputBase from '@mui/material/InputBase'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFaceSmile, faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import './input-area.css'

function InputArea({ inputRef, inputValue, onInputChange, onKeyPress, onSendMessage }) {
  return (
    <Box className="chat-input-container">
      <div className="chat-emoji-button">
        <FontAwesomeIcon icon={faFaceSmile} />
      </div>

      <InputBase
        ref={inputRef}
        placeholder="Message"
        value={inputValue}
        onChange={onInputChange}
        onKeyPress={onKeyPress}
        className="chat-input"
        multiline
        maxRows={4}
      />

      <div
        onClick={onSendMessage}
        disabled={!inputValue.trim()}
        className={`chat-send-button ${inputValue.trim() ? 'chat-send-button--active' : ''}`}
      >
        <FontAwesomeIcon icon={faPaperPlane}/>
      </div>
    </Box>
  )
}

export default InputArea
