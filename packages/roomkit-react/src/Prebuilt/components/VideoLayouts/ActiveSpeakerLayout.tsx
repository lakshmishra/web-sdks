import React from 'react';
import { selectDominantSpeaker, selectPeers, useHMSStore } from '@100mslive/react-sdk';
import { Box, Flex } from '../../../Layout';
import VideoTile from '../VideoTile';

export const ActiveSpeakerLayout = () => {
  const peers = useHMSStore(selectPeers);
  const dominantSpeaker = useHMSStore(selectDominantSpeaker);

  return (
    <Flex css={{ size: '100%' }}>
      <Flex direction="column" css={{ w: 240 }}>
        {peers.map(peer => {
          return <VideoTile peerId={peer.id} />;
        })}
      </Flex>
      <Box css={{ flex: '1 1 0' }}>
        <VideoTile peerId={dominantSpeaker?.id} />
      </Box>
    </Flex>
  );
};
