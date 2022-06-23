import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Flex } from './Flex';
import FlexDocs from './Flex.mdx';
import React from 'react';

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'UI Components/Flex',
  component: Flex,
  argTypes: { onClick: { action: 'clicked' } },
  parameters: {
    docs: {
      page: FlexDocs,
    },
  },
} as ComponentMeta<typeof Flex>;

//👇 We create a “template” of how args map to rendering
const Template: ComponentStory<typeof Flex> = args => (
  <Flex {...args}>
    <Flex css={{ border: '1px solid $secondaryLight' }}>1</Flex>
    <Flex css={{ border: '1px solid $secondaryLight' }}>2</Flex>
  </Flex>
);

export const Index = Template.bind({});

Index.args = {
  direction: 'row',
  justify: 'center',
  align: 'center',
  gap: '2',
  css: { width: '$40', height: '$40', border: '1px solid $secondaryDark' },
};
