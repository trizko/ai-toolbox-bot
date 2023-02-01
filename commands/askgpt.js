import axios from 'axios';
import { SlashCommandBuilder } from 'discord.js';
import { OPENAI_API_KEY } from '../config.json';
import { readFile, writeFile, appendFile } from 'fs/promises';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('askgpt')
		.setDescription('Prompt ChatGPT for answers through the OpenAI API')
		.addBooleanOption((option) =>
			option
				.setName('keepcontext')
				.setDescription('keep context from past conversation')
		)
		.addStringOption((option) =>
			option
				.setName('prompt')
				.setDescription('The prompt to send to ChatGPT')
		),
	async execute(interaction) {
		const headers = {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${OPENAI_API_KEY}`
		};
		let preprompt_buf, preprompt;
		if (interaction.options.getBoolean('keepcontext')) {
			preprompt_buf = await readFile('log.txt');
		} else {
			await writeFile('log.txt', '');
			preprompt_buf = '';
			preprompt = '';
		}
		preprompt = preprompt_buf.toString('utf-8');
		const data = {
			model: 'text-davinci-003',
			prompt: preprompt + interaction.options.getString('prompt'),
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
			.then((response) => {
				const generatedText = response.data.choices[0].text;
				interaction.editReply(
					interaction.options.getString('prompt') + generatedText
				);
				appendFile('log.txt', generatedText + '\n\n');
			})
			.catch((error) => {
				console.error(error);
				interaction.editReply(
					'An error occurred while communicating with the GPT-3 API. Please try again later.'
				);
			});
	}
};
