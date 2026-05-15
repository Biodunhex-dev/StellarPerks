import { generateKeypair, TESTNET_CONFIG, MAINNET_CONFIG } from "../src/wallet";
import { StellarPerksClient } from "../src/client";

describe("generateKeypair", () => {
  it("returns a valid Stellar keypair", () => {
    const { publicKey, secretKey } = generateKeypair();
    expect(publicKey).toMatch(/^G[A-Z2-7]{55}$/);
    expect(secretKey).toMatch(/^S[A-Z2-7]{55}$/);
  });

  it("generates unique keypairs", () => {
    const a = generateKeypair();
    const b = generateKeypair();
    expect(a.publicKey).not.toBe(b.publicKey);
  });
});

describe("network configs", () => {
  it("testnet config has correct passphrase", () => {
    expect(TESTNET_CONFIG.networkPassphrase).toBe("Test SDF Network ; September 2015");
  });

  it("mainnet config has correct passphrase", () => {
    expect(MAINNET_CONFIG.networkPassphrase).toBe("Public Global Stellar Network ; September 2015");
  });
});

describe("StellarPerksClient", () => {
  it("instantiates with config", () => {
    const client = new StellarPerksClient({
      ...TESTNET_CONFIG,
      contractId: "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM",
    });
    expect(client).toBeInstanceOf(StellarPerksClient);
  });
});
