/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/time_staker.json`.
 */
export type TimeStaker = {
  "address": "CwBMDgLTF4gXE7bigVyNBYJYtZ8zqp9nqVEpVk1XDo1M",
  "metadata": {
    "name": "timeStaker",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createGoal",
      "discriminator": [
        229,
        63,
        42,
        239,
        1,
        226,
        219,
        196
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "goal",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  97,
                  108
                ]
              },
              {
                "kind": "arg",
                "path": "goalId"
              }
            ]
          }
        },
        {
          "name": "globalState",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "goalId",
          "type": "u64"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "stakeAmount",
          "type": "u64"
        },
        {
          "name": "deadline",
          "type": "i64"
        }
      ]
    },
    {
      "name": "finalizeGoal",
      "discriminator": [
        78,
        113,
        239,
        183,
        131,
        106,
        46,
        199
      ],
      "accounts": [
        {
          "name": "goal",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "goal.goal_id",
                "account": "goal"
              }
            ]
          }
        },
        {
          "name": "creator",
          "writable": true
        },
        {
          "name": "globalState",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "globalState",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "authority",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "registerJudge",
      "discriminator": [
        1,
        136,
        193,
        70,
        252,
        153,
        171,
        147
      ],
      "accounts": [
        {
          "name": "judge",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  106,
                  117,
                  100,
                  103,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "judgeAuthority"
              }
            ]
          }
        },
        {
          "name": "judgeAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "globalState",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "submitProof",
      "discriminator": [
        54,
        241,
        46,
        84,
        4,
        212,
        46,
        94
      ],
      "accounts": [
        {
          "name": "goal",
          "writable": true
        },
        {
          "name": "creator",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "proofData",
          "type": "string"
        },
        {
          "name": "proofType",
          "type": {
            "defined": {
              "name": "proofType"
            }
          }
        }
      ]
    },
    {
      "name": "updateJudgeReputation",
      "discriminator": [
        0,
        16,
        10,
        173,
        252,
        7,
        87,
        31
      ],
      "accounts": [
        {
          "name": "judge",
          "writable": true
        },
        {
          "name": "voteRecord"
        },
        {
          "name": "goal"
        }
      ],
      "args": []
    },
    {
      "name": "vote",
      "discriminator": [
        227,
        110,
        155,
        23,
        136,
        126,
        172,
        25
      ],
      "accounts": [
        {
          "name": "goal",
          "writable": true
        },
        {
          "name": "judge"
        },
        {
          "name": "voteRecord",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  111,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "goal.goal_id",
                "account": "goal"
              },
              {
                "kind": "account",
                "path": "judgeAuthority"
              }
            ]
          }
        },
        {
          "name": "judgeAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "vote",
          "type": "bool"
        }
      ]
    },
    {
      "name": "withdrawJudgeStake",
      "discriminator": [
        253,
        149,
        101,
        22,
        71,
        241,
        22,
        160
      ],
      "accounts": [
        {
          "name": "judge",
          "writable": true
        },
        {
          "name": "judgeAuthority",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "globalState",
      "discriminator": [
        163,
        46,
        74,
        168,
        216,
        123,
        133,
        98
      ]
    },
    {
      "name": "goal",
      "discriminator": [
        163,
        66,
        166,
        245,
        130,
        131,
        207,
        26
      ]
    },
    {
      "name": "judge",
      "discriminator": [
        82,
        70,
        2,
        172,
        95,
        22,
        168,
        16
      ]
    },
    {
      "name": "voteRecord",
      "discriminator": [
        112,
        9,
        123,
        165,
        234,
        9,
        157,
        167
      ]
    }
  ],
  "events": [
    {
      "name": "goalCreated",
      "discriminator": [
        40,
        74,
        205,
        224,
        20,
        51,
        92,
        239
      ]
    },
    {
      "name": "goalFinalized",
      "discriminator": [
        231,
        159,
        206,
        104,
        8,
        126,
        155,
        228
      ]
    },
    {
      "name": "judgeRegistered",
      "discriminator": [
        169,
        184,
        119,
        138,
        132,
        167,
        185,
        161
      ]
    },
    {
      "name": "proofSubmitted",
      "discriminator": [
        160,
        51,
        85,
        70,
        249,
        89,
        5,
        139
      ]
    },
    {
      "name": "voteCast",
      "discriminator": [
        39,
        53,
        195,
        104,
        188,
        17,
        225,
        213
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "insufficientStake",
      "msg": "Insufficient stake amount"
    },
    {
      "code": 6001,
      "name": "invalidDeadline",
      "msg": "Invalid Deadline"
    },
    {
      "code": 6002,
      "name": "descriptionTooLong",
      "msg": "Description too long"
    },
    {
      "code": 6003,
      "name": "unauthorized",
      "msg": "unauthorized"
    },
    {
      "code": 6004,
      "name": "invalidGoalStatus",
      "msg": "Invalid goal status"
    },
    {
      "code": 6005,
      "name": "deadlinePassed",
      "msg": "Deadline has passed"
    },
    {
      "code": 6006,
      "name": "proofTooLong",
      "msg": "Proof data too long"
    },
    {
      "code": 6007,
      "name": "judgeNotActive",
      "msg": "Judge not active"
    },
    {
      "code": 6008,
      "name": "votingDeadlinePassed",
      "msg": "Voting deadline has passed"
    },
    {
      "code": 6009,
      "name": "votingStillActive",
      "msg": "Voting is still active"
    },
    {
      "code": 6010,
      "name": "goalNotFinalized",
      "msg": "Goal not finalized"
    }
  ],
  "types": [
    {
      "name": "globalState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "totalGoals",
            "type": "u64"
          },
          {
            "name": "totalJudges",
            "type": "u64"
          },
          {
            "name": "minJudgeStakes",
            "type": "u64"
          },
          {
            "name": "judgeRewardRate",
            "type": "u16"
          },
          {
            "name": "rewardPool",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "goal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "goalId",
            "type": "u64"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "stakeAmount",
            "type": "u64"
          },
          {
            "name": "deadline",
            "type": "i64"
          },
          {
            "name": "votingDeadline",
            "type": "i64"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "goalStatus"
              }
            }
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "finalizedAt",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "proofData",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "proofType",
            "type": {
              "option": {
                "defined": {
                  "name": "proofType"
                }
              }
            }
          },
          {
            "name": "proofSubmittedAt",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "totalVotes",
            "type": "u64"
          },
          {
            "name": "yesVotes",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "goalCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "goalId",
            "type": "u64"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "stakeAmount",
            "type": "u64"
          },
          {
            "name": "deadline",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "goalFinalized",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "goalId",
            "type": "u64"
          },
          {
            "name": "successful",
            "type": "bool"
          },
          {
            "name": "finalVotes",
            "type": "u64"
          },
          {
            "name": "yesVotes",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "goalStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "active"
          },
          {
            "name": "pendingVerification"
          },
          {
            "name": "completed"
          },
          {
            "name": "failed"
          },
          {
            "name": "cancelled"
          }
        ]
      }
    },
    {
      "name": "judge",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "judge",
            "type": "pubkey"
          },
          {
            "name": "stakeAmount",
            "type": "u64"
          },
          {
            "name": "reputationScore",
            "type": "u32"
          },
          {
            "name": "totalVotes",
            "type": "u32"
          },
          {
            "name": "correctVotes",
            "type": "u32"
          },
          {
            "name": "registeredAt",
            "type": "i64"
          },
          {
            "name": "isActive",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "judgeRegistered",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "judge",
            "type": "pubkey"
          },
          {
            "name": "stakeAmount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "proofSubmitted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "goalId",
            "type": "u64"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "proofType",
            "type": {
              "defined": {
                "name": "proofType"
              }
            }
          }
        ]
      }
    },
    {
      "name": "proofType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "image"
          },
          {
            "name": "document"
          },
          {
            "name": "link"
          },
          {
            "name": "text"
          },
          {
            "name": "video"
          }
        ]
      }
    },
    {
      "name": "voteCast",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "goalId",
            "type": "u64"
          },
          {
            "name": "judge",
            "type": "pubkey"
          },
          {
            "name": "vote",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "voteRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "goalId",
            "type": "u64"
          },
          {
            "name": "judge",
            "type": "pubkey"
          },
          {
            "name": "vote",
            "type": "bool"
          },
          {
            "name": "votedAt",
            "type": "i64"
          }
        ]
      }
    }
  ]
};
