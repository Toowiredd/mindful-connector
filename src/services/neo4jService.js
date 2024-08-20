import { neo4jService } from './api';

export const runNeo4jQuery = async (query, params = {}) => {
  try {
    const response = await neo4jService.runQuery(query, params);
    return response.data;
  } catch (error) {
    console.error('Error running Neo4j query:', error);
    throw error;
  }
};

export const testNeo4jConnection = async () => {
  const query = 'RETURN 1 AS result';
  try {
    const result = await runNeo4jQuery(query);
    console.log('Neo4j connection successful:', result);
    return true;
  } catch (error) {
    console.error('Neo4j connection failed:', error);
    return false;
  }
};