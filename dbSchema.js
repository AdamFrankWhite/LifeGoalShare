let db = {
  lifegoals: [
    {
      followers: ["Carrot9"],
      comments: [],
      _id: "5e7b85ebb347ab3f48375668",
      lifeGoalName: "want to have no debt",
      lifeGoalDescription: "I want to be have no money",
      createdBy: "WeCanHope123",
      createdAt: "2020-03-25T16:25:15.360Z",
      updatedAt: "2020-03-25T16:25:15.360Z",
      __v: 0,
    },
  ],

  posts: [
    {
      postID: new ObjectId(),
      postName: initialPostData.postName,
      postContent: initialPostData.postContent,
      createdBy: createdBy,
      postHeaderImage: "PLACEHOLDER_HEADER_IMG",
    },
  ],

  users: [
    {
      ownLifeGoals: [],
      lifeGoalsFollowed: [],
      myComments: [],
      _id: "5e957edf399b192e705083b1",
      username: "parsnip",
      password: "$2b$10$CsqnVd8RvF2lhKQ0plq4l.mSpAnbvw3jp2q.Djj8Hy8EYn5IflEuu",
      email: "parsnip@thing.com",
      profile: {
        handle: "parsnip",
        profileUrl: "PLACEHOLDER/parsnip",
        profileImageUrl: "PLACEHOLDER_IMAGE_URL",
        location: "",
        bio: "",
        lifeGoalCategories: [],
      },
      createdAt: "2020-04-14T09:14:07.435Z",
      updatedAt: "2020-04-14T09:14:07.435Z",
      __v: 0,
    },
  ],
};
