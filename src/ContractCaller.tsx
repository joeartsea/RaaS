import React, { SyntheticEvent } from 'react';

import { OnChangeData } from './types';
import useSubstrateApi from './Api';
import AccountDropdown from './AccountDropdown';

import { Grid } from 'semantic-ui-react';

export default function ContractCaller() {
  const { caller, dispatch } = useSubstrateApi();

  const onChange = (_: SyntheticEvent, data: OnChangeData) => {
    dispatch({ type: 'CALLER', payload: data.value?.toString() || '' });
  };

  return (
    <>
    <Grid.Column></Grid.Column>
    <Grid.Column>
      <AccountDropdown
        label='Contract Caller'
        state='caller'
        placeholder='Select account to call the contract.'
        value={caller}
        onChange={onChange}
      />
    </Grid.Column>
    </>
  );
};
