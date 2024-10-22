import React, { useState, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import { TextField, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import RichTextEditor from './RichTextEditor.js';
import './ChatBot.css';
import axios from 'axios';

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editorContent, setEditorContent] = useState([
    { type: 'paragraph', children: [{ text: '' }] },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false); // Animation lock
  const nodeRef = useRef(null);

  // Handle sending messages
  const handleSend = async () => {
    if (!input.trim() || isAnimating) return; // Prevent sending during animation

    // Add user message to chat
    setMessages(prevMessages => [...prevMessages, { type: 'user', text: input }]);

    const isCanvasRequest = input.toLowerCase().includes('canvas');
    if (isCanvasRequest) setIsLoading(true);

    try {
      // Fetch AI response
      const response = await axios.post('http://localhost:5000/api/generate', { prompt: input });
      const aiText = response.data.text;

      // Add AI response to chat
      setMessages(prevMessages => [...prevMessages, { type: 'ai', text: aiText }]);

      // If "canvas" was requested, update the editor content and animate
      if (isCanvasRequest) {
        setShowEditor(true);
        await startTextAnimation(aiText); // Wait for animation to finish
      }
    } catch (error) {
      console.error('Error fetching AI response:', error);
    } finally {
      setIsLoading(false);
      setIsAnimating(false); // Unlock animation
    }

    setInput('');
  };

  // Start the word-by-word text animation
  const startTextAnimation = async (text) => {
    setIsAnimating(true); // Lock animation
    setEditorContent([{ type: 'paragraph', children: [{ text: '' }] }]);

    const words = text.split(' ');
    let index = 0;
    let currentText = '';

    const animateWord = () => {
      if (index < words.length) {
        currentText += (index === 0 ? '' : ' ') + words[index];
        setEditorContent([{ type: 'paragraph', children: [{ text: currentText }] }]);
        index++;
        setTimeout(animateWord, 100); // Adjust speed as needed
      } else {
        // Final update to ensure the complete text is displayed
        setEditorContent([{ type: 'paragraph', children: [{ text }] }]);
        setIsAnimating(false); // Unlock animation after completion
      }
    };

    // Start animation
    animateWord();
  };

  return (
    <div className="chat-container">
      <div className="chat-window">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-bubble ${msg.type === 'user' ? 'user-bubble' : 'ai-bubble'}`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <IconButton onClick={handleSend} color="primary">
          <SendIcon />
        </IconButton>
      </div>

      {/* Sliding Rich Text Editor */}
      <CSSTransition
        in={showEditor}
        timeout={300}
        classNames="slide"
        unmountOnExit
        nodeRef={nodeRef}
      >
        <div className="sliding-editor" ref={nodeRef}>
          <RichTextEditor
            content={editorContent}
            setContent={setEditorContent}
            onClose={() => setShowEditor(false)}
            isLoading={isLoading}
          />
        </div>
      </CSSTransition>
    </div>
  );
};

export default ChatBot;
