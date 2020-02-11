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
        profilePath: path.join(homedir(), '.fabric-vscode', 'environments', 'local fabric', 'gateways', 'Org1', 'Org1.json'),
        asLocalhost: true,
        walletPath: path.join(homedir(), '.fabric-vscode', 'environments', 'local fabric', 'wallets', 'Org1'),
    }
}