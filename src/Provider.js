import React, { createContext, useState } from 'react';
import { mintToken } from './utils/contractUtilities';

const AccountContext = createContext();

const AccountProvider = ({ children }) => {
  const [account, setAccount] = useState(null);

  const login = async () => {
    if(window.ethereum){
      let account;
      await window.ethereum.request({method: 'eth_requestAccounts'})
      .then(async (result) => {
          // default to the first account (assuming user only have 1 account when login)
          account = result[0];
          await mintToken();
      }).catch(error => {
          console.error('Error fetching accounts:', error);
      }).finally(() => {
        setAccount(account);
      });
    }
  };

  const logout = () => {
    setAccount(null);
  };

  return (
    <AccountContext.Provider value={{ account, login, logout }}>
      {children}
    </AccountContext.Provider>
  );
};

export { AccountContext, AccountProvider };
