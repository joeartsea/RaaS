import React, { useMemo, useState } from 'react';

import useSubstrateApi from "./Api";
import getContractPromise from './getContractPromise';
import getFindAbiMessage from './getFindAbiMessage';
import DescriptionDocs from './DescriptionDocs';
import TxButton from './TxButton';
import ResultMessage, { initialResultState, ResultState } from './ResultMessage';

import { Card, Form, Grid } from 'semantic-ui-react';

export default function OwnerPoint() {
  const { api, caller, contractPair } = useSubstrateApi();

  const contract = useMemo(() => {
    return getContractPromise(api, contractPair);
  }, [api, contractPair]);

  const abiMessage = useMemo(() => {
    return getFindAbiMessage(contract, 'get_owner_points');
  }, [contract]);

  const [status, setStatus] = useState<ResultState>(initialResultState);

  return (
    <Grid.Column>
      <Card fluid>
        <Card.Content>
          <Card.Header>オーナーポイント確認</Card.Header>
          <Card.Description style={{ fontSize: 'smaller' }}>
            <DescriptionDocs abiMessage={abiMessage} />
          </Card.Description>
        </Card.Content>
        <Card.Content>
          <Form>
            <Form.Field style={{ textAlign: 'right' }}>
              <TxButton
                api={api}
                contract={contract}
                messageName='getOwnerPoints'
                isTransaction={false}
                caller={caller}
                setStatus={setStatus}
                isDisabled={!contract}
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

