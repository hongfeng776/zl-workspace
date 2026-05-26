import { Request, Response } from 'express';
import * as weatherService from '../services/weatherService';

export const getCurrentWeather = (req: Request, res: Response) => {
  const { city = '北京市', province = '北京市' } = req.query;
  const data = weatherService.getCurrentWeather(city as string, province as string);
  res.json({ code: 0, message: 'success', data });
};

export const getHourlyForecast = (req: Request, res: Response) => {
  const data = weatherService.getHourlyForecast();
  res.json({ code: 0, message: 'success', data });
};

export const getDailyForecast = (req: Request, res: Response) => {
  const data = weatherService.getDailyForecast();
  res.json({ code: 0, message: 'success', data });
};

export const getAirQuality = (req: Request, res: Response) => {
  const data = weatherService.getAirQuality();
  res.json({ code: 0, message: 'success', data });
};

export const getLifeIndices = (req: Request, res: Response) => {
  const data = weatherService.getLifeIndices();
  res.json({ code: 0, message: 'success', data });
};

export const getHistoryWeather = (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    res.status(400).json({ code: 1, message: '缺少必填参数: startDate, endDate' });
    return;
  }

  const start = new Date(startDate as string);
  const end = new Date(endDate as string);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    res.status(400).json({ code: 1, message: '日期格式无效，请使用 YYYY-MM-DD' });
    return;
  }

  if (end < start) {
    res.status(400).json({ code: 1, message: '结束日期不能早于开始日期' });
    return;
  }

  const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  if (daysDiff > 365) {
    res.status(400).json({ code: 1, message: '查询范围不能超过365天' });
    return;
  }

  const data = weatherService.getHistoryWeather(startDate as string, endDate as string);
  res.json({ code: 0, message: 'success', data });
};
