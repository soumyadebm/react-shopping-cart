import { useState, FormEvent, useEffect } from 'react';
import { useAuth } from 'contexts/auth-context';
import rudderanalytics from '../../utils/rudderstack';

import * as S from './style';

interface IProps {
  isOpen: boolean;
  onClose: () => void;
}

const Login = ({ isOpen, onClose }: IProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setUsername('');
      setPassword('');
      rudderanalytics.track('Login Modal Opened', {});
    }
  }, [isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (username.trim()) {
      // Call RudderStack identify with username as userId
      rudderanalytics.identify(username, {
        username: username,
        login_method: 'simple_login'
      });

      // Login user (no verification - accepts any credentials)
      login(username, password);
      
      // Close modal after login
      onClose();
    }
  };

  const handleDismiss = () => {
    rudderanalytics.track('Login Modal Dismissed', {});
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleDismiss();
    }
  };

  if (!isOpen) return null;

  return (
    <S.Overlay onClick={handleOverlayClick}>
      <S.LoginCard onClick={(e) => e.stopPropagation()}>
        <S.CloseButton onClick={handleDismiss}>×</S.CloseButton>
        <S.Title>Login</S.Title>
        <S.Subtitle>Optional - Any credentials will work</S.Subtitle>
        <S.Form onSubmit={handleSubmit}>
          <S.InputGroup>
            <S.Label htmlFor="username">Username</S.Label>
            <S.Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter any username"
              required
              autoFocus
            />
          </S.InputGroup>
          <S.InputGroup>
            <S.Label htmlFor="password">Password</S.Label>
            <S.Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter any password"
              required
            />
          </S.InputGroup>
          <S.SubmitButton type="submit">Login</S.SubmitButton>
          <S.Hint>No verification required</S.Hint>
        </S.Form>
      </S.LoginCard>
    </S.Overlay>
  );
};

export default Login;

