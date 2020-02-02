import { Gateway, FileSystemWallet, GatewayOptions, Query } from 'fabric-network';
import { readFile } from 'fs-extra';
import { EnvConfigs, Configs } from './configs';
import * as uuid from 'uuid/v4';
import { Journey, JourneyKey } from '../Journey';

export class Invoke {
    private env: string = (process.env.NODE_ENV || 'dev').toLowerCase();
    private conf: EnvConfigs = Configs[this.env];
    private walletPath: string = this.conf.walletPath;
    private gatewayOptions: GatewayOptions = {
        wallet: new FileSystemWallet(this.walletPath),
        identity: 'admin',
        discovery: {
            asLocalhost: this.conf.asLocalhost,
            enabled: true
        }
    };
    private connectionProfilePath: string = this.conf.profilePath;
    private gateway: Gateway = new Gateway();
    private connectionProfile: Object;

    constructor() {}
    
    public async connect():Promise<void> {
        this.connectionProfile = await this.getConnectionProfile();
        await this.gateway.connect(this.connectionProfile, this.gatewayOptions);
    }
    
    public disconnect():void {
        this.gateway.disconnect();
    }

    private async getConnectionProfile():Promise<Object> {
        const profile:string = await readFile(this.connectionProfilePath, 'utf-8');
        
        return JSON.parse(profile);
    }

    public validateJourneyKey(state:JourneyKey) {
        const allValidKeys = ['droneId', 'owner', 'type', 'status'];
        const stateKeys = Object.keys(state);

        // Check attribute's presence
        allValidKeys.forEach(key => {
            if (!stateKeys.includes(key)) {
                throw Error(`The state attribute (${key}) couldn't be found`);
            }
        });

        // Check attribute value's type
        stateKeys.forEach(key => {
            const val = state[key];
            if (!val || typeof val !== 'string' || val.trim().length === 0) {
                throw new TypeError(`Can't create a key with a non-string attribute (${key}:${val})`);
            }
        });
    }

    /**
     * 
     * @param contractName 
     * @param funcName 
     * @param {JourneyKey} state The Journey with at least the key attributes
     * @param stateUpdate 
     */
    public async submit(contractName: string, funcName: string, state: JourneyKey, stateUpdate?: Journey):Promise<Buffer> {
        this.validateJourneyKey(state);

        const network = await this.gateway.getNetwork('mychannel');
        const contract = network.getContract('drone-journey', contractName);
        const args = [ JSON.stringify(state), JSON.stringify(stateUpdate) ].filter(a => a);

        return await contract.submitTransaction(funcName, ...args);
    }

    /**
     * Generates a UUID as the drone id
     * NB. The drone's MAC address could've been used as well.
     * @see https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
     */
    static makeDroneId() {
        return uuid();
    }
}
