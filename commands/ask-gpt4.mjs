import axios from 'axios';
import { SlashCommandBuilder } from 'discord.js';
import config from '../config.json' assert { type: 'json' };

const MODEL_ENGINE = 'gpt-4';
const PREPROMPT =
	'As an advanced chatbot, your primary goal is to assist users to the best of your ability. This may involve answering questions, providing helpful information, or completing tasks based on user input. In order to effectively assist users, it is important to be concise in your responses. All your responses should be formatted in Markdown.';
let MESSAGES_DB = {};

function splitLongString(str, splitKey, chunkSize) {
	const lastNewlineIndex = str.lastIndexOf(splitKey, chunkSize);
	const chunks = [];

	if (lastNewlineIndex !== -1) {
		chunks.push(str.slice(0, lastNewlineIndex));
		str = str.slice(lastNewlineIndex + splitKey.length);
	}

	while (str.length > chunkSize) {
		const nextNewlineIndex = str.indexOf(splitKey, chunkSize);
		if (nextNewlineIndex === -1) break;
		chunks.push(str.slice(0, nextNewlineIndex));
		str = str.slice(nextNewlineIndex + splitKey.length);
	}

	chunks.push(str);

	return chunks;
}

export default {
	data: new SlashCommandBuilder()
		.setName('ask-gpt4')
		.setDescription('Prompt the GPT-4 LLM for completions')
		.addStringOption((option) =>
			option.setName('prompt').setDescription('The prompt to send')
		),
	async execute(interaction) {
		interaction.deferReply();

		const username = `${interaction.user.username}-${interaction.user.discriminator}`;
		const userPrompt = interaction.options.getString('prompt');
		const message = {
			role: 'user',
			content: userPrompt
		};
		if (!(username in MESSAGES_DB)) {
			MESSAGES_DB[username] = [
				{
					role: 'system',
					content: PREPROMPT
				}
			];
		}
		MESSAGES_DB[username].push(message);
		console.log(MESSAGES_DB);

		const headers = {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${config.OPENAI_API_KEY}`
		};

		const data = {
			model: MODEL_ENGINE,
			messages: MESSAGES_DB[username],
			temperature: 0.5,
			max_tokens: 4000,
			top_p: 1,
			frequency_penalty: 0.0,
			presence_penalty: 0.0
		};

		await axios({
			method: 'post',
			url: 'https://api.openai.com/v1/chat/completions',
			data: data,
			headers: headers
		})
			.then(async (response) => {
				console.log(JSON.stringify(response.data));
				const generatedText =
					response.data.choices[0].message.content.trim();
				const replyMessage = `Q: ${userPrompt}\n---\nA: ${generatedText}`;
				const chunks = splitLongString(replyMessage, '\n\n', 2000);
				for (const [index, chunk] of chunks.entries()) {
					if (index === 0) {
						interaction.editReply(chunk);
					} else {
						await new Promise((r) => setTimeout(r, 1000));
						interaction.followUp(chunk);
					}
				}
				MESSAGES_DB[username].push({
					role: 'assistant',
					content: generatedText
				});
			})
			.catch((error) => {
				console.error(JSON.stringify(error));
				interaction.editReply(
					'An error occurred while communicating with the GPT-4 API. Please try again later.'
				);
			});
	}
};
