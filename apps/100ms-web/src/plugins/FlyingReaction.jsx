import React, { useCallback, useEffect, useMemo, useState } from "react";
import Fly from "react-flying-objects";
import { Easing } from "react-native-web";
import data from "@emoji-mart/data/sets/14/apple.json";
import { init } from "emoji-mart";
import { Box } from "@100mslive/react-ui";

init({ data });

const DELAY = 0;
const DURATION = 2500;
const SIZE = 35;
const random = (min, max) => Math.floor(Math.random() * (max - min) + min);

export const FlyingReaction = () => {
  const [animatedEmoji, setAnimatedEmoji] = useState();
  const [flyingObjects, setFlyingObjects] = useState([]);
  const objectConfig = useMemo(
    () => ({
      top: {
        fromValue: -35,
        toValue: -300,
        duration: DURATION,
        delay: DELAY,
      },
      right: {
        fromValue: random(10, 20),
        toValue: random(10, 20),
        duration: DURATION,
        easing: Easing.elastic(5),
        delay: DELAY,
      },
      width: {
        fromValue: random(SIZE - 10, SIZE + 10),
        toValue: SIZE,
        duration: DURATION,
        easing: Easing.elastic(5),
        delay: DELAY,
      },
      height: {
        fromValue: random(SIZE - 10, SIZE + 10),
        toValue: SIZE,
        duration: DURATION,
        easing: Easing.elastic(5),
        delay: DELAY,
      },
      opacity: {
        fromValue: 1,
        toValue: 0,
        duration: DURATION,
        easing: Easing.exp,
        delay: DELAY,
      },
    }),
    [animatedEmoji]
  );

  const showFlyingReaction = useCallback(emojiId => {
    const emoji = <em-emoji id={emojiId} size={SIZE} />;
    setAnimatedEmoji(emoji);
  }, []);

  // putting the function to send on window for quick access
  useEffect(() => {
    window.showFlyingReaction = showFlyingReaction;
  }, [showFlyingReaction]);

  return (
    <Box
      css={{
        position: "fixed",
        bottom: "100px",
        left: "100px",
      }}
    >
      <Fly
        objectToFly={animatedEmoji}
        objectConfig={objectConfig}
        flyingObjects={flyingObjects}
        setFlyingObjects={setFlyingObjects}
      />
    </Box>
  );
};
