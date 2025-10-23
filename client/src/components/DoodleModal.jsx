import React, { useRef, useEffect } from 'react';
import { Tldraw } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';

const DoodleModal = ({ isOpen, onClose, roomId, socketRef }) => {
  const handleClose = () => {
    onClose();
    // Notify other users that whiteboard is closing
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('close-whiteboard', { roomId });
    }
  };
  const appRef = useRef(null);

  const handleMount = (app) => {
    appRef.current = app;
    console.log('Tldraw mounted:', app);

    // Simple approach: send document data
    const unsubscribe = app.store.listen(() => {
      if (app.store.source === 'remote') return;

      // Get all shapes from the store
      const shapes = app.store.query.records('shape').get();
      const shapesArray = Array.from(shapes.values());
      
      const message = {
        type: 'tldraw_snapshot',
        roomId: roomId,
        data: shapesArray
      };

      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('tldraw_snapshot', message);
        console.log('Sent Tldraw shapes:', shapesArray.length);
      }
    });

    return () => {
      unsubscribe();
    };
  };

  useEffect(() => {
    if (!socketRef.current) return;

    const handleRemoteSnapshot = (data) => {
      if (data.type === 'tldraw_snapshot' && data.roomId === roomId) {
        console.log('Received remote Tldraw shapes:', data.data.length);
        
        if (appRef.current) {
          try {
            // Clear existing shapes and add new ones
            const app = appRef.current;
            const currentShapes = app.store.query.records('shape').get();
            const currentShapeIds = Array.from(currentShapes.keys());
            
            // Remove all current shapes
            if (currentShapeIds.length > 0) {
              app.deleteShapes(currentShapeIds);
            }
            
            // Add new shapes
            if (data.data.length > 0) {
              app.createShapes(data.data);
            }
            
            console.log('Applied remote shapes');
          } catch (error) {
            console.error('Error applying shapes:', error);
          }
        }
      }
    };

    socketRef.current.on('tldraw_snapshot', handleRemoteSnapshot);

    return () => {
      if (socketRef.current) {
        socketRef.current.off('tldraw_snapshot', handleRemoteSnapshot);
      }
    };
  }, [roomId, socketRef, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white w-[90vw] max-w-[1200px] h-[90vh] max-h-[850px] rounded-lg shadow-xl flex flex-col my-8">
        <div className="flex justify-between items-center px-6 py-3 border-b">
          <h2 className="text-xl font-semibold">Whiteboard</h2>
          <button 
            onClick={handleClose}
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
            readOnly={false}
            shareZone={<div />}
          />
        </div>
      </div>
    </div>
  );
};

export default DoodleModal;