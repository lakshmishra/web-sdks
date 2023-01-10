import { Flex } from '../Layout';
import { styled } from '../Theme';

export const VideoControls = styled(Flex, {
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  gap: '$2',
});

export const LeftControls = styled(Flex, {
  justifyContent: 'flex-start',
  alignItems: 'center',
  width: '100%',
  gap: '$2',
});
export const RightControls = styled(Flex, {
  justifyContent: 'flex-end',
  alignItems: 'center',
  width: '100%',
  gap: '$2',
});
