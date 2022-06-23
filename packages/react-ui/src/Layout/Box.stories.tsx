import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Box } from './Box';
import BoxDocs from './Box.mdx';
import React from 'react';

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'UI Components/Box',
  component: Box,
  argTypes: { onClick: { action: 'clicked' } },
  parameters: {
    docs: {
      page: BoxDocs,
    },
  },
} as ComponentMeta<typeof Box>;

//👇 We create a “template” of how args map to rendering
const Template: ComponentStory<typeof Box> = args => <Box {...args}></Box>;

export const Index = Template.bind({});

Index.args = {
  css: { width: '$40', height: '$40', border: '1px solid $secondaryDark' },
};
