import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers, ContractTransactionResponse  } from 'ethers';
import { WindowContext, Modals } from './WindowManager';
import BigNumber from 'bignumber.js';

export const chainId = "0x" + new BigNumber("1337").toString(16);

export const enum ConnectionStatuses {
    NOT_CONNECTED,
    CONNECTING,
    CONNECTED
}

export type ConnectionDataTypes = {
    connectionStatus: ConnectionStatuses, 
    walletAddress: string, 
    provider: any,
    pendingTransactions: ContractTransactionResponse[],
    connect: () => Promise<boolean>,
    disconnect: () => void,
    resetStatus: () => void,
    addPendingTransaction: (receipt: ContractTransactionResponse)=>void,
}

export const ConnectionContext = createContext<ConnectionDataTypes>({
    connectionStatus: ConnectionStatuses.NOT_CONNECTED,
    walletAddress: "",
    provider: null, 
    pendingTransactions: [],
    connect: async()=>{ return false; },
    disconnect: ()=>{ },
    resetStatus: ()=>{ },
    addPendingTransaction: ( receipt )=>{ }
});

export default function ConnectionManager({ children } : { children:any }) {

    const { setWindowType } = useContext(WindowContext);

    const [ connectionStatus, setConnectionStatus ] = useState<ConnectionStatuses>(ConnectionStatuses.NOT_CONNECTED);
    const [ walletAddress, setWalletAddress ] = useState<string>("");
    const [ provider, setProvider ] = useState<any | null>(null);
    const [ pendingTransactions, setPendingTransactions ] = useState<ContractTransactionResponse[]>([]);

    function saveData(account:string)
    {
        setProvider(new ethers.BrowserProvider(window.ethereum));
        setConnectionStatus(ConnectionStatuses.CONNECTED);
        setWalletAddress(account);
    }

    const connect = async () => {
        
        if(typeof window.ethereum == 'undefined' || window.ethereum == null)
        {
            setWindowType(Modals.NO_METAMASK);
            return false;
        }
        setConnectionStatus(ConnectionStatuses.CONNECTING);
        const currentChain = await window.ethereum.request({ method: 'eth_chainId' });
        if(currentChain !== chainId)
        {
            setWindowType(Modals.CONNECTING_CHAIN);
            try
            {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: chainId }]
                });
                    
            }
            catch(e)
            {
                setWindowType(Modals.WRONG_NETWORK);
                return false;
            }
            
            try
            {
                window.ethereum.on('chainChanged', function(networkId : string){
                    if(networkId !== chainId)
                    {
                        setWindowType(Modals.WRONG_NETWORK);
                        return false;
                    }
                    /*else 
                    {
                        
                    }*/
                });
            }
            catch(e)
            {
                setWindowType(Modals.REJECTED_CHAIN_CHANGE);
                return false;
            }
        }
        try
        {
            setWindowType(Modals.CONNECTING_ACCOUNTS);
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            saveData(accounts[0]);
            setWindowType(Modals.NOTHING);
        }
        catch(e)
        {
            setWindowType(Modals.REJECTED_ACCOUNT_CONNECTING);
            return false;
        }

        return true;
    }

    const disconnect = async() => {
        setProvider(null)
        setConnectionStatus(ConnectionStatuses.NOT_CONNECTED)
        setWalletAddress("")
    }

    const resetStatus = async() => {
        setConnectionStatus(ConnectionStatuses.NOT_CONNECTED);
    }

    const addPendingTransaction = async(receipt : ContractTransactionResponse) => {
        setPendingTransactions(prevPendingTransactions => [
            ...prevPendingTransactions, receipt
        ]);
    }

    const tryConnectInBackground = useCallback(async() => {
        if(typeof window.ethereum == 'undefined' || window.ethereum == null)
        {
            return;
        }
        let connected = false;
        let accounts;
        try 
        {
            accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
            if(accounts.length > 0)
            {
                connected = true;
            }
        }
        catch(e) { }
        
        if(!connected)
        {
            return;
        }

        try 
        {
            const currentChain = await window.ethereum.request({ method: 'eth_chainId' });
            if(currentChain === chainId)
            {
                saveData(accounts[0]);
            }
            else 
            {
                return false;
            }
        }
        catch(e)
        {
            return false;
        }
    }, []);

    const handleAccountsChanged = useCallback(async(accounts : Array<string>) => {
        if(typeof window.ethereum == 'undefined' || window.ethereum == null)
        {
            return;
        }
        if(accounts.length > 0)
        {
            setWalletAddress(accounts[0]);
        }
        else 
        {
            setWindowType(Modals.REJECTED_ACCOUNT_CONNECTING);
            setConnectionStatus(ConnectionStatuses.NOT_CONNECTED);
        }
    }, [setWindowType]);

    const handleChainChanged = useCallback(async(networkId : string) => {
        try 
        {
            if(networkId === chainId)
            {
                tryConnectInBackground();
                setConnectionStatus(ConnectionStatuses.CONNECTING);
            }
            else 
            {
                setWindowType(Modals.WRONG_NETWORK);
                setConnectionStatus(ConnectionStatuses.NOT_CONNECTED);
            }
        }
        catch(e)
        {
            setWindowType(Modals.REJECTED_CHAIN_CHANGE);
        }
    }, [setWindowType, tryConnectInBackground]);

    useEffect(()=>{
        if(typeof window.ethereum == 'undefined' || window.ethereum == null)
        {
            return;
        }
        window.ethereum.on('chainChanged', handleChainChanged);
        window.ethereum.on('accountsChanged', handleAccountsChanged);

        return () => {
            window.ethereum.removeListener('chainChanged', handleChainChanged);
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        };
    }, [handleAccountsChanged, handleChainChanged]);

    useEffect(()=>{
        (async () => {

            tryConnectInBackground();
        })();
    }, [tryConnectInBackground]);

    const contextValues : ConnectionDataTypes = {
        connectionStatus,
        walletAddress,
        provider,
        pendingTransactions,
        connect,
        disconnect,
        resetStatus,
        addPendingTransaction
    }                                                                                                                                                                                                           

    return (
        <ConnectionContext.Provider value={ contextValues }>
            { children }
        </ConnectionContext.Provider>
    )
}