import React from 'react';
import { Message } from 'semantic-ui-react';

interface Props {
  status: ResultState
};

export interface ResultState {
  isOk: boolean,
  isErr: boolean,
  result: string
};

export const initialResultState = {
  isOk: false,
  isErr: false,
  result: ''
};

export default function  ResultMessage({ status }: Props) {
  const { isOk, isErr, result } = status;

  return (
    <Message
      success={isOk}
      error={isErr}
      content={result}
    />
  );
};
