/* eslint-disable complexity */
import {
  HMSPeer,
  HMSPreferredSimulcastLayer,
  HMSScreenVideoTrack,
  HMSSimulcastLayerDefinition,
  HMSTrack,
  HMSTrackID,
  HMSVideoTrack,
} from '@100mslive/hms-video-store';

export const chunk = <T>(elements: T[], chunkSize: number, onlyOnePage: boolean) =>
  elements.reduce((resultArray: T[][], tile: T, index: number) => {
    const chunkIndex = Math.floor(index / chunkSize);
    if (chunkIndex > 0 && onlyOnePage) {
      return resultArray;
    }
    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = []; // start a new chunk
    }

    resultArray[chunkIndex].push(tile);
    return resultArray;
  }, []);

interface ChunkElements<T> {
  elements: T[];
  tilesInFirstPage: number;
  onlyOnePage: boolean;
  isLastPageDifferentFromFirstPage: boolean;
  defaultWidth: number;
  defaultHeight: number;
  lastPageWidth: number;
  lastPageHeight: number;
}

/**
 * Given a list of tracks/elements and some constraints, group the tracks in separate pages.
 * @return 2D list for every page which has the original element and height and width
 * for its tile.
 */
export const chunkElements = <T>({
  elements,
  tilesInFirstPage,
  onlyOnePage,
  isLastPageDifferentFromFirstPage,
  defaultWidth,
  defaultHeight,
  lastPageWidth,
  lastPageHeight,
}: ChunkElements<T>): (T & { width: number; height: number })[][] => {
  const chunks: T[][] = chunk<T>(elements, tilesInFirstPage, onlyOnePage);
  return chunks.map((ch, page) =>
    ch.map(element => {
      const isLastPage: boolean = page === chunks.length - 1;
      const width = isLastPageDifferentFromFirstPage && isLastPage ? lastPageWidth : defaultWidth;
      const height = isLastPageDifferentFromFirstPage && isLastPage ? lastPageHeight : defaultHeight;
      return { ...element, height, width };
    }),
  );
};

/**
 * Mathematical mode - the element with the highest occurrence in an array
 * @param array
 */
export function mode(array: number[]): number | null {
  if (array.length === 0) {
    return null;
  }
  const modeMap: Record<number, number> = {};
  let maxEl = array[0];
  let maxCount = 1;
  for (let i = 0; i < array.length; i++) {
    const el = array[i];
    if (modeMap[el] === null) {
      modeMap[el] = 1;
    } else {
      modeMap[el]++;
    }
    if (modeMap[el] > maxCount) {
      maxEl = el;
      maxCount = modeMap[el];
    }
  }
  return maxEl;
}

export type TrackWithPeer = { track?: HMSVideoTrack | HMSScreenVideoTrack; peer: HMSPeer };

/**
 * get the aspect ration occurring with the highest frequency
 * @param tracks - video tracks to infer aspect ratios from
 */
export const getModeAspectRatio = (tracks: TrackWithPeer[]): number | null =>
  mode(
    tracks
      .filter(track => track.track?.width && track.track?.height)
      .map(track => {
        const width = track.track?.width;
        const height = track.track?.height;
        // Default to 1 if there are no video tracks
        return (width || 1) / (height || 1);
      }),
  );

/**
 * given list of peers and all tracks in the room, get a list of tile objects to show in the UI
 * @param peers
 * @param tracks
 * @param includeScreenShareForPeer - fn will be called to check whether to include screenShare for the peer in returned tiles
 * @param filterNonPublishingPeers - by default a peer with no tracks won't be counted towards final tiles
 */
export const getVideoTracksFromPeers = (
  peers: HMSPeer[],
  tracks: Record<HMSTrackID, HMSTrack>,
  includeScreenShareForPeer: (peer: HMSPeer) => boolean,
  filterNonPublishingPeers = true,
) => {
  if (!peers || !tracks || !includeScreenShareForPeer) {
    return [];
  }
  const peerTiles: TrackWithPeer[] = [];
  for (const peer of peers) {
    const onlyAudioTrack = peer.videoTrack === undefined && peer.audioTrack && tracks[peer.audioTrack];
    if (onlyAudioTrack) {
      peerTiles.push({ peer: peer });
    } else if (peer.videoTrack && tracks[peer.videoTrack]) {
      peerTiles.push({ track: tracks[peer.videoTrack] as HMSVideoTrack, peer: peer });
    } else if (!filterNonPublishingPeers) {
      peerTiles.push({ peer: peer });
    }
    // Handle video tracks in auxiliary tracks as well.
    if (peer.auxiliaryTracks.length > 0) {
      peer.auxiliaryTracks.forEach(trackId => {
        const track = tracks[trackId];
        if (track?.type === 'video' && track?.source === 'regular') {
          peerTiles.push({ track, peer });
        }
      });
    }
    if (includeScreenShareForPeer(peer) && peer.auxiliaryTracks.length > 0) {
      const screenShareTrackID = peer.auxiliaryTracks.find(trackID => {
        const track = tracks[trackID];
        return track?.type === 'video' && track?.source === 'screen';
      });
      // Don't show tile if screenshare only has audio
      if (screenShareTrackID) {
        peerTiles.push({ track: tracks[screenShareTrackID] as HMSScreenVideoTrack, peer: peer });
      }
    }
  }
  return peerTiles;
};

export const getClosestLayer = ({
  layerDefinitions,
  width,
  height,
}: {
  layerDefinitions: HMSSimulcastLayerDefinition[];
  width: number;
  height: number;
}): HMSPreferredSimulcastLayer => {
  let diff = Number.MAX_VALUE;
  let closestLayer: HMSPreferredSimulcastLayer | undefined = undefined;
  for (const { resolution, layer } of layerDefinitions) {
    const currDiff = Math.abs(width - (resolution.width || 0)) + Math.abs(height - (resolution.height || 0));
    if (currDiff < diff) {
      diff = currDiff;
      closestLayer = layer;
    }
  }
  return closestLayer!;
};

function findBestFitLayout({
  containerHeight,
  containerWidth,
  numTiles: n,
  aspectRatio,
  enforceSameTilesPerRow = false,
}: {
  containerHeight: number;
  containerWidth: number;
  numTiles: number;
  aspectRatio: number;
  enforceSameTilesPerRow?: boolean;
}) {
  let result = { rows: 0, cols: 0, height: 0, width: 0 };
  if (n <= 0 || containerWidth <= 0 || containerHeight <= 0) {
    return result;
  }
  console.log({ aspectRatio, containerWidth, containerHeight });
  aspectRatio = aspectRatio || 1; // if not passed assume square
  let bestArea = 0; // area = tileWidth * tileHeight

  // brute force from 1 column(and n rows) to n columns(and 1 row)
  for (let cols = 1; cols <= n; cols++) {
    const rows = Math.ceil(n / cols);
    if (enforceSameTilesPerRow && rows * cols !== n) {
      console.log('matched condition');
      continue;
    }
    // now that we have number of rows and columns, there are two ways to stack the tiles,
    // - to use the full width(dividing the width evenly between cols)
    // - to use the full height(dividing the height evenly between rows)
    // we'll try with first, and if it's not possible we'll go with second

    // tile width and height if we use the full container width
    let width = Math.floor(containerWidth / cols);
    let height = Math.floor(width / aspectRatio);

    // max height possible is when the total height is divided equally between the rows
    const maxHeightPossible = Math.floor(containerHeight / rows);
    if (height > maxHeightPossible) {
      // using full width is not possible for given number of columns, use full height instead
      height = maxHeightPossible;
      width = Math.floor(maxHeightPossible * aspectRatio);
    }
    const tileArea = width * height;
    if (tileArea > bestArea) {
      bestArea = tileArea;
      result = { rows, cols, height, width };
    }
  }

  console.log(result);

  return result;
}

export const calculateLayout = ({
  parentWidth,
  parentHeight,
  aspectRatio,
  tiles,
  maxTileCount,
  enforceSameTilesPerRow,
}: {
  parentWidth: number;
  parentHeight: number;
  aspectRatio: number;
  tiles: number;
  maxTileCount: number;
  enforceSameTilesPerRow?: boolean;
}) => {
  let lastPageRows = 0;
  let lastPageCols = 0;
  let lastPageWidth = 0;
  let lastPageHeight = 0;
  const tilesPerPage = maxTileCount;
  const { rows, cols, height, width } = findBestFitLayout({
    containerWidth: parentWidth,
    containerHeight: parentHeight,
    aspectRatio,
    numTiles: tilesPerPage,
    enforceSameTilesPerRow,
  });
  const tilesForlastPage = tiles % (rows * cols);
  if (tilesForlastPage > 0) {
    const result = findBestFitLayout({
      containerWidth: parentWidth,
      containerHeight: parentHeight,
      aspectRatio,
      numTiles: tilesPerPage,
      enforceSameTilesPerRow,
    });
    lastPageRows = result.rows;
    lastPageCols = result.cols;
    lastPageWidth = result.width;
    lastPageHeight = result.height;
  }
  return {
    defaultWidth: width,
    defaultHeight: height,
    rows,
    cols,
    lastPageWidth,
    lastPageHeight,
    lastPageCols,
    lastPageRows,
  };
};

export const chunkElementsWithLayout = <T>({
  elements,
  ...rest
}: {
  parentWidth: number;
  parentHeight: number;
  aspectRatio: number;
  tiles: number;
  maxTileCount: number;
  elements: T[];
  enforceSameTilesPerRow?: boolean;
}): {
  chunkedTracksWithPeer: (T & { width: number; height: number })[][];
  rows: number;
  cols: number;
  lastPageRows: number;
  lastPageCols: number;
} => {
  const { rows, cols, lastPageRows, lastPageCols, lastPageWidth, lastPageHeight, defaultWidth, defaultHeight } =
    calculateLayout(rest);
  const chunks: T[][] = chunk<T>(elements, rows * cols, rows * cols >= rest.tiles);
  return {
    chunkedTracksWithPeer: chunks.map((ch, page) =>
      ch.map(element => {
        const isLastPage: boolean = page === chunks.length - 1;
        const width = (isLastPage ? lastPageWidth : 0) || defaultWidth;
        const height = (isLastPage ? lastPageHeight : 0) || defaultHeight;
        return { ...element, height, width };
      }),
    ),
    rows,
    cols,
    lastPageRows,
    lastPageCols,
  };
};
