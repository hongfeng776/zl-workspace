import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  nickname: string;
  avatar: string;
  createdAt: string;
}

export interface Room {
  id: string;
  name: string;
  hostId: string;
  player1Id: string | null;
  player2Id: string | null;
  status: 'waiting' | 'ready' | 'playing' | 'finished';
  currentSongId: string | null;
  createdAt: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  duration: number;
  coverUrl: string;
  lyrics: LyricLine[];
  audioUrl: string;
}

export interface LyricLine {
  time: number;
  text: string;
  pitch: number;
}

export interface Battle {
  id: string;
  roomId: string;
  songId: string;
  player1Id: string;
  player2Id: string;
  player1AudioUrl: string | null;
  player2AudioUrl: string | null;
  winnerId: string | null;
  createdAt: string;
}

export interface Score {
  id: string;
  battleId: string;
  playerId: string;
  total: number;
  pitch: number;
  rhythm: number;
  energy: number;
  lyrics: number;
}

interface Data {
  users: User[];
  rooms: Room[];
  songs: Song[];
  battles: Battle[];
  scores: Score[];
}

const defaultData: Data = {
  users: [],
  rooms: [],
  songs: [
    {
      id: 'song1',
      title: '小幸运',
      artist: '田馥甄',
      duration: 240,
      coverUrl: '/covers/xiaoxingyun.jpg',
      audioUrl: '',
      lyrics: [
        { time: 0, text: '我听见雨滴落在青青草地', pitch: 60 },
        { time: 5, text: '我听见远方下课钟声响起', pitch: 58 },
        { time: 10, text: '可是我没有听见你的声音', pitch: 62 },
        { time: 15, text: '认真呼唤我姓名', pitch: 55 },
        { time: 20, text: '爱上你的时候还不懂感情', pitch: 57 },
        { time: 25, text: '离别了才觉得刻骨铭心', pitch: 61 },
        { time: 30, text: '为什么没有发现遇见了你', pitch: 59 },
        { time: 35, text: '是生命最好的事情', pitch: 56 },
        { time: 40, text: '也许当时忙着微笑和哭泣', pitch: 58 },
        { time: 45, text: '忙着追逐天空中的流星', pitch: 60 },
      ]
    },
    {
      id: 'song2',
      title: '告白气球',
      artist: '周杰伦',
      duration: 215,
      coverUrl: '/covers/gaobaiqiqiu.jpg',
      audioUrl: '',
      lyrics: [
        { time: 0, text: '塞纳河畔左岸的咖啡', pitch: 55 },
        { time: 4, text: '我手一杯品尝你的美', pitch: 57 },
        { time: 8, text: '留下唇印的嘴', pitch: 53 },
        { time: 12, text: '花店玫瑰名字写错谁', pitch: 56 },
        { time: 16, text: '告白气球风吹到对街', pitch: 58 },
        { time: 20, text: '微笑在天上飞', pitch: 54 },
        { time: 24, text: '你说你有点难追', pitch: 55 },
        { time: 28, text: '想让我知难而退', pitch: 57 },
        { time: 32, text: '礼物不需挑最贵', pitch: 56 },
        { time: 36, text: '只要香榭的落叶', pitch: 58 },
      ]
    },
    {
      id: 'song3',
      title: '稻香',
      artist: '周杰伦',
      duration: 223,
      coverUrl: '/covers/daoxiang.jpg',
      audioUrl: '',
      lyrics: [
        { time: 0, text: '对这个世界如果你有太多的抱怨', pitch: 50 },
        { time: 5, text: '跌倒了就不敢继续往前走', pitch: 52 },
        { time: 10, text: '为什么人要这么的脆弱堕落', pitch: 48 },
        { time: 15, text: '请你打开电视看看', pitch: 51 },
        { time: 20, text: '多少人为生命在努力勇敢的走下去', pitch: 53 },
        { time: 25, text: '我们是不是该知足', pitch: 49 },
        { time: 30, text: '珍惜一切就算没有拥有', pitch: 50 },
        { time: 35, text: '还记得你说家是唯一的城堡', pitch: 52 },
        { time: 40, text: '随着稻香河流继续奔跑', pitch: 54 },
        { time: 45, text: '微微笑小时候的梦我知道', pitch: 51 },
      ]
    },
    {
      id: 'song4',
      title: '晴天',
      artist: '周杰伦',
      duration: 269,
      coverUrl: '/covers/qingtian.jpg',
      audioUrl: '',
      lyrics: [
        { time: 0, text: '故事的小黄花', pitch: 58 },
        { time: 4, text: '从出生那年就飘着', pitch: 60 },
        { time: 8, text: '童年的荡秋千', pitch: 56 },
        { time: 12, text: '随记忆一直晃到现在', pitch: 59 },
        { time: 16, text: 'Re So So Si Do Si La', pitch: 57 },
        { time: 20, text: 'So La Si Si Si Si La Si La So', pitch: 61 },
        { time: 24, text: '吹着前奏望着天空', pitch: 58 },
        { time: 28, text: '我想起花瓣试着掉落', pitch: 60 },
        { time: 32, text: '为你翘课的那一天', pitch: 56 },
        { time: 36, text: '花落的那一天', pitch: 59 },
      ]
    },
    {
      id: 'song5',
      title: '光年之外',
      artist: '邓紫棋',
      duration: 235,
      coverUrl: '/covers/guangnianzhiwai.jpg',
      audioUrl: '',
      lyrics: [
        { time: 0, text: '感受停在我发端的指尖', pitch: 62 },
        { time: 5, text: '如何瞬间冻结时间', pitch: 64 },
        { time: 10, text: '记住望着我坚定的双眼', pitch: 61 },
        { time: 15, text: '也许已经没有明天', pitch: 63 },
        { time: 20, text: '面对浩瀚的星海', pitch: 60 },
        { time: 25, text: '我们微小得像尘埃', pitch: 65 },
        { time: 30, text: '漂浮在一片无奈', pitch: 62 },
        { time: 35, text: '缘分让我们相遇乱世以外', pitch: 64 },
        { time: 40, text: '命运却要我们危难中相爱', pitch: 61 },
        { time: 45, text: '也许未来遥远在光年之外', pitch: 63 },
      ]
    }
  ],
  battles: [],
  scores: []
};

const file = path.join(__dirname, 'db.json');
const adapter = new JSONFile<Data>(file);
const db = new Low<Data>(adapter, defaultData);

await db.read();
await db.write();

export { db, uuidv4 };
