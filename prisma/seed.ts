import { PrismaClient } from "@prisma/client";

// Ensure DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

console.log("✅ DATABASE_URL is set");
console.log("📦 Creating Prisma client...");

let prisma: PrismaClient | null = null;
try {
  prisma = new PrismaClient({
    log: ["warn", "error"],
  });
  console.log("✅ Prisma client created successfully");
} catch (error) {
  console.error("❌ Failed to create Prisma client:", error);
  process.exit(1);
}

async function main() {
  try {
    if (!prisma) {
      throw new Error("Prisma client is null");
    }

    console.log("🌱 Seeding database with mock data...");
    console.log(
      `📍 Connected to: ${process.env.DATABASE_URL?.split("@")[1]?.split("?")[0]}`,
    );

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await prisma.walletSession.deleteMany({});
    await prisma.policy.deleteMany({});

    // Create mock wallet addresses
    const wallet1 = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX7Q";
    const wallet2 = "YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY7Q";
    const wallet3 = "ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZQ";

    // Create wallet sessions
    const session1 = await prisma.walletSession.create({
      data: {
        walletAddress: wallet1,
        isActive: true,
        connectedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        lastActivityAt: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
      },
    });

    const session2 = await prisma.walletSession.create({
      data: {
        walletAddress: wallet2,
        isActive: true,
        connectedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        lastActivityAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
    });

    const session3 = await prisma.walletSession.create({
      data: {
        walletAddress: wallet3,
        isActive: false,
        connectedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        lastActivityAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
    });

    console.log("✓ Created wallet sessions");

    // Wallet 1 policies - Active flight insurance + Paid payout
    const policy1Active = await prisma.policy.create({
      data: {
        walletAddress: wallet1,
        productId: "flight",
        coverage: 50000000, // $50k coverage
        premium: 2500000, // $2.5k premium
        buyTxId: "TXN_FLIGHT_001_ACTIVE",
        lastOracleCheckTxId: "TXN_ORACLE_001",
        status: "active",
        delayMinutes: null,
        lastOracleCheckAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
        updatedAt: new Date(Date.now() - 60 * 60 * 1000),
      },
    });

    const policy1Paid = await prisma.policy.create({
      data: {
        walletAddress: wallet1,
        productId: "flight",
        coverage: 30000000, // $30k coverage
        premium: 1500000, // $1.5k premium
        buyTxId: "TXN_FLIGHT_002_PAID",
        lastOracleCheckTxId: "TXN_ORACLE_002",
        payoutTxId: "TXN_PAYOUT_001",
        status: "paid",
        delayMinutes: 245, // 4h 5m delay
        lastOracleCheckAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        payoutTriggeredAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        createdAt: new Date(Date.now() - 96 * 60 * 60 * 1000), // 4 days ago
        updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      },
    });

    console.log("✓ Created policies for Wallet 1 (Active + Paid)");

    // Wallet 2 policies - Multiple active weather policies
    const policy2Weather = await prisma.policy.create({
      data: {
        walletAddress: wallet2,
        productId: "weather",
        coverage: 20000000, // $20k coverage
        premium: 800000, // $0.8k premium
        buyTxId: "TXN_WEATHER_001",
        status: "active",
        lastOracleCheckAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000), // 3 days ago
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    });

    const policy2Cargo = await prisma.policy.create({
      data: {
        walletAddress: wallet2,
        productId: "cargo",
        coverage: 100000000, // $100k coverage
        premium: 5000000, // $5k premium
        buyTxId: "TXN_CARGO_001",
        status: "active",
        lastOracleCheckAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        createdAt: new Date(Date.now() - 168 * 60 * 60 * 1000), // 7 days ago
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    });

    console.log("✓ Created policies for Wallet 2 (Weather + Cargo)");

    // Wallet 3 - Inactive but has policies
    const policy3Paid = await prisma.policy.create({
      data: {
        walletAddress: wallet3,
        productId: "flight",
        coverage: 40000000, // $40k coverage
        premium: 2000000, // $2k premium
        buyTxId: "TXN_FLIGHT_003",
        payoutTxId: "TXN_PAYOUT_002",
        status: "paid",
        delayMinutes: 360, // 6h delay
        lastOracleCheckAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        payoutTriggeredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    });

    console.log(
      "✓ Created policies for Wallet 3 (Inactive session, Paid policy)",
    );

    // Summary
    const allPolicies = await prisma.policy.findMany();
    const allSessions = await prisma.walletSession.findMany();

    console.log("\n📊 Database seeded successfully!");
    console.log(`   • Wallet Sessions: ${allSessions.length}`);
    console.log(
      `   • Active Sessions: ${allSessions.filter((s) => s.isActive).length}`,
    );
    console.log(`   • Policies: ${allPolicies.length}`);
    console.log(
      `   • Active Policies: ${allPolicies.filter((p) => p.status === "active").length}`,
    );
    console.log(
      `   • Paid Policies: ${allPolicies.filter((p) => p.status === "paid").length}`,
    );
    console.log(`\n💡 Mock Wallet Addresses (for testing):`);
    console.log(`   1. ${wallet1} (Active, 2 policies)`);
    console.log(`   2. ${wallet2} (Active, 2 policies)`);
    console.log(`   3. ${wallet3} (Inactive, 1 policy)`);
  } catch (e) {
    console.error("❌ Seed error:", e);
    process.exit(1);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

main();
