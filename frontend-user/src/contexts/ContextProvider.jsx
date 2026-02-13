import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const StateContext = createContext({
  user: null,
  token: null,
  notification: null,
  setUser: () => { },
  setToken: () => { },
  setNotification: () => { }
})

export const ContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, _setToken] = useState(localStorage.getItem('ACCESS_TOKEN'));
  const [notification, _setNotification] = useState('');

  const setToken = (token) => {
    _setToken(token)
    if (token) {
      localStorage.setItem('ACCESS_TOKEN', token);
    } else {
      localStorage.removeItem('ACCESS_TOKEN');
    }
  }

  const setNotification = (message) => {
    _setNotification(message);
    setTimeout(() => {
      _setNotification('')
    }, 5000)
  }

  useEffect(() => {
    if (token) {
      api.getProfile()
        .then(({ data }) => {
          setUser(data);
        })
        .catch((err) => {
          console.error(err);
          // Optional: if 401, maybe logout?
          if (err.response && err.response.status === 401) {
            setToken(null);
          }
        });
    }
  }, [token]);

  return (
    <StateContext.Provider value={{
      user,
      token,
      setUser,
      setToken,
      notification,
      setNotification
    }}>
      {children}
    </StateContext.Provider>
  )
}

export const useStateContext = () => useContext(StateContext)
