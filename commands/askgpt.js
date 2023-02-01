import axios from 'axios';
import { SlashCommandBuilder } from 'discord.js';
import { OPENAI_API_KEY } from '../config.json';
import { open } from 'fs/promises';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('askgpt')
		.setDescription('Prompt ChatGPT for answers through the OpenAI API')
		.addStringOption(option =>
			option.setName('prompt')
				.setDescription('The prompt to send to ChatGPT')),
	async execute(interaction) {
		const headers = {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${OPENAI_API_KEY}`
		};

		const contextFileName = `${interaction.user.username}-${interaction.user.discriminator}.log`;
		const contextFile = await open(contextFileName, 'a+');
		let buf = await contextFile.read();
		if (buf.bytesRead === 0) {
			contextFile.write("This is a conversation with an AI that formats all it's responses in Markdown.\n\n")
			buf = await contextFile.read()
		}
		const preprompt = buf.buffer.subarray(0, buf.bytesRead).toString('utf-8');
		const prompt = interaction.options.getString("prompt");

		const data = {
			model: 'text-davinci-003',
			prompt: (preprompt + prompt),
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
		.then(async response => {
			const generatedText = response.data.choices[0].text;
			interaction.editReply(prompt + generatedText);
			await contextFile.write(prompt + generatedText + '\n\n');
			await contextFile.close();
		})
		.catch(error => {
			console.error(error);
			interaction.editReply("An error occurred while communicating with the GPT-3 API. Please try again later.");
		});
	},
};
