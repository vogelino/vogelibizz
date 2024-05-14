import projects from "./projectsSeedData";

const firstClient = projects[0].clients[0];
type ClientSeedType = typeof firstClient;

const allClients = projects
  .reduce((acc, project) => {
    for (const client of project.clients) {
      acc.set(client.name, client);
    }
    return acc;
  }, new Map<string, ClientSeedType>())
  .values();

export default Array.from(allClients);
