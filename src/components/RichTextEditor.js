import React, { useMemo, useEffect } from 'react';
import { Slate, Editable, withReact } from 'slate-react';
import { createEditor } from 'slate';
import './RichTextEditor.css';

const RichTextEditor = ({ content, setContent, onClose, isLoading }) => {
  const editor = useMemo(() => withReact(createEditor()), []);

  // Sync the editor content with the parent component
  useEffect(() => {
    if (JSON.stringify(content) !== JSON.stringify(editor.children)) {
      editor.children = content; // Sync content with Slate's editor state
      editor.onChange(); // Trigger re-render
    }
  }, [content, editor]);

  return (
    <div className="editor-container">
      <button className="close-btn" onClick={onClose}>
        ✕
      </button>
      <Slate editor={editor} value={content} onChange={setContent}>
        <Editable
          placeholder={isLoading ? 'Generating content...' : 'Write something...'}
          style={{
            border: '1px solid #ccc',
            padding: '10px',
            minHeight: '200px',
          }}
          readOnly={isLoading}
        />
      </Slate>
    </div>
  );
};

export default RichTextEditor;
