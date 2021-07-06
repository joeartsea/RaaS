import React, { useState, useEffect, SyntheticEvent, useMemo, useCallback } from 'react';
import keyring from '@polkadot/ui-keyring';
import { u8aToString } from '@polkadot/util';
import { AnyJson } from '@polkadot/types/types';
import { Abi } from '@polkadot/api-contract';
import { useDropzone, FileRejection } from 'react-dropzone';

import config from './config';
import useSubstrateApi from './Api';
import getContractPromise from './getContractPromise';

import { Button, ButtonGroup, ButtonOr, Form, Grid, Icon, Input, InputOnChangeData, Segment } from 'semantic-ui-react';

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

  const onDrop = useCallback((files: File[]) => {
    files.forEach((file: File) => {
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
    });

    setStatus('');
  }, []);

  const onDropRejected = useCallback((files: FileRejection[]) => {
    files.forEach(({ file, errors }) => {
      errors.forEach((e) => {
        const msg = `${e.code}: ${e.message} (${file.name})`;
        setStatus(msg);
      });
    });
  }, []);

  const { getRootProps, getInputProps, open } = useDropzone({
    accept: '.json',
    noClick: true,
    noKeyboard: true,
    maxFiles: 1,
    onDrop,
    onDropRejected
  });

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
        <Segment
          secondary
          padded='very'
          textAlign='center'
        >
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          <p>drag & drop to upload metadata file.</p>
          <button type='button' onClick={open} >Open File Dialog</button>
          {abiFile.size>0 ?
            <p style={{ marginTop: '0.5em', fontSize: '1.2em', color: '#000'}}>
              <Icon name='file outline' />uploaded file: {abiFile.name}
            </p>
          : null}
        </div>
        </Segment>
      </Form.Field>
      : null}
      <div style={{ overflowWrap: 'break-word' }}>{status}</div>
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
    </Form>
    </Grid.Column>
    </>
  );
};
