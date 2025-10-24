// WebRTC configuration helper
export const getWebRTCConfig = () => {
  const isProduction = window.location.protocol === 'https:';
  
  const baseConfig = {
    iceServers: [
      // STUN servers (always include these)
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
    ],
    iceCandidatePoolSize: 10,
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require'
    // Removed iceTransportPolicy - let WebRTC choose best connection method
  };

  if (isProduction) {
    // Production - Use Google's free STUN + reliable fallback TURN
    baseConfig.iceServers.push(
      // Google's additional STUN servers
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
      
      // Temporarily remove problematic TURN servers for testing
      // Will need proper TURN service for cross-network video calls
      
      // Simple fallback - this may work for some network configurations
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      }
    );
  } else {
    // Development TURN servers (can use HTTP)
    baseConfig.iceServers.push(
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      {
        urls: 'turn:numb.viagenie.ca:3478',
        username: 'webrtc@live.com',
        credential: 'muazkh'
      }
    );
  }

  return baseConfig;
};

export default getWebRTCConfig;