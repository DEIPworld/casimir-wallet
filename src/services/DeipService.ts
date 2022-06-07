import { ChainService } from '@deip/chain-service';
import { genRipemd160Hash, genSha256Hash } from '@deip/toolbox';
import { CreateDaoCmd } from '@deip/commands';
import { JsonDataMsg } from '@deip/messages';
import { randomAsHex } from '@polkadot/util-crypto';

import { singleton } from '@/utils/singleton';
import { waitAsync } from '@/utils/helpers';

import type { IWallet } from '../../types';

export class DeipService {
  private chainService: any;
  private chainTxBuilder: any;
  private api: any;
  private rpc: any;

  async init(): Promise<void> {
    this.chainService = await ChainService.getInstanceAsync({
      PROTOCOL: parseFloat(import.meta.env.DW_PROTOCOL),
      DEIP_FULL_NODE_URL: import.meta.env.DW_DEIP_FULL_NODE_URL,
      CORE_ASSET: JSON.parse(import.meta.env.DW_CORE_ASSET)
    });

    this.chainTxBuilder = this.chainService.getChainTxBuilder();
    this.api = this.chainService.getChainNodeClient();
    this.rpc = this.chainService.getChainRpc();
  }

  private async sendTxAndWaitAsync(
    finalizedTx: any,
    timeout = import.meta.env.DW_DEIP_APPCHAIN_MILLISECS_PER_BLOCK
    ) {

    const {
      pubKey: verificationPubKey,
      privKey: verificationPrivKey
    } = JSON.parse(import.meta.env.DW_TENANT_PORTAL);
    const { tx } = finalizedTx.getPayload();

    const verifiedTxPromise = tx.isOnBehalfPortal()
      ? tx.verifyByPortalAsync({ verificationPubKey, verificationPrivKey }, this.api)
      : Promise.resolve(tx.getSignedRawTx());

    const verifiedTx = await verifiedTxPromise;
    await this.rpc.sendTxAsync(verifiedTx);

    await waitAsync(timeout);
  }

  async createDao({
    walletAddress,
    publicKey,
    privateKey
  }: IWallet): Promise<any> {
    const daoId = genRipemd160Hash(randomAsHex(20));

    const createDaoTx = await this.chainTxBuilder.begin()
      .then((txBuilder: any) => {
        const createDaoCmd = new CreateDaoCmd({
          entityId: daoId,
          authority: {
            owner: {
              auths: [{ key: publicKey, weight: 1 }],
              weight: 1
            }
          },
          creator: walletAddress,
          description: genSha256Hash({ "description": "user DAO" }),
          isTeamAccount: false,
          attributes: []
        });

        txBuilder.addCmd(createDaoCmd);
        return txBuilder.end();
      });

    /*
      1st approval from user DAO (final)
    */
    const createUserDaoByUserTx = await createDaoTx.signAsync(
      privateKey, 
      this.api
    );

    const message = new JsonDataMsg(createUserDaoByUserTx.getPayload());

    return message;
  }

  static readonly getInstance = singleton(() => new DeipService());
}

