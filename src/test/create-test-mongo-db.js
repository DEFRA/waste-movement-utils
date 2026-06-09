// `config`, `MongoClient` and `MongoMemoryReplSet` are injected by the caller
// so this helper has no runtime dependencies on the consuming service
export const createTestMongoDb = async ({
  config,
  MongoClient,
  MongoMemoryReplSet,
  useReplicaSet
}) => {
  const mongoConfig = config.get('mongo')
  let replicaSet
  let mongoUri = mongoConfig.uri

  // Need to use mongodb-memory-server for testing transactions as jest-mongodb
  // doesn't support that, see https://github.com/shelfio/jest-mongodb/issues/152
  if (useReplicaSet) {
    replicaSet = await MongoMemoryReplSet.create({
      instanceOpts: [
        {
          port: 17017
        }
      ],
      replSet: {
        dbName: mongoConfig.databaseName,
        count: 1,
        storageEngine: 'wiredTiger'
      }
    })

    mongoUri = replicaSet.getUri()
  }

  const client = new MongoClient(mongoUri)
  await client.connect()
  return {
    client,
    db: client.db(mongoConfig.databaseName),
    mongoUri,
    replicaSet
  }
}
