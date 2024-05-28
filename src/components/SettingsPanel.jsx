import React from 'react';

const SettingsPanel = ({ selectedNode, handleTextChange, onBack }) => {
  return (
    <aside>
      <h2>Settings</h2>
      <textarea value={selectedNode.data.text} onChange={handleTextChange} />
      <button onClick={onBack}>← Back</button>
    </aside>
  );
};

export default SettingsPanel;
