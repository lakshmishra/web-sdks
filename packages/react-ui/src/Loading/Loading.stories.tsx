import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Loading } from './Loading';
import LoadingDocs from './Loading.mdx';
import React from 'react';

const loadBook = {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'UI Components/Loading',
  component: Loading,
  argTypes: { onClick: { action: 'clicked' } },
  parameters: {
    docs: {
      page: LoadingDocs,
    },
  },
} as ComponentMeta<typeof Loading>;
//add textbox
export default loadBook;

//👇 We create a “template” of how args map to rendering
const Template: ComponentStory<typeof Loading> = args => <Loading {...args} />;

export const Index = Template.bind({});

Index.args = {
  size: 24,
  color: 'green',
  css: {},
};
