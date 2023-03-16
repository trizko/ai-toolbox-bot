import axios from 'axios';
import { SlashCommandBuilder } from 'discord.js';
import config from '../config.json' assert { type: 'json' };
import { open } from 'fs/promises';

const MODEL_ENGINE = 'text-davinci-003';
const PREPROMPT = `As an advanced chatbot, your primary goal is to assist users to the best of your ability. This may involve answering questions, providing helpful information, or completing tasks based on user input. In order to effectively assist users, it is important to be detailed and thorough in your responses. Use examples and evidence to support your points and justify your recommendations or solutions. All your responses should be formatted in Markdown.

<context>

User: <user_prompt>
Chatbot: `;

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
		const context = buf.buffer.subarray(0, buf.bytesRead).toString('utf-8');
		const userPrompt = interaction.options.getString('prompt');
		const prompt = PREPROMPT.replace('<context>', context).replace(
			'<user_prompt>',
			userPrompt
		);

		const headers = {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${config.OPENAI_API_KEY}`
		};

		const data = {
			model: MODEL_ENGINE,
			prompt: prompt,
			temperature: 0.5,
			max_tokens: 2048,
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
				const generatedText = response.data.choices[0].text.trim();
				interaction.editReply(
					`Q: ${userPrompt}\n---\nA: ${generatedText}`
				);
				await contextFile.write(
					`User: ${userPrompt}\nChatbot: ${generatedText}`
				);
				await contextFile.close();
			})
			.catch((error) => {
				console.error(JSON.stringify(error.response.data));
				interaction.editReply(
					'An error occurred while communicating with the GPT-3 API. Please try again later.'
				);
			});
	}
};
