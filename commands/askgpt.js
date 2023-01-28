const axios = require("axios");
const { SlashCommandBuilder } = require('discord.js');
const { OPENAI_API_KEY } = require('../config.json');

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
			'Authorization': `Bearer ${OPENAI_API_KEY}`,
		};
		
		const data = {
			model: 'text-davinci-003',
			prompt: interaction.options.getString('prompt'),
			temperature: 0.5,
			max_tokens: 500,
			top_p: 1,
			frequency_penalty: 0.0,
			presence_penalty: 0.0,
			echo: true
		};

		interaction.reply("Working on it...")
		await axios({
			method: 'post',
			url: 'https://api.openai.com/v1/completions',
			data: data,
			headers: headers
		})
		.then(response => {
			const generatedText = response.data.choices[0].text;
			interaction.editReply(generatedText);
		})
		.catch(error => {
			console.error(error);
			interaction.reply("An error occurred while communicating with the GPT-3 API. Please try again later.");
		});
	},
};