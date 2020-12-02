import React from 'react';

import config from './config';
import useSubstrateApi, { ApiContextProvider } from './Api';
import ContractCaller from './ContractCaller';
import Issuance from './Issuance';
import Authority from './Authority';
import OwnerPoint from './OwnerPoint';
import GivePoints from './GivePoints';
import StorePoints from './StorePoints';
import StoreUserPoints from './StoreUserPoints';
import SpendPoints from './SpendPoints';
import UserPoints from './UserPoints';
import Events from './Events';
import Contract from './Contract';

import { Container, Dimmer, Grid, Loader, Message } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';


const Main = () => {
  const { isApiConnected, isApiReady, isKeyringReady, hasContract } = useSubstrateApi();

  const loader = (text: string) => {
    return (
      <Dimmer active>
        <Loader size='small'>{text}</Loader>
      </Dimmer>
    );
  };

  const message = (err: string) => {
    return (
      <Grid centered columns={2} padded>
        <Grid.Column>
          <Message negative compact floating
            header='Error Connecting to Substrate.'
            content={err}
          />
        </Grid.Column>
      </Grid>
    )
  }

  if (!isApiConnected) {
    return message(`No connection to the node. WebSocket connection to '${config.WS_PROVIDER_URL}'`);
  } else if (!isApiReady) {
    return loader('Connecting to the blockchain');
  } else if (!isKeyringReady) {
    return loader('Loading accounts (please review any extension\'s authorization)');
  }

  return (
    <Container>
      <Grid columns='equal'>
        <Grid.Row columns={4}>
          <ContractCaller />
        </Grid.Row>
        {!hasContract ?
        <Grid.Row>
          <Grid.Column>
            <Message
              warning
              content='No contracts available.'
            />
          </Grid.Column>
        </Grid.Row>
        : null}
        <Grid.Row>
          <Issuance />
          <Authority />
        </Grid.Row>
        <Grid.Row>
          <GivePoints />
          <SpendPoints />
        </Grid.Row>
        <Grid.Row>
          <OwnerPoint />
          <StorePoints />
          <StoreUserPoints />
          <UserPoints />
        </Grid.Row>
        <Grid.Row>
          <Events />
        </Grid.Row>
        <Grid.Row>
          <Contract />
        </Grid.Row>
      </Grid>
    </Container>
  );
}

const App = () => {
  return (
    <ApiContextProvider>
      <Main />
    </ApiContextProvider>
  );
};

export default App;
