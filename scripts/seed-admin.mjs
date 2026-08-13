import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const mongoUri = process.env.MONGO_URI;
const email = process.env.EMAIL || "icccc@cutm.ac.in";
const password = process.env.ADMIN_PASSWORD || "12345678";

if (!mongoUri) {
  console.error("Missing MONGO_URI in .env");
  process.exit(1);
}

const AdminRole = {
  SUPER_ADMIN: "super_admin",
};

const permissions = [
  "manage_employees",
  "manage_tables",
  "view_orders",
  "manage_orders",
  "manage_inventory",
  "view_analytics",
  "system_settings",
  "manage_admins",
];

const AdminSchema = new mongoose.Schema(
  {
    name: String,
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: String,
    role: String,
    permissions: [String],
    adminid: String,
    isActive: { type: Boolean, default: true },
    resname: String,
    joinDate: Date,
  },
  { timestamps: true }
);

const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

try {
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");

  const hashedPassword = await bcrypt.hash(password, 12);
  const existing = await Admin.findOne({ email });

  if (existing) {
    existing.name = "CCC Super Admin";
    existing.username = existing.username || "admin";
    existing.password = hashedPassword;
    existing.role = AdminRole.SUPER_ADMIN;
    existing.permissions = permissions;
    existing.isActive = true;
    existing.resname = "Centurion Coffee Connect";
    await existing.save();
    console.log("Updated existing admin");
  } else {
    await Admin.create({
      name: "CCC Super Admin",
      username: "admin",
      email,
      password: hashedPassword,
      role: AdminRole.SUPER_ADMIN,
      permissions,
      adminid: `ADMIN_${Date.now()}`,
      isActive: true,
      resname: "Centurion Coffee Connect",
      joinDate: new Date(),
    });
    console.log("Created new admin");
  }

  console.log("Admin seeded");
  console.log(`Email: ${email}`);
  console.log(`Username: admin`);
  console.log(`Password: ${password}`);
  console.log("Role: super_admin");

  await mongoose.disconnect();
  process.exit(0);
} catch (error) {
  console.error("Failed to seed admin:", error);
  await mongoose.disconnect();
  process.exit(1);
}
