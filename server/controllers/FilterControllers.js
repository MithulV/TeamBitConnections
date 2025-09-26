import db from "../src/config/db.js";

export const GetFilteredContacts = async (req, res) => {
  const queryParams = req.query;

  const normalizeParam = (param) => {
    if (!param) return null;
    return Array.isArray(param) ? param : [param];
  };

  const {
    name,
    phone_number,
    email_address,
    created_by,
    created_from,
    created_to,
    dob_from,
    dob_to,
    education_from_year,
    education_to_year,
    experience_from_year,
    experience_to_year,
    event_year,
    address_zipcode,
    address_street,
    page = 1,
    limit = 20,
    sort_by = "name",
    sort_order = "ASC",
    rejected = "false",
    include_rejected = "false",
    contact_id,
  } = queryParams;

  if (contact_id) {
    try {
      console.log("Fetching specific contact by ID:", contact_id);

      const contact = await db`
        SELECT DISTINCT 
          c.*,
          ca.street, ca.city, ca.state, ca.country, ca.zipcode,
          ce.pg_course_name, ce.pg_college, ce.pg_university, 
          ce.pg_from_date, ce.pg_to_date,
          ce.ug_course_name, ce.ug_college, ce.ug_university, 
          ce.ug_from_date, ce.ug_to_date
        FROM contact c
        LEFT JOIN contact_address ca ON c.contact_id = ca.contact_id
        LEFT JOIN contact_education ce ON c.contact_id = ce.contact_id
        LEFT JOIN contact_experience exp ON c.contact_id = exp.contact_id
        LEFT JOIN event e ON c.contact_id = e.contact_id
        WHERE c.contact_id = ${contact_id}
        ORDER BY c.name ASC
      `;

      if (contact.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Contact not found",
          error: `No contact found with ID: ${contact_id}`
        });
      }

      const contactsWithDetails = await Promise.all(
        contact.map(async (contactRecord) => {
          const experiences = await db`
            SELECT * FROM contact_experience 
            WHERE contact_id = ${contactRecord.contact_id} 
            ORDER BY from_date DESC
          `;

          const events = await db`
            SELECT * FROM event 
            WHERE contact_id = ${contactRecord.contact_id} 
            ORDER BY event_date DESC
          `;

          return {
            ...contactRecord,
            experiences: experiences,
            events: events,
          };
        })
      );

      return res.status(200).json({
        success: true,
        message: "Contact retrieved successfully!",
        data: {
          contact: contactsWithDetails[0],
          is_single_contact: true,
        },
        filters_applied: {
          contact_id: contact_id,
          single_contact_fetch: true
        },
      });

    } catch (contactError) {
      console.error("Error fetching contact by ID:", contactError);
      return res.status(500).json({
        success: false,
        message: "Error retrieving contact data",
        error: contactError.message
      });
    }
  }

  const category = normalizeParam(queryParams.category);
  const gender = normalizeParam(queryParams.gender);
  const nationality = normalizeParam(queryParams.nationality);
  const marital_status = normalizeParam(queryParams.marital_status);
  const skills = normalizeParam(queryParams.skills);
  const address_country = normalizeParam(queryParams.address_country);
  const address_state = normalizeParam(queryParams.address_state);
  const address_city = normalizeParam(queryParams.address_city);
  const pg_course_name = normalizeParam(queryParams.pg_course_name);
  const pg_college = normalizeParam(queryParams.pg_college);
  const pg_university = normalizeParam(queryParams.pg_university);
  const ug_course_name = normalizeParam(queryParams.ug_course_name);
  const ug_college = normalizeParam(queryParams.ug_college);
  const ug_university = normalizeParam(queryParams.ug_university);
  const job_title = normalizeParam(queryParams.job_title);
  const company = normalizeParam(queryParams.company);
  const department = normalizeParam(queryParams.department);
  const event_name = normalizeParam(queryParams.event_name);
  const event_role = normalizeParam(queryParams.event_role);
  const event_organization = normalizeParam(queryParams.event_organization);
  const event_location = normalizeParam(queryParams.event_location);

  try {
    const conditions = [];

    // NEW: Add rejected filter by default
    if (include_rejected === "true") {
      // Don't filter by rejected status - show all
      console.log("Including both rejected and non-rejected contacts");
    } else if (rejected === "true") {
      // Only show rejected contacts
      conditions.push(`(c.rejected = true OR c.rejected IS NULL)`);
      console.log("Filtering to show only rejected contacts");
    } else {
      // Default: Only show non-rejected contacts
      conditions.push(`(c.rejected = false OR c.rejected IS NULL)`);
      console.log("Default filter: showing only non-rejected contacts");
    }

    if (name) conditions.push(`c.name ILIKE '%${name}%'`);
    if (phone_number)
      conditions.push(`c.phone_number ILIKE '%${phone_number}%'`);
    if (email_address)
      conditions.push(`c.email_address ILIKE '%${email_address}%'`);
    if (created_by) conditions.push(`c.created_by = '${created_by}'`);

    if (category) {
      const categoryValues = category.map((cat) => `'${cat}'`).join(",");
      conditions.push(`c.category IN (${categoryValues})`);
    }

    if (gender) {
      const genderValues = gender.map((g) => `'${g}'`).join(",");
      conditions.push(`c.gender IN (${genderValues})`);
    }

    if (marital_status) {
      const maritalValues = marital_status.map((ms) => `'${ms}'`).join(",");
      conditions.push(`c.marital_status IN (${maritalValues})`);
    }

    if (nationality) {
      const nationalityConditions = nationality.map(
        (nat) => `c.nationality ILIKE '%${nat}%'`
      );
      conditions.push(`(${nationalityConditions.join(" OR ")})`);
    }

    if (skills) {
      const skillsConditions = skills.map(
        (skill) => `c.skills ILIKE '%${skill}%'`
      );
      conditions.push(`(${skillsConditions.join(" OR ")})`);
    }

    if (address_city) {
      const cityConditions = address_city.map(
        (city) => `ca.city ILIKE '%${city}%'`
      );
      conditions.push(`(${cityConditions.join(" OR ")})`);
    }

    if (address_state) {
      const stateConditions = address_state.map(
        (state) => `ca.state ILIKE '%${state}%'`
      );
      conditions.push(`(${stateConditions.join(" OR ")})`);
    }

    if (address_country) {
      const countryConditions = address_country.map(
        (country) => `ca.country ILIKE '%${country}%'`
      );
      conditions.push(`(${countryConditions.join(" OR ")})`);
    }

    if (address_zipcode) conditions.push(`ca.zipcode = '${address_zipcode}'`);
    if (address_street)
      conditions.push(`ca.street ILIKE '%${address_street}%'`);

    if (pg_course_name) {
      const pgCourseConditions = pg_course_name.map(
        (course) => `ce.pg_course_name ILIKE '%${course}%'`
      );
      conditions.push(`(${pgCourseConditions.join(" OR ")})`);
    }

    if (pg_college) {
      const pgCollegeConditions = pg_college.map(
        (college) => `ce.pg_college ILIKE '%${college}%'`
      );
      conditions.push(`(${pgCollegeConditions.join(" OR ")})`);
    }

    if (pg_university) {
      const pgUniversityConditions = pg_university.map(
        (uni) => `ce.pg_university ILIKE '%${uni}%'`
      );
      conditions.push(`(${pgUniversityConditions.join(" OR ")})`);
    }

    if (ug_course_name) {
      const ugCourseConditions = ug_course_name.map(
        (course) => `ce.ug_course_name ILIKE '%${course}%'`
      );
      conditions.push(`(${ugCourseConditions.join(" OR ")})`);
    }

    if (ug_college) {
      const ugCollegeConditions = ug_college.map(
        (college) => `ce.ug_college ILIKE '%${college}%'`
      );
      conditions.push(`(${ugCollegeConditions.join(" OR ")})`);
    }

    if (ug_university) {
      const ugUniversityConditions = ug_university.map(
        (uni) => `ce.ug_university ILIKE '%${uni}%'`
      );
      conditions.push(`(${ugUniversityConditions.join(" OR ")})`);
    }

    if (job_title) {
      const jobTitleConditions = job_title.map(
        (jt) => `exp.job_title ILIKE '%${jt}%'`
      );
      conditions.push(`(${jobTitleConditions.join(" OR ")})`);
    }

    if (company) {
      const companyConditions = company.map(
        (comp) => `exp.company ILIKE '%${comp}%'`
      );
      conditions.push(`(${companyConditions.join(" OR ")})`);
    }

    if (department) {
      const departmentConditions = department.map(
        (dept) => `exp.department ILIKE '%${dept}%'`
      );
      conditions.push(`(${departmentConditions.join(" OR ")})`);
    }

    if (event_name) {
      const eventNameConditions = event_name.map(
        (name) => `e.event_name ILIKE '%${name}%'`
      );
      conditions.push(`(${eventNameConditions.join(" OR ")})`);
    }

    if (event_role) {
      const eventRoleConditions = event_role.map(
        (role) => `e.event_role ILIKE '%${role}%'`
      );
      conditions.push(`(${eventRoleConditions.join(" OR ")})`);
    }

    if (event_organization) {
      const eventOrgConditions = event_organization.map(
        (org) => `e.event_held_organization ILIKE '%${org}%'`
      );
      conditions.push(`(${eventOrgConditions.join(" OR ")})`);
    }

    if (event_location) {
      const eventLocationConditions = event_location.map(
        (loc) => `e.event_location ILIKE '%${loc}%'`
      );
      conditions.push(`(${eventLocationConditions.join(" OR ")})`);
    }

    if (created_from) conditions.push(`c.created_at >= '${created_from}'`);
    if (created_to) conditions.push(`c.created_at <= '${created_to}'`);
    if (dob_from) conditions.push(`c.dob >= '${dob_from}'`);
    if (dob_to) conditions.push(`c.dob <= '${dob_to}'`);

    if (education_from_year)
      conditions.push(
        `(EXTRACT(YEAR FROM ce.pg_from_date) >= ${education_from_year} OR EXTRACT(YEAR FROM ce.ug_from_date) >= ${education_from_year})`
      );
    if (education_to_year)
      conditions.push(
        `(EXTRACT(YEAR FROM ce.pg_to_date) <= ${education_to_year} OR EXTRACT(YEAR FROM ce.ug_to_date) <= ${education_to_year})`
      );
    if (experience_from_year)
      conditions.push(
        `EXTRACT(YEAR FROM exp.from_date) >= ${experience_from_year}`
      );
    if (experience_to_year)
      conditions.push(
        `EXTRACT(YEAR FROM exp.to_date) <= ${experience_to_year}`
      );
    if (event_year)
      conditions.push(`EXTRACT(YEAR FROM e.event_date) = ${event_year}`);

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    console.log("WHERE clause:", whereClause);

    // ✅ PROPERLY IMPLEMENTED PAGINATION
    const pageNumber = Math.max(1, parseInt(page) || 1);
    const limitNumber = Math.max(1, Math.min(1000, parseInt(limit) || 20)); // Cap at 1000 for performance
    const offset = (pageNumber - 1) * limitNumber;

    console.log("Pagination parameters:", {
      page: pageNumber,
      limit: limitNumber,
      offset: offset
    });

    const validSortFields = [
      "name",
      "email_address",
      "phone_number",
      "created_at",
      "dob",
    ];
    const sortField = validSortFields.includes(sort_by) ? sort_by : "name";
    const sortDirection = sort_order.toUpperCase() === "DESC" ? "DESC" : "ASC";

    // ✅ MAIN QUERY WITH LIMIT AND OFFSET
    const contacts = await db`
      SELECT DISTINCT 
        c.*,
        ca.street, ca.city, ca.state, ca.country, ca.zipcode,
        ce.pg_course_name, ce.pg_college, ce.pg_university, 
        ce.pg_from_date, ce.pg_to_date,
        ce.ug_course_name, ce.ug_college, ce.ug_university, 
        ce.ug_from_date, ce.ug_to_date
      FROM contact c
      LEFT JOIN contact_address ca ON c.contact_id = ca.contact_id
      LEFT JOIN contact_education ce ON c.contact_id = ce.contact_id
      LEFT JOIN contact_experience exp ON c.contact_id = exp.contact_id
      LEFT JOIN event e ON c.contact_id = e.contact_id
      ${whereClause ? db.unsafe(whereClause) : db``}
      ORDER BY ${db.unsafe(`c.${sortField} ${sortDirection}`)}
      LIMIT ${limitNumber}
      OFFSET ${offset}
    `;

    // ✅ COUNT QUERY FOR TOTAL RECORDS
    const [countResult] = await db`
      SELECT COUNT(DISTINCT c.contact_id) as total
      FROM contact c
      LEFT JOIN contact_address ca ON c.contact_id = ca.contact_id
      LEFT JOIN contact_education ce ON c.contact_id = ce.contact_id
      LEFT JOIN contact_experience exp ON c.contact_id = exp.contact_id
      LEFT JOIN event e ON c.contact_id = e.contact_id
      ${whereClause ? db.unsafe(whereClause) : db``}
    `;

    const totalContacts = parseInt(countResult.total);
    const totalPages = Math.ceil(totalContacts / limitNumber);

    console.log("Query results:", {
      contactsReturned: contacts.length,
      totalContacts: totalContacts,
      totalPages: totalPages,
      currentPage: pageNumber
    });

    // ✅ FETCH RELATED DATA FOR EACH CONTACT
    const contactsWithDetails = await Promise.all(
      contacts.map(async (contact) => {
        const experiences = await db`
          SELECT * FROM contact_experience 
          WHERE contact_id = ${contact.contact_id} 
          ORDER BY from_date DESC
        `;

        const events = await db`
          SELECT * FROM event 
          WHERE contact_id = ${contact.contact_id} 
          ORDER BY event_date DESC
        `;

        return {
          ...contact,
          experiences: experiences,
          events: events,
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: "Contacts retrieved successfully!",
      data: {
        contacts: contactsWithDetails,
        pagination: {
          current_page: pageNumber,
          total_pages: totalPages,
          total_contacts: totalContacts,
          limit: limitNumber,
          offset: offset,
          has_next: pageNumber < totalPages,
          has_previous: pageNumber > 1,
          showing_from: offset + 1,
          showing_to: Math.min(offset + limitNumber, totalContacts),
        },
        filters_applied: {
          rejected_filter: include_rejected === "true" 
            ? "All contacts (rejected and non-rejected)" 
            : rejected === "true" 
              ? "Only rejected contacts"
              : "Only non-rejected contacts (default)",
          other_filters: conditions.length - 1, // Subtract 1 for the rejected filter
          sort_field: sortField,
          sort_order: sortDirection,
        },
      },
    });
  } catch (err) {
    console.error("GetFilteredContacts error:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error!",
      error: err.message,
    });
  }
};

export const GetFilterOptions = async (req, res) => {
  try {
    // Get the user's category from request
    const userCategory = req.query.category;
    console.log(userCategory);
    if (!userCategory) {
      return res.status(400).json({
        success: false,
        error: "User category is required",
      });
    }

    // ✅ PAGINATION FOR FILTER OPTIONS
    const {
      rejected = "false", 
      include_rejected = "false",
      page = 1,
      limit = 50 // Default smaller limit for filter options
    } = req.query;

    const pageNumber = Math.max(1, parseInt(page) || 1);
    const limitNumber = Math.max(1, Math.min(100, parseInt(limit) || 50)); // Cap at 100 for filter options
    const offset = (pageNumber - 1) * limitNumber;

    // Build the category filter condition
    let categoryFilter = "";
    if (userCategory.toLowerCase() === "admin") {
      // Admin can see all categories
      categoryFilter = "";
    } else if (["cata", "catb", "catc"].includes(userCategory.toLowerCase())) {
      // Map user categories to database values
      const categoryMap = {
        cata: "A",
        catb: "B",
        catc: "C",
      };
      const dbCategory = categoryMap[userCategory.toLowerCase()];
      categoryFilter = `AND c.category = '${dbCategory}'`;
    } else {
      return res.status(400).json({
        success: false,
        error: "Invalid category. Must be 'cata', 'catb', 'catc', or 'admin'",
      });
    }

    // NEW: Add rejected filter for all filter options queries
    let rejectedFilter = "";
    if (include_rejected === "true") {
      // Don't filter by rejected status - show all
      rejectedFilter = "";
    } else if (rejected === "true") {
      // Only show rejected contacts
      rejectedFilter = "AND (c.rejected = true OR c.rejected IS NULL)";
    } else {
      // Default: Only show non-rejected contacts
      rejectedFilter = "AND (c.rejected = false OR c.rejected IS NULL)";
    }

    // ✅ FILTER OPTIONS WITH PAGINATION
    const genders = await db`
      SELECT DISTINCT gender as value, COUNT(*)::text as count 
      FROM contact c WHERE gender IS NOT NULL 
      ${categoryFilter ? db.unsafe(categoryFilter) : db``}
      ${rejectedFilter ? db.unsafe(rejectedFilter) : db``}
      GROUP BY gender 
      ORDER BY count DESC
      LIMIT ${limitNumber}
      OFFSET ${offset}
    `;

    const categories = await db`
      SELECT DISTINCT category as value, COUNT(*)::text as count 
      FROM contact c WHERE category IS NOT NULL 
      ${categoryFilter ? db.unsafe(categoryFilter) : db``}
      ${rejectedFilter ? db.unsafe(rejectedFilter) : db``}
      GROUP BY category 
      ORDER BY count DESC
      LIMIT ${limitNumber}
      OFFSET ${offset}
    `;

    const nationalities = await db`
      SELECT DISTINCT nationality as value, COUNT(*)::text as count 
      FROM contact c 
      WHERE nationality IS NOT NULL 
      ${categoryFilter ? db.unsafe(categoryFilter) : db``}
      ${rejectedFilter ? db.unsafe(rejectedFilter) : db``}
      GROUP BY nationality 
      ORDER BY count DESC
      LIMIT ${limitNumber}
      OFFSET ${offset}
    `;

    const maritalStatuses = await db`
      SELECT DISTINCT marital_status as value, COUNT(*)::text as count 
      FROM contact c 
      WHERE marital_status IS NOT NULL 
      ${categoryFilter ? db.unsafe(categoryFilter) : db``}
      ${rejectedFilter ? db.unsafe(rejectedFilter) : db``}
      GROUP BY marital_status 
      ORDER BY count DESC
      LIMIT ${limitNumber}
      OFFSET ${offset}
    `;

    const countries = await db`
      SELECT DISTINCT ca.country as value, COUNT(DISTINCT c.contact_id)::text as count
      FROM contact c JOIN contact_address ca ON c.contact_id = ca.contact_id
      WHERE ca.country IS NOT NULL 
      ${categoryFilter ? db.unsafe(categoryFilter) : db``}
      ${rejectedFilter ? db.unsafe(rejectedFilter) : db``}
      GROUP BY ca.country 
      ORDER BY count DESC
      LIMIT ${limitNumber}
      OFFSET ${offset}
    `;

    const states = await db`
      SELECT DISTINCT ca.state as value, COUNT(DISTINCT c.contact_id)::text as count
      FROM contact c JOIN contact_address ca ON c.contact_id = ca.contact_id
      WHERE ca.state IS NOT NULL 
      ${categoryFilter ? db.unsafe(categoryFilter) : db``}
      ${rejectedFilter ? db.unsafe(rejectedFilter) : db``}
      GROUP BY ca.state 
      ORDER BY count DESC
      LIMIT ${limitNumber}
      OFFSET ${offset}
    `;

    const cities = await db`
      SELECT DISTINCT ca.city as value, COUNT(DISTINCT c.contact_id)::text as count
      FROM contact c JOIN contact_address ca ON c.contact_id = ca.contact_id
      WHERE ca.city IS NOT NULL 
      ${categoryFilter ? db.unsafe(categoryFilter) : db``}
      ${rejectedFilter ? db.unsafe(rejectedFilter) : db``}
      GROUP BY ca.city 
      ORDER BY count DESC
      LIMIT ${limitNumber}
      OFFSET ${offset}
    `;

    const companies = await db`
      SELECT DISTINCT exp.company as value, COUNT(DISTINCT c.contact_id)::text as count
      FROM contact c JOIN contact_experience exp ON c.contact_id = exp.contact_id
      WHERE exp.company IS NOT NULL 
      ${categoryFilter ? db.unsafe(categoryFilter) : db``}
      ${rejectedFilter ? db.unsafe(rejectedFilter) : db``}
      GROUP BY exp.company 
      ORDER BY count DESC
      LIMIT ${limitNumber}
      OFFSET ${offset}
    `;

    const jobTitles = await db`
      SELECT DISTINCT exp.job_title as value, COUNT(DISTINCT c.contact_id)::text as count
      FROM contact c JOIN contact_experience exp ON c.contact_id = exp.contact_id
      WHERE exp.job_title IS NOT NULL 
      ${categoryFilter ? db.unsafe(categoryFilter) : db``}
      ${rejectedFilter ? db.unsafe(rejectedFilter) : db``}
      GROUP BY exp.job_title 
      ORDER BY count DESC
      LIMIT ${limitNumber}
      OFFSET ${offset}
    `;

    const pgCourses = await db`
      SELECT DISTINCT ce.pg_course_name as value, COUNT(DISTINCT c.contact_id)::text as count
      FROM contact c JOIN contact_education ce ON c.contact_id = ce.contact_id
      WHERE ce.pg_course_name IS NOT NULL 
      ${categoryFilter ? db.unsafe(categoryFilter) : db``}
      ${rejectedFilter ? db.unsafe(rejectedFilter) : db``}
      GROUP BY ce.pg_course_name 
      ORDER BY count DESC
      LIMIT ${limitNumber}
      OFFSET ${offset}
    `;

    const ugCourses = await db`
      SELECT DISTINCT ce.ug_course_name as value, COUNT(DISTINCT c.contact_id)::text as count
      FROM contact c JOIN contact_education ce ON c.contact_id = ce.contact_id
      WHERE ce.ug_course_name IS NOT NULL 
      ${categoryFilter ? db.unsafe(categoryFilter) : db``}
      ${rejectedFilter ? db.unsafe(rejectedFilter) : db``}
      GROUP BY ce.ug_course_name 
      ORDER BY count DESC
      LIMIT ${limitNumber}
      OFFSET ${offset}
    `;

    // ✅ ENHANCED SKILLS PROCESSING WITH PAGINATION
    const skillsQuery =
      userCategory.toLowerCase() === "admin"
        ? rejectedFilter
          ? db`SELECT skills FROM contact c WHERE skills IS NOT NULL AND skills != '' ${db.unsafe(rejectedFilter)} LIMIT ${limitNumber * 2} OFFSET ${offset}`
          : db`SELECT skills FROM contact WHERE skills IS NOT NULL AND skills != '' LIMIT ${limitNumber * 2} OFFSET ${offset}`
        : db`SELECT skills FROM contact c WHERE skills IS NOT NULL AND skills != '' ${db.unsafe(categoryFilter)} ${rejectedFilter ? db.unsafe(rejectedFilter) : db``} LIMIT ${limitNumber * 2} OFFSET ${offset}`;

    const skillsData = await skillsQuery;

    const skillCounts = {};
    skillsData.forEach((row) => {
      if (row.skills) {
        const skills = row.skills
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s);
        skills.forEach((skill) => {
          skillCounts[skill] = (skillCounts[skill] || 0) + 1;
        });
      }
    });

    // ✅ APPLY PAGINATION TO SKILLS RESULTS
    const skills = Object.entries(skillCounts)
      .map(([skill, count]) => ({ value: skill, count: count.toString() }))
      .sort((a, b) => parseInt(b.count) - parseInt(a.count))
      .slice(0, limitNumber); // Apply limit to skills

    // ✅ GET TOTAL COUNTS FOR PAGINATION INFO
    const [totalGendersResult] = await db`
      SELECT COUNT(DISTINCT gender) as total
      FROM contact c WHERE gender IS NOT NULL 
      ${categoryFilter ? db.unsafe(categoryFilter) : db``}
      ${rejectedFilter ? db.unsafe(rejectedFilter) : db``}
    `;

    const totalPages = Math.ceil(parseInt(totalGendersResult.total) / limitNumber);

    return res.json({
      success: true,
      data: {
        genders,
        categories,
        nationalities,
        marital_statuses: maritalStatuses,
        countries,
        states,
        cities,
        companies,
        job_titles: jobTitles,
        pg_courses: pgCourses,
        ug_courses: ugCourses,
        skills,
      },
      pagination: {
        current_page: pageNumber,
        total_pages: totalPages,
        limit: limitNumber,
        offset: offset,
        has_next: pageNumber < totalPages,
        has_previous: pageNumber > 1,
      },
      filters_applied: {
        category_filter:
          userCategory !== "admin"
            ? `Category filtered for ${userCategory}`
            : "No category filter (admin access)",
        rejected_filter: include_rejected === "true" 
          ? "All contacts (rejected and non-rejected)" 
          : rejected === "true" 
            ? "Only rejected contacts"
            : "Only non-rejected contacts (default)",
      },
    });
  } catch (err) {
    console.error("GetFilterOptions error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
