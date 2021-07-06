import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import config from './config';
import useSubstrateApi, { ApiContextProvider } from './Api';
import ContractCaller from './ContractCaller';
import SideMenu from './SideMenu';

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
          <SideMenu />
        </Grid.Row>
      </Grid>
    </Container>
  );
}

const App = () => {
  return (
    <ApiContextProvider>
      <Router>
        <Main />
      </Router>
    </ApiContextProvider>
  );
};

export default App;
