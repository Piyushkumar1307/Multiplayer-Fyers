import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSocket, registerSocketPlayer } from '../lib/socket';
import { getPlayerId, isLoggedIn } from '../lib/auth';
import { endPlaySession } from '../lib/sessionFlow';

export default function GameRedirectListener() {
  const navigate = useNavigate();

  useEffect(() => {
    const socket = getSocket();

    const onReturnAfterGame = () => {
      endPlaySession();
      navigate('/instructions', { replace: true });
    };

    socket.on('returnToLobby', onReturnAfterGame);

    if (isLoggedIn()) {
      registerSocketPlayer(getPlayerId());
    }

    return () => {
      socket.off('returnToLobby', onReturnAfterGame);
    };
  }, [navigate]);

  return null;
}
