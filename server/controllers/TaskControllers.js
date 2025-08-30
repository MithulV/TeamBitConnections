import cron from 'node-cron'
import db from '../src/config/db.js'
import dotenv from 'dotenv'
import nodemailer from 'nodemailer';
// Schedule updated_at 2 month check daily at 6:00 AM
cron.schedule('0 9 * * *', async () => {
    console.log("task : ", new Date());
    await checkForTask();
});
// Schedule birthday check daily at 6:00 AM
cron.schedule("0 6 * * *", async () => {
  console.log("Running daily birthday check at:", new Date());
  try {
    await checkBirthdays();
  } catch (error) {
    console.error("Birthday check failed:", error);
  }
});

const checkForTask = async () => {
  try {
    const rows =
      await db`SELECT DISTINCT c.contact_id FROM contact c INNER JOIN event e ON c.contact_id=e.contact_id WHERE e.verified = TRUE`;
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
};

const checkForUpdatedAtOneMonth = async (id) => {
  try {
    let result =
      await db`SELECT * FROM contact WHERE contact_id=${id} AND updated_at <= NOW() - INTERVAL '2 month'`;
    console.log(result);

    if (result && result.length > 0) {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 5); // 5 days from now
      const formattedDeadline = deadline.toISOString().split("T")[0]; // Format: YYYY-MM-DD

            const taskDescription = `Update the details of ${result[0].name} whose phone number and email is ${result[0].phone_number} and ${result[0].email_address}`;

            // First, check if the task already exists
            const existingTask = await db`
                SELECT 1 FROM tasks 
                WHERE task_assigned_category = ${result[0].category}
                AND task_title = ${"Contact Details Updations"}
                AND task_type = ${"automated"}
                AND task_description = ${taskDescription}
                LIMIT 1`;

            // Only insert if no existing task found
            if (!existingTask || existingTask.length === 0) {
                const insertResult = await db`
                    INSERT INTO tasks (task_assigned_category, task_title, task_description, task_deadline, task_type) 
                    VALUES (
                        ${result[0].category},
                        ${"Contact Details Updations"},
                        ${taskDescription},
                        ${formattedDeadline},
                        ${"automated"}
                    )`;

                console.log("Task created:", insertResult);
            } else {
                console.log("Task already exists, skipping insertion");
            }
        }
    } catch (error) {
        console.error("Error in checkForUpdatedAtOneMonth:", error);
    }
  } catch (error) {
    console.error("Error in checkForUpdatedAtOneMonth:", error);
  }
};


export const GetTasks = async (req, res) => {
    const { category } = req.params;
    try {
        const tasks = await db`SELECT * FROM tasks WHERE task_completion=FALSE AND task_assigned_category=${category}`;

        return res.status(200).json({ success: true, data: tasks });
    } catch (error) {
        console.error("Error fetching tasks:", error);
        return res.status(500).json({ success: false, error: "An internal server error occurred." });
    }

    return res.status(200).json({ success: true, data: tasks });
  } catch (err) {
    console.error("Error fetching tasks:", err);
    return res
      .status(500)
      .json({ success: false, error: "An internal server error occurred." });
  }
};
export const CompleteTask=async(req,res)=>{
    const {id}=req.params;
    try {
        const task= await db`UPDATE tasks SET task_completion = TRUE WHERE id=${id}`;
        return res.status(200).json({success:true});
        
    } catch (error) {
        console.error("Error fetching tasks:", error);
        return res.status(500).json({ success: false, error: "An internal server error occurred." });
    }
}

dotenv.config();
// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Birthday email template
const createBirthdayEmail = (name) => {
  return {
    subject: `🎉 Happy Birthday, ${name}! 🎂`,
    html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1>🎉 Happy Birthday! 🎉</h1>
                </div>
                <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h2 style="color: #333;">Dear ${name},</h2>
                    <p style="font-size: 16px; line-height: 1.6; color: #666;">
                        🎂 Wishing you a very Happy Birthday! 🎂
                    </p>
                    <p style="font-size: 16px; line-height: 1.6; color: #666;">
                        May this special day bring you joy, happiness, and all the wonderful things you deserve. 
                        We hope your birthday is as amazing as you are!
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <div style="background-color: #FFE4B5; padding: 20px; border-radius: 10px; display: inline-block;">
                            🎈🎊 Have a fantastic day! 🎊🎈
                        </div>
                    </div>
                    <p style="font-size: 14px; color: #888; text-align: center;">
                        Best wishes,<br>
                        Bannari Amman Institute of Technology,Sathyamangalam
                    </p>
                </div>
            </div>
        `,
    text: `Happy Birthday, ${name}! Wishing you a wonderful day filled with joy and happiness. Best wishes from all of us!`,
  };
};

// Function to send birthday email
const sendBirthdayEmail = async (user) => {
  try {
    const emailContent = createBirthdayEmail(user.name);

    const mailOptions = {
      from: `"Bannari Amman Well Wishers" <${process.env.EMAIL_USER}>`,
      to: user.email_address,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(
      `Birthday email sent to ${user.name} (${user.email}): ${info.messageId}`
    );

    // Log to database (optional)
    // await db`
    //     INSERT INTO email_logs (user_id, email_type, sent_at, message_id, status)
    //     VALUES (${user.user_id}, 'birthday', NOW(), ${info.messageId}, 'sent')
    // `;

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Failed to send birthday email to ${user.name}:`, error);

    // // Log error to database (optional)
    // await db`
    //     INSERT INTO email_logs (user_id, email_type, sent_at, status, error_message)
    //     VALUES (${user.user_id}, 'birthday', NOW(), 'failed', ${error.message})
    // `;

    return { success: false, error: error.message };
  }
};

// Function to check and send birthday emails
const checkBirthdays = async () => {
  try {
    console.log("Checking for birthdays...", new Date());

    // Query to find users whose birthday is today
    const birthdayUsers = await db`
            SELECT * 
            FROM contact 
            WHERE EXTRACT(MONTH FROM dob) = EXTRACT(MONTH FROM CURRENT_DATE)
            AND EXTRACT(DAY FROM dob) = EXTRACT(DAY FROM CURRENT_DATE)
            AND email_address IS NOT NULL
        `;

    console.log(`Found ${birthdayUsers.length} birthday(s) today`);

    if (birthdayUsers.length > 0) {
      // Send emails to all birthday users
      const emailPromises = birthdayUsers.map((user) =>
        sendBirthdayEmail(user)
      );
      const results = await Promise.allSettled(emailPromises);

      const successful = results.filter(
        (r) => r.status === "fulfilled" && r.value.success
      ).length;
      const failed = results.length - successful;

      console.log(
        `Birthday emails sent: ${successful} successful, ${failed} failed`
      );

      return {
        total: birthdayUsers.length,
        successful,
        failed,
        users: birthdayUsers.map((u) => ({ name: u.name, email: u.email })),
      };
    }

    return { total: 0, successful: 0, failed: 0, users: [] };
  } catch (error) {
    console.error("Error checking birthdays:", error);
    throw error;
  }
};
