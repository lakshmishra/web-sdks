import React, { Fragment, useState } from "react";
import { Tldraw } from "@tldraw/tldraw";
import { Button, Flex, Text } from "@100mslive/react-ui";
import { EmbedUrlModal } from "./EmbedAssestUrl";
import { useSetAppDataByKey } from "../../components/AppData/useUISettings";
import { useMultiplayerState } from "./useMultiplayerState";
import { APP_DATA } from "../../common/constants";
import "./Whiteboard.css";

export const Whiteboard = React.memo(({ roomId }) => {
  const events = useMultiplayerState(roomId);
  const [showOpenUrl, setShowOpenUrl] = useState(false);
  const [url, setUrl] = useState("");
  const onEmbedUrl = () => {
    setShowOpenUrl(true);
  };
  return (
    <Fragment>
      <Tldraw
        autofocus
        disableAssets={false}
        showSponsorLink={false}
        showPages={false}
        showMenu={false}
        // onAssetCreate={(app, file) => {
        //   console.log("here");
        // }}
        {...events}
      />
      <Flex
        css={{
          background: "gray",
          text: "white",
          position: "absolute",
          zIndex: "5",
        }}
      >
        <Button outlined onClick={onEmbedUrl}>
          <Text variant="sm" css={{ ml: "$4" }}>
            Embed URL
          </Text>
        </Button>
        {showOpenUrl && (
          <EmbedUrlModal
            url={url}
            setUrl={setUrl}
            onOpenChange={value => {
              if (value === false && url) {
                events.applyAssets({
                  "4de1831d-c68c-4a70-0fab-5cb02de0d1b9": {
                    id: "4de1831d-c68c-4a70-0fab-5cb02de0d1b9",
                    type: "image",
                    name: "img1",
                    src: url,
                    size: [674.40625, 379.1683748169839],
                  },
                });
              }
              setShowOpenUrl(value);
            }}
          />
        )}
      </Flex>
    </Fragment>
  );
});
