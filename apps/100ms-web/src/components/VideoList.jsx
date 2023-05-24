import React, { useMemo, useState } from "react";
import {
  selectLocalPeerID,
  selectTracksMap,
  useHMSStore,
} from "@100mslive/react-sdk";
import { getVideoTracksFromPeers } from "@100mslive/react-sdk/dist/utils/layout";
import { css, getLeft, StyledVideoList } from "@100mslive/react-ui";
import { Pagination } from "./Pagination";
import ScreenshareTile from "./ScreenshareTile";
import VideoTile from "./VideoTile";
// import { useAppConfig } from "./AppData/useAppConfig";
import { useIsHeadless, useUISettings } from "./AppData/useUISettings";
import { UI_SETTINGS } from "../common/constants";

const List = ({
  maxTileCount = 9,
  peers,
  maxColCount,
  maxRowCount,
  includeScreenShareForPeer,
}) => {
  // const { aspectRatio } = useTheme();
  // const tileOffset = useAppConfig("headlessConfig", "tileOffset");
  const isHeadless = useIsHeadless();
  const trackMap = useHMSStore(selectTracksMap);
  const hideLocalVideo = useUISettings(UI_SETTINGS.hideLocalVideo);
  const localPeerId = useHMSStore(selectLocalPeerID);
  if (hideLocalVideo && peers.length > 1) {
    peers = filterPeerId(peers, localPeerId);
  }
  const peersWithTiles = useMemo(() => {
    return getVideoTracksFromPeers(peers, trackMap, () => false);
  }, [trackMap, peers]);
  const noOfPages = peersWithTiles.length / maxTileCount;
  const pagesWithTiles = [];
  const remaining = peersWithTiles.length;
  let index = 0;
  for (let i = 0; i < noOfPages; i++) {
    const tilesForPage = Math.min(remaining, maxTileCount);
    const cols = Math.ceil(Math.sqrt(tilesForPage));
    const rows = Math.ceil(tilesForPage / cols);
    const containerStyles = css({
      display: "grid",
      gridTemplateColumns: `repeat(${cols * 2}, minmax(0, 1fr))`,
      gridTemplateRows: `repeat(${rows}, max-content)`,
      gridGap: 8,
    });
    const remainder = tilesForPage % cols;
    const lastRowFirstIndex = tilesForPage - remainder;
    let peerTiles = [];
    for (let j = 0; j < tilesForPage; j++) {
      const tile = peersWithTiles[index++];
      if (!tile) {
        continue;
      }
      if (lastRowFirstIndex === j) {
        const startPosition = cols - remainder + 1;
        tile.style = css({
          gridColumn: `${startPosition}/ span 2`,
          width: "100%",
          height: "100%",
          aspectRatio: tile.track.width / tile.track.height,
        });
      } else {
        tile.style = css({
          gridColumn: "span 2",
          width: "100%",
          height: "100%",
          aspectRatio: tile.track.width / tile.track.height,
        });
      }
      peerTiles.push(tile);
    }
    pagesWithTiles.push({ style: containerStyles, tiles: peerTiles });
  }
  /* const { ref, pagesWithTiles } = useVideoList({
    peers,
    maxTileCount,
    maxColCount,
    maxRowCount,
    includeScreenShareForPeer,
    aspectRatio,
    offsetY: getOffset({ isHeadless, tileOffset }),
  }); */
  const [page, setPage] = useState(0);
  console.log({ pagesWithTiles, noOfPages, peersWithTiles, peers });
  /* useEffect(() => {
    // currentPageIndex should not exceed pages length
    if (page >= pagesWithTiles.length) {
      setPage(0);
    }
  }, [pagesWithTiles.length, page]); */
  return (
    <StyledVideoList.Root>
      <StyledVideoList.Container>
        {pagesWithTiles && pagesWithTiles.length > 0
          ? pagesWithTiles.map(({ tiles, style }, pageNo) => (
              <StyledVideoList.View
                key={pageNo}
                css={{
                  left: getLeft(pageNo, page),
                  transition: "left 0.3s ease-in-out",
                }}
                className={style()}
              >
                {tiles.map(tile => {
                  if (tile.width === 0 || tile.height === 0) {
                    return null;
                  }
                  return tile.track?.source === "screen" ? (
                    <ScreenshareTile
                      key={tile.track.id}
                      width={tile.width}
                      height={tile.height}
                      peerId={tile.peer.id}
                    />
                  ) : (
                    <VideoTile
                      key={tile.track?.id || tile.peer.id}
                      width={tile.width}
                      height={tile.height}
                      peerId={tile.peer?.id}
                      trackId={tile.track?.id}
                      visible={pageNo === page}
                      className={tile.style()}
                      rootCss={{ padding: 0 }}
                    />
                  );
                })}
              </StyledVideoList.View>
            ))
          : null}
      </StyledVideoList.Container>
      {!isHeadless && pagesWithTiles.length > 1 ? (
        <Pagination
          page={page}
          setPage={setPage}
          numPages={pagesWithTiles.length}
        />
      ) : null}
    </StyledVideoList.Root>
  );
};

const VideoList = React.memo(List);

/**
 * returns a new array of peers with the peer with peerId removed,
 * keeps the reference same if peer is not found
 */
function filterPeerId(peers, peerId) {
  const oldPeers = peers; // to keep the reference same if peer is not found
  let foundPeerToFilterOut = false;
  peers = [];
  for (let i = 0; i < oldPeers.length; i++) {
    if (oldPeers[i].id === peerId) {
      foundPeerToFilterOut = true;
    } else {
      peers.push(oldPeers[i]);
    }
  }
  if (!foundPeerToFilterOut) {
    peers = oldPeers;
  }
  return peers;
}

// const getOffset = ({ tileOffset, isHeadless }) => {
//   if (!isHeadless || isNaN(Number(tileOffset))) {
//     return 32;
//   }
//   return Number(tileOffset);
// };

export default VideoList;
