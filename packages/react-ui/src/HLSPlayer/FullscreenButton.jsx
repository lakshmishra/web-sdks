import { IconButton } from '../IconButton';
import { Flex } from '../Layout';
import { Tooltip } from '../Tooltip';

export const FullScreenButton = ({ icon, onToggle }) => {
  return (
    <Tooltip title="Go fullscreen">
      <IconButton
        variant="standard"
        css={{ margin: '0px' }}
        onClick={onToggle}
        key="fullscreen_btn"
        data-testid="fullscreen_btn"
      >
        <Flex>{icon}</Flex>
      </IconButton>
    </Tooltip>
  );
};
