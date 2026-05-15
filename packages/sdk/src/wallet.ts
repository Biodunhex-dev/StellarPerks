import { Keypair, Networks } from "@stellar/stellar-sdk";
import fetch from "node:http";

export function generateKeypair(): { publicKey: string; secretKey: string } {
  const kp = Keypair.random();
  return { publicKey: kp.publicKey(), secretKey: kp.secret() };
}

export async function fundTestnetAccount(publicKey: string): Promise<void> {
  const url = `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`;
  const res = await globalThis.fetch(url);
  if (!res.ok) throw new Error(`Friendbot failed: ${res.statusText}`);
}

export const TESTNET_CONFIG = {
  networkPassphrase: Networks.TESTNET,
  rpcUrl: "https://soroban-testnet.stellar.org",
};

export const MAINNET_CONFIG = {
  networkPassphrase: Networks.PUBLIC,
  rpcUrl: "https://mainnet.stellar.validationcloud.io/v1/soroban",
};
