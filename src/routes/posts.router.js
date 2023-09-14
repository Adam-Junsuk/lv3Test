import express from 'express';
import { prisma } from '../utils/prisma/index.js';

const router = express.Router(); // express.Router()를 이용해 라우터를 생성합니다.

const createNewPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const newPost = await prisma.post.create({
      data: {
        title,
        content,
      },
    });
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany();
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, content } = req.body;
    const updatedPost = await prisma.post.update({
      where: { id: parseInt(postId, 10) },
      data: {
        title,
        content,
      },
    });
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const deletePostById = async (req, res) => {
  try {
    const { postId } = req.params;
    await prisma.post.delete({
      where: { id: parseInt(postId, 10) },
    });
    res.status(200).json({ message: 'success' });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

router.post('/', createNewPost);
router.get('/', getAllPosts);
router.put('/:postId', updatePost);
router.delete('/:postId', deletePostById);

export default router;
