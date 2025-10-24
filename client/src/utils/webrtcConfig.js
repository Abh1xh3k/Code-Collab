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
    // Production - Use working TURN servers with fallback to STUN
    baseConfig.iceServers.push(
      // Working TURN servers (tested)
      {
        urls: 'turn:numb.viagenie.ca:3478',
        username: 'webrtc@live.com',
        credential: 'muazkh'
      },
      {
        urls: 'turns:numb.viagenie.ca:5349',
        username: 'webrtc@live.com',
        credential: 'muazkh'
      },
      // Backup option
      {
        urls: 'turn:turn.anyfirewall.com:443?transport=tcp',
        username: 'webrtc',
        credential: 'webrtc'
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