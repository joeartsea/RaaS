import { Contract } from "@polkadot/api-contract/promise";
import { AbiMessage } from "@polkadot/api-contract/types";

export default function getFindAbiMessage(contract: Contract | null, messageName: string): AbiMessage {
  let abiMessage = {} as AbiMessage;

  try {
    if (contract) {
      abiMessage = contract.abi.findMessage(messageName);
    }
  } catch(err) {
    console.error(err);
  }

  return abiMessage;
};
