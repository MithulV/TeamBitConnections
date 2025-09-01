// Create a separate utility file for database operations (utils/contactModification.js)
export const logContactModification = async (db, contact_id, modified_by, modification_type, transaction) => {
  try {
    const query = transaction 
      ? transaction`INSERT INTO contact_modification_history (contact_id, modified_by, modification_type, created_at) 
                    VALUES (${contact_id}, ${modified_by}, ${modification_type}, NOW()) 
                    RETURNING *`
      : db`INSERT INTO contact_modification_history (contact_id, modified_by, modification_type, created_at) 
           VALUES (${contact_id}, ${modified_by}, ${modification_type}, NOW()) 
           RETURNING *`;
    
    return query;
  } catch (error) {
    console.error('Error logging contact modification:', error);
    throw error;
  }
};
