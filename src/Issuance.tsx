import React, { SyntheticEvent, useMemo, useState } from 'react';

import useSubstrateApi from './Api';
import getContractPromise from './getContractPromise';
import getFindAbiMessage from './getFindAbiMessage';
import DescriptionDocs from './DescriptionDocs';
import TxButton from './TxButton';
import ResultMessage, { initialResultState, ResultState } from './ResultMessage';

import { Card, Form, Grid, Input, InputOnChangeData } from 'semantic-ui-react';

export default function Issuance() {
  const { api, caller, contractPair } = useSubstrateApi();

  const contract = useMemo(() => {
    return getContractPromise(api, contractPair);
  }, [api, contractPair]);

  const abiMessage = useMemo(() => {
    return getFindAbiMessage(contract, 'issuance_points');
  }, [contract]);

  const [value, setValue] = useState<number>(0);

  const [status, setStatus] = useState<ResultState>(initialResultState);

  const onChange = (_: SyntheticEvent, data: InputOnChangeData) => {
    setValue(data.value as unknown as number);
  }

  return (
    <Grid.Column>
      <Card fluid>
        <Card.Content>
          <Card.Header>ポイント発行</Card.Header>
          <Card.Description style={{ fontSize: 'smaller' }}>
            <DescriptionDocs abiMessage={abiMessage} />
          </Card.Description>
        </Card.Content>
        <Card.Content>
        <Form>
          <Form.Field>
            <Input
              fluid
              type='number'
              label='Value'
              state='value'
              value={value}
              onChange={onChange}
            />
          </Form.Field>
          <Form.Field style={{ textAlign: 'right' }}>
            <TxButton
              api={api}
              contract={contract}
              messageName='issuancePoints'
              isTransaction={true}
              caller={caller}
              params={[value]}
              setStatus={setStatus}
              isDisabled={!(contract && caller && value)}
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
