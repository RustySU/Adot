import request from 'supertest';
import fs from 'fs';
import app from './app';
import config from './config'

const eventsFilePath  = config.eventsFilePath;

describe('POST /points_of_interest', () => {
  // Mock the events.csv file
  beforeAll(async () => {
    const eventsData = `lat,lon,event_type
48.82094216189432,2.4049238868200975,imp
48.816341825787724,2.3645320381923534,imp
48.86982967859056,2.3274838513968072,imp
48.89111120713999,2.23284629237154,imp
48.89111120713999,2.23284629237154,click
48.85038737901075,2.4204737962258305,imp
48.86339618816508,2.4214870126092594,imp
48.876530301936576,2.4144620076022436,imp
48.88845096504584,2.2470618097659285,imp`;
    fs.writeFileSync(eventsFilePath, eventsData);
  });

  // Remove the mock test_events.csv file
  afterAll(() => {
    fs.unlinkSync(eventsFilePath);
  });

  it('should return aggregated impression and click data for each point of interest', async () => {
    const pointsOfInterest = [
      {
        lat: 48.86,
        lon: 2.35,
        name: 'Chatelet',
      },
      {
        lat: 48.8759992,
        lon: 2.3481253,
        name: 'Arc de triomphe',
      },
    ];

    const expectedResponse = {
      "Chatelet": {
        lat: 48.86,
        lon: 2.35,
        name: 'Chatelet',
        impressions: 4,
        clicks: 0,
      },
      'Arc de triomphe': {
        lat: 48.8759992,
        lon: 2.3481253,
        name: 'Arc de triomphe',
        impressions: 4,
        clicks: 1,
      },
    };
    app.callback()
    const response = await request(app.callback()).post('/points_of_interest').send(pointsOfInterest);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(expectedResponse);
  });
});
