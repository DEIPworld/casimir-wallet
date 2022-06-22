import { ChainService } from '@deip/chain-service';
import { genRipemd160Hash, genSha256Hash } from '@deip/toolbox';
import { CreateDaoCmd } from '@deip/commands';
import { JsonDataMsg } from '@deip/messages';
import { randomAsHex } from '@polkadot/util-crypto';

import { singleton } from '@/utils/singleton';

import type { IWallet } from '@/types';

import HttpService from './HttpService';

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
    address,
    publicKey,
    privateKey,
    portal
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
          creator: address,
          description: genSha256Hash({ description: `${address} DAO` }),
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

    const message = new JsonDataMsg(createUserDaoByUserTx.getPayload()).getHttpBody().envelope;

    const data = {
      message,
      daoId,
      publicKey: `0x${publicKey}`,
      portal
    };

    const { data: DAO } = await HttpService.post('/dao/create', data);

    return DAO;
  }

  static readonly getInstance = singleton(() => new DeipService());
}

