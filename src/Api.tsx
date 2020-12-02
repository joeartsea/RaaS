import React, { useContext, useEffect, useReducer } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import keyring from '@polkadot/ui-keyring';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp'
import { TypeRegistry } from '@polkadot/types';
import { ChainProperties } from '@polkadot/types/interfaces';

import config from './config';
import { ContractOrNull } from './types';


export interface ApiProps {
  api: ApiPromise,
  isApiConnected: boolean,
  isApiReady: boolean,
  isKeyringReady: boolean,
  systemChain: string,
  nodeName: string,
  nodeVersion: string,
  contractPair: ContractOrNull,
  hasContract: boolean,
  caller: string
};

interface ChainState {
  systemChain: string,
  nodeName: string,
  nodeVersion: string,
  properties: ChainProperties
};

interface ActionProps {
  type: string,
  payload?: any
};

interface ContextProps {
  props: ApiProps,
  dispatch: React.Dispatch<any>
};

interface ProviderProps {
  children: React.ReactNode
};

const registry = new TypeRegistry();

let api: ApiPromise;


const reducer = (state: ApiProps, action: ActionProps) => {
  switch(action.type) {
    case 'CONNECT':
      return { ...state, api: action.payload, isApiConnected: true };

    case 'CONNECT_SUCCESS':
      return { ...state, isApiReady: true };

    case 'DIS_CONNECT':
      return { ...state, isApiConnected: false, isApiReady: false };

    case 'CONNECT_ERROR':
      return { ...state, isApiConnected: false, isApiReady: false };

    case 'SET_KEYRING':
      return { ...state, isKeyringReady: true };

    case 'KEYRING_ERROR':
      return { ...state, isKeyringReady: false };

    case 'NODE_INFO':
      return { ...state,
        systemChain: action.payload.chain,
        nodeName: action.payload.name,
        nodeVersion: action.payload.version
      };

    case 'CONTRACT':
      return { ...state, contractPair: action.payload, hasContract: !!action.payload };

    case 'CALLER':
      return { ...state, caller: action.payload };

    default:
      return { ...state };
  }
};

const retrieve = async (api: ApiPromise): Promise<ChainState> => {
  const [systemChain, nodeName, nodeVersion, properties] = await Promise.all([
    api.rpc.system.chain(),
    api.rpc.system.name(),
    api.rpc.system.version(),
    api.rpc.system.properties(),
  ]);

  return {
    systemChain: systemChain.toString(),
    nodeName: nodeName.toString(),
    nodeVersion: nodeVersion.toString(),
    properties,
  };
};

const loadAccounts = async (api: ApiPromise, dispatch: React.Dispatch<ActionProps>) => {

  const { systemChain, nodeName, nodeVersion, properties } = await retrieve(api);

  await web3Enable(config.APP_NAME);
  let allAccounts = await web3Accounts();
  allAccounts = allAccounts.map(({ address, meta }) => ({
    address,
    meta: {
      ...meta,
      name: `${meta.name} (${meta.source})`
    }
  }));

  keyring.loadAll({
    isDevelopment: true,
    genesisHash: api.genesisHash
  }, allAccounts);

  const contract = keyring.getContract(config.CONTRACT_ADDRESS);

  dispatch({ type: 'NODE_INFO', payload: {
    'chain': systemChain,
    'name': nodeName,
    'version': nodeVersion
  }});
  dispatch({ type: 'CONTRACT', payload: contract });
};


const initialContext: ContextProps = {
  props: {} as ApiProps,
  dispatch: () => {}
};

const ApiContext: React.Context<ContextProps> = React.createContext(initialContext);

const ApiContextProvider = ({ children }: ProviderProps) => {

  const [props, dispatch] = useReducer(reducer, {
    isApiConnected: false,
    isApiReady: false,
    isKeyringReady: false,
    hasContract: false
  } as ApiProps);

  useEffect(() => {
    const WS_PROVIDER = config.WS_PROVIDER_URL;     // ws://127.0.0.1:9944
    const provider = new WsProvider(WS_PROVIDER);
    console.log(`Connected socket: ${WS_PROVIDER}`);

    const types = config.CUSTOM_TYPES;

    api = new ApiPromise({ provider, registry, types });

    api.on('connected', () => {
      dispatch({ type: 'CONNECT', payload: api });
    });
    api.on('disconnected', () => {
      dispatch({ type: 'DIS_CONNECT' });
    });
    api.on('ready', async (): Promise<void> => {
      dispatch({ type: 'CONNECT_SUCCESS' });
      try{
        await loadAccounts(api, dispatch)
        dispatch({ type: 'SET_KEYRING' });
      } catch(e) {
        console.error(e);
      }
    });
    api.on('error', (err) => {
      console.error(err);
      dispatch({ type: 'CONNECT_ERROR' });
    });
  }, []);

  return (
    <ApiContext.Provider value={{props, dispatch}}>
      {children}
    </ApiContext.Provider>
  );
};

export default function useSubstrateApi() {
  const { props, dispatch } = useContext(ApiContext);
  return { ...props, dispatch };
}

export { ApiContextProvider };
