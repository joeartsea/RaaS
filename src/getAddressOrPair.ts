import { ApiPromise } from "@polkadot/api";
import { AddressOrPair } from "@polkadot/api/types";
import { web3FromSource } from "@polkadot/extension-dapp";
import keyring from "@polkadot/ui-keyring";

export default function getAddressOrPair(api: ApiPromise, account: string): AddressOrPair {
  let signPair: AddressOrPair = account;

  const asyncPair = async () => {
    const pair = keyring.getPair(account);
    const { address, meta: { source, isInjected } } = pair;

    if (isInjected) {
      const injected = await web3FromSource(source as string);
      signPair = address;
      api.setSigner(injected.signer);
    } else {
      signPair = pair;
    }
  };

  asyncPair();

  return signPair;
}
