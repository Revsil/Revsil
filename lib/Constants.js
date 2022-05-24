const Constants = {
  VerificationLevel: {
    NONE: 0,
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3
  },

  MFALevels: {
    NONE: 0,
    ELEVATED: 1
  },
  
  UserNotificationSettings: {
    ALL_MESSAGES: 0,
    ONLY_MENTIONS: 1,
    NO_MESSAGES: 2,
    NULL: 3
  },
  
  MessageTypes: {
    DEFAULT: 0,
    RECIPIENT_ADD: 1,
    RECIPIENT_REMOVE: 2,
    CALL: 3,
    CHANNEL_NAME_CHANGE: 4,
    CHANNEL_ICON_CHANGE: 5,
    CHANNEL_PINNED_MESSAGE: 6
  },
  Events: {
	  READY: "Ready",
	  AUTHENTICATED: "Authenticated",
	  MESSAGE: "Message",
	  PONG: "Pong"
  },
}
module.exports = Constants;