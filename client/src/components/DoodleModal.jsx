import React from 'react';
import { Tldraw } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';

const DoodleModal = ({ isOpen, onClose }) => {
  // Handle store change
  const handleMount = (app) => {
    // You can access the store and app instance here
    console.log('Tldraw mounted:', app);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white w-[90vw] max-w-[1200px] h-[90vh] max-h-[850px] rounded-lg shadow-xl flex flex-col my-8">
        <div className="flex justify-between items-center px-6 py-3 border-b">
          <h2 className="text-xl font-semibold">Whiteboard</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <Tldraw 
            persistenceKey="code-collab-whiteboard"
            onMount={handleMount}
            autoFocus
          />
        </div>
      </div>
    </div>
  );
};

export default DoodleModal;