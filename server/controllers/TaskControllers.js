import cron from 'node-cron'
import db from '../src/config/db.js'

cron.schedule('0 9 * * *', async () => {
    console.log("task : ", new Date());
    await checkForTask();
})

const checkForTask = async () => {
    try {
        const rows = await db`SELECT DISTINCT c.contact_id FROM contact c INNER JOIN event e ON c.contact_id=e.contact_id WHERE e.verified = TRUE`;
        console.log(`Found ${rows.length} verified contacts:`, rows);
        // records whose updated_at date > 2 months will be handled here
        for (const contact of rows) {
            console.log(contact.contact_id);
            if (contact.contact_id != undefined) {
                await checkForUpdatedAtOneMonth(contact.contact_id);
            }
        }
    } catch (error) {
        console.error("Error in checkForTask:", error);
    }
}

const checkForUpdatedAtOneMonth = async (id) => {
    try {
        let result = await db`SELECT * FROM contact WHERE contact_id=${id} AND updated_at <= NOW() - INTERVAL '2 month'`;
        console.log(result);
        
        if (result && result.length > 0) {
            const deadline = new Date();
            deadline.setDate(deadline.getDate() + 5); // 5 days from now
            const formattedDeadline = deadline.toISOString().split('T')[0]; // Format: YYYY-MM-DD
            
            const insertResult = await db`
                INSERT INTO tasks (task_assigned_category, task_title, task_description, task_deadline, task_type) 
                VALUES (
                    ${result[0].category},
                    ${"Contact Details Updations"},
                    ${`Update the details of ${result[0].name} whose phone number and email is ${result[0].phone_number} and ${result[0].email_address}`},
                    ${formattedDeadline},
                    ${"automated"}
                )             `;
            
            console.log("Task created:", insertResult);
        }
    } catch (error) {
        console.error("Error in checkForUpdatedAtOneMonth:", error);
    }
}
