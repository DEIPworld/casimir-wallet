import { ApiPromise, WsProvider } from '@polkadot/api';

class ApiService {

  env = {
    development: 'wss://gateway.testnet.octopus.network/deip/46v4p8ss613olf92p2scmsjud68mhzrr',
    production: 'WIP'
  };

  api: any = {};

  async init(): Promise<void> {
    try {
      const provider = new WsProvider(this.env.development);

      // consts
      // query
      // tx
      this.api = await ApiPromise.create({ provider });

      // const res = await api.query.system.account(ADDR);
      // balance
      // console.log(res.data);
    } catch (error) {
      console.log('Unable to initiate an API service: ', error);
    }
  }

}

export default new ApiService();
