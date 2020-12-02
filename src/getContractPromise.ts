import { ApiPromise } from "@polkadot/api";
import { AnyJson } from '@polkadot/types/types';
import { Abi, ContractPromise } from "@polkadot/api-contract";

import { ContractOrNull } from "./types";

export default function getContractPromise(api: ApiPromise, contractPair: ContractOrNull): ContractPromise | null {

  if (!contractPair) {
    return null;;

  } else {
    const address = contractPair.address;
    const meta = contractPair.meta;
    const data = meta && meta.contract?.abi;

    if (!data) {
      return null;

    } else {

      const abiJson = data as AnyJson;
      const abi = new Abi(abiJson);
      const contract = new ContractPromise(api, abi, address);
      return contract;
    }
  }
}
