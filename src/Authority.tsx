import React, { SyntheticEvent, useMemo, useState } from 'react';

import { OnChangeData } from './types';
import useSubstrateApi from './Api';
import AccountDropdown from './AccountDropdown';
import getContractPromise from './getContractPromise';
import getFindAbiMessage from './getFindAbiMessage';
import DescriptionDocs from './DescriptionDocs';
import TxButton from './TxButton';
import ResultMessage, { ResultState, initialResultState } from './ResultMessage';

import { Card, Form, Grid } from 'semantic-ui-react';

export default function Authority() {
  const { api, caller, contractPair } = useSubstrateApi();

  const contract = useMemo(() => {
    return getContractPromise(api, contractPair);
  }, [api, contractPair]);

  const abiMessage = useMemo(() => {
    return getFindAbiMessage(contract, 'give_authority');
  }, [contract]);

  const [store, setStore] = useState('');

  const [status, setStatus] = useState<ResultState>(initialResultState);

  const onChange = (_: SyntheticEvent, data: OnChangeData) => {
    setStore(data.value?.toString() || '');
  };

  return (
    <Grid.Column>
      <Card fluid>
        <Card.Content>
          <Card.Header>権限付与</Card.Header>
          <Card.Description style={{ fontSize: 'smaller' }}>
            <DescriptionDocs abiMessage={abiMessage} />
          </Card.Description>
        </Card.Content>
        <Card.Content>
        <Form>
          <Form.Field>
            <AccountDropdown
              label='Store'
              state='store'
              placeholder='Select store.'
              value={store}
              onChange={onChange}
            />
          </Form.Field>
          <Form.Field style={{ textAlign: 'right' }}>
            <TxButton
              api={api}
              contract={contract}
              messageName='giveAuthority'
              isTransaction={true}
              caller={caller}
              params={[store]}
              setStatus={setStatus}
              isDisabled={!(contract && caller && store)}
            />
          </Form.Field>
        </Form>
        </Card.Content>
        <Card.Content extra>
          <ResultMessage status={status} />
        </Card.Content>
      </Card>
    </Grid.Column>
  );
};
