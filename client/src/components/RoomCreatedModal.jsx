import React, { useState } from 'react';

const RoomCreatedModal = ({ isOpen, onClose, roomData }) => {
  const [copySuccess, setCopySuccess] = useState('');

  if (!isOpen || !roomData) return null;

  const roomDetails = `Room ID: ${roomData.roomId}\nJoin Code: ${roomData.joinCode}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(roomDetails);
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      setCopySuccess('Failed to copy');
      setTimeout(() => setCopySuccess(''), 2000);
    }
  };

  const shareRoom = async () => {
    const shareText = `Join my coding room!\n\nRoom ID: ${roomData.roomId}\nJoin Code: ${roomData.joinCode}\n\nJoin at: ${window.location.origin}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join My Coding Room',
          text: shareText,
        });
      } catch (err) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareText);
        setCopySuccess('Link copied!');
        setTimeout(() => setCopySuccess(''), 2000);
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(shareText);
      setCopySuccess('Share link copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center px-4 text-center">
        <div className="relative inline-block transform overflow-hidden rounded-lg bg-white px-6 py-6 text-left align-middle shadow-xl transition-all w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              🎉 Room Created Successfully!
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Room ID</label>
                  <div className="flex items-center justify-between bg-white rounded border px-3 py-2 mt-1">
                    <span className="text-sm font-mono text-gray-800">{roomData.roomId}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Join Code</label>
                  <div className="flex items-center justify-between bg-white rounded border px-3 py-2 mt-1">
                    <span className="text-sm font-mono text-gray-800">{roomData.joinCode}</span>
                  </div>
                </div>
              </div>
            </div>

            {copySuccess && (
              <div className="text-center text-sm text-green-600 font-medium">
                {copySuccess}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={copyToClipboard}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </button>
              <button
                onClick={shareRoom}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm bg-[var(--primary-color)] text-sm font-medium text-white hover:bg-purple-700 transition-colors"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Share
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              Share these details with others to let them join your room
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCreatedModal;