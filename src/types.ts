import { KeyringAddress } from "@polkadot/ui-keyring/types";
import { DropdownProps, InputOnChangeData } from "semantic-ui-react";

export type OnChangeData = InputOnChangeData | DropdownProps;

export type StringOrNull = string | null | undefined;

export type ContractOrNull = KeyringAddress | undefined;
