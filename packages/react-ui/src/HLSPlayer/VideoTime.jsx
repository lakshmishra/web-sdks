import { useEffect, useState } from 'react';
import { getDurationFromSeconds } from './HMSVIdeoUtils';
import { Text } from '../Text';

export const VideoTime = ({ videoRef }) => {
  const [videoTime, setVideoTime] = useState('');

  useEffect(() => {
    const videoEl = videoRef.current;
    const timeupdateHandler = _ => setVideoTime(getDurationFromSeconds(videoEl.currentTime));
    if (videoEl) {
      videoEl.addEventListener('timeupdate', timeupdateHandler);
    }
    return function cleanup() {
      if (videoEl) {
        videoEl.removeEventListener('timeupdate', timeupdateHandler);
      }
    };
  }, []);

  return videoRef.current ? (
    <Text
      variant={{
        '@sm': 'xs',
      }}
    >{`${videoTime}`}</Text>
  ) : null;
};
