import { forwardRef } from 'react';
import { Box } from '../Layout';

export const HLSVideo = forwardRef(({ children }, videoRef) => {
  return (
    <Box data-testid="hms-video" css={{ size: '100%' }}>
      <video style={{ height: '100%', margin: 'auto' }} ref={videoRef} playsInline />
      {children}
    </Box>
  );
});
