const admin = require('firebase-admin');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Use mock database if in mock mode
if (process.env.MOCK_FIREBASE === 'true') {
  console.log('Using mock database instead of Firebase');
  module.exports = require('./mockDatabase');
} else {
  /**
   * Firebase Database utility functions
   */
  const db = {
    // Collection references
    collections: {},

    // Initialize collections if Firebase is available
    init() {
      if (admin.apps.length === 0) {
        console.warn('Firebase not initialized. Database operations will fail.');
        return false;
      }

      try {
        this.collections = {
          patients: admin.firestore().collection('patients'),
          doctors: admin.firestore().collection('doctors'),
          appointments: admin.firestore().collection('appointments'),
          medicalReports: admin.firestore().collection('medical_reports'),
          prescriptions: admin.firestore().collection('prescriptions'),
          payments: admin.firestore().collection('payments'),
          admins: admin.firestore().collection('admins'),
          feedback: admin.firestore().collection('feedback')
        };
        return true;
      } catch (error) {
        console.error('Error initializing Firestore collections:', error);
        return false;
      }
    },
    
    /**
     * Get a document by ID from a collection
     * @param {string} collection - Collection name
     * @param {string} id - Document ID
     * @returns {Promise<Object>} - Document data
     */
    async getById(collection, id) {
      if (!this.collections[collection]) {
        if (!this.init()) {
          throw new Error('Firebase not initialized');
        }
      }

      try {
        const doc = await this.collections[collection].doc(id).get();
        if (!doc.exists) {
          return null;
        }
        return { id: doc.id, ...doc.data() };
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
      if (!this.collections[collection]) {
        if (!this.init()) {
          throw new Error('Firebase not initialized');
        }
      }

      try {
        const snapshot = await this.collections[collection].get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
      if (!this.collections[collection]) {
        if (!this.init()) {
          throw new Error('Firebase not initialized');
        }
      }

      try {
        // Add timestamp
        const docData = {
          ...data,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        // If ID is provided, use it, otherwise let Firestore generate one
        if (data.id) {
          const { id, ...dataWithoutId } = docData;
          await this.collections[collection].doc(id).set(dataWithoutId);
          return { id, ...dataWithoutId };
        } else {
          const docRef = await this.collections[collection].add(docData);
          const newDoc = await docRef.get();
          return { id: newDoc.id, ...newDoc.data() };
        }
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
      if (!this.collections[collection]) {
        if (!this.init()) {
          throw new Error('Firebase not initialized');
        }
      }

      try {
        // Add updated timestamp
        const updateData = {
          ...data,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        await this.collections[collection].doc(id).update(updateData);
        
        // Get the updated document
        const updatedDoc = await this.collections[collection].doc(id).get();
        return { id: updatedDoc.id, ...updatedDoc.data() };
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
      if (!this.collections[collection]) {
        if (!this.init()) {
          throw new Error('Firebase not initialized');
        }
      }

      try {
        await this.collections[collection].doc(id).delete();
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
      if (!this.collections[collection]) {
        if (!this.init()) {
          throw new Error('Firebase not initialized');
        }
      }

      try {
        let query = this.collections[collection];
        
        // Apply all query conditions
        conditions.forEach(condition => {
          const [field, operator, value] = condition;
          query = query.where(field, operator, value);
        });
        
        const snapshot = await query.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        console.error(`Error querying ${collection} documents:`, error);
        throw error;
      }
    },

    // Add Firebase FieldValue for compatibility
    FieldValue: admin.firestore.FieldValue
  };

  // Initialize collections
  db.init();

  module.exports = db;
}
