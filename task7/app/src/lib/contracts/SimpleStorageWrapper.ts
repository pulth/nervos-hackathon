import Web3 from 'web3';
import * as SimpleStorageJSON from '../../../build/contracts/SimpleStorage.json';
import { SimpleStorage } from '../../types/SimpleStorage';

const DEFAULT_SEND_OPTIONS = {
    gas: 6000000
};

export class SimpleStorageWrapper {
    web3: Web3;

    contract: SimpleStorage;

    address: string;

    constructor(web3: Web3) {
        this.web3 = web3;
        this.contract = new web3.eth.Contract(SimpleStorageJSON.abi as any) as any;
    }

    get isDeployed() {
        return Boolean(this.address);
    }

    async getStored(fromAddress: string) {
        const data = await this.contract.methods.get().call({ from: fromAddress });

        return data;
    }

    async setStored(message: string, fromAddress: string) {
        const tx = await this.contract.methods.set(message).send({
            ...DEFAULT_SEND_OPTIONS,
            from: fromAddress,
            to: message
        });

        return tx;
    }

    async deploy(fromAddress: string) {
        const deployTx = await (this.contract
            .deploy({
                data: SimpleStorageJSON.bytecode,
                arguments: []
            })
            .send({
                ...DEFAULT_SEND_OPTIONS,
                from: fromAddress,
                to: '0x0000000000000000000000000000000000000000'
            } as any) as any);

        this.useDeployed(deployTx.contractAddress);

        return deployTx.transactionHash;
    }

    useDeployed(contractAddress: string) {
        this.address = contractAddress;
        this.contract.options.address = contractAddress;
    }
}
