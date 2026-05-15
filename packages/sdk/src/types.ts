export interface LoyaltyProgram {
  id: string;
  name: string;
  owner: string;
  pointsPerUnit: number;
  active: boolean;
}

export interface StellarPerksConfig {
  networkPassphrase: string;
  rpcUrl: string;
  contractId: string;
}

export interface TxResult {
  hash: string;
  success: boolean;
}
