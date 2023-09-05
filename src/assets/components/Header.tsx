import React, { useState, useContext, useEffect } from 'react';
import { ConnectionContext, ConnectionStatuses } from './ConnectionManager';
import HeaderTransaction from './HeaderTransaction';

export default function Header() {
  const { connectionStatus, walletAddress, connect, pendingTransactions } = useContext(ConnectionContext);
  const [ pendingList, setPendingList ] = useState<React.JSX.Element[]>([]);

  useEffect(() => {
    const pending : Array<React.JSX.Element> = [];
    pendingTransactions.forEach((elemHash)=>{
      pending.push(<HeaderTransaction key={ elemHash.hash } receipt={ elemHash } />)
    });
    setPendingList(pending);
  }, [pendingTransactions]);

  return(
    <>
      <nav className="navbar navbar-expand-lg bg-dark text-white" style={{ position: 'relative' }}>
        <div className="container-fluid h5">Calculator Web3 App</div>
        <div className="d-flex justify-content-end w-100">
          {connectionStatus === ConnectionStatuses.CONNECTED ? (
            String(walletAddress).substring(0, 10) + '... '
          ) : (
            <button className="flex-item btn btn-primary" onClick={ connect }>
              Connect MetaMask
            </button>
          )}
        </div>
        <div className="position-absolute p-1 top-100 end-0 text-dark" style={{ zIndex : "1" }}>
          { pendingList }
        </div>
      </nav>
    </>
  )
}