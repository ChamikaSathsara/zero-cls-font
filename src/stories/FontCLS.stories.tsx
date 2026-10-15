import type { Meta, StoryObj } from '@storybook/react';
import { FontCLSSimulator } from './FontCLS';

const meta: Meta<typeof FontCLSSimulator> = {
  title: 'Performance/Zero-CLS Font Simulator',
  component: FontCLSSimulator,
  argTypes: {
    presetFont: {
      control: 'select',
      options: ['PlayfairDisplay', 'SpaceGrotesk', 'Outfit'],
      description: 'Target web font to calculate metrics for',
    },
    systemFallback: {
      control: 'select',
      options: ['Arial', 'Times New Roman', 'Roboto'],
      description: 'Local OS font to morph into the web font dimensions',
    },
    networkDelayMs: {
      control: { type: 'range', min: 300, max: 3000, step: 100 },
      description: 'Simulated 3G network download latency for the .woff2 file',
    },
  },
};

export default meta;
type Story = StoryObj<typeof FontCLSSimulator>;

export const Slow3GFontSwap: Story = {
  args: {
    presetFont: 'PlayfairDisplay',
    systemFallback: 'Arial',
    networkDelayMs: 1200,
    xRayOverlay: false,
    sampleHeading: 'Eliminate Cumulative Layout Shift Forever',
    sampleBody:
      'When a custom web font takes 1.2 seconds to download over a mobile network, standard fallback fonts cause paragraphs to reflow and buttons to jump right under the user’s thumb. zero-cls-font calculates exact glyph width and vertical metric overrides at build time so the page never shifts a single pixel.',
  },
};
