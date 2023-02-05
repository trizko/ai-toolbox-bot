import axios from 'axios';
import { SlashCommandBuilder } from 'discord.js';
import config from '../config.json' assert { type: 'json' };
import { open } from 'fs/promises';

export default {
	data: new SlashCommandBuilder()
		.setName('ask')
		.setDescription('Prompt the OpenAI LLM for completions')
		.addStringOption((option) =>
			option.setName('prompt').setDescription('The prompt to send')
		),
	async execute(interaction) {
		const contextFileName = `${interaction.user.username}-${interaction.user.discriminator}.log`;
		const contextFile = await open(contextFileName, 'a+');
		let buf = await contextFile.read();
		if (buf.bytesRead === 0) {
			contextFile.write(
				"The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly. The assistant always formats all programming question responses in Markdown format:\n\n"
			);
			buf = await contextFile.read();
		}
		
		const preprompt = buf.buffer
			.subarray(0, buf.bytesRead)
			.toString('utf-8');
		const prompt = interaction.options.getString('prompt');

		const headers = {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${config.OPENAI_API_KEY}`
		};

		const data = {
			model: 'text-davinci-003',
			prompt: preprompt + prompt,
			temperature: 0.5,
			max_tokens: 500,
			top_p: 1,
			frequency_penalty: 0.0,
			presence_penalty: 0.0,
			echo: false
		};

		interaction.reply('Working on it...');
		await axios({
			method: 'post',
			url: 'https://api.openai.com/v1/completions',
			data: data,
			headers: headers
		})
			.then(async (response) => {
				const generatedText = response.data.choices[0].text;
				interaction.editReply(prompt + generatedText);
				await contextFile.write(prompt + generatedText + '\n\n');
				await contextFile.close();
			})
			.catch((error) => {
				console.error(error);
				interaction.editReply(
					'An error occurred while communicating with the GPT-3 API. Please try again later.'
				);
			});
	}
};
