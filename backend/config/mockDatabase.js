/**
 * Mock Database Service
 * This provides a simple in-memory database for development without Firebase
 */

// In-memory database store
const store = {
  patients: {},
  doctors: {},
  appointments: {},
  medical_reports: {},
  prescriptions: {},
  payments: {},
  admins: {},
  feedback: {}
};

// Counter for generating IDs
let idCounter = 1;

// Helper function to generate a unique ID
function generateId() {
  return `mock-id-${idCounter++}`;
}

// Helper function to get current timestamp
function timestamp() {
  return new Date().toISOString();
}

// Mock Firestore FieldValue
const FieldValue = {
  serverTimestamp: () => timestamp(),
  delete: () => null
};

// Mock database service
const db = {
  // Collection references (not used in mock, but kept for API compatibility)
  collections: {},

  // Initialize collections
  init() {
    console.log('Mock database initialized');
    return true;
  },

  /**
   * Get a document by ID from a collection
   * @param {string} collection - Collection name
   * @param {string} id - Document ID
   * @returns {Promise<Object>} - Document data
   */
  async getById(collection, id) {
    try {
      const doc = store[collection]?.[id];
      if (!doc) {
        return null;
      }
      return { id, ...doc };
    } catch (error) {
      console.error(`Error getting ${collection} document:`, error);
      throw error;
    }
  },

  /**
   * Get all documents from a collection
   * @param {string} collection - Collection name
   * @returns {Promise<Array>} - Array of documents
   */
  async getAll(collection) {
    try {
      const docs = [];
      const collectionData = store[collection] || {};
      
      for (const id in collectionData) {
        docs.push({ id, ...collectionData[id] });
      }
      
      return docs;
    } catch (error) {
      console.error(`Error getting all ${collection} documents:`, error);
      throw error;
    }
  },

  /**
   * Create a new document in a collection
   * @param {string} collection - Collection name
   * @param {Object} data - Document data
   * @returns {Promise<Object>} - Created document
   */
  async create(collection, data) {
    try {
      if (!store[collection]) {
        store[collection] = {};
      }

      // Add timestamp
      const docData = {
        ...data,
        createdAt: timestamp(),
        updatedAt: timestamp()
      };

      // If ID is provided, use it, otherwise generate one
      const id = data.id || generateId();
      
      // Remove id from the data if it exists
      if (docData.id) {
        const { id: _, ...dataWithoutId } = docData;
        store[collection][id] = dataWithoutId;
      } else {
        store[collection][id] = docData;
      }

      return { id, ...store[collection][id] };
    } catch (error) {
      console.error(`Error creating ${collection} document:`, error);
      throw error;
    }
  },

  /**
   * Update a document in a collection
   * @param {string} collection - Collection name
   * @param {string} id - Document ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} - Updated document
   */
  async update(collection, id, data) {
    try {
      if (!store[collection] || !store[collection][id]) {
        throw new Error(`Document ${id} not found in ${collection}`);
      }

      // Add updated timestamp
      const updateData = {
        ...data,
        updatedAt: timestamp()
      };

      // Update the document
      store[collection][id] = {
        ...store[collection][id],
        ...updateData
      };

      return { id, ...store[collection][id] };
    } catch (error) {
      console.error(`Error updating ${collection} document:`, error);
      throw error;
    }
  },

  /**
   * Delete a document from a collection
   * @param {string} collection - Collection name
   * @param {string} id - Document ID
   * @returns {Promise<boolean>} - Success status
   */
  async delete(collection, id) {
    try {
      if (!store[collection] || !store[collection][id]) {
        throw new Error(`Document ${id} not found in ${collection}`);
      }

      delete store[collection][id];
      return true;
    } catch (error) {
      console.error(`Error deleting ${collection} document:`, error);
      throw error;
    }
  },

  /**
   * Query documents in a collection
   * @param {string} collection - Collection name
   * @param {Array} conditions - Array of query conditions [field, operator, value]
   * @returns {Promise<Array>} - Array of matching documents
   */
  async query(collection, conditions) {
    try {
      if (!store[collection]) {
        return [];
      }

      const docs = [];
      const collectionData = store[collection];

      for (const id in collectionData) {
        const doc = collectionData[id];
        let match = true;

        // Check all conditions
        for (const condition of conditions) {
          const [field, operator, value] = condition;
          
          switch (operator) {
            case '==':
              if (doc[field] !== value) match = false;
              break;
            case '!=':
              if (doc[field] === value) match = false;
              break;
            case '>':
              if (doc[field] <= value) match = false;
              break;
            case '>=':
              if (doc[field] < value) match = false;
              break;
            case '<':
              if (doc[field] >= value) match = false;
              break;
            case '<=':
              if (doc[field] > value) match = false;
              break;
            case 'array-contains':
              if (!Array.isArray(doc[field]) || !doc[field].includes(value)) match = false;
              break;
            default:
              console.warn(`Unsupported operator: ${operator}`);
              match = false;
          }

          if (!match) break;
        }

        if (match) {
          docs.push({ id, ...doc });
        }
      }

      return docs;
    } catch (error) {
      console.error(`Error querying ${collection} documents:`, error);
      throw error;
    }
  }
};

// Add Firebase-like FieldValue for compatibility
db.FieldValue = FieldValue;

// Initialize with some sample data
const initSampleData = async () => {
  // Sample admin
  await db.create('admins', {
    id: 'admin1',
    name: 'Admin User',
    email: 'admin@healthcare.com',
    role: 'admin',
    password: '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1BD7WC' // hashed 'password123'
  });

  // Sample doctors
  await db.create('doctors', {
    id: 'doctor1',
    name: 'Dr. John Smith',
    email: 'john.smith@healthcare.com',
    specialization: 'Cardiologist',
    experience: 10,
    phone: '123-456-7890',
    role: 'doctor',
    password: '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1BD7WC' // hashed 'password123'
  });

  // Sample patients
  await db.create('patients', {
    id: 'patient1',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    age: 35,
    gender: 'Female',
    phone: '987-654-3210',
    address: '123 Main St, Anytown, USA',
    role: 'patient',
    password: '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1BD7WC' // hashed 'password123'
  });

  // Sample appointment
  await db.create('appointments', {
    id: 'appointment1',
    patientId: 'patient1',
    doctorId: 'doctor1',
    date: '2025-04-01T10:00:00.000Z',
    status: 'scheduled',
    reason: 'Annual checkup'
  });

  console.log('Sample data initialized in mock database');
};

// Initialize sample data
initSampleData();

module.exports = db;
