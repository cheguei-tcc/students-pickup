type Config = {
  nodeEnv: string;
  logLevel: string;
  port: string;
  queueUrl: string;
  awsRegion: string;
};

const configFromEnv = (): Config => ({
  nodeEnv: process.env.NODE_ENV || 'local',
  logLevel: process.env.LOG_LEVEL || 'info',
  port: process.env.PORT || '3000',
  queueUrl: process.env.STUDENTS_PICKUP_QUEUE_URL || 'sqs-local',
  awsRegion: process.env.AWS_DEFAULT_REGION || 'sa-east-1'
});

export { Config, configFromEnv };
