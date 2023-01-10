import React from 'react';
import { Button } from '../Button';
import { HorizontalDivider } from '../Divider';
import { Box, Flex } from '../Layout';
import { Dialog } from '../Modal';
import { Text } from '../Text';

const DialogContent = ({ Icon, title, closeable = true, children, css, iconCSS = {}, ...props }) => {
  return (
    <Dialog.Portal>
      <Dialog.Overlay />
      <Dialog.Content css={{ width: 'min(600px, 100%)', ...css }} {...props}>
        <Dialog.Title>
          <Flex justify="between">
            <Flex align="center" css={{ mb: '$1' }}>
              {Icon ? (
                <Box css={{ mr: '$2', color: '$textPrimary', ...iconCSS }}>
                  <Icon />
                </Box>
              ) : null}
              <Text variant="h6" inline>
                {title}
              </Text>
            </Flex>
            {closeable && <Dialog.DefaultClose data-testid="dialoge_cross_icon" />}
          </Flex>
        </Dialog.Title>
        <HorizontalDivider css={{ mt: '0.8rem' }} />
        <Box>{children}</Box>
      </Dialog.Content>
    </Dialog.Portal>
  );
};

/**
 * a row of items which breaks into column on small screen. For e.g. title on left and options to select
 * from on right for select component.
 */
export const DialogRow = ({ children, breakSm = false, css, justify = 'between' }) => {
  let finalCSS = {
    margin: '$10 0',
    w: '100%',
  };
  if (breakSm) {
    finalCSS['@sm'] = {
      flexDirection: 'column',
      alignItems: 'flex-start',
    };
  }
  if (css) {
    finalCSS = Object.assign(finalCSS, css);
  }
  return (
    <Flex align="center" justify={justify} css={finalCSS}>
      {children}
    </Flex>
  );
};

export function HLSAutoplayBlockedPrompt({ open, unblockAutoPlay }) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={value => {
        if (!value) {
          unblockAutoPlay();
        }
      }}
    >
      <DialogContent title="Attention" closeable={false}>
        <DialogRow>
          <Text variant="md">
            The browser wants us to get a confirmation for playing the HLS Stream. Please click "play stream" to
            proceed.
          </Text>
        </DialogRow>
        <DialogRow justify="end">
          <Button
            variant="primary"
            onClick={() => {
              unblockAutoPlay();
            }}
          >
            Play stream
          </Button>
        </DialogRow>
      </DialogContent>
    </Dialog.Root>
  );
}
