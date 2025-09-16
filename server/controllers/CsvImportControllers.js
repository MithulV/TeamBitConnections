import multer from 'multer';
import fs from 'fs';
import path from 'path';
import db from '../src/config/db.js';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        cb(null, `csv-${timestamp}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || 
            file.mimetype === 'application/vnd.ms-excel' || 
            path.extname(file.originalname).toLowerCase() === '.csv') {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are allowed'), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    }
});

export const ImportContactsFromCSV = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: 'CSV file is required',
                success: false
            });
        }

        const { created_by } = req.body;
        const filePath = req.file.path;
        let fileRows = [];

        console.log(`Processing CSV file: ${req.file.originalname}`);

        // MANUAL CSV PARSING APPROACH
        let fileContent = fs.readFileSync(filePath, 'utf8');
        
        // Remove BOM if present
        if (fileContent.charCodeAt(0) === 0xFEFF) {
            fileContent = fileContent.substring(1);
            console.log('BOM detected and removed');
        }

        // Split into lines and parse manually
        const lines = fileContent.split('\n').filter(line => line.trim().length > 0);
        
        if (lines.length === 0) {
            fs.unlinkSync(filePath);
            return res.status(400).json({
                message: 'CSV file is empty',
                success: false
            });
        }

        // MANUALLY PARSE HEADER AND DATA
        const headerLine = lines[0].trim();
        const headers = headerLine.split(',').map(h => h.trim().replace(/"/g, ''));
        
        console.log('Parsed headers:', headers);
        
        // Parse data rows
        for (let i = 1; i < lines.length; i++) {
            const dataLine = lines[i].trim();
            if (dataLine.length === 0) continue;
            
            const values = dataLine.split(',').map(v => v.trim().replace(/"/g, ''));
            
            // Create row object
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            
            fileRows.push(row);
        }

        // Clean up uploaded file
        fs.unlinkSync(filePath);

        console.log(`Parsed ${fileRows.length} rows from CSV`);
        console.log('Sample row:', fileRows[0]);

        // Process CSV data with database transaction
        try {
            const result = await db.begin(async (t) => {
                const processedContacts = [];
                const errors = [];
                const duplicates = [];
                let successCount = 0;

                for (let i = 0; i < fileRows.length; i++) {
                    const row = fileRows[i];
                    const rowNumber = i + 2; // +2 because arrays start at 0 and CSV header is row 1
                    
                    try {
                        console.log(`Processing row ${rowNumber}:`, {
                            name: row.name,
                            phone: row.phone_number,
                            email: row.email_address
                        });

                        // Basic validation
                        if (!row.name || !row.phone_number || !row.email_address) {
                            errors.push({
                                row: rowNumber,
                                message: 'Missing required fields: name, phone_number, email_address',
                                data: row
                            });
                            continue;
                        }

                        // Check for existing contact (duplicate prevention)
                        const existingContact = await t`
                          SELECT contact_id, name FROM contact 
                          WHERE (email_address = ${row.email_address} AND email_address IS NOT NULL)
                             OR (phone_number = ${row.phone_number} AND phone_number IS NOT NULL)
                          LIMIT 1
                        `;

                        if (existingContact.length > 0) {
                            duplicates.push({
                                row: rowNumber,
                                message: `Contact already exists: ${existingContact[0].name}`,
                                existingContactId: existingContact[0].contact_id,
                                data: row
                            });
                            continue;
                        }

                        // ✅ INSERT NEW CONTACT - Main contact table
                        const [newContact] = await t`
                          INSERT INTO contact (
                            created_by, name, phone_number, email_address, 
                            dob, gender, nationality, marital_status, category,
                            secondary_email, secondary_phone_number, 
                            emergency_contact_name, emergency_contact_relationship, emergency_contact_phone_number,
                            skills, linkedin_url, created_at, updated_at
                          ) VALUES (
                            ${created_by || null}, ${row.name}, ${row.phone_number}, ${row.email_address},
                            ${row.dob || null}, ${row.gender || null}, ${row.nationality || null}, 
                            ${row.marital_status || null}, ${row.category || null},
                            ${row.secondary_email || null}, ${row.secondary_phone_number || null},
                            ${row.emergency_contact_name || null}, ${row.emergency_contact_relationship || null}, 
                            ${row.emergency_contact_phone_number || null},
                            ${row.skills || null}, ${row.linkedin_url || null}, NOW(), NOW()
                          ) RETURNING *
                        `;

                        const contactId = newContact.contact_id;
                        console.log(`✅ Inserted contact ${contactId}: ${row.name}`);

                        // ✅ INSERT ADDRESS DATA
                        if (row.street || row.city || row.state || row.country || row.zipcode) {
                            await t`
                              INSERT INTO contact_address (
                                contact_id, street, city, state, country, zipcode, created_at
                              ) VALUES (
                                ${contactId}, ${row.street || null}, ${row.city || null}, 
                                ${row.state || null}, ${row.country || null}, ${row.zipcode || null}, 
                                NOW()
                              )
                            `;
                            console.log(`✅ Inserted address for contact ${contactId}`);
                        }

                        // ✅ INSERT EDUCATION DATA
                        if (row.pg_course_name || row.pg_college_name || row.ug_course_name || row.ug_college_name) {
                            await t`
                              INSERT INTO contact_education (
                                contact_id, pg_course_name, pg_college, pg_university, 
                                pg_from_date, pg_to_date, ug_course_name, ug_college, 
                                ug_university, ug_from_date, ug_to_date
                              ) VALUES (
                                ${contactId}, ${row.pg_course_name || null}, ${row.pg_college_name || null}, 
                                ${row.pg_university_type || null}, ${row.pg_start_date || null}, 
                                ${row.pg_end_date || null}, ${row.ug_course_name || null}, 
                                ${row.ug_college_name || null}, ${row.ug_university_type || null}, 
                                ${row.ug_start_date || null}, ${row.ug_end_date || null}
                              )
                            `;
                            console.log(`✅ Inserted education for contact ${contactId}`);
                        }

                        // ✅ INSERT EXPERIENCE DATA
                        if (row.job_title || row.company_name) {
                            await t`
                              INSERT INTO contact_experience (
                                contact_id, job_title, company, department, 
                                from_date, to_date, created_at
                              ) VALUES (
                                ${contactId}, ${row.job_title || null}, ${row.company_name || null}, 
                                ${row.department_type || null}, ${row.from_date || null}, 
                                ${row.to_date || null}, NOW()
                              )
                            `;
                            console.log(`✅ Inserted experience for contact ${contactId}`);
                        }

                        // ✅ INSERT EVENTS DATA
                        if (row.event_name) {
                            await t`
                              INSERT INTO event (
                                contact_id, event_name, event_role, event_held_organization, 
                                event_location, event_date,verified,contact_status, created_at, updated_at
                              ) VALUES (
                                ${contactId}, ${row.event_name}, ${row.event_role || null}, 
                                ${row.event_held_organization || null}, ${row.event_location || null}, 
                                ${row.event_date || null},${true},${"approved"}, NOW(), NOW()
                              )
                            `;
                            console.log(`✅ Inserted event for contact ${contactId}`);
                        }

                        // // ✅ INSERT LOGGER DATA (if you have a logger table)
                        // if (row.logger) {
                        //     await t`
                        //       INSERT INTO contact_logs (
                        //         contact_id, logger, log_date, created_at
                        //       ) VALUES (
                        //         ${contactId}, ${row.logger}, NOW(), NOW()
                        //       )
                        //     `;
                        //     console.log(`✅ Inserted logger for contact ${contactId}`);
                        // }

                        // // ✅ INSERT DEPARTMENT DATA (if separate table)
                        // if (row.department_type && row.company_name) {
                        //     await t`
                        //       INSERT INTO departments (
                        //         contact_id, department_name, company_name, created_at, updated_at
                        //       ) VALUES (
                        //         ${contactId}, ${row.department_type}, ${row.company_name}, NOW(), NOW()
                        //       )
                        //     `;
                        //     console.log(`✅ Inserted department for contact ${contactId}`);
                        // }

                        // ✅ INSERT CONTACT VERIFICATION STATUS
                        // await t`
                        //   INSERT INTO contact_verification (
                        //     contact_id, verified, contact_status, added_by, created_at, updated_at
                        //   ) VALUES (
                        //     ${contactId}, true, 'approved', ${created_by || null}, NOW(), NOW()
                        //   )
                        // `;

                        processedContacts.push({
                            row: rowNumber,
                            contactId: contactId,
                            name: row.name,
                            email: row.email_address
                        });
                        successCount++;

                    } catch (error) {
                        console.error(`Error processing row ${rowNumber}:`, error);
                        errors.push({
                            row: rowNumber,
                            message: error.message,
                            data: row
                        });
                    }
                }

                return {
                    totalRows: fileRows.length,
                    successCount,
                    errorCount: errors.length,
                    duplicateCount: duplicates.length,
                    processedContacts,
                    errors: errors.slice(0, 10), // Limit errors in response
                    duplicates: duplicates.slice(0, 10) // Limit duplicates in response
                };
            });

            console.log('✅ CSV Import Transaction Completed Successfully');
            console.log(`📊 Results: ${result.successCount} success, ${result.errorCount} errors, ${result.duplicateCount} duplicates`);

            return res.status(200).json({
                message: 'CSV import completed successfully',
                success: true,
                data: result
            });

        } catch (error) {
            console.error('❌ Database transaction error:', error);
            return res.status(500).json({
                message: 'Error processing CSV data',
                success: false,
                error: error.message
            });
        }

    } catch (error) {
        console.error('❌ CSV import error:', error);
        
        // Clean up file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        return res.status(500).json({
            message: 'Server error during CSV import',
            success: false,
            error: error.message
        });
    }
};

//  EXPORT MULTER UPLOAD MIDDLEWARE
export const uploadCSV = upload.single('csv_file');

//  OPTIONAL: Helper function to validate CSV headers
export const validateCSVHeaders = (headers) => {
    const requiredHeaders = ['name', 'phone_number', 'email_address'];
    const missingHeaders = requiredHeaders.filter(required => 
        !headers.some(header => header.toLowerCase() === required.toLowerCase())
    );
    
    return {
        isValid: missingHeaders.length === 0,
        missingHeaders
    };
};

//  OPTIONAL: Helper function to sanitize CSV data
export const sanitizeRowData = (row) => {
    const sanitized = {};
    
    Object.keys(row).forEach(key => {
        let value = row[key];
        
        // Remove extra quotes and trim whitespace
        if (typeof value === 'string') {
            value = value.replace(/^["']|["']$/g, '').trim();
        }
        
        // Convert empty strings to null
        sanitized[key] = value === '' ? null : value;
    });
    
    return sanitized;
};

console.log(' CSV Import controller loaded with complete multi-table insert support');
