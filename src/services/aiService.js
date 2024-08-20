import neo4j from 'neo4j-driver';
import { AIMLCustomModel } from './aimlCustomModel';

class AIService {
  constructor() {
    this.driver = neo4j.driver(
      process.env.NEO4J_URI,
      neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
    );
    this.aimlModel = new AIMLCustomModel();
  }

  async getPersonalizedRecommendations(userId) {
    const session = this.driver.session();
    try {
      const result = await session.run(
        `
        MATCH (u:User {id: $userId})-[:COMPLETED]->(t:Task)
        WITH u, collect(t) AS completedTasks
        MATCH (u)-[:INTERESTED_IN]->(topic:Topic)
        WITH u, completedTasks, collect(topic) AS interests
        MATCH (t:Task)
        WHERE NOT t IN completedTasks
        AND any(interest IN interests WHERE (t)-[:RELATED_TO]->(interest))
        RETURN t AS task, 
               size([(t)-[:RELATED_TO]->(i) WHERE i IN interests | i]) AS relevanceScore
        ORDER BY relevanceScore DESC
        LIMIT 5
        `,
        { userId }
      );

      return result.records.map(record => ({
        id: record.get('task').properties.id,
        title: record.get('task').properties.title,
        description: record.get('task').properties.description,
        relevanceScore: record.get('relevanceScore').toNumber(),
      }));
    } finally {
      await session.close();
    }
  }

  async submitFeedback(userId, recommendationId, feedback) {
    const session = this.driver.session();
    try {
      await session.run(
        `
        MATCH (u:User {id: $userId}), (r:Recommendation {id: $recommendationId})
        MERGE (u)-[f:FEEDBACK]->(r)
        SET f.feedback = $feedback, f.timestamp = timestamp()
        `,
        { userId, recommendationId, feedback }
      );
    } finally {
      await session.close();
    }
  }

  async getChatResponse(userId, message) {
    const session = this.driver.session();
    try {
      const result = await session.run(
        `
        MATCH (u:User {id: $userId})
        OPTIONAL MATCH (u)-[:COMPLETED]->(t:Task)
        OPTIONAL MATCH (u)-[:INTERESTED_IN]->(topic:Topic)
        RETURN u.name AS name, 
               u.adhdType AS adhdType, 
               collect(DISTINCT t.title) AS completedTasks,
               collect(DISTINCT topic.name) AS interests
        `,
        { userId }
      );

      const userContext = result.records[0].toObject();
      const response = await this.aimlModel.generateResponse(message, userContext);
      return response;
    } finally {
      await session.close();
    }
  }
}

export default new AIService();