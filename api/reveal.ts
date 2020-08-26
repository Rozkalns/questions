import { NowRequest, NowResponse } from '@vercel/node'
const bcrypt = require('bcrypt');
const saltRounds = 10;

const passwords = [
  '$2b$10$rZxoUJO5hdJZWpWxBsNUi.yPLqFdIH9UqhoM6CIs.VGrH0719M4Ii'
];

const url = 'https://docs.google.com/spreadsheets/u/0/d/1MoIPzmAg8Lj16iqd_e8zgNXCpnaR4EYJCuzxWq_RdjQ/template/preview';

export default async (req: NowRequest, res: NowResponse) => {
  const { body } = req;
  if (!body.try) {
    res.json({ status: 400 });
    return;
  }

  const isOk = await new Promise((resolve, reject) => {
    bcrypt.compare(body.try, passwords[0], function(err, res) {
      if (err) reject(err)
      resolve(res)
    });
  })

  if (!isOk) {
    res.json({ status: 422 });
    return;
  }

  res.json({
      status: 200,
      url
  });
}
