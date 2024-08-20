import neo4j from 'neo4j-driver';
import { AIMLCustomModel } from './aimlCustomModel';
import { encrypt, decrypt } from './encryption';

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
      const result = await session.readTransaction(async (tx) => {
        const query = `
          MATCH (u:User {id: $userId})
          OPTIONAL MATCH (u)-[:COMPLETED]->(t:Task)
          WITH u, collect(t) AS completedTasks
          OPTIONAL MATCH (u)-[:INTERESTED_IN]->(topic:Topic)
          WITH u, completedTasks, collect(topic) AS interests
          MATCH (t:Task)
          WHERE NOT t IN completedTasks
          AND (
            any(interest IN interests WHERE (t)-[:RELATED_TO]->(interest))
            OR t.adhdType = u.adhdType
          )
          RETURN t AS task, 
                 size([(t)-[:RELATED_TO]->(i) WHERE i IN interests | i]) AS relevanceScore,
                 t.adhdType = u.adhdType AS matchesAdhdType
          ORDER BY matchesAdhdType DESC, relevanceScore DESC
          LIMIT 5
        `;
        return await tx.run(query, { userId });
      });

      return result.records.map(record => ({
        id: record.get('task').properties.id,
        title: encrypt(record.get('task').properties.title),
        description: encrypt(record.get('task').properties.description),
        relevanceScore: record.get('relevanceScore').toNumber(),
        matchesAdhdType: record.get('matchesAdhdType'),
      }));
    } catch (error) {
      console.error('Error fetching personalized recommendations:', error);
      throw new Error('Failed to fetch personalized recommendations');
    } finally {
      await session.close();
    }
  }

  async submitFeedback(userId, recommendationId, feedback) {
    const session = this.driver.session();
    try {
      await session.writeTransaction(async (tx) => {
        const query = `
          MATCH (u:User {id: $userId}), (r:Recommendation {id: $recommendationId})
          MERGE (u)-[f:FEEDBACK]->(r)
          SET f.feedback = $feedback, f.timestamp = timestamp()
        `;
        await tx.run(query, { userId, recommendationId, feedback: encrypt(feedback) });
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw new Error('Failed to submit feedback');
    } finally {
      await session.close();
    }
  }

  async getChatResponse(userId, message) {
    const session = this.driver.session();
    try {
      const result = await session.readTransaction(async (tx) => {
        const query = `
          MATCH (u:User {id: $userId})
          OPTIONAL MATCH (u)-[:COMPLETED]->(t:Task)
          OPTIONAL MATCH (u)-[:INTERESTED_IN]->(topic:Topic)
          RETURN u.name AS name, 
                 u.adhdType AS adhdType, 
                 collect(DISTINCT t.title) AS completedTasks,
                 collect(DISTINCT topic.name) AS interests
        `;
        return await tx.run(query, { userId });
      });

      const userContext = result.records[0].toObject();
      userContext.completedTasks = userContext.completedTasks.map(decrypt);
      userContext.interests = userContext.interests.map(decrypt);

      const response = await this.aimlModel.generateResponse(message, userContext);
      return encrypt(response);
    } catch (error) {
      console.error('Error generating chat response:', error);
      throw new Error('Failed to generate chat response');
    } finally {
      await session.close();
    }
  }
}

export default new AIService();