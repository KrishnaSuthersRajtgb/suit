// One-off script to seed Plants and a couple of test login users.
// Run with: node seed.js
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Plant = require("./models/Plant");
const User = require("./models/User");

const PLANTS = [
  { plantCode: "PLT-CHN01", plantName: "Chennai Plant 1", location: "Ambattur, Chennai" },
  { plantCode: "PLT-CHN02", plantName: "Chennai Plant 2", location: "Sriperumbudur, Chennai" },
  { plantCode: "PLT-PUN01", plantName: "Pune Plant", location: "Chakan, Pune" },
  { plantCode: "PLT-BLR01", plantName: "Bangalore Plant", location: "Peenya, Bangalore" },
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

  const chennai1 = plantDocs.find((p) => p.plantCode === "PLT-CHN01");

  const testUsers = [
  { username: "admin1", password: "Admin@123", role: "ADMIN", fullName: "Test Admin" },
  { username: "manager1", password: "Manager@123", role: "MANAGER", fullName: "Test Manager" },
  { username: "security1", password: "Security@123", role: "SECURITY", fullName: "Test Security Guard" },
];

  for (const u of testUsers) {
    const existing = await User.findOne({ username: u.username });
    if (existing) {
      console.log(`User "${u.username}" already exists, skipping.`);
      continue;
    }
    const passwordHash = await User.hashPassword(u.password);
    await User.create({
      username: u.username,
      passwordHash,
      role: u.role,
      fullName: u.fullName,
      plant: chennai1._id,
      status: "ACTIVE",
    });
    console.log(`Created user "${u.username}" / "${u.password}" (plant: ${chennai1.plantCode})`);
  }

  await mongoose.connection.close();
  console.log("Seeding complete.");
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
