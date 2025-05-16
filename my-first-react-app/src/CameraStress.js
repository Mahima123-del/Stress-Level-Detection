
import React, { useRef, useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';

const VIDEO_WIDTH = 480;
const VIDEO_HEIGHT = 360;
const WS_URL = "ws://localhost:8000/ws/analyze";

const Page = styled.div`
  display: flex;
  justify-content: center;
  align-items: stretch;
  height: 100vh;
  background: linear-gradient(to right, #e0f7fa, #ffffff);
  padding: 20px;
  box-sizing: border-box;
  gap: 20px;
`;

const PanelImage = styled.img`
  width: 300px;
  max-width: 400px;
  height: 450px;
  margin-bottom: 15px;
  border-radius: 10px;
`;

const SidePanel = styled.div`
  width: 20%;
  min-width: 180px;
  background-color: #ffffffdd;
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column; /* Change flex direction to column */
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 30px 20px;
  font-family: 'Segoe UI', sans-serif;
  color: #333;
`;

const SidePanelHeading = styled.h2`
  font-size: 28px;
  margin-bottom: 10px;
`;

const SidePanelText = styled.p`
  font-size: 16px;
  line-height: 1.5;
`;

const CenterBox = styled.div`
  flex-grow: 1;
  max-width: 800px;
  background: #ffffff;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
  text-align: center;
  display: flex;
  flex-direction: column; /* Stack video and metrics vertically */
  justify-content: center; /* Center content vertically */
  align-items: center;     /* Center content horizontally */
  gap: 20px;               /* Space between video and metrics */
`;


const Heading = styled.h1`
  font-size: 40px;
  color: #00796b;
  margin-bottom: 30px;
`;

const VideoContainer = styled.div`
  position: relative;
  width: ${VIDEO_WIDTH}px;
  height: ${VIDEO_HEIGHT}px;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  margin: 0;
    justify-content: center; 
  align-items: center;      
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
`;

const MetricsContainer = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  width: ${VIDEO_WIDTH}px;
  backdrop-filter: blur(10px);
  margin-bottom: 1rem;
`;

const MetricItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-radius: 10px;
  background: ${props => props.level > 50 ? 'rgba(255, 68, 68, 0.2)' : 'rgba(68, 255, 68, 0.2)'};
  margin-bottom: 1rem;
  transition: all 0.3s ease;
`;

const MetricLabel = styled.span`
  color: #ffffff;
  font-size: 1.2rem;
  font-weight: 500;
`;

const MetricValue = styled.span`
  color: ${props => props.level > 50 ? '#ff4444' : '#44ff44'};
  font-size: 1.2rem;
  font-weight: bold;
`;

const StatusIndicator = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => props.connected ? '#44ff44' : '#ff4444'};
  box-shadow: 0 0 10px ${props => props.connected ? '#44ff44' : '#ff4444'};
`;

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [stress, setStress] = useState(0);
  const [dominantEmotion, setDominantEmotion] = useState({ name: '', value: 0 });

  const drawFaceBox = useCallback((ctx, region) => {
    if (!ctx || !region || region.w <= 0 || region.h <= 0) return;

    ctx.canvas.width = VIDEO_WIDTH;
    ctx.canvas.height = VIDEO_HEIGHT;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);

    const x = Math.round(region.x);
    const y = Math.round(region.y);
    const w = Math.round(region.w);
    const h = Math.round(region.h);

    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.stroke();

    const cornerSize = 15;
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.moveTo(x + cornerSize, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + cornerSize);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + w - cornerSize, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + cornerSize);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + w, y + h - cornerSize);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + w - cornerSize, y + h);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, y + h - cornerSize);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x + cornerSize, y + h);
    ctx.stroke();
  }, []);

  const connectWebSocket = useCallback(() => {
    wsRef.current = new WebSocket(WS_URL);

    wsRef.current.onopen = () => {
      console.log('WebSocket Connected');
      setIsConnected(true);
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket Disconnected');
      setIsConnected(false);
      setTimeout(connectWebSocket, 2000);
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.success && canvasRef.current) {
        setStress(parseFloat(data.stress).toFixed(1));

        const emotions = data.emotions;
        if (emotions) {
          const dominant = Object.entries(emotions).reduce((max, [name, value]) =>
            value > max.value ? { name, value } : max,
            { name: '', value: 0 }
          );
          setDominantEmotion({
            name: dominant.name,
            value: parseFloat(dominant.value).toFixed(1)
          });
        }

        const ctx = canvasRef.current.getContext('2d');
        if (data.region) {
          drawFaceBox(ctx, data.region);
        }
      } else {
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          ctx.clearRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
        }
      }
    };
  }, [drawFaceBox]);

  const initializeVideo = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { exact: VIDEO_WIDTH },
          height: { exact: VIDEO_HEIGHT },
          facingMode: "user",
          frameRate: { ideal: 15 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          if (canvasRef.current) {
            canvasRef.current.width = VIDEO_WIDTH;
            canvasRef.current.height = VIDEO_HEIGHT;
          }
        };
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  }, []);

  useEffect(() => {
    connectWebSocket();
    initializeVideo();

    const sendFrameInterval = setInterval(() => {
      if (videoRef.current && wsRef.current?.readyState === WebSocket.OPEN) {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        tempCanvas.width = VIDEO_WIDTH;
        tempCanvas.height = VIDEO_HEIGHT;

        tempCtx.drawImage(videoRef.current, 0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
        const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.8);
        wsRef.current.send(JSON.stringify({ image: dataUrl }));
        tempCanvas.remove();
      }
    }, 200);

    return () => {
      clearInterval(sendFrameInterval);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connectWebSocket, initializeVideo]);

  return (
    <Page>
      <SidePanel>
      <PanelImage src="/images/photo6.jpg" alt="Relax Icon" />
        <SidePanelHeading>🧘‍♀️ Relax</SidePanelHeading>
        <SidePanelText>Take a deep breath and express freely.</SidePanelText>
      </SidePanel>

      <CenterBox>
        <Heading>Stress & Emotion Analysis</Heading>
        <VideoContainer>
          <Video ref={videoRef} />
          <Canvas ref={canvasRef} />
          <StatusIndicator connected={isConnected} />
        </VideoContainer>

        <MetricsContainer>
          <MetricItem level={stress}>
            <MetricLabel>Stress Level:</MetricLabel>
            <MetricValue level={stress}>{stress}</MetricValue>
          </MetricItem>
          <MetricItem level={dominantEmotion.value}>
            <MetricLabel>Dominant Emotion:</MetricLabel>
            <MetricValue level={dominantEmotion.value}>{dominantEmotion.name}</MetricValue>
          </MetricItem>
        </MetricsContainer>
      </CenterBox>

      <SidePanel>
      <PanelImage src="/images/photo5.jpg" alt="Relax Icon" />
        <SidePanelHeading>🌿 Breathe</SidePanelHeading>
        <SidePanelText>You're not alone. This tool is here to help you.</SidePanelText>
      </SidePanel>
    </Page>
  );
}

export default App;
