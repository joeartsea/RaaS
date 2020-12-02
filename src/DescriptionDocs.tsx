import React from 'react';
import { AbiMessage } from "@polkadot/api-contract/types";

interface Props {
  abiMessage: AbiMessage
};

export default function DescriptionDocs(props: Props) {
  const { abiMessage } = props;

  return (
    <>
    {abiMessage.docs?.map((doc, idx) => ((
      <p key={idx}>{doc}</p>
    )))}
    </>
  );
};
