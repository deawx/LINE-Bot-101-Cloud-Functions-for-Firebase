const functions = require('firebase-functions');
const request = require('request-promise');

const LINE_MESSAGING_API = 'https://api.line.me/v2/bot/message';
const LINE_HEADER = {
	'Content-Type': 'application/json',
	'Authorization': `Bearer xxxxx`
};

exports.LineBotReply = functions.https.onRequest((req, res) => {
	if (req.body.events[0].message.type !== 'text') {
		return;
	}
	reply(req.body);
});

const reply = (bodyResponse) => {
	return request({
		method: `POST`,
		uri: `${LINE_MESSAGING_API}/reply`,
		headers: LINE_HEADER,
		body: JSON.stringify({
			replyToken: bodyResponse.events[0].replyToken,
			messages: [
				{
					type: `text`,
					text: bodyResponse.events[0].message.text
				}
			]
		})
	});
};

exports.LineBotPush = functions.https.onRequest((req, res) => {
	return request({
		method: `GET`,
		uri: `https://api.openweathermap.org/data/2.5/weather?appid=yyyyy&units=metric&type=accurate&zip=10330,th`,
		json: true
	}).then((response) => {
		const message = `City: ${response.name}\nWeather: ${response.weather[0].description}\nTemperature: ${response.main.temp}`;
		return push(res, message);
	}).catch((error) => {
		return res.status(500).send(error);
	});
});

const push = (res, msg) => {
	return request({
		method: `POST`,
		uri: `${LINE_MESSAGING_API}/push`,
		headers: LINE_HEADER,
		body: JSON.stringify({
			to: `U3c28a70ed7c5e7ce2c9a7597632.....`,
			messages: [
				{
					type: `text`,
					text: msg
				}
			]
		})
	}).then(() => {
		return res.status(200).send(`Done`);
	}).catch((error) => {
		return Promise.reject(error);
	});
}

exports.LineBotMulticast = functions.https.onRequest((req, res) => {
	const text = req.query.text;
	if (text !== undefined && text.trim() !== ``) {
		return multicast(res, text);
	} else {
		const ret = { message: 'Text not found' };
		return res.status(400).send(ret);
	}
});

const multicast = (res, msg) => {
	return request({
		method: `POST`,
		uri: `${LINE_MESSAGING_API}/multicast`,
		headers: LINE_HEADER,
		body: JSON.stringify({
			to: [`U3c28a70ed7c5e7ce2c9a7597632.....`, `Ua0e8dd654eeb56790bc0e342bfd.....`],
			messages: [
				{
					type: `text`,
					text: msg
				}
			]
		})
	}).then(() => {
		const ret = { message: 'Done' };
		return res.status(200).send(ret);
	}).catch((error) => {
		const ret = { message: `Sending error: ${error}` };
		return res.status(500).send(ret);
	});
}