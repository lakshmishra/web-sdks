import React, { Fragment, useState } from "react";
import { Tldraw } from "@tldraw/tldraw";
import { Button, Flex, Text } from "@100mslive/react-ui";
import PDFViewer from "./drivers/PDFViewer";
import { EmbedUrlModal } from "./EmbedAssestUrl";
import { useMultiplayerState } from "./useMultiplayerState";
import "./Whiteboard.css";

async function upload(file) {
  const data = new FormData();
  data.append("file", file);
  data.append("file_name", file.name);
  const res = await fetch("http://localhost:8080/file", {
    method: "POST",
    body: data,
  });
  const text = await res.text();
  return text;
}
export const Whiteboard = React.memo(({ roomId }) => {
  const events = useMultiplayerState(roomId);
  const [showOpenUrl, setShowOpenUrl] = useState(false);
  const [url, setUrl] = useState("");
  const onEmbedUrl = () => {
    setShowOpenUrl(true);
  };
  const isPdf = false;
  return !isPdf ? (
    <Fragment>
      <Tldraw
        autofocus
        disableAssets={false}
        showSponsorLink={false}
        showPages={false}
        showMenu={false}
        onAssetCreate={async (app, file) => {
          const url = await upload(file);
          console.log("url ", url);
          return url;
        }}
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
            onOpenChange={async value => {
              if (value === false && url) {
                await events.embedURL(url);
              }
              setShowOpenUrl(value);
            }}
          />
        )}
      </Flex>
    </Fragment>
  ) : (
    <PDFViewer isPdf={isPdf} roomId />
  );
});
