import db, { initDatabase } from '../config/db.js';

const promoteAdmin = () => {
  const email = process.argv[2]?.trim().toLowerCase();

  if (!email) {
    console.error('Please provide the registered email address of the user.');
    console.error('Example: node --experimental-sqlite backend/scripts/promoteAdmin.js admin@example.com');
    process.exitCode = 1;
    return;
  }

  try {
    initDatabase();

    // Query for existing account by email (case-insensitive)
    const user = db.prepare('SELECT user_id, full_name, email, role FROM users WHERE LOWER(email) = ?').get(email);

    if (!user) {
      console.error(`No registered account was found for ${email}.`);
      console.error('Register the account through CampusNest first, then try again.');
      process.exitCode = 1;
      return;
    }

    // Promote the user role to admin
    db.prepare("UPDATE users SET role = 'admin' WHERE user_id = ?").run(user.user_id);

    console.log('\nAdministrator account updated successfully!');
    console.log('---------------------------------------------');
    console.log(`User ID: ${user.user_id}`);
    console.log(`Name:    ${user.full_name}`);
    console.log(`Email:   ${user.email}`);
    console.log('Role:    admin');
    console.log('---------------------------------------------');
    console.log('You can now log in using this administrator account.');
  } catch (error) {
    console.error('Failed to promote user to administrator:', error.message);
    process.exitCode = 1;
  }
};

promoteAdmin();
