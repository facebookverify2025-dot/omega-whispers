import { useState } from "react";
import { WelcomeScreen } from "./WelcomeScreen";
import { ChatRoom } from "./ChatRoom";

type AppState = 'welcome' | 'chat';

interface RoomData {
  code: string;
  userName: string;
}

export const OmegaApp = () => {
  const [appState, setAppState] = useState<AppState>('welcome');
  const [roomData, setRoomData] = useState<RoomData | null>(null);

  const handleCreateRoom = (roomCode: string, userName: string) => {
    setRoomData({ code: roomCode, userName });
    setAppState('chat');
  };

  const handleJoinRoom = (roomCode: string, userName: string) => {
    setRoomData({ code: roomCode, userName });
    setAppState('chat');
  };

  const handleLeaveRoom = () => {
    setRoomData(null);
    setAppState('welcome');
  };

  if (appState === 'welcome') {
    return (
      <WelcomeScreen 
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
      />
    );
  }

  if (appState === 'chat' && roomData) {
    return (
      <ChatRoom
        roomCode={roomData.code}
        userName={roomData.userName}
        onLeaveRoom={handleLeaveRoom}
      />
    );
  }

  return null;
};