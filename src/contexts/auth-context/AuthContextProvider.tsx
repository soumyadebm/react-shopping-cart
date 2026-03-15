import { createContext, useContext, FC, useState, useEffect } from 'react';
import rudderanalytics from '../../utils/rudderstack';

export interface IAuthContext {
  isAuthenticated: boolean;
  username: string | null;
  login: (username: string, password: string) => void;
  logout: () => void;
}

const AuthContext = createContext<IAuthContext | undefined>(undefined);

const useAuthContext = (): IAuthContext => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  return context;
};

const AuthProvider: FC = (props) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>(null);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('username');
    const savedAuth = localStorage.getItem('isAuthenticated');
    
    if (savedAuth === 'true' && savedUsername) {
      setIsAuthenticated(true);
      setUsername(savedUsername);
      // Call identify when loading saved session
      rudderanalytics.identify(savedUsername, {
        username: savedUsername,
        login_method: 'session_restored'
      });
    }
  }, []);

  const login = (username: string, password: string) => {
    // No verification - accept any credentials
    setIsAuthenticated(true);
    setUsername(username);
    localStorage.setItem('username', username);
    localStorage.setItem('isAuthenticated', 'true');
  };

  const logout = () => {
    // Track logout before resetting identity
    rudderanalytics.track('User Logged Out', {
      username: username,
      login_method: localStorage.getItem('login_method') || 'simple_login'
    });

    setIsAuthenticated(false);
    setUsername(null);
    localStorage.removeItem('username');
    localStorage.removeItem('isAuthenticated');
    // Reset user identification in RudderStack
    rudderanalytics.reset();
  };

  const AuthContextValue: IAuthContext = {
    isAuthenticated,
    username,
    login,
    logout,
  };

  return <AuthContext.Provider value={AuthContextValue} {...props} />;
};

export { AuthProvider, useAuthContext };
