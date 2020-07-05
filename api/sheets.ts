import fetch from 'node-fetch';
import { NowRequest, NowResponse } from '@vercel/node'

const doc = '1C8wqEI2iXL50fE3CwU5VDS_FZbvOeFy8UwQuhKD7jaQ';

const SHEET = (range: string): string =>
  `https://sheets.googleapis.com/v4/spreadsheets/${doc}/values/${range}?valueRenderOption=UNFORMATTED_VALUE&majorDimension=COLUMNS&key=${process.env.SHEETS_API}`

const getRange = async (range?: string): Promise<any> => {
  try {
    const response = await fetch(SHEET(range), {});
    const json = await response.json();
    return json;
  } catch (error) {
    console.log(error);
  }
}

export default async (req: NowRequest, res: NowResponse) => {
  if (Array.isArray(req.query.range) || !req.query.range) {
    res.json({ status: 400 });
    return;
  }

  const data = await getRange(req.query.range);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

  res.json(data.values[0]);
}