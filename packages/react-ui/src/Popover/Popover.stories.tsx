import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Popover } from './index';
import { Flex } from '../Layout';
import PopoverDocs from './Popover.mdx';
import React from 'react';

const loadBook = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-Popover
   * to learn how to generate automatic titles
   */
  title: 'UI Components/Popover',
  component: Popover.Root,
  argTypes: { onClick: { action: 'clicked' } },
  parameters: {
    docs: {
      page: PopoverDocs,
    },
  },
} as ComponentMeta<typeof Popover.Root>;
//add textbox
export default loadBook;

//👇 We create a “template” of how args map to rendering
const Template: ComponentStory<typeof Popover.Root> = args => (
  <Popover.Root {...args}>
    <Popover.Trigger asChild>
      <Flex css={{ bg: '$secondaryDark', color: '$white', w: '$40' }} justify="center">
        Click Here!
      </Flex>
    </Popover.Trigger>
    <Popover.Content sideOffset={10} css={{ color: '$white' }}>
      Hello Friends
    </Popover.Content>
  </Popover.Root>
);

export const Index = Template.bind({});

Index.args = {
  css: { bg: '$secondaryDark' },
};
