import * as path from 'path';
import { homedir } from 'os';

export interface EnvConfigs {
    profilePath:string,
    asLocalhost:boolean,
    walletPath:string,
}

export class Configs {
    
    static production:EnvConfigs = {
        profilePath: '',
        asLocalhost: false,
        walletPath: '',
    }
    
    static dev:EnvConfigs = {
        profilePath: path.join(homedir(), '.fabric-vscode', 'environments', 'local_fabric', 'gateways', 'local_fabric.json'),
        asLocalhost: true,
        walletPath: path.join(homedir(), '.fabric-vscode', 'wallets', 'local_fabric_wallet'),
    }
}