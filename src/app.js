//src/app.js
import express from 'express';
import PostsRouter from './routes/posts.router.js';

import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;
const router = express.Router();

app.use(express.json());
// JSON을 파싱하기 위한 미들웨어 설정

//User.router.js를 생성하고, 이 라우터를 바탕으로 실제 전역 미들웨어에 등록했다.

app.use('/api/posts', [PostsRouter]);

// router 인스턴스를 /api 하위 경로로 등록

// 서버 시작
app.listen(PORT, () => {
  console.log(`${PORT} 포트로 서버가 열렸어요!`);
});
