import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSocket, registerSocketPlayer } from '../lib/socket';
import { getPlayerId } from '../lib/auth';

export default function GameRedirectListener() {
  const navigate = useNavigate();

  useEffect(() => {
    const socket = getSocket();
    registerSocketPlayer(getPlayerId());

    const goLobby = () => {
      navigate('/lobby', { replace: true });
    };

    socket.on('returnToLobby', goLobby);

    return () => {
      socket.off('returnToLobby', goLobby);
    };
  }, [navigate]);

  return null;
}
