import React, { SyntheticEvent, useEffect, useMemo, useState } from 'react';

import { OnChangeData } from './types';
import useSubstrateApi from './Api';
import AccountDropdown from './AccountDropdown';
import getContractPromise from './getContractPromise';
import getFindAbiMessage from './getFindAbiMessage';
import DescriptionDocs from './DescriptionDocs';
import TxButton from './TxButton';
import ResultMessage, { ResultState, initialResultState } from './ResultMessage';

import { Card, Form, Grid, Input, Message } from 'semantic-ui-react';

interface FormState {
  store: string,
  user: string,
  points: number,
  amount: number
}
export default function GivePoints() {
  const { api, caller, contractPair } = useSubstrateApi();

  const contract = useMemo(() => {
    return getContractPromise(api, contractPair);
  }, [api, contractPair]);

  const abiMessage = useMemo(() => {
    return getFindAbiMessage(contract, 'give_user_points');
  }, [contract]);

  const [formState, setFormState] = useState<FormState>({
    store: '',
    user: '',
    points: 0,
    amount: 0
  });
  const { store, user, points, amount } = formState;

  const [status, setStatus] = useState<ResultState>(initialResultState);

  const onChange = (_: SyntheticEvent, data: OnChangeData) => {
    setFormState(prevState => {
      return {
        ...prevState,
        [data.state]: data.value
      }
    });
  };

  useEffect(() => {
    setFormState(prevState => {
      return {
        ...prevState,
        points: Math.floor(amount  / 200)
      }
    });
  }, [amount]);

  return (
    <Grid.Column>
      <Card fluid>
        <Card.Content>
          <Card.Header>ポイント付与</Card.Header>
          <Card.Description style={{ fontSize: 'smaller' }}>
            <DescriptionDocs abiMessage={abiMessage} />
          </Card.Description>
        </Card.Content>
        <Card.Content>
        <Message compact style={{ fontSize: 'smaller', padding: '0.5em' }}>200円=1ポイント</Message>
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
          <Form.Field>
            <AccountDropdown
              label='User'
              state='user'
              placeholder='Select user.'
              value={user}
              onChange={onChange}
            />
          </Form.Field>
          <Form.Field>
            <Input
              type='number'
              label='Amount'
              state='amount'
              value={amount}
              onChange={onChange}
            />
          </Form.Field>
          <Form.Field>
            <Input
              type='number'
              label='Points'
              state='points'
              value={points}
              onChange={onChange}
            />
          </Form.Field>
          <Form.Field style={{ textAlign: 'right' }}>
            <TxButton
              api={api}
              contract={contract}
              messageName='giveUserPoints'
              isTransaction={true}
              caller={caller}
              params={[store, user, points]}
              setStatus={setStatus}
              isDisabled={!(contract && caller && store && user && points)}
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
