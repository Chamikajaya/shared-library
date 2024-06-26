// * Logger setup allows for flexible logging - messages will be output to the console for immediate visibility and sent to Elasticsearch for long-term storage and analysis. Since our project is distributed across multiple services, we can store the logs in ElasticSearch and monitor using Kibana in an efficient manner. 😊

import winston, { Logger } from 'winston';
import {
  ElasticsearchTransformer,
  ElasticsearchTransport,
  LogData,
  TransformedData,
} from 'winston-elasticsearch';

// Custom transformer function to format log data for Elasticsearch
const esTransformer = (logData: LogData): TransformedData => {
  return ElasticsearchTransformer(logData);
};

// Main function to create and configure the Winston logger
export const winstonLogger = (
  elasticsearchNode: string, // url of the Elasticsearch node
  name: string, // name of the service
  level: string // log level (refer npm package winston for more info on log levels)
): Logger => {
  // Configuration options for different transports
  const options = {
    // for displaying logs in the console
    console: {
      level,
      handleExceptions: true,
      json: false,
      colorize: true,
    },

    // for storing logs in Elasticsearch
    elasticsearch: {
      level,
      transformer: esTransformer,
      clientOpts: {
        node: elasticsearchNode,
        log: level,
        maxRetries: 2,
        requestTimeout: 10000,
        sniffOnStart: false,
      },
    },
  };

  // Create Elasticsearch transport
  const esTransport: ElasticsearchTransport = new ElasticsearchTransport(
    options.elasticsearch
  );

  // Create and configure the Winston logger
  const logger: Logger = winston.createLogger({
    exitOnError: false,
    defaultMeta: { service: name },
    transports: [
      new winston.transports.Console(options.console), // Console transport
      esTransport, // Elasticsearch transport
    ],
  });

  return logger;
};
