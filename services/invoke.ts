import { Gateway, FileSystemWallet, GatewayOptions } from 'fabric-network';
import * as path from 'path';
import * as os from 'os';
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
    
    public async init():Promise<void> {
        this.connectionProfile = await this.getConnectionProfile();
        return await this.gateway.connect(this.connectionProfile, this.gatewayOptions);
    }
    
    public close():void {
        this.gateway.disconnect();
    }

    private async getConnectionProfile():Promise<Object> {
        const profile:string = await readFile(this.connectionProfilePath, 'utf-8');
        
        return JSON.parse(profile);
    }
}