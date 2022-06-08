import { ChainService } from '@deip/chain-service';
import { genRipemd160Hash, genSha256Hash } from '@deip/toolbox';
import { CreateDaoCmd } from '@deip/commands';
import { JsonDataMsg } from '@deip/messages';
import { randomAsHex } from '@polkadot/util-crypto';

import { singleton } from '@/utils/singleton';

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

  async createDaoTransactionMessage({
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

    return new JsonDataMsg(createUserDaoByUserTx.getPayload()).getHttpBody().envelope;
  }

  static readonly getInstance = singleton(() => new DeipService());
}
