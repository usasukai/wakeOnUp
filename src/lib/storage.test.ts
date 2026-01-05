import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { getMachines, addMachine, deleteMachine, Machine } from "./storage";
import fs from "fs/promises";
import path from "path";

const TEST_FILE = "test_machines.json";

// Set environment variable for test
process.env.WOL_DATA_FILE = TEST_FILE;

const TEST_FILE_PATH = path.join(process.cwd(), TEST_FILE);

describe("Storage Logic (Unit Test)", () => {
  beforeEach(async () => {
    // Reset test file before each test
    await fs.writeFile(TEST_FILE_PATH, '[]');
  });

  afterEach(async () => {
    // Cleanup after tests
    try {
      await fs.unlink(TEST_FILE_PATH);
    } catch {}
  });

  test("should start with empty list", async () => {
    const machines = await getMachines();
    expect(machines).toEqual([]);
  });

  test("should add a machine", async () => {
    const machine: Machine = { id: "1", name: "Test PC", mac: "00:00:00:00:00:00" };
    await addMachine(machine);
    const machines = await getMachines();
    expect(machines).toHaveLength(1);
    expect(machines[0]).toEqual(machine);
  });

  test("should delete a machine", async () => {
    const machine1: Machine = { id: "1", name: "PC 1", mac: "00:00:00:00:00:00" };
    const machine2: Machine = { id: "2", name: "PC 2", mac: "11:11:11:11:11:11" };
    
    await addMachine(machine1);
    await addMachine(machine2);
    
    let machines = await getMachines();
    expect(machines).toHaveLength(2);

    await deleteMachine("1");
    
    machines = await getMachines();
    expect(machines).toHaveLength(1);
    expect(machines[0]).toEqual(machine2);
  });
});
