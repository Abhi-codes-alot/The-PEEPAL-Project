require('dotenv').config();
const neo4j = require('neo4j-driver');

// 1. Initialize the Neo4j Driver
const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

/**
 * CORE ENGINE: Test the connection
 */
async function testConnection() {
    console.log("Connecting to Peepal Project Database...");
    const session = driver.session();
    try {
        const result = await session.run("RETURN 'Connection Successful' AS message");
        console.log(`✅ ${result.records[0].get('message')}!`);
    } catch (error) {
        console.error("❌ Connection Failed!", error.message);
        process.exit(1); // Stop if we can't connect
    } finally {
        await session.close();
    }
}

/**
 * PEEPAL LOGIC: Add or update a Person node
 */
async function addPerson(uid, name, isDeceased = false) {
    const session = driver.session();
    try {
        const query = `
            MERGE (p:Person {uid: $uid})
            SET p.name = $name, p.is_deceased = $isDeceased
            RETURN p.name AS name
        `;
        await session.run(query, { uid, name, isDeceased });
        console.log(`👤 Added/Updated: ${name}`);
    } finally {
        await session.close();
    }
}

/**
 * RELATIONSHIP LOGIC: Link parent to child
 */
async function addParentChildRelation(parentId, childId) {
    const session = driver.session();
    try {
        const query = `
            MATCH (p:Person {uid: $parentId})
            MATCH (c:Person {uid: $childId})
            MERGE (p)-[:PARENT_OF]->(c)
            RETURN p.name + ' is now parent of ' + c.name AS msg
        `;
        const result = await session.run(query, { parentId, childId });
        if (result.records.length > 0) {
            console.log(`🔗 ${result.records[0].get('msg')}`);
        }
    } finally {
        await session.close();
    }
}

/**
 * MAIN EXECUTION
 */
async function runProject() {
    await testConnection();

    console.log("\n--- Building your Peepal Tree ---");
    
    // Create the people
    await addPerson("gpa_01", "Grandpa Peepal", true);
    await addPerson("dad_01", "Father Peepal", false);
    await addPerson("user_01", "Abhi", false);

    // Create the links (The Tree)
    await addParentChildRelation("gpa_01", "dad_01");
    await addParentChildRelation("dad_01", "user_01");

    console.log("\n✅ Tree update complete. Check Neo4j Browser!");
    await driver.close();
}

runProject();