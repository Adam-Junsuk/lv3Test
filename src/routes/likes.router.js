

import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();
// 좋아요 게시글 조회
router.get('/likes', authMiddleware, async (req, res, next) => {
  //2레벨의 객체를 1레벨로 바꿔주는 마아법~
  const parseLikePostsModel = (posts) => {
    return posts.map((post) => {
      let obj = {};

      // 첫 번째 레벨의 키-값을 대상 객체에 복사합니다.
      Object.entries(post).forEach(([key, value]) => {
        // 값이 객체이거나, 날씨 타입 (날씨타입도 객체로 취급하기 때문에)
        if (typeof value === 'object' && !(value instanceof Date)) {
          //두번째 레벨의 키-값도 대상 객체(obj)에 복사합니다
          Object.entries(value).forEach(([subKey, subValue]) => {
            obj[subKey] = subValue;
          });
        } else {
          obj[key] = value;
        }
      });
      return obj;
    });
  };
  try {
    const userId = req.user.userId;
    const posts = await prisma.Posts.findMany({
      where: {
        Likes: {
          some: {
            UserId: +userId,
          },
        },
      },
      select: {
        postId: true,
        UserId: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        User: {
          select: {
            nickname: true,
          },
        },
        _count: {
          select: {
            Likes: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const parseLikePosts = parseLikePostsModel(posts);

    return res.status(200).json({
      data: parseLikePosts,
    });
  } catch (err) {
    console.log(err.stack);
    next(err);
  }
});

// 좋아요 업데이트
router.put('/:postId/like', authMiddleware, async (req, res, next) => {
  try {
    const { postId } = req.params;
    console.log(req.user.userId);
    const userId = req.user.userId;
    console.log(postId);
    console.log(userId);
    const existPost = await prisma.posts.findUnique({
      where: { postId: Number(postId) },
    });
    if (!existPost) {
      return res.status(404).json({
        errorMessage: '게시글이 없단 말이야~',
      });
    }

    let isLike = await prisma.likes.findFirst({
      where: {
        PostId: Number(postId),
        UserId: userId,
      },
    });
    if (!isLike) {
      await prisma.likes.create({
        data: {
          PostId: Number(postId),
          UserId: userId,
        },
      });
      return res.status(200).json({ message: '게시글 좋아요 눌러져쓰~' });
    } else {
      await prisma.likes.delete({
        where: { likeId: Number(isLike.likeId) },
      });
    }
    return res.status(200).json({ message: '좋아요를 왜 취소해?' });
  } catch (err) {
    console.log(err.stack);
    next(err);
  }
});

export default router;
