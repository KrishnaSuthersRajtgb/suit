// One-off script to seed Plants and a couple of test login users.
// Run with: node seed.js
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Plant = require("./models/Plant");
const User = require("./models/User");

const PLANTS = [
  {
    plantCode: "KKIN-JAI",
    plantName: "Jaipur Plant",
    location:
      "Kerakoll India Pvt. Ltd. Plot No 02-01, 01A & 62, Domestic Tariff Area (DTA) - 02 Sub. PO - Mahindra World City Jaipur, Tehsil - Sanganer, Jaipur, Rajasthan Pincode - 302037, India, Asia (Organization: Kerakoll India Private Limited)",
  },
];

const run = async () => {
  await connectDB();

  const plantDocs = [];
  for (const p of PLANTS) {
    const plant = await Plant.findOneAndUpdate({ plantCode: p.plantCode }, p, {
      upsert: true,
      new: true,
    });
    plantDocs.push(plant);
  }
  console.log(`Seeded ${plantDocs.length} plants.`);

  const jaipurPlant = plantDocs.find((p) => p.plantCode === "KKIN-JAI");

  const testUsers = [
  { username: "admin1", password: "Admin@123", role: "ADMIN", fullName: "Test Admin" },
  { username: "manager1", password: "Manager@123", role: "MANAGER", fullName: "Test Manager" },
  { username: "security1", password: "Security@123", role: "SECURITY", fullName: "Test Security Guard" },
];

  for (const u of testUsers) {
    const existing = await User.findOne({ username: u.username });
    if (existing) {
      // User already exists — but it may still be pointing at a plant that
      // was since deleted (e.g. after re-seeding with a new plant list).
      // Re-point it to the current plant rather than silently skipping,
      // so login doesn't fail with "not registered for the selected plant".
      if (String(existing.plant) !== String(jaipurPlant._id)) {
        existing.plant = jaipurPlant._id;
        existing.status = "ACTIVE";
        await existing.save();
        console.log(`Updated user "${u.username}" to plant ${jaipurPlant.plantCode}.`);
      } else {
        console.log(`User "${u.username}" already registered for ${jaipurPlant.plantCode}, skipping.`);
      }
      continue;
    }
    const passwordHash = await User.hashPassword(u.password);
    await User.create({
      username: u.username,
      passwordHash,
      role: u.role,
      fullName: u.fullName,
      plant: jaipurPlant._id,
      status: "ACTIVE",
    });
    console.log(`Created user "${u.username}" / "${u.password}" (plant: ${jaipurPlant.plantCode})`);
  }

  await mongoose.connection.close();
  console.log("Seeding complete.");
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});