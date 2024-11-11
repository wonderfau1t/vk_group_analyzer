import { Panel, PanelHeader, PanelHeaderBack, Placeholder, Title } from '@vkontakte/vkui';
import { useMetaParams, useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import PropTypes from 'prop-types';
import PersikImage from '../assets/persik.png';

export const Persik = ({ id }) => {
  const routeNavigator = useRouteNavigator();
  return (
    <Panel id={id}>
      <PanelHeader before={<PanelHeaderBack onClick={() => routeNavigator.push('/')} />}>
        Persik
      </PanelHeader>
      <Placeholder>
        <img width={230} src={PersikImage} alt="Persik The Cat" />
      </Placeholder>
    </Panel>
  );
};

Persik.propTypes = {
  id: PropTypes.string.isRequired,
};
