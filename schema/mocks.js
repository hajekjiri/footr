const recordsResultMock = {
  edges: [
    {
      cursor: '1',
      node: {
        day: '2020-06-18',
        dishes: {
          edges: [
            {
              cursor: '1',
              node: {
                databaseId: 'fried_cheese_id',
                name: 'Fried cheese',
                records: {
                  edges: [
                    {
                      cursor: '1',
                      node: { day: '2020-06-18' }
                    },
                    {
                      cursor: '2',
                      node: { day: '2020-06-19' }
                    }
                  ],
                  totalCount: 2,
                  pageInfo: {
                    startCursor: '1',
                    endCursor: '2',
                    hasPreviousPage: false,
                    hasNextPage: false
                  }
                }
              }
            },
            {
              cursor: '2',
              node: {
                databaseId: 'spaghetti_id',
                name: 'Spaghetti',
                records: {
                  edges: [
                    {
                      cursor: '1',
                      node: { day: '2020-06-18' }
                    }
                  ],
                  totalCount: 1,
                  pageInfo: {
                    startCursor: '1',
                    endCursor: '1',
                    hasPreviousPage: false,
                    hasNextPage: false
                  }
                }
              }
            }
          ],
          totalCount: 2,
          pageInfo: {
            startCursor: '1',
            endCursor: '2',
            hasPreviousPage: false,
            hasNextPage: false
          }
        }
      }
    },
    {
      cursor: '2',
      node: {
        day: '2020-06-19',
        dishes: {
          edges: [
            {
              cursor: '1',
              node: {
                databaseId: 'fried_cheese_id',
                name: 'Fried cheese',
                records: {
                  edges: [
                    {
                      cursor: '1',
                      node: { day: '2020-06-18' }
                    },
                    {
                      cursor: '2',
                      node: { day: '2020-06-19' }
                    }
                  ],
                  totalCount: 2,
                  pageInfo: {
                    startCursor: '1',
                    endCursor: '2',
                    hasPreviousPage: false,
                    hasNextPage: false
                  }
                }
              }
            },
            {
              cursor: '2',
              node: {
                databaseId: 'chocolate_id',
                name: 'Chocolate',
                records: {
                  edges: [
                    {
                      cursor: '1',
                      node: { day: '2020-06-19' }
                    }
                  ],
                  totalCount: 1,
                  pageInfo: {
                    startCursor: '1',
                    endCursor: '1',
                    hasPreviousPage: false,
                    hasNextPage: false
                  }
                }
              }
            }
          ],
          totalCount: 2,
          pageInfo: {
            startCursor: '1',
            endCursor: '2',
            hasPreviousPage: false,
            hasNextPage: false
          }
        }
      }
    },
    {
      cursor: '3',
      node: {
        day: '2020-06-20',
        dishes: {
          edges: [
            {
              cursor: '1',
              node: {
                databaseId: 'quesadilla_id',
                name: 'Quesadilla',
                records: {
                  edges: [
                    {
                      cursor: '1',
                      node: { day: '2020-06-20' }
                    }
                  ],
                  totalCount: 1,
                  pageInfo: {
                    startCursor: '1',
                    endCursor: '1',
                    hasPreviousPage: false,
                    hasNextPage: false
                  }
                }
              }
            },
            {
              cursor: '2',
              node: {
                databaseId: 'pizza_id',
                name: 'Pizza',
                records: {
                  edges: [
                    {
                      cursor: '1',
                      node: { day: '2020-06-20' }
                    }
                  ],
                  totalCount: 1,
                  pageInfo: {
                    startCursor: '1',
                    endCursor: '1',
                    hasPreviousPage: false,
                    hasNextPage: false
                  }
                }
              }
            }
          ],
          totalCount: 2,
          pageInfo: {
            startCursor: '1',
            endCursor: '2',
            hasPreviousPage: false,
            hasNextPage: false
          }
        }
      }
    }
  ],
  totalCount: 3,
  pageInfo: {
    startCursor: '1',
    endCursor: '3',
    hasPreviousPage: false,
    hasNextPage: false
  }
}

const dishesResultMock = {
  edges: [
    {
      cursor: '1',
      node: {
        databaseId: 'fried_cheese_id',
        name: 'Fried cheese',
        records: {
          edges: [
            {
              cursor: '1',
              node: { day: '2020-06-18' }
            },
            {
              cursor: '2',
              node: { day: '2020-06-19' }
            }
          ],
          totalCount: 2,
          pageInfo: {
            startCursor: '1',
            endCursor: '2',
            hasPreviousPage: false,
            hasNextPage: false
          }
        }
      }
    },
    {
      cursor: '2',
      node: {
        databaseId: 'spaghetti_id',
        name: 'Spaghetti',
        records: {
          edges: [
            {
              cursor: '1',
              node: { day: '2020-06-18' }
            }
          ],
          totalCount: 1,
          pageInfo: {
            startCursor: '1',
            endCursor: '1',
            hasPreviousPage: false,
            hasNextPage: false
          }
        }
      }
    },
    {
      cursor: '3',
      node: {
        databaseId: 'chocolate_id',
        name: 'Chocolate',
        records: {
          edges: [
            {
              cursor: '1',
              node: { day: '2020-06-19' }
            }
          ],
          totalCount: 1,
          pageInfo: {
            startCursor: '1',
            endCursor: '1',
            hasPreviousPage: false,
            hasNextPage: false
          }
        }
      }
    },
    {
      cursor: '4',
      node: {
        databaseId: 'quesadilla_id',
        name: 'Quesadilla',
        records: {
          edges: [
            {
              cursor: '1',
              node: { day: '2020-06-20' }
            }
          ],
          totalCount: 1,
          pageInfo: {
            startCursor: '1',
            endCursor: '1',
            hasPreviousPage: false,
            hasNextPage: false
          }
        }
      }
    },
    {
      cursor: '5',
      node: {
        databaseId: 'pizza_id',
        name: 'Pizza',
        records: {
          edges: [
            {
              cursor: '1',
              node: { day: '2020-06-20' }
            }
          ],
          totalCount: 1,
          pageInfo: {
            startCursor: '1',
            endCursor: '1',
            hasPreviousPage: false,
            hasNextPage: false
          }
        }
      }
    }
  ],
  totalCount: 5,
  pageInfo: {
    startCursor: '1',
    endCursor: '5',
    hasPreviousPage: false,
    hasNextPage: false
  }
}

const dishResultMock = {
  fried_cheese_id: {
    databaseId: 'fried_cheese_id',
    name: 'Fried cheese',
    records: {
      edges: [
        {
          cursor: '1',
          node: { day: '2020-06-18' }
        },
        {
          cursor: '2',
          node: { day: '2020-06-19' }
        }
      ],
      totalCount: 2,
      pageInfo: {
        startCursor: '1',
        endCursor: '2',
        hasPreviousPage: false,
        hasNextPage: false
      }
    }
  },
  spaghetti_id: {
    databaseId: 'spaghetti_id',
    name: 'Spaghetti',
    records: {
      edges: [
        {
          cursor: '1',
          node: { day: '2020-06-18' }
        }
      ],
      totalCount: 1,
      pageInfo: {
        startCursor: '1',
        endCursor: '1',
        hasPreviousPage: false,
        hasNextPage: false
      }
    }
  },
  chocolate_id: {
    databaseId: 'chocolate_id',
    name: 'Chocolate',
    records: {
      edges: [
        {
          cursor: '1',
          node: { day: '2020-06-19' }
        }
      ],
      totalCount: 1,
      pageInfo: {
        startCursor: '1',
        endCursor: '1',
        hasPreviousPage: false,
        hasNextPage: false
      }
    }
  },
  quesadilla_id: {
    databaseId: 'quesadilla_id',
    name: 'Quesadilla',
    records: {
      edges: [
        {
          cursor: '1',
          node: { day: '2020-06-20' }
        }
      ],
      totalCount: 1,
      pageInfo: {
        startCursor: '1',
        endCursor: '1',
        hasPreviousPage: false,
        hasNextPage: false
      }
    }
  },
  pizza_id: {
    databaseId: 'pizza_id',
    name: 'Pizza',
    records: {
      edges: [
        {
          cursor: '1',
          node: { day: '2020-06-20' }
        }
      ],
      totalCount: 1,
      pageInfo: {
        startCursor: '1',
        endCursor: '1',
        hasPreviousPage: false,
        hasNextPage: false
      }
    }
  }
}

module.exports = {
  recordsResultMock,
  dishesResultMock,
  dishResultMock
}
