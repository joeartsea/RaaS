import React, { SyntheticEvent, useState } from 'react';
import { Link, Redirect, Route, Switch, useLocation } from 'react-router-dom';

import useSubstrateApi from './Api';
import Issuance from './Issuance';
import Authority from './Authority';
import GivePoints from './GivePoints';
import OwnerPoint from './OwnerPoint';
import SpendPoints from './SpendPoints';
import StorePoints from './StorePoints';
import StoreUserPoints from './StoreUserPoints';
import UserPoints from './UserPoints';
import Contract from './Contract';
import Events from './Events';

import { Grid, Label, Menu, MenuItemProps, Segment, Sidebar, Tab } from 'semantic-ui-react';


export default function SideMenu() {
  const { hasContract } = useSubstrateApi();
  const location = useLocation();

  const [activeItem, setActiveItem] = useState(hasContract? location.state : 'settings');
  const [visible, setVisible] = useState(true);

  const router = [
    {path: `/issue`, name: 'issue', text: 'ポイント発行', routes: [
      {menuItem: 'ポイント発行', render: () => <Issuance /> },
      {menuItem: '権限付与', render: () => <Authority /> }
    ]},
    {path: `/grant`, name: 'grant', text: 'ポイント付与', routes:[
      {menuItem: 'ポイント付与', render: () => <GivePoints /> }
    ]},
    {path: `/confirm`, name: 'confirm', text: 'ポイント確認', routes: [
      {menuItem: 'オーナーポイント確認', render: () => <OwnerPoint /> },
      {menuItem: '店舗ポイント確認', render: () => <StorePoints /> },
      {menuItem: '店舗/ユーザポイント確認', render: () => <StoreUserPoints /> },
      {menuItem: 'ユーザポイント確認', render: () => <UserPoints /> }
    ]},
    {path: `/use`, name: 'use', text: 'ポイント利用', routes: [
      {menuItem: 'ポイント利用', render: () => <SpendPoints /> }
    ]},
    {path: `/settings`, name: 'settings', text: '設定', routes: [
      {menuItem: 'コントラクト', render: () => <Contract /> }
    ]},
    {path: `/events`, name: 'events', text: 'イベント', routes: [
      {menuItem: 'イベント', render: () => <Events /> }
    ]}
  ];

  const chooseMenu = (_: SyntheticEvent, data: MenuItemProps) => {
    setActiveItem(data.name || '');
    setVisible(false);
  }

  return (
    <Grid.Column stretched>
      <div>
        <Label
          basic
          icon={visible? 'angle double left' : 'angle double right'}
          content='Menu'
          style={{ cursor: 'pointer' }}
          onClick={() => setVisible(!visible)}
        />
      </div>
      <Sidebar.Pushable as={Segment} style={{height: '80vh'}}>
        <Sidebar
          as={Menu}
          animation='overlay'
          vertical
          onHide={() => setVisible(false)}
          visible={visible}
          width='thin'
        >
          <Menu.Menu>
          {router.map((route, idx) => {
            const toObj = {
              pathname: `${route.path}`,
              state: `${route.name}`
            };
            return (
              <Menu.Item
                as='div'
                key={idx}
                name={route.name}
                active={activeItem === route.name}
                onClick={chooseMenu}
              >
                <Link to={toObj} >{route.text}</Link>
              </Menu.Item>
            )}
          )}
          </Menu.Menu>
        </Sidebar>

        <Sidebar.Pusher>
          <Segment basic>
            <Switch>
            {!hasContract?
              <Route exact path="/">
                <Redirect
                  to={{
                    pathname: "/settings",
                    state: "settings"
                  }}
                />
              </Route>
            : null}
            {router.map((route, idx) => {
              return (
                (route.routes.length > 1)?
                  <Route
                    key={route.name+idx}
                    path={route.path}
                    render={() => <Tab panes={route.routes} />}
                  />
                :
                  <Route
                    key={route.name+idx}
                    path={route.path}
                    render={route.routes[0].render}
                  />
              )}
            )}
            </Switch>
          </Segment>
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    </Grid.Column>
  );
}
