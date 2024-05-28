import React from 'react';

const NodesPanel = ({ onDragStart }) => {
  return (
    <aside>
      <div
        className="dndnode input"
        onDragStart={(event) => onDragStart(event, 'textNode')}
        draggable
      >
        <h2>Message</h2>
      </div>
    </aside>
  );
};

export default NodesPanel;
