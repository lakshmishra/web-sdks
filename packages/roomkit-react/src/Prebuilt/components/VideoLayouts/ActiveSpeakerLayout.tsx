import React from 'react';
import { usePrevious } from 'react-use';
import { selectDominantSpeaker, selectPeers, useHMSStore } from '@100mslive/react-sdk';
import { Box, Flex } from '../../../Layout';
import VideoTile from '../VideoTile';
import { flexCenter } from '../../../utils';

export const ActiveSpeakerLayout = () => {
  const peers = useHMSStore(selectPeers);
  const dominantSpeaker = useHMSStore(selectDominantSpeaker);
  const previousSpeaker = usePrevious(dominantSpeaker);

  return (
    <Flex css={{ size: '100%', position: 'relative' }}>
      <Flex direction="column" css={{ overflowY: 'auto', '@md': { display: 'none' } }}>
        {peers.map(peer => {
          return <VideoTile width={100} height={100} peerId={peer.id} />;
        })}
      </Flex>
      <Box
        css={{
          flex: '1 1 0',
          overflow: 'hidden',
          ...flexCenter,
          position: 'absolute',
          left: 120,
          right: 0,
          bottom: 0,
          top: 0,
          '@md': {
            left: 0,
          },
        }}
      >
        <VideoTile peerId={dominantSpeaker?.id || previousSpeaker?.id} rootCSS={{ size: '100%' }} objectFit="contain" />
      </Box>
    </Flex>
  );
};
