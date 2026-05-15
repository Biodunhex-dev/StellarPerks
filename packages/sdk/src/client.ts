import {
  Contract,
  Keypair,
  TransactionBuilder,
  nativeToScVal,
  scValToNative,
  xdr,
  BASE_FEE,
  rpc,
} from "@stellar/stellar-sdk";
import { LoyaltyProgram, StellarPerksConfig, TxResult } from "./types";

export class StellarPerksClient {
  private server: rpc.Server;
  private contract: Contract;
  private config: StellarPerksConfig;

  constructor(config: StellarPerksConfig) {
    this.config = config;
    this.server = new rpc.Server(config.rpcUrl, { allowHttp: false });
    this.contract = new Contract(config.contractId);
  }

  private async submitTx(
    keypair: Keypair,
    operation: xdr.Operation
  ): Promise<TxResult> {
    const account = await this.server.getAccount(keypair.publicKey());
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.config.networkPassphrase,
    })
      .addOperation(operation)
      .setTimeout(30)
      .build();

    const prepared = await this.server.prepareTransaction(tx);
    prepared.sign(keypair);

    const result = await this.server.sendTransaction(prepared);
    if (result.status === "ERROR") {
      throw new Error(`Transaction failed: ${JSON.stringify(result.errorResult)}`);
    }

    let getResult = await this.server.getTransaction(result.hash);
    for (let i = 0; i < 10 && getResult.status === "NOT_FOUND"; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      getResult = await this.server.getTransaction(result.hash);
    }

    return {
      hash: result.hash,
      success: getResult.status === "SUCCESS",
    };
  }

  async initialize(adminKeypair: Keypair): Promise<TxResult> {
    const op = this.contract.call(
      "initialize",
      nativeToScVal(adminKeypair.publicKey(), { type: "address" })
    );
    return this.submitTx(adminKeypair, op);
  }

  async createProgram(
    ownerKeypair: Keypair,
    programId: string,
    name: string,
    pointsPerUnit: number
  ): Promise<TxResult> {
    const op = this.contract.call(
      "create_program",
      nativeToScVal(ownerKeypair.publicKey(), { type: "address" }),
      nativeToScVal(programId, { type: "string" }),
      nativeToScVal(name, { type: "string" }),
      nativeToScVal(pointsPerUnit, { type: "u64" })
    );
    return this.submitTx(ownerKeypair, op);
  }

  async issuePoints(
    ownerKeypair: Keypair,
    programId: string,
    userAddress: string,
    points: number
  ): Promise<TxResult> {
    const op = this.contract.call(
      "issue_points",
      nativeToScVal(ownerKeypair.publicKey(), { type: "address" }),
      nativeToScVal(programId, { type: "string" }),
      nativeToScVal(userAddress, { type: "address" }),
      nativeToScVal(points, { type: "u64" })
    );
    return this.submitTx(ownerKeypair, op);
  }

  async redeemPoints(
    userKeypair: Keypair,
    programId: string,
    points: number
  ): Promise<TxResult> {
    const op = this.contract.call(
      "redeem_points",
      nativeToScVal(userKeypair.publicKey(), { type: "address" }),
      nativeToScVal(programId, { type: "string" }),
      nativeToScVal(points, { type: "u64" })
    );
    return this.submitTx(userKeypair, op);
  }

  async getBalance(programId: string, signerAddress: string): Promise<number> {
    const account = await this.server.getAccount(signerAddress).catch(() => null);
    if (!account) return 0;

    const op = this.contract.call(
      "get_balance",
      nativeToScVal(programId, { type: "string" }),
      nativeToScVal(signerAddress, { type: "address" })
    );

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.config.networkPassphrase,
    })
      .addOperation(op)
      .setTimeout(30)
      .build();

    const result = await this.server.simulateTransaction(tx);
    if (rpc.Api.isSimulationError(result)) {
      throw new Error(`Simulation failed: ${(result as rpc.Api.SimulateTransactionErrorResponse).error}`);
    }
    const val = (result as rpc.Api.SimulateTransactionSuccessResponse).result?.retval;
    return val ? Number(scValToNative(val)) : 0;
  }

  async getProgram(programId: string, signerAddress: string): Promise<LoyaltyProgram> {
    const account = await this.server.getAccount(signerAddress);
    const op = this.contract.call(
      "get_program",
      nativeToScVal(programId, { type: "string" })
    );

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.config.networkPassphrase,
    })
      .addOperation(op)
      .setTimeout(30)
      .build();

    const result = await this.server.simulateTransaction(tx);
    if (rpc.Api.isSimulationError(result)) {
      throw new Error(`Simulation failed: ${(result as rpc.Api.SimulateTransactionErrorResponse).error}`);
    }
    const val = (result as rpc.Api.SimulateTransactionSuccessResponse).result?.retval;
    if (!val) throw new Error("No result");
    const native = scValToNative(val) as Record<string, unknown>;
    return {
      id: native.id as string,
      name: native.name as string,
      owner: native.owner as string,
      pointsPerUnit: Number(native.points_per_unit),
      active: native.active as boolean,
    };
  }
}
