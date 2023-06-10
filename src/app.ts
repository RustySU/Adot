import Koa, {Context} from 'koa';
import bodyParser from 'koa-bodyparser';
import csv from 'csv-parser';
import fs from 'fs';
import {kdTree} from 'kd-tree-javascript';
import Router from 'koa-router';

import config from './config';

const eventsFilePath  = config.eventsFilePath;

interface PointOfInterest {
  lat: number;
  lon: number;
  name: string;
}

interface Event {
  lat: number;
  lon: number;
  eventType: string;
}

interface Event_data {
  lat: string;
  lon: string;
  event_type: string;
}

const router = new Router();
const app = new Koa();



// Route for adding points of interest and processing events
router.post('/points_of_interest', async (ctx: Context) => {
  
  const pointsOfInterest =  <[PointOfInterest]> ctx.request.body;

  // Bulk load the points of interest into the RBush tree
  const tree = new kdTree(pointsOfInterest, distanceFunc, ['lat', 'lon']);

  let results: Record<string, string|number> = {};
  // ctx.body = 'Done';
  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(eventsFilePath)
      .pipe(csv())
      .on('data', (data) => {
        const event = parseEvent(data);
        processEvent(tree, event, results);
      })
      .on('end', () => {
        resolve();
      })
      .on('error', (error) => {
        reject(error);
      });
  });

  ctx.body = results;
});

// Function to parse an event from CSV data
function parseEvent(data: Event_data): Event {
  const { lat, lon, event_type } = data;

  return {
    lat: parseFloat(lat),
    lon: parseFloat(lon),
    eventType: event_type,
  };
}

// Function to process an event and associate it with the nearest point of interest
function processEvent(tree: any, event: Event, results: Record<string, any>) {
  const { lat, lon, eventType } = event;

  const nearestPointOfInterest = tree.nearest({ lat, lon }, 1)[0][0];
  if (nearestPointOfInterest) {
    const eventName = <string>nearestPointOfInterest.name;

    if (!results[eventName]) {
      results[eventName] = {
        lat: <number>nearestPointOfInterest.lat,
        lon: <number>nearestPointOfInterest.lon,
        name: <string>eventName,
        impressions: 0,
        clicks: 0,
      };
    }

    if (eventType === 'imp') {
      results[eventName].impressions += 1;
    } else if (eventType === 'click') {
      results[eventName].clicks += 1;
    }
  }
}

// Function to calculate the distance between two points
function distanceFunc(point1: PointOfInterest, point2: PointOfInterest): number {
  const lat1 = point1.lat;
  const lon1 = point1.lon;
  const lat2 = point2.lat;
  const lon2 = point2.lon;

  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}


app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

// Start the server
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});

export default app;