import React, { createContext, useState } from 'react';
import { mintToken } from './utils/contractUtilities';

const AccountContext = createContext();

const AccountProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [inProgress, setInProgress] = useState(false);

  const login = async () => {
    if(window.ethereum){
      let account;
      let loggedIn = false;
      setInProgress(true);
      await window.ethereum.request({method: 'eth_requestAccounts'})
      .then(async (result) => {
          // default to the first account (assuming user only have 1 account when login)
          account = result[0];
          loggedIn = await mintToken();
      }).catch(error => {
          console.error('Error fetching accounts:', error.code);
          if (error?.code === 4001) {
            alert('login from wallet has been rejected. Please relogin again.');
          }
      }).finally(() => {
        loggedIn && setAccount(account);
        setInProgress(false);
      });
    } else {
      alert('You need to have a metamask account to login!');
    }
  };

  const logout = () => {
    setAccount(null);
  };

  return (
    <AccountContext.Provider value={{ account, login, logout, inProgress }}>
      {children}
    </AccountContext.Provider>
  );
};

export { AccountContext, AccountProvider };
