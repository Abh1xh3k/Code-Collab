// WebRTC configuration helper
export const getWebRTCConfig = () => {
  const isProduction = window.location.protocol === 'https:';
  
  const baseConfig = {
    iceServers: [
      // Always include basic STUN servers
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
    ],
    iceCandidatePoolSize: 10,
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require'
  };

  // Use your custom coturn server for both production and development
  baseConfig.iceServers.push(
    // Your custom coturn server
    {
      urls: [
        "stun:109.199.108.199:3478",
        "turn:109.199.108.199:3478"
      ],
      username: "user",
      credential: "password"
    }
  );

  return baseConfig;
};

export default getWebRTCConfig;
