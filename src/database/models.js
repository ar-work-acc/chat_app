import mongoose from 'mongoose';

const {Schema, model} = mongoose;

export const User = model(
    'User',
    new Schema({
    // username should be registered e-mail address
      username: {type: String, required: true, unique: true, index: true},

      // password is the hash of user defined password,
      // or undefined if using Google/FB OAuth
      password: {type: String, required: false},

      facebookAccountConnected: {type: Boolean, default: false},
      googleAccountConnected: {type: Boolean, default: false},

      created: {type: Date, default: () => new Date(), required: true},
      lastUpdated: {type: Date, required: false},
      firstName: {type: String, default: ''},
      lastName: {type: String, default: ''},
      avatar: {type: String, default: ''},

      friends: [{type: Schema.Types.ObjectId, ref: 'User'}],
    }),
);

export const Message = model(
    'Message',
    new Schema({
      from: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
      },
      to: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
      },
      content: {
        type: String,
        default: '',
        required: true,
      },
      date: {type: Date, default: () => new Date(), required: true},
    }),
);

const friendRequestSchema = new Schema({
  from: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  to: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  date: {type: Date, default: () => new Date(), required: true},
  processed: {type: Boolean, default: false, required: true},
});

friendRequestSchema.index({from: 1, to: 1}, {unique: true});

export const FriendRequest = model('FriendRequest', friendRequestSchema);
