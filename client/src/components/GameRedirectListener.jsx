import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSocket } from '../lib/socket';
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

    return () => {
      socket.off('returnToLobby', onReturnAfterGame);
    };
  }, [navigate]);

  return null;
}
