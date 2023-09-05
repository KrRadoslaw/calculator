import * as Icon from 'react-bootstrap-icons';
import {  } from './ConnectionManager';
import { ContractTransactionResponse, ContractTransactionReceipt } from 'ethers';
import { useEffect, useState } from 'react';

export enum TransactionStatus {
    SUCCESS,
    REVERT
}

export interface HeaderTransactionProps {

    receipt: ContractTransactionResponse
}

export default function HeaderTransaction(props: HeaderTransactionProps)
{
    //const [ transaction, setTransaction ] = useState<ContractTransactionReceipt >();
    const [ transactionStatus, setTransactionStatus ] = useState<TransactionStatus >();
    const [ transactionStatusElement, setTransactionStatusElement ] = useState<React.JSX.Element >();
    const [ hidden, setHidden ] = useState<boolean>();


    useEffect(()=>{
        (async()=>{
            let _transaction = await props.receipt.wait() as ContractTransactionReceipt;
            //setTransaction(_transaction);
            if(_transaction.status === 0)
            {  
                setTransactionStatus(TransactionStatus.REVERT);
            }
            else if(_transaction.status === 1)
            {  
                setTransactionStatus(TransactionStatus.SUCCESS);
            }
        })();
    }, [props.receipt]);

    useEffect(()=>{
        switch(transactionStatus)
        {
            case TransactionStatus.SUCCESS:
                setTransactionStatusElement(
                    <div><Icon.Check /></div>
                );
                break;
            case TransactionStatus.REVERT:
                setTransactionStatusElement(
                    <div><Icon.XCircle /></div>
                );
                break;
            default:
                setTransactionStatusElement(
                    <div className="d-flex justify-content-center">
                        <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                );
                break;
        }
    }, [ transactionStatus ]);

    const closeHandle = ()=>{
        setHidden(true);
    }

    if(hidden)
    {
        return <></>
    }

    return( 
        <div className="bg-light m-2 p-3 shadow-sm">
            <div className="d-flex align-items-center">
                {transactionStatusElement} <div className="ms-3">{props.receipt.hash.substring(0, 10) + '... '}</div><button className=" ms-3 btn btn-sm" onClick={closeHandle}>X</button>
            </div>
        </div>
    )
}