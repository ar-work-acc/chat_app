import mongoose from 'mongoose';
import {
  MONGODB_HOST,
  MONGODB_USERNAME,
  MONGODB_PASSWORD,
  MONGODB_DB_NAME,
  MONGODB_PORT,
} from '../config/index';
import {logging} from '../utils/logger';
import {FriendRequest, Message, User} from './models';
import bcrypt from 'bcrypt';

const logger = logging(new URL('', import.meta.url).pathname);
const delay = async () =>
  await new Promise((resolve) => setTimeout(resolve, 1));

try {
  logger.debug(`Connection to MongoDB: ${MONGODB_HOST}:${MONGODB_PORT}`);

  await mongoose.connect(`mongodb://${MONGODB_HOST}:${MONGODB_PORT}/?replicaSet=myReplicaSet`, {
    user: MONGODB_USERNAME,
    pass: MONGODB_PASSWORD,
    dbName: MONGODB_DB_NAME,
    autoCreate: true,
  });

  logger.debug(`Empty collections...`);
  await User.deleteMany({});
  await Message.deleteMany({});
  await FriendRequest.deleteMany({});

  logger.debug(`Create users...`);

  // create initial users
  const alice = new User({
    username: 'alice@meowfish.org',
    password: bcrypt.hashSync('111', 10),
    firstName: 'Alice',
    lastName: 'McGee',
  });
  await alice.save();

  const bob = new User({
    username: 'bob@meowfish.org',
    password: bcrypt.hashSync('222', 10),
    firstName: 'Bobby',
    lastName: 'Singer',
  });
  await bob.save();

  const cathy = new User({
    username: 'cathy@meowfish.org',
    password: bcrypt.hashSync('333', 10),
    firstName: 'Cathy',
    lastName: 'Chen',
    friends: [alice._id, bob._id],
  });
  await cathy.save();

  alice.friends = [bob._id, cathy._id];
  await alice.save();
  bob.friends = [cathy._id, alice._id];
  await bob.save();

  // sample messages:
  logger.debug(`Create messages...`);

  // alice & bob's conversation:
  await new Message({
    from: alice,
    to: bob,
    content: 'Hi Bob! How are you?',
  }).save();

  await new Message({
    from: bob,
    to: alice,
    content: 'I\'m fine. Thank you.',
  }).save();

  await new Message({
    from: alice,
    to: bob,
    content: 'Let\'s go on a picnic.',
  }).save();

  await new Message({
    from: bob,
    to: alice,
    content: 'Sure. Why not?',
  }).save();

  // alice & cathy's conversation:
  await new Message({
    from: alice,
    to: cathy,
    content: 'Hi Cathy!',
  }).save();

  await new Message({
    from: cathy,
    to: alice,
    content: 'Hi Alice! What a great day!',
  }).save();

  for (let i = 0; i < 100; i++) {
    await new Message({
      from: alice,
      to: cathy,
      content: `alice: ${i}`,
    }).save();
    await delay();

    await new Message({
      from: cathy,
      to: alice,
      content: `cathy: ${i}`,
    }).save();
    await delay();
  }

  for (const x of 'abcdef') {
    await new User({
      username: `${x}@meowfish.org`,
      password: bcrypt.hashSync('123', 10),
      firstName: `${x}_firstName`,
      lastName: `${x}_lastName`,
    }).save();
  }

  logger.debug('Done!');
} catch (error) {
  logger.error('MongoDB connection error!', error);
} finally {
  await mongoose.disconnect();
}
