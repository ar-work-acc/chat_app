import {FriendRequest, Message, User} from '../database/models';
import mongoose from 'mongoose';
import {logging} from '../utils/logger';

const logger = logging(new URL('', import.meta.url).pathname);

export const getFriends = async (ctx) => {
  const userId = ctx.state.user._id;
  const user = await User.findOne({_id: userId}).populate({
    path: 'friends',
    select: '-password',
  });
  ctx.body = user.friends;
};

/**
 * Get friend data for user. Check if it's a friend first.
 *
 * @param {Context} ctx
 */
export const getFriendData = async (ctx) => {
  const userId = ctx.state.user._id;
  const {friendId} = ctx.params;

  const user = await User.findById(userId);
  if (user.friends.includes(friendId)) {
    const friend = await User.findById(friendId).select(
        '_id avatar firstName lastName username',
    );
    ctx.status = 200;
    ctx.body = friend;
    return;
  } else {
    ctx.status = 403;
  }
};

export const getMessages = async (ctx) => {
  const {page = 0, pageSize = 100} = ctx.request.query;

  const userId = ctx.state.user._id;
  const {friendId} = ctx.params;

  const messages = await Message.find({
    $or: [
      {from: userId, to: friendId},
      {from: friendId, to: userId},
    ],
  })
      .sort({date: -1})
      .skip(page * pageSize)
      .limit(pageSize);

  messages.reverse();

  ctx.body = messages;
};

/**
 * Query params:
 * page, pageSize: pagination; q: for searching username
 *
 * @param {Context} ctx
 */
export const getNonFriendUsers = async (ctx) => {
  const {page = 0, pageSize = 100, q = ''} = ctx.request.query;

  const user = await User.findOne({_id: ctx.state.user._id});
  const users = await User.find(
      {_id: {$nin: [...user.friends, user._id]}, username: {$regex: q}},
      '_id username firstName lastName',
  )
      .sort({username: 1})
      .skip(page * pageSize)
      .limit(pageSize);

  ctx.body = users;
};

export const addFriendRequest = async (ctx) => {
  const userId = ctx.state.user._id;
  const {targetUserId} = ctx.request.body;

  const friendRequest = await FriendRequest.findOneAndUpdate(
      {from: userId, to: targetUserId},
      // set processed = false to process it again
      {$set: {date: new Date(), processed: false}},
      {upsert: true, new: true},
  );

  ctx.body = friendRequest;
};

/**
 * Get friend requests for this user.
 *
 * @param {Context} ctx
 */
export const getFriendRequests = async (ctx) => {
  const {page = 0, pageSize = 100} = ctx.request.query;

  const friendRequests = await FriendRequest.find({
    to: ctx.state.user._id,
    processed: false,
  })
      .sort('-date')
      .skip(page * pageSize)
      .limit(pageSize)
      .populate({
        path: 'from',
        select: '_id username firstName lastName',
      });

  ctx.body = friendRequests;
};

/**
 * Get friend requests that the user sent but is not processed yet.
 *
 * @param {Context} ctx
 */
export const getUserFriendRequest = async (ctx) => {
  const {page = 0, pageSize = 100} = ctx.request.query;
  const requests = await FriendRequest.find({
    from: ctx.state.user._id,
    processed: false,
  })
      .sort('-date')
      .skip(page * pageSize)
      .limit(pageSize);
  ctx.body = requests;
};

export const acceptFriendRequest = async (ctx) => {
  const userId = ctx.state.user._id;
  const {targetUserId} = ctx.request.body;
  logger.debug(`User ${userId} accepting ${targetUserId} 's friend request.`);

  const friendRequest = await FriendRequest.findOne({
    from: targetUserId,
    to: userId,
    processed: false,
  });
  if (!friendRequest) {
    ctx.body = {message: 'Friend request not found or already processed.'};
    return;
  }

  const user = await User.findById(userId);
  const targetUser = await User.findById(targetUserId);

  try {
    // Start a transaction using Mongoose's default connection
    const session = await mongoose.startSession();
    session.startTransaction();

    // these 3 should operations finish together:
    friendRequest.processed = true;
    await friendRequest.save({session});

    if (!user.friends.includes(targetUserId)) {
      user.friends.push(targetUserId);
    }
    await user.save({session});

    if (!targetUser.friends.includes(userId)) {
      targetUser.friends.push(userId);
    }
    await targetUser.save({session});

    await session.commitTransaction();
    await session.endSession();
    ctx.status = 200;
    ctx.body = {message: 'Friend added'};
  } catch (e) {
    console.log('Error', e.stack);
    console.log('Error', e.name);
    console.log('Error', e.message);
    ctx.status = 500;
    ctx.body = {message: 'Error accepting friend request.'};
  }
};
