import db from "../src/config/db.js";
// Create a separate utility file for database operations (utils/contactModification.js)
export const logContactModification = async (
  db,
  contact_id,
  modified_by,
  modification_type,
  transaction,
  assigned_to
) => {
  try {
    // Handle undefined values by converting them to null
    const safeContactId = contact_id || null;
    const safeModifiedBy = modified_by || null;
    const safeModificationType = modification_type || "UNKNOWN";
    const safeAssignedTo = assigned_to || null;

    console.log("Logging contact modification:", {
      contact_id: safeContactId,
      modified_by: safeModifiedBy,
      modification_type: safeModificationType,
      assigned_to: safeAssignedTo,
    });

    const query = transaction
      ? transaction`INSERT INTO contact_modification_history (contact_id, modified_by, modification_type, created_at, assigned_to) 
                    VALUES (${safeContactId}, ${safeModifiedBy}, ${safeModificationType}, NOW(), ${safeAssignedTo}) 
                    RETURNING *`
      : db`INSERT INTO contact_modification_history (contact_id, modified_by, modification_type, created_at, assigned_to) 
                    VALUES (${safeContactId}, ${safeModifiedBy}, ${safeModificationType}, NOW(), ${safeAssignedTo}) 
                    RETURNING *`;

    return query;
  } catch (error) {
    console.error("Error logging contact modification:", error);
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
        cmh.assigned_to,  -- new column for ASSIGN modifications
        cmh.created_at,
        u.role as username,
        c.name as contact_name,
        assigned_user.role as assigned_to_username,  -- get username of assigned user
        CASE 
          WHEN cmh.modification_type = 'CREATE' THEN 
            u.role || ' created contact "' || c.name || '" on ' || TO_CHAR(cmh.created_at, 'Month DD, YYYY at HH12:MI AM')
          WHEN cmh.modification_type = 'UPDATE' THEN 
            u.role || ' updated contact "' || c.name || '" on ' || TO_CHAR(cmh.created_at, 'Month DD, YYYY at HH12:MI AM')
          WHEN cmh.modification_type = 'DELETE' THEN 
            u.role || ' deleted contact "' || c.name || '" on ' || TO_CHAR(cmh.created_at, 'Month DD, YYYY at HH12:MI AM')
          WHEN cmh.modification_type = 'USER UPDATE' THEN 
            u.role || ' updated contact "' || c.name || '" (pending admin verification) on ' || TO_CHAR(cmh.created_at, 'Month DD, YYYY at HH12:MI AM')
          WHEN cmh.modification_type = 'USER VERIFY' THEN 
            u.role || ' verified user updates for contact "' || c.name || '" on ' || TO_CHAR(cmh.created_at, 'Month DD, YYYY at HH12:MI AM')
          WHEN cmh.modification_type = 'ASSIGN' THEN 
            u.role || ' assigned contact "' || c.name || '" to ' || COALESCE(assigned_user.role, 'user ID ' || cmh.assigned_to) || ' on ' || TO_CHAR(cmh.created_at, 'Month DD, YYYY at HH12:MI AM')
          WHEN cmh.modification_type = 'CONTACT' THEN 
            u.role || ' contacted "' || c.name || '" on ' || TO_CHAR(cmh.created_at, 'Month DD, YYYY at HH12:MI AM')
          WHEN cmh.modification_type = 'UPDATE USER EVENT' THEN
            u.role || ' added event to contact "' || c.name || '" on ' || TO_CHAR(cmh.created_at, 'Month DD, YYYY at HH12:MI AM')
          WHEN cmh.modification_type = 'UNAUTHORIZED UPDATE' THEN 
            u.role || ' attempted unauthorized update on assigned contact "' || c.name || '" on ' || TO_CHAR(cmh.created_at, 'Month DD, YYYY at HH12:MI AM')
          WHEN cmh.modification_type = 'ASSIGNMENT EXISTS' THEN 
            u.role || ' tried to update contact "' || c.name || '" that has an active assignment on ' || TO_CHAR(cmh.created_at, 'Month DD, YYYY at HH12:MI AM')
          ELSE 
            u.role || ' ' || LOWER(cmh.modification_type) || ' contact "' || c.name || '" on ' || TO_CHAR(cmh.created_at, 'Month DD, YYYY at HH12:MI AM')
        END as description
      FROM contact_modification_history cmh
      LEFT JOIN login u ON u.id = cmh.modified_by
      LEFT JOIN contact c ON c.contact_id = cmh.contact_id
      LEFT JOIN login assigned_user ON assigned_user.id = cmh.assigned_to  -- join to get assigned user details
      WHERE cmh.contact_id = ${contact_id}
      ORDER BY cmh.created_at DESC
    `;

    return await query;
  } catch (error) {
    console.error("Error fetching contact modification history:", error);
    throw error;
  }
};

export const getAllModificationHistory = async (db, limit = 50, offset = 0) => {
  try {
    const query = db`
      SELECT 
        cmh.id,
        cmh.contact_id,
        cmh.modified_by,
        cmh.modification_type,
        cmh.assigned_to,  -- new column for ASSIGN modifications
        cmh.created_at,
        u.role as username,
        c.name as contact_name,
        assigned_user.role as assigned_to_username,  -- get username of assigned user
        CASE 
          WHEN cmh.modification_type = 'CREATE' THEN 
            u.role || ' created contact "' || c.name || '" on ' || TO_CHAR(cmh.created_at, 'Month DD, YYYY at HH12:MI AM')
          WHEN cmh.modification_type = 'UPDATE' THEN 
            u.role || ' updated contact "' || c.name || '" on ' || TO_CHAR(cmh.created_at, 'Month DD, YYYY at HH12:MI AM')
          WHEN cmh.modification_type = 'DELETE' THEN 
            u.role || ' deleted contact "' || c.name || '" on ' || TO_CHAR(cmh.created_at, 'Month DD, YYYY at HH12:MI AM')
          WHEN cmh.modification_type = 'USER UPDATE' THEN 
            u.role || ' updated contact "' || c.name || '" (pending admin verification) on ' || TO_CHAR(cmh.created_at, 'Month DD, YYYY at HH12:MI AM')
          WHEN cmh.modification_type = 'USER VERIFY' THEN 
            u.role || ' verified user updates for contact "' || c.name || '" on ' || TO_CHAR(cmh.created_at, 'Month DD, YYYY at HH12:MI AM')
          WHEN cmh.modification_type = 'ASSIGN' THEN 
            u.role || ' assigned contact "' || c.name || '" to ' || COALESCE(assigned_user.role, 'user ID ' || cmh.assigned_to) || ' on ' || TO_CHAR(cmh.created_at, 'Month DD, YYYY at HH12:MI AM')
          WHEN cmh.modification_type = 'CONTACT' THEN 
            u.role || ' contacted "' || c.name || '" on ' || TO_CHAR(cmh.created_at, 'Month DD, YYYY at HH12:MI AM')
          WHEN cmh.modification_type = 'UPDATE USER EVENT' THEN
            u.role || ' added event to contact "' || c.name || '" on ' || TO_CHAR(cmh.created_at, 'Month DD, YYYY at HH12:MI AM')
          WHEN cmh.modification_type = 'UNAUTHORIZED UPDATE' THEN 
            u.role || ' attempted unauthorized update on assigned contact "' || c.name || '" on ' || TO_CHAR(cmh.created_at, 'Month DD, YYYY at HH12:MI AM')
          WHEN cmh.modification_type = 'ASSIGNMENT EXISTS' THEN 
            u.role || ' tried to update contact "' || c.name || '" that has an active assignment on ' || TO_CHAR(cmh.created_at, 'Month DD, YYYY at HH12:MI AM')
          ELSE 
            u.role || ' ' || LOWER(cmh.modification_type) || ' contact "' || c.name || '" on ' || TO_CHAR(cmh.created_at, 'Month DD, YYYY at HH12:MI AM')
        END as description
      FROM contact_modification_history cmh
      LEFT JOIN login u ON u.id = cmh.modified_by
      LEFT JOIN contact c ON c.contact_id = cmh.contact_id
      LEFT JOIN login assigned_user ON assigned_user.id = cmh.assigned_to  -- join to get assigned user details
      ORDER BY cmh.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    return await query;
  } catch (error) {
    console.error("Error fetching all modification history:", error);
    throw error;
  }
};

// Function to get total count of modification history records
export const getTotalModificationHistoryCount = async (db) => {
  try {
    const query = db`
      SELECT COUNT(*) as total
      FROM contact_modification_history
    `;

    const result = await query;
    return result[0]?.total || 0;
  } catch (error) {
    console.error("Error getting total modification history count:", error);
    throw error;
  }
};

// Get contact modification history

export const getContactModificationHistory = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate contact ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: "Valid contact ID is required",
      });
    }

    const contactId = parseInt(id);

    // Fetch modification history
    const history = await getModificationHistory(db, contactId);

    if (!history || history.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No modification history found for this contact",
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact modification history retrieved successfully",
      data: history,
      count: history.length,
    });
  } catch (error) {
    console.error("Error in getContactModificationHistory controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching modification history",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const getAllContactModificationHistory = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    // Validate pagination parameters
    const limitValue = parseInt(limit);
    const offsetValue = parseInt(offset);

    if (isNaN(limitValue) || limitValue < 0 || limitValue > 1000) {
      return res.status(400).json({
        success: false,
        message: "Limit must be a number between 0 and 1000",
      });
    }

    if (isNaN(offsetValue) || offsetValue < 0) {
      return res.status(400).json({
        success: false,
        message: "Offset must be a non-negative number",
      });
    }

    // Fetch all modification history
    const history = await getAllModificationHistory(
      db,
      limitValue,
      offsetValue
    );

    if (!history || history.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No modification history found",
        data: [],
        count: 0,
      });
    }

    // Get total count for pagination
    const totalCount = await getTotalModificationHistoryCount(db);

    res.status(200).json({
      success: true,
      message: "All contact modification history retrieved successfully",
      data: history,
      count: history.length,
      totalCount: totalCount,
      pagination: {
        limit: limitValue,
        offset: offsetValue,
        hasMore: offsetValue + history.length < totalCount,
      },
    });
  } catch (error) {
    console.error(
      "Error in getAllContactModificationHistory controller:",
      error
    );
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching modification history",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
