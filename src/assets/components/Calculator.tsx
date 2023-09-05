import { useContext, useState, useEffect, useCallback } from "react"
import { ConnectionContext, ConnectionStatuses } from "./ConnectionManager";
import { WindowContext, Modals } from './WindowManager';
import { Contract } from 'ethers'

interface NetworkInfo {
    address: string;
}

interface ArtifactInfo {
    abi: any,
    networks : Array<NetworkInfo>
}

enum ButtonType {
    ADD = "+",
    SUB = "-",
    MUL = "*",
    DIV = "/",
}

export default function Calculator(props : { contractName: string })
{
    const { setWindowType } = useContext(WindowContext);
    const { connectionStatus, provider, addPendingTransaction } = useContext(ConnectionContext);

    const [contract, setContract] = useState<Contract>();
    const [calculatorValue, setCalculatorValue] = useState<number>(0);
    const [inputValue, setInputValue] = useState<number>(0);

    const handleContractButton = async(buttonType: ButtonType)=>{
        if(!contract)
        {
            return;
        }
        let receipt;
        setWindowType(Modals.WAITING_FOR_TRANSACTION)
        try {
            switch(buttonType)
            {
                case ButtonType.ADD:
                    receipt = await contract.add(inputValue);
                    break;
                case ButtonType.SUB:
                    receipt = await contract.sub(inputValue);
                    break;
                case ButtonType.MUL:
                    receipt = await contract.mul(inputValue);
                    break;
                case ButtonType.DIV:
                    receipt = await contract.div(inputValue);
                    break;
            }
            addPendingTransaction(receipt);
            setWindowType(Modals.NOTHING)
        }
        catch(e)
        {
            setWindowType(Modals.REJECTED_TRANSACTION)
        }
    }

    const handleUpdateEvent = useCallback((newValue : number) => {
        setCalculatorValue(Number(newValue.toString()));
    }, []);
    
    const fetchContract = useCallback(async() => {
        try 
        {

            const artifact : ArtifactInfo = require(`./.././contracts/${props.contractName}.json`);
            const networkValue = artifact.networks[window.ethereum.networkVersion];
            const signer = await provider.getSigner();
            const contractTmp = new Contract(networkValue.address, artifact.abi, signer);
            setContract(contractTmp);
            contractTmp.on("ValueChanged", handleUpdateEvent);
            setCalculatorValue((await contractTmp.value()).toString());
        }
        catch(e)
        {
            console.error("Could not load contract: ", e);
        }
    }, [props.contractName, provider, setContract, handleUpdateEvent, setCalculatorValue]);

    useEffect(()=>{
        if (!contract && connectionStatus === ConnectionStatuses.CONNECTED)
        {
            fetchContract();
        }
        /*(async()=>{
            if (!contract && connectionStatus === ConnectionStatuses.CONNECTED)
            {
                await fetchContract();
            }
        })();*/

    }, [connectionStatus, contract, props.contractName, provider, fetchContract]);

    return (
        <div className="d-flex justify-content-center mt-5">
            <div className="card" style={{"width": "18rem"}}>
                <img src={require('./../img/calc.png')} className="card-img-top" alt="..." />
                <div className="card-body">
                    <h5 className="card-title">Calculator</h5>
                    <p className="card-text">A simple decentralized calculator allows users to input numbers and perform basic mathematical operations such as addition, subtraction, multiplication, and division using intuitive buttons.</p>
                </div>
                <ul className="list-group list-group-flush">
                    <li className="list-group-item">Current value: <span className="fw-bold">{calculatorValue}</span></li>
                </ul>
                <div className="card-body d-flex justify-content-between">
                    <input type="number" className="form-control" style={{maxWidth: "5rem"}} value={inputValue} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{setInputValue(Number(e.target.value))}} />
                    {Object.values(ButtonType).map((buttonType) => (
                        <button
                            key={buttonType} 
                            className="btn btn-primary" 
                            disabled={ connectionStatus !== ConnectionStatuses.CONNECTED } 
                            onClick={()=>{handleContractButton(buttonType as ButtonType)}} 
                        >
                            {buttonType}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}