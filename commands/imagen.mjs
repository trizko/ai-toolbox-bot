import axios from 'axios';
import { SlashCommandBuilder } from 'discord.js';
import config from '../config.json' assert { type: 'json' };

export default {
	data: new SlashCommandBuilder()
		.setName('imagen')
		.setDescription('Prompt OpenAI API for text -> image generation')
		.addStringOption((option) =>
			option
				.setName('prompt')
				.setDescription('The prompt for image generation')
		),
	async execute(interaction) {
		const prompt = interaction.options.getString('prompt');
		
		const headers = {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${config.OPENAI_API_KEY}`
		};

		const data = {
			prompt: prompt,
			n: 1,
			size: '1024x1024',
			response_format: 'url'
		};

		interaction.reply(`Generating image from prompt: \`${prompt}\``);
		await axios({
			method: 'post',
			url: 'https://api.openai.com/v1/images/generations',
			data: data,
			headers: headers
		})
			.then(async (response) => {
				const image = response.data.data[0].url;
				interaction.editReply(image);
			})
			.catch((error) => {
				console.error(error);
				interaction.editReply(
					'An error occurred while communicating with the GPT-3 API. Please try again later.'
				);
			});
	}
};
