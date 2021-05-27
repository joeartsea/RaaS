import React, { useState, useEffect } from 'react';
import { EventRecord } from '@polkadot/types/interfaces';
import type { Vec } from '@polkadot/types';

import useSubstrateApi from './Api';

import { Feed, Grid } from 'semantic-ui-react';

interface SystemEvent {
  icon: string,
  summary: string,
  extraText: string,
  content: string
};

export default function Events() {
  const { api } = useSubstrateApi();
  const [eventFeed, setEventFeed] = useState<SystemEvent[]>([{
    icon: '',
    summary: '',
    extraText: '',
    content: ''
  }]);

  useEffect(() => {
    const getEvents = () => {
      api &&
      api.query &&
      api.query.system &&
      api.query.system.events((events: Vec<EventRecord>) => {
        events.forEach((record: EventRecord) => {
          const { event, phase } = record;

          const types = event.typeDef;

          const eventName = `${event.section}:${event.method}:: (phase=${phase.toString()})`;

          const params = event.data.map((data, index) =>
            `${types[index].type}: ${data.toString()}`
          );

          setEventFeed(e => [
            {
              icon: 'bell',
              summary: `${eventName}-${e.length}`,
              extraText: event.meta.documentation.join(', ').toString(),
              content: params.join(', ')
            },
            ...e
          ]);
        });
      })
      .catch((e) => console.error(e));
    };
    getEvents();
  }, [api, api.query.system]);

  return (
    <>
    <Grid.Column>
      <h1>Events</h1>
      <Feed style={{ overflow: 'auto', maxHeight: 250 }} events={eventFeed} />
    </Grid.Column>
    </>
  );
};
