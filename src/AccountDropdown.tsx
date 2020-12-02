import React, { SyntheticEvent } from 'react';
import keyring from '@polkadot/ui-keyring';

import { Dropdown } from 'semantic-ui-react';

import { OnChangeData } from './types';

interface AccountDropdownProps {
  label: string,
  state: string,
  placeholder: string,
  value: string,
  onChange: (_: SyntheticEvent, data: OnChangeData) => void
}

export default function AccountDropdown (props: AccountDropdownProps) {
  const { label, state, placeholder, value, onChange } = props;

  const keyringOptions = keyring.getPairs().map((account) => {
    const accountName: string =
      (typeof account.meta.name === 'string')? account.meta.name : '';
    return {
      key: account.address,
      value: account.address,
      text: accountName.toUpperCase()
    }
  });

  return (
    <div className="ui fluid labeled input">
      <div className="ui label">{label}</div>
      <Dropdown
        fluid
        search
        selection
        label={label}
        state={state}
        placeholder={placeholder}
        value={value}
        options={keyringOptions}
        onChange={onChange}
      />
    </div>
  );
}
