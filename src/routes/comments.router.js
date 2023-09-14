//comments.routner.js
import express from 'express';
import verifyToken from '../middlewares/auth.middleware.js';
import { prisma } from '../utils/prisma/index.js';



/** 댓글 작성 API **/
router.post('/:postId/comments', verifyToken, async (req, res) => {
  try {
    const postId = Number(req.params.postId);
    const userId = req.user.userId;
    const { content } = req.body;

    const postExist = await prisma.Posts.findUnique({
      where: {
        postId: postId,
      },
    });

    if (!postExist) {
      return res.status(404).json({ message: '게시글이 없어요~' });
    }

    if (!content) {
      return res.status(412).json({ message: '바꿀 내용을 입력해 주세요' });
    }

    await prisma.Comments.create({
      data: {
        PostId: postId,
        UserId: userId,
        content: content,
      },
    });

    res.status(201).json({ message: '댓글을 작성하였습니다' });
  } catch (error) {
    console.log(error.stack);
    res.status(400).json({ message: '댓글 작성에 실패했어요~' });
  }
});

//댓글목록 조회
router.get('/:postId/comments', async (req, res) => {
  const { postId } = req.params;

  try {
    // 게시글이 존재하는지 확인
    const postExists = await prisma.Posts.findUnique({
      where: { postId: Number(postId) },
    });

    if (!postExists) {
      return res
        .status(404)
        .json({ errorMessage: '게시글이 존재하지 않습니다.' });
    }

    // 댓글과 작성자의 닉네임을 함께 가져옴
    const comments = await prisma.Comments.findMany({
      where: { PostId: Number(postId) },
      orderBy: { createdAt: 'desc' },
      include: {
        User: {
          select: { nickname: true },
        },
      },
    });

    const formattedComments = comments.map((comment) => {
      return {
        commentId: comment.commentId,
        userId: comment.UserId,
        nickname: comment.User.nickname,
        comment: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      };
    });

    res.status(200).json({ comments: formattedComments });
  } catch (error) {
    res.status(400).json({ errorMessage: '댓글 조회에 실패하였습니다.' });
  }
});

//댓글 수정
router.put('/:postId/comments/:commentId', verifyToken, async (req, res) => {
  const { postId, commentId } = req.params;
  const { content } = req.body;

  try {
    if (!content) {
      return res
        .status(412)
        .json({ errorMessage: '데이터 형식이 올바르지 않습니다.' });
    }

    const postExists = await prisma.Posts.findUnique({
      where: { postId: Number(postId) },
    });

    if (!postExists) {
      return res
        .status(404)
        .json({ errorMessage: '게시글이 존재하지 않습니다.' });
    }

    const targetComment = await prisma.Comments.findUnique({
      where: { commentId: Number(commentId) },
    });

    if (!targetComment) {
      return res
        .status(404)
        .json({ errorMessage: '댓글이 존재하지 않습니다.' });
    }

    if (targetComment.UserId !== req.user.userId) {
      return res
        .status(403)
        .json({ errorMessage: '댓글의 수정 권한이 존재하지 않습니다.' });
    }

    await prisma.Comments.update({
      where: { commentId: Number(commentId) },
      data: { content: content },
    });

    res.status(200).json({ message: '댓글을 수정하였습니다.' });
  } catch (error) {
    console.log(error.stack);
    res.status(400).json({ errorMessage: '댓글 수정에 실패하였습니다.' });
  }
});
// 댓글 삭제

router.delete('/:postId/comments/:commentId', verifyToken, async (req, res) => {
  const { postId, commentId } = req.params;
  const userId = req.user.userId;

  try {
    // 게시글이 존재하는지 확인
    const postExists = await prisma.Posts.findUnique({
      where: { postId: Number(postId) },
    });

    if (!postExists) {
      return res
        .status(404)
        .json({ errorMessage: '게시글이 존재하지 않습니다.' });
    }

    // 댓글이 존재하는지 확인
    const targetComment = await prisma.Comments.findUnique({
      where: { commentId: Number(commentId) },
    });

    if (!targetComment) {
      return res
        .status(404)
        .json({ errorMessage: '댓글이 존재하지 않습니다.' });
    }

    // 댓글의 작성자와 현재 사용자가 동일한지 확인
    if (targetComment.UserId !== userId) {
      return res
        .status(403)
        .json({ errorMessage: '댓글의 삭제 권한이 존재하지 않습니다.' });
    }

    // 댓글 삭제
    await prisma.Comments.delete({
      where: { commentId: Number(commentId) },
    });

    res.status(200).json({ message: '댓글을 삭제하였습니다.' });
  } catch (error) {
    console.error(error.stack);

    if (error instanceof prisma.PrismaClientKnownRequestError) {
      // 예외 케이스에서 처리하지 못한 에러
      res
        .status(400)
        .json({ errorMessage: '댓글 삭제가 정상적으로 처리되지 않았습니다.' });
    } else {
      // 그 외의 에러
      res.status(400).json({ errorMessage: '댓글 삭제에 실패하였습니다.' });
    }
  }
});

export default router;
