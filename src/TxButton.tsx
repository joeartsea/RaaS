import React from 'react';
import { ApiPromise } from '@polkadot/api';
import { u64, Enum } from '@polkadot/types';
import { Codec } from '@polkadot/types/types';
import { Contract } from '@polkadot/api-contract/promise';
import { ContractCallOutcome } from '@polkadot/api-contract/types';
import { ContractSubmittableResult } from '@polkadot/api-contract/base/Contract';

import getAddressOrPair from './getAddressOrPair';
import { ResultState } from './ResultMessage';

import { Button } from 'semantic-ui-react';

interface TxButtonProps {
  api: ApiPromise,
  contract: Contract | null,
  messageName: string,
  isTransaction: boolean,
  caller: string,
  params?: any[],
  setStatus: React.Dispatch<ResultState>,
  isDisabled: boolean
};

export default function TxButton(props: TxButtonProps) {

  const { api, contract, messageName, isTransaction, caller, params, setStatus, isDisabled } = props;

  const callQuery = async () => {
    const value = 0;
    const gasLimit = -1;

    contract &&
    await contract.query[messageName](caller, value, gasLimit, ...((params?.length)? params : []))
      .then(({ gasConsumed, output, result }: ContractCallOutcome) => {
        if (result.isOk) {
          console.log('Success:', output?.toHuman());

          if (isTransaction) {
            callTransaction(gasConsumed, output);

          } else {
            setStatus({
              isOk: true,
              isErr: false,
              result: output?.toString() || ''
            });
          }

        } else {
          setStatus({
            isOk: false,
            isErr: true,
            result: result.asErr.value.toString()
          });
        }
      })
      .catch(err => {
        console.error(err);
        setStatus({
          isOk: false,
          isErr: true,
          result: err.toString()
        });
      });
  };

  const callTransaction = async (gasConsumed: u64, output: Codec | null) => {

    const value = 0;
    const gasLimit = gasConsumed.toBn();
    const outputRecord = output as unknown as Record<string, Enum>;
    const signPair = getAddressOrPair(api, caller);

    if (outputRecord.isError) {
      const resultMessage = `${outputRecord.type}: ${outputRecord.value?.toString()}`;
      setStatus({
        isOk: false,
        isErr: true,
        result: resultMessage
      });

    } else {

      contract &&
      await contract.tx[messageName](value, gasLimit, ...((params?.length)? params : []))
        .signAndSend(signPair, (result: ContractSubmittableResult) => {
          if (result.status.isFinalized) {
            if (result.isError) {
              setStatus({
                isOk: false,
                isErr: true,
                result: 'Error'
              });

            } else {
              setStatus({
                isOk: true,
                isErr: false,
                result: 'Success'
              });
            }

          } else {
            setStatus({
              isOk: false,
              isErr: false,
              result: `call status: ${result.status.type}`
            });
          }
        })
        .catch(err => {
          console.error(err);
          setStatus({
            isOk: false,
            isErr: true,
            result: err.toString()
          });
        });
    }
  };

  return (
    <Button
      primary
      type='submit'
      onClick={callQuery}
      disabled={isDisabled}
    >Call</Button>
  );
};
