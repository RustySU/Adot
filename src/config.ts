interface Config {
  eventsFilePath: string;
}

const config: Config = {
  eventsFilePath: process.env.NODE_ENV === 'test' ? 'test_events.csv' : 'events.csv',
};

export default config;