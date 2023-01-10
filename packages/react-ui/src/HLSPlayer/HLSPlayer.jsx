import { useCallback, useEffect, useState } from 'react';
import { useFullscreen, useRaf, useToggle } from 'react-use';
import { HlsStats } from '@100mslive/hls-stats';
import screenfull from 'screenfull';
import { ExpandIcon, ShrinkIcon } from '@100mslive/react-icons';
import { LeftControls, RightControls, VideoControls } from './Controls';
import { FullScreenButton } from './FullscreenButton';
import { HLSAutoplayBlockedPrompt } from './HLSAutoplayBlockedPrompt';
import { HLSQualitySelector } from './HLSQualitySelector';
import { HLSVideo } from './HLSVideo';
import { PlayButton } from './PlayButton';
import { VolumeControl } from './VideoControl';
import { VideoProgress } from './VideoProgress';
import { VideoTime } from './VideoTime';
import { IconButton } from '../IconButton';
import { Box, Flex } from '../Layout';
import { Text } from '../Text';
import { useTheme } from '../Theme';
import { Tooltip } from '../Tooltip';

let hlsStats;
export const HLSPlayer = ({
  videoRef,
  hlsUrl,
  controllerRef,
  enablHlsStats,
  currentSelectedQuality,
  availableLevels = [],
  isMSENotSupported = false,
}) => {
  const hlsViewRef = useRaf(null);
  const [isHlsAutoplayBlocked, setIsHlsAutoplayBlocked] = useState(false);
  let [hlsStatsState, setHlsStatsState] = useState(null);
  const { themeType } = useTheme();
  const [isVideoLive, setIsVideoLive] = useState(true);
  const [isUserSelectedAuto, setIsUserSelectedAuto] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const isFullScreenSupported = screenfull.isEnabled;
  const [show, toggle] = useToggle(false);
  const isFullScreen = useFullscreen(hlsViewRef, show, {
    onClose: () => toggle(false),
  });

  const unblockAutoPlay = async () => {
    try {
      await videoRef.current?.play();
      console.debug('Successfully started playing the stream.');
      setIsHlsAutoplayBlocked(false);
    } catch (error) {
      console.error('Tried to unblock Autoplay failed with', error.toString());
    }
  };
  /**
   * On mount. Add listeners for Video play/pause
   */
  useEffect(() => {
    const playEventHandler = () => setIsPaused(false);
    const pauseEventHandler = () => setIsPaused(true);
    const videoEl = videoRef.current;
    /**
     * we are doing all the modifications
     * to the video element after hlsUrl is loaded,
     * this is because, <HMSVideo/> is conditionally
     * rendered based on hlsUrl, so if we try to do
     * things before that, the videoRef.current will be
     * null.
     */
    if (!hlsUrl || !videoEl) {
      return;
    }

    if (controllerRef && controllerRef.getHlsJsInstance) {
      hlsStats = new HlsStats(controllerRef.getHlsJsInstance(), videoEl);
    }
    const playVideo = async () => {
      try {
        if (videoEl.paused) {
          await videoEl.play();
        }
      } catch (error) {
        console.debug('Browser blocked autoplay with error', error.toString());
        console.debug('asking user to play the video manually...');
        if (error.name === 'NotAllowedError') {
          setIsHlsAutoplayBlocked(true);
        }
      }
    };
    playVideo();

    videoEl.addEventListener('play', playEventHandler);
    videoEl.addEventListener('pause', pauseEventHandler);
    return () => {
      videoEl.removeEventListener('play', playEventHandler);
      videoEl.removeEventListener('pause', pauseEventHandler);
    };
  }, [hlsUrl]);

  const handleQuality = useCallback(
    qualityLevel => {
      if (controllerRef && controllerRef.setCurrentLevel) {
        setIsUserSelectedAuto(qualityLevel.height.toString().toLowerCase() === 'auto');
        controllerRef.setCurrentLevel(qualityLevel);
      }
    },
    [availableLevels], //eslint-disable-line
  );
  /**
   * initialize and subscribe to hlsState
   */
  useEffect(() => {
    if (!hlsStats) {
      return;
    }
    let unsubscribe;
    if (enablHlsStats) {
      unsubscribe = hlsStats.subscribe(state => {
        setHlsStatsState(state);
      });
    } else {
      unsubscribe?.();
    }
    return () => {
      unsubscribe?.();
    };
  }, [enablHlsStats]);
  return (
    <Flex
      key="hls-viewer"
      id={`hls-viewer-${themeType}`}
      ref={hlsViewRef}
      css={{
        verticalAlign: 'middle',
        width: '100%',
        height: '100%',
      }}
    >
      {hlsStatsState?.url && enablHlsStats ? (
        // <HlsStatsOverlay hlsStatsState={hlsStatsState} />
        <></>
      ) : null}
      {hlsUrl ? (
        <Flex
          id="hls-player-container"
          align="center"
          justify="center"
          css={{
            width: '100%',
            margin: 'auto',
            height: '90%',
            '@md': { height: '90%' },
            '@lg': { height: '80%' },
          }}
        >
          <HLSAutoplayBlockedPrompt open={isHlsAutoplayBlocked} unblockAutoPlay={unblockAutoPlay} />
          <HLSVideo ref={videoRef}>
            {!isMSENotSupported && <VideoProgress videoRef={videoRef} />}

            <VideoControls css={{ p: '$4 $8' }}>
              <LeftControls>
                <PlayButton
                  onClick={() => {
                    isPaused ? videoRef.current?.play() : videoRef.current?.pause();
                  }}
                  isPaused={isPaused}
                />
                <VideoTime videoRef={videoRef} />
                <VolumeControl videoRef={videoRef} />
              </LeftControls>

              <RightControls>
                {!isMSENotSupported && controllerRef && controllerRef.jumpToLive ? (
                  <>
                    <IconButton
                      variant="standard"
                      css={{ px: '$2' }}
                      onClick={() => {
                        controllerRef.jumpToLive();
                        setIsVideoLive(true);
                      }}
                      key="jump-to-live_btn"
                      data-testid="jump-to-live_btn"
                    >
                      <Tooltip title="Go to Live">
                        <Flex justify="center" gap={2} align="center">
                          <Box
                            css={{
                              height: '$4',
                              width: '$4',
                              background: isVideoLive ? '$error' : '$white',
                              r: '$1',
                            }}
                          />
                          <Text
                            variant={{
                              '@sm': 'xs',
                            }}
                          >
                            {isVideoLive ? 'LIVE' : 'GO LIVE'}
                          </Text>
                        </Flex>
                      </Tooltip>
                    </IconButton>
                    <HLSQualitySelector
                      levels={availableLevels}
                      selection={currentSelectedQuality}
                      onQualityChange={handleQuality}
                      isAuto={isUserSelectedAuto}
                    />
                  </>
                ) : null}
                {isFullScreenSupported ? (
                  <FullScreenButton onToggle={toggle} icon={isFullScreen ? <ShrinkIcon /> : <ExpandIcon />} />
                ) : null}
              </RightControls>
            </VideoControls>
          </HLSVideo>
        </Flex>
      ) : (
        <Flex align="center" justify="center" css={{ size: '100%', px: '$10' }}>
          <Text variant="md" css={{ textAlign: 'center' }}>
            Waiting for the stream to start...
          </Text>
        </Flex>
      )}
    </Flex>
  );
};
