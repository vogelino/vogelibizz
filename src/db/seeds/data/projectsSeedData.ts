import { projectStatusEnum } from "@/db/schema";
import clientSeeds from "./clientsSeedData";

function randomItemFromArray<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const projectsSeedData = [
  {
    name: "Project 1",
    description: "Project 1 description",
    status: randomItemFromArray(projectStatusEnum.enumValues),
    content: "Project 1 content",
    clients: [clientSeeds[0], clientSeeds[1]],
    invoices: [
      { name: "Invoice 1", date: "2022-01-01" },
      { name: "Invoice 2", date: "2022-02-01" },
    ],
    quotes: [{ name: "Quote 1", date: "2022-01-01" }],
  },
  {
    name: "Project 2",
    description: "Project 2 description",
    status: randomItemFromArray(projectStatusEnum.enumValues),
    content: "Project 2 content",
    clients: [clientSeeds[2]],
    invoices: [{ name: "Invoice 3", date: "2022-03-01" }],
    quotes: [
      { name: "Quote 2", date: "2022-02-01" },
      { name: "Quote 3", date: "2022-03-01" },
    ],
  },
  {
    name: "Project 3",
    description: "Project 3 description",
    status: randomItemFromArray(projectStatusEnum.enumValues),
    content: "Project 3 content",
    clients: [clientSeeds[0], clientSeeds[2]],
    invoices: [
      { name: "Invoice 4", date: "2022-01-01" },
      { name: "Invoice 5", date: "2022-02-01" },
    ],
    quotes: [
      { name: "Quote 4", date: "2022-04-01" },
      { name: "Quote 5", date: "2022-05-01" },
    ],
  },
];

export default projectsSeedData;
