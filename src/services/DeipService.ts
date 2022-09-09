import { ChainService, SubstrateChainUtils } from '@casimir.one/chain-service';
import { genRipemd160Hash, genSha256Hash } from '@casimir.one/toolbox';
import { CreateDaoCmd } from '@casimir.one/commands';
import { JsonDataMsg } from '@casimir.one/messages';
import { randomAsHex } from '@polkadot/util-crypto';

import { singleton } from '@/utils/singleton';

import type { IWallet } from '@/types';

import HttpService from './HttpService';

export class DeipService {
  private chainService: any;
  private chainTxBuilder: any;
  private api: any;
  private rpc: any;
  private chainInfo: any;

  private static formatKey(key: string): string {
    return key.slice(2);
  }

  async init(): Promise<void> {
    this.chainService = await ChainService.getInstanceAsync({
      PROTOCOL: parseFloat(import.meta.env.DW_PROTOCOL),
      DEIP_FULL_NODE_URL: import.meta.env.DW_NETWORK,
      CORE_ASSET: JSON.parse(import.meta.env.DW_CORE_ASSET)
    });

    this.chainTxBuilder = this.chainService.getChainTxBuilder();
    this.api = this.chainService.getChainNodeClient();
    this.rpc = this.chainService.getChainRpc();
    this.chainInfo = this.chainService.getChainInfo();
  }

  async createDaoTransactionMessage({
    address,
    publicKey,
    privateKey,
    portal
  }: IWallet): Promise<any> {
    try {
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

      const { data: dao } = await HttpService.post('/dao/create', data);

      return dao;
    } catch (error) {
      console.log(error);
      return error as any;
    }
  }

  daoIdToAddress(daoIdOrPubKey: string): string {
    return SubstrateChainUtils.toAddress(daoIdOrPubKey, this.api.registry);
  }

  async signTransaction(transaction: any, privateKey?: string): Promise<any> {
    try {
      if (privateKey) {
        const { TxClass, metadata } = this.chainInfo;
        const formattedKey = DeipService.formatKey(privateKey);

        const deserializedTx = TxClass.Deserialize(transaction, metadata);
        const signedTx = await deserializedTx.signAsync(formattedKey, this.api);

        return signedTx.serialize();
      }

      throw new Error('Private key is missing.');
    } catch (error) {
      console.log(error);
      return error as any;
    }
  }

  static readonly getInstance = singleton(() => new DeipService());
}

