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
    rtcpMuxPolicy: 'require',
    iceTransportPolicy: isProduction ? 'relay' : 'all' // Force TURN in production
  };

  if (isProduction) {
    // Production TURN servers (HTTPS compatible) - Multiple reliable options
    baseConfig.iceServers.push(
      // Metered TURN (most reliable free option)
      {
        urls: 'turns:relay1.expressturn.com:443',
        username: 'ef3CRVJKR3L5XC8MWX',
        credential: 'wwZ8gCJXinuqEdGU1T'
      },
      {
        urls: 'turn:relay1.expressturn.com:3478',
        username: 'ef3CRVJKR3L5XC8MWX',
        credential: 'wwZ8gCJXinuqEdGU1T'
      },
      // Backup TURN servers
      {
        urls: 'turns:openrelay.metered.ca:443',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      // Additional backup
      {
        urls: 'turn:numb.viagenie.ca:3478',
        username: 'webrtc@live.com',
        credential: 'muazkh'
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