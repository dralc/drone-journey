import { Gateway, FileSystemWallet, GatewayOptions } from 'fabric-network';
import { readFile } from 'fs-extra';
import { EnvConfigs, Configs } from './configs';

export class Invoke {
    private env:string = process.env.NODE_ENV || 'dev';
    private conf:EnvConfigs = Configs[this.env];
    private walletPath = this.conf.walletPath;
    private gatewayOptions:GatewayOptions = {
        wallet: new FileSystemWallet(this.walletPath),
        identity: 'admin',
        discovery: {
            asLocalhost: this.conf.asLocalhost,
            enabled: true
        }
    };
    private connectionProfilePath:string
    private connectionProfile:Object;
    private gateway = new Gateway();

    constructor() {
        this.connectionProfilePath = this.conf.profilePath;
    }
    
    public async connect():Promise<void> {
        this.connectionProfile = await this.getConnectionProfile();
        return await this.gateway.connect(this.connectionProfile, this.gatewayOptions);
    }
    
    public disconnect():void {
        this.gateway.disconnect();
    }

    private async getConnectionProfile():Promise<Object> {
        const profile:string = await readFile(this.connectionProfilePath, 'utf-8');
        
        return JSON.parse(profile);
    }

    public async submit(contractName: string, funcName: string, id:string, dat?: Journey):Promise<Buffer> {
        const network = await this.gateway.getNetwork('mychannel');
        const contract = await network.getContract('drone-journey', contractName);
        let args = [ id ];

        if (dat) {
            args.push( JSON.stringify(dat) );
        }
        
        return await contract.submitTransaction(funcName, ...args);
    }
}

export interface Journey {
    status: 'start' | 'in-flight' | 'complete', // todo use enum for smaller payloads
    startCoord: string,
    lastCoord: string,
    startTime: Date,
    endTime: Date
}