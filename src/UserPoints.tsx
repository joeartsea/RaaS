import React, { SyntheticEvent, useMemo, useState } from 'react';

import { OnChangeData } from './types';
import useSubstrateApi from './Api';
import AccountDropdown from './AccountDropdown';
import getContractPromise from './getContractPromise';
import getFindAbiMessage from './getFindAbiMessage';
import DescriptionDocs from './DescriptionDocs';
import TxButton from './TxButton';
import ResultMessage, { initialResultState, ResultState } from './ResultMessage';

import { Card, Form, Grid } from 'semantic-ui-react';


export default function UserPoints() {
  const { api, caller, contractPair } = useSubstrateApi();

  const contract = useMemo(() => {
    return getContractPromise(api, contractPair);
  }, [api, contractPair]);

  const abiMessage = useMemo(() => {
    return getFindAbiMessage(contract, 'get_user_points');
  }, [contract]);

  const [user, setUser] = useState<string>('');

  const [status, setStatus] = useState<ResultState>(initialResultState);

  const onChange = (_: SyntheticEvent, data: OnChangeData) => {
    setUser(data.value?.toString() || '');
  };

  return (
    <Grid.Column>
      <Card fluid>
        <Card.Content>
          <Card.Header>ユーザポイント確認</Card.Header>
          <Card.Description style={{ fontSize: 'smaller' }}>
            <DescriptionDocs abiMessage={abiMessage} />
          </Card.Description>
        </Card.Content>
        <Card.Content>
        <Form>
          <Form.Field>
            <AccountDropdown
              label='User'
              state='user'
              placeholder='Select user.'
              value={user}
              onChange={onChange}
            />
          </Form.Field>
          <Form.Field style={{ textAlign: 'right' }}>
            <TxButton
              api={api}
              contract={contract}
              messageName='getUserPoints'
              isTransaction={false}
              caller={caller}
              params={[user]}
              setStatus={setStatus}
              isDisabled={!(contract && user)}
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
