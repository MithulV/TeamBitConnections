// Create a separate utility file for database operations (utils/contactModification.js)
export const logContactModification = async (db, contact_id, modified_by, modification_type, transaction, assigned_to) => {
  try {
console.log(
  db ? "db here" : "db not here",
  contact_id ? "contact_id here" : "contact_id not here",
  modified_by ? "modified_by here" : "modified_by not here",
  modification_type ? "modification_type here" : "modification_type not here",
  transaction ? "transaction here" : "transaction not here",
  assigned_to ? "assigned_to here" : "assigned_to not here"
);
    const query = transaction 
      ? transaction`INSERT INTO contact_modification_history (contact_id, modified_by, modification_type, created_at, assigned_to) 
                    VALUES (${contact_id}, ${modified_by}, ${modification_type}, NOW(), ${assigned_to || null}) 
                    RETURNING *`
      : db`INSERT INTO contact_modification_history (contact_id, modified_by, modification_type, created_at, assigned_to) 
                    VALUES (${contact_id}, ${modified_by}, ${modification_type}, NOW(), ${assigned_to || null}) 
                    RETURNING *`;
    
    return query;
  } catch (error) {
    console.error('Error logging contact modification:', error);
    throw error;
  }
};

export const getModificationHistory = async (db, contact_id) => {
  try {
    const query = db`
      SELECT 
        cmh.id,
        cmh.contact_id,
        cmh.modified_by,
        cmh.modification_type,
        cmh.created_at,
        u.role as username,
        c.name as contact_name,
        CONCAT(
          u.role, 
          ' ', 
          CASE 
            WHEN cmh.modification_type = 'CREATE' THEN 'created'
            WHEN cmh.modification_type = 'UPDATE' THEN 'updated'
            WHEN cmh.modification_type = 'DELETE' THEN 'deleted'
            ELSE LOWER(cmh.modification_type)
          END,
          ' contact "', 
          c.name, 
          '" on ', 
          TO_CHAR(cmh.created_at, 'Month DD, YYYY at HH12:MI AM')
        ) as description
      FROM contact_modification_history cmh
      LEFT JOIN login u ON u.id = cmh.modified_by
      LEFT JOIN contact c ON c.contact_id = cmh.contact_id
      WHERE cmh.contact_id = ${contact_id}
      ORDER BY cmh.created_at DESC
    `;

    return await query;
  } catch (error) {
    console.error('Error fetching contact modification history:', error);
    throw error;
  }
};
