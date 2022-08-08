type Config = {
  nodeEnv: string;
  logLevel: string;
  port: string;
  queue: string;
};

const configFromEnv = (): Config => ({
  nodeEnv: process.env.NODE_ENV || 'local',
  logLevel: process.env.LOG_LEVEL || 'info',
  port: process.env.PORT || '3000',
  queue: process.env.QUEUE || 'sqs-local'
});

export { Config, configFromEnv };
