import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Label } from './Label';
import { Input } from '../Input';
import LabelDocs from './Label.mdx';
import React from 'react';

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'UI Components/Label',
  component: Label,
  argTypes: { onClick: { action: 'clicked' } },
  parameters: {
    docs: {
      page: LabelDocs,
    },
  },
} as ComponentMeta<typeof Label>;

//👇 We create a “template” of how args map to rendering
const Template: ComponentStory<typeof Label> = args => <Label {...args}>Hello World</Label>;

export const Primary = Template.bind({});

Primary.args = {
  css: { bg: '$secondaryDefault', px: '$4' },
};
