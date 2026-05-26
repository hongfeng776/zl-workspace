import { Router } from 'express';
import {
  getCurrentWeather,
  getHourlyForecast,
  getDailyForecast,
  getAirQuality,
  getLifeIndices,
  getHistoryWeather,
} from '../controllers/weatherController';

const router = Router();

router.get('/current', getCurrentWeather);
router.get('/hourly', getHourlyForecast);
router.get('/daily', getDailyForecast);
router.get('/air', getAirQuality);
router.get('/life', getLifeIndices);
router.get('/history', getHistoryWeather);

export { router as weatherRoutes };
