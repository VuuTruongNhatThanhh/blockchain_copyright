const CreateWork = artifacts.require("Marketplace");

contract("Marketplace", accounts => {
    it("should create a new work", async () => {
        const createWorkInstance = await CreateWork.deployed();
        const title = "My Masterpiece";
        const yearCreate = 2024;
        const describe = "Description of my masterpiece";
        const category = "Type of my masterpiece";
        const nameCreator = "John Doe";
        const phone = 123456789;
        const price = 100;

        const result = await createWorkInstance.createWork(title, yearCreate, describe, category, nameCreator, phone, price, { from: accounts[0] });

        assert.equal(result.logs[0].event, "WorkCreated", "WorkCreated event should be emitted");
        assert.equal(result.logs[0].args.id.toNumber(), 0, "Work ID should be 0");
        assert.equal(result.logs[0].args.title, title, "Work title should match");
        assert.equal(result.logs[0].args.yearCreate.toNumber(), yearCreate, "Work yearCreate should match");
        assert.equal(result.logs[0].args.describe, describe, "Work describe should match");
        assert.equal(result.logs[0].args.category, category, "Work type should match");
        assert.equal(result.logs[0].args.nameCreator, nameCreator, "Work nameCreator should match");
        assert.equal(result.logs[0].args.phone.toNumber(), phone, "Work phone should match");
        assert.equal(result.logs[0].args.price.toNumber(), price, "Work price should match");

        const workCount = await createWorkInstance.getWorkCount();
        assert.equal(workCount.toNumber(), 1, "Work count should be 1");
    });

    it("should update an existing work", async () => {
        const marketplaceInstance = await CreateWork.deployed();
        const title = "Updated Masterpiece";
        const yearCreate = 2025;
        const describe = "Updated description of my masterpiece";
        const category = "Updated type of my masterpiece";
        const nameCreator = "Jane Doe";
        const phone = 987654321;
        const price = 200;

        const result = await marketplaceInstance.updateWork(0, title, yearCreate, describe, category, nameCreator, phone, price, { from: accounts[0] });

        assert.equal(result.logs[0].event, "WorkUpdated", "WorkUpdated event should be emitted");
        assert.equal(result.logs[0].args.id.toNumber(), 0, "Work ID should be 0");
        assert.equal(result.logs[0].args.title, title, "Work title should match");
        assert.equal(result.logs[0].args.yearCreate.toNumber(), yearCreate, "Work yearCreate should match");
        assert.equal(result.logs[0].args.describe, describe, "Work describe should match");
        assert.equal(result.logs[0].args.category, category, "Work category should match");
        assert.equal(result.logs[0].args.nameCreator, nameCreator, "Work nameCreator should match");
        assert.equal(result.logs[0].args.phone.toNumber(), phone, "Work phone should match");
        assert.equal(result.logs[0].args.price.toNumber(), price, "Work price should match");
    });
});
