/**
 * API Service for Backend Communication
 *
 * Handles HTTP requests to the NLP Social Simulation backend
 */

const API_BASE_URL = 'http://localhost:8000';

/**
 * Start simulation with thread data and personas
 *
 * @param {string} clientId - Client ID from WebSocket
 * @param {Array} threadData - Thread data array
 * @param {Array} personas - Personas array
 * @param {number} delay - Delay between agent calls (default: 1.5)
 * @returns {Promise<Object>} - Response data
 */
export async function startSimulation(clientId, threadData, personas, delay = 1.5) {
  try {
    console.log('[API] Sending simulation request...');
    console.log('[API] Endpoint:', `${API_BASE_URL}/api/simulate`);
    console.log('[API] Client ID:', clientId);
    console.log('[API] Thread data count:', threadData.length);
    console.log('[API] Personas count:', personas.length);

    const response = await fetch(`${API_BASE_URL}/api/simulate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        thread_data: threadData,
        personas: personas,
        delay: delay
      })
    });

    console.log('[API] Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[API] Error response:', errorData);
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('[API] Simulation started successfully:', data);
    return data;
  } catch (error) {
    console.error('[API] Failed to start simulation:', error);
    console.error('[API] Error message:', error.message);
    throw error;
  }
}

/**
 * Generate personas from thread data
 *
 * @param {Array} threadData - Thread data array
 * @param {number} minComments - Minimum comments per user (default: 3)
 * @param {number} maxUsers - Maximum users to process (optional)
 * @returns {Promise<Object>} - Response data
 */
export async function generatePersonas(threadData, minComments = 3, maxUsers = null) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/generate-personas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        thread_data: threadData,
        min_comments: minComments,
        max_users: maxUsers
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to generate personas:', error);
    throw error;
  }
}

/**
 * Run full pipeline (persona generation + simulation)
 *
 * @param {Array} threadData - Thread data array
 * @param {number} minComments - Minimum comments per user (default: 3)
 * @param {number} maxUsers - Maximum users to process (optional)
 * @param {number} agentDelay - Delay between agent calls (default: 1.5)
 * @returns {Promise<Object>} - Response data
 */
export async function runFullPipeline(threadData, minComments = 3, maxUsers = null, agentDelay = 1.5) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/run-pipeline`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        thread_data: threadData,
        min_comments: minComments,
        max_users: maxUsers,
        agent_delay: agentDelay
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to run full pipeline:', error);
    throw error;
  }
}

/**
 * Create user persona from a reply to the original post
 *
 * @param {string} clientId - Client ID from WebSocket
 * @param {string} userName - User's name
 * @param {string} userReply - User's reply text
 * @param {Object} originalPost - Original post object
 * @param {Array} existingPersonas - Existing personas for username uniqueness
 * @param {Array} existingReplies - Existing replies for timestamp calculation
 * @returns {Promise<Object>} - Response with persona, reply, and username
 */
export async function createUserPersona(clientId, userName, userReply, originalPost, existingPersonas = [], existingReplies = []) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/create-user-persona`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        user_name: userName,
        user_reply: userReply,
        original_post: originalPost,
        existing_personas: existingPersonas,
        existing_replies: existingReplies
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to create user persona:', error);
    throw error;
  }
}

/**
 * Check backend health status
 *
 * @returns {Promise<Object>} - Health status
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
}

/**
 * Get API root info
 *
 * @returns {Promise<Object>} - API info
 */
export async function getApiInfo() {
  try {
    const response = await fetch(`${API_BASE_URL}/`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to get API info:', error);
    throw error;
  }
}
