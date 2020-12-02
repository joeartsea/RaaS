import React, { useState, useEffect, SyntheticEvent, useMemo } from 'react';
import keyring from '@polkadot/ui-keyring';
import { u8aToString } from '@polkadot/util';
import { AnyJson } from '@polkadot/types/types';
import { Abi } from '@polkadot/api-contract';

import config from './config';
import useSubstrateApi from './Api';
import getContractPromise from './getContractPromise';

import { Button, ButtonGroup, ButtonOr, Form, Grid, Input, InputOnChangeData } from 'semantic-ui-react';

interface FileState {
  data: Uint8Array,
  name: string,
  size: number
}

interface FormState {
  address: string,
  name: string
}

export default function Contract() {
  const { api, contractPair, dispatch } = useSubstrateApi();
  const contract = useMemo(() => {
    return getContractPromise(api, contractPair);
  }, [api, contractPair]);

  const [abiFile, setAbiFile] = useState<FileState>({
    data: new Uint8Array(),
    name: '',
    size: 0
  });
  const [abi, setAbi] = useState<Abi>();

  const [formState, setFormState] = useState<FormState>({
    address: contractPair?.address || config.CONTRACT_ADDRESS || '',
    name: contractPair?.meta.name || ''
  });
  const { address, name } = formState;
  const [status, setStatus] = useState<string>('');

  const handleFileChosen = (file: File) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ({ target }: ProgressEvent<FileReader>) => {
      if (target && target.result) {
        const data = new Uint8Array(target.result as ArrayBuffer);
        const fileState = {
          data: data,
          name: file.name,
          size: data.length
        };
        setAbiFile(fileState);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  useEffect(() => {

    if (abiFile.size === 0) return;

    const json = u8aToString(abiFile.data);
    const abiJson = JSON.parse(json) as AnyJson;

    const newAbi = new Abi(abiJson);
    setAbi(newAbi);

  }, [abiFile]);

  useEffect(() => {
    setAbi(contract?.abi);
  }, [contract]);

  const onChange = (_: SyntheticEvent, data: InputOnChangeData) => {
    setFormState(formState => {
      return {
        ...formState,
        [data.state]: data.value
      }
    });
  };

  const onSave = () => {
    setStatus('Save contract to keyring...');

    keyring.saveContract(address, {
      contract: {
        abi: abi?.json || undefined,
        genesisHash: api.genesisHash.toHex()
      },
      name,
      tags: []
    });

    const pair = keyring.getContract(address);

    dispatch({ type: 'CONTRACT', payload: pair });

    setStatus('Save contract to keyring completed.');
  };

  const onForget = () => {
    setStatus('remove contract to keyring...');

    keyring.forgetContract(address);

    const pair = keyring.getContract(address);

    dispatch({ type: 'CONTRACT', payload: pair });

    setStatus('remove contract to keyring completed.');
  };

  return (
    <>
    <Grid.Column>
    <h1>Contract</h1>
    <Form>
      <Form.Field>
        <Input
          type='text'
          label='Address'
          state='address'
          placeholder='Contract Address.'
          value={address}
          onChange={onChange}
        />
      </Form.Field>
      <Form.Field>
        <Input
          type='text'
          label='Name'
          state='name'
          placeholder='Contract Name.'
          value={name}
          onChange={onChange}
        />
      </Form.Field>
      {!contract ?
      <Form.Field>
        <Input
          type='file'
          id='json-file'
          label='Metadata File'
          accept='.json'
          onChange={e => e.target.files && handleFileChosen(e.target.files[0])}
        />
      </Form.Field>
      : null}
      <Form.Field style={{ textAlign: 'right' }}>
        <ButtonGroup>
          <Button
            primary
            type='submit'
            disabled={!address || !abi}
            onClick={onSave}
          >Save</Button>
          <ButtonOr/>
          <Button
            negative
            type='submit'
            disabled={!address}
            onClick={onForget}
          >Forget</Button>
        </ButtonGroup>
      </Form.Field>
      <div style={{ overflowWrap: 'break-word' }}>{status}</div>
    </Form>
    </Grid.Column>
    </>
  );
};
