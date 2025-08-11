const natural = require('natural');
const compromise = require('compromise');
const sentiment = require('sentiment');

class NLPTaskAnalyzer {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
  }

  analyzeTaskComplexity(description) {
    const doc = compromise(description);
    const words = this.tokenizer.tokenize(description.toLowerCase());
    const sent = sentiment(description);

    let complexityScore = 0;
    let keywords = [];
    let estimatedTime = 0; // in hours

    // Keyword-based complexity
    if (words.includes('complex') || words.includes('advanced') || words.includes('sophisticated')) {
      complexityScore += 3;
    }
    if (words.includes('simple') || words.includes('basic') || words.includes('easy')) {
      complexityScore -= 1;
    }

    // Length-based complexity
    if (words.length > 20) {
      complexityScore += 1;
    }
    if (words.length > 50) {
      complexityScore += 2;
    }

    // Sentiment-based adjustment (e.g., negative sentiment might indicate hidden complexity)
    if (sent.score < 0) {
      complexityScore += 1;
    }

    // Extract keywords (nouns and verbs)
    doc.match('#Noun').forEach(noun => keywords.push(noun.text()));
    doc.match('#Verb').forEach(verb => keywords.push(verb.text()));
    keywords = [...new Set(keywords)]; // Unique keywords

    // Estimate time based on complexity (very rough heuristic)
    if (complexityScore <= 0) estimatedTime = 2;
    else if (complexityScore === 1) estimatedTime = 4;
    else if (complexityScore === 2) estimatedTime = 8;
    else if (complexityScore >= 3) estimatedTime = 16;

    let complexity = 'simple';
    if (complexityScore >= 2) complexity = 'medium';
    if (complexityScore >= 4) complexity = 'complex';

    return { complexity, keywords, estimatedTime };
  }

  extractRequirements(description) {
    const doc = compromise(description);
    let technologies = [];
    let patterns = [];
    let constraints = [];

    // Identify technologies (simple keyword matching for now)
    if (description.toLowerCase().includes('react')) technologies.push('React');
    if (description.toLowerCase().includes('node.js')) technologies.push('Node.js');
    if (description.toLowerCase().includes('python')) technologies.push('Python');
    if (description.toLowerCase().includes('fastapi')) technologies.push('FastAPI');
    if (description.toLowerCase().includes('authentication')) technologies.push('Authentication');
    if (description.toLowerCase().includes('real-time chat')) technologies.push('Real-time Chat');
    if (description.toLowerCase().includes('database')) technologies.push('Database');
    if (description.toLowerCase().includes('sql')) technologies.push('SQL');
    if (description.toLowerCase().includes('nosql')) technologies.push('NoSQL');
    if (description.toLowerCase().includes('api')) technologies.push('API');
    if (description.toLowerCase().includes('3d')) technologies.push('3D Visualization');
    if (description.toLowerCase().includes('nlp')) technologies.push('NLP');
    if (description.toLowerCase().includes('ml')) technologies.push('ML');

    // Identify patterns (e.g., "microservices", "serverless")
    if (description.toLowerCase().includes('microservices')) patterns.push('Microservices');
    if (description.toLowerCase().includes('serverless')) patterns.push('Serverless');
    if (description.toLowerCase().includes('mvc')) patterns.push('MVC');

    // Identify constraints (e.g., "secure", "performant", "scalable")
    if (description.toLowerCase().includes('secure')) constraints.push('Security');
    if (description.toLowerCase().includes('performant')) constraints.push('Performance');
    if (description.toLowerCase().includes('scalable')) constraints.push('Scalability');
    if (description.toLowerCase().includes('real-time')) constraints.push('Real-time');

    return { technologies, patterns, constraints };
  }
}

module.exports = NLPTaskAnalyzer;
