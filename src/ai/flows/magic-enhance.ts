// Implemented Genkit flow for the magicEnhance story.

'use server';

/**
 * @fileOverview Implements the magicEnhance flow to enhance photos using AI.
 *
 * - magicEnhance - A function that enhances a photo with AI.
 * - MagicEnhanceInput - The input type for the magicEnhance function.
 * - MagicEnhanceOutput - The return type for the magicEnhance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MagicEnhanceInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to be enhanced, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type MagicEnhanceInput = z.infer<typeof MagicEnhanceInputSchema>;

const MagicEnhanceOutputSchema = z.object({
  enhancedPhotoDataUri: z
    .string()
    .describe('The enhanced photo, as a data URI.'),
});
export type MagicEnhanceOutput = z.infer<typeof MagicEnhanceOutputSchema>;

export async function magicEnhance(input: MagicEnhanceInput): Promise<MagicEnhanceOutput> {
  return magicEnhanceFlow(input);
}

const magicEnhancePrompt = ai.definePrompt({
  name: 'magicEnhancePrompt',
  input: {schema: MagicEnhanceInputSchema},
  output: {schema: MagicEnhanceOutputSchema},
  prompt: `Enhance the following photo to make it more appealing for sharing on social media. Focus on improving clarity, color, and overall visual appeal. Return the enhanced photo as a data URI.

Photo: {{media url=photoDataUri}}
`,
});

const magicEnhanceFlow = ai.defineFlow(
  {
    name: 'magicEnhanceFlow',
    inputSchema: MagicEnhanceInputSchema,
    outputSchema: MagicEnhanceOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
        // IMPORTANT: ONLY the googleai/gemini-2.0-flash-preview-image-generation model is able to generate images.
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: [
          {media: {url: input.photoDataUri}},
          {text: 'Enhance this photo for social media sharing'},
        ],
        config: {
          responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE, IMAGE only won't work
        },
      });

    return { enhancedPhotoDataUri: media.url! };
  }
);
