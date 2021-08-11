/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import { ToastContainer, toast } from 'react-toastify';
import './app.scss';
import 'react-toastify/dist/ReactToastify.css';
import { PolyjuiceHttpProvider } from '@polyjuice-provider/web3';
import { AddressTranslator } from 'nervos-godwoken-integration';


import { SimpleStorageWrapper } from '../lib/contracts/SimpleStorageWrapper';
import { CONFIG } from '../config';
import * as ERC20 from '../../build/contracts/ERC20.json';

async function createWeb3() {
    // Modern dapp browsers...
    if ((window as any).ethereum) {
        const godwokenRpcUrl = CONFIG.WEB3_PROVIDER_URL;
        const providerConfig = {
            rollupTypeHash: CONFIG.ROLLUP_TYPE_HASH,
            ethAccountLockCodeHash: CONFIG.ETH_ACCOUNT_LOCK_CODE_HASH,
            web3Url: godwokenRpcUrl
        };

        const provider = new PolyjuiceHttpProvider(godwokenRpcUrl, providerConfig);
        const web3 = new Web3(provider || Web3.givenProvider);

        try {
            // Request account access if needed
            await (window as any).ethereum.enable();
        } catch (error) {
            // User denied account access...
        }

        return web3;
    }

    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    return null;
}

export function App() {
    const [web3, setWeb3] = useState<Web3>(null);
    const [contract, setContract] = useState<SimpleStorageWrapper>();
    const [accounts, setAccounts] = useState<string[]>();
    const [l2Balance, setL2Balance] = useState<bigint>();
    const [existingContractIdInputMessage, setExistingContractIdInputMessage] = useState<string>();
    const [storedMessage, setStoredMessage] = useState<string | undefined>();
    const [deployTxHash, setDeployTxHash] = useState<string | undefined>();
    const [polyjuiceAddress, setPolyjuiceAddress] = useState<string | undefined>();
    const [depositAddress, setDepositAddress] = useState<string>();
    const [sudtBalance, setSudtBalance] = useState<bigint>();
    const [transactionInProgress, setTransactionInProgress] = useState(false);
    const toastId = React.useRef(null);
    const [newStoredNumberInputMessage, setNewStoredNumberInputMessage] = useState<
        string | undefined
    >();

    useEffect(() => {
        (async () => {
            if (accounts?.[0]) {
                const addressTranslator = new AddressTranslator();
                const _polyjuiceAddress = addressTranslator.ethAddressToGodwokenShortAddress(
                    accounts?.[0]
                );
                setPolyjuiceAddress(_polyjuiceAddress);
                const sudtContract = new web3.eth.Contract(
                    ERC20.abi as never,
                    CONFIG.SUDT_PROXY_CONTRACT_ADDRESS
                );
                const balance = BigInt(await sudtContract.methods.balanceOf(_polyjuiceAddress).call({
                    from: accounts?.[0]
                }));
                setSudtBalance(balance);
            } else {
                setPolyjuiceAddress(undefined);
            }
        })();
    }, [accounts?.[0]]);

    useEffect(() => {
        if (transactionInProgress && !toastId.current) {
            toastId.current = toast.info(
                'Transaction in progress. Confirm MetaMask signing dialog and please wait...',
                {
                    position: 'top-right',
                    autoClose: false,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    closeButton: false
                }
            );
        } else if (!transactionInProgress && toastId.current) {
            toast.dismiss(toastId.current);
            toastId.current = null;
        }
    }, [transactionInProgress, toastId.current]);

    const account = accounts?.[0];

    async function deployContract() {
        const _contract = new SimpleStorageWrapper(web3);

        try {
            setDeployTxHash(undefined);
            setTransactionInProgress(true);

            const transactionHash = await _contract.deploy(account);

            setDeployTxHash(transactionHash);
            setExistingContractAddress(_contract.address);
            toast(
                'Successfully deployed the smart-contract. Now you can retrieve or update the message!',
                { type: 'success' }
            );
        } catch (error) {
            console.error(error);
            toast.error(
                'There was an error sending your transaction. Please check developer console.'
            );
        } finally {
            setTransactionInProgress(false);
        }
    }

    async function getStored() {
        const message = await contract.getStored(account);
        toast('Successfully read latest message.', { type: 'success' });

        setStoredMessage(message);
    }

    async function setExistingContractAddress(contractAddress: string) {
        const _contract = new SimpleStorageWrapper(web3);
        _contract.useDeployed(contractAddress.trim());

        setContract(_contract);
        setStoredMessage(undefined);
    }

    async function setNewStored() {
        try {
            setTransactionInProgress(true);
            await contract.setStored(newStoredNumberInputMessage, account);
            toast(
                'You have updated the message! Try retrieving the new message.',
                { type: 'success' }
            );
        } catch (error) {
            console.error(error);
            toast.error(
                'There was an error sending your transaction. Please check developer console.'
            );
        } finally {
            setTransactionInProgress(false);
        }
    }

    useEffect(() => {
        if (web3) {
            return;
        }

        (async () => {
            const _web3 = await createWeb3();
            setWeb3(_web3);

            const _accounts = [(window as any).ethereum.selectedAddress];
            setAccounts(_accounts);           
           
		
            if (_accounts && _accounts[0]) {
                const _l2Balance = BigInt(await _web3.eth.getBalance(_accounts[0]));
                setL2Balance(_l2Balance);
                const addressTranslator = new AddressTranslator();
                const _depositAddress = (
                    await addressTranslator.getLayer2DepositAddress(_web3, _accounts[0])
                ).addressString;
                setDepositAddress(_depositAddress);
            }
        })();
    });

    const LoadingIndicator = () => <span className="rotating-icon">⚙️</span>;

    return (
        <div>
            This is a modification of the Simple Storage Application. In this modification you 
            can store strings.
            The button bellow will deploy a smart contract where you can store a string.
            By default the initial stored value is "Nervos". After the contract is
            deployed you can either read stored string from the smart contract or set a new one. You can
            do that using the interface below.
            <br />
                        <br />
            <br />
            <hr />
            Your ETH address: <b>{accounts?.[0]}</b>
            <br />
            <br />
            Your Polyjuice address: <b>{polyjuiceAddress || ' - '}</b>
            <br />
            <br />
			Your Layer 2 deposit address: <b>{depositAddress || ' - '}</b>
                    <br />
                    {depositAddress && (
                        <a
                            href={`https://force-bridge-test.ckbapp.dev/bridge/Ethereum/Nervos?xchain-asset=0x0000000000000000000000000000000000000000&recipient=${depositAddress}`}
                            target="_blank"
                        >
                            You can deposit ETH into Layer 2 directly using this link.
                        </a>
                    )}
            <br />
            <br />
            Nervos Layer 2 balance:{' '}
            <b>{l2Balance ? (l2Balance / 10n ** 8n).toString() : <LoadingIndicator />} CKB</b>
            <br />
            Nervos Layer 2 SUDTs balance:{' '}
            <b>{sudtBalance ? ((Number (sudtBalance) / (10 ** 18))).toString () : <LoadingIndicator />} ckETH</b>
            <br />
            <br />
            Deployed contract address: <b>{contract?.address || '-'}</b> <br />
            Deploy transaction hash: <b>{deployTxHash || '-'}</b>
            <br />
            <hr />

            <button onClick={deployContract} disabled={!l2Balance}>
                Deploy contract
            </button>
            &nbsp;or
            <input
                placeholder="Pre-existing contract"
                onChange={e => setExistingContractIdInputMessage(e.target.value)}
            />
            <button
                disabled={!existingContractIdInputMessage || !l2Balance}
                onClick={() => setExistingContractAddress(existingContractIdInputMessage)}
            >
                Use existing contract
            </button>
            <br />
            <br />
            <button onClick={getStored} disabled={!contract}>
                Display the stored string
            </button>
            {storedMessage ? <>&nbsp;&nbsp;Stored message: {storedMessage}</> : null}
            <br />
            <br />
            <input
                type="text"
                onChange={e => setNewStoredNumberInputMessage(e.target.value)}
            />
            <button onClick={setNewStored} disabled={!contract}>
                Change stored string.
            </button>
            <br />
            <br />
            <br />
            <hr />
            <br />
            The contract is deployed on Nervos Layer 2 - Godwoken + Polyjuice. After each
            transaction you might need to wait up to 120 seconds for the status to be reflected.
            <br />
            <ToastContainer />
        </div>
    );
}
